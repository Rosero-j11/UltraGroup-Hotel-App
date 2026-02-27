import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { HotelService } from '../../../core/services/hotel.service';
import { RoomService } from '../../../core/services/room.service';
import { ReservationService } from '../../../core/services/reservation.service';
import { NotificationService } from '../../../core/services/notification.service';

import { CopCurrencyPipe } from '../../../shared/pipes/cop-currency.pipe';
import { Hotel, Room } from '../../../core/models';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule,
    MatSelectModule, MatCardModule, MatDividerModule, MatStepperModule,
    MatDatepickerModule, MatNativeDateModule,
    CopCurrencyPipe
  ],
  template: `
    <div class="booking-wrapper">
      <div class="booking-header">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div>
          <h1>Reservar habitación</h1>
          <p>Completa tus datos para finalizar la reserva</p>
        </div>
      </div>

      <div class="booking-layout">
        <!-- Booking summary sidebar -->
        <aside class="booking-summary">
          @if (hotel() && room()) {
            <mat-card class="summary-card">
              <img [src]="room()!.imageUrl" class="summary-img" [alt]="room()!.type"
                   (error)="onImageError($event)" />
              <mat-card-content>
                <h3 class="summary-hotel">{{ hotel()!.name }}</h3>
                <p class="summary-location">
                  <mat-icon>location_on</mat-icon> {{ hotel()!.city }}
                </p>
                <mat-divider></mat-divider>
                <div class="summary-room">
                  <div class="summary-row">
                    <span>Habitación</span>
                    <strong>{{ getRoomTypeLabel(room()!.type) }}</strong>
                  </div>
                  <div class="summary-row">
                    <span>Ubicación</span>
                    <strong>{{ room()!.location }}</strong>
                  </div>
                  <div class="summary-row">
                    <span>Check-in</span>
                    <strong>{{ checkIn || '—' }}</strong>
                  </div>
                  <div class="summary-row">
                    <span>Check-out</span>
                    <strong>{{ checkOut || '—' }}</strong>
                  </div>
                  <div class="summary-row">
                    <span>Noches</span>
                    <strong>{{ nights() }}</strong>
                  </div>
                </div>
                <mat-divider></mat-divider>
                <div class="summary-pricing">
                  <div class="summary-row">
                    <span>Costo base x {{ nights() }}</span>
                    <span>{{ (room()!.baseCost * nights()) | copCurrency }}</span>
                  </div>
                  <div class="summary-row">
                    <span>Impuestos (IVA {{ room()!.taxRate }}%) x {{ nights() }}</span>
                    <span>{{ (room()!.baseCost * room()!.taxRate / 100 * nights()) | copCurrency }}</span>
                  </div>
                  <div class="summary-row total-row">
                    <span>Total</span>
                    <strong>{{ (room()!.baseCost * (1 + room()!.taxRate / 100) * nights()) | copCurrency }}</strong>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          }
        </aside>

        <!-- Main form -->
        <div class="booking-form-area">
          <mat-stepper [linear]="true" #stepper orientation="horizontal">
            <!-- Step 1: Guest data -->
            <mat-step [stepControl]="guestForm" label="Datos del huésped">
              <form [formGroup]="guestForm" class="step-form">
                <div class="form-section">
                  <h3><mat-icon>person</mat-icon> Información personal</h3>
                  <div class="form-row">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Nombre completo</mat-label>
                      <mat-icon matPrefix>badge</mat-icon>
                      <input matInput formControlName="fullName" placeholder="Nombre y apellidos completos" />
                      @if (guestForm.get('fullName')?.invalid && guestForm.get('fullName')?.touched) {
                        <mat-error>El nombre es obligatorio</mat-error>
                      }
                    </mat-form-field>
                  </div>
                  <div class="form-row two-cols">
                    <mat-form-field appearance="outline">
                      <mat-label>Fecha de nacimiento</mat-label>
                      <mat-icon matPrefix>cake</mat-icon>
                      <input matInput [matDatepicker]="bDayPicker" formControlName="birthDate" [max]="maxBirthDate" readonly (click)="bDayPicker.open()" style="cursor:pointer" />
                      <mat-datepicker-toggle matSuffix [for]="bDayPicker"></mat-datepicker-toggle>
                      <mat-datepicker #bDayPicker></mat-datepicker>
                      @if (guestForm.get('birthDate')?.invalid && guestForm.get('birthDate')?.touched) {
                        <mat-error>La fecha de nacimiento es obligatoria</mat-error>
                      }
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                      <mat-label>Género</mat-label>
                      <mat-icon matPrefix>wc</mat-icon>
                      <mat-select formControlName="gender">
                        <mat-option value="M">Masculino</mat-option>
                        <mat-option value="F">Femenino</mat-option>
                        <mat-option value="OTHER">Otro / Prefiero no decir</mat-option>
                      </mat-select>
                      @if (guestForm.get('gender')?.invalid && guestForm.get('gender')?.touched) {
                        <mat-error>El género es obligatorio</mat-error>
                      }
                    </mat-form-field>
                  </div>
                  <div class="form-row two-cols">
                    <mat-form-field appearance="outline">
                      <mat-label>Tipo de documento</mat-label>
                      <mat-icon matPrefix>folder_shared</mat-icon>
                      <mat-select formControlName="documentType">
                        <mat-option value="CC">Cédula de Ciudadanía</mat-option>
                        <mat-option value="CE">Cédula de Extranjería</mat-option>
                        <mat-option value="PASSPORT">Pasaporte</mat-option>
                        <mat-option value="NIT">NIT</mat-option>
                      </mat-select>
                      @if (guestForm.get('documentType')?.invalid && guestForm.get('documentType')?.touched) {
                        <mat-error>El tipo de documento es obligatorio</mat-error>
                      }
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                      <mat-label>Número de documento</mat-label>
                      <mat-icon matPrefix>numbers</mat-icon>
                      <input matInput formControlName="documentNumber" />
                      @if (guestForm.get('documentNumber')?.invalid && guestForm.get('documentNumber')?.touched) {
                        <mat-error>El número de documento es obligatorio</mat-error>
                      }
                    </mat-form-field>
                  </div>
                  <div class="form-row two-cols">
                    <mat-form-field appearance="outline">
                      <mat-label>Email</mat-label>
                      <mat-icon matPrefix>email</mat-icon>
                      <input matInput type="email" formControlName="email" placeholder="correo@ejemplo.com" />
                      @if (guestForm.get('email')?.invalid && guestForm.get('email')?.touched) {
                        <mat-error>Email válido es obligatorio</mat-error>
                      }
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                      <mat-label>Teléfono</mat-label>
                      <mat-icon matPrefix>phone</mat-icon>
                      <input matInput formControlName="phone" placeholder="+57 300 000 0000" />
                      @if (guestForm.get('phone')?.invalid && guestForm.get('phone')?.touched) {
                        <mat-error>El teléfono es obligatorio</mat-error>
                      }
                    </mat-form-field>
                  </div>
                </div>
                <div class="step-actions">
                  <button mat-flat-button color="primary" matStepperNext
                    type="button"
                    (click)="guestForm.markAllAsTouched()"
                    [disabled]="guestForm.invalid">
                    Siguiente <mat-icon>arrow_forward</mat-icon>
                  </button>
                </div>
              </form>
            </mat-step>

            <!-- Step 2: Emergency contact -->
            <mat-step [stepControl]="emergencyForm" label="Contacto de emergencia">
              <form [formGroup]="emergencyForm" class="step-form">
                <div class="form-section">
                  <h3><mat-icon>emergency</mat-icon> Contacto de emergencia</h3>
                  <p class="section-hint">Persona de contacto en caso de emergencia durante tu estadía</p>
                  <div class="form-row">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Nombre completo del contacto</mat-label>
                      <mat-icon matPrefix>person_add</mat-icon>
                      <input matInput formControlName="fullName" />
                      @if (emergencyForm.get('fullName')?.invalid && emergencyForm.get('fullName')?.touched) {
                        <mat-error>El nombre del contacto es obligatorio</mat-error>
                      }
                    </mat-form-field>
                  </div>
                  <div class="form-row">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Teléfono del contacto</mat-label>
                      <mat-icon matPrefix>phone_in_talk</mat-icon>
                      <input matInput formControlName="phone" placeholder="+57 300 000 0000" />
                      @if (emergencyForm.get('phone')?.invalid && emergencyForm.get('phone')?.touched) {
                        <mat-error>El teléfono del contacto es obligatorio</mat-error>
                      }
                    </mat-form-field>
                  </div>
                </div>
                <div class="step-actions">
                  <button mat-stroked-button matStepperPrevious type="button">
                    <mat-icon>arrow_back</mat-icon> Anterior
                  </button>
                  <button mat-flat-button color="primary" matStepperNext type="button"
                    (click)="emergencyForm.markAllAsTouched()"
                    [disabled]="emergencyForm.invalid">
                    Siguiente <mat-icon>arrow_forward</mat-icon>
                  </button>
                </div>
              </form>
            </mat-step>

            <!-- Step 3: Confirm -->
            <mat-step label="Confirmar reserva">
              <div class="confirm-step">
                <h3><mat-icon>task_alt</mat-icon> Resumen de tu reserva</h3>

                <div class="confirm-grid">
                  <div class="confirm-section">
                    <h4>Huésped</h4>
                    <p><strong>{{ guestForm.get('fullName')?.value }}</strong></p>
                    <p>{{ guestForm.get('documentType')?.value }} {{ guestForm.get('documentNumber')?.value }}</p>
                    <p>{{ guestForm.get('email')?.value }}</p>
                    <p>{{ guestForm.get('phone')?.value }}</p>
                  </div>
                  <div class="confirm-section">
                    <h4>Contacto de emergencia</h4>
                    <p><strong>{{ emergencyForm.get('fullName')?.value }}</strong></p>
                    <p>{{ emergencyForm.get('phone')?.value }}</p>
                  </div>
                </div>

                @if (hotel() && room()) {
                  <div class="confirm-booking-summary">
                    <div class="confirm-row">
                      <mat-icon>hotel</mat-icon>
                      <span>{{ hotel()!.name }} — {{ getRoomTypeLabel(room()!.type) }}</span>
                    </div>
                    <div class="confirm-row">
                      <mat-icon>date_range</mat-icon>
                      <span>{{ checkIn || '—' }} → {{ checkOut || '—' }} ({{ nights() }} noche(s))</span>
                    </div>
                    <div class="confirm-row total-highlight">
                      <mat-icon>payments</mat-icon>
                      <span>Total: <strong>{{ (room()!.baseCost * (1 + room()!.taxRate / 100) * nights()) | copCurrency }}</strong></span>
                    </div>
                  </div>
                }

                <div class="step-actions">
                  <button mat-stroked-button matStepperPrevious type="button">
                    <mat-icon>arrow_back</mat-icon> Anterior
                  </button>
                  <button mat-flat-button color="primary"
                    (click)="confirmBooking()"
                    [disabled]="submitting()">
                    <mat-icon>{{ submitting() ? 'hourglass_empty' : 'check_circle' }}</mat-icon>
                    {{ submitting() ? 'Procesando...' : 'Confirmar reserva' }}
                  </button>
                </div>
              </div>
            </mat-step>
          </mat-stepper>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .booking-wrapper { max-width: 1100px; margin: 0 auto; padding: 1rem 0.75rem; }
    .booking-header { display: flex; align-items: flex-start; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap; }
    .booking-header h1 { margin: 0; font-size: 1.2rem; font-weight: 700; color: #1A365D; }
    .booking-header p { margin: 0; color: #718096; font-size: 0.85rem; }
    /* Mobile: columna única, summary arriba */
    .booking-layout { display: grid; grid-template-columns: 1fr; gap: 1rem; align-items: start; direction: ltr; }
    .summary-card { overflow: hidden; }
    .summary-img { width: 100%; height: 130px; object-fit: cover; }
    .summary-card mat-card-content { padding: 0.85rem !important; }
    .summary-hotel { margin: 0 0 0.2rem; font-size: 0.95rem; font-weight: 700; color: #1A365D; }
    .summary-location { display: flex; align-items: center; gap: 4px; margin: 0 0 0.6rem; font-size: 0.8rem; color: #718096; }
    .summary-location mat-icon { font-size: 14px; width: 14px; height: 14px; color: #E07A5F; }
    .summary-row { display: flex; justify-content: space-between; font-size: 0.82rem; padding: 0.18rem 0; color: #555; }
    .summary-room { padding: 0.6rem 0; }
    .summary-pricing { padding: 0.6rem 0; display: flex; flex-direction: column; gap: 0.15rem; }
    .total-row { font-weight: 700; color: #C9A227; font-size: 0.95rem; border-top: 1px dashed #e0e0e0; padding-top: 0.35rem; margin-top: 0.2rem; }
    mat-divider { margin: 0.4rem 0; }
    .booking-form-area { background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); padding: 1rem; }
    .step-form { padding: 0.5rem 0; }
    .form-section { display: flex; flex-direction: column; gap: 0.4rem; }
    .form-section h3 { display: flex; align-items: center; gap: 0.4rem; margin: 0 0 0.6rem; font-size: 0.95rem; font-weight: 700; color: #1A365D; }
    .section-hint { font-size: 0.83rem; color: #718096; margin: -0.4rem 0 0.75rem; }
    .form-row { margin-bottom: 0.25rem; }
    .form-row.two-cols { display: grid; grid-template-columns: 1fr; gap: 0; }
    .full-width { width: 100%; }
    .step-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid #f0f0f0; flex-wrap: wrap; }
    .step-actions button { flex: 1; min-width: 120px; }
    .confirm-step { padding: 0.5rem 0; }
    .confirm-step h3 { display: flex; align-items: center; gap: 0.5rem; font-size: 1rem; font-weight: 700; color: #1A365D; margin-bottom: 1rem; }
    .confirm-grid { display: grid; grid-template-columns: 1fr; gap: 0.75rem; margin-bottom: 1rem; }
    .confirm-section { padding: 0.85rem; background: #F7FAFC; border-radius: 8px; }
    .confirm-section h4 { margin: 0 0 0.4rem; font-size: 0.85rem; font-weight: 700; color: #1A365D; text-transform: uppercase; letter-spacing: 0.5px; }
    .confirm-section p { margin: 0.15rem 0; font-size: 0.85rem; color: #2D3748; }
    .confirm-booking-summary { padding: 0.85rem; background: #E6FFFA; border-radius: 8px; display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; }
    .confirm-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.88rem; color: #2D3748; }
    .confirm-row mat-icon { font-size: 18px; width: 18px; height: 18px; color: #1A365D; flex-shrink: 0; }
    .total-highlight { font-weight: 600; color: #1A365D; font-size: 1rem; }
    .total-highlight strong { color: #C9A227; font-size: 1.1rem; }

    /* ── Tablet >= 600px ── */
    @media (min-width: 600px) {
      .booking-wrapper { padding: 1.25rem 1rem; }
      .form-row.two-cols { grid-template-columns: 1fr 1fr; gap: 0.5rem; }
      .confirm-grid { grid-template-columns: 1fr 1fr; }
    }

    /* ── Desktop >= 960px ── */
    @media (min-width: 960px) {
      .booking-wrapper { padding: 1.5rem 1rem; }
      .booking-layout { grid-template-columns: 280px 1fr; gap: 1.5rem; }
      .summary-card { position: sticky; top: 80px; }
      .summary-img { height: 150px; }
      .booking-form-area { padding: 1.5rem; }
      .step-actions button { flex: 0 0 auto; }
    }
    .form-section h3 mat-icon { color: #1a237e; }
    .section-hint { margin: -0.5rem 0 0.75rem; color: #888; font-size: 0.88rem; }
    .form-row { display: flex; gap: 1rem; }
    .two-cols > * { flex: 1; }
    .full-width { width: 100%; }
    .step-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #f0f0f0; }
    .confirm-step { padding: 1rem 0; }
    .confirm-step h3 { display: flex; align-items: center; gap: 0.5rem; font-size: 1rem; font-weight: 600; color: #1a237e; margin: 0 0 1.5rem; }
    .confirm-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem; }
    .confirm-section h4 { margin: 0 0 0.5rem; font-size: 0.88rem; text-transform: uppercase; color: #888; letter-spacing: 0.5px; }
    .confirm-section p { margin: 0.15rem 0; font-size: 0.9rem; color: #444; }
    .confirm-booking-summary { background: #e8eaf6; border-radius: 10px; padding: 1rem 1.25rem; margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem; }
    .confirm-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; color: #333; }
    .confirm-row mat-icon { color: #3949ab; font-size: 18px; width: 18px; height: 18px; }
    .total-highlight { font-size: 1rem; font-weight: 600; color: #1a237e; }
  `]
})
export class BookingComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly hotelService = inject(HotelService);
  private readonly roomService = inject(RoomService);
  private readonly reservationService = inject(ReservationService);
  private readonly notification = inject(NotificationService);

  hotel = signal<Hotel | undefined>(undefined);
  room = signal<Room | undefined>(undefined);
  submitting = signal(false);

  checkIn = '';
  checkOut = '';

  readonly maxBirthDate = new Date(new Date().getFullYear() - 18, new Date().getMonth(), new Date().getDate());

  nights = computed(() => {
    if (!this.checkIn || !this.checkOut) return 1;
    const start = new Date(this.checkIn);
    const end = new Date(this.checkOut);
    return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000));
  });

  guestForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(5)]],
    birthDate: [null as Date | null, Validators.required],
    gender: ['', Validators.required],
    documentType: ['', Validators.required],
    documentNumber: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
  });

  emergencyForm = this.fb.group({
    fullName: ['', Validators.required],
    phone: ['', Validators.required],
  });

  ngOnInit(): void {
    const qp = this.route.snapshot.queryParams;
    this.checkIn = qp['checkIn'] ?? '';
    this.checkOut = qp['checkOut'] ?? '';
    const hotelId = qp['hotelId'] ?? '';
    const roomId = qp['roomId'] ?? '';
    const loadData = () => {
      this.hotel.set(this.hotelService.getHotelById(hotelId));
      this.room.set(this.roomService.getRoomById(roomId));
    };
    const needHotels = this.hotelService.hotels().length === 0;
    const needRooms = this.roomService.rooms().length === 0;
    let pending = (needHotels ? 1 : 0) + (needRooms ? 1 : 0);
    if (pending === 0) { loadData(); return; }
    const done = () => { if (--pending === 0) loadData(); };
    if (needHotels) this.hotelService.loadHotels().subscribe({ next: done, error: done });
    if (needRooms) this.roomService.loadRooms().subscribe({ next: done, error: done });
  }

  confirmBooking(): void {
    if (this.guestForm.invalid || this.emergencyForm.invalid) return;
    const hotel = this.hotel();
    const room = this.room();
    if (!hotel || !room) {
      this.notification.error('No se pudieron cargar los datos de la reserva');
      return;
    }
    this.submitting.set(true);
    const guestValues = this.guestForm.getRawValue();
    const emergencyValues = this.emergencyForm.getRawValue();
    const dto = {
      hotelId: hotel.id,
      hotelName: hotel.name,
      roomId: room.id,
      roomType: room.type,
      checkIn: this.checkIn || new Date().toISOString().split('T')[0],
      checkOut: this.checkOut || new Date(Date.now() + 86400000).toISOString().split('T')[0],
      guest: {
        ...guestValues,
        birthDate: guestValues.birthDate
          ? (guestValues.birthDate as Date).toISOString().split('T')[0]
          : '',
      } as any,
      emergencyContact: emergencyValues as any,
      baseCost: room.baseCost,
      taxes: room.baseCost * room.taxRate / 100,
    };
    this.reservationService.createReservation(dto).subscribe({
      next: (reservation) => {
        this.notification.success('¡Reserva confirmada exitosamente!');
        this.router.navigate(['/traveler/booking/confirmation'], {
          queryParams: { reservationId: reservation.id }
        });
      },
      error: () => {
        this.notification.error('Error al procesar la reserva. Intenta nuevamente.');
        this.submitting.set(false);
      }
    });
  }

  goBack(): void {
    const qp = this.route.snapshot.queryParams;
    if (qp['hotelId']) {
      this.router.navigate(['/traveler/hotels', qp['hotelId']]);
    } else {
      this.router.navigate(['/traveler/search']);
    }
  }

  getRoomTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      single: 'Individual', double: 'Doble', suite: 'Suite', family: 'Familiar', penthouse: 'Penthouse'
    };
    return labels[type] ?? type;
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'https://placehold.co/300x150?text=Hab';
  }
}
