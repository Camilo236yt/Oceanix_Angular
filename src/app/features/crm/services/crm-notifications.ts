import { Injectable, signal, computed } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CRMNotification, NotificationStats } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class CrmNotificationsService {
  // Signal para notificaciones
  private notificationsSignal = signal<CRMNotification[]>([]);

  // Exponer señal como readonly
  public readonly notifications = this.notificationsSignal.asReadonly();

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
    // Cargar notificaciones desde localStorage si existen
    this.loadNotificationsFromStorage();
  }

  /**
   * Agregar una nueva notificación
   */
  addNotification(notification: Omit<CRMNotification, 'id' | 'createdAt' | 'isRead'>): void {
    const newNotification: CRMNotification = {
      ...notification,
      id: this.generateId(),
      createdAt: new Date(),
      isRead: false
    };

    this.notificationsSignal.update(notifs => [newNotification, ...notifs]);
    this.saveNotificationsToStorage();
  }

  /**
   * Marcar notificación como leída
   */
  markAsRead(notificationId: string): void {
    this.notificationsSignal.update(notifs =>
      notifs.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
    this.saveNotificationsToStorage();
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  markAllAsRead(): void {
    this.notificationsSignal.update(notifs =>
      notifs.map(n => ({ ...n, isRead: true }))
    );
    this.saveNotificationsToStorage();
  }

  /**
   * Eliminar una notificación
   */
  deleteNotification(notificationId: string): void {
    this.notificationsSignal.update(notifs =>
      notifs.filter(n => n.id !== notificationId)
    );
    this.saveNotificationsToStorage();
  }

  /**
   * Eliminar todas las notificaciones
   */
  clearAll(): void {
    this.notificationsSignal.set([]);
    this.saveNotificationsToStorage();
  }

  /**
   * Obtener notificación por ID
   */
  getNotificationById(id: string): CRMNotification | undefined {
    return this.notificationsSignal().find(n => n.id === id);
  }

  /**
   * Generar notificaciones de prueba
   */
  generateTestNotifications(): void {
    const testNotifications: Omit<CRMNotification, 'id' | 'createdAt' | 'isRead'>[] = [
      {
        type: 'INCIDENT_ASSIGNED',
        title: 'Nueva incidencia asignada',
        message: 'Se te ha asignado la incidencia "Falla en servidor principal". El cliente reporta problemas de conectividad intermitente desde esta mañana.',
        priority: 'HIGH',
        relatedEntityId: 'inc-001',
        relatedEntityType: 'INCIDENT',
        metadata: {
          incidentName: 'Falla en servidor principal',
          assignedBy: 'Juan Pérez (Supervisor)',
          incidentStatus: 'PENDING'
        }
      },
      {
        type: 'INCIDENT_STATUS_CHANGED',
        title: 'Estado de incidencia actualizado',
        message: 'La incidencia "Error en base de datos" cambió de estado de Pendiente a En Progreso. El equipo técnico ya está trabajando en la solución.',
        priority: 'MEDIUM',
        relatedEntityId: 'inc-002',
        relatedEntityType: 'INCIDENT',
        metadata: {
          incidentName: 'Error en base de datos',
          previousStatus: 'Pendiente',
          newStatus: 'En Progreso',
          userName: 'María González'
        }
      },
      {
        type: 'INCIDENT_MESSAGE',
        title: 'Nuevo mensaje en chat',
        message: 'El cliente respondió en la incidencia "Problema con autenticación": "El problema persiste después del último reinicio. ¿Pueden revisar los logs del servidor?"',
        priority: 'URGENT',
        relatedEntityId: 'inc-003',
        relatedEntityType: 'INCIDENT',
        metadata: {
          incidentName: 'Problema con autenticación',
          userName: 'Cliente - TechCorp S.A.',
          incidentStatus: 'IN_PROGRESS'
        }
      },
      {
        type: 'INCIDENT_RESOLVED',
        title: 'Incidencia resuelta',
        message: 'La incidencia "Lentitud en el sistema" ha sido marcada como resuelta. Se optimizaron las consultas a la base de datos y se reinició el servicio de caché.',
        priority: 'LOW',
        relatedEntityId: 'inc-004',
        relatedEntityType: 'INCIDENT',
        metadata: {
          incidentName: 'Lentitud en el sistema',
          userName: 'Carlos Rodríguez',
          companyName: 'Innovatech Solutions'
        }
      },
      {
        type: 'INCIDENT_UPDATED',
        title: 'Incidencia actualizada',
        message: 'Se actualizó la información de la incidencia "Backup fallido". Se agregaron detalles adicionales sobre los logs de error y se cambió la prioridad a alta.',
        priority: 'HIGH',
        relatedEntityId: 'inc-005',
        relatedEntityType: 'INCIDENT',
        metadata: {
          incidentName: 'Backup fallido',
          userName: 'Ana Martínez',
          previousStatus: 'PENDING',
          newStatus: 'IN_PROGRESS'
        }
      },
      {
        type: 'INCIDENT_ASSIGNED',
        title: 'Incidencia reasignada',
        message: 'La incidencia "Configuración de firewall" ha sido reasignada a tu equipo debido a la complejidad técnica del caso.',
        priority: 'MEDIUM',
        relatedEntityId: 'inc-006',
        relatedEntityType: 'INCIDENT',
        metadata: {
          incidentName: 'Configuración de firewall',
          assignedBy: 'Roberto Sánchez (Team Lead)',
          companyName: 'SecureNet Corp'
        }
      }
    ];

    // Agregar notificaciones con un pequeño delay entre cada una
    testNotifications.forEach((notif, index) => {
      setTimeout(() => {
        this.addNotification(notif);
      }, index * 100);
    });
  }

  /**
   * Cargar notificaciones desde localStorage
   */
  private loadNotificationsFromStorage(): void {
    try {
      const stored = localStorage.getItem('crm_notifications');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convertir las fechas de string a Date
        const notifications = parsed.map((n: any) => ({
          ...n,
          createdAt: new Date(n.createdAt)
        }));
        this.notificationsSignal.set(notifications);
      }
    } catch (error) {
      console.error('Error loading notifications from storage:', error);
    }
  }

  /**
   * Guardar notificaciones en localStorage
   */
  private saveNotificationsToStorage(): void {
    try {
      localStorage.setItem('crm_notifications', JSON.stringify(this.notificationsSignal()));
    } catch (error) {
      console.error('Error saving notifications to storage:', error);
    }
  }

  /**
   * Generar ID único para notificaciones
   */
  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
