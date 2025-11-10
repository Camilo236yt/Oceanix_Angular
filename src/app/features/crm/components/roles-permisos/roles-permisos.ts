import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTable } from '../../../../shared/components/data-table/data-table';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { TableColumn, TableAction } from '../../../../shared/models/table.model';
import { Role, RoleStats } from '../../models/role.model';

@Component({
  selector: 'app-roles-permisos',
  imports: [CommonModule, DataTable, IconComponent],
  templateUrl: './roles-permisos.html',
  styleUrl: './roles-permisos.scss',
})
export class RolesPermisos {
  stats: RoleStats = {
    totalRoles: 4,
    rolesActivos: 4,
    permisosTotales: 12,
    usuariosConRoles: 24
  };

  tableColumns: TableColumn[] = [
    {
      key: 'rol',
      label: 'Rol',
      type: 'badge',
      sortable: true,
      badgeConfig: {
        'SuperAdmin': {
          color: 'text-purple-700',
          bgColor: 'bg-purple-100',
          dotColor: 'bg-purple-700'
        },
        'Admin': {
          color: 'text-blue-700',
          bgColor: 'bg-blue-100',
          dotColor: 'bg-blue-700'
        },
        'Supervisor': {
          color: 'text-green-700',
          bgColor: 'bg-green-100',
          dotColor: 'bg-green-700'
        },
        'Empleado': {
          color: 'text-gray-700',
          bgColor: 'bg-gray-100',
          dotColor: 'bg-gray-700'
        }
      }
    },
    { key: 'descripcion', label: 'Descripción', sortable: true },
    { key: 'permisos', label: 'Permisos', type: 'badges' },
    {
      key: 'estado',
      label: 'Estado',
      type: 'badge',
      sortable: true,
      badgeConfig: {
        'Activo': {
          color: 'text-green-700',
          bgColor: 'bg-green-100',
          dotColor: 'bg-green-700'
        },
        'Inactivo': {
          color: 'text-red-700',
          bgColor: 'bg-red-100',
          dotColor: 'bg-red-700'
        }
      }
    },
    { key: 'actions', label: 'Acciones', type: 'actions', align: 'center' }
  ];

  tableActions: TableAction[] = [
    {
      icon: 'pencil',
      label: 'Editar',
      action: (row) => this.editRole(row)
    },
    {
      icon: 'trash-2',
      label: 'Eliminar',
      action: (row) => this.deleteRole(row),
      color: 'text-red-600 hover:text-red-700'
    }
  ];

  roles: Role[] = [
    {
      id: '1',
      rol: 'SuperAdmin',
      descripcion: 'Acceso total al sistema con todos los permisos administrativos',
      permisos: ['Gestión completa', 'Configuración del sistema', 'Gestión de usuarios', 'Gestión de roles'],
      estado: 'Activo'
    },
    {
      id: '2',
      rol: 'Admin',
      descripcion: 'Administrador con permisos de gestión de empresas y usuarios',
      permisos: ['Gestión de empresas', 'Gestión de usuarios', 'Gestión de incidencias'],
      estado: 'Activo'
    },
    {
      id: '3',
      rol: 'Supervisor',
      descripcion: 'Supervisor de incidencias y reportes con permisos limitados',
      permisos: ['Ver incidencias', 'Editar incidencias', 'Generar reportes'],
      estado: 'Activo'
    },
    {
      id: '4',
      rol: 'Empleado',
      descripcion: 'Usuario básico con permisos de consulta y registro de incidencias',
      permisos: ['Ver incidencias', 'Crear incidencias'],
      estado: 'Activo'
    }
  ];

  handleTableAction(event: { action: TableAction; row: any }) {
    event.action.action(event.row);
  }

  editRole(role: Role) {
    console.log('Editar rol:', role);
  }

  deleteRole(role: Role) {
    console.log('Eliminar rol:', role);
  }

  createNewRole() {
    console.log('Crear nuevo rol');
  }
}
