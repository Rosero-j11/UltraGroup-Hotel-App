import { Routes } from '@angular/router';
import { TravelerLayoutComponent } from '../../layouts/traveler-layout/traveler-layout.component';

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
