import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService, Theme } from '../../../../core/services/theme.service';
import { AuthService } from '../../../../services/auth.service';

interface MenuItem {
  path: string;
  label: string;
  icon: string;
}

type MobileViewMode = 'icons-only' | 'icons-with-names';

@Component({
  selector: 'app-crm-layout',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './crm-layout.html',
  styleUrl: './crm-layout.scss',
})
export class CrmLayout implements OnInit, OnDestroy {
  isCollapsed: boolean = false;
  isMobileMenuOpen: boolean = false;
  isViewOptionsModalOpen: boolean = false;
  mobileViewMode: MobileViewMode = 'icons-with-names';
  currentDate: string = '';
  private midnightTimer: any;

  // Servicios
  themeService = inject(ThemeService);
  authService = inject(AuthService);
  router = inject(Router);

  menuItems: MenuItem[] = [
    { path: '/crm/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/crm/incidencias', label: 'Incidencias', icon: 'incidencias' },
    { path: '/crm/usuarios', label: 'Usuarios', icon: 'usuarios' },
    { path: '/crm/empresas', label: 'Empresas', icon: 'empresas' },
    { path: '/crm/roles-permisos', label: 'Roles y Permisos', icon: 'roles' },
    { path: '/crm/reportes', label: 'Reportes', icon: 'reportes' }
  ];

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

    // Inicializar la fecha actual
    this.updateCurrentDate();
    this.scheduleMidnightUpdate();
  }

  ngOnDestroy() {
    // Limpiar el timer cuando el componente se destruya
    if (this.midnightTimer) {
      clearTimeout(this.midnightTimer);
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
   * Cierra la sesión del usuario y redirige al login
   */
  logout() {
    console.log('Logout button clicked!');

    // Limpiar datos de autenticación
    this.authService.logout();

    console.log('Auth service logout called, navigating to login...');

    // Redirigir al login
    this.router.navigate(['/login']).then(() => {
      console.log('Navigation to login completed');
    });
  }
}
