import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CRMNotification } from '../../models/notification.model';

@Component({
  selector: 'app-notification-detail-modal',
  imports: [CommonModule],
  templateUrl: './notification-detail-modal.html',
  styleUrl: './notification-detail-modal.scss',
})
export class NotificationDetailModal {
  @Input() notification: CRMNotification | null = null;
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() markAsRead = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();

  closeModal(): void {
    this.close.emit();
  }

  onMarkAsRead(): void {
    if (this.notification && !this.notification.isRead) {
      this.markAsRead.emit(this.notification.id);
    }
  }

  onDelete(): void {
    if (this.notification) {
      this.delete.emit(this.notification.id);
      this.closeModal();
    }
  }

  getNotificationIcon(type: CRMNotification['type']): string {
    switch (type) {
      case 'INCIDENT_ASSIGNED':
        return 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z';
      case 'INCIDENT_STATUS_CHANGED':
        return 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15';
      case 'INCIDENT_MESSAGE':
        return 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z';
      case 'INCIDENT_UPDATED':
        return 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z';
      case 'INCIDENT_RESOLVED':
        return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
      default:
        return 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9';
    }
  }

  getNotificationColor(type: CRMNotification['type']): string {
    switch (type) {
      case 'INCIDENT_ASSIGNED':
        return 'text-blue-500';
      case 'INCIDENT_STATUS_CHANGED':
        return 'text-amber-500';
      case 'INCIDENT_MESSAGE':
        return 'text-purple-500';
      case 'INCIDENT_UPDATED':
        return 'text-cyan-500';
      case 'INCIDENT_RESOLVED':
        return 'text-emerald-500';
      default:
        return 'text-gray-500';
    }
  }

  getNotificationBgGradient(type: CRMNotification['type']): string {
    switch (type) {
      case 'INCIDENT_ASSIGNED':
        return 'from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20';
      case 'INCIDENT_STATUS_CHANGED':
        return 'from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20';
      case 'INCIDENT_MESSAGE':
        return 'from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20';
      case 'INCIDENT_UPDATED':
        return 'from-cyan-50 to-cyan-100 dark:from-cyan-900/30 dark:to-cyan-800/20';
      case 'INCIDENT_RESOLVED':
        return 'from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/20';
      default:
        return 'from-gray-50 to-gray-100 dark:from-gray-900/30 dark:to-gray-800/20';
    }
  }

  getPriorityBadgeColor(priority: CRMNotification['priority']): string {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-50 text-red-600 border-red-200';
      case 'HIGH':
        return 'bg-orange-50 text-orange-600 border-orange-200';
      case 'MEDIUM':
        return 'bg-yellow-50 text-yellow-600 border-yellow-200';
      case 'LOW':
        return 'bg-gray-50 text-gray-600 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  }

  getTypeLabel(type: CRMNotification['type']): string {
    switch (type) {
      case 'INCIDENT_ASSIGNED':
        return 'Incidencia Asignada';
      case 'INCIDENT_STATUS_CHANGED':
        return 'Cambio de Estado';
      case 'INCIDENT_MESSAGE':
        return 'Nuevo Mensaje';
      case 'INCIDENT_UPDATED':
        return 'Incidencia Actualizada';
      case 'INCIDENT_RESOLVED':
        return 'Incidencia Resuelta';
      default:
        return 'Notificación';
    }
  }

  getPriorityLabel(priority: CRMNotification['priority']): string {
    switch (priority) {
      case 'URGENT':
        return 'Urgente';
      case 'HIGH':
        return 'Alta';
      case 'MEDIUM':
        return 'Media';
      case 'LOW':
        return 'Baja';
      default:
        return '';
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  handleBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  hasMetadata(metadata: any): boolean {
    return metadata && Object.keys(metadata).length > 0;
  }
}
