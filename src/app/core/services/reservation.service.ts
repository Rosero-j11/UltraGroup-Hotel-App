import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError, of, delay } from 'rxjs';
import { Reservation, CreateReservationDto } from '../models';
import { v4 as uuidv4 } from 'uuid';

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private readonly http = inject(HttpClient);
  private readonly dataUrl = 'assets/data/reservations.json';
  private readonly STORAGE_KEY = 'ug_reservations';

  private readonly _reservations = signal<Reservation[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly _lastCreated = signal<Reservation | null>(null);

  readonly reservations = this._reservations.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly lastCreated = this._lastCreated.asReadonly();

  readonly confirmedReservations = computed(() =>
    this._reservations().filter(r => r.status === 'confirmed')
  );

  private persist(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this._reservations()));
    } catch (e) {
      console.warn('[ReservationService] No se pudo persistir en localStorage:', e);
    }
  }

  loadReservations(): Observable<Reservation[]> {
    const cached = localStorage.getItem(this.STORAGE_KEY);
    if (cached) {
      try {
        const reservations = JSON.parse(cached) as Reservation[];
        this._reservations.set(reservations);
        this._loading.set(false);
        return of(reservations);
      } catch {
        localStorage.removeItem(this.STORAGE_KEY);
      }
    }
    this._loading.set(true);
    this._error.set(null);
    return this.http.get<Reservation[]>(this.dataUrl).pipe(
      delay(400),
      tap(reservations => {
        const jsonIds = new Set(reservations.map(r => r.id));
        const inMemoryOnly = this._reservations().filter(r => !jsonIds.has(r.id));
        this._reservations.set([...reservations, ...inMemoryOnly]);
        this.persist();
        this._loading.set(false);
      }),
      catchError(err => {
        this._error.set('Error al cargar las reservas.');
        this._loading.set(false);
        return throwError(() => err);
      })
    );
  }

  getReservationsByHotel(hotelId: string): Reservation[] {
    return this._reservations().filter(r => r.hotelId === hotelId);
  }

  getReservationById(id: string): Reservation | undefined {
    return this._reservations().find(r => r.id === id);
  }

  createReservation(dto: CreateReservationDto): Observable<Reservation> {
    this._loading.set(true);
    const nights = this.calculateNights(dto.checkIn, dto.checkOut);
    const totalCost = (dto.baseCost + dto.taxes) * nights;

    const newReservation: Reservation = {
      ...dto,
      id: `res-${uuidv4().slice(0, 8)}`,
      totalCost,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    return of(newReservation).pipe(
      delay(800),
      tap(reservation => {
        this._reservations.update(reservations => [...reservations, reservation]);
        this._lastCreated.set(reservation);
        this.persist();
        this._loading.set(false);
      }),
      catchError(err => {
        this._loading.set(false);
        return throwError(() => err);
      })
    );
  }

  cancelReservation(id: string): Observable<Reservation> {
    const reservation = this._reservations().find(r => r.id === id);
    if (!reservation) return throwError(() => new Error('Reserva no encontrada'));

    const updated: Reservation = { ...reservation, status: 'cancelled' };
    return of(updated).pipe(
      delay(500),
      tap(res => {
        this._reservations.update(reservations =>
          reservations.map(r => (r.id === res.id ? res : r))
        );
        this.persist();
        this._loading.set(false);
      })
    );
  }

  private calculateNights(checkIn: string, checkOut: string): number {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = end.getTime() - start.getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  clearLastCreated(): void {
    this._lastCreated.set(null);
  }
}

