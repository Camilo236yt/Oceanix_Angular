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

  // Observables públicos
  newMessage$ = this.newMessageSubject.asObservable();
  connectionStatus$ = this.connectionStatusSubject.asObservable();
  error$ = this.errorSubject.asObservable();
  typing$ = this.typingSubject.asObservable();

  constructor() {}

  /**
   * Conectar al WebSocket con el token de autenticación
   */
  connect(token: string): void {
    if (this.socket?.connected) {
      return;
    }

    console.log('🔑 Token received for WebSocket:', token ? `${token.substring(0, 20)}...` : 'NULL');
    console.log('🔑 Token length:', token?.length);
    console.log('🔑 Token type:', typeof token);

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

    console.log('Connecting to WebSocket:', `${wsUrl}/chat`);

    this.socket = io(`${wsUrl}/chat`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupEventListeners();
  }

  /**
   * Configurar listeners de eventos del socket
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.connectionStatusSubject.next(true);

      // Reconectar a la sala si había una incidencia activa
      if (this.currentIncidenciaId) {
        this.joinRoom(this.currentIncidenciaId);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected. Reason:', reason);
      console.log('Disconnect reasons: io server disconnect =', reason === 'io server disconnect',
                  ', io client disconnect =', reason === 'io client disconnect',
                  ', transport close =', reason === 'transport close');
      this.connectionStatusSubject.next(false);
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('WebSocket connection error:', error);
      console.error('Error details:', {
        message: error.message,
        description: error.description,
        context: error.context,
        type: error.type
      });
      this.errorSubject.next('Error de conexión al chat');
      this.connectionStatusSubject.next(false);
    });

    // Evento de nuevo mensaje
    this.socket.on('newMessage', (data: { message: ChatMessage }) => {
      console.log('New message received:', data.message);
      this.newMessageSubject.next(data.message);
    });

    // Evento de solicitud de imágenes
    this.socket.on('imageReuploadRequested', (data: { message: ChatMessage; incidenciaId: string }) => {
      console.log('Image reupload requested:', data);
      this.newMessageSubject.next(data.message);
    });

    // Evento de usuario escribiendo
    this.socket.on('userTyping', (data: { userId: string; isTyping: boolean }) => {
      this.typingSubject.next(data);
    });

    // Evento de error
    this.socket.on('error', (data: { message: string }) => {
      console.error('WebSocket error:', data.message);
      this.errorSubject.next(data.message);
    });
  }

  /**
   * Unirse a la sala de chat de una incidencia
   */
  joinRoom(incidenciaId: string): void {
    if (!this.socket?.connected) {
      console.warn('Cannot join room: socket not connected');
      return;
    }

    this.currentIncidenciaId = incidenciaId;
    this.socket.emit('joinIncidenciaChat', { incidenciaId }, (response: any) => {
      if (response?.event === 'error') {
        console.error('Error joining room:', response.data.message);
        this.errorSubject.next(response.data.message);
      } else {
        console.log('Joined room:', response?.data?.roomName);
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
          if (response?.event === 'error') {
            reject(new Error(response.data.message));
          } else {
            resolve(response?.data?.message);
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
