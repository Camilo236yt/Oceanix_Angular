import { Component, signal, OnInit, OnDestroy, ChangeDetectorRef, NgZone, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Incidencia } from '../../models/incidencia.model';
import { IncidenciasService, Message } from '../../services/incidencias.service';
import { getFieldError, isFieldInvalid, markFormGroupTouched } from '../../../../utils/form-helpers';
import { IncidenciaChatService, ChatMessage, AlertLevelChange } from '../../../../shared/services/incidencia-chat.service';
import { AuthClienteService } from '../../services/auth-cliente.service';
import { SecureImagePipe } from '../../../../shared/pipes/secure-image.pipe';
import { NotificationsDropdown } from '../../../../features/crm/components/notifications-dropdown/notifications-dropdown';
import { UserProfileModal, UserProfile } from '../user-profile-modal/user-profile-modal';
import { ClientNotificationsService } from '../../services/client-notifications.service';
import { CRMNotification } from '../../../../features/crm/models/notification.model';
import { LoadingSpinner } from '../../../../shared/components/loading-spinner/loading-spinner';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registro-cliente-incidencia',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SecureImagePipe, NotificationsDropdown, UserProfileModal, LoadingSpinner],
  templateUrl: './registro-cliente-incidencia.component.html',
  styleUrl: './registro-cliente-incidencia.component.scss'
})
export class RegistroClienteIncidenciaComponent implements OnInit, OnDestroy {
  // Estado del panel de historial
  historialVisible = signal(true);
  panelHistorialMobileVisible = signal(false);
  panelClosing = signal(false);

  // Formulario reactivo
  incidenciaForm!: FormGroup;
  archivosSeleccionados: File[] = [];
  imagenesPreview: string[] = [];
  readonly MAX_IMAGENES = 5;

  // Datos del historial
  incidencias: Incidencia[] = [];
  isLoadingIncidencias = true;

  // Modal de detalles
  isModalOpen = signal(false);
  selectedIncidencia: Incidencia | null = null;
  removingIncidenciaId: number | null = null;
  activeTab: 'details' | 'chat' = 'details';
  isLoadingIncidenciaDetails = false;

  // Chat en modal
  messages: Message[] = [];
  newMessage = '';
  isLoadingMessages = false;
  isSendingMessage = false;

  // Upload de imágenes en modal
  modalArchivos: File[] = [];
  modalPreviews: string[] = [];
  isUploadingImages = false;

  // WebSocket
  isConnected = false;
  private subscriptions: Subscription[] = [];

  // Typing indicator
  typingUsers = new Set<string>();
  private typingTimeout: any;

  // Notificaciones
  isNotificationDropdownOpen = false;
  clientNotificationsService = inject(ClientNotificationsService);

  // User Profile Modal
  isUserProfileModalOpen = false;
  userProfile: UserProfile = {
    fullName: 'María González Rodríguez',
    email: 'maria.gonzalez@cliente.com',
    createdAt: '20 de Enero, 2024'
  };

  // Obtener solo el primer nombre
  get firstName(): string {
    return this.userProfile.fullName.split(' ')[0];
  }

  // Loading spinner para logout
  isLoggingOut = false;

  constructor(
    private incidenciasService: IncidenciasService,
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private chatService: IncidenciaChatService,
    private authClienteService: AuthClienteService,
    private ngZone: NgZone
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.cargarIncidencias();

    console.log('🎬 [CLIENTE] Componente inicializado - Suscribiéndose a eventos WebSocket');

    // Suscribirse a eventos del WebSocket
    this.subscriptions.push(
      this.chatService.newMessage$.subscribe((message: ChatMessage) => {
        console.log('═══════════════════════════════════════════════════════');
        console.log('🔔 [CLIENTE] Nuevo mensaje recibido por WebSocket:', message);
        console.log('   - ID:', message.id);
        console.log('   - Contenido:', message.content);
        console.log('   - Tipo de remitente:', message.senderType);
        console.log('   - incidenciaId del mensaje:', (message as any).incidenciaId);
        console.log('   - Mensajes actuales:', this.messages.length);
        console.log('   - Incidencia seleccionada:', this.selectedIncidencia?.id);
        console.log('   - Incidencia seleccionada (toString):', this.selectedIncidencia?.id?.toString());

        // IMPORTANTE: Solo agregar mensajes que pertenecen a la incidencia actualmente abierta
        console.log('🔍 Verificación 1: ¿Hay incidencia seleccionada?');
        if (!this.selectedIncidencia) {
          console.log('   ❌ No hay incidencia seleccionada, ignorando mensaje');
          console.log('═══════════════════════════════════════════════════════');
          return;
        }
        console.log('   ✅ Sí hay incidencia seleccionada');

        // Verificar que el mensaje pertenece a la incidencia actual
        console.log('🔍 Verificación 2: ¿El mensaje pertenece a esta incidencia?');
        const messageIncidenciaId = (message as any).incidenciaId;
        const currentIncidenciaId = this.selectedIncidencia.id.toString();
        console.log('   - ID del mensaje:', messageIncidenciaId);
        console.log('   - ID de incidencia actual:', currentIncidenciaId);
        console.log('   - ¿Son iguales?:', messageIncidenciaId === currentIncidenciaId);

        if (messageIncidenciaId && messageIncidenciaId !== currentIncidenciaId) {
          console.log('   ❌ Mensaje pertenece a otra incidencia, ignorando');
          console.log('═══════════════════════════════════════════════════════');
          return;
        }
        console.log('   ✅ El mensaje pertenece a esta incidencia');

        // Evitar duplicados
        console.log('🔍 Verificación 3: ¿Es un mensaje duplicado?');
        const isDuplicate = this.messages.find(m => m.id === message.id);
        console.log('   - ¿Duplicado?:', !!isDuplicate);
        if (isDuplicate) {
          console.log('   ❌ Mensaje duplicado, ignorando');
          console.log('═══════════════════════════════════════════════════════');
          return;
        }
        console.log('   ✅ Mensaje no es duplicado');

        console.log('✅✅✅ TODAS LAS VERIFICACIONES PASARON - Agregando mensaje a la lista');
        this.ngZone.run(() => {
          this.messages = [...this.messages, message as Message];
          this.cdr.detectChanges();
          this.scrollToBottom(false); // Smart scroll para nuevos mensajes recibidos
          console.log('   📝 Mensaje agregado. Total de mensajes ahora:', this.messages.length);
        });
        console.log('═══════════════════════════════════════════════════════');
      }),
      this.chatService.connectionStatus$.subscribe((connected: boolean) => {
        console.log('🔌 [CLIENTE] Estado de conexión WebSocket cambió:', connected ? 'CONECTADO ✅' : 'DESCONECTADO ❌');
        this.isConnected = connected;
        this.cdr.detectChanges();
      }),
      this.chatService.error$.subscribe(() => {
        // Error handling
      }),
      // Suscribirse a cambios de nivel de alerta
      this.chatService.alertLevelChange$.subscribe((alertChange: AlertLevelChange) => {
        // Si hay una incidencia seleccionada y es la misma que cambió, actualizar
        if (this.selectedIncidencia && this.selectedIncidencia.id.toString() === alertChange.incidenciaId) {
          (this.selectedIncidencia.alertLevel as any) = alertChange.newLevel;
          this.cdr.detectChanges();
        }

        // Actualizar en la lista de incidencias
        const incidenciaEnLista = this.incidencias.find(i => i.id.toString() === alertChange.incidenciaId);
        if (incidenciaEnLista) {
          (incidenciaEnLista.alertLevel as any) = alertChange.newLevel;
          this.cdr.detectChanges();
        }
      }),

      // Suscribirse a imágenes subidas
      this.chatService.imagesUploaded$.subscribe((event) => {
        // Actualizar en la lista de incidencias primero
        const incidenciaEnLista = this.incidencias.find(i => i.id.toString() === event.incidenciaId);
        if (incidenciaEnLista) {
          if (!incidenciaEnLista.images) {
            incidenciaEnLista.images = [];
          }
          incidenciaEnLista.images = [...incidenciaEnLista.images, ...event.images];
        }

        // Si hay una incidencia seleccionada y es la misma, actualizar solo si es un objeto diferente
        // (Para evitar duplicados cuando selectedIncidencia y incidenciaEnLista son el mismo objeto)
        if (this.selectedIncidencia && this.selectedIncidencia.id.toString() === event.incidenciaId) {
          // Si no están en la lista o son objetos diferentes, actualizar
          if (!incidenciaEnLista || this.selectedIncidencia !== incidenciaEnLista) {
            if (!this.selectedIncidencia.images) {
              this.selectedIncidencia.images = [];
            }
            this.selectedIncidencia.images = [...this.selectedIncidencia.images, ...event.images];
          }
          // Si son el mismo objeto, ya se actualizó arriba, no hacer nada más
        }

        this.cdr.detectChanges();
      }),

      // Suscribirse a actualizaciones de incidencia (canClientUploadImages, etc)
      this.chatService.incidenciaUpdated$.subscribe((event) => {
        // Si hay una incidencia seleccionada y es la misma, actualizar
        if (this.selectedIncidencia && this.selectedIncidencia.id.toString() === event.incidenciaId) {
          const previousCanUpload = this.selectedIncidencia.canClientUploadImages;

          if (event.canClientUploadImages !== undefined) {
            this.selectedIncidencia.canClientUploadImages = event.canClientUploadImages;
          }
          this.cdr.detectChanges();

          // Si cambió de false a true y hay imágenes, hacer scroll al campo de upload
          if (!previousCanUpload && event.canClientUploadImages === true) {
            this.scrollToUploadSection();
          }
        }

        // Actualizar en la lista de incidencias
        const incidenciaEnLista = this.incidencias.find(i => i.id.toString() === event.incidenciaId);
        if (incidenciaEnLista) {
          if (event.canClientUploadImages !== undefined) {
            incidenciaEnLista.canClientUploadImages = event.canClientUploadImages;
          }
          this.cdr.detectChanges();
        }
      }),

      // Suscribirse al indicador de "escribiendo"
      this.chatService.typing$.subscribe((data: { userId: string; isTyping: boolean }) => {
        this.ngZone.run(() => {
          if (data.isTyping) {
            this.typingUsers.add(data.userId);
          } else {
            this.typingUsers.delete(data.userId);
          }
          this.cdr.detectChanges();
          this.scrollToBottom(false); // Smart scroll para typing
        });
      })
    );

    // Generar notificaciones de prueba al iniciar (solo si no hay notificaciones)
    if (this.clientNotificationsService.notifications().length === 0) {
      this.clientNotificationsService.generateTestNotifications();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.chatService.disconnect();
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
  }

  private initializeForm(): void {
    this.incidenciaForm = this.formBuilder.group({
      nombreIncidencia: ['', [Validators.required, Validators.minLength(3)]],
      numeroGuia: ['', [Validators.required, Validators.minLength(3)]],
      tipoIncidencia: ['', Validators.required],
      descripcion: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  // Métodos helper para validaciones
  isFieldInvalid(fieldName: string): boolean {
    return isFieldInvalid(this.incidenciaForm, fieldName);
  }

  getFieldError(fieldName: string): string {
    return getFieldError(this.incidenciaForm, fieldName);
  }

  cargarIncidencias(): void {
    this.isLoadingIncidencias = true;
    this.incidenciasService.getIncidencias().subscribe({
      next: (incidencias) => {
        this.incidencias = [...incidencias];
        this.isLoadingIncidencias = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingIncidencias = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleHistorial(): void {
    this.historialVisible.set(!this.historialVisible());
  }

  abrirHistorialMobile(): void {
    this.panelHistorialMobileVisible.set(true);
    this.panelClosing.set(false);
  }

  cerrarHistorialMobile(): void {
    this.panelClosing.set(true);
    // Esperar a que termine la animación antes de ocultar
    setTimeout(() => {
      this.panelHistorialMobileVisible.set(false);
      this.panelClosing.set(false);
    }, 300); // 300ms = duración de la animación
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const archivosNuevos = Array.from(input.files);

    // Limpiar el input inmediatamente
    input.value = '';

    for (const archivo of archivosNuevos) {
      if (this.archivosSeleccionados.length >= this.MAX_IMAGENES) {
        Swal.fire({
          icon: 'warning',
          title: 'Límite alcanzado',
          text: `Solo puedes subir un máximo de ${this.MAX_IMAGENES} imágenes.`,
          confirmButtonColor: '#7c3aed'
        });
        break;
      }

      // Validar tipo de archivo
      if (!archivo.type.match(/image\/(jpeg|jpg|png|webp)/)) {
        continue;
      }

      // Validar tamaño (5MB)
      if (archivo.size > 5 * 1024 * 1024) {
        continue;
      }

      // Agregar archivo y placeholder para preview
      this.archivosSeleccionados.push(archivo);
      this.imagenesPreview.push(''); // Placeholder
      const currentIndex = this.imagenesPreview.length - 1;

      // Forzar detección de cambios para mostrar el grid
      this.cdr.detectChanges();

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          this.imagenesPreview[currentIndex] = e.target.result as string;
          this.cdr.detectChanges();
        }
      };
      reader.readAsDataURL(archivo);
    }
  }

  eliminarImagen(index: number): void {
    this.archivosSeleccionados.splice(index, 1);
    this.imagenesPreview.splice(index, 1);
    this.cdr.detectChanges();
  }

  enviarIncidencia(): void {
    if (this.incidenciaForm.invalid) {
      markFormGroupTouched(this.incidenciaForm);
      return;
    }

    const formData = this.incidenciaForm.value;
    const request = {
      name: formData.nombreIncidencia,
      description: formData.descripcion,
      ProducReferenceId: formData.numeroGuia,
      tipo: formData.tipoIncidencia
    };

    // Usar método con imágenes si hay archivos seleccionados
    const peticion = this.archivosSeleccionados.length > 0
      ? this.incidenciasService.crearIncidenciaConImagenes(request, this.archivosSeleccionados)
      : this.incidenciasService.crearIncidencia(request);

    peticion.subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Incidencia registrada',
          text: 'Tu incidencia ha sido registrada exitosamente. Nuestro equipo la revisará a la brevedad.',
          confirmButtonColor: '#7c3aed'
        });

        // Limpiar formulario
        this.incidenciaForm.reset();
        this.archivosSeleccionados = [];
        this.imagenesPreview = [];

        // Recargar incidencias para mostrar en el historial
        this.cargarIncidencias();
      },
      error: (error) => {
        const errorMsg = error.error?.message || 'No se pudo registrar la incidencia. Por favor intenta nuevamente.';

        Swal.fire({
          icon: 'error',
          title: 'Error al registrar',
          text: errorMsg,
          confirmButtonColor: '#7c3aed'
        });
      }
    });
  }

  logout(): void {
    Swal.fire({
      title: '¿Cerrar sesión?',
      text: '¿Estás seguro de que deseas cerrar tu sesión?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#7c3aed',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Cerrar el modal de SweetAlert
        Swal.close();

        // Mostrar loading spinner
        this.isLoggingOut = true;
        this.cdr.detectChanges();

        // Simular tiempo de carga estándar (1 segundo) antes de cerrar sesión
        setTimeout(() => {
          this.authClienteService.logout();
        }, 1000);
      }
    });
  }

  verDetalles(incidencia: Incidencia): void {
    // Abrir modal inmediatamente con los datos básicos
    this.selectedIncidencia = incidencia;
    this.isModalOpen.set(true);
    this.isLoadingIncidenciaDetails = true; // Activar loading para detalles
    document.body.style.overflow = 'hidden';

    // Inicializar array vacío de mensajes para mostrar UI inmediatamente
    this.messages = [];
    this.isLoadingMessages = false; // Inicializar como false para mostrar "No hay mensajes"
    this.cdr.detectChanges(); // Forzar detección de cambios

    // Cargar mensajes y conectar chat inmediatamente en paralelo
    this.loadMessages();
    this.connectToChat();

    // Cargar datos completos en segundo plano (con prioridad en imágenes)
    this.incidenciasService.getMyIncidenciaById(incidencia.id.toString()).subscribe({
      next: (incidenciaCompleta) => {
        console.log('✅ Incidencia completa cargada:', incidenciaCompleta);
        console.log('📸 Imágenes:', incidenciaCompleta.images);
        this.selectedIncidencia = incidenciaCompleta;
        this.isLoadingIncidenciaDetails = false; // Desactivar loading
        this.cdr.detectChanges();
      },
      error: (error) => {
        // Si falla, mantener los datos básicos que ya tenemos
        console.error('❌ Error al cargar detalles completos de la incidencia:', error);
        this.isLoadingIncidenciaDetails = false; // Desactivar loading incluso en error
        this.cdr.detectChanges();
      }
    });
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedIncidencia = null;
    this.messages = [];
    this.newMessage = '';
    this.modalArchivos = [];
    this.modalPreviews = [];
    this.activeTab = 'details';
    this.isLightboxOpen = false; // Cerrar lightbox si está abierto
    this.isLoadingIncidenciaDetails = false; // Resetear loading
    this.chatService.leaveRoom();
    document.body.style.overflow = '';
  }

  switchTab(tab: 'details' | 'chat'): void {
    this.activeTab = tab;
  }

  private connectToChat(): void {
    if (!this.selectedIncidencia) {
      console.log('⚠️ [CLIENTE] No hay incidencia seleccionada para conectar al chat');
      return;
    }

    console.log('🔌 [CLIENTE] Conectando al chat para incidencia:', this.selectedIncidencia.id);

    // Conectar sin token - el backend autenticará con cookies
    if (!this.chatService.isConnected()) {
      console.log('   - Iniciando conexión WebSocket usando cookies (sin token)');
      this.chatService.connect(); // Sin token - usa withCredentials y cookies
    } else {
      console.log('   - WebSocket ya conectado');
    }

    // Esperar a que se conecte y unirse a la sala
    const checkConnection = setInterval(() => {
      if (this.chatService.isConnected()) {
        clearInterval(checkConnection);
        console.log('   ✅ Conexión WebSocket establecida, uniéndose a sala:', this.selectedIncidencia!.id.toString());
        this.chatService.joinRoom(this.selectedIncidencia!.id.toString());
      }
    }, 100);

    setTimeout(() => {
      clearInterval(checkConnection);
      if (!this.chatService.isConnected()) {
        console.error('   ❌ Timeout: No se pudo conectar al WebSocket en 10 segundos');
      }
    }, 10000);
  }

  loadMessages(): void {
    if (!this.selectedIncidencia) return;

    this.isLoadingMessages = true;

    // Timeout de seguridad reducido a 3 segundos
    const loadingTimeout = setTimeout(() => {
      if (this.isLoadingMessages) {
        console.warn('Timeout: Los mensajes tardaron demasiado en cargar');
        this.isLoadingMessages = false;
        this.messages = [];
        this.cdr.detectChanges();
      }
    }, 3000); // 3 segundos

    this.incidenciasService.getMessages(this.selectedIncidencia.id.toString()).subscribe({
      next: (messages) => {
        clearTimeout(loadingTimeout);
        this.messages = messages;
        this.isLoadingMessages = false;
        this.cdr.detectChanges();
        // Usar requestAnimationFrame para scroll más suave
        requestAnimationFrame(() => this.scrollToBottom(true));
      },
      error: (error) => {
        clearTimeout(loadingTimeout);
        console.error('Error al cargar mensajes:', error);
        this.isLoadingMessages = false;
        this.messages = [];
        this.cdr.detectChanges();
      }
    });
  }

  async sendMessage(): Promise<void> {
    if (!this.newMessage.trim() || !this.selectedIncidencia) return;

    const messageContent = this.newMessage;
    this.newMessage = ''; // Limpiar inmediatamente para UX fluida

    // Detener indicador de "escribiendo" al enviar
    this.chatService.setTyping(false);
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }

    console.log('📤 [CLIENTE] Enviando mensaje:', messageContent);
    console.log('   - Conectado al WebSocket:', this.chatService.isConnected());
    console.log('   - Incidencia ID:', this.selectedIncidencia.id);

    // Intentar enviar por WebSocket si está conectado
    if (this.chatService.isConnected()) {
      try {
        console.log('   - Enviando por WebSocket...');
        await this.chatService.sendMessage(messageContent);
        console.log('   ✅ Mensaje enviado por WebSocket');
        this.cdr.detectChanges();
      } catch (error) {
        console.error('   ❌ Error al enviar por WebSocket, usando HTTP:', error);
        this.sendMessageViaHttp(messageContent);
      }
    } else {
      // Fallback a HTTP si no hay WebSocket
      console.log('   - WebSocket no conectado, usando HTTP');
      this.sendMessageViaHttp(messageContent);
    }
  }

  private sendMessageViaHttp(content: string): void {
    this.incidenciasService.sendMessage(this.selectedIncidencia!.id.toString(), content).subscribe({
      next: (message) => {
        // Solo agregar si no viene por WebSocket
        if (!this.messages.find(m => m.id === message.id)) {
          this.messages = [...this.messages, message];
        }
        this.cdr.detectChanges();
        this.scrollToBottom(true);
      },
      error: (error) => {
        console.error('Error al enviar mensaje:', error);
      }
    });
  }

  onModalFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const archivosNuevos = Array.from(input.files);
    input.value = '';

    for (const archivo of archivosNuevos) {
      if (this.modalArchivos.length >= this.MAX_IMAGENES) {
        Swal.fire({
          icon: 'warning',
          title: 'Límite alcanzado',
          text: `Solo puedes subir un máximo de ${this.MAX_IMAGENES} imágenes.`,
          confirmButtonColor: '#7c3aed'
        });
        break;
      }

      if (!archivo.type.match(/image\/(jpeg|jpg|png|webp)/)) continue;
      if (archivo.size > 5 * 1024 * 1024) continue;

      this.modalArchivos.push(archivo);
      this.modalPreviews.push('');
      const currentIndex = this.modalPreviews.length - 1;

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          this.modalPreviews[currentIndex] = e.target.result as string;
          this.cdr.detectChanges();
        }
      };
      reader.readAsDataURL(archivo);
    }
    this.cdr.detectChanges();
  }

  eliminarModalImagen(index: number): void {
    this.modalArchivos.splice(index, 1);
    this.modalPreviews.splice(index, 1);
    this.cdr.detectChanges();
  }

  uploadModalImages(): void {
    if (!this.selectedIncidencia || this.modalArchivos.length === 0 || this.isUploadingImages) return;

    this.isUploadingImages = true;
    this.incidenciasService.uploadImages(this.selectedIncidencia.id.toString(), this.modalArchivos).subscribe({
      next: () => {
        this.modalArchivos = [];
        this.modalPreviews = [];
        this.isUploadingImages = false;
        this.cdr.detectChanges();

        // Recargar mensajes para ver el mensaje con las imágenes
        this.loadMessages();

        Swal.fire({
          icon: 'success',
          title: 'Imágenes enviadas',
          text: 'Las imágenes se han subido correctamente.',
          confirmButtonColor: '#7c3aed',
          timer: 3000,
          timerProgressBar: true
        });
      },
      error: (error) => {
        this.isUploadingImages = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.error?.message || 'No se pudieron subir las imágenes.',
          confirmButtonColor: '#7c3aed'
        });
      }
    });
  }

  formatMessageTime(isoDate: string): string {
    const date = new Date(isoDate);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  private scrollToBottom(force: boolean = false): void {
    setTimeout(() => {
      const chatContainer = document.getElementById('client-chat-messages');
      if (chatContainer) {
        // Si es forzado (ej: envío propio), hacer scroll siempre
        if (force) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
          return;
        }

        // Si no es forzado (ej: typing o mensaje recibido), solo scroll si ya estaba abajo
        const threshold = 150; // Margen de píxeles para considerar que está "abajo"
        const position = chatContainer.scrollTop + chatContainer.offsetHeight;
        const height = chatContainer.scrollHeight;

        // Si la distancia al final es menor al umbral, hacer scroll
        if (height - position < threshold) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      }
    }, 100);
  }

  handleBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  getEstadoClass(status: string): string {
    switch (status) {
      case 'IN_PROGRESS':
        return 'bg-orange-100 text-orange-800';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-red-100 text-red-800';
      case 'CLOSED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'RESOLVED': 'Resuelto',
      'PENDING': 'Pendiente',
      'IN_PROGRESS': 'En Progreso',
      'CLOSED': 'Cerrado'
    };
    return statusMap[status] || status;
  }

  getTipoLabel(tipo: string): string {
    const tipoMap: { [key: string]: string } = {
      'por_perdida': 'Pérdida',
      'por_dano': 'Daño',
      'por_error_humano': 'Error Humano',
      'por_mantenimiento': 'Mantenimiento',
      'por_falla_tecnica': 'Falla Técnica',
      'otro': 'Otro'
    };
    return tipoMap[tipo] || tipo;
  }

  formatDate(isoDate: string): string {
    const date = new Date(isoDate);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  formatDateTime(isoDate: string): string {
    const date = new Date(isoDate);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  cancelarIncidencia(): void {
    if (!this.selectedIncidencia) return;

    Swal.fire({
      title: '¿Cancelar incidencia?',
      text: 'Esta acción no se puede deshacer. La incidencia será eliminada permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No, mantener',
      customClass: {
        container: 'swal-high-zindex'
      }
    }).then((result) => {
      if (result.isConfirmed && this.selectedIncidencia) {
        const incidenciaId = this.selectedIncidencia.id;

        this.incidenciasService.eliminarIncidencia(incidenciaId).subscribe({
          next: () => {
            // Cerrar modal
            this.closeModal();

            // Iniciar animación de eliminación
            this.removingIncidenciaId = incidenciaId;
            this.cdr.detectChanges();

            // Esperar a que termine la animación y eliminar del array
            setTimeout(() => {
              this.incidencias = this.incidencias.filter(inc => inc.id !== incidenciaId);
              this.removingIncidenciaId = null;
              this.cdr.detectChanges();
            }, 400);
          },
          error: (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: error.error?.message || 'No se pudo cancelar la incidencia. Por favor intenta nuevamente.',
              confirmButtonColor: '#7c3aed',
              customClass: {
                container: 'swal-high-zindex'
              }
            });
          }
        });
      }
    });
  }

  /**
   * Manejar click en notificación
   */
  onNotificationClick(notification: CRMNotification): void {
    // Marcar como leída si no está leída
    if (!notification.isRead) {
      this.clientNotificationsService.markAsRead(notification.id);
    }

    // Navegar si tiene actionUrl
    if (notification.actionUrl) {
      // TODO: Implementar navegación para el portal
      console.log('Navegar a:', notification.actionUrl);
    }

    this.isNotificationDropdownOpen = false;
  }

  /**
   * Marcar notificación como leída
   */
  onMarkNotificationAsRead(notificationId: string): void {
    this.clientNotificationsService.markAsRead(notificationId);
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  onMarkAllNotificationsAsRead(): void {
    this.clientNotificationsService.markAllAsRead();
  }

  /**
   * Eliminar notificación
   */
  onDeleteNotification(notificationId: string): void {
    this.clientNotificationsService.deleteNotification(notificationId);
  }

  /**
   * Abrir modal de perfil de usuario
   */
  openUserProfileModal(): void {
    this.isUserProfileModalOpen = true;
  }

  /**
   * Cerrar modal de perfil de usuario
   */
  closeUserProfileModal(): void {
    this.isUserProfileModalOpen = false;
  }

  /**
   * Getter para verificar si el chat está deshabilitado
   */
  get isChatDisabled(): boolean {
    return this.selectedIncidencia?.status === 'RESOLVED';
  }

  // Lightbox para ver imágenes en tamaño completo
  isLightboxOpen = false;
  lightboxImageIndex = 0;

  /**
   * Abrir lightbox con la imagen seleccionada
   */
  openLightbox(index: number): void {
    this.lightboxImageIndex = index;
    this.isLightboxOpen = true;
    this.cdr.detectChanges();
  }

  /**
   * Cerrar lightbox
   */
  closeLightbox(): void {
    this.isLightboxOpen = false;
    this.cdr.detectChanges();
  }

  /**
   * Navegar a la siguiente imagen en el lightbox
   */
  nextLightboxImage(event: Event): void {
    event.stopPropagation();
    if (!this.selectedIncidencia?.images || this.selectedIncidencia.images.length === 0) return;

    const totalImages = this.selectedIncidencia.images.length;
    this.lightboxImageIndex = (this.lightboxImageIndex + 1) % totalImages;
    this.cdr.detectChanges();
  }

  /**
   * Navegar a la imagen anterior en el lightbox
   */
  previousLightboxImage(event: Event): void {
    event.stopPropagation();
    if (!this.selectedIncidencia?.images || this.selectedIncidencia.images.length === 0) return;

    const totalImages = this.selectedIncidencia.images.length;
    this.lightboxImageIndex = this.lightboxImageIndex === 0
      ? totalImages - 1
      : this.lightboxImageIndex - 1;
    this.cdr.detectChanges();
  }

  /**
   * Hacer scroll automático al campo de upload de evidencia
   * Solo se ejecuta si hay imágenes que puedan estar ocultando el campo
   */
  private scrollToUploadSection(): void {
    // Solo hacer scroll si hay imágenes existentes que puedan ocultar el campo
    if (!this.selectedIncidencia?.images || this.selectedIncidencia.images.length === 0) {
      return;
    }

    // Esperar a que el DOM se actualice y el elemento esté visible
    setTimeout(() => {
      const uploadSection = document.getElementById('upload-evidence-section');
      if (uploadSection) {
        uploadSection.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }, 300);
  }

  /**
   * Maneja el evento de input para detectar cuando el usuario está escribiendo
   */
  onMessageInput(event: Event): void {
    const text = (event.target as HTMLInputElement).value;

    if (text.length > 0) {
      // Emitir "escribiendo" cuando el usuario escribe
      this.chatService.setTyping(true);

      // Auto-cancelar después de 3 segundos de inactividad
      if (this.typingTimeout) {
        clearTimeout(this.typingTimeout);
      }
      this.typingTimeout = setTimeout(() => {
        this.chatService.setTyping(false);
      }, 3000);
    } else {
      // Si el input está vacío, detener el indicador
      this.chatService.setTyping(false);
      if (this.typingTimeout) {
        clearTimeout(this.typingTimeout);
      }
    }
  }
}
