import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { CRMNotification, NotificationStats, NotificationsResponse, BackendNotification, UnreadCountResponse, BackendApiResponse } from '../models/notification.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CrmNotificationsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/notifications`;

  // Signal para notificaciones
  private notificationsSignal = signal<CRMNotification[]>([]);

  // Signal para el contador de no leídas desde el backend
  private unreadCountSignal = signal<number>(0);

  // Exponer señal como readonly
  public readonly notifications = this.notificationsSignal.asReadonly();
  public readonly unreadCountFromBackend = this.unreadCountSignal.asReadonly();

  // Computed signals
  public readonly unreadCount = computed(() =>
    this.notificationsSignal().filter(n => !n.isRead).length
  );

  public readonly stats = computed<NotificationStats>(() => {
    const notifs = this.notificationsSignal();
    const unread = notifs.filter(n => !n.isRead);

    return {
      total: notifs.length,
      unread: unread.length,
      byPriority: {
        urgent: unread.filter(n => n.priority === 'URGENT').length,
        high: unread.filter(n => n.priority === 'HIGH').length,
        medium: unread.filter(n => n.priority === 'MEDIUM').length,
        low: unread.filter(n => n.priority === 'LOW').length,
      }
    };
  });

  constructor() {
    // No cargar desde localStorage - ahora obtenemos del backend
  }

  /**
   * Obtener notificaciones desde el backend
   */
  getNotifications(page: number = 1, limit: number = 20): Observable<NotificationsResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('sortBy', 'createdAt:DESC');

    return this.http.get<BackendApiResponse<NotificationsResponse>>(`${this.apiUrl}`, { params }).pipe(
      map(apiResponse => apiResponse.data), // Extraer el data del wrapper
      tap(response => {
        console.log('Respuesta de notificaciones procesada:', response);
        // Mapear las notificaciones del backend al formato del frontend
        const mappedNotifications = response.data.map(notification =>
          this.mapBackendNotification(notification)
        );
        console.log('Notificaciones mapeadas:', mappedNotifications);
        this.notificationsSignal.set(mappedNotifications);
      })
    );
  }

  /**
   * Mapear notificación del backend al formato del frontend
   */
  private mapBackendNotification(backendNotification: BackendNotification): CRMNotification {
    return {
      id: backendNotification.id,
      title: backendNotification.title,
      message: backendNotification.message,
      type: this.mapNotificationType(backendNotification.type),
      priority: this.mapNotificationPriority(backendNotification.priority),
      isRead: backendNotification.isRead,
      readAt: backendNotification.readAt,
      createdAt: new Date(backendNotification.createdAt),
      actionUrl: backendNotification.actionUrl,
      metadata: backendNotification.metadata
    };
  }

  /**
   * Mapear tipo de notificación del backend al frontend
   */
  private mapNotificationType(backendType: string): CRMNotification['type'] {
    const typeMap: Record<string, CRMNotification['type']> = {
      'TICKET_ASSIGNED': 'INCIDENT_ASSIGNED',
      'TICKET_STATUS_CHANGED': 'INCIDENT_STATUS_CHANGED',
      'TICKET_MESSAGE': 'INCIDENT_MESSAGE',
      'TICKET_UPDATED': 'INCIDENT_UPDATED',
      'TICKET_RESOLVED': 'INCIDENT_RESOLVED'
    };

    return typeMap[backendType] || 'INCIDENT_UPDATED';
  }

  /**
   * Mapear prioridad del backend al frontend
   */
  private mapNotificationPriority(backendPriority: 'NORMAL' | 'HIGH' | 'URGENT'): CRMNotification['priority'] {
    if (backendPriority === 'NORMAL') {
      return 'MEDIUM';
    }
    return backendPriority;
  }

  /**
   * Agregar una nueva notificación (para WebSocket/real-time)
   */
  addNotification(notification: CRMNotification): void {
    this.notificationsSignal.update(notifs => [notification, ...notifs]);
  }

  /**
   * Marcar notificación como leída (actualiza localmente y en backend)
   */
  markAsRead(notificationId: string): void {
    // TODO: Implementar llamada al backend para marcar como leída
    // Por ahora solo actualiza localmente
    this.notificationsSignal.update(notifs =>
      notifs.map(n => n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)
    );
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  markAllAsRead(): void {
    // TODO: Implementar llamada al backend para marcar todas como leídas
    const now = new Date().toISOString();
    this.notificationsSignal.update(notifs =>
      notifs.map(n => ({ ...n, isRead: true, readAt: now }))
    );
  }

  /**
   * Eliminar una notificación
   */
  deleteNotification(notificationId: string): void {
    // TODO: Implementar llamada al backend para eliminar
    this.notificationsSignal.update(notifs =>
      notifs.filter(n => n.id !== notificationId)
    );
  }

  /**
   * Eliminar todas las notificaciones
   */
  clearAll(): void {
    // TODO: Implementar llamada al backend para eliminar todas
    this.notificationsSignal.set([]);
  }

  /**
   * Obtener notificación por ID
   */
  getNotificationById(id: string): CRMNotification | undefined {
    return this.notificationsSignal().find(n => n.id === id);
  }

  /**
   * Obtener el contador de notificaciones no leídas desde el backend
   */
  getUnreadCount(): Observable<UnreadCountResponse> {
    return this.http.get<BackendApiResponse<UnreadCountResponse>>(`${this.apiUrl}/unread-count`).pipe(
      map(apiResponse => apiResponse.data), // Extraer el data del wrapper
      tap(response => {
        console.log('Contador de no leídas:', response.count);
        this.unreadCountSignal.set(response.count);
      })
    );
  }
}
