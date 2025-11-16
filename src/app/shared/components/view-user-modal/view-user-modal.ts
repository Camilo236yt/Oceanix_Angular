import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { UsuarioData } from '../../../interface/usuarios-api.interface';

@Component({
  selector: 'app-view-user-modal',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './view-user-modal.html',
  styleUrl: './view-user-modal.scss'
})
export class ViewUserModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() userData: UsuarioData | null = null;
  @Output() onClose = new EventEmitter<void>();

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen']) {
      if (this.isOpen) {
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
        console.log('Modal abierto con userData:', this.userData);
        console.log('Roles en modal:', this.userData?.roles);
      } else {
        // Restore body scroll when modal is closed
        document.body.style.overflow = '';
      }
    }

    if (changes['userData']) {
      console.log('userData cambió:', this.userData);
      console.log('Roles:', this.userData?.roles);
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

  get userTypeLabel(): string {
    const typeMap: { [key: string]: string } = {
      'EMPLOYEE': 'Empleado',
      'ADMIN': 'Administrador',
      'SUPERVISOR': 'Supervisor'
    };
    return typeMap[this.userData?.userType || ''] || this.userData?.userType || 'N/A';
  }
}
