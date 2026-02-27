import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <span class="star-rating">
      @for (star of starsArray; track $index) {
        <mat-icon [class.filled]="$index < stars">star</mat-icon>
      }
    </span>
  `,
  styles: [`
    .star-rating { display: inline-flex; gap: 2px; }
    mat-icon { font-size: 18px; width: 18px; height: 18px; color: #ddd; }
    mat-icon.filled { color: #FFC107; }
  `]
})
export class StarRatingComponent {
  @Input() stars = 0;
  readonly starsArray = Array(5).fill(0);
}
