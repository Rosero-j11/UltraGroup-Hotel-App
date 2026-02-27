import { Routes } from '@angular/router';

/**
 * Rutas raíz de la aplicación.
 *
 * ## Lazy Loading de módulos de funcionalidades
 * Cada módulo de feature (`admin`, `traveler`) se carga de forma lazy
 * mediante `loadChildren`. Esto genera chunks separados en el bundle,
 * reduciendo el tamaño del paquete inicial.
 *
 * - `/admin/**`    → `AdminLayoutComponent` + rutas hijas (hotels, rooms, reservations)
 * - `/traveler/**` → `TravelerLayoutComponent` + rutas hijas (search, hotel-detail, booking)
 * - `''`           → redirige automáticamente a `/traveler` (página inicio)
 * - `'**'`         → cualquier ruta desconocida redirige a `/traveler`
 */
export const routes: Routes = [
  { path: '', redirectTo: '/traveler', pathMatch: 'full' },
  {
    path: 'admin',
    loadChildren: () =>
      import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  {
    path: 'traveler',
    loadChildren: () =>
      import('./features/traveler/traveler.routes').then(m => m.TRAVELER_ROUTES)
  },
  { path: '**', redirectTo: '/traveler' }
];
