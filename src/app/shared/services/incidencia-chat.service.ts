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

  // Observables públicos
  newMessage$ = this.newMessageSubject.asObservable();
  connectionStatus$ = this.connectionStatusSubject.asObservable();
  error$ = this.errorSubject.asObservable();
  typing$ = this.typingSubject.asObservable();
  alertLevelChange$ = this.alertLevelChangeSubject.asObservable();

  constructor() {}

  /**
   * Conectar al WebSocket con el token de autenticación
   * Si no se proporciona token, se usarán las cookies (para clientes)
   */
  connect(token?: string): void {
    if (this.socket?.connected) {
      return;
    }

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
      this.connectionStatusSubject.next(true);

      // Reconectar a la sala si había una incidencia activa
      if (this.currentIncidenciaId) {
        this.joinRoom(this.currentIncidenciaId);
      }
    });

    this.socket.on('disconnect', () => {
      this.connectionStatusSubject.next(false);
    });

    this.socket.on('connect_error', () => {
      this.errorSubject.next('Error de conexión al chat');
      this.connectionStatusSubject.next(false);
    });

    // Evento de nuevo mensaje
    this.socket.on('newMessage', (data: { message: ChatMessage }) => {
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

    // Evento de error
    this.socket.on('error', (data: { message: string }) => {
      this.errorSubject.next(data.message);
    });
  }

  /**
   * Unirse a la sala de chat de una incidencia
   */
  joinRoom(incidenciaId: string): void {
    if (!this.socket?.connected) {
      return;
    }

    this.currentIncidenciaId = incidenciaId;
    this.socket.emit('joinIncidenciaChat', { incidenciaId }, (response: any) => {
      if (response?.event === 'error') {
        this.errorSubject.next(response.data.message);
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
