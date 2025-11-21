import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-incident-status-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-incident-status-modal.html',
  styleUrls: ['./edit-incident-status-modal.scss']
})
export class EditIncidentStatusModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() incidentId: string = '';
  @Input() incidentName: string = '';
  @Input() currentStatus: string = '';
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<{ id: string; status: string }>();

  selectedStatus: string = '';
  isLoading = false;

  statusOptions = [
    { value: 'PENDING', label: 'Pendiente', description: 'La incidencia está en espera de ser atendida' },
    { value: 'IN_PROGRESS', label: 'En Progreso', description: 'La incidencia está siendo trabajada' },
    { value: 'RESOLVED', label: 'Resuelto', description: 'La incidencia ha sido solucionada' }
  ];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen']) {
      if (this.isOpen) {
        document.body.style.overflow = 'hidden';
        this.selectedStatus = this.currentStatus;
      } else {
        document.body.style.overflow = '';
      }
    }
    if (changes['currentStatus'] && this.currentStatus) {
      this.selectedStatus = this.currentStatus;
    }
  }

  closeModal() {
    this.onClose.emit();
  }

  handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  saveStatus() {
    if (this.selectedStatus && this.selectedStatus !== this.currentStatus) {
      this.onSave.emit({ id: this.incidentId, status: this.selectedStatus });
    } else {
      this.closeModal();
    }
  }

  get hasChanged(): boolean {
    return this.selectedStatus !== this.currentStatus;
  }
}
