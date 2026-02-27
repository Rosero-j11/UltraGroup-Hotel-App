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
import { HotelService } from '../../../../core/services/hotel.service';
import { NotificationService } from '../../../../core/services/notification.service';


@Component({
  selector: 'app-hotel-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatSelectModule, MatCardModule, MatDividerModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <button mat-icon-button routerLink="/admin/hotels">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div class="page-title">
          <h1>{{ isEditing() ? 'Editar Hotel' : 'Nuevo Hotel' }}</h1>
          <p>{{ isEditing() ? 'Modifica los datos del hotel' : 'Completa los datos para registrar un nuevo hotel' }}</p>
        </div>
      </div>

      <mat-card class="form-card">
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="hotel-form">
            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Nombre del hotel</mat-label>
                <mat-icon matPrefix>hotel</mat-icon>
                <input matInput formControlName="name" placeholder="Ej: Hotel Gran Reserva" />
                @if (form.get('name')?.invalid && form.get('name')?.touched) {
                  <mat-error>El nombre es obligatorio (mín. 3 caracteres)</mat-error>
                }
              </mat-form-field>
            </div>

            <div class="form-row two-columns">
              <mat-form-field appearance="outline">
                <mat-label>Ciudad</mat-label>
                <mat-icon matPrefix>location_city</mat-icon>
                <input matInput formControlName="city" placeholder="Ej: Bogotá" />
                @if (form.get('city')?.invalid && form.get('city')?.touched) {
                  <mat-error>La ciudad es obligatoria</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Categoría (estrellas)</mat-label>
                <mat-icon matPrefix>star</mat-icon>
                <mat-select formControlName="stars">
                  @for (star of [1,2,3,4,5]; track star) {
                    <mat-option [value]="star">{{ star }} estrella{{ star > 1 ? 's' : '' }}</mat-option>
                  }
                </mat-select>
                @if (form.get('stars')?.invalid && form.get('stars')?.touched) {
                  <mat-error>Selecciona la categoría</mat-error>
                }
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Dirección</mat-label>
                <mat-icon matPrefix>place</mat-icon>
                <input matInput formControlName="address" placeholder="Ej: Cra 7 # 32-16, Chapinero" />
                @if (form.get('address')?.invalid && form.get('address')?.touched) {
                  <mat-error>La dirección es obligatoria</mat-error>
                }
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>URL de imagen (opcional)</mat-label>
                <mat-icon matPrefix>link</mat-icon>
                <input matInput formControlName="imageUrl" placeholder="https://..." />
                <mat-hint>URL de imagen o carga desde tu dispositivo</mat-hint>
              </mat-form-field>
            </div>
            <div class="form-row">
              <input #hotelFileInput type="file" accept="image/*" style="display:none"
                     (change)="onFileSelected($event)" />
              <button mat-stroked-button type="button" (click)="hotelFileInput.click()" style="gap:0.4rem">
                <mat-icon>upload_file</mat-icon>
                Cargar imagen desde dispositivo
              </button>
            </div>

            @if (imagePreview()) {
              <div class="image-preview">
                <img [src]="imagePreview()" alt="Vista previa" (error)="clearImagePreview()" />
              </div>
            }

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Descripción</mat-label>
                <mat-icon matPrefix>description</mat-icon>
                <textarea matInput formControlName="description" rows="4"
                  placeholder="Descripción del hotel, servicios, características...">
                </textarea>
                @if (form.get('description')?.invalid && form.get('description')?.touched) {
                  <mat-error>La descripción es obligatoria</mat-error>
                }
              </mat-form-field>
            </div>

            <mat-divider></mat-divider>

            <div class="form-actions">
              <button mat-stroked-button type="button" routerLink="/admin/hotels">
                Cancelar
              </button>
              <button mat-flat-button color="primary" type="submit"
                [disabled]="form.invalid || submitting()">
                @if (submitting()) {
                  <mat-icon>hourglass_empty</mat-icon>
                } @else {
                  <mat-icon>{{ isEditing() ? 'save' : 'add' }}</mat-icon>
                }
                {{ isEditing() ? 'Guardar cambios' : 'Crear hotel' }}
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
    .hotel-form { display: flex; flex-direction: column; gap: 0.5rem; padding: 1rem 0; }
    .form-row { display: flex; gap: 1rem; }
    .two-columns > * { flex: 1; }
    .full-width { width: 100%; }
    .image-preview {
      border-radius: 8px;
      overflow: hidden;
      height: 180px;
      margin: 0.5rem 0;
    }
    .image-preview img { width: 100%; height: 100%; object-fit: cover; }
    mat-divider { margin: 1rem 0; }
    .form-actions { display: flex; justify-content: flex-end; gap: 1rem; padding-top: 0.5rem; }
  `]
})
/**
 * Formulario reactivo reutilizable para creación y edición de hoteles.
 *
 * ## Modo edición vs creación
 * El modo se determina en `ngOnInit()` verificando si la URL contiene el parámetro `:id`.
 * Si existe, se carga el hotel con `getHotelById(id)` y se precargan los valores
 * con `form.patchValue(hotel)`. El signal `isEditing()` controla los textos del template.
 *
 * ## Prevención de doble envío
 * `submitting` signal actúa como guard al inicio de `onSubmit()`: si ya hay una
 * solicitud en curso, el método retorna inmediatamente sin crear duplicados.
 *
 * ## Carga de imagen
 * Soporta URL externa y carga desde archivo local.
 * Al seleccionar un archivo, `FileReader.readAsDataURL()` convierte la imagen
 * a base64, que se almacena como `imageUrl`. En producción esto se reemplazaría
 * por una subida a S3/Cloudinary.
 */
export class HotelFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly hotelService = inject(HotelService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notification = inject(NotificationService);

  isEditing = signal(false);
  submitting = signal(false);
  imagePreview = signal<string>('');
  private hotelId: string | null = null;

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    city: ['', Validators.required],
    stars: [null as (number | null), Validators.required],
    address: ['', Validators.required],
    imageUrl: [''],
    description: ['', Validators.required],
  });

  ngOnInit(): void {
    this.hotelId = this.route.snapshot.paramMap.get('id');
    if (this.hotelId) {
      this.isEditing.set(true);
      const hotel = this.hotelService.getHotelById(this.hotelId);
      if (hotel) {
        this.form.patchValue(hotel);
        this.imagePreview.set(hotel.imageUrl);
      } else {
        this.hotelService.loadHotels().subscribe(() => {
          const h = this.hotelService.getHotelById(this.hotelId!);
          if (h) {
            this.form.patchValue(h);
            this.imagePreview.set(h.imageUrl);
          } else {
            this.notification.error('Hotel no encontrado');
            this.router.navigate(['/admin/hotels']);
          }
        });
      }
    }
    this.form.get('imageUrl')?.valueChanges.subscribe(url => {
      this.imagePreview.set(url || '');
    });
  }

  /**
   * Valida el formulario y envía los datos al servicio.
   * - En modo edición: llama `updateHotel()` con el `id` del parámetro de ruta.
   * - En modo creación: llama `createHotel()` con los datos del formulario.
   * - Guard de doble envío: retorna si `submitting()` es `true`.
   */
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.submitting()) return; // evitar doble envío
    this.submitting.set(true);
    const value = this.form.getRawValue();

    if (this.isEditing() && this.hotelId) {
      this.hotelService.updateHotel({ id: this.hotelId, ...value } as any).subscribe({
        next: () => {
          this.notification.success('Hotel actualizado correctamente');
          this.router.navigate(['/admin/hotels']);
        },
        error: () => {
          this.notification.error('Error al actualizar el hotel');
          this.submitting.set(false);
        }
      });
    } else {
      this.hotelService.createHotel(value as any).subscribe({
        next: () => {
          this.notification.success('Hotel creado correctamente');
          this.router.navigate(['/admin/hotels']);
        },
        error: () => {
          this.notification.error('Error al crear el hotel');
          this.submitting.set(false);
        }
      });
    }
  }

  /**
   * Convierte el archivo de imagen seleccionado a base64 usando `FileReader`
   * y actualiza el campo `imageUrl` del formulario + la previsualización.
   */
  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;
      this.form.patchValue({ imageUrl: b64 });
      this.imagePreview.set(b64);
    };
    reader.readAsDataURL(file);
  }

  clearImagePreview(): void {
    this.imagePreview.set('');
  }
}
