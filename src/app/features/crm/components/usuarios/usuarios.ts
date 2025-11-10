import { Component } from '@angular/core';
import { DataTable } from '../../../../shared/components/data-table/data-table';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { SearchFiltersComponent } from '../../../../shared/components/search-filters/search-filters.component';
import { TableColumn, TableAction } from '../../../../shared/models/table.model';
import { User } from '../../models/user.model';
import { FilterConfig, SearchFilterData } from '../../../../shared/models/filter.model';

@Component({
  selector: 'app-usuarios',
  imports: [DataTable, IconComponent, SearchFiltersComponent],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss',
})
export class Usuarios {
  // Configuración de filtros
  filterConfigs: FilterConfig[] = [
    {
      key: 'rol',
      label: 'Todos los roles',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Empleado', value: 'empleado' },
        { label: 'Supervisor', value: 'supervisor' }
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

  tableColumns: TableColumn[] = [
    { key: 'nombre', label: 'Nombre', sortable: true },
    { key: 'correo', label: 'Correo', sortable: true },
    {
      key: 'rol',
      label: 'Rol',
      type: 'badge',
      sortable: true,
      badgeConfig: {
        'Admin': {
          color: 'text-purple-700',
          bgColor: 'bg-purple-100',
          dotColor: 'bg-purple-700'
        },
        'Empleado': {
          color: 'text-gray-700',
          bgColor: 'bg-gray-100',
          dotColor: 'bg-gray-700'
        },
        'Supervisor': {
          color: 'text-orange-700',
          bgColor: 'bg-orange-100',
          dotColor: 'bg-orange-700'
        }
      }
    },
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
    { key: 'fechaRegistro', label: 'Fecha Registro', type: 'date', sortable: true },
    { key: 'actions', label: 'Acciones', type: 'actions', align: 'center' }
  ];

  tableActions: TableAction[] = [
    {
      icon: 'pencil',
      label: 'Editar',
      action: (row) => this.editUser(row)
    },
    {
      icon: 'trash-2',
      label: 'Eliminar',
      action: (row) => this.deleteUser(row),
      color: 'text-red-600 hover:text-red-700'
    }
  ];

  users: User[] = [
    {
      id: '1',
      nombre: 'Juan Pérez',
      correo: 'juan.perez@empresa.com',
      rol: 'Admin',
      estado: 'Activo',
      fechaRegistro: '14/6/2023'
    },
    {
      id: '2',
      nombre: 'María García',
      correo: 'maria.garcia@empresa.com',
      rol: 'Empleado',
      estado: 'Activo',
      fechaRegistro: '19/8/2023'
    },
    {
      id: '3',
      nombre: 'Carlos López',
      correo: 'carlos.lopez@empresa.com',
      rol: 'Supervisor',
      estado: 'Activo',
      fechaRegistro: '9/7/2023'
    },
    {
      id: '4',
      nombre: 'Ana Martínez',
      correo: 'ana.martinez@empresa.com',
      rol: 'Empleado',
      estado: 'Inactivo',
      fechaRegistro: '4/5/2023'
    }
  ];

  handleTableAction(event: { action: TableAction; row: any }) {
    event.action.action(event.row);
  }

  editUser(user: User) {
    console.log('Editar usuario:', user);
  }

  deleteUser(user: User) {
    console.log('Eliminar usuario:', user);
  }

  createNewUser() {
    console.log('Crear nuevo usuario');
  }

  onFilterChange(filterData: SearchFilterData) {
    console.log('Filtros aplicados:', filterData);
    // Aquí puedes implementar la lógica de filtrado
    // Por ejemplo, filtrar el array de users basado en searchTerm y filters
  }
}
