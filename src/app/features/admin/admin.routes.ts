import { Routes } from '@angular/router';
import { AdminLayoutComponent } from '../../layouts/admin-layout/admin-layout.component';

/**
 * Rutas del módulo de administración.
 *
 * Usa `AdminLayoutComponent` como layout padre (sidenav + toolbar).
 * Cada ruta hija carga su componente de forma lazy con `loadComponent`,
 * generando un chunk independiente por pantalla.
 *
 * ### Rutas disponibles
 * | Ruta                        | Componente              | Descripción                        |
 * |-----------------------------|-------------------------|------------------------------------|  
 * | `/admin/hotels`             | HotelListComponent      | Listado + filtros de hoteles       |
 * | `/admin/hotels/new`         | HotelFormComponent      | Formulario creación de hotel       |
 * | `/admin/hotels/:id/edit`    | HotelFormComponent      | Formulario edición (reutilizado)   |
 * | `/admin/hotels/:id/rooms`   | HotelRoomsComponent     | Habitaciones de un hotel específico|
 * | `/admin/rooms`              | RoomListComponent       | Listado global de habitaciones     |
 * | `/admin/rooms/new`          | RoomFormComponent       | Formulario creación de habitación  |
 * | `/admin/rooms/:id/edit`     | RoomFormComponent       | Formulario edición (reutilizado)   |
 * | `/admin/reservations`       | ReservationListComponent| Listado de todas las reservas      |
 * | `/admin/reservations/:id`   | ReservationDetailComponent| Detalle de una reserva           |
 */
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
