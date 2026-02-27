import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

export type StatusType = 'active' | 'inactive' | 'confirmed' | 'pending' | 'cancelled';

export type StatusType = 'active' | 'inactive' | 'confirmed' | 'pending' | 'cancelled';

/**
 * Chip de estado visual que muestra el estado de un hotel o reserva.
 *
 * Aplica colores semánticos por tipo mediante clases CSS:
 * - `active`    → verde
 * - `inactive`  → gris
 * - `confirmed` → azul
 * - `pending`   → amarillo
 * - `cancelled` → rojo
 *
 * El `label` se genera como propiedad computada en la clase,
 * manteniendo la lógica de presentación fuera del template.
 *
 * @example
 * <app-status-badge [status]="hotel.status" />
 * <app-status-badge [status]="reservation.status" />
 */
@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule, MatChipsModule, MatIconModule],
  template: `
    <span class="status-badge" [class]="'status-' + status">
      <mat-icon>{{ icon }}</mat-icon>
      {{ label }}
    </span>
  `,
  styles: [`
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 0.78rem;
      font-weight: 600;
      letter-spacing: 0.3px;
    }
    .status-badge mat-icon { font-size: 14px; width: 14px; height: 14px; }
    .status-active { background: #e8f5e9; color: #2e7d32; }
    .status-inactive { background: #fafafa; color: #757575; border: 1px solid #e0e0e0; }
    .status-confirmed { background: #e3f2fd; color: #1565c0; }
    .status-pending { background: #fff8e1; color: #f57f17; }
    .status-cancelled { background: #fce4ec; color: #c62828; }
  `]
})
export class StatusBadgeComponent {
  @Input() status: StatusType = 'active';

  get label(): string {
    const labels: Record<StatusType, string> = {
      active: 'Activo',
      inactive: 'Inactivo',
      confirmed: 'Confirmada',
      pending: 'Pendiente',
      cancelled: 'Cancelada',
    };
    return labels[this.status] ?? this.status;
  }

  get icon(): string {
    const icons: Record<StatusType, string> = {
      active: 'check_circle',
      inactive: 'cancel',
      confirmed: 'task_alt',
      pending: 'schedule',
      cancelled: 'remove_circle',
    };
    return icons[this.status] ?? 'info';
  }
}
