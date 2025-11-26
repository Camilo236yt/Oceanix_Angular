import { Injectable, signal, computed } from '@angular/core';
import { CRMNotification } from '../../../features/crm/models/notification.model';

/**
 * Servicio de notificaciones para clientes
 * Maneja notificaciones relacionadas con las incidencias del cliente
 */
@Injectable({
  providedIn: 'root'
})
export class ClientNotificationsService {
  private readonly STORAGE_KEY = 'client_notifications';
  private notificationsSignal = signal<CRMNotification[]>([]);

  // Exposiciones públicas de solo lectura
  public readonly notifications = this.notificationsSignal.asReadonly();

  // Estadísticas computadas
  public readonly unreadCount = computed(() =>
    this.notificationsSignal().filter(n => !n.isRead).length
  );

  constructor() {
    this.loadFromLocalStorage();
  }

  /**
   * Cargar notificaciones desde localStorage
   */
  private loadFromLocalStorage(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const notifications = JSON.parse(stored);
        // Convertir las fechas de string a Date
        notifications.forEach((n: CRMNotification) => {
          n.createdAt = new Date(n.createdAt);
        });
        this.notificationsSignal.set(notifications);
      } catch (error) {
        console.error('Error loading client notifications from localStorage:', error);
      }
    }
  }

  /**
   * Guardar notificaciones en localStorage
   */
  private saveToLocalStorage(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.notificationsSignal()));
  }

  /**
   * Agregar una nueva notificación
   */
  addNotification(notification: CRMNotification): void {
    this.notificationsSignal.update(notifications => [notification, ...notifications]);
    this.saveToLocalStorage();
  }

  /**
   * Marcar una notificación como leída
   */
  markAsRead(notificationId: string): void {
    this.notificationsSignal.update(notifications =>
      notifications.map(n =>
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    );
    this.saveToLocalStorage();
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  markAllAsRead(): void {
    this.notificationsSignal.update(notifications =>
      notifications.map(n => ({ ...n, isRead: true }))
    );
    this.saveToLocalStorage();
  }

  /**
   * Eliminar una notificación
   */
  deleteNotification(notificationId: string): void {
    this.notificationsSignal.update(notifications =>
      notifications.filter(n => n.id !== notificationId)
    );
    this.saveToLocalStorage();
  }

  /**
   * Limpiar todas las notificaciones
   */
  clearAll(): void {
    this.notificationsSignal.set([]);
    this.saveToLocalStorage();
  }

  /**
   * Generar notificaciones de prueba para clientes
   * Solo notificaciones relacionadas con sus propias incidencias
   */
  generateTestNotifications(): void {
    const testNotifications: CRMNotification[] = [
      {
        id: 'client-notif-1',
        type: 'INCIDENT_MESSAGE',
        title: 'Nuevo mensaje en tu incidencia',
        message: 'El equipo de soporte ha respondido a tu incidencia "Paquete dañado en transporte". Revisa el chat para ver los detalles.',
        priority: 'HIGH',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutos atrás
        relatedEntityId: '1',
        relatedEntityType: 'INCIDENT',
        metadata: {
          incidentName: 'Paquete dañado en transporte',
          userName: 'Agente de Soporte'
        }
      },
      {
        id: 'client-notif-2',
        type: 'INCIDENT_STATUS_CHANGED',
        title: 'Estado de incidencia actualizado',
        message: 'Tu incidencia "Error en entrega" ha cambiado de estado.',
        priority: 'MEDIUM',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutos atrás
        relatedEntityId: '2',
        relatedEntityType: 'INCIDENT',
        metadata: {
          incidentName: 'Error en entrega',
          previousStatus: 'Pendiente',
          newStatus: 'En Progreso'
        }
      },
      {
        id: 'client-notif-3',
        type: 'INCIDENT_UPDATED',
        title: 'Solicitud de información adicional',
        message: 'Necesitamos que proporciones evidencia adicional para tu incidencia "Pérdida de paquete". Por favor sube las imágenes solicitadas.',
        priority: 'URGENT',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hora atrás
        relatedEntityId: '3',
        relatedEntityType: 'INCIDENT',
        metadata: {
          incidentName: 'Pérdida de paquete'
        }
      },
      {
        id: 'client-notif-4',
        type: 'INCIDENT_RESOLVED',
        title: 'Incidencia resuelta',
        message: 'Tu incidencia "Retraso en envío" ha sido resuelta exitosamente. Gracias por tu paciencia.',
        priority: 'LOW',
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 horas atrás
        relatedEntityId: '4',
        relatedEntityType: 'INCIDENT',
        metadata: {
          incidentName: 'Retraso en envío'
        }
      },
      {
        id: 'client-notif-5',
        type: 'INCIDENT_MESSAGE',
        title: 'Actualización de tu incidencia',
        message: 'Hemos actualizado el estado de tu incidencia "Dirección incorrecta". Por favor revisa los comentarios del agente.',
        priority: 'MEDIUM',
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 día atrás
        relatedEntityId: '5',
        relatedEntityType: 'INCIDENT',
        metadata: {
          incidentName: 'Dirección incorrecta',
          userName: 'Agente de Soporte'
        }
      }
    ];

    this.notificationsSignal.set(testNotifications);
    this.saveToLocalStorage();
  }
}
