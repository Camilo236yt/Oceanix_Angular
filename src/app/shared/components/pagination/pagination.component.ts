import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';

export interface PaginationConfig {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  pageSizeOptions?: number[];
}

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss'
})
export class PaginationComponent implements OnChanges {
  @Input() currentPage: number = 1;
  @Input() totalItems: number = 0;
  @Input() itemsPerPage: number = 10;
  @Input() pageSizeOptions: number[] = [10, 25, 50, 100];
  @Input() showPageSizeSelector: boolean = true;
  @Input() maxVisiblePages: number = 5;

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  totalPages: number = 0;
  visiblePages: (number | string)[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    this.calculateTotalPages();
    this.generateVisiblePages();
  }

  private calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
  }

  private generateVisiblePages(): void {
    const pages: (number | string)[] = [];

    if (this.totalPages <= this.maxVisiblePages + 2) {
      // Show all pages if total is small
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (this.currentPage <= 3) {
        // Near the beginning
        for (let i = 2; i <= Math.min(this.maxVisiblePages, this.totalPages - 1); i++) {
          pages.push(i);
        }
        if (this.totalPages > this.maxVisiblePages) {
          pages.push('...');
        }
      } else if (this.currentPage >= this.totalPages - 2) {
        // Near the end
        pages.push('...');
        for (let i = Math.max(2, this.totalPages - this.maxVisiblePages + 1); i <= this.totalPages - 1; i++) {
          pages.push(i);
        }
      } else {
        // In the middle
        pages.push('...');
        for (let i = this.currentPage - 1; i <= this.currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
      }

      // Always show last page
      if (this.totalPages > 1) {
        pages.push(this.totalPages);
      }
    }

    this.visiblePages = pages;
  }

  goToPage(page: number | string): void {
    if (typeof page === 'string') return;
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;

    this.currentPage = page;
    this.pageChange.emit(page);
    this.generateVisiblePages();
  }

  goToPrevious(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  goToNext(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  onPageSizeChange(newSize: number): void {
    this.itemsPerPage = newSize;
    this.currentPage = 1;
    this.calculateTotalPages();
    this.generateVisiblePages();
    this.pageSizeChange.emit(newSize);
    this.pageChange.emit(1);
  }

  get startItem(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
  }
}
