import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError, of, delay } from 'rxjs';
import { Room, CreateRoomDto, UpdateRoomDto, RoomStatus } from '../models';
import { v4 as uuidv4 } from 'uuid';

@Injectable({ providedIn: 'root' })
export class RoomService {
  private readonly http = inject(HttpClient);
  private readonly dataUrl = 'assets/data/rooms.json';
  private readonly STORAGE_KEY = 'ug_rooms';

  constructor() {
    this.loadRooms().subscribe();
  }

  private readonly _rooms = signal<Room[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  readonly rooms = this._rooms.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly activeRooms = computed(() =>
    this._rooms().filter(r => r.status === 'active')
  );

  private persist(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this._rooms()));
    } catch (e) {
      console.warn('[RoomService] No se pudo persistir en localStorage:', e);
    }
  }

  loadRooms(): Observable<Room[]> {
    const cached = localStorage.getItem(this.STORAGE_KEY);
    if (cached) {
      try {
        const rooms = JSON.parse(cached) as Room[];
        this._rooms.set(rooms);
        this._loading.set(false);
        return of(rooms);
      } catch {
        localStorage.removeItem(this.STORAGE_KEY);
      }
    }
    this._loading.set(true);
    this._error.set(null);
    return this.http.get<Room[]>(this.dataUrl).pipe(
      delay(400),
      tap(rooms => {
        this._rooms.set(rooms);
        this.persist();
        this._loading.set(false);
      }),
      catchError(err => {
        this._error.set('Error al cargar las habitaciones.');
        this._loading.set(false);
        return throwError(() => err);
      })
    );
  }

  getRoomsByHotel(hotelId: string): Room[] {
    return this._rooms().filter(r => r.hotelId === hotelId);
  }

  getActiveRoomsByHotel(hotelId: string): Room[] {
    return this._rooms().filter(r => r.hotelId === hotelId && r.status === 'active');
  }

  getRoomById(id: string): Room | undefined {
    return this._rooms().find(r => r.id === id);
  }

  createRoom(dto: CreateRoomDto): Observable<Room> {
    this._loading.set(true);
    const newRoom: Room = {
      ...dto,
      id: `room-${uuidv4().slice(0, 8)}`,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return of(newRoom).pipe(
      delay(500),
      tap(room => {
        this._rooms.update(rooms => [...rooms, room]);
        this.persist();
        this._loading.set(false);
      }),
      catchError(err => {
        this._loading.set(false);
        return throwError(() => err);
      })
    );
  }

  updateRoom(dto: UpdateRoomDto): Observable<Room> {
    this._loading.set(true);
    const existing = this._rooms().find(r => r.id === dto.id);
    if (!existing) {
      this._loading.set(false);
      return throwError(() => new Error('Habitación no encontrada'));
    }
    const updated: Room = {
      ...existing,
      ...dto,
      updatedAt: new Date().toISOString(),
    };
    return of(updated).pipe(
      delay(500),
      tap(room => {
        this._rooms.update(rooms =>
          rooms.map(r => (r.id === room.id ? room : r))
        );
        this.persist();
        this._loading.set(false);
      }),
      catchError(err => {
        this._loading.set(false);
        return throwError(() => err);
      })
    );
  }

  toggleRoomStatus(id: string): Observable<Room> {
    const room = this._rooms().find(r => r.id === id);
    if (!room) return throwError(() => new Error('Habitación no encontrada'));
    const newStatus: RoomStatus = room.status === 'active' ? 'inactive' : 'active';
    return this.updateRoom({ id, status: newStatus });
  }
}

