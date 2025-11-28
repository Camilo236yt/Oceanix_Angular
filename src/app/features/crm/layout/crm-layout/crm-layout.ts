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
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, VerificationBannerComponent, LoadingSpinner, NotificationToastComponent, NotificationsDropdown],
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

  // Chat Notifications (Toast)
  notifications = signal<Array<NewMessageNotification & { id: number }>>([]);

  // CRM Notifications (Dropdown)
  isNotificationDropdownOpen = false;

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
   * Filtra los items del menú según los permisos y userTypes del usuario
   * Si el usuario tiene al menos uno de los permisos requeridos O uno de los userTypes, muestra el item
   */
  private filterMenuItemsByPermissions(): void {
    this.menuItems = this.allMenuItems.filter(item => {
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
      this.crmNotificationsService.markAsRead(notification.id);
    }

    // Navegar si tiene actionUrl
    if (notification.actionUrl) {
      this.router.navigateByUrl(notification.actionUrl);
      this.isNotificationDropdownOpen = false;
    }
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
    this.crmNotificationsService.markAllAsRead();
  }

  /**
   * Eliminar notificación CRM
   */
  onDeleteNotification(notificationId: string): void {
    this.crmNotificationsService.deleteNotification(notificationId);
  }
}
