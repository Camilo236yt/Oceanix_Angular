export type NotificationType =
  | 'INCIDENT_ASSIGNED'      // Nueva incidencia asignada
  | 'INCIDENT_STATUS_CHANGED' // Cambio de estado en incidencia
  | 'INCIDENT_MESSAGE'        // Nuevo mensaje en el chat
  | 'INCIDENT_UPDATED'        // Incidencia actualizada
  | 'INCIDENT_RESOLVED';      // Incidencia resuelta

export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface CRMNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  isRead: boolean;
  createdAt: Date;
  relatedEntityId?: string; // ID de la incidencia relacionada
  relatedEntityType?: 'INCIDENT' | 'USER' | 'COMPANY';
  metadata?: {
    incidentName?: string;
    incidentStatus?: string;
    previousStatus?: string;
    newStatus?: string;
    assignedBy?: string;
    userName?: string;
    companyName?: string;
    [key: string]: any;
  };
}

export interface NotificationStats {
  total: number;
  unread: number;
  byPriority: {
    urgent: number;
    high: number;
    medium: number;
    low: number;
  };
}
