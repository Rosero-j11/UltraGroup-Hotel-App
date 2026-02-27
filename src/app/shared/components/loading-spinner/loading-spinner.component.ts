import { Component, Input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

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
