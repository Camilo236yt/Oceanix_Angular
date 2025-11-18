import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { EmpresaData } from '../../../interface/empresas-api.interface';

@Component({
  selector: 'app-view-company-modal',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './view-company-modal.html',
  styleUrl: './view-company-modal.scss'
})
export class ViewCompanyModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() companyData: EmpresaData | null = null;
  @Output() onClose = new EventEmitter<void>();

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen']) {
      if (this.isOpen) {
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
        console.log('Modal abierto con companyData:', this.companyData);
      } else {
        // Restore body scroll when modal is closed
        document.body.style.overflow = '';
      }
    }

    if (changes['companyData']) {
      console.log('companyData cambió:', this.companyData);
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

  formatDate(isoDate: string): string {
    const date = new Date(isoDate);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  formatDateTime(isoDate: string): string {
    const date = new Date(isoDate);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }
}
