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
import { MatDialog } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { HotelService } from '../../../../core/services/hotel.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { StarRatingComponent } from '../../../../shared/components/star-rating/star-rating.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Hotel } from '../../../../core/models';

/**
 * Componente de listado de hoteles para el panel de administración.
 *
 * ## Patrón de reactividad
 * Lee el signal `hotels` del `HotelService` directamente (no necesita subscribe).
 * `filteredHotels` es un `computed()` que se recalcula automáticamente cuando
 * cambia `hotels()`, `searchTerm` o `statusFilter`.
 *
 * ## Filtrado
 * Los filtros de búsqueda y estado se combinan con AND: ambos deben coincidir.
 * La búsqueda es case-insensitive y busca en nombre, ciudad y dirección.
 *
 * ## Acciones sobre hoteles
 * - Navegar a edición: `routerLink` directo.
 * - Habilitar/deshabilitar: `toggleStatus()` con diálogo de confirmación.
 * - Eliminar: `deleteHotel()` con diálogo de confirmación (acción irreversible).
 */
@Component({
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule,
    MatTableModule, MatButtonModule, MatIconModule, MatInputModule,
    MatFormFieldModule, MatCardModule, MatTooltipModule, MatSelectModule,
    LoadingSpinnerComponent, StatusBadgeComponent, StarRatingComponent
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="page-title">
          <mat-icon>hotel</mat-icon>
          <div>
            <h1>Gestión de Hoteles</h1>
            <p>{{ hotels().length }} hotel(es) registrado(s)</p>
          </div>
        </div>
        <a mat-flat-button color="primary" routerLink="/admin/hotels/new">
          <mat-icon>add</mat-icon>
          Nuevo Hotel
        </a>
      </div>

      <!-- Filters -->
      <mat-card class="filter-card">
        <div class="filters">
          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Buscar hotel</mat-label>
            <mat-icon matPrefix>search</mat-icon>
            <input matInput [ngModel]="searchTerm()" (ngModelChange)="searchTerm.set($event)" placeholder="Nombre, ciudad..." />
            @if (searchTerm()) {
              <button matSuffix mat-icon-button class="clear-btn"
                      matTooltip="Limpiar búsqueda"
                      (click)="searchTerm.set('')">
                <mat-icon>close</mat-icon>
              </button>
            }
          </mat-form-field>
          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Estado</mat-label>
            <mat-select [ngModel]="statusFilter()" (ngModelChange)="statusFilter.set($event)">
              <mat-option value="">Todos</mat-option>
              <mat-option value="active">Activos</mat-option>
              <mat-option value="inactive">Inactivos</mat-option>
            </mat-select>
            @if (statusFilter()) {
              <button matSuffix mat-icon-button class="clear-btn"
                      matTooltip="Limpiar estado"
                      (click)="$event.stopPropagation(); statusFilter.set('')">
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

      <app-loading-spinner [visible]="loading()" message="Cargando hoteles..." />

      @if (!loading()) {
        @if (filteredHotels().length === 0) {
          <mat-card class="empty-state">
            <mat-icon>hotel_class</mat-icon>
            <h3>No se encontraron hoteles</h3>
            <p>Crea el primer hotel o ajusta los filtros</p>
            <a mat-flat-button color="primary" routerLink="/admin/hotels/new">
              Crear hotel
            </a>
          </mat-card>
        } @else {
          <div class="hotels-grid">
            @for (hotel of filteredHotels(); track hotel.id) {
              <mat-card class="hotel-card">
                <div class="hotel-image-container">
                  <img [src]="hotel.imageUrl" [alt]="hotel.name" class="hotel-image"
                       (error)="onImageError($event)" />
                  <div class="hotel-status-overlay">
                    <app-status-badge [status]="hotel.status" />
                  </div>
                </div>
                <mat-card-content class="hotel-card-content">
                  <div class="hotel-info">
                    <h3 class="hotel-name">{{ hotel.name }}</h3>
                    <app-star-rating [stars]="hotel.stars" />
                    <p class="hotel-city">
                      <mat-icon>location_on</mat-icon>
                      {{ hotel.city }}
                    </p>
                    <p class="hotel-address">{{ hotel.address }}</p>
                  </div>
                </mat-card-content>
                <mat-card-actions class="hotel-actions">
                  <a mat-icon-button [routerLink]="['/admin/hotels', hotel.id, 'rooms']"
                     matTooltip="Ver habitaciones" color="primary">
                    <mat-icon>bed</mat-icon>
                  </a>
                  <a mat-icon-button [routerLink]="['/admin/hotels', hotel.id, 'edit']"
                     matTooltip="Editar hotel">
                    <mat-icon>edit</mat-icon>
                  </a>
                  <button mat-icon-button
                    [matTooltip]="hotel.status === 'active' ? 'Deshabilitar' : 'Habilitar'"
                    [color]="hotel.status === 'active' ? 'warn' : 'primary'"
                    (click)="toggleStatus(hotel)">
                    <mat-icon>{{ hotel.status === 'active' ? 'toggle_on' : 'toggle_off' }}</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" matTooltip="Eliminar hotel"
                    (click)="deleteHotel(hotel)">
                    <mat-icon>delete</mat-icon>
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
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;
    }
    .page-title { display: flex; align-items: center; gap: 1rem; }
    .page-title mat-icon { font-size: 2.5rem; width: 2.5rem; height: 2.5rem; color: #1a237e; }
    .page-title h1 { margin: 0; font-size: 1.5rem; font-weight: 600; }
    .page-title p { margin: 0; color: #666; font-size: 0.9rem; }
    .filter-card { margin-bottom: 1.5rem; padding: 1rem; }
    .filters { display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; }
    .filter-field { min-width: 200px; flex: 1; }
    .clear-btn { width: 28px; height: 28px; line-height: 28px; color: #718096; }
    .clear-btn mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .clear-btn:hover { color: #E07A5F; }
    .clear-all-btn { color: #718096; flex-shrink: 0; margin-top: 2px; }
    .clear-all-btn:hover { color: #E07A5F; }
    .empty-state {
      text-align: center;
      padding: 3rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
    .empty-state mat-icon { font-size: 4rem; width: 4rem; height: 4rem; color: #ccc; }
    .empty-state h3 { margin: 0; color: #555; }
    .empty-state p { color: #888; margin: 0; }
    .hotels-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }
    .hotel-card { overflow: hidden; transition: box-shadow 0.2s; }
    .hotel-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.15); }
    .hotel-image-container { position: relative; height: 180px; overflow: hidden; }
    .hotel-image { width: 100%; height: 100%; object-fit: cover; }
    .hotel-status-overlay { position: absolute; top: 8px; right: 8px; }
    .hotel-card-content { padding: 1rem !important; }
    .hotel-info { display: flex; flex-direction: column; gap: 0.35rem; }
    .hotel-name { margin: 0; font-size: 1.05rem; font-weight: 600; }
    .hotel-city {
      display: flex; align-items: center; gap: 4px;
      color: #555; font-size: 0.88rem; margin: 0;
    }
    .hotel-city mat-icon { font-size: 16px; width: 16px; height: 16px; color: #e53935; }
    .hotel-address { font-size: 0.82rem; color: #888; margin: 0; }
    .hotel-actions { display: flex; justify-content: flex-end; padding: 0.5rem; }
  `]
})
export class HotelListComponent implements OnInit {
  private readonly hotelService = inject(HotelService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  readonly hotels = this.hotelService.hotels;
  readonly loading = this.hotelService.loading;

  searchTerm = signal('');
  statusFilter = signal('');

  readonly filteredHotels = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.hotels().filter(h => {
      const matchesSearch =
        !term ||
        h.name.toLowerCase().includes(term) ||
        h.city.toLowerCase().includes(term) ||
        h.address.toLowerCase().includes(term);
      const matchesStatus = !this.statusFilter() || h.status === this.statusFilter();
      return matchesSearch && matchesStatus;
    });
  });

  ngOnInit(): void {
    if (this.hotels().length === 0) {
      this.hotelService.loadHotels().subscribe({
        error: () => this.notification.error('No se pudieron cargar los hoteles')
      });
    }
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.statusFilter.set('');
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src =
      'https://placehold.co/600x400?text=Hotel';
  }

  /**
   * Elimina un hotel tras confirmación del usuario mediante `ConfirmDialogComponent`.
   * Si el usuario cancela el diálogo, la operación no se ejecuta.
   *
   * @param hotel Hotel a eliminar (se usa el nombre en el mensaje de confirmación).
   */
  deleteHotel(hotel: Hotel): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar hotel',
        message: `¿Estás seguro de que deseas eliminar el hotel "${hotel.name}"? Esta acción no se puede deshacer.`,
        confirmText: 'Eliminar',
        type: 'danger',
      }
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.hotelService.deleteHotel(hotel.id).subscribe({
          next: () => this.notification.success(`Hotel "${hotel.name}" eliminado correctamente`),
          error: () => this.notification.error('Error al eliminar el hotel')
        });
      }
    });
  }

  /**
   * Alterna el estado `active`/`inactive` del hotel tras confirmación.
   * El texto del diálogo cambia dinámicamente según el estado actual.
   */
  toggleStatus(hotel: Hotel): void {
    const action = hotel.status === 'active' ? 'deshabilitar' : 'habilitar';
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: `${hotel.status === 'active' ? 'Deshabilitar' : 'Habilitar'} hotel`,
        message: `¿Estás seguro de que deseas ${action} el hotel "${hotel.name}"?`,
        confirmText: action.charAt(0).toUpperCase() + action.slice(1),
        type: hotel.status === 'active' ? 'danger' : 'info',
      }
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.hotelService.toggleHotelStatus(hotel.id).subscribe({
          next: () =>
            this.notification.success(
              `Hotel "${hotel.name}" ${hotel.status === 'active' ? 'deshabilitado' : 'habilitado'} exitosamente`
            ),
          error: () => this.notification.error('Error al cambiar estado del hotel')
        });
      }
    });
  }
}
