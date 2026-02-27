import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-traveler-layout',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    MatToolbarModule, MatIconModule, MatButtonModule
  ],
  template: `
    <div class="traveler-wrapper">
      <mat-toolbar class="traveler-toolbar" color="primary">
        <mat-icon class="logo-icon">flight_takeoff</mat-icon>
        <a class="brand-link" routerLink="/traveler">UltraHotels</a>
        <span class="spacer"></span>
        <a mat-stroked-button routerLink="/admin" class="admin-btn">
          <mat-icon>admin_panel_settings</mat-icon>
          <span class="admin-label">Panel Admin</span>
        </a>
      </mat-toolbar>

      <main class="traveler-content">
        <router-outlet></router-outlet>
      </main>

      <footer class="traveler-footer">
        <p>© 2026 UltraHotels by UltraGroup · Todos los derechos reservados</p>
      </footer>
    </div>
  `,
  styles: [`
    .traveler-wrapper { min-height: 100vh; display: flex; flex-direction: column; background: #F7FAFC; }
    .traveler-toolbar { position: sticky; top: 0; z-index: 100; background: #1A365D !important; gap: 0.25rem; }
    .logo-icon { color: #C9A227; font-size: 1.4rem !important; width: 1.4rem !important; height: 1.4rem !important; }
    .brand-link {
      text-decoration: none;
      color: white;
      font-size: 1.1rem;
      font-weight: 700;
      letter-spacing: 0.5px;
      margin-left: 0.1rem;
    }
    .spacer { flex: 1; }
    .admin-btn { color: white !important; border-color: rgba(255,255,255,0.5) !important; margin-left: 0.25rem; font-size: 0.8rem !important; padding: 0 0.5rem !important; }
    .admin-btn .mat-icon, .admin-btn mat-icon { color: white !important; }
    /* Ocultar texto admin en móvil */
    .admin-label { display: none; }
    .traveler-content { flex: 1; }
    .traveler-footer {
      text-align: center;
      padding: 1.25rem 1rem;
      background: #1A365D;
      color: rgba(255,255,255,0.7);
      font-size: 0.82rem;
    }
    @media (min-width: 480px) {
      .brand-link { font-size: 1.2rem; }
      .admin-label { display: inline; }
      .admin-btn { padding: 0 0.75rem !important; font-size: 0.875rem !important; }
    }
    @media (min-width: 768px) {
      .brand-link { font-size: 1.25rem; margin-left: 0.25rem; }
    }
  `]
})
export class TravelerLayoutComponent {}
