import { Routes } from '@angular/router';
import { TravelerLayoutComponent } from '../../layouts/traveler-layout/traveler-layout.component';

/**
 * Rutas del módulo del viajero (portal público de búsqueda y reserva).
 *
 * Usa `TravelerLayoutComponent` como layout (navbar + footer).
 *
 * ### Flujo del viajero
 * 1. `/traveler/search`             → Buscador de hoteles por ciudad/fechas/huéspedes
 * 2. `/traveler/hotels/:id`         → Detalle del hotel y sus habitaciones disponibles
 * 3. `/traveler/booking`            → Stepper de reserva (datos huésped + confirmación)
 * 4. `/traveler/booking/confirmation` → Pantalla de confirmación con resumen de la reserva
 */
export const TRAVELER_ROUTES: Routes = [
  {
    path: '',
    component: TravelerLayoutComponent,
    children: [
      { path: '', redirectTo: 'search', pathMatch: 'full' },
      {
        path: 'search',
        loadComponent: () =>
          import('../traveler/search/search.component').then(m => m.SearchComponent)
      },
      {
        path: 'hotels/:id',
        loadComponent: () =>
          import('../traveler/hotel-detail/hotel-detail.component').then(m => m.HotelDetailComponent)
      },
      {
        path: 'booking',
        loadComponent: () =>
          import('../traveler/booking/booking.component').then(m => m.BookingComponent)
      },
      {
        path: 'booking/confirmation',
        loadComponent: () =>
          import('../traveler/booking/booking-confirmation.component').then(m => m.BookingConfirmationComponent)
      },
    ]
  }
];
