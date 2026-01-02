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
import { NotificationDetailModal } from '../../../../shared/components/notification-detail-modal/notification-detail-modal';
import { RequestReopenModalComponent } from '../request-reopen-modal/request-reopen-modal.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registro-cliente-incidencia',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SecureImagePipe, NotificationsDropdown, UserProfileModal, LoadingSpinner, NotificationDetailModal, RequestReopenModalComponent],
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

  // Polling de notificaciones
  private unreadCountPolling: any;

  // Notificaciones
  isNotificationDropdownOpen = false;
  clientNotificationsService = inject(ClientNotificationsService);

  // Modal de detalles de notificación
  isNotificationDetailModalOpen = false;
  selectedNotification: CRMNotification | null = null;

  // User Profile Modal
  isUserProfileModalOpen = false;
  userProfile: UserProfile = {
    fullName: '',
    email: ''
  };

  // Obtener solo el primer nombre
  get firstName(): string {
    return this.userProfile.fullName.split(' ')[0] || '';
  }

  // Loading spinner para logout
  isLoggingOut = false;

  // Loading para envío de incidencia
  isSubmittingIncidencia = false;

  // Modal de solicitud de reapertura
  isReopenModalOpen = false;
  selectedIncidenciaForReopen: Incidencia | null = null;

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
    this.cargarDatosUsuario();

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
        console.log('📸 [CLIENTE] Evento imagesUploaded recibido:', event);

        // Actualizar en la lista de incidencias primero
        const incidenciaEnLista = this.incidencias.find(i => i.id.toString() === event.incidenciaId);
        if (incidenciaEnLista) {
          if (!incidenciaEnLista.images) {
            incidenciaEnLista.images = [];
          }

          // Filtrar solo las imágenes que no existen ya (evitar duplicados)
          const newImages = event.images.filter(newImg =>
            !incidenciaEnLista.images!.some(existingImg => existingImg.id === newImg.id)
          );

          if (newImages.length > 0) {
            console.log(`📸 Agregando ${newImages.length} imágenes nuevas a la lista`);
            incidenciaEnLista.images = [...incidenciaEnLista.images, ...newImages];
          } else {
            console.log('⚠️ Todas las imágenes ya existen, saltando duplicados');
          }
        }

        // Si hay una incidencia seleccionada y es la misma, actualizar solo si es un objeto diferente
        // (Para evitar duplicados cuando selectedIncidencia y incidenciaEnLista son el mismo objeto)
        if (this.selectedIncidencia && this.selectedIncidencia.id.toString() === event.incidenciaId) {
          // Si no están en la lista o son objetos diferentes, actualizar
          if (!incidenciaEnLista || this.selectedIncidencia !== incidenciaEnLista) {
            if (!this.selectedIncidencia.images) {
              this.selectedIncidencia.images = [];
            }

            // Filtrar solo las imágenes que no existen ya (evitar duplicados)
            const newImages = event.images.filter(newImg =>
              !this.selectedIncidencia!.images!.some(existingImg => existingImg.id === newImg.id)
            );

            if (newImages.length > 0) {
              console.log(`📸 Agregando ${newImages.length} imágenes nuevas a selectedIncidencia`);
              this.selectedIncidencia.images = [...this.selectedIncidencia.images, ...newImages];
            }
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
      }),

      // Suscribirse a cambios de estado de incidencia (RESOLVED)
      this.chatService.incidenciaStatusChanged$.subscribe((data: { incidenciaId: string; status: string; timestamp: string }) => {
        console.log('📊 [CLIENTE] Estado de incidencia cambiado:', data);

        // Actualizar en la lista de incidencias
        const incidenciaEnLista = this.incidencias.find(i => i.id.toString() === data.incidenciaId);
        if (incidenciaEnLista) {
          incidenciaEnLista.status = data.status as 'RESOLVED' | 'PENDING' | 'IN_PROGRESS' | 'CLOSED';
        }

        // Si es la incidencia seleccionada, actualizar también
        if (this.selectedIncidencia && this.selectedIncidencia.id.toString() === data.incidenciaId) {
          this.selectedIncidencia.status = data.status as 'RESOLVED' | 'PENDING' | 'IN_PROGRESS' | 'CLOSED';

          // Si se marcó como RESOLVED, mostrar mensaje al usuario
          if (data.status === 'RESOLVED') {
            Swal.fire({
              icon: 'success',
              title: 'Incidencia Resuelta',
              text: 'Esta incidencia ha sido marcada como resuelta por nuestro equipo.',
              confirmButtonColor: '#7c3aed',
              timer: 5000,
              timerProgressBar: true,
              customClass: {
                container: 'swal-high-zindex'
              }
            });
          }
        }

        this.cdr.detectChanges();
      })
    );

    // Cargar notificaciones del backend
    this.loadClientNotifications();
    this.loadUnreadCount();

    // Iniciar polling del contador de notificaciones no leídas
    this.startUnreadCountPolling();
  }

  /**
   * Cargar notificaciones del cliente desde el backend
   */
  private loadClientNotifications(): void {
    this.clientNotificationsService.getNotifications().subscribe({
      next: (response) => {
        console.log('✅ [CLIENTE] Notificaciones cargadas desde backend:', response);
      },
      error: (error) => {
        console.error('❌ [CLIENTE] Error al cargar notificaciones:', error);
        // Fallback: Si falla, usar notificaciones de prueba del localStorage
        if (this.clientNotificationsService.notifications().length === 0) {
          this.clientNotificationsService.generateTestNotifications();
        }
      }
    });
  }

  /**
   * Cargar el contador de notificaciones no leídas
   */
  private loadUnreadCount(): void {
    this.clientNotificationsService.getUnreadCount().subscribe({
      next: (response) => {
        console.log('✅ [CLIENTE] Contador de no leídas:', response.count);
      },
      error: (error) => {
        console.error('❌ [CLIENTE] Error al cargar contador de no leídas:', error);
      }
    });
  }

  /**
   * Iniciar polling del contador de notificaciones no leídas
   * Se actualiza cada 60 segundos
   */
  private startUnreadCountPolling(): void {
    this.unreadCountPolling = setInterval(() => {
      this.loadUnreadCount();
    }, 60000); // 60 segundos
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.chatService.disconnect();
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
    // Limpiar polling de notificaciones
    if (this.unreadCountPolling) {
      clearInterval(this.unreadCountPolling);
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

      // Validar tamaño (30MB)
      if (archivo.size > 30 * 1024 * 1024) {
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
    console.log('🚀 [CREAR INCIDENCIA] Método enviarIncidencia() llamado');
    console.log('📋 Formulario válido:', this.incidenciaForm.valid);
    console.log('📋 Errores del formulario:', this.incidenciaForm.errors);
    console.log('📋 Estado de campos:');
    Object.keys(this.incidenciaForm.controls).forEach(key => {
      const control = this.incidenciaForm.get(key);
      console.log(`  - ${key}: válido=${control?.valid}, valor="${control?.value}", errores=`, control?.errors);
    });

    if (this.incidenciaForm.invalid) {
      console.error('❌ Formulario inválido, marcando campos como touched');
      markFormGroupTouched(this.incidenciaForm);
      return;
    }

    console.log('✅ Formulario válido, preparando petición');
    const formData = this.incidenciaForm.value;
    const request = {
      name: formData.nombreIncidencia,
      description: formData.descripcion,
      ProducReferenceId: formData.numeroGuia,
      tipo: formData.tipoIncidencia
    };

    console.log('📦 Request:', request);
    console.log('🖼️ Archivos seleccionados:', this.archivosSeleccionados.length);

    // Activar estado de carga
    this.isSubmittingIncidencia = true;

    // Usar método con imágenes si hay archivos seleccionados
    const peticion = this.archivosSeleccionados.length > 0
      ? this.incidenciasService.crearIncidenciaConImagenes(request, this.archivosSeleccionados)
      : this.incidenciasService.crearIncidencia(request);

    console.log('📡 Enviando petición HTTP...');

    peticion.subscribe({
      next: () => {
        this.isSubmittingIncidencia = false;

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
        this.isSubmittingIncidencia = false;

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
    console.log('🔍 [MODAL] Abriendo modal de incidencia:', incidencia.id);
    console.log('📊 Imágenes al abrir modal (desde lista):', incidencia.images?.length || 0);
    console.log('   - IDs:', incidencia.images?.map(img => img.id));

    // Abrir modal inmediatamente con los datos básicos
    this.isModalOpen.set(true);
    document.body.style.overflow = 'hidden';

    // Inicializar array vacío de mensajes para mostrar UI inmediatamente
    this.messages = [];
    this.isLoadingMessages = false; // Inicializar como false para mostrar "No hay mensajes"

    // OPTIMIZACIÓN: Si la incidencia ya tiene imágenes, usarlas inmediatamente
    // En lugar de esperar la respuesta del backend
    if (incidencia.images && incidencia.images.length > 0) {
      console.log('⚡ [OPTIMIZACIÓN] Usando imágenes ya cargadas de la lista');
      this.selectedIncidencia = { ...incidencia };
      this.isLoadingIncidenciaDetails = false; // No mostrar skeleton si ya tenemos datos
      this.cdr.detectChanges();

      // Cargar mensajes y chat en paralelo
      this.loadMessages();
      this.connectToChat();

      // Actualizar en segundo plano de forma silenciosa (sin skeleton)
      this.incidenciasService.getMyIncidenciaById(incidencia.id.toString()).subscribe({
        next: (incidenciaCompleta) => {
          // Actualizar solo si hay cambios (ej: nuevas imágenes)
          if (JSON.stringify(incidenciaCompleta.images) !== JSON.stringify(this.selectedIncidencia?.images)) {
            console.log('🔄 [MODAL] Actualizando con datos frescos del backend');
            this.selectedIncidencia = incidenciaCompleta;

            // Actualizar en la lista
            const indexEnLista = this.incidencias.findIndex(i => i.id === incidencia.id);
            if (indexEnLista !== -1) {
              Object.assign(this.incidencias[indexEnLista], incidenciaCompleta);
            }
            this.cdr.detectChanges();
          }
        },
        error: (error) => {
          console.error('❌ Error al actualizar incidencia:', error);
        }
      });
    } else {
      // Si no hay imágenes en la lista, cargar normalmente con skeleton
      console.log('📥 [MODAL] Cargando datos completos del backend...');
      this.isLoadingIncidenciaDetails = true;
      this.selectedIncidencia = { ...incidencia, images: [] };
      this.cdr.detectChanges();

      // Cargar mensajes y conectar chat inmediatamente en paralelo
      this.loadMessages();
      this.connectToChat();

      // Cargar datos completos
      this.incidenciasService.getMyIncidenciaById(incidencia.id.toString()).subscribe({
        next: (incidenciaCompleta) => {
          console.log('✅ [MODAL] Incidencia completa cargada desde backend');
          console.log('📊 Imágenes en la respuesta del backend:', incidenciaCompleta.images?.length || 0);

          this.selectedIncidencia = incidenciaCompleta;

          // Actualizar en la lista
          const indexEnLista = this.incidencias.findIndex(i => i.id === incidencia.id);
          if (indexEnLista !== -1) {
            Object.assign(this.incidencias[indexEnLista], incidenciaCompleta);
          }

          this.isLoadingIncidenciaDetails = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('❌ Error al cargar detalles completos de la incidencia:', error);
          this.isLoadingIncidenciaDetails = false;
          this.cdr.detectChanges();
        }
      });
    }
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

    const incidenciaId = this.selectedIncidencia.id.toString();
    console.log('═══════════════════════════════════════════════════════');
    console.log('🔌 [CLIENTE] Conectando al chat para incidencia:', this.selectedIncidencia.id);
    console.log('   📝 Incidencia ID (original):', this.selectedIncidencia.id);
    console.log('   📝 Incidencia ID (toString):', incidenciaId);
    console.log('   📝 Tipo de ID:', typeof this.selectedIncidencia.id);
    console.log('   🚪 Room name que se unirá:', `incidencia:${incidenciaId}`);

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
        console.log('   ✅ Conexión WebSocket establecida, uniéndose a sala:', incidenciaId);
        console.log('   🚪 Llamando joinRoom con:', incidenciaId);
        this.chatService.joinRoom(incidenciaId);
        console.log('═══════════════════════════════════════════════════════');
      }
    }, 100);

    setTimeout(() => {
      clearInterval(checkConnection);
      if (!this.chatService.isConnected()) {
        console.error('   ❌ Timeout: No se pudo conectar al WebSocket en 10 segundos');
        console.log('═══════════════════════════════════════════════════════');
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

    console.log('═══════════════════════════════════════════════════════');
    console.log('📤 [CLIENTE] Enviando mensaje:', messageContent);
    console.log('   - Conectado al WebSocket:', this.chatService.isConnected());
    console.log('   - Incidencia ID:', this.selectedIncidencia.id);
    console.log('   - Incidencia ID (toString):', this.selectedIncidencia.id.toString());
    console.log('   - Room esperado:', `incidencia:${this.selectedIncidencia.id.toString()}`);
    console.log('═══════════════════════════════════════════════════════');

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
          confirmButtonColor: '#7c3aed',
          customClass: {
            container: 'swal-high-zindex'
          }
        });
        break;
      }

      if (!archivo.type.match(/image\/(jpeg|jpg|png|webp)/)) continue;
      if (archivo.size > 30 * 1024 * 1024) continue;

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
    if (!this.selectedIncidencia || this.modalArchivos.length === 0 || this.isUploadingImages) {
      console.warn('⚠️ [UPLOAD] Subida cancelada por validación:', {
        hasIncidencia: !!this.selectedIncidencia,
        filesCount: this.modalArchivos.length,
        isUploading: this.isUploadingImages
      });
      return;
    }

    console.log('🚀 [UPLOAD] Iniciando subida de imágenes');
    console.log('📊 Estado ANTES de subir:');
    console.log('   - Incidencia ID:', this.selectedIncidencia.id);
    console.log('   - canClientUploadImages:', this.selectedIncidencia.canClientUploadImages);
    console.log('   - Archivos a subir:', this.modalArchivos.length);
    console.log('   - Imágenes actuales:', this.selectedIncidencia.images?.length || 0);
    console.log('   - IDs de imágenes actuales:', this.selectedIncidencia.images?.map(img => img.id));

    this.isUploadingImages = true;
    this.incidenciasService.uploadImages(this.selectedIncidencia.id.toString(), this.modalArchivos).subscribe({
      next: (response) => {
        console.log('✅ [UPLOAD] Respuesta del backend:', response);

        // IMPORTANTE: NO actualizar las imágenes desde la respuesta del backend
        // El WebSocket se encargará de enviar las imágenes y actualizar el array
        // Si el backend devuelve imágenes en la respuesta, las ignoramos completamente

        console.log('📊 Estado DESPUÉS de la respuesta del backend (esperando WebSocket):');
        console.log('   - Imágenes actuales:', this.selectedIncidencia?.images?.length || 0);
        console.log('   - IDs de imágenes actuales:', this.selectedIncidencia?.images?.map(img => img.id));

        // Limpiar archivos y previews
        this.modalArchivos = [];
        this.modalPreviews = [];
        this.isUploadingImages = false;
        this.cdr.detectChanges();

        // NO llamar a loadMessages() aquí - el WebSocket ya actualiza las imágenes en tiempo real
        // NO actualizar selectedIncidencia.images aquí - el WebSocket lo hará
        // Esto evita duplicación de imágenes

        Swal.fire({
          icon: 'success',
          title: 'Imágenes enviadas',
          text: 'Las imágenes se han subido correctamente.',
          confirmButtonColor: '#7c3aed',
          timer: 3000,
          timerProgressBar: true,
          customClass: {
            container: 'swal-high-zindex'
          }
        });
      },
      error: (error) => {
        console.error('❌ [UPLOAD] Error detallado al subir imágenes:');
        console.error('   - Error completo:', error);
        console.error('   - Status:', error.status);
        console.error('   - StatusText:', error.statusText);
        console.error('   - Error body:', error.error);
        console.error('   - Message:', error.error?.message);

        this.isUploadingImages = false;
        this.cdr.detectChanges();

        // Mensaje de error más detallado
        let errorMessage = 'No se pudieron subir las imágenes.';
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.status === 403) {
          errorMessage = 'No tienes permiso para subir imágenes en esta incidencia.';
        } else if (error.status === 400) {
          errorMessage = 'Los archivos enviados no son válidos.';
        } else if (error.status === 404) {
          errorMessage = 'La incidencia no fue encontrada.';
        } else if (error.status === 0) {
          errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
        }

        Swal.fire({
          icon: 'error',
          title: 'Error al subir imágenes',
          text: errorMessage,
          confirmButtonColor: '#7c3aed',
          customClass: {
            container: 'swal-high-zindex'
          }
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
      this.clientNotificationsService.markAsRead(notification.id).subscribe({
        error: (error) => console.error('Error al marcar notificación como leída:', error)
      });
    }

    // Abrir modal de detalles
    this.selectedNotification = notification;
    this.isNotificationDetailModalOpen = true;
    this.isNotificationDropdownOpen = false;
  }

  /**
   * Cerrar modal de detalles de notificación
   */
  closeNotificationDetailModal(): void {
    this.isNotificationDetailModalOpen = false;
    this.selectedNotification = null;
  }

  /**
   * Marcar notificación como leída
   */
  onMarkNotificationAsRead(notificationId: string): void {
    this.clientNotificationsService.markAsRead(notificationId).subscribe({
      error: (error) => console.error('Error al marcar notificación como leída:', error)
    });
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  onMarkAllNotificationsAsRead(): void {
    this.clientNotificationsService.markAllAsRead().subscribe({
      next: (response) => console.log(response.message),
      error: (error) => console.error('Error al marcar todas como leídas:', error)
    });
  }

  /**
   * Eliminar notificación
   */
  onDeleteNotification(notificationId: string): void {
    this.clientNotificationsService.deleteNotification(notificationId).subscribe({
      next: () => console.log('Notificación eliminada correctamente'),
      error: (error) => console.error('Error al eliminar notificación:', error)
    });
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

  /**
   * Cargar datos del usuario desde el endpoint /auth/me
   */
  cargarDatosUsuario(): void {
    this.authClienteService.getMe().subscribe({
      next: (response) => {
        if (response.success && response.data && response.data.user) {
          const user = response.data.user;
          this.userProfile = {
            fullName: `${user.name} ${user.lastName}`,
            email: user.email,
            profilePicture: user.profilePicture || null
          };
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error al cargar datos del usuario:', error);
      }
    });
  }

  // ============================================
  // MÉTODOS PARA SOLICITUD DE REAPERTURA
  // ============================================

  /**
   * Verificar si una incidencia puede ser reabierta
   */
  canRequestReopen(incidencia: Incidencia): boolean {
    const reopenableStatuses = ['CLOSED', 'CANCELLED', 'RESOLVED'];
    return reopenableStatuses.includes(incidencia.status);
  }

  /**
   * Abrir modal de solicitud de reapertura
   */
  openReopenModal(incidencia: Incidencia): void {
    this.selectedIncidenciaForReopen = incidencia;
    this.isReopenModalOpen = true;
  }

  /**
   * Cerrar modal de solicitud de reapertura
   */
  closeReopenModal(): void {
    this.isReopenModalOpen = false;
    this.selectedIncidenciaForReopen = null;
  }

  /**
   * Callback cuando se envía la solicitud de reapertura
   */
  onReopenRequestSubmitted(): void {
    this.closeReopenModal();

    // Cerrar el modal de detalles primero
    this.closeModal();

    // Recargar lista de incidencias
    this.cargarIncidencias();

    // Mostrar mensaje de éxito después de un pequeño delay para que se cierre el modal
    setTimeout(() => {
      Swal.fire({
        icon: 'success',
        title: 'Solicitud enviada',
        text: 'Tu solicitud de reapertura ha sido enviada. Recibirás una notificación cuando sea revisada.',
        confirmButtonColor: '#7c3aed'
      });
    }, 200);
  }
}
