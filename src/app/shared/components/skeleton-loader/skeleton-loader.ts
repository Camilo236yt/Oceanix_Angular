import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SkeletonType = 'table' | 'card' | 'text' | 'avatar' | 'button';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skeleton-loader.html',
  styleUrls: ['./skeleton-loader.scss'],
})
export class SkeletonLoader {
  @Input() type: SkeletonType = 'text';
  @Input() rows: number = 5;
  @Input() columns: number = 4;
  @Input() cards: number = 3;
  @Input() lines: number = 3;
  @Input() showHeader: boolean = true;

  get rowsArray(): number[] {
    return Array(this.rows).fill(0);
  }

  get columnsArray(): number[] {
    return Array(this.columns).fill(0);
  }

  get cardsArray(): number[] {
    return Array(this.cards).fill(0);
  }

  get linesArray(): number[] {
    return Array(this.lines).fill(0);
  }
}
