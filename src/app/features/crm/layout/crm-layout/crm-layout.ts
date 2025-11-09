import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

interface MenuItem {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-crm-layout',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './crm-layout.html',
  styleUrl: './crm-layout.scss',
})
export class CrmLayout {
  menuItems: MenuItem[] = [
    { path: '/crm/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/crm/incidencias', label: 'Incidencias', icon: 'incidencias' },
    { path: '/crm/usuarios', label: 'Usuarios', icon: 'usuarios' },
    { path: '/crm/empresas', label: 'Empresas', icon: 'empresas' },
    { path: '/crm/roles-permisos', label: 'Roles y Permisos', icon: 'roles' },
    { path: '/crm/reportes', label: 'Reportes', icon: 'reportes' }
  ];
}
