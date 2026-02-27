import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { ReservationService } from '../../../../core/services/reservation.service';
import { HotelService } from '../../../../core/services/hotel.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { CopCurrencyPipe } from '../../../../shared/pipes/cop-currency.pipe';

@Component({
  selector: 'app-reservation-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatInputModule,
    MatFormFieldModule, MatSelectModule, MatTooltipModule, MatChipsModule,
    LoadingSpinnerComponent, StatusBadgeComponent, CopCurrencyPipe
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="page-title">
          <mat-icon>book_online</mat-icon>
          <div>
            <h1>Gestión de Reservas</h1>
            <p>{{ reservations().length }} reserva(s) registrada(s)</p>
          </div>
        </div>
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
          </mat-form-field>
          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Estado</mat-label>
            <mat-select [(ngModel)]="statusFilter">
              <mat-option value="">Todos</mat-option>
              <mat-option value="confirmed">Confirmadas</mat-option>
              <mat-option value="pending">Pendientes</mat-option>
              <mat-option value="cancelled">Canceladas</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Buscar huésped</mat-label>
            <mat-icon matPrefix>search</mat-icon>
            <input matInput [(ngModel)]="guestFilter" placeholder="Nombre o email..." />
          </mat-form-field>
          <button mat-stroked-button (click)="clearFilters()">
            <mat-icon>clear</mat-icon>
          </button>
        </div>
      </mat-card>

      <app-loading-spinner [visible]="loading()" message="Cargando reservas..." />

      @if (!loading()) {
        @if (filteredReservations().length === 0) {
          <mat-card class="empty-state">
            <mat-icon>event_busy</mat-icon>
            <h3>No se encontraron reservas</h3>
            <p>Ajusta los filtros o espera a que los viajeros realicen reservas</p>
          </mat-card>
        } @else {
          <div class="reservations-list">
            @for (res of filteredReservations(); track res.id) {
              <mat-card class="reservation-card">
                <div class="reservation-header">
                  <div class="reservation-id">
                    <mat-icon>confirmation_number</mat-icon>
                    <span>{{ res.id }}</span>
                  </div>
                  <app-status-badge [status]="res.status" />
                </div>
                <div class="reservation-body">
                  <div class="info-group">
                    <div class="info-label">
                      <mat-icon>hotel</mat-icon> Hotel
                    </div>
                    <div class="info-value">{{ res.hotelName }}</div>
                    <div class="info-sub">Habitación: {{ getRoomTypeLabel(res.roomType) }}</div>
                  </div>
                  <div class="info-group">
                    <div class="info-label">
                      <mat-icon>person</mat-icon> Huésped
                    </div>
                    <div class="info-value">{{ res.guest.fullName }}</div>
                    <div class="info-sub">{{ res.guest.email }}</div>
                  </div>
                  <div class="info-group">
                    <div class="info-label">
                      <mat-icon>date_range</mat-icon> Fechas
                    </div>
                    <div class="info-value">{{ res.checkIn | date:'dd/MM/yyyy' }}</div>
                    <div class="info-sub">al {{ res.checkOut | date:'dd/MM/yyyy' }}</div>
                  </div>
                  <div class="info-group">
                    <div class="info-label">
                      <mat-icon>payments</mat-icon> Total
                    </div>
                    <div class="info-value total-value">{{ res.totalCost | copCurrency }}</div>
                    <div class="info-sub">Creada {{ res.createdAt | date:'dd/MM/yyyy' }}</div>
                  </div>
                </div>
                <div class="reservation-footer">
                  <a mat-stroked-button [routerLink]="['/admin/reservations', res.id]">
                    <mat-icon>visibility</mat-icon>
                    Ver detalle
                  </a>
                </div>
              </mat-card>
            }
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .page-container { max-width: 1100px; margin: 0 auto; }
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
    .page-title { display: flex; align-items: center; gap: 1rem; }
    .page-title mat-icon { font-size: 2.5rem; width: 2.5rem; height: 2.5rem; color: #1a237e; }
    .page-title h1 { margin: 0; font-size: 1.5rem; font-weight: 600; }
    .page-title p { margin: 0; color: #666; font-size: 0.9rem; }
    .filter-card { margin-bottom: 1.5rem; padding: 1rem; }
    .filters { display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; }
    .filter-field { min-width: 160px; flex: 1; }
    .empty-state { text-align: center; padding: 3rem; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
    .empty-state mat-icon { font-size: 4rem; width: 4rem; height: 4rem; color: #ccc; }
    .empty-state h3 { margin: 0; }.empty-state p { margin: 0; color: #888; }
    .reservations-list { display: flex; flex-direction: column; gap: 1rem; }
    .reservation-card { padding: 1.25rem; }
    .reservation-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .reservation-id { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: #888; font-family: monospace; }
    .reservation-body { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1.5rem; margin-bottom: 1rem; }
    .info-group {}
    .info-label { display: flex; align-items: center; gap: 4px; font-size: 0.78rem; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.25rem; }
    .info-label mat-icon { font-size: 14px; width: 14px; height: 14px; }
    .info-value { font-weight: 600; color: #333; font-size: 0.9rem; }
    .info-sub { font-size: 0.8rem; color: #777; }
    .total-value { color: #1a237e; font-size: 1rem; }
    .reservation-footer { display: flex; justify-content: flex-end; padding-top: 0.5rem; border-top: 1px solid #f0f0f0; }
  `]
})
export class ReservationListComponent implements OnInit {
  private readonly reservationService = inject(ReservationService);
  private readonly hotelService = inject(HotelService);
  private readonly notification = inject(NotificationService);

  readonly reservations = this.reservationService.reservations;
  readonly loading = this.reservationService.loading;
  readonly hotels = this.hotelService.hotels;

  hotelFilter = '';
  statusFilter = '';
  guestFilter = '';

  readonly filteredReservations = computed(() => {
    const term = this.guestFilter.toLowerCase();
    return this.reservations().filter(r => {
      const matchesHotel = !this.hotelFilter || r.hotelId === this.hotelFilter;
      const matchesStatus = !this.statusFilter || r.status === this.statusFilter;
      const matchesGuest = !term ||
        r.guest.fullName.toLowerCase().includes(term) ||
        r.guest.email.toLowerCase().includes(term);
      return matchesHotel && matchesStatus && matchesGuest;
    });
  });

  ngOnInit(): void {
    if (this.reservationService.reservations().length === 0) {
      this.reservationService.loadReservations().subscribe({
        error: () => this.notification.error('No se pudieron cargar las reservas')
      });
    }
    if (this.hotelService.hotels().length === 0) {
      this.hotelService.loadHotels().subscribe();
    }
  }

  clearFilters(): void {
    this.hotelFilter = '';
    this.statusFilter = '';
    this.guestFilter = '';
  }

  getRoomTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      single: 'Individual', double: 'Doble', suite: 'Suite', family: 'Familiar', penthouse: 'Penthouse'
    };
    return labels[type] ?? type;
  }
}
