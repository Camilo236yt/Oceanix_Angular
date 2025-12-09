import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CRMNotification } from '../../../features/crm/models/notification.model';

@Component({
  selector: 'app-notification-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-detail-modal.html',
  styleUrl: './notification-detail-modal.scss'
})
export class NotificationDetailModal {
  @Input() notification: CRMNotification | null = null;
  @Input() isOpen = false;
  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() close = new EventEmitter<void>();

  closeModal(): void {
    this.isOpen = false;
    this.isOpenChange.emit(false);
    this.close.emit();
  }

  handleBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  /**
   * Obtener el icono según el tipo de notificación
   */
  getNotificationIcon(type: string): string {
    const iconMap: Record<string, string> = {
      'INCIDENT_ASSIGNED': 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      'INCIDENT_STATUS_CHANGED': 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
      'INCIDENT_MESSAGE': 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
      'INCIDENT_UPDATED': 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
      'INCIDENT_RESOLVED': 'M5 13l4 4L19 7'
    };
    return iconMap[type] || iconMap['INCIDENT_UPDATED'];
  }

  /**
   * Obtener el color del icono según el tipo
   */
  getIconColor(type: string): string {
    const colorMap: Record<string, string> = {
      'INCIDENT_ASSIGNED': 'text-blue-600',
      'INCIDENT_STATUS_CHANGED': 'text-amber-600',
      'INCIDENT_MESSAGE': 'text-purple-600',
      'INCIDENT_UPDATED': 'text-cyan-600',
      'INCIDENT_RESOLVED': 'text-green-600'
    };
    return colorMap[type] || 'text-gray-600';
  }

  /**
   * Obtener el color de fondo del badge de prioridad
   */
  getPriorityColor(priority: string): string {
    const colorMap: Record<string, string> = {
      'URGENT': 'bg-red-100 text-red-800',
      'HIGH': 'bg-orange-100 text-orange-800',
      'MEDIUM': 'bg-yellow-100 text-yellow-800',
      'LOW': 'bg-green-100 text-green-800',
      'NORMAL': 'bg-blue-100 text-blue-800'
    };
    return colorMap[priority] || 'bg-gray-100 text-gray-800';
  }

  /**
   * Obtener el label de la prioridad en español
   */
  getPriorityLabel(priority: string): string {
    const labelMap: Record<string, string> = {
      'URGENT': 'Urgente',
      'HIGH': 'Alta',
      'MEDIUM': 'Media',
      'LOW': 'Baja',
      'NORMAL': 'Normal'
    };
    return labelMap[priority] || priority;
  }

  /**
   * Obtener el label del tipo en español
   */
  getTypeLabel(type: string): string {
    const labelMap: Record<string, string> = {
      'INCIDENT_ASSIGNED': 'Incidencia Asignada',
      'INCIDENT_STATUS_CHANGED': 'Cambio de Estado',
      'INCIDENT_MESSAGE': 'Nuevo Mensaje',
      'INCIDENT_UPDATED': 'Actualización',
      'INCIDENT_RESOLVED': 'Incidencia Resuelta'
    };
    return labelMap[type] || 'Notificación';
  }

  /**
   * Formatear fecha completa
   */
  formatDateTime(date: Date): string {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }
}
