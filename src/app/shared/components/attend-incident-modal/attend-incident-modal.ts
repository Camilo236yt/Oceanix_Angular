import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { IconComponent } from '../icon/icon.component';
import { IncidentData } from '../../../features/crm/models/incident.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { IncidenciaChatService, ChatMessage, AlertLevelChange } from '../../services/incidencia-chat.service';
import { AuthService } from '../../../services/auth.service';
import { SecureImagePipe } from '../../pipes/secure-image.pipe';

interface Message {
  id: string;
  content: string;
  senderType: 'EMPLOYEE' | 'CLIENT';
  messageType: string;
  createdAt: string;
  sender?: {
    id: string;
    name: string;
    lastName: string;
    email?: string;
  };
  attachments?: string[];
}

interface MessagesResponse {
  messages: Message[];
  totalCount: number;
  hasMore: boolean;
  oldestMessageId?: string;
  newestMessageId?: string;
}

@Component({
  selector: 'app-attend-incident-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, SecureImagePipe],
  templateUrl: './attend-incident-modal.html',
  styleUrls: ['./attend-incident-modal.scss']
})
export class AttendIncidentModalComponent implements OnChanges, OnInit, OnDestroy {
  @Input() isOpen = false;
  @Input() incidentData: IncidentData | null = null;
  @Output() onClose = new EventEmitter<void>();
  @Output() onStatusChange = new EventEmitter<{ id: string; status: string }>();

  messages: Message[] = [];
  newMessage = '';
  isLoadingMessages = false;
  isSendingMessage = false;
  selectedStatus = '';

  // Mobile responsive
  activeTab: 'details' | 'chat' = 'details';

  // Request images
  isRequestingImages = false;
  showRequestImagesOptions = false;
  requestImagesHours = 24;

  // Carousel
  currentImageIndex = 0;
  isImageTransitioning = false;
  private imageCache = new Map<string, string>();

  // Lightbox
  isLightboxOpen = false;
  lightboxImageIndex = 0;
  isLightboxTransitioning = false;

  // WebSocket
  isConnected = false;
  private subscriptions: Subscription[] = [];

  private apiUrl = `${environment.apiUrl}/incidencias`;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private chatService: IncidenciaChatService,
    private authService: AuthService,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    if (this.incidentData) {
      this.selectedStatus = this.incidentData.status;
    }

    // Suscribirse a eventos del WebSocket
    this.subscriptions.push(
      this.chatService.newMessage$.subscribe((message: ChatMessage) => {
        console.log('📨 Nuevo mensaje recibido:', message);
        console.log('   - senderType:', message.senderType);
        console.log('   - messageType:', message.messageType);
        // Evitar duplicados
        if (!this.messages.find(m => m.id === message.id)) {
          this.messages = [...this.messages, message as Message];
          this.cdr.detectChanges();
          this.scrollToBottom();
        }
      }),
      this.chatService.connectionStatus$.subscribe((connected: boolean) => {
        this.isConnected = connected;
        this.cdr.detectChanges();
      }),
      this.chatService.error$.subscribe(() => {
        // Error manejado silenciosamente
      }),
      // Suscribirse a cambios de nivel de alerta
      this.chatService.alertLevelChange$.subscribe((alertChange: AlertLevelChange) => {
        // Si el incidentData actual es el que cambió, actualizar
        if (this.incidentData && this.incidentData.id === alertChange.incidenciaId) {
          (this.incidentData.alertLevel as any) = alertChange.newLevel;
          this.cdr.detectChanges();
        }
      }),

      // Suscribirse a imágenes subidas
      this.chatService.imagesUploaded$.subscribe((event) => {
        // Si el incidentData actual es el que recibió nuevas imágenes, actualizar
        if (this.incidentData && this.incidentData.id === event.incidenciaId) {
          if (!this.incidentData.images) {
            this.incidentData.images = [];
          }
          // Agregar las nuevas imágenes
          this.incidentData.images = [...this.incidentData.images, ...event.images];
          this.ngZone.run(() => {
            this.cdr.detectChanges();
          });
        }
      }),

      // Suscribirse a actualizaciones de incidencia
      this.chatService.incidenciaUpdated$.subscribe((event) => {
        if (this.incidentData && this.incidentData.id === event.incidenciaId) {
          if (event.canClientUploadImages !== undefined) {
            this.incidentData.canClientUploadImages = event.canClientUploadImages;
          }
          this.ngZone.run(() => {
            this.cdr.detectChanges();
          });
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.chatService.disconnect();
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const chatContainer = document.getElementById('chat-messages');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 100);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen']) {
      if (this.isOpen) {
        document.body.style.overflow = 'hidden';
        if (this.incidentData) {
          this.selectedStatus = this.incidentData.status;
          this.currentImageIndex = 0; // Reset carousel
          this.preloadImages(); // Precargar imágenes
          this.loadMessages();
          this.connectToChat();
        }
      } else {
        document.body.style.overflow = '';
        this.messages = [];
        this.newMessage = '';
        this.currentImageIndex = 0; // Reset carousel
        this.isLightboxOpen = false; // Close lightbox if open
        this.activeTab = 'details'; // Reset to details tab
        this.imageCache.clear(); // Limpiar cache
        this.chatService.leaveRoom();
      }
    }

    // Si incidentData cambia mientras el modal está abierto, reconectar
    if (changes['incidentData'] && this.isOpen && this.incidentData) {
      this.selectedStatus = this.incidentData.status;
      this.currentImageIndex = 0; // Reset carousel when incident changes
      this.preloadImages(); // Precargar imágenes
      this.loadMessages();
      this.connectToChat();
    }
  }

  private preloadImages() {
    if (!this.incidentData?.images) return;

    this.incidentData.images.forEach(image => {
      if (!this.imageCache.has(image.url)) {
        const img = new Image();
        img.src = `${environment.apiUrl}/incidencias/image/${image.url}`;
        img.onload = () => {
          this.imageCache.set(image.url, img.src);
        };
      }
    });
  }

  private connectToChat(): void {
    const token = this.authService.getToken();

    if (!token || !this.incidentData) {
      return;
    }

    // Conectar si no está conectado
    if (!this.chatService.isConnected()) {
      this.chatService.connect(token);
    }

    // Esperar a que se conecte y unirse a la sala
    const checkConnection = setInterval(() => {
      if (this.chatService.isConnected()) {
        clearInterval(checkConnection);
        this.chatService.joinRoom(this.incidentData!.id);
      }
    }, 100);

    // Timeout después de 5 segundos
    setTimeout(() => clearInterval(checkConnection), 5000);
  }

  loadMessages() {
    if (!this.incidentData) return;

    this.isLoadingMessages = true;
    this.cdr.detectChanges();

    this.http.get<{ data: MessagesResponse; statusCode: number }>(
      `${this.apiUrl}/${this.incidentData.id}/messages`,
      { withCredentials: true }
    ).subscribe({
      next: (response) => {
        this.ngZone.run(() => {
          this.messages = response.data?.messages || [];
          this.isLoadingMessages = false;
          this.cdr.markForCheck();
          this.cdr.detectChanges();
          setTimeout(() => {
            this.scrollToBottom();
          }, 50);
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.isLoadingMessages = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  async sendMessage() {
    if (!this.newMessage.trim() || !this.incidentData || this.isSendingMessage) return;

    const messageContent = this.newMessage;
    this.isSendingMessage = true;

    // Limpiar input inmediatamente para mejor UX
    this.newMessage = '';

    // Intentar enviar por WebSocket si está conectado
    if (this.chatService.isConnected()) {
      try {
        await this.chatService.sendMessage(messageContent);
        // Mensaje enviado exitosamente por WebSocket
        this.isSendingMessage = false;
        this.cdr.detectChanges();
      } catch (error) {
        console.error('Error sending via WebSocket, fallback to HTTP:', error);
        this.sendMessageViaHttp(messageContent);
      }
    } else {
      // Fallback a HTTP si no hay WebSocket
      this.sendMessageViaHttp(messageContent);
    }
  }

  private sendMessageViaHttp(content: string): void {
    this.http.post<any>(
      `${this.apiUrl}/${this.incidentData!.id}/messages`,
      { content },
      { withCredentials: true }
    ).subscribe({
      next: (response) => {
        const newMsg = response.data || response;
        // Solo agregar si no viene por WebSocket
        if (!this.messages.find(m => m.id === newMsg.id)) {
          this.messages = [...this.messages, newMsg];
        }
        this.isSendingMessage = false;
        this.cdr.detectChanges();
        this.scrollToBottom();
      },
      error: (error) => {
        console.error('Error sending message via HTTP:', error);
        this.isSendingMessage = false;
        this.cdr.detectChanges();
      }
    });
  }

  updateStatus() {
    if (!this.incidentData || this.selectedStatus === this.incidentData.status) return;

    // Actualizar el estado local inmediatamente
    this.incidentData.status = this.selectedStatus;

    // Emitir el evento para que el componente padre también actualice
    this.onStatusChange.emit({ id: this.incidentData.id, status: this.selectedStatus });

    // Forzar detección de cambios para actualizar la UI
    this.cdr.detectChanges();
  }

  closeModal() {
    this.onClose.emit();
  }

  handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  formatDateTime(isoDate: string): string {
    const date = new Date(isoDate);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  formatMessageTime(isoDate: string): string {
    const date = new Date(isoDate);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  get tipoLabel(): string {
    const tipoMap: { [key: string]: string } = {
      'por_perdida': 'Pérdida',
      'por_dano': 'Daño',
      'por_error_humano': 'Error Humano',
      'por_mantenimiento': 'Mantenimiento',
      'por_falla_tecnica': 'Falla Técnica',
      'otro': 'Otro'
    };
    return tipoMap[this.incidentData?.tipo || ''] || this.incidentData?.tipo || 'N/A';
  }

  get statusLabel(): string {
    const statusMap: { [key: string]: string } = {
      'RESOLVED': 'Resuelto',
      'PENDING': 'Pendiente',
      'IN_PROGRESS': 'En Progreso'
    };
    return statusMap[this.incidentData?.status || ''] || this.incidentData?.status || 'N/A';
  }

  get createdByName(): string {
    if (!this.incidentData) return 'Sistema';
    const createdBy = (this.incidentData as any).createdBy;
    if (createdBy && createdBy.name) {
      return `${createdBy.name} ${createdBy.lastName || ''}`.trim();
    }
    return 'Sistema';
  }

  get assignedEmployeeName(): string {
    if (!this.incidentData) return 'Sin asignar';
    const assignedEmployee = (this.incidentData as any).assignedEmployee;
    if (assignedEmployee && assignedEmployee.name) {
      return `${assignedEmployee.name} ${assignedEmployee.lastName || ''}`.trim();
    }
    return 'Sin asignar';
  }

  get isChatDisabled(): boolean {
    return this.incidentData?.status === 'RESOLVED';
  }

  switchTab(tab: 'details' | 'chat'): void {
    this.activeTab = tab;
    if (tab === 'chat') {
      // Scroll to bottom when switching to chat tab
      this.scrollToBottom();
    }
    this.cdr.detectChanges();
  }

  toggleRequestImagesOptions() {
    this.showRequestImagesOptions = !this.showRequestImagesOptions;
  }

  requestImages() {
    if (!this.incidentData || this.isRequestingImages) return;

    this.isRequestingImages = true;

    // Cerrar el panel inmediatamente
    this.showRequestImagesOptions = false;
    this.cdr.detectChanges();

    this.http.post<any>(
      `${this.apiUrl}/${this.incidentData.id}/request-images`,
      {
        message: 'Por favor, sube imágenes adicionales de evidencia para poder procesar tu incidencia.',
        hoursAllowed: this.requestImagesHours
      },
      { withCredentials: true }
    ).subscribe({
      next: () => {
        // No agregamos el mensaje manualmente, vendrá por WebSocket
        this.ngZone.run(() => {
          this.isRequestingImages = false;
          this.cdr.detectChanges();
        });
        // El mensaje llegará automáticamente por WebSocket y se mostrará
      },
      error: (error) => {
        console.error('Error requesting images:', error);
        this.ngZone.run(() => {
          this.isRequestingImages = false;
          this.showRequestImagesOptions = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  // Carousel methods
  nextImage(event: Event) {
    event.stopPropagation();
    if (!this.incidentData?.images || this.incidentData.images.length === 0) return;

    const totalImages = this.incidentData.images.length;
    this.currentImageIndex = (this.currentImageIndex + 1) % totalImages;
  }

  previousImage(event: Event) {
    event.stopPropagation();
    if (!this.incidentData?.images || this.incidentData.images.length === 0) return;

    const totalImages = this.incidentData.images.length;
    this.currentImageIndex = this.currentImageIndex === 0
      ? totalImages - 1
      : this.currentImageIndex - 1;
  }

  // Lightbox methods
  openLightbox(index: number) {
    this.lightboxImageIndex = index;
    this.isLightboxOpen = true;
    this.cdr.detectChanges();
  }

  closeLightbox() {
    this.isLightboxOpen = false;
    this.cdr.detectChanges();
  }

  nextLightboxImage(event: Event) {
    event.stopPropagation();
    if (!this.incidentData?.images || this.incidentData.images.length === 0) return;

    const totalImages = this.incidentData.images.length;
    this.isLightboxTransitioning = true;
    setTimeout(() => {
      this.lightboxImageIndex = (this.lightboxImageIndex + 1) % totalImages;
      this.isLightboxTransitioning = false;
      this.cdr.detectChanges();
    }, 150);
  }

  previousLightboxImage(event: Event) {
    event.stopPropagation();
    if (!this.incidentData?.images || this.incidentData.images.length === 0) return;

    const totalImages = this.incidentData.images.length;
    this.isLightboxTransitioning = true;
    setTimeout(() => {
      this.lightboxImageIndex = this.lightboxImageIndex === 0
        ? totalImages - 1
        : this.lightboxImageIndex - 1;
      this.isLightboxTransitioning = false;
      this.cdr.detectChanges();
    }, 150);
  }

}
