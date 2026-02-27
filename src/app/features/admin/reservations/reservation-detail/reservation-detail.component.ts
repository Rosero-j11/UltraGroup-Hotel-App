import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { ReservationService } from '../../../../core/services/reservation.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { CopCurrencyPipe } from '../../../../shared/pipes/cop-currency.pipe';
import { Reservation } from '../../../../core/models';

@Component({
  selector: 'app-reservation-detail',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatCardModule, MatButtonModule, MatIconModule, MatDividerModule, MatChipsModule,
    LoadingSpinnerComponent, StatusBadgeComponent, CopCurrencyPipe
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <button mat-icon-button routerLink="/admin/reservations">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div class="page-title">
          <h1>Detalle de Reserva</h1>
          <p class="reservation-id">{{ reservation()?.id }}</p>
        </div>
        @if (reservation()) {
          <app-status-badge [status]="reservation()!.status" />
        }
      </div>

      <app-loading-spinner [visible]="loading()" message="Cargando reserva..." />

      @if (!loading() && reservation(); as res) {
        <div class="detail-grid">
          <!-- Hotel & Habitación -->
          <mat-card class="detail-card">
            <mat-card-header>
              <mat-icon mat-card-avatar color="primary">hotel</mat-icon>
              <mat-card-title>Hotel & Habitación</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="detail-rows">
                <div class="detail-row">
                  <span class="detail-label">Hotel</span>
                  <span class="detail-value">{{ res.hotelName }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Tipo de habitación</span>
                  <span class="detail-value">{{ getRoomTypeLabel(res.roomType) }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">ID Habitación</span>
                  <span class="detail-value mono">{{ res.roomId }}</span>
                </div>
                <mat-divider></mat-divider>
                <div class="detail-row">
                  <span class="detail-label">Check-in</span>
                  <span class="detail-value">{{ res.checkIn | date:'dd/MM/yyyy' }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Check-out</span>
                  <span class="detail-value">{{ res.checkOut | date:'dd/MM/yyyy' }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Noches</span>
                  <span class="detail-value">{{ calculateNights(res.checkIn, res.checkOut) }}</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Información del huésped -->
          <mat-card class="detail-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>person</mat-icon>
              <mat-card-title>Información del Huésped</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="detail-rows">
                <div class="detail-row">
                  <span class="detail-label">Nombre completo</span>
                  <span class="detail-value">{{ res.guest.fullName }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Fecha de nacimiento</span>
                  <span class="detail-value">{{ res.guest.birthDate | date:'dd/MM/yyyy' }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Género</span>
                  <span class="detail-value">{{ getGenderLabel(res.guest.gender) }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Documento</span>
                  <span class="detail-value">{{ res.guest.documentType }} {{ res.guest.documentNumber }}</span>
                </div>
                <mat-divider></mat-divider>
                <div class="detail-row">
                  <span class="detail-label">Email</span>
                  <span class="detail-value">{{ res.guest.email }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Teléfono</span>
                  <span class="detail-value">{{ res.guest.phone }}</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Contacto de emergencia -->
          <mat-card class="detail-card">
            <mat-card-header>
              <mat-icon mat-card-avatar color="warn">emergency</mat-icon>
              <mat-card-title>Contacto de Emergencia</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="detail-rows">
                <div class="detail-row">
                  <span class="detail-label">Nombre</span>
                  <span class="detail-value">{{ res.emergencyContact.fullName }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Teléfono</span>
                  <span class="detail-value">{{ res.emergencyContact.phone }}</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Resumen de costos -->
          <mat-card class="detail-card pricing-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>payments</mat-icon>
              <mat-card-title>Resumen de Costos</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="pricing-rows">
                <div class="pricing-row">
                  <span>Costo base ({{ calculateNights(res.checkIn, res.checkOut) }} noche(s))</span>
                  <span>{{ res.baseCost * calculateNights(res.checkIn, res.checkOut) | copCurrency }}</span>
                </div>
                <div class="pricing-row">
                  <span>Impuestos</span>
                  <span>{{ res.taxes * calculateNights(res.checkIn, res.checkOut) | copCurrency }}</span>
                </div>
                <mat-divider></mat-divider>
                <div class="pricing-row total">
                  <span>Total pagado</span>
                  <strong>{{ res.totalCost | copCurrency }}</strong>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      }

      @if (!loading() && !reservation()) {
        <mat-card class="empty-state">
          <mat-icon>error_outline</mat-icon>
          <h3>Reserva no encontrada</h3>
          <a mat-flat-button color="primary" routerLink="/admin/reservations">Volver al listado</a>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .page-container { max-width: 1100px; margin: 0 auto; }
    .page-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; }
    .page-title h1 { margin: 0; font-size: 1.4rem; font-weight: 600; }
    .reservation-id { margin: 0; font-size: 0.83rem; color: #888; font-family: monospace; }
    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(480px, 1fr));
      gap: 1.5rem;
    }
    .detail-card {}
    .detail-rows { display: flex; flex-direction: column; gap: 0.5rem; padding: 0.5rem 0; }
    .detail-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; padding: 0.25rem 0; }
    .detail-label { font-size: 0.83rem; color: #888; min-width: 140px; }
    .detail-value { font-weight: 500; color: #333; text-align: right; }
    .mono { font-family: monospace; font-size: 0.82rem; }
    mat-divider { margin: 0.25rem 0; }
    .pricing-rows { display: flex; flex-direction: column; gap: 0.5rem; padding: 0.5rem 0; }
    .pricing-row { display: flex; justify-content: space-between; font-size: 0.9rem; color: #555; }
    .pricing-row.total { font-size: 1.05rem; font-weight: 700; color: #1a237e; padding-top: 0.5rem; }
    .empty-state { text-align: center; padding: 3rem; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
    .empty-state mat-icon { font-size: 4rem; width: 4rem; height: 4rem; color: #ccc; }
  `]
})
export class ReservationDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly reservationService = inject(ReservationService);
  private readonly notification = inject(NotificationService);

  readonly loading = this.reservationService.loading;
  private readonly reservationId = signal<string>('');

  // Computed reactivo: se actualiza cuando lastCreated() o reservations() cambian
  readonly reservation = computed(() => {
    const id = this.reservationId();
    if (!id) return undefined;
    const last = this.reservationService.lastCreated();
    if (last?.id === id) return last;
    return this.reservationService.reservations().find(r => r.id === id);
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.reservationId.set(id);
    if (!this.reservation()) {
      this.reservationService.loadReservations().subscribe({
        error: () => this.notification.error('No se pudo cargar la reserva')
      });
    }
  }

  calculateNights(checkIn: string, checkOut: string): number {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000));
  }

  getRoomTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      single: 'Individual', double: 'Doble', suite: 'Suite', family: 'Familiar', penthouse: 'Penthouse'
    };
    return labels[type] ?? type;
  }

  getGenderLabel(gender: string): string {
    const labels: Record<string, string> = { M: 'Masculino', F: 'Femenino', OTHER: 'Otro' };
    return labels[gender] ?? gender;
  }
}
