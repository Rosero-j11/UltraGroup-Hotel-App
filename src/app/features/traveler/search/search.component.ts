import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { HotelService } from '../../../core/services/hotel.service';
import { RoomService } from '../../../core/services/room.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StarRatingComponent } from '../../../shared/components/star-rating/star-rating.component';
import { CopCurrencyPipe } from '../../../shared/pipes/cop-currency.pipe';
import { Hotel } from '../../../core/models';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule,
    MatSelectModule, MatCardModule, MatDatepickerModule, MatNativeDateModule,
    LoadingSpinnerComponent, StarRatingComponent, CopCurrencyPipe
  ],
  template: `
    <div class="search-wrapper">
      <!-- Hero banner -->
      <div class="hero-banner">
        <div class="hero-content">
          <h1>Encuentra tu hotel ideal</h1>
          <p>Descubre los mejores hoteles con las mejores tarifas en toda Colombia</p>

          <mat-card class="search-card">
            <form [formGroup]="searchForm" (ngSubmit)="onSearch()" class="search-form">
              <mat-form-field appearance="outline" class="search-field">
                <mat-label>Ciudad destino</mat-label>
                <mat-icon matPrefix>location_city</mat-icon>
                <mat-select formControlName="city">
                  @for (city of availableCities(); track city) {
                    <mat-option [value]="city">{{ city }}</mat-option>
                  }
                </mat-select>
                @if (searchForm.get('city')?.invalid && searchForm.get('city')?.touched) {
                  <mat-error>Selecciona una ciudad</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="search-field">
                <mat-label>Check-in</mat-label>
                <mat-icon matPrefix>event</mat-icon>
                <input matInput [matDatepicker]="pickerIn" formControlName="checkIn"
                       [min]="today" readonly (click)="pickerIn.open()" style="cursor:pointer" />
                <mat-datepicker-toggle matSuffix [for]="pickerIn"></mat-datepicker-toggle>
                <mat-datepicker #pickerIn></mat-datepicker>
                @if (searchForm.get('checkIn')?.invalid && searchForm.get('checkIn')?.touched) {
                  <mat-error>Selecciona fecha de entrada</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="search-field">
                <mat-label>Check-out (opcional)</mat-label>
                <mat-icon matPrefix>event_available</mat-icon>
                <input matInput [matDatepicker]="pickerOut" formControlName="checkOut"
                       [min]="minCheckOut()" readonly (click)="pickerOut.open()" style="cursor:pointer" />
                <mat-datepicker-toggle matSuffix [for]="pickerOut"></mat-datepicker-toggle>
                <mat-datepicker #pickerOut></mat-datepicker>
              </mat-form-field>

              <mat-form-field appearance="outline" class="search-field guests-field">
                <mat-label>Huéspedes</mat-label>
                <mat-icon matPrefix>person</mat-icon>
                <mat-select formControlName="guests">
                  @for (n of guestOptions(); track n) {
                    <mat-option [value]="n">{{ n }} huésped{{ n > 1 ? 'es' : '' }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <button mat-flat-button color="accent" type="submit"
                      class="search-btn" [disabled]="searchForm.invalid || loading()">
                <mat-icon>search</mat-icon>
                Buscar hoteles
              </button>
            </form>
          </mat-card>
        </div>
      </div>

      <!-- Results -->
      <div class="results-section">
        <app-loading-spinner [visible]="loading()" [inline]="true" message="Buscando hoteles disponibles..." />

        @if (searched() && !loading()) {
          <div class="results-header">
            <h2>
              @if (searchResults().length > 0) {
                {{ searchResults().length }} hotel(es) disponible(s) en {{ currentCity() }}
              } @else {
                Sin resultados para {{ currentCity() }}
              }
            </h2>
          </div>

          @if (searchResults().length === 0) {
            <div class="no-results">
              <mat-icon>search_off</mat-icon>
              <h3>No encontramos hoteles disponibles</h3>
              <p>No hay hoteles activos en <strong>{{ currentCity() }}</strong>. Prueba con otra ciudad.</p>
            </div>
          } @else {
            <div class="hotels-grid">
              @for (hotel of searchResults(); track hotel.id) {
                <mat-card class="hotel-result-card" (click)="goToHotel(hotel)">
                  <div class="hotel-img-wrap">
                    <img [src]="hotel.imageUrl" [alt]="hotel.name" class="hotel-img"
                         (error)="onImageError($event)" />
                    <div class="hotel-stars-overlay">
                      <app-star-rating [stars]="hotel.stars" />
                    </div>
                  </div>
                  <mat-card-content class="hotel-result-content">
                    <h3 class="hotel-result-name">{{ hotel.name }}</h3>
                    <p class="hotel-result-location">
                      <mat-icon>location_on</mat-icon>
                      {{ hotel.city }} · {{ hotel.address }}
                    </p>
                    <p class="hotel-result-desc">{{ hotel.description }}</p>
                    <div class="hotel-result-footer">
                      <div class="price-info">
                        <span class="price-from">Desde</span>
                        <span class="price-value">{{ getMinPrice(hotel.id) | copCurrency }}</span>
                        <span class="price-night">/noche</span>
                      </div>
                      <button class="reserve-btn" mat-flat-button (click)="goToHotel(hotel); $event.stopPropagation()">
                        Ver habitaciones
                      </button>
                    </div>
                  </mat-card-content>
                </mat-card>
              }
            </div>
          }
        }

        @if (!searched() && !loading()) {
          <div class="welcome-section">
            <div class="features-grid">
              <div class="feature-item">
                <div class="feature-icon-wrap"><mat-icon>verified</mat-icon></div>
                <h3>Hoteles verificados</h3>
                <p>Todos nuestros hoteles pasan por un riguroso proceso de verificación</p>
              </div>
              <div class="feature-item">
                <div class="feature-icon-wrap"><mat-icon>price_check</mat-icon></div>
                <h3>Mejor precio</h3>
                <p>Garantizamos las mejores tarifas sin cargos adicionales</p>
              </div>
              <div class="feature-item">
                <div class="feature-icon-wrap"><mat-icon>support_agent</mat-icon></div>
                <h3>Soporte 24/7</h3>
                <p>Nuestro equipo está disponible en todo momento para ayudarte</p>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    /* ── MOBILE FIRST ── */

    /* Base: mobile  < 600px */
    .search-wrapper { min-height: calc(100vh - 128px); background: #F7FAFC; }

    .hero-banner {
      background: linear-gradient(160deg, #1A365D 0%, #2a4a7f 70%, #1A365D 100%);
      padding: 2rem 1rem;
      color: white;
    }
    .hero-content { max-width: 1100px; margin: 0 auto; }
    .hero-content h1 {
      font-size: 1.75rem;
      font-weight: 700;
      margin: 0 0 0.4rem;
      color: #FFFFFF;
      line-height: 1.2;
    }
    .hero-content > p {
      font-size: 0.95rem;
      color: rgba(255,255,255,0.8);
      margin: 0 0 1.25rem;
    }
    .search-card { border-radius: 14px !important; padding: 1rem; }
    .search-form {
      display: flex;
      flex-direction: column;
      gap: 0;
    }
    .search-field { width: 100%; }
    .guests-field { width: 100%; }
    .search-btn {
      width: 100%;
      height: 48px;
      font-size: 1rem;
      font-weight: 600;
      background-color: #E07A5F !important;
      color: #FFFFFF !important;
      margin-top: 0.25rem;
    }
    .search-btn:hover { background-color: #c9664b !important; }

    .results-section { max-width: 1100px; margin: 1.5rem auto; padding: 0 0.75rem; }
    .results-header h2 { font-size: 1.1rem; color: #1A365D; font-weight: 600; margin-bottom: 1rem; }

    .no-results { text-align: center; padding: 2.5rem 1rem; }
    .no-results mat-icon { font-size: 4rem; width: 4rem; height: 4rem; color: #ccc; }
    .no-results h3 { color: #2D3748; font-size: 1.1rem; font-weight: 600; }
    .no-results p { color: #718096; font-size: 0.9rem; }

    .hotels-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
    }
    .hotel-result-card {
      cursor: pointer;
      overflow: hidden;
      transition: box-shadow 0.25s, transform 0.2s;
      border-radius: 12px !important;
    }
    .hotel-result-card:active { transform: scale(0.98); }
    .hotel-img-wrap { position: relative; height: 180px; overflow: hidden; }
    .hotel-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
    .hotel-stars-overlay {
      position: absolute; bottom: 8px; left: 8px;
      background: rgba(0,0,0,0.52); padding: 4px 8px; border-radius: 20px;
    }
    .hotel-result-content { padding: 1rem !important; background: #FFFFFF; }
    .hotel-result-name { font-size: 1rem; font-weight: 700; margin: 0 0 0.35rem; color: #1A365D; }
    .hotel-result-location {
      display: flex; align-items: center; gap: 4px;
      margin: 0 0 0.4rem; font-size: 0.82rem; color: #718096;
    }
    .hotel-result-location mat-icon { font-size: 15px; width: 15px; height: 15px; color: #E07A5F; }
    .hotel-result-desc {
      font-size: 0.82rem; color: #718096; margin: 0 0 0.75rem;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }
    .hotel-result-footer { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; }
    .price-info { display: flex; align-items: baseline; gap: 3px; }
    .price-from { font-size: 0.76rem; color: #718096; }
    .price-value { font-size: 1.15rem; font-weight: 700; color: #C9A227; }
    .price-night { font-size: 0.76rem; color: #718096; }
    .reserve-btn {
      background-color: #E07A5F !important;
      color: #FFFFFF !important;
      font-weight: 600 !important;
      font-size: 0.85rem !important;
      border-radius: 8px !important;
    }

    .welcome-section { padding: 1.5rem 0; }
    .features-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
    }
    .feature-item {
      text-align: center;
      padding: 1.75rem 1.25rem;
      background: #FFFFFF;
      border-radius: 14px;
      box-shadow: 0 2px 12px rgba(26,54,93,0.07);
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .feature-icon-wrap {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #E6FFFA;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
    }
    .feature-item mat-icon { font-size: 1.75rem; width: 1.75rem; height: 1.75rem; color: #1A365D; }
    .feature-item h3 { margin: 0 0 0.4rem; color: #1A365D; font-size: 1rem; font-weight: 700; }
    .feature-item p { color: #718096; font-size: 0.875rem; margin: 0; line-height: 1.5; }

    /* ── Tablet  >= 600px ── */
    @media (min-width: 600px) {
      .hero-banner { padding: 3rem 1.5rem; }
      .hero-content h1 { font-size: 2.2rem; }
      .hero-content > p { font-size: 1rem; margin-bottom: 1.75rem; }
      .search-form { flex-direction: row; flex-wrap: wrap; gap: 0.5rem; align-items: flex-start; }
      .search-field { flex: 1; min-width: 180px; width: auto; }
      .guests-field { max-width: 160px; width: auto; }
      .search-btn { width: auto; min-width: 160px; height: 56px; margin-top: 4px; }
      .hotels-grid { grid-template-columns: repeat(2, 1fr); gap: 1.25rem; }
      .features-grid { grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
    }

    /* ── Desktop >= 960px ── */
    @media (min-width: 960px) {
      .hero-banner { padding: 4rem 2rem; }
      .hero-content h1 { font-size: 2.8rem; letter-spacing: -0.5px; }
      .hero-content > p { font-size: 1.1rem; margin-bottom: 2rem; }
      .search-card { padding: 1.25rem; }
      .search-form { gap: 0.75rem; }
      .results-section { padding: 0 1rem; }
      .results-header h2 { font-size: 1.3rem; margin-bottom: 1.5rem; }
      .hotels-grid { grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
      .hotel-result-card:hover { box-shadow: 0 10px 28px rgba(26,54,93,0.18) !important; transform: translateY(-4px); }
      .hotel-result-card:hover .hotel-img { transform: scale(1.04); }
      .hotel-img-wrap { height: 200px; }
      .features-grid { max-width: 900px; margin: 0 auto; gap: 2rem; }
      .feature-item { padding: 2.5rem 2rem; }
    }
  `]
})
export class SearchComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly hotelService = inject(HotelService);
  private readonly roomService = inject(RoomService);
  private readonly notification = inject(NotificationService);

  readonly loading = this.hotelService.loading;
  // Lee la señal hotels() directamente para reactividad garantizada
  readonly availableCities = computed(() => {
    const hotels = this.hotelService.hotels(); // <-- dependencia reactiva explícita
    const cities = hotels.filter(h => h.status === 'active').map(h => h.city);
    return [...new Set(cities)].sort();
  });
  readonly today = new Date();

  searched = signal(false);
  currentCity = signal('');
  searchResults = signal<Hotel[]>([]);

  // Signal reactivo que espeja el valor del form control checkIn
  readonly checkInValue = signal<Date | null>(null);

  readonly maxGuests = computed(() => {
    const rooms = this.roomService.rooms().filter(r => r.status === 'active');
    return rooms.length > 0 ? Math.max(...rooms.map(r => r.capacity)) : 6;
  });
  readonly guestOptions = computed(() => Array.from({ length: this.maxGuests() }, (_, i) => i + 1));

  searchForm = this.fb.group({
    city: ['', Validators.required],
    checkIn: [null as Date | null, Validators.required],
    checkOut: [null as Date | null],
    guests: [1],
  });

  // computed reactivo: se recalcula automáticamente cuando checkInValue() cambia
  readonly minCheckOut = computed(() => {
    const checkIn = this.checkInValue();
    const base = checkIn ? new Date(checkIn) : new Date(this.today);
    base.setDate(base.getDate() + 1);
    return base;
  });

  ngOnInit(): void {
    // Los servicios ya cargan datos en su constructor automáticamente.
    // Si por alguna razón aún no tienen datos (ej: error previo), reintenta.
    if (this.hotelService.hotels().length === 0 && !this.hotelService.loading()) {
      this.hotelService.loadHotels().subscribe();
    }
    if (this.roomService.rooms().length === 0 && !this.roomService.loading()) {
      this.roomService.loadRooms().subscribe();
    }

    // Sincronizar el signal reactivo con el form control para que minCheckOut funcione
    this.searchForm.get('checkIn')!.valueChanges.subscribe((checkIn: Date | null) => {
      this.checkInValue.set(checkIn);
      // Si checkOut ya fue seleccionado y queda igual o antes del nuevo checkIn, lo borra
      const checkOut = this.searchForm.get('checkOut')?.value as Date | null;
      if (checkOut && checkIn && checkOut <= checkIn) {
        this.searchForm.get('checkOut')?.reset(null, { emitEvent: false });
      }
    });
  }

  onSearch(): void {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }
    const { city } = this.searchForm.getRawValue();
    this.currentCity.set(city ?? '');
    const results = this.hotelService.getHotelsByCity(city ?? '');
    this.searchResults.set(results);
    this.searched.set(true);
  }

  goToHotel(hotel: Hotel): void {
    const form = this.searchForm.getRawValue();
    this.router.navigate(['/traveler/hotels', hotel.id], {
      queryParams: {
        checkIn: form.checkIn ? (form.checkIn as Date).toISOString().split('T')[0] : null,
        checkOut: form.checkOut ? (form.checkOut as Date).toISOString().split('T')[0] : null,
        guests: form.guests,
      }
    });
  }

  getMinPrice(hotelId: string): number {
    const rooms = this.roomService.getActiveRoomsByHotel(hotelId);
    if (rooms.length === 0) return 0;
    return Math.min(...rooms.map(r => r.baseCost * (1 + r.taxRate / 100)));
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Hotel';
  }
}
