import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterLink, RouterLinkActive,
    MatToolbarModule, MatIconModule, MatButtonModule,
    MatSidenavModule, MatListModule, MatTooltipModule
  ],
  template: `
    <mat-sidenav-container class="admin-container">
      <mat-sidenav
        #sidenav
        mode="side"
        [opened]="sidenavOpen()"
        class="admin-sidenav">
        <div class="sidenav-header">
          <mat-icon class="brand-icon">hotel</mat-icon>
          <span class="brand-name">UltraGroup</span>
          <span class="brand-sub">Admin Panel</span>
        </div>
        <mat-nav-list class="nav-list">
          @for (item of navItems; track item.route) {
            <a
              mat-list-item
              [routerLink]="item.route"
              routerLinkActive="active-link"
              [routerLinkActiveOptions]="{ exact: false }"
              class="nav-item">
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle>{{ item.label }}</span>
            </a>
          }
        </mat-nav-list>
        <div class="sidenav-footer">
          <a mat-list-item routerLink="/traveler" class="switch-profile">
            <mat-icon matListItemIcon>person</mat-icon>
            <span matListItemTitle>Perfil Viajero</span>
          </a>
        </div>
      </mat-sidenav>

      <mat-sidenav-content class="admin-content">
        <mat-toolbar class="admin-toolbar" color="primary">
          <button mat-icon-button (click)="toggleSidenav()" matTooltip="Menú">
            <mat-icon>menu</mat-icon>
          </button>
          <span class="toolbar-title">Administración de Hoteles</span>
          <span class="spacer"></span>
          <a mat-button routerLink="/traveler">
            <mat-icon>flight_takeoff</mat-icon>
            Modo Viajero
          </a>
        </mat-toolbar>
        <main class="content-area">
          <router-outlet></router-outlet>
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .admin-container { height: 100vh; }
    .admin-sidenav {
      width: 240px;
      background: #1A365D;
      color: white;
    }
    .sidenav-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1.5rem 1rem 1.25rem;
      background: rgba(0,0,0,0.2);
    }
    .brand-icon { font-size: 2.5rem; width: 2.5rem; height: 2.5rem; color: #C9A227; }
    .brand-name { font-size: 1.2rem; font-weight: 700; letter-spacing: 1px; margin-top: 0.4rem; }
    .brand-sub { font-size: 0.72rem; color: rgba(255,255,255,0.6); }
    .nav-list { padding: 0.5rem 0; flex: 1; }
    /* ── Colores blancos nav items ── */
    .nav-item { color: white !important; margin: 2px 8px; border-radius: 8px; }
    .nav-item:hover { background: rgba(255,255,255,0.1) !important; }
    .nav-item .mat-icon, .nav-item mat-icon { color: white !important; }
    .nav-item .mdc-list-item__primary-text { color: white !important; }
    .active-link { background: rgba(201,162,39,0.25) !important; color: #C9A227 !important; font-weight: 600; }
    .active-link .mat-icon, .active-link mat-icon { color: #C9A227 !important; }
    .active-link .mdc-list-item__primary-text { color: #C9A227 !important; }
    .sidenav-footer { padding: 0.5rem 0; border-top: 1px solid rgba(255,255,255,0.15); }
    .switch-profile { color: white !important; margin: 2px 8px; border-radius: 8px; }
    .switch-profile .mat-icon, .switch-profile mat-icon { color: white !important; }
    .switch-profile .mdc-list-item__primary-text { color: white !important; }
    /* ── Toolbar ── */
    .admin-toolbar { position: sticky; top: 0; z-index: 100; background: #1A365D !important; color: white !important; }
    .admin-toolbar .mat-icon, .admin-toolbar mat-icon { color: white !important; }
    .toolbar-title { font-weight: 500; font-size: 0.95rem; margin-left: 0.25rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: white; }
    .spacer { flex: 1; }
    /* ── Elimina esquina blanca del sidenav-container ── */
    .admin-container { background: #1A365D !important; }
    .admin-toolbar button, .admin-toolbar a { color: white !important; }
    .content-area { padding: 1rem; min-height: calc(100vh - 64px); background: #F7FAFC; }
    @media (min-width: 640px) {
      .content-area { padding: 1.5rem; }
      .toolbar-title { font-size: 1.05rem; }
    }
  `]
})
export class AdminLayoutComponent {
  sidenavOpen = signal(true);

  navItems: NavItem[] = [
    { label: 'Hoteles', icon: 'hotel', route: '/admin/hotels' },
    { label: 'Habitaciones', icon: 'bed', route: '/admin/rooms' },
    { label: 'Reservas', icon: 'book_online', route: '/admin/reservations' },
  ];

  toggleSidenav(): void {
    this.sidenavOpen.update(v => !v);
  }
}
