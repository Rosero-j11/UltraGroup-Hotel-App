import { Routes } from '@angular/router';
import { AdminLayoutComponent } from '../../layouts/admin-layout/admin-layout.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'hotels', pathMatch: 'full' },
      {
        path: 'hotels',
        loadComponent: () =>
          import('../admin/hotels/hotel-list/hotel-list.component').then(m => m.HotelListComponent)
      },
      {
        path: 'hotels/new',
        loadComponent: () =>
          import('../admin/hotels/hotel-form/hotel-form.component').then(m => m.HotelFormComponent)
      },
      {
        path: 'hotels/:id/edit',
        loadComponent: () =>
          import('../admin/hotels/hotel-form/hotel-form.component').then(m => m.HotelFormComponent)
      },
      {
        path: 'hotels/:id/rooms',
        loadComponent: () =>
          import('../admin/hotels/hotel-rooms/hotel-rooms.component').then(m => m.HotelRoomsComponent)
      },
      {
        path: 'rooms',
        loadComponent: () =>
          import('../admin/rooms/room-list/room-list.component').then(m => m.RoomListComponent)
      },
      {
        path: 'rooms/new',
        loadComponent: () =>
          import('../admin/rooms/room-form/room-form.component').then(m => m.RoomFormComponent)
      },
      {
        path: 'rooms/:id/edit',
        loadComponent: () =>
          import('../admin/rooms/room-form/room-form.component').then(m => m.RoomFormComponent)
      },
      {
        path: 'reservations',
        loadComponent: () =>
          import('../admin/reservations/reservation-list/reservation-list.component').then(m => m.ReservationListComponent)
      },
      {
        path: 'reservations/:id',
        loadComponent: () =>
          import('../admin/reservations/reservation-detail/reservation-detail.component').then(m => m.ReservationDetailComponent)
      },
    ]
  }
];
