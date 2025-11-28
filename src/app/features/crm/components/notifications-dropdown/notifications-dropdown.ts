import { Component, Input, Output, EventEmitter, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CRMNotification } from '../../models/notification.model';

@Component({
  selector: 'app-notifications-dropdown',
  imports: [CommonModule],
  templateUrl: './notifications-dropdown.html',
  styleUrl: './notifications-dropdown.scss',
})
export class NotificationsDropdown {
  @Input() notifications: CRMNotification[] = [];
  @Input() isOpen = false;
  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() notificationClick = new EventEmitter<CRMNotification>();
  @Output() markAsRead = new EventEmitter<string>();
  @Output() markAllAsRead = new EventEmitter<void>();
  @Output() deleteNotification = new EventEmitter<string>();

  constructor(private elementRef: ElementRef) {}

  get unreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  get hasNotifications(): boolean {
    return this.notifications.length > 0;
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
    this.isOpenChange.emit(this.isOpen);
  }

  closeDropdown(): void {
    this.isOpen = false;
    this.isOpenChange.emit(false);
  }

  onNotificationClick(notification: CRMNotification): void {
    this.notificationClick.emit(notification);
    if (!notification.isRead) {
      this.markAsRead.emit(notification.id);
    }
  }

  onMarkAllAsRead(): void {
    this.markAllAsRead.emit();
  }

  onDeleteNotification(event: Event, notificationId: string): void {
    event.stopPropagation();
    this.deleteNotification.emit(notificationId);
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

  getPriorityBadgeColor(priority: CRMNotification['priority']): string {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-50 text-red-600 border border-red-200';
      case 'HIGH':
        return 'bg-orange-50 text-orange-600 border border-orange-200';
      case 'MEDIUM':
      case 'NORMAL':
        return 'bg-yellow-50 text-yellow-600 border border-yellow-200';
      case 'LOW':
        return 'bg-gray-50 text-gray-600 border border-gray-200';
      default:
        return 'bg-gray-50 text-gray-600 border border-gray-200';
    }
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMs = now.getTime() - notificationDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Justo ahora';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    if (diffInDays === 1) return 'Hace 1 día';
    if (diffInDays < 7) return `Hace ${diffInDays} días`;

    return notificationDate.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }
}
