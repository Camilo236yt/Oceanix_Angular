import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

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
export class CrmLayout implements OnInit {
  isCollapsed: boolean = false;
  isMobileMenuOpen: boolean = false;
  isViewOptionsModalOpen: boolean = false;
  mobileViewMode: MobileViewMode = 'icons-with-names';

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
}
