import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { ReservationService } from '../../../core/services/reservation.service';
import { CopCurrencyPipe } from '../../../shared/pipes/cop-currency.pipe';
import { Reservation } from '../../../core/models';
import { trigger, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-booking-confirmation',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatCardModule, MatButtonModule, MatIconModule, MatDividerModule,
    CopCurrencyPipe
  ],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ],
  template: `
    <div class="confirmation-wrapper" @fadeInUp>
      @if (reservation(); as res) {
        <div class="success-banner">
          <div class="success-icon-wrap">
            <mat-icon class="success-icon">check_circle</mat-icon>
          </div>
          <h1>¡Reserva confirmada!</h1>
          <p>Tu reserva ha sido procesada exitosamente. Recibirás un resumen en tu correo electrónico.</p>
        </div>

        <div class="confirmation-content">
          <mat-card class="confirmation-card">
            <mat-card-header>
              <mat-icon mat-card-avatar color="primary">confirmation_number</mat-icon>
              <mat-card-title>Código de reserva</mat-card-title>
              <mat-card-subtitle class="reservation-code">{{ res.id }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="detail-grid">
                <!-- Hotel info -->
                <div class="detail-section">
                  <h4 class="section-title"><mat-icon>hotel</mat-icon><span>Alojamiento</span></h4>
                  <div class="detail-row"><span>Hotel:</span> <strong>{{ res.hotelName }}</strong></div>
                  <div class="detail-row"><span>Habitación:</span> <strong>{{ getRoomTypeLabel(res.roomType) }}</strong></div>
                  <div class="detail-row"><span>Check-in:</span> <strong>{{ res.checkIn | date:'dd/MM/yyyy' }}</strong></div>
                  <div class="detail-row"><span>Check-out:</span> <strong>{{ res.checkOut | date:'dd/MM/yyyy' }}</strong></div>
                  <div class="detail-row"><span>Noches:</span> <strong>{{ calculateNights(res.checkIn, res.checkOut) }}</strong></div>
                </div>

                <!-- Guest info -->
                <div class="detail-section">
                  <h4 class="section-title"><mat-icon>person</mat-icon><span>Huésped</span></h4>
                  <div class="detail-row"><span>Nombre:</span> <strong>{{ res.guest.fullName }}</strong></div>
                  <div class="detail-row"><span>Documento:</span> <strong>{{ res.guest.documentType }} {{ res.guest.documentNumber }}</strong></div>
                  <div class="detail-row"><span>Email:</span> <strong>{{ res.guest.email }}</strong></div>
                  <div class="detail-row"><span>Teléfono:</span> <strong>{{ res.guest.phone }}</strong></div>
                </div>
              </div>

              <mat-divider></mat-divider>

              <div class="pricing-summary">
                <div class="pricing-row">
                  <span>Costo base ({{ calculateNights(res.checkIn, res.checkOut) }} noche(s)):</span>
                  <span>{{ (res.baseCost * calculateNights(res.checkIn, res.checkOut)) | copCurrency }}</span>
                </div>
                <div class="pricing-row">
                  <span>Impuestos:</span>
                  <span>{{ (res.taxes * calculateNights(res.checkIn, res.checkOut)) | copCurrency }}</span>
                </div>
                <div class="pricing-row total">
                  <span>Total pagado:</span>
                  <strong>{{ res.totalCost | copCurrency }}</strong>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <div class="confirmation-actions">
            <a mat-stroked-button routerLink="/admin/reservations" class="action-btn">
              <mat-icon>dashboard</mat-icon>
              <span>Ver en panel admin</span>
            </a>
            <a mat-flat-button color="primary" routerLink="/traveler/search" class="action-btn">
              <mat-icon>search</mat-icon>
              <span>Buscar otro hotel</span>
            </a>
          </div>
        </div>
      } @else {
        <div class="not-found">
          <mat-icon>error_outline</mat-icon>
          <h2>No se encontró la confirmación</h2>
          <a mat-flat-button color="primary" routerLink="/traveler/search">Ir a búsqueda</a>
        </div>
      }
    </div>
  `,
  styles: [`
    .confirmation-wrapper { max-width: 900px; margin: 0 auto; padding: 1.5rem 1rem; }
    .success-banner {
      text-align: center;
      padding: 3rem 2rem 2.5rem;
      background: linear-gradient(135deg, #1A365D, #2a4a7f);
      border-radius: 16px;
      color: #ffffff !important;
      margin-bottom: 2rem;
    }
    .success-banner * { color: #ffffff !important; }
    .success-icon-wrap {
      display: inline-flex;
      padding: 1rem;
      background: rgba(255,255,255,0.2);
      border-radius: 50%;
      margin-bottom: 1rem;
    }
    .success-icon { font-size: 4rem; width: 4rem; height: 4rem; }
    .success-banner h1 { margin: 0 0 0.75rem; font-size: 2rem; font-weight: 700; }
    .success-banner p { margin: 0; opacity: 0.9; font-size: 1rem; max-width: 500px; margin: 0 auto; }
    .confirmation-content { }
    .confirmation-card { margin-bottom: 1.5rem; }
    .reservation-code { font-family: monospace; font-size: 0.9rem !important; letter-spacing: 1px; }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin: 1rem 0; }
    @media (max-width: 600px) { .detail-grid { grid-template-columns: 1fr; } }
    .detail-section h4.section-title {
      display: flex; align-items: center; gap: 0.5rem;
      margin: 0 0 0.75rem; font-size: 0.88rem;
      text-transform: uppercase; color: #888; letter-spacing: 0.5px;
    }
    .detail-section h4.section-title mat-icon { font-size: 18px; width: 18px; height: 18px; color: #1a237e; text-transform: none; }
    .detail-section h4.section-title span { text-transform: uppercase; }
    .detail-row { display: flex; gap: 0.5rem; margin-bottom: 0.4rem; font-size: 0.9rem; }
    .detail-row span { color: #777; }
    .detail-row strong { color: #333; }
    mat-divider { margin: 1rem 0; }
    .pricing-summary { display: flex; flex-direction: column; gap: 0.4rem; }
    .pricing-row { display: flex; justify-content: space-between; font-size: 0.9rem; color: #555; }
    .pricing-row.total { font-size: 1.05rem; font-weight: 700; color: #1a237e; padding-top: 0.5rem; border-top: 2px solid #e8eaf6; }
    .confirmation-actions { display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap; }
    .action-btn { display: inline-flex !important; align-items: center !important; gap: 0.4rem !important; }
    .not-found { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 4rem; }
    .not-found mat-icon { font-size: 4rem; width: 4rem; height: 4rem; color: #ccc; }
  `]
})
export class BookingConfirmationComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly reservationService = inject(ReservationService);

  private readonly reservationId = signal<string>('');

  // Computed reactivo: se actualiza automáticamente cuando lastCreated() o reservations() cambian
  readonly reservation = computed(() => {
    const id = this.reservationId();
    if (!id) return null;
    const last = this.reservationService.lastCreated();
    if (last?.id === id) return last;
    return this.reservationService.reservations().find(r => r.id === id) ?? null;
  });

  ngOnInit(): void {
    const id = this.route.snapshot.queryParams['reservationId'];
    if (!id) return;
    this.reservationId.set(id);

    // Si no está en memoria, cargar del JSON
    if (!this.reservation()) {
      this.reservationService.loadReservations().subscribe();
    }
  }

  calculateNights(checkIn: string, checkOut: string): number {
    return Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000));
  }

  getRoomTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      single: 'Individual', double: 'Doble', suite: 'Suite', family: 'Familiar', penthouse: 'Penthouse'
    };
    return labels[type] ?? type;
  }
}
