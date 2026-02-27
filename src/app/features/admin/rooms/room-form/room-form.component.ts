import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { RoomService } from '../../../../core/services/room.service';
import { HotelService } from '../../../../core/services/hotel.service';
import { NotificationService } from '../../../../core/services/notification.service';


@Component({
  selector: 'app-room-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatSelectModule, MatCardModule, MatDividerModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <button mat-icon-button routerLink="/admin/rooms">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div class="page-title">
          <h1>{{ isEditing() ? 'Editar Habitación' : 'Nueva Habitación' }}</h1>
          <p>{{ isEditing() ? 'Modifica los datos de la habitación' : 'Registra una nueva habitación' }}</p>
        </div>
      </div>

      <mat-card class="form-card">
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="room-form">

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Hotel</mat-label>
                <mat-icon matPrefix>hotel</mat-icon>
                <mat-select formControlName="hotelId">
                  @for (hotel of hotels(); track hotel.id) {
                    <mat-option [value]="hotel.id">{{ hotel.name }} — {{ hotel.city }}</mat-option>
                  }
                </mat-select>
                @if (form.get('hotelId')?.invalid && form.get('hotelId')?.touched) {
                  <mat-error>Selecciona el hotel</mat-error>
                }
              </mat-form-field>
            </div>

            <div class="form-row two-columns">
              <mat-form-field appearance="outline">
                <mat-label>Tipo de habitación</mat-label>
                <mat-icon matPrefix>bed</mat-icon>
                <mat-select formControlName="type">
                  <mat-option value="single">Individual</mat-option>
                  <mat-option value="double">Doble</mat-option>
                  <mat-option value="suite">Suite</mat-option>
                  <mat-option value="family">Familiar</mat-option>
                  <mat-option value="penthouse">Penthouse</mat-option>
                </mat-select>
                @if (form.get('type')?.invalid && form.get('type')?.touched) {
                  <mat-error>El tipo de habitación es obligatorio</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Capacidad (personas)</mat-label>
                <mat-icon matPrefix>person</mat-icon>
                <input matInput type="number" formControlName="capacity" min="1" max="20" />
                @if (form.get('capacity')?.invalid && form.get('capacity')?.touched) {
                  <mat-error>Capacidad: entre 1 y 20</mat-error>
                }
              </mat-form-field>
            </div>

            <div class="form-row two-columns">
              <mat-form-field appearance="outline">
                <mat-label>Costo base (COP)</mat-label>
                <mat-icon matPrefix>attach_money</mat-icon>
                <input matInput type="number" formControlName="baseCost" min="0" />
                <mat-hint>Sin incluir impuestos</mat-hint>
                @if (form.get('baseCost')?.invalid && form.get('baseCost')?.touched) {
                  <mat-error>El costo base es obligatorio y debe ser mayor a 0</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>IVA / Impuestos (%)</mat-label>
                <mat-icon matPrefix>percent</mat-icon>
                <input matInput type="number" formControlName="taxRate" min="0" max="100" />
                <mat-hint>Porcentaje de impuesto (ej: 19)</mat-hint>
                @if (form.get('taxRate')?.invalid && form.get('taxRate')?.touched) {
                  <mat-error>Ingresa un porcentaje entre 0 y 100</mat-error>
                }
              </mat-form-field>
            </div>

            @if (totalCost() > 0) {
              <div class="total-preview">
                <mat-icon>calculate</mat-icon>
                <span>Total por noche: <strong>{{ totalCostFormatted() }}</strong>
                  &nbsp;<small style="opacity:0.75">(base + {{ form.get('taxRate')?.value ?? 0 }}% IVA)</small></span>
              </div>
            }

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Ubicación dentro del hotel</mat-label>
                <mat-icon matPrefix>place</mat-icon>
                <input matInput formControlName="location" placeholder="Ej: Piso 5, ala norte" />
                @if (form.get('location')?.invalid && form.get('location')?.touched) {
                  <mat-error>La ubicación es obligatoria</mat-error>
                }
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>URL de imagen (opcional)</mat-label>
                <mat-icon matPrefix>link</mat-icon>
                <input matInput formControlName="imageUrl" placeholder="https://..." />
                <mat-hint>Pega una URL o carga desde tu dispositivo</mat-hint>
              </mat-form-field>
            </div>
            <div class="form-row">
              <input #roomFileInput type="file" accept="image/*" style="display:none"
                     (change)="onFileSelected($event)" />
              <button mat-stroked-button type="button" (click)="roomFileInput.click()" style="gap:0.4rem">
                <mat-icon>upload_file</mat-icon>
                Cargar imagen desde dispositivo
              </button>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Descripción</mat-label>
                <mat-icon matPrefix>description</mat-icon>
                <textarea matInput formControlName="description" rows="3"
                  placeholder="Describe las características, amenidades y detalles de la habitación...">
                </textarea>
                @if (form.get('description')?.invalid && form.get('description')?.touched) {
                  <mat-error>La descripción es obligatoria</mat-error>
                }
              </mat-form-field>
            </div>

            <mat-divider></mat-divider>

            <div class="form-actions">
              <button mat-stroked-button type="button" routerLink="/admin/rooms">Cancelar</button>
              <button mat-flat-button color="primary" type="submit"
                [disabled]="form.invalid || submitting()">
                <mat-icon>{{ isEditing() ? 'save' : 'add' }}</mat-icon>
                {{ isEditing() ? 'Guardar cambios' : 'Crear habitación' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container { max-width: 720px; margin: 0 auto; }
    .page-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; }
    .page-title h1 { margin: 0; font-size: 1.4rem; font-weight: 600; }
    .page-title p { margin: 0; color: #666; font-size: 0.9rem; }
    .form-card { padding: 1rem; }
    .room-form { display: flex; flex-direction: column; gap: 0.5rem; padding: 1rem 0; }
    .form-row { display: flex; gap: 1rem; }
    .two-columns > * { flex: 1; }
    .full-width { width: 100%; }
    .total-preview {
      display: flex; align-items: center; gap: 0.5rem;
      padding: 0.75rem 1rem; background: #e8f5e9; border-radius: 8px;
      color: #2e7d32; font-size: 0.9rem;
    }
    .total-preview mat-icon { color: #2e7d32; }
    mat-divider { margin: 1rem 0; }
    .form-actions { display: flex; justify-content: flex-end; gap: 1rem; }
  `]
})
export class RoomFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly roomService = inject(RoomService);
  private readonly hotelService = inject(HotelService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notification = inject(NotificationService);

  isEditing = signal(false);
  submitting = signal(false);
  readonly hotels = this.hotelService.hotels;
  private roomId: string | null = null;

  form = this.fb.group({
    hotelId: ['', Validators.required],
    type: ['', Validators.required],
    capacity: [1, [Validators.required, Validators.min(1), Validators.max(20)]],
    baseCost: [null as (number | null), [Validators.required, Validators.min(1)]],
    taxRate: [null as (number | null), [Validators.required, Validators.min(0), Validators.max(100)]],
    location: ['', Validators.required],
    imageUrl: [''],
    description: ['', Validators.required],
  });

  totalCost = signal(0);

  totalCostFormatted(): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', minimumFractionDigits: 0
    }).format(this.totalCost());
  }

  ngOnInit(): void {
    if (this.hotelService.hotels().length === 0) {
      this.hotelService.loadHotels().subscribe();
    }
    const preselectedHotelId = this.route.snapshot.queryParamMap.get('hotelId');
    if (preselectedHotelId) {
      this.form.patchValue({ hotelId: preselectedHotelId });
    }
    this.roomId = this.route.snapshot.paramMap.get('id');
    if (this.roomId) {
      this.isEditing.set(true);
      const loadRoom = () => {
        const room = this.roomService.getRoomById(this.roomId!);
        if (room) this.form.patchValue(room);
      };
      if (this.roomService.rooms().length === 0) {
        this.roomService.loadRooms().subscribe({ next: loadRoom });
      } else {
        loadRoom();
      }
    }
    this.form.valueChanges.subscribe(() => {
      const base = Number(this.form.get('baseCost')?.value) || 0;
      const taxRate = Number(this.form.get('taxRate')?.value) || 0;
      this.totalCost.set(base * (1 + taxRate / 100));
    });
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.form.patchValue({ imageUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    const value = this.form.getRawValue();
    if (this.isEditing() && this.roomId) {
      this.roomService.updateRoom({ id: this.roomId, ...value } as any).subscribe({
        next: () => {
          this.notification.success('Habitación actualizada correctamente');
          this.router.navigate(['/admin/rooms']);
        },
        error: () => {
          this.notification.error('Error al actualizar la habitación');
          this.submitting.set(false);
        }
      });
    } else {
      this.roomService.createRoom(value as any).subscribe({
        next: () => {
          this.notification.success('Habitación creada correctamente');
          this.router.navigate(['/admin/rooms']);
        },
        error: () => {
          this.notification.error('Error al crear la habitación');
          this.submitting.set(false);
        }
      });
    }
  }
}
