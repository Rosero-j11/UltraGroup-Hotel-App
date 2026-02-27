import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { HotelService } from '../../../../core/services/hotel.service';
import { RoomService } from '../../../../core/services/room.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { CopCurrencyPipe } from '../../../../shared/pipes/cop-currency.pipe';
import { Hotel, Room } from '../../../../core/models';

const ROOM_TYPE_LABELS: Record<string, string> = {
  single: 'Individual', double: 'Doble', suite: 'Suite', family: 'Familiar', penthouse: 'Penthouse'
};

@Component({
  selector: 'app-hotel-rooms',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatCardModule, MatButtonModule, MatIconModule, MatTooltipModule,
    MatChipsModule, MatDividerModule,
    LoadingSpinnerComponent, StatusBadgeComponent, CopCurrencyPipe
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <button mat-icon-button routerLink="/admin/hotels">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div class="page-title">
          <h1>Habitaciones — {{ hotel()?.name }}</h1>
          <p>
            <mat-icon>location_on</mat-icon>
            {{ hotel()?.city }} · {{ rooms().length }} habitación(es)
          </p>
        </div>
        <a mat-flat-button color="primary"
           [routerLink]="['/admin/rooms/new']"
           [queryParams]="{ hotelId: hotelId }">
          <mat-icon>add</mat-icon> Nueva Habitación
        </a>
      </div>

      <app-loading-spinner [visible]="loading()" message="Cargando habitaciones..." />

      @if (!loading()) {
        @if (rooms().length === 0) {
          <mat-card class="empty-state">
            <mat-icon>bed</mat-icon>
            <h3>No hay habitaciones registradas</h3>
            <p>Agrega la primera habitación a este hotel</p>
            <a mat-flat-button color="primary"
               [routerLink]="['/admin/rooms/new']"
               [queryParams]="{ hotelId: hotelId }">
              Agregar habitación
            </a>
          </mat-card>
        } @else {
          <div class="rooms-grid">
            @for (room of rooms(); track room.id) {
              <mat-card class="room-card">
                <div class="room-image-container">
                  <img [src]="room.imageUrl" [alt]="room.type" class="room-image"
                       (error)="onImageError($event)" />
                  <div class="room-type-badge">{{ getRoomTypeLabel(room.type) }}</div>
                  <div class="room-status-overlay">
                    <app-status-badge [status]="room.status" />
                  </div>
                </div>
                <mat-card-content class="room-content">
                  <div class="room-info">
                    <h3 class="room-title">{{ getRoomTypeLabel(room.type) }}</h3>
                    <p class="room-location">
                      <mat-icon>place</mat-icon> {{ room.location }}
                    </p>
                    <p class="room-desc">{{ room.description }}</p>
                    <div class="room-capacity">
                      <mat-icon>person</mat-icon>
                      Capacidad: {{ room.capacity }} persona(s)
                    </div>
                  </div>
                  <mat-divider></mat-divider>
                  <div class="room-pricing">
                    <div class="price-row">
                      <span>Costo base:</span>
                      <strong>{{ room.baseCost | copCurrency }}</strong>
                    </div>
                    <div class="price-row">
                      <span>Impuestos (IVA):</span>
                      <strong>{{ room.taxRate }}% ({{ (room.baseCost * room.taxRate / 100) | copCurrency }})</strong>
                    </div>
                    <div class="price-row total">
                      <span>Total/noche:</span>
                      <strong>{{ (room.baseCost * (1 + room.taxRate / 100)) | copCurrency }}</strong>
                    </div>
                  </div>
                </mat-card-content>
                <mat-card-actions class="room-actions">
                  <a mat-icon-button [routerLink]="['/admin/rooms', room.id, 'edit']"
                     matTooltip="Editar habitación">
                    <mat-icon>edit</mat-icon>
                  </a>
                  <button mat-icon-button
                    [matTooltip]="room.status === 'active' ? 'Deshabilitar' : 'Habilitar'"
                    [color]="room.status === 'active' ? 'warn' : 'primary'"
                    (click)="toggleStatus(room)">
                    <mat-icon>{{ room.status === 'active' ? 'toggle_on' : 'toggle_off' }}</mat-icon>
                  </button>
                </mat-card-actions>
              </mat-card>
            }
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .page-container { max-width: 1200px; margin: 0 auto; }
    .page-header {
      display: flex; align-items: center; gap: 0.75rem;
      margin-bottom: 1.5rem; flex-wrap: wrap;
    }
    .page-title { flex: 1; }
    .page-title h1 { margin: 0; font-size: 1.4rem; font-weight: 600; }
    .page-title p { margin: 0; color: #666; font-size: 0.9rem; display: flex; align-items: center; gap: 4px; }
    .page-title mat-icon { font-size: 16px; width: 16px; height: 16px; color: #e53935; }
    .empty-state {
      text-align: center; padding: 3rem;
      display: flex; flex-direction: column; align-items: center; gap: 1rem;
    }
    .empty-state mat-icon { font-size: 4rem; width: 4rem; height: 4rem; color: #ccc; }
    .rooms-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }
    .room-card { overflow: hidden; transition: box-shadow 0.2s; }
    .room-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.12); }
    .room-image-container { position: relative; height: 160px; overflow: hidden; }
    .room-image { width: 100%; height: 100%; object-fit: cover; }
    .room-type-badge {
      position: absolute; bottom: 8px; left: 8px;
      background: rgba(0,0,0,0.6); color: white;
      padding: 3px 10px; border-radius: 12px; font-size: 0.78rem; font-weight: 600;
    }
    .room-status-overlay { position: absolute; top: 8px; right: 8px; }
    .room-content { padding: 1rem !important; }
    .room-info { display: flex; flex-direction: column; gap: 0.35rem; margin-bottom: 0.75rem; }
    .room-title { margin: 0; font-size: 1rem; font-weight: 600; }
    .room-location { display: flex; align-items: center; gap: 4px; margin: 0; font-size: 0.83rem; color: #666; }
    .room-location mat-icon { font-size: 15px; width: 15px; height: 15px; color: #1a237e; }
    .room-desc { font-size: 0.82rem; color: #777; margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .room-capacity { display: flex; align-items: center; gap: 4px; font-size: 0.83rem; color: #555; }
    .room-capacity mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .room-pricing { padding-top: 0.75rem; display: flex; flex-direction: column; gap: 0.35rem; }
    .price-row { display: flex; justify-content: space-between; font-size: 0.88rem; color: #555; }
    .price-row.total { font-weight: 600; color: #1a237e; font-size: 0.95rem; border-top: 1px dashed #e0e0e0; padding-top: 0.35rem; }
    .room-actions { display: flex; justify-content: flex-end; padding: 0.5rem; }
  `]
})
export class HotelRoomsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly hotelService = inject(HotelService);
  private readonly roomService = inject(RoomService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  hotel = signal<Hotel | undefined>(undefined);
  loading = this.roomService.loading;
  hotelId = '';

  readonly rooms = computed(() =>
    this.roomService.getRoomsByHotel(this.hotelId)
  );

  ngOnInit(): void {
    this.hotelId = this.route.snapshot.paramMap.get('id') ?? '';
    const loadServices = () => {
      this.hotel.set(this.hotelService.getHotelById(this.hotelId));
    };
    if (this.roomService.rooms().length === 0) {
      this.roomService.loadRooms().subscribe({ next: loadServices });
    } else {
      loadServices();
    }
    if (this.hotelService.hotels().length === 0) {
      this.hotelService.loadHotels().subscribe({ next: () => this.hotel.set(this.hotelService.getHotelById(this.hotelId)) });
    } else {
      this.hotel.set(this.hotelService.getHotelById(this.hotelId));
    }
  }

  getRoomTypeLabel(type: string): string {
    return ROOM_TYPE_LABELS[type] ?? type;
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=Habitacion';
  }

  toggleStatus(room: Room): void {
    const action = room.status === 'active' ? 'deshabilitar' : 'habilitar';
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: `${room.status === 'active' ? 'Deshabilitar' : 'Habilitar'} habitación`,
        message: `¿Deseas ${action} la habitación de tipo ${this.getRoomTypeLabel(room.type)}?`,
        confirmText: action.charAt(0).toUpperCase() + action.slice(1),
        type: room.status === 'active' ? 'danger' : 'info',
      }
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.roomService.toggleRoomStatus(room.id).subscribe({
          next: () => this.notification.success(`Habitación ${room.status === 'active' ? 'deshabilitada' : 'habilitada'}`),
          error: () => this.notification.error('Error al cambiar estado')
        });
      }
    });
  }
}
