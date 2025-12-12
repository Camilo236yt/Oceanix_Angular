import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IncidenciasService } from '../../services/incidencias.service';
import { ReviewReopenModalComponent } from '../review-reopen-modal/review-reopen-modal.component';
import { ReopenRequest } from '../../../../shared/models/reopen-request.model';

@Component({
  selector: 'app-reopen-requests-list',
  standalone: true,
  imports: [CommonModule, ReviewReopenModalComponent],
  templateUrl: './reopen-requests-list.component.html',
  styleUrls: ['./reopen-requests-list.component.css']
})
export class ReopenRequestsListComponent implements OnInit {
  requests: ReopenRequest[] = [];
  isLoading: boolean = true;
  error: string = '';

  // Paginación
  currentPage: number = 1;
  limit: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;

  // Modal de revisión
  isReviewModalOpen: boolean = false;
  selectedRequestId: string | null = null;

  constructor(private incidenciasService: IncidenciasService) {}

  ngOnInit(): void {
    this.loadPendingRequests();
  }

  loadPendingRequests(): void {
    this.isLoading = true;
    this.error = '';

    this.incidenciasService.getPendingReopenRequests(this.currentPage, this.limit)
      .subscribe({
        next: (response) => {
          this.requests = response.data || [];
          this.totalItems = response.meta?.total || 0;
          this.totalPages = response.meta?.totalPages || 0;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error al cargar solicitudes:', error);
          this.error = 'Error al cargar las solicitudes pendientes';
          this.isLoading = false;
        }
      });
  }

  openReviewModal(requestId: string): void {
    this.selectedRequestId = requestId;
    this.isReviewModalOpen = true;
  }

  closeReviewModal(): void {
    this.isReviewModalOpen = false;
    this.selectedRequestId = null;
  }

  onReviewSubmitted(): void {
    this.closeReviewModal();
    this.loadPendingRequests(); // Recargar la lista
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getDaysSince(date: Date | string): number {
    const now = new Date();
    const then = new Date(date);
    const diffTime = Math.abs(now.getTime() - then.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadPendingRequests();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadPendingRequests();
    }
  }
}
