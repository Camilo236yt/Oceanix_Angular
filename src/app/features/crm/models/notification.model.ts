export type NotificationType =
  | 'INCIDENT_ASSIGNED'      // Nueva incidencia asignada
  | 'INCIDENT_STATUS_CHANGED' // Cambio de estado en incidencia
  | 'INCIDENT_MESSAGE'        // Nuevo mensaje en el chat
  | 'INCIDENT_UPDATED'        // Incidencia actualizada
  | 'INCIDENT_RESOLVED';      // Incidencia resuelta

export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | 'NORMAL';

export interface CRMNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  isRead: boolean;
  readAt: string | null;
  createdAt: Date;
  actionUrl?: string; // URL para navegar al hacer click
  metadata?: {
    ticketId?: string;
    [key: string]: any;
  };
}

// Interfaces para la respuesta del backend
export interface BackendNotificationType {
  TICKET_ASSIGNED: 'INCIDENT_ASSIGNED';
  TICKET_STATUS_CHANGED: 'INCIDENT_STATUS_CHANGED';
  TICKET_MESSAGE: 'INCIDENT_MESSAGE';
  TICKET_UPDATED: 'INCIDENT_UPDATED';
  TICKET_RESOLVED: 'INCIDENT_RESOLVED';
}

export interface BackendNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  isRead: boolean;
  readAt: string | null;
  metadata: {
    ticketId?: string;
    [key: string]: any;
  };
  actionUrl: string;
  createdAt: string;
}

export interface NotificationsResponse {
  data: BackendNotification[];
  meta: {
    itemsPerPage: number;
    totalItems: number;
    currentPage: number;
    totalPages: number;
  };
  links: {
    first: string;
    next?: string;
    prev?: string;
    last: string;
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

export interface UnreadCountResponse {
  count: number;
}
