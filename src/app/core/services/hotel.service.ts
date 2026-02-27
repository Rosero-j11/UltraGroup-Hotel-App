import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError, of, delay } from 'rxjs';
import { Hotel, CreateHotelDto, UpdateHotelDto, HotelStatus } from '../models';
import { v4 as uuidv4 } from 'uuid';

@Injectable({ providedIn: 'root' })
export class HotelService {
  private readonly http = inject(HttpClient);
  private readonly dataUrl = 'assets/data/hotels.json';

  constructor() {
    // Carga automática al iniciar para que los datos estén disponibles de inmediato
    this.loadHotels().subscribe();
  }

  // --- State with Angular Signals ---
  private readonly _hotels = signal<Hotel[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  readonly hotels = this._hotels.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly activeHotels = computed(() =>
    this._hotels().filter(h => h.status === 'active')
  );

  readonly hotelCount = computed(() => this._hotels().length);

  loadHotels(): Observable<Hotel[]> {
    this._loading.set(true);
    this._error.set(null);
    return this.http.get<Hotel[]>(this.dataUrl).pipe(
      delay(400),
      tap(hotels => {
        this._hotels.set(hotels);
        this._loading.set(false);
      }),
      catchError(err => {
        this._error.set('Error al cargar los hoteles. Intente nuevamente.');
        this._loading.set(false);
        return throwError(() => err);
      })
    );
  }

  getHotelById(id: string): Hotel | undefined {
    return this._hotels().find(h => h.id === id);
  }

  getHotelsByCity(city: string): Hotel[] {
    return this._hotels().filter(
      h => h.city.toLowerCase() === city.toLowerCase() && h.status === 'active'
    );
  }

  createHotel(dto: CreateHotelDto): Observable<Hotel> {
    this._loading.set(true);
    const newHotel: Hotel = {
      ...dto,
      id: `hotel-${uuidv4().slice(0, 8)}`,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return of(newHotel).pipe(
      delay(500),
      tap(hotel => {
        this._hotels.update(hotels => [...hotels, hotel]);
        this._loading.set(false);
      }),
      catchError(err => {
        this._loading.set(false);
        return throwError(() => err);
      })
    );
  }

  updateHotel(dto: UpdateHotelDto): Observable<Hotel> {
    this._loading.set(true);
    const existing = this._hotels().find(h => h.id === dto.id);
    if (!existing) {
      this._loading.set(false);
      return throwError(() => new Error('Hotel no encontrado'));
    }
    const updated: Hotel = {
      ...existing,
      ...dto,
      updatedAt: new Date().toISOString(),
    };
    return of(updated).pipe(
      delay(500),
      tap(hotel => {
        this._hotels.update(hotels =>
          hotels.map(h => (h.id === hotel.id ? hotel : h))
        );
        this._loading.set(false);
      }),
      catchError(err => {
        this._loading.set(false);
        return throwError(() => err);
      })
    );
  }

  toggleHotelStatus(id: string): Observable<Hotel> {
    const hotel = this._hotels().find(h => h.id === id);
    if (!hotel) return throwError(() => new Error('Hotel no encontrado'));
    const newStatus: HotelStatus = hotel.status === 'active' ? 'inactive' : 'active';
    return this.updateHotel({ id, status: newStatus });
  }

  getAvailableCities(): string[] {
    const cities = this._hotels()
      .filter(h => h.status === 'active')
      .map(h => h.city);
    return [...new Set(cities)].sort();
  }
}
