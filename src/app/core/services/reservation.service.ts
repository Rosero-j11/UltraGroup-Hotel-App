import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError, of, delay } from 'rxjs';
import { Reservation, CreateReservationDto } from '../models';
import { v4 as uuidv4 } from 'uuid';

/**
 * Servicio para gestión del ciclo de vida de reservas.
 *
 * Además del patrón común (Signals + localStorage cache-first),
 * este servicio incluye:
 *
 * - `_lastCreated` signal: guarda la última reserva creada para que
 *   `BookingConfirmationComponent` la muestre sin depender de la URL.
 * - `calculateNights()`: lógica pura que calcula noches entre dos fechas ISO.
 * - `createReservation()`: construye el costo total `(baseCost + taxes) * nights`
 *   antes de persistir.
 *
 * ## Estrategia de merge en `loadReservations`
 * Cuando el JSON de assets se carga, se fusiona con las reservas ya en memoria
 * (creadas en la sesión actual) para no sobreescribir datos locales nuevos.
 */
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

  /** @see HotelService#persist */
  private persist(): void {
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

  /**
   * Crea una nueva reserva calculando el costo total dinámicamente.
   * Formula: `totalCost = (baseCost + taxes) * nights`
   * - `baseCost` y `taxes` se obtienen de la habitación seleccionada.
   * - `nights` se calcula con `calculateNights(checkIn, checkOut)`.
   *
   * La reserva se crea siempre con estado `confirmed` (no hay flujo de aprobación).
   *
   * @param dto Datos del formulario de booking incluyendo huésped y contacto de emergencia.
   * @returns Observable con la reserva creada y persistida.
   */
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

  /**
   * Cancela una reserva cambiando su estado a `cancelled`.
   * No elimina el registro del sistema (auditabilidad de reservas canceladas).
   */
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

  /**
   * Calcula el número de noches entre dos fechas ISO.
   * Garantiza mínimo 1 noche con `Math.max(1, ...)` para evitar costos negativos
   * cuando las fechas son iguales o el orden es incorrecto.
   *
   * @param checkIn  Fecha de entrada (string ISO).
   * @param checkOut Fecha de salida (string ISO).
   * @returns Número de noches (mínimo 1).
   */
  private calculateNights(checkIn: string, checkOut: string): number {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = end.getTime() - start.getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  /**
   * Limpia el signal `_lastCreated` una vez que la pantalla de confirmación
   * ha leído y mostrado la reserva.
   */
  clearLastCreated(): void {
    this._lastCreated.set(null);
  }
}

