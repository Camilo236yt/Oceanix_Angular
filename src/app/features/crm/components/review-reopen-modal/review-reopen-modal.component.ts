import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IncidenciasService } from '../../services/incidencias.service';
import { ReopenRequest } from '../../../../shared/models/reopen-request.model';

@Component({
  selector: 'app-review-reopen-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './review-reopen-modal.component.html',
  styleUrls: ['./review-reopen-modal.component.css']
})
export class ReviewReopenModalComponent implements OnInit {
  @Input() requestId: string = '';
  @Output() closeModal = new EventEmitter<void>();
  @Output() reviewSubmitted = new EventEmitter<void>();

  request: ReopenRequest | null = null;
  decision: 'APPROVED' | 'REJECTED' | null = null;
  reviewNotes: string = '';
  isSubmitting: boolean = false;
  isLoading: boolean = true;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private incidenciasService: IncidenciasService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    console.log('🟢 ReviewReopenModalComponent inicializado');
    console.log('  - requestId:', this.requestId);
    this.loadRequestDetails();
  }

  loadRequestDetails(): void {
    console.log('🔵 loadRequestDetails llamado');
    console.log('  - requestId:', this.requestId);

    this.isLoading = true;
    this.incidenciasService.getReopenRequestById(this.requestId)
      .subscribe({
        next: (response) => {
          console.log('✅ Respuesta getReopenRequestById:', response);
          this.request = response.data || response;
          console.log('  - request asignado:', this.request);
          this.isLoading = false;
          this.cdr.detectChanges();
          console.log('  - isLoading después:', this.isLoading);
        },
        error: (error) => {
          console.error('❌ Error al cargar solicitud:', error);
          console.error('  - requestId usado:', this.requestId);
          this.errorMessage = 'Error al cargar los detalles de la solicitud';
          this.isLoading = false;
        }
      });
  }

  selectDecision(decision: 'APPROVED' | 'REJECTED'): void {
    this.decision = decision;
  }

  get canSubmit(): boolean {
    if (!this.decision) return false;
    if (this.decision === 'REJECTED') {
      return this.reviewNotes.trim().length >= 10;
    }
    return true;
  }

  onSubmit(): void {
    if (!this.canSubmit || !this.decision) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const notes = this.reviewNotes.trim() || undefined;

    this.incidenciasService.reviewReopenRequest(this.requestId, this.decision, notes)
      .subscribe({
        next: (response) => {
          this.successMessage = response.message ||
            (this.decision === 'APPROVED' ? 'Solicitud aprobada exitosamente' : 'Solicitud rechazada');
          this.isSubmitting = false;

          // Esperar 1.5 segundos para mostrar el mensaje de éxito
          setTimeout(() => {
            this.reviewSubmitted.emit();
            this.onClose();
          }, 1500);
        },
        error: (error) => {
          console.error('Error al revisar solicitud:', error);
          this.errorMessage = error.error?.message || 'Error al procesar la solicitud';
          this.isSubmitting = false;
        }
      });
  }

  formatDate(date: Date | string | null): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getDaysSince(date: Date | string | null): number {
    if (!date) return 0;
    const now = new Date();
    const then = new Date(date);
    const diffTime = Math.abs(now.getTime() - then.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  onClose(): void {
    this.decision = null;
    this.reviewNotes = '';
    this.errorMessage = '';
    this.successMessage = '';
    this.closeModal.emit();
  }
}
