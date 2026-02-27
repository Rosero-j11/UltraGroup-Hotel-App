import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/**
 * Datos que se pasan al diálogo mediante el token `MAT_DIALOG_DATA`.
 * Todos los campos son opcionales excepto `title` y `message`.
 */
export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

/**
 * Diálogo de confirmación genérico reutilizable en toda la aplicación.
 *
 * Se abre con `MatDialog.open(ConfirmDialogComponent, { data: ConfirmDialogData })`.
 * Retorna `true` si el usuario confirma, `undefined` si cierra con Escape o clic fuera.
 *
 * @example
 * const ref = this.dialog.open(ConfirmDialogComponent, {
 *   data: { title: 'Eliminar', message: '¿Seguro?', confirmText: 'Sí, eliminar', type: 'danger' }
 * });
 * ref.afterClosed().subscribe(confirmed => {
 *   if (confirmed) this.service.delete(id);
 * });
 */
@Component({
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="confirm-dialog">
      <div class="dialog-header" [class]="data.type || 'info'">
        <mat-icon>
          @switch (data.type) {
            @case ('danger') { warning }
            @case ('warning') { report_problem }
            @default { help_outline }
          }
        </mat-icon>
        <h2 mat-dialog-title>{{ data.title }}</h2>
      </div>
      <mat-dialog-content>
        <p>{{ data.message }}</p>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-stroked-button (click)="onCancel()">
          {{ data.cancelText || 'Cancelar' }}
        </button>
        <button
          mat-flat-button
          [color]="data.type === 'danger' ? 'warn' : 'primary'"
          (click)="onConfirm()">
          {{ data.confirmText || 'Confirmar' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirm-dialog { min-width: 320px; max-width: 480px; }
    .dialog-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1.25rem 1.5rem 0;
    }
    .dialog-header mat-icon { font-size: 1.75rem; width: 1.75rem; height: 1.75rem; }
    .dialog-header.danger mat-icon { color: #f44336; }
    .dialog-header.warning mat-icon { color: #ff9800; }
    .dialog-header.info mat-icon { color: #2196f3; }
    h2 { margin: 0; font-size: 1.1rem; }
    mat-dialog-content p { color: #555; line-height: 1.5; }
    mat-dialog-actions { padding: 0.75rem 1.5rem 1.25rem; gap: 0.5rem; }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    private readonly dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  onConfirm(): void { this.dialogRef.close(true); }
  onCancel(): void { this.dialogRef.close(false); }
}
