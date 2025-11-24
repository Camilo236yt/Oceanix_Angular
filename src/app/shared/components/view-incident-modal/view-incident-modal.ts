import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { IncidentData } from '../../../features/crm/models/incident.model';

@Component({
  selector: 'app-view-incident-modal',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './view-incident-modal.html',
  styleUrls: ['./view-incident-modal.scss']
})
export class ViewIncidentModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() incidentData: IncidentData | null = null;
  @Output() onClose = new EventEmitter<void>();

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen']) {
      if (this.isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
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

  formatDateTime(isoDate: string): string {
    const date = new Date(isoDate);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  get tipoLabel(): string {
    const tipoMap: { [key: string]: string } = {
      'por_perdida': 'Pérdida',
      'por_dano': 'Daño',
      'por_error_humano': 'Error Humano',
      'por_mantenimiento': 'Mantenimiento',
      'por_falla_tecnica': 'Falla Técnica',
      'otro': 'Otro'
    };
    return tipoMap[this.incidentData?.tipo || ''] || this.incidentData?.tipo || 'N/A';
  }

  get statusLabel(): string {
    const statusMap: { [key: string]: string } = {
      'RESOLVED': 'Resuelto',
      'PENDING': 'Pendiente',
      'IN_PROGRESS': 'En Progreso'
    };
    return statusMap[this.incidentData?.status || ''] || this.incidentData?.status || 'N/A';
  }

  get statusColor(): string {
    const colorMap: { [key: string]: string } = {
      'RESOLVED': 'text-green-600',
      'PENDING': 'text-red-600',
      'IN_PROGRESS': 'text-orange-500'
    };
    return colorMap[this.incidentData?.status || ''] || 'text-gray-600';
  }

  get statusBgColor(): string {
    const colorMap: { [key: string]: string } = {
      'RESOLVED': 'bg-green-500',
      'PENDING': 'bg-red-500',
      'IN_PROGRESS': 'bg-orange-500'
    };
    return colorMap[this.incidentData?.status || ''] || 'bg-gray-500';
  }

  get alertLevelColor(): string {
    const colorMap: { [key: string]: string } = {
      'GREEN': '#22c55e',
      'YELLOW': '#eab308',
      'RED': '#ef4444'
    };
    return colorMap[this.incidentData?.alertLevel || ''] || '#9ca3af';
  }

  get alertLevelLabel(): string {
    const labelMap: { [key: string]: string } = {
      'GREEN': 'Bajo',
      'YELLOW': 'Medio',
      'RED': 'Alto'
    };
    return labelMap[this.incidentData?.alertLevel || ''] || 'N/A';
  }

  get tipoIcon(): string {
    const iconMap: { [key: string]: string } = {
      'por_perdida': 'package',
      'por_dano': 'alert-triangle',
      'por_error_humano': 'user-x',
      'por_mantenimiento': 'tool',
      'por_falla_tecnica': 'zap-off',
      'otro': 'help-circle'
    };
    return iconMap[this.incidentData?.tipo || ''] || 'file-text';
  }

  get hasActiveUploadRequest(): boolean {
    if (!this.incidentData?.canClientUploadImages) {
      return false;
    }
    if (!this.incidentData.imagesUploadAllowedUntil) {
      return false;
    }
    const allowedUntil = new Date(this.incidentData.imagesUploadAllowedUntil);
    return new Date() < allowedUntil;
  }

  get uploadTimeRemaining(): string | null {
    if (!this.incidentData?.imagesUploadAllowedUntil) {
      return null;
    }
    const allowedUntil = new Date(this.incidentData.imagesUploadAllowedUntil);
    const now = new Date();
    const diffMs = allowedUntil.getTime() - now.getTime();

    if (diffMs <= 0) {
      return null;
    }

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }
}
