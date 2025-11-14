import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTable } from '../../../../shared/components/data-table/data-table';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { SearchFiltersComponent } from '../../../../shared/components/search-filters/search-filters.component';
import { TableColumn, TableAction } from '../../../../shared/models/table.model';
import { Role, RoleStats } from '../../models/role.model';
import { FilterConfig, SearchFilterData } from '../../../../shared/models/filter.model';
import { RolesService } from '../../services/roles.service';

@Component({
  selector: 'app-roles-permisos',
  imports: [CommonModule, DataTable, IconComponent, SearchFiltersComponent],
  templateUrl: './roles-permisos.html',
  styleUrl: './roles-permisos.scss',
})
export class RolesPermisos implements OnInit {
  constructor(private rolesService: RolesService) {}
  // Configuración de filtros
  filterConfigs: FilterConfig[] = [
    {
      key: 'rol',
      label: 'Todos los roles',
      options: [
        { label: 'SuperAdmin', value: 'superadmin' },
        { label: 'Admin', value: 'admin' },
        { label: 'Supervisor', value: 'supervisor' },
        { label: 'Empleado', value: 'empleado' }
      ]
    },
    {
      key: 'estado',
      label: 'Todos los estados',
      options: [
        { label: 'Activo', value: 'activo' },
        { label: 'Inactivo', value: 'inactivo' }
      ]
    }
  ];

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
          color: 'text-purple-600 dark:text-purple-400',
          bgColor: 'bg-transparent dark:bg-transparent',
          dotColor: 'bg-purple-600 dark:bg-purple-400'
        },
        'Admin': {
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-transparent dark:bg-transparent',
          dotColor: 'bg-blue-600 dark:bg-blue-400'
        },
        'Supervisor': {
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-transparent dark:bg-transparent',
          dotColor: 'bg-green-600 dark:bg-green-400'
        },
        'Empleado': {
          color: 'text-gray-600 dark:text-gray-300',
          bgColor: 'bg-transparent dark:bg-transparent',
          dotColor: 'bg-gray-600 dark:bg-gray-300'
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
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-transparent dark:bg-transparent',
          dotColor: 'bg-green-600 dark:bg-green-400'
        },
        'Inactivo': {
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-transparent dark:bg-transparent',
          dotColor: 'bg-red-600 dark:bg-red-400'
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

  roles: Role[] = [];

  ngOnInit() {
    this.loadRoles();
  }

  loadRoles() {
    this.rolesService.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        console.log('Roles cargados:', roles);
      },
      error: (error) => {
        console.error('Error al cargar roles:', error);
      }
    });
  }

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

  onFilterChange(filterData: SearchFilterData) {
    console.log('Filtros aplicados:', filterData);
    // Aquí puedes implementar la lógica de filtrado
    // Por ejemplo, filtrar el array de roles basado en searchTerm y filters
  }
}
