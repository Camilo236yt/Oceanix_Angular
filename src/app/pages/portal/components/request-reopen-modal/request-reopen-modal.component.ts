import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IncidenciasService } from '../../services/incidencias.service';

@Component({
  selector: 'app-request-reopen-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './request-reopen-modal.component.html',
  styleUrls: ['./request-reopen-modal.component.css']
})
export class RequestReopenModalComponent {
  @Input() incidenciaId: string = '';
  @Input() incidenciaNombre: string = '';
  @Output() closeModal = new EventEmitter<void>();
  @Output() requestSubmitted = new EventEmitter<void>();

  clientReason: string = '';
  isSubmitting: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private incidenciasService: IncidenciasService) {}

  get isReasonValid(): boolean {
    return this.clientReason.trim().length >= 10 && this.clientReason.trim().length <= 500;
  }

  get remainingChars(): number {
    return 500 - this.clientReason.length;
  }

  onSubmit(): void {
    if (!this.isReasonValid) {
      this.errorMessage = 'El motivo debe tener entre 10 y 500 caracteres';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.incidenciasService.requestReopen(this.incidenciaId, this.clientReason.trim())
      .subscribe({
        next: (response) => {
          this.successMessage = response.message || 'Solicitud enviada exitosamente';
          this.isSubmitting = false;

          // Esperar 1.5 segundos para mostrar el mensaje de éxito
          setTimeout(() => {
            this.requestSubmitted.emit();
            this.onClose();
          }, 1500);
        },
        error: (error) => {
          console.error('Error al solicitar reapertura:', error);
          this.errorMessage = error.error?.message || 'Error al enviar la solicitud. Por favor intente nuevamente.';
          this.isSubmitting = false;
        }
      });
  }

  onClose(): void {
    this.clientReason = '';
    this.errorMessage = '';
    this.successMessage = '';
    this.closeModal.emit();
  }
}
