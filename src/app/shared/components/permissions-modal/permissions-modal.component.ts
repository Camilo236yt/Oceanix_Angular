import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-permissions-modal',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './permissions-modal.component.html',
  styleUrl: './permissions-modal.component.scss'
})
export class PermissionsModalComponent {
  @Input() isOpen = false;
  @Input() permissions: string[] = [];
  @Input() roleName: string = '';
  @Output() onClose = new EventEmitter<void>();
  isClosing = false;

  closeModal() {
    this.isClosing = true;

    // Esperar a que la animación de salida termine antes de cerrar
    setTimeout(() => {
      this.isClosing = false;
      this.onClose.emit();
    }, 500); // Duración de la animación de salida
  }

  // Agrupar permisos por categoría
  get groupedPermissions(): { [key: string]: string[] } {
    const groups: { [key: string]: string[] } = {};

    this.permissions.forEach(permission => {
      // Extraer la categoría del permiso (primera palabra)
      const category = this.extractCategory(permission);

      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(permission);
    });

    return groups;
  }

  get categoryKeys(): string[] {
    return Object.keys(this.groupedPermissions).sort();
  }

  private extractCategory(permission: string): string {
    // Intentar extraer categoría basada en patrones comunes
    const words = permission.split(' ');

    // Si contiene palabras clave, usarlas como categoría
    const keywords = ['Dashboard', 'Reportes', 'Incidencias', 'Categorías', 'Prioridades',
                     'Estados', 'Comentarios', 'Archivos', 'Usuarios', 'Roles',
                     'Permisos', 'Notificaciones', 'Emails', 'Email', 'Redis', 'Sistema',
                     'Verificación'];

    for (const keyword of keywords) {
      if (permission.includes(keyword)) {
        return keyword;
      }
    }

    // Si empieza con verbo (Ver, Crear, Editar, etc), usar la siguiente palabra
    const verbs = ['Ver', 'Crear', 'Editar', 'Eliminar', 'Gestionar', 'Exportar', 'Asignar', 'Cerrar', 'Reabrir', 'Descargar', 'Subir', 'Enviar'];
    if (verbs.includes(words[0]) && words.length > 1) {
      return words[1];
    }

    return 'General';
  }

  getCategoryIcon(category: string): string {
    const iconMap: { [key: string]: string } = {
      'Dashboard': 'layout-dashboard',
      'Reportes': 'file-text',
      'Incidencias': 'alert-circle',
      'Categorías': 'folder',
      'Prioridades': 'flag',
      'Estados': 'check-circle',
      'Comentarios': 'message-circle',
      'Archivos': 'file',
      'Usuarios': 'users',
      'Roles': 'shield',
      'Permisos': 'lock',
      'Notificaciones': 'bell',
      'Emails': 'mail',
      'Email': 'mail',
      'Redis': 'database',
      'Sistema': 'settings',
      'Verificación': 'check-square',
      'General': 'list'
    };

    return iconMap[category] || 'list';
  }
}
