import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService, Theme } from '../../../../core/services/theme.service';
import { AuthService } from '../../../../services/auth.service';
import { VerificationBannerComponent } from '../../../../shared/components/verification-banner/verification-banner.component';
import { LoadingSpinner } from '../../../../shared/components/loading-spinner/loading-spinner';
import { NotificationToastComponent } from '../../../../shared/components/notification-toast/notification-toast.component';
import { IncidenciaChatService, NewMessageNotification } from '../../../../shared/services/incidencia-chat.service';
import { NotificationsDropdown } from '../../components/notifications-dropdown/notifications-dropdown';
import { CrmNotificationsService } from '../../services/crm-notifications';
import { CRMNotification } from '../../models/notification.model';
import { NotificationDetailModal } from '../../../../shared/components/notification-detail-modal/notification-detail-modal';
import { UserProfileModal, UserProfileData } from '../../../../shared/components/user-profile-modal/user-profile-modal';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

interface MenuItem {
  path: string;
  label: string;
  icon: string;
  permissions: string[]; // Array de permisos requeridos (OR logic)
  userTypes?: string[]; // Array de userTypes requeridos (OR logic) - opcional
}

type MobileViewMode = 'icons-only' | 'icons-with-names';

@Component({
  selector: 'app-crm-layout',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, VerificationBannerComponent, LoadingSpinner, NotificationToastComponent, NotificationsDropdown, NotificationDetailModal, UserProfileModal],
  templateUrl: './crm-layout.html',
  styleUrl: './crm-layout.scss',
})
export class CrmLayout implements OnInit, OnDestroy {
  isCollapsed: boolean = false;
  isMobileMenuOpen: boolean = false;
  isViewOptionsModalOpen: boolean = false;
  isLoggingOut: boolean = false;
  isUserMenuOpen: boolean = false;
  mobileViewMode: MobileViewMode = 'icons-with-names';
  currentDate: string = '';
  private midnightTimer: any;
  private notificationSubscription?: Subscription;
  private unreadCountPolling?: any;

  // Chat Notifications (Toast)
  notifications = signal<Array<NewMessageNotification & { id: number }>>([]);

  // CRM Notifications (Dropdown)
  isNotificationDropdownOpen = false;

  // Modal de detalles de notificación
  isNotificationDetailModalOpen = false;
  selectedNotification: CRMNotification | null = null;

  // Modal de perfil de usuario
  isUserProfileModalOpen = false;
  userProfileData: UserProfileData | null = null;

  // Enterprise logo and name
  logoUrl: string | null = null;
  enterpriseName: string = 'IncidentCRM';
  userProfilePicture: string | null = null;

  // Servicios
  themeService = inject(ThemeService);
  authService = inject(AuthService);
  router = inject(Router);
  crmNotificationsService = inject(CrmNotificationsService);
  private cdr = inject(ChangeDetectorRef);
  private chatService = inject(IncidenciaChatService);

  private allMenuItems: MenuItem[] = [
    { path: '/crm/dashboard', label: 'Dashboard', icon: 'dashboard', permissions: ['read_dashboard'] },
    { path: '/crm/incidencias', label: 'Incidencias', icon: 'incidencias', permissions: ['view_incidents', 'view_own_incidents'] },
    { path: '/crm/usuarios', label: 'Usuarios', icon: 'usuarios', permissions: ['view_users'] },
    { path: '/crm/empresas', label: 'Empresas', icon: 'empresas', permissions: [], userTypes: ['SUPER_ADMIN'] },
    { path: '/crm/roles-permisos', label: 'Roles y Permisos', icon: 'roles', permissions: ['manage_roles', 'manage_permissions'] },
    { path: '/crm/reportes', label: 'Reportes', icon: 'reportes', permissions: ['view_reports'] }
  ];

  menuItems: MenuItem[] = [];

  ngOnInit() {
    // Cargar el estado del sidebar desde localStorage
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      this.isCollapsed = JSON.parse(savedState);
    }

    // Cargar la vista móvil desde localStorage
    const savedViewMode = localStorage.getItem('mobileViewMode') as MobileViewMode;
    if (savedViewMode) {
      this.mobileViewMode = savedViewMode;
    }

    // Filtrar menu items según permisos del usuario
    this.filterMenuItemsByPermissions();

    // Suscribirse a cambios en permisos para actualizar el menú dinámicamente
    this.authService.permissions$.subscribe(() => {
      this.filterMenuItemsByPermissions();
    });

    // Suscribirse al config para obtener el logo de la empresa
    this.authService.config$.subscribe((config) => {
      this.logoUrl = config?.logoUrl || null;
    });

    // Suscribirse a los datos de la empresa para obtener el nombre
    this.authService.meEnterprise$.subscribe((enterprise) => {
      this.enterpriseName = enterprise?.name || 'IncidentCRM';
    });

    // Suscribirse a los datos del usuario para obtener la foto de perfil
    this.authService.meUser$.subscribe((user) => {
      this.userProfilePicture = user?.profilePicture || null;
    });

    // Inicializar la fecha actual
    this.updateCurrentDate();
    this.scheduleMidnightUpdate();

    // Auto-conectar al WebSocket para recibir notificaciones
    const token = this.authService.getToken();
    if (token) {
      this.chatService.autoConnect(token);
    }

    // Suscribirse a notificaciones de nuevos mensajes
    this.notificationSubscription = this.chatService.newMessageNotification$.subscribe((notification) => {
      // Agregar notificación a la lista
      this.notifications.update(notifs => [...notifs, { id: Date.now(), ...notification }]);
    });

    // Cargar notificaciones del CRM desde el backend
    this.loadCRMNotifications();

    // Cargar contador de no leídas
    this.loadUnreadCount();

    // Configurar polling para actualizar contador cada 60 segundos
    this.startUnreadCountPolling();
  }

  /**
   * Cargar notificaciones del CRM desde el backend
   */
  private loadCRMNotifications(): void {
    this.crmNotificationsService.getNotifications().subscribe({
      next: (response) => {
        console.log('Notificaciones cargadas:', response);
      },
      error: (error) => {
        console.error('Error al cargar notificaciones:', error);
      }
    });
  }

  /**
   * Cargar contador de notificaciones no leídas
   */
  private loadUnreadCount(): void {
    this.crmNotificationsService.getUnreadCount().subscribe({
      next: (response) => {
        console.log('Contador de no leídas:', response.count);
      },
      error: (error) => {
        console.error('Error al cargar contador de no leídas:', error);
      }
    });
  }

  /**
   * Iniciar polling para actualizar el contador cada 60 segundos
   */
  private startUnreadCountPolling(): void {
    this.unreadCountPolling = setInterval(() => {
      this.loadUnreadCount();
    }, 60000); // 60 segundos
  }

  /**
   * Filtra los items del menú según los permisos y userTypes del usuario
   * Si el usuario tiene al menos uno de los permisos requeridos O uno de los userTypes, muestra el item
   */
  private filterMenuItemsByPermissions(): void {
    const isSuperAdmin = this.authService.hasUserType('SUPER_ADMIN');

    this.menuItems = this.allMenuItems.filter(item => {
      // Regla especial para SUPER_ADMIN: Solo mostrar items específicos para SUPER_ADMIN
      // Ignorar permisos regulares ya que SUPER_ADMIN los tiene todos
      if (isSuperAdmin) {
        return item.userTypes?.includes('SUPER_ADMIN');
      }

      // Si el item requiere userTypes, verificar que el usuario tenga al menos uno
      if (item.userTypes && item.userTypes.length > 0) {
        return this.authService.hasAnyUserType(item.userTypes);
      }

      // Si el item requiere permisos, verificar que el usuario tenga al menos uno
      if (item.permissions && item.permissions.length > 0) {
        return this.authService.hasAnyPermission(item.permissions);
      }

      // Si no tiene restricciones, mostrar el item
      return true;
    });
  }

  ngOnDestroy() {
    // Limpiar el timer cuando el componente se destruya
    if (this.midnightTimer) {
      clearTimeout(this.midnightTimer);
    }

    // Cancelar suscripción a notificaciones
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }

    // Limpiar polling de contador de no leídas
    if (this.unreadCountPolling) {
      clearInterval(this.unreadCountPolling);
    }
  }

  private updateCurrentDate() {
    const now = new Date();
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const dayName = days[now.getDay()];
    const day = now.getDate();
    const monthName = months[now.getMonth()];
    const year = now.getFullYear();

    this.currentDate = `${dayName}, ${day} De ${monthName} ${year}`;
  }

  private scheduleMidnightUpdate() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    // Programar actualización a medianoche
    this.midnightTimer = setTimeout(() => {
      this.updateCurrentDate();
      this.scheduleMidnightUpdate(); // Reprogramar para la siguiente medianoche
    }, msUntilMidnight);
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    // Guardar el estado en localStorage
    localStorage.setItem('sidebarCollapsed', JSON.stringify(this.isCollapsed));
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  openViewOptionsModal() {
    this.isViewOptionsModalOpen = true;
  }

  closeViewOptionsModal() {
    this.isViewOptionsModalOpen = false;
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  closeUserMenu() {
    this.isUserMenuOpen = false;
  }

  /**
   * Abrir modal de perfil de usuario
   */
  openUserProfileModal(): void {
    // Obtener datos del usuario desde authService (usando los observables)
    this.authService.meUser$.subscribe(user => {
      if (!user) return;

      this.authService.meEnterprise$.subscribe(enterprise => {
        if (!enterprise) return;

        this.authService.roles$.subscribe(roles => {
          this.userProfileData = {
            id: user.id,
            name: user.name,
            lastName: user.lastName,
            email: user.email,
            profilePicture: user.profilePicture,
            roles: roles || [],
            enterprise: {
              id: enterprise.id,
              name: enterprise.name
            },
            createdAt: new Date().toISOString() // Usamos la fecha actual como placeholder
          };
          this.isUserProfileModalOpen = true;
        }).unsubscribe();
      }).unsubscribe();
    }).unsubscribe();
  }

  /**
   * Cerrar modal de perfil de usuario
   */
  closeUserProfileModal(): void {
    this.isUserProfileModalOpen = false;
    this.userProfileData = null;
  }

  selectMobileViewMode(mode: MobileViewMode) {
    this.mobileViewMode = mode;
    localStorage.setItem('mobileViewMode', mode);
    this.closeViewOptionsModal();
  }

  // Métodos para el tema
  toggleTheme() {
    this.themeService.toggleTheme();
  }

  setTheme(theme: Theme) {
    this.themeService.setTheme(theme);
  }

  getCurrentTheme(): Theme {
    return this.themeService.theme();
  }

  isDarkMode(): boolean {
    return this.themeService.isDark();
  }

  /**
   * Muestra modal de confirmación para cerrar sesión
   */
  logout() {
    Swal.fire({
      title: '¿Cerrar sesión?',
      text: 'Se cerrará tu sesión actual',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#9333ea',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      focusCancel: true,
      customClass: {
        popup: 'rounded-2xl',
        title: 'text-gray-900',
        htmlContainer: 'text-gray-600'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.performLogout();
      }
    });
  }

  /**
   * Ejecuta el cierre de sesión
   */
  private performLogout() {
    // Mostrar animación de carga
    this.isLoggingOut = true;
    this.cdr.detectChanges();

    // Limpiar datos de autenticación y esperar a que la cookie del backend se limpie
    this.authService.logout().subscribe({
      next: () => {
        console.log('Backend logout completed successfully');
        // Delay para mostrar la animación antes de redirigir
        setTimeout(() => {
          this.performLogoutRedirect();
        }, 1000);
      },
      error: (error: any) => {
        console.error('Error during backend logout:', error);
        // Incluso si falla el backend, redirigir al login
        setTimeout(() => {
          this.performLogoutRedirect();
        }, 1000);
      }
    });
  }

  /**
   * Realiza la redirección al login según el entorno
   */
  private performLogoutRedirect(): void {
    const hostname = window.location.hostname;

    // Si estamos en localhost, usar router.navigate
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      this.router.navigate(['/admin']).then(() => {
        console.log('Navigation to login completed (localhost)');
      });
    } else {
      // En producción, usar window.location para forzar recarga completa
      // Esto asegura que se limpie todo el estado de la aplicación
      const loginUrl = `${window.location.protocol}//${hostname}/admin`;

      console.log('Redirecting to:', loginUrl);
      window.location.href = loginUrl;
    }
  }

  /**
   * Eliminar una notificación de la lista
   */
  removeNotification(id: number) {
    this.notifications.update(notifs => notifs.filter(n => n.id !== id));
  }

  /**
   * Navegar a una incidencia desde la notificación
   */
  openIncident(incidenciaId: string, notificationId: number) {
    // Eliminar la notificación
    this.removeNotification(notificationId);

    // Navegar a la página de incidencias (la modal se abrirá automáticamente si es necesario)
    this.router.navigate(['/crm/incidencias'], {
      queryParams: { incidenciaId: incidenciaId }
    });
  }

  /**
   * Manejar click en notificación CRM
   */
  onNotificationClick(notification: CRMNotification): void {
    // Marcar como leída si no está leída
    if (!notification.isRead) {
      this.crmNotificationsService.markAsRead(notification.id).subscribe({
        error: (error) => console.error('Error al marcar notificación como leída:', error)
      });
    }

    // Cerrar dropdown primero
    this.isNotificationDropdownOpen = false;

    // Forzar detección de cambios para cerrar el dropdown
    this.cdr.detectChanges();

    // Si es una notificación de reapertura, navegar directamente a la incidencia
    // Priorizamos metadata.incidenciaId sobre parsear el actionUrl
    const incidenciaId = notification.metadata?.['incidenciaId'] ||
      (notification.actionUrl?.startsWith('/incidencias/') ? notification.actionUrl.split('/').pop() : null);

    if (incidenciaId) {
      this.router.navigate(['/crm/incidencias'], {
        queryParams: { editIncidencia: incidenciaId } // Cambiado a editIncidencia para abrir modal de edición
      });
      return;
    }

    // Para otras notificaciones, abrir modal de detalles con un pequeño delay
    setTimeout(() => {
      this.selectedNotification = notification;
      this.isNotificationDetailModalOpen = true;
      this.cdr.detectChanges();
    }, 100);
  }

  /**
   * Cerrar modal de detalles de notificación
   */
  closeNotificationDetailModal(): void {
    this.isNotificationDetailModalOpen = false;
    this.selectedNotification = null;
  }

  /**
   * Marcar notificación CRM como leída
   */
  onMarkNotificationAsRead(notificationId: string): void {
    this.crmNotificationsService.markAsRead(notificationId);
  }

  /**
   * Marcar todas las notificaciones CRM como leídas
   */
  onMarkAllNotificationsAsRead(): void {
    this.crmNotificationsService.markAllAsRead().subscribe({
      next: (response) => console.log(response.message),
      error: (error) => console.error('Error al marcar todas como leídas:', error)
    });
  }

  /**
   * Eliminar notificación CRM
   */
  onDeleteNotification(notificationId: string): void {
    this.crmNotificationsService.deleteNotification(notificationId).subscribe({
      next: () => console.log('Notificación eliminada correctamente'),
      error: (error) => console.error('Error al eliminar notificación:', error)
    });
  }

  /**
   * Compartir link del portal de clientes
   */
  sharePortalLink(): void {
    const portalUrl = `${window.location.origin}/portal/login`;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // En móvil, intentar usar la API nativa de compartir (WhatsApp, etc.)
    if (isMobile && navigator.share) {
      navigator.share({
        title: 'Portal de Clientes',
        text: 'Accede al portal de clientes desde este link:',
        url: portalUrl
      }).then(() => {
        console.log('Link compartido exitosamente');
      }).catch((error) => {
        // Si el usuario cancela o hay error, mostrar el modal con el link
        if (error.name !== 'AbortError') {
          this.showPortalLinkModal(portalUrl);
        }
      });
    } else {
      // En desktop o si no hay soporte de share API, copiar al portapapeles y mostrar modal
      this.copyToClipboardAndShowModal(portalUrl);
    }
  }

  /**
   * Copiar al portapapeles y mostrar modal con el link
   */
  private copyToClipboardAndShowModal(portalUrl: string): void {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(portalUrl).then(() => {
        this.showPortalLinkModal(portalUrl, true);
      }).catch(() => {
        this.showPortalLinkModal(portalUrl, false);
      });
    } else {
      this.showPortalLinkModal(portalUrl, false);
    }
  }

  /**
   * Mostrar modal con el link del portal
   */
  private showPortalLinkModal(portalUrl: string, copied: boolean = false): void {
    Swal.fire({
      title: 'Comparte este link con tus clientes',
      html: `
        ${copied ? '<p style="margin-bottom: 12px; color: #059669; font-weight: 500;">✓ Link copiado al portapapeles</p>' : ''}
        <p style="margin-bottom: 16px; color: #6b7280; font-size: 14px;">Tus clientes podrán acceder al portal desde aquí:</p>
        <div style="position: relative;">
          <input
            id="portal-link-input"
            type="text"
            value="${portalUrl}"
            readonly
            onclick="this.select()"
            style="width: 100%; padding: 12px 45px 12px 12px; border: 2px solid #9333ea; border-radius: 8px; font-size: 14px; text-align: center; background-color: rgba(147, 51, 234, 0.05); font-family: monospace;"
          />
          <button
            onclick="
              const input = document.getElementById('portal-link-input');
              input.select();
              document.execCommand('copy');
              this.innerHTML = '✓';
              this.style.backgroundColor = '#059669';
              setTimeout(() => {
                this.innerHTML = '<svg style=\\'width: 16px; height: 16px; color: white;\\' fill=\\'none\\' stroke=\\'currentColor\\' viewBox=\\'0 0 24 24\\'><path stroke-linecap=\\'round\\' stroke-linejoin=\\'round\\' stroke-width=\\'2\\' d=\\'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z\\'></path></svg>';
                this.style.backgroundColor = '#9333ea';
              }, 2000);
            "
            style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background-color: #9333ea; color: white; border: none; border-radius: 6px; padding: 6px 10px; cursor: pointer; transition: all 0.2s;"
            title="Copiar link"
          >
            <svg style="width: 16px; height: 16px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
          </button>
        </div>
        <p style="margin-top: 16px; font-size: 13px; color: #6b7280;">Haz clic en el campo para seleccionar todo el link</p>
      `,
      icon: 'info',
      iconColor: '#9333ea',
      confirmButtonColor: '#9333ea',
      confirmButtonText: 'Cerrar',
      width: '600px',
      customClass: {
        popup: 'rounded-2xl',
        title: 'text-gray-900',
        htmlContainer: 'text-gray-600'
      }
    });
  }
}
