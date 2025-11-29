import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';

export interface ChatMessage {
  id: string;
  content: string;
  senderType: 'EMPLOYEE' | 'CLIENT';
  messageType: string;
  createdAt: string;
  sender?: {
    id: string;
    name: string;
    lastName: string;
  };
}

export interface AlertLevelChange {
  incidenciaId: string;
  previousLevel: string;
  newLevel: string;
  minutesSinceCreation: number;
  emoji: string;
  timestamp: string;
}

export interface ImagesUploadedEvent {
  incidenciaId: string;
  images: Array<any>; // Array compatible con IncidentImage o IncidenciaImage
  imageCount: number;
  timestamp: string;
}

export interface IncidenciaUpdatedEvent {
  incidenciaId: string;
  canClientUploadImages?: boolean;
  [key: string]: any;
}

export interface NewMessageNotification {
  incidenciaId: string;
  incidenciaName: string;
  message: {
    id: string;
    content: string;
    senderType: string;
    timestamp: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class IncidenciaChatService implements OnDestroy {
  private socket: Socket | null = null;
  private currentIncidenciaId: string | null = null;

  // Subjects para eventos
  private newMessageSubject = new Subject<ChatMessage>();
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new Subject<string>();
  private typingSubject = new Subject<{ userId: string; isTyping: boolean }>();
  private alertLevelChangeSubject = new Subject<AlertLevelChange>();
  private imagesUploadedSubject = new Subject<ImagesUploadedEvent>();
  private incidenciaUpdatedSubject = new Subject<IncidenciaUpdatedEvent>();
  private newMessageNotificationSubject = new Subject<NewMessageNotification>();

  // Observables públicos
  newMessage$ = this.newMessageSubject.asObservable();
  connectionStatus$ = this.connectionStatusSubject.asObservable();
  error$ = this.errorSubject.asObservable();
  typing$ = this.typingSubject.asObservable();
  alertLevelChange$ = this.alertLevelChangeSubject.asObservable();
  imagesUploaded$ = this.imagesUploadedSubject.asObservable();
  incidenciaUpdated$ = this.incidenciaUpdatedSubject.asObservable();
  newMessageNotification$ = this.newMessageNotificationSubject.asObservable();

  constructor() {}

  /**
   * Conectar al WebSocket con el token de autenticación
   * Si no se proporciona token, se usarán las cookies (para clientes)
   */
  connect(token?: string): void {
    if (this.socket?.connected) {
      console.log('ℹ️ [ChatService] Ya conectado al WebSocket, saltando conexión');
      return;
    }

    console.log('🔌 [ChatService] Iniciando conexión WebSocket...');
    console.log('   - Con token:', token ? 'Sí (empleado)' : 'No (cliente con cookies)');

    // Construir URL del WebSocket
    // En desarrollo apiUrl es relativo (/api/v1), necesitamos la URL completa del backend
    let wsUrl: string;
    if (environment.apiUrl.startsWith('/')) {
      // Desarrollo: usar URL hardcodeada del backend
      wsUrl = 'https://backend-dev.oceanix.space';
    } else {
      // Producción: extraer del apiUrl
      wsUrl = environment.apiUrl.replace('/api/v1', '');
    }

    console.log('   - URL WebSocket:', `${wsUrl}/chat`);

    // Configuración base
    const socketConfig: any = {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      withCredentials: true, // Enviar cookies en cross-origin requests
    };

    // Solo agregar auth si hay token (empleados)
    // Si no hay token (clientes), socket.io usará las cookies automáticamente
    if (token) {
      socketConfig.auth = { token };
      console.log('   - Autenticación: Token JWT');
    } else {
      console.log('   - Autenticación: Cookies (withCredentials: true)');
    }

    this.socket = io(`${wsUrl}/chat`, socketConfig);

    this.setupEventListeners();
  }

  /**
   * Configurar listeners de eventos del socket
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ [ChatService] WebSocket conectado');
      this.connectionStatusSubject.next(true);

      // Reconectar a la sala si había una incidencia activa
      if (this.currentIncidenciaId) {
        console.log('🔄 [ChatService] Reconectando a sala:', this.currentIncidenciaId);
        this.joinRoom(this.currentIncidenciaId);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('❌ [ChatService] WebSocket desconectado');
      this.connectionStatusSubject.next(false);
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('❌ [ChatService] Error de conexión:', error);
      this.errorSubject.next('Error de conexión al chat');
      this.connectionStatusSubject.next(false);
    });

    // Evento de nuevo mensaje
    this.socket.on('newMessage', (data: { message: ChatMessage }) => {
      console.log('📨 [ChatService] Evento newMessage recibido:', data);
      console.log('   🔄 Emitiendo a todos los suscriptores de newMessage$');
      this.newMessageSubject.next(data.message);
    });

    // Evento de solicitud de imágenes
    this.socket.on('imageReuploadRequested', (data: { message: ChatMessage; incidenciaId: string }) => {
      this.newMessageSubject.next(data.message);
    });

    // Evento de usuario escribiendo
    this.socket.on('userTyping', (data: { userId: string; isTyping: boolean }) => {
      this.typingSubject.next(data);
    });

    // Evento de cambio de nivel de alerta
    this.socket.on('alertLevelChanged', (data: AlertLevelChange) => {
      this.alertLevelChangeSubject.next(data);
    });

    // Evento de imágenes subidas
    this.socket.on('imagesUploaded', (data: ImagesUploadedEvent) => {
      this.imagesUploadedSubject.next(data);
    });

    // Evento de actualización de incidencia (canClientUploadImages, etc)
    this.socket.on('incidenciaUpdated', (data: IncidenciaUpdatedEvent) => {
      this.incidenciaUpdatedSubject.next(data);
    });

    // Evento de notificación de nuevo mensaje (cuando empleado no está en la sala)
    this.socket.on('newMessageNotification', (data: NewMessageNotification) => {
      this.newMessageNotificationSubject.next(data);
    });

    // Evento de error
    this.socket.on('error', (data: { message: string }) => {
      this.errorSubject.next(data.message);
    });
  }

  /**
   * Auto-conectar al WebSocket para recibir notificaciones
   * Debe llamarse cuando el usuario se autentica
   */
  autoConnect(token: string): void {
    if (this.socket?.connected) {
      return; // Ya conectado
    }

    this.connect(token);
  }

  /**
   * Unirse a la sala de chat de una incidencia
   */
  joinRoom(incidenciaId: string): void {
    if (!this.socket?.connected) {
      console.warn('⚠️ [ChatService] No se puede unir a sala - WebSocket no conectado');
      return;
    }

    console.log('🚪 [ChatService] Uniéndose a sala de incidencia:', incidenciaId);
    this.currentIncidenciaId = incidenciaId;
    this.socket.emit('joinIncidenciaChat', { incidenciaId }, (response: any) => {
      if (response?.event === 'error') {
        console.error('❌ [ChatService] Error al unirse a sala:', response.data.message);
        this.errorSubject.next(response.data.message);
      } else {
        console.log('✅ [ChatService] Unido exitosamente a sala:', incidenciaId);
        console.log('   Respuesta:', response);
      }
    });
  }

  /**
   * Salir de la sala de chat actual
   */
  leaveRoom(): void {
    if (!this.socket?.connected || !this.currentIncidenciaId) {
      return;
    }

    this.socket.emit('leaveIncidenciaChat', { incidenciaId: this.currentIncidenciaId });
    this.currentIncidenciaId = null;
  }

  /**
   * Enviar un mensaje
   */
  sendMessage(content: string): Promise<ChatMessage> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected || !this.currentIncidenciaId) {
        reject(new Error('No hay conexión activa'));
        return;
      }

      this.socket.emit(
        'sendMessage',
        {
          incidenciaId: this.currentIncidenciaId,
          content,
        },
        (response: any) => {
          // Los errores vienen como { event: 'error', data: { message: '...' } }
          if (response?.event === 'error') {
            reject(new Error(response.data.message));
          } else {
            // El éxito viene directamente como { message: {...} }
            resolve(response?.message);
          }
        }
      );
    });
  }

  /**
   * Indicar que el usuario está escribiendo
   */
  setTyping(isTyping: boolean): void {
    if (!this.socket?.connected || !this.currentIncidenciaId) {
      return;
    }

    this.socket.emit('typing', {
      incidenciaId: this.currentIncidenciaId,
      isTyping,
    });
  }

  /**
   * Desconectar el socket
   */
  disconnect(): void {
    if (this.socket) {
      this.leaveRoom();
      this.socket.disconnect();
      this.socket = null;
      this.connectionStatusSubject.next(false);
    }
  }

  /**
   * Verificar si está conectado
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
