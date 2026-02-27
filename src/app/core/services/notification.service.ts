import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

/**
 * Servicio para mostrar notificaciones tipo toast usando `MatSnackBar`.
 *
 * Centraliza la configuración de duración y posición para que todos los
 * componentes muestren mensajes con estilos y comportamientos consistentes.
 *
 * Los estilos visuales (colores) por tipo se aplican vía `panelClass`
 * definidos en los estilos globales del tema.
 *
 * @example
 * // Uso en cualquier componente
 * private readonly notify = inject(NotificationService);
 * this.notify.success('Hotel creado exitosamente');
 * this.notify.error('No se pudo guardar. Intente nuevamente.');
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  private getConfig(type: NotificationType): MatSnackBarConfig {
    const panelClass: Record<NotificationType, string> = {
      success: 'snackbar-success',
      error: 'snackbar-error',
      warning: 'snackbar-warning',
      info: 'snackbar-info',
    };
    return {
      duration: type === 'error' ? 5000 : 3500,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: [panelClass[type]],
    };
  }

  success(message: string): void {
    this.snackBar.open(message, '✕', this.getConfig('success'));
  }

  error(message: string): void {
    this.snackBar.open(message, '✕', this.getConfig('error'));
  }

  warning(message: string): void {
    this.snackBar.open(message, '✕', this.getConfig('warning'));
  }

  info(message: string): void {
    this.snackBar.open(message, '✕', this.getConfig('info'));
  }
}
