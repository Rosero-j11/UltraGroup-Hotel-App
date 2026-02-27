import { Component, Input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

/**
 * Spinner de carga reutilizable con dos modos de visualización.
 *
 * - **Modo overlay** (`inline=false`, por defecto): ocupa toda la pantalla con
 *   fondo semi-transparente. Ideal para bloquear la UI durante cargas de página.
 * - **Modo inline** (`inline=true`): se integra en el flujo del contenido,
 *   útil dentro de cards o secciones específicas.
 *
 * @example
 * <!-- Modo overlay con mensaje -->
 * <app-loading-spinner [visible]="loading()" message="Cargando hoteles..." />
 *
 * <!-- Modo inline pequeño -->
 * <app-loading-spinner [visible]="saving" [inline]="true" [diameter]="24" />
 */
@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    @if (visible) {
      <div class="spinner-overlay" [class.inline]="inline">
        <mat-spinner [diameter]="diameter" [color]="color"></mat-spinner>
        @if (message) {
          <p class="spinner-message">{{ message }}</p>
        }
      </div>
    }
  `,
  styles: [`
    .spinner-overlay {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      gap: 1rem;
    }
    .spinner-overlay:not(.inline) {
      position: fixed;
      inset: 0;
      background: rgba(255,255,255,0.7);
      z-index: 9999;
    }
    .spinner-message {
      color: #666;
      font-size: 0.9rem;
      margin: 0;
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() visible = false;
  @Input() inline = false;
  @Input() diameter = 48;
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() message = '';
}
