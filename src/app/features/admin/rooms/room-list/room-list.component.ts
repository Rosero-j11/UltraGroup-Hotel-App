import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { RoomService } from '../../../../core/services/room.service';
import { HotelService } from '../../../../core/services/hotel.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { CopCurrencyPipe } from '../../../../shared/pipes/cop-currency.pipe';
import { Room } from '../../../../core/models';

const ROOM_TYPE_LABELS: Record<string, string> = {
  single: 'Individual', double: 'Doble', suite: 'Suite', family: 'Familiar', penthouse: 'Penthouse'
};

@Component({
  selector: 'app-room-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule,
    MatTableModule, MatButtonModule, MatIconModule, MatInputModule,
    MatFormFieldModule, MatCardModule, MatTooltipModule, MatSelectModule, MatChipsModule,
    LoadingSpinnerComponent, StatusBadgeComponent, CopCurrencyPipe
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="page-title">
          <mat-icon>bed</mat-icon>
          <div>
            <h1>Gestión de Habitaciones</h1>
            <p>{{ rooms().length }} habitación(es) registrada(s)</p>
          </div>
        </div>
        <a mat-flat-button color="primary" routerLink="/admin/rooms/new">
          <mat-icon>add</mat-icon>
          Nueva Habitación
        </a>
      </div>

      <mat-card class="filter-card">
        <div class="filters">
          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Hotel</mat-label>
            <mat-select [(ngModel)]="hotelFilter">
              <mat-option value="">Todos los hoteles</mat-option>
              @for (hotel of hotels(); track hotel.id) {
                <mat-option [value]="hotel.id">{{ hotel.name }}</mat-option>
              }
            </mat-select>
            @if (hotelFilter) {
              <button matSuffix mat-icon-button class="clear-btn"
                      matTooltip="Limpiar hotel"
                      (click)="$event.stopPropagation(); hotelFilter = ''">
                <mat-icon>close</mat-icon>
              </button>
            }
          </mat-form-field>
          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Tipo</mat-label>
            <mat-select [(ngModel)]="typeFilter">
              <mat-option value="">Todos los tipos</mat-option>
              <mat-option value="single">Individual</mat-option>
              <mat-option value="double">Doble</mat-option>
              <mat-option value="suite">Suite</mat-option>
              <mat-option value="family">Familiar</mat-option>
              <mat-option value="penthouse">Penthouse</mat-option>
            </mat-select>
            @if (typeFilter) {
              <button matSuffix mat-icon-button class="clear-btn"
                      matTooltip="Limpiar tipo"
                      (click)="$event.stopPropagation(); typeFilter = ''">
                <mat-icon>close</mat-icon>
              </button>
            }
          </mat-form-field>
          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Estado</mat-label>
            <mat-select [(ngModel)]="statusFilter">
              <mat-option value="">Todos</mat-option>
              <mat-option value="active">Activas</mat-option>
              <mat-option value="inactive">Inactivas</mat-option>
            </mat-select>
            @if (statusFilter) {
              <button matSuffix mat-icon-button class="clear-btn"
                      matTooltip="Limpiar estado"
                      (click)="$event.stopPropagation(); statusFilter = ''">
                <mat-icon>close</mat-icon>
              </button>
            }
          </mat-form-field>
          <button mat-icon-button matTooltip="Limpiar todos los filtros"
                  (click)="clearFilters()" class="clear-all-btn">
            <mat-icon>filter_alt_off</mat-icon>
          </button>
        </div>
      </mat-card>

      <app-loading-spinner [visible]="loading()" message="Cargando habitaciones..." />

      @if (!loading()) {
        @if (filteredRooms().length === 0) {
          <mat-card class="empty-state">
            <mat-icon>bed</mat-icon>
            <h3>No se encontraron habitaciones</h3>
          </mat-card>
        } @else {
          <mat-card>
            <div class="table-responsive">
              <table class="rooms-table">
                <thead>
                  <tr>
                    <th>Imagen</th>
                    <th>Hotel</th>
                    <th>Tipo</th>
                    <th>Ubicación</th>
                    <th>Capacidad</th>
                    <th>Costo base</th>
                    <th>IVA</th>
                    <th>Total/noche</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for (room of filteredRooms(); track room.id) {
                    <tr>
                      <td>
                        <img [src]="room.imageUrl" class="room-thumb"
                             [alt]="room.type" (error)="onImageError($event)" />
                      </td>
                      <td>{{ getHotelName(room.hotelId) }}</td>
                      <td>{{ getRoomTypeLabel(room.type) }}</td>
                      <td>{{ room.location }}</td>
                      <td class="center">{{ room.capacity }}</td>
                      <td>{{ room.baseCost | copCurrency }}</td>
                      <td>{{ room.taxRate }}%</td>
                      <td><strong>{{ (room.baseCost * (1 + room.taxRate / 100)) | copCurrency }}</strong></td>
                      <td><app-status-badge [status]="room.status" /></td>
                      <td>
                        <div class="actions-cell">
                          <a mat-icon-button [routerLink]="['/admin/rooms', room.id, 'edit']"
                             matTooltip="Editar">
                            <mat-icon>edit</mat-icon>
                          </a>
                          <button mat-icon-button
                            [color]="room.status === 'active' ? 'warn' : 'primary'"
                            [matTooltip]="room.status === 'active' ? 'Deshabilitar' : 'Habilitar'"
                            (click)="toggleStatus(room)">
                            <mat-icon>{{ room.status === 'active' ? 'toggle_on' : 'toggle_off' }}</mat-icon>
                          </button>
                          <button mat-icon-button color="warn" matTooltip="Eliminar habitación"
                            (click)="deleteRoom(room)">
                            <mat-icon>delete</mat-icon>
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </mat-card>
        }
      }
    </div>
  `,
  styles: [`
    .page-container { max-width: 1200px; margin: 0 auto; }
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
    .page-title { display: flex; align-items: center; gap: 1rem; }
    .page-title mat-icon { font-size: 2.5rem; width: 2.5rem; height: 2.5rem; color: #1a237e; }
    .page-title h1 { margin: 0; font-size: 1.5rem; font-weight: 600; }
    .page-title p { margin: 0; color: #666; font-size: 0.9rem; }
    .filter-card { margin-bottom: 1.5rem; padding: 1rem; }
    .filters { display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; }
    .filter-field { min-width: 160px; flex: 1; }
    .clear-btn { width: 28px; height: 28px; line-height: 28px; color: #718096; }
    .clear-btn mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .clear-btn:hover { color: #E07A5F; }
    .clear-all-btn { color: #718096; flex-shrink: 0; margin-top: 2px; }
    .clear-all-btn:hover { color: #E07A5F; }
    .empty-state { text-align: center; padding: 3rem; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
    .empty-state mat-icon { font-size: 4rem; width: 4rem; height: 4rem; color: #ccc; }
    .table-responsive { overflow-x: auto; }
    .rooms-table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
    .rooms-table thead tr { background: #f5f5f5; }
    .rooms-table th { padding: 0.85rem 1rem; text-align: left; font-weight: 600; color: #444; white-space: nowrap; }
    .rooms-table td { padding: 0.75rem 1rem; border-top: 1px solid #f0f0f0; vertical-align: middle; }
    .rooms-table tr:hover td { background: #fafafa; }
    .room-thumb { width: 56px; height: 40px; object-fit: cover; border-radius: 6px; }
    .center { text-align: center; }
    .actions-cell { display: flex; gap: 4px; }
  `]
})
export class RoomListComponent implements OnInit {
  private readonly roomService = inject(RoomService);
  private readonly hotelService = inject(HotelService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  readonly rooms = this.roomService.rooms;
  readonly loading = this.roomService.loading;
  readonly hotels = this.hotelService.hotels;

  hotelFilter = '';
  typeFilter = '';
  statusFilter = '';

  readonly filteredRooms = computed(() => {
    return this.rooms().filter(r => {
      const matchesHotel = !this.hotelFilter || r.hotelId === this.hotelFilter;
      const matchesType = !this.typeFilter || r.type === this.typeFilter;
      const matchesStatus = !this.statusFilter || r.status === this.statusFilter;
      return matchesHotel && matchesType && matchesStatus;
    });
  });

  ngOnInit(): void {
    const loadData = () => {
      if (this.roomService.rooms().length === 0) {
        this.roomService.loadRooms().subscribe();
      }
      if (this.hotelService.hotels().length === 0) {
        this.hotelService.loadHotels().subscribe();
      }
    };
    loadData();
  }

  clearFilters(): void {
    this.hotelFilter = '';
    this.typeFilter = '';
    this.statusFilter = '';
  }

  getRoomTypeLabel(type: string): string {
    return ROOM_TYPE_LABELS[type] ?? type;
  }

  getHotelName(hotelId: string): string {
    return this.hotelService.getHotelById(hotelId)?.name ?? hotelId;
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'https://placehold.co/100x80?text=Hab';
  }

  deleteRoom(room: Room): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar habitación',
        message: `¿Estás seguro de que deseas eliminar esta habitación de tipo ${this.getRoomTypeLabel(room.type)}? Esta acción no se puede deshacer.`,
        confirmText: 'Eliminar',
        type: 'danger',
      }
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.roomService.deleteRoom(room.id).subscribe({
          next: () => this.notification.success('Habitación eliminada correctamente'),
          error: () => this.notification.error('Error al eliminar la habitación')
        });
      }
    });
  }

  toggleStatus(room: Room): void {
    const action = room.status === 'active' ? 'deshabilitar' : 'habilitar';
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: `${room.status === 'active' ? 'Deshabilitar' : 'Habilitar'} habitación`,
        message: `¿Deseas ${action} esta habitación de tipo ${this.getRoomTypeLabel(room.type)}?`,
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
