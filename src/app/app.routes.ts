import { Routes } from '@angular/router';

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
