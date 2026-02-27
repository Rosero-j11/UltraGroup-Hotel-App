import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { HotelService } from '../../../core/services/hotel.service';
import { RoomService } from '../../../core/services/room.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StarRatingComponent } from '../../../shared/components/star-rating/star-rating.component';
import { CopCurrencyPipe } from '../../../shared/pipes/cop-currency.pipe';
import { Hotel, Room } from '../../../core/models';

const ROOM_TYPE_LABELS: Record<string, string> = {
  single: 'Individual', double: 'Doble', suite: 'Suite', family: 'Familiar', penthouse: 'Penthouse'
};
const ROOM_ICONS: Record<string, string> = {
  single: 'single_bed', double: 'king_bed', suite: 'hotel_class', family: 'family_restroom', penthouse: 'roofing'
};

@Component({
  selector: 'app-hotel-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule, MatButtonModule, MatIconModule, MatDividerModule, MatChipsModule,
    LoadingSpinnerComponent, StarRatingComponent, CopCurrencyPipe
  ],
  template: `
    <div class="detail-wrapper">
      <app-loading-spinner [visible]="loading()" message="Cargando hotel..." />

      @if (!loading() && hotel(); as h) {
        <!-- Hero -->
        <div class="hotel-hero" [style.background-image]="'url(' + h.imageUrl + ')'">
          <div class="hero-overlay">
            <div class="hero-content">
              <button mat-icon-button class="back-btn" (click)="goBack()">
                <mat-icon>arrow_back</mat-icon>
              </button>
              <div class="hero-info">
                <app-star-rating [stars]="h.stars" />
                <h1>{{ h.name }}</h1>
                <p class="hero-location">
                  <mat-icon>location_on</mat-icon>
                  {{ h.address }}, {{ h.city }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="content-area">
          <!-- About -->
          <mat-card class="about-card">
            <mat-card-content>
              <h2>Acerca del hotel</h2>
              <p>{{ h.description }}</p>
              <div class="hotel-meta">
                <span class="meta-chip"><mat-icon>location_city</mat-icon> {{ h.city }}</span>
                <span class="meta-chip"><mat-icon>star</mat-icon> {{ h.stars }} estrellas</span>
                <span class="meta-chip"><mat-icon>bed</mat-icon> {{ activeRooms().length }} habitación(es) disponible(s)</span>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Rooms -->
          <div class="rooms-section">
            <h2>Habitaciones disponibles</h2>
            @if (searchParams()) {
              <div class="search-context">
                <mat-icon>date_range</mat-icon>
                <span>
                  Check-in: <strong>{{ searchParams()!.checkIn }}</strong>
                  @if (searchParams()!.checkOut) {
                    · Check-out: <strong>{{ searchParams()!.checkOut }}</strong>
                  }
                  @if (searchParams()!.guests) {
                    · <strong>{{ searchParams()!.guests }}</strong> huésped(es)
                  }
                </span>
              </div>
            }

            @if (activeRooms().length === 0) {
              <mat-card class="empty-rooms">
                <mat-icon>bed</mat-icon>
                <p>No hay habitaciones disponibles en este momento</p>
              </mat-card>
            } @else {
              <div class="rooms-grid">
                @for (room of activeRooms(); track room.id) {
                  <mat-card class="room-card">
                    <div class="room-img-wrap">
                      <img [src]="room.imageUrl" [alt]="room.type" class="room-img"
                           (error)="onImageError($event)" />
                      <div class="room-type-tag">
                        <mat-icon>{{ getRoomIcon(room.type) }}</mat-icon>
                        {{ getRoomTypeLabel(room.type) }}
                      </div>
                    </div>
                    <mat-card-content class="room-content">
                      <h3>{{ getRoomTypeLabel(room.type) }}</h3>
                      <div class="room-meta">
                        <span><mat-icon>place</mat-icon> {{ room.location }}</span>
                        <span><mat-icon>person</mat-icon> {{ room.capacity }} persona(s)</span>
                      </div>
                      <p class="room-desc">{{ room.description }}</p>
                      <mat-divider></mat-divider>
                      <div class="room-pricing">
                        <div class="price-breakdown">
                          <div class="price-line"><span>Costo base:</span> <span>{{ room.baseCost | copCurrency }}</span></div>
                          <div class="price-line"><span>Impuestos (IVA {{ room.taxRate }}%):</span> <span>{{ (room.baseCost * room.taxRate / 100) | copCurrency }}</span></div>
                        </div>
                        <div class="total-price">
                          <span class="total-label">Total/noche</span>
                          <span class="total-amount">{{ (room.baseCost * (1 + room.taxRate / 100)) | copCurrency }}</span>
                        </div>
                      </div>
                    </mat-card-content>
                    <mat-card-actions class="room-actions">
                      <button mat-flat-button color="primary" (click)="bookRoom(room)">
                        <mat-icon>book_online</mat-icon>
                        Reservar esta habitación
                      </button>
                    </mat-card-actions>
                  </mat-card>
                }
              </div>
            }
          </div>
        </div>
      }

      @if (!loading() && !hotel()) {
        <div class="not-found">
          <mat-icon>hotel</mat-icon>
          <h2>Hotel no encontrado</h2>
          <button mat-flat-button color="primary" (click)="goBack()">Volver a buscar</button>
        </div>
      }
    </div>
  `,
  styles: [`
    /* ── MOBILE FIRST ── */
    .detail-wrapper { background: #F7FAFC; min-height: 100vh; }

    /* Hero - mobile base */
    .hotel-hero {
      height: 220px;
      background-size: cover;
      background-position: center;
      position: relative;
    }
    .hero-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.05) 100%);
      display: flex; align-items: flex-end;
    }
    .hero-content { padding: 1rem; width: 100%; max-width: 1100px; margin: 0 auto; }
    .back-btn { color: white; background: rgba(255,255,255,0.2) !important; margin-bottom: 0.5rem; }
    .hero-info {
      color: #ffffff;
      background: rgba(0,0,0,0.55);
      backdrop-filter: blur(3px);
      border-radius: 10px;
      padding: 0.75rem 1rem;
      display: inline-block;
      width: 100%;
      box-sizing: border-box;
    }
    .hero-info h1 { margin: 0.3rem 0 0.4rem; font-size: 1.35rem; font-weight: 800; line-height: 1.2; color: #ffffff !important; text-shadow: 0 2px 6px rgba(0,0,0,0.8), 0 1px 2px rgba(0,0,0,0.9); }
    .hero-location { display: flex; align-items: center; gap: 4px; margin: 0; font-size: 0.85rem; color: rgba(255,255,255,0.95) !important; text-shadow: 0 1px 4px rgba(0,0,0,0.8); }
    .hero-location mat-icon { font-size: 15px; width: 15px; height: 15px; color: #f0c060 !important; }

    /* Content */
    .content-area { max-width: 1100px; margin: 0 auto; padding: 1rem 0.75rem; }
    .about-card { margin-bottom: 1.25rem; }
    .about-card h2 { margin: 0 0 0.6rem; font-size: 1.1rem; font-weight: 700; color: #1A365D; }
    .about-card p { color: #2D3748; line-height: 1.6; font-size: 0.9rem; }
    .hotel-meta { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.75rem; }
    .meta-chip {
      display: flex; align-items: center; gap: 4px;
      background: #E6FFFA; color: #1A365D;
      padding: 4px 10px; border-radius: 20px; font-size: 0.8rem;
    }
    .meta-chip mat-icon { font-size: 14px; width: 14px; height: 14px; }

    /* Rooms */
    .rooms-section h2 { font-size: 1.1rem; font-weight: 700; color: #1A365D; margin-bottom: 0.75rem; }
    .search-context {
      display: flex; align-items: center; gap: 0.5rem;
      padding: 0.6rem 0.85rem; background: #fff8e1; border-radius: 8px;
      color: #5d4037; font-size: 0.83rem; margin-bottom: 1rem;
    }
    .search-context mat-icon { color: #f57f17; font-size: 18px; width: 18px; height: 18px; }
    .empty-rooms { text-align: center; padding: 2.5rem 1rem; display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
    .empty-rooms mat-icon { font-size: 3.5rem; width: 3.5rem; height: 3.5rem; color: #ccc; }

    .rooms-grid { display: grid; grid-template-columns: 1fr; gap: 1rem; }
    .room-card { overflow: hidden; border-radius: 12px !important; }
    .room-img-wrap { position: relative; height: 160px; overflow: hidden; }
    .room-img { width: 100%; height: 100%; object-fit: cover; }
    .room-type-tag {
      position: absolute; bottom: 8px; left: 8px;
      display: flex; align-items: center; gap: 4px;
      background: rgba(0,0,0,0.65); color: white;
      padding: 3px 10px; border-radius: 12px; font-size: 0.78rem;
    }
    .room-type-tag mat-icon { font-size: 14px; width: 14px; height: 14px; }
    .room-content { padding: 0.85rem !important; }
    .room-content h3 { margin: 0 0 0.4rem; font-size: 0.95rem; font-weight: 700; color: #1A365D; }
    .room-meta { display: flex; gap: 0.75rem; margin-bottom: 0.4rem; flex-wrap: wrap; }
    .room-meta span { display: flex; align-items: center; gap: 3px; font-size: 0.8rem; color: #718096; }
    .room-meta mat-icon { font-size: 14px; width: 14px; height: 14px; color: #1A365D; }
    .room-desc { font-size: 0.8rem; color: #718096; margin: 0.4rem 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    mat-divider { margin: 0.6rem 0; }
    .room-pricing { display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 0.5rem; }
    .price-breakdown { font-size: 0.78rem; color: #718096; }
    .price-line { display: flex; gap: 0.5rem; justify-content: space-between; min-width: 130px; }
    .total-price { text-align: right; }
    .total-label { display: block; font-size: 0.72rem; color: #718096; }
    .total-amount { font-size: 1.15rem; font-weight: 700; color: #C9A227; }
    .room-actions { padding: 0.6rem 0.85rem !important; }
    .room-actions button { width: 100%; background-color: #E07A5F !important; color: white !important; font-weight: 600 !important; }
    .not-found { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem 1rem; gap: 1rem; }
    .not-found mat-icon { font-size: 4rem; width: 4rem; height: 4rem; color: #ccc; }

    /* ── Tablet >= 600px ── */
    @media (min-width: 600px) {
      .hotel-hero { height: 300px; }
      .hero-content { padding: 1.5rem; }
      .hero-info h1 { font-size: 1.75rem; }
      .content-area { padding: 1.25rem 1rem; }
      .rooms-grid { grid-template-columns: repeat(2, 1fr); }
      .room-img-wrap { height: 175px; }
    }

    /* ── Desktop >= 960px ── */
    @media (min-width: 960px) {
      .hotel-hero { height: 380px; }
      .hero-content { padding: 2rem; }
      .hero-info h1 { font-size: 2.1rem; }
      .content-area { padding: 1.5rem 1rem; }
      .rooms-grid { grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
      .room-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.12); transform: translateY(-2px); }
      .room-img-wrap { height: 180px; }
    }
  `]
})
export class HotelDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly hotelService = inject(HotelService);
  private readonly roomService = inject(RoomService);
  private readonly notification = inject(NotificationService);

  readonly loading = signal(false);
  hotel = signal<Hotel | undefined>(undefined);
  hotelId = '';
  searchParams = signal<{ checkIn?: string; checkOut?: string; guests?: number } | null>(null);

  readonly activeRooms = computed(() =>
    this.roomService.getActiveRoomsByHotel(this.hotelId)
  );

  ngOnInit(): void {
    this.hotelId = this.route.snapshot.paramMap.get('id') ?? '';
    const qp = this.route.snapshot.queryParams;
    if (qp['checkIn']) {
      this.searchParams.set({
        checkIn: qp['checkIn'],
        checkOut: qp['checkOut'],
        guests: qp['guests'] ? Number(qp['guests']) : undefined,
      });
    }
    this.loading.set(true);
    const loadData = () => {
      this.hotel.set(this.hotelService.getHotelById(this.hotelId));
      this.loading.set(false);
    };
    const needHotels = this.hotelService.hotels().length === 0;
    const needRooms = this.roomService.rooms().length === 0;
    let pending = (needHotels ? 1 : 0) + (needRooms ? 1 : 0);
    if (pending === 0) { loadData(); return; }
    const done = () => { if (--pending === 0) loadData(); };
    if (needHotels) this.hotelService.loadHotels().subscribe({ next: done, error: done });
    if (needRooms) this.roomService.loadRooms().subscribe({ next: done, error: done });
  }

  bookRoom(room: Room): void {
    const sp = this.searchParams();
    this.router.navigate(['/traveler/booking'], {
      queryParams: {
        hotelId: this.hotelId,
        roomId: room.id,
        checkIn: sp?.checkIn,
        checkOut: sp?.checkOut,
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/traveler/search']);
  }

  getRoomTypeLabel(type: string): string {
    return ROOM_TYPE_LABELS[type] ?? type;
  }

  getRoomIcon(type: string): string {
    return ROOM_ICONS[type] ?? 'bed';
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=Hab';
  }
}
