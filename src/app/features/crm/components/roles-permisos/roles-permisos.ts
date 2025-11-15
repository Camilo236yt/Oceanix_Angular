import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTable } from '../../../../shared/components/data-table/data-table';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { SearchFiltersComponent } from '../../../../shared/components/search-filters/search-filters.component';
import { PermissionsModalComponent } from '../../../../shared/components/permissions-modal/permissions-modal.component';
import { CreateRoleModalComponent } from '../../../../shared/components/create-role-modal/create-role-modal.component';
import { TableColumn, TableAction } from '../../../../shared/models/table.model';
import { Role, RoleStats } from '../../models/role.model';
import { FilterConfig, SearchFilterData } from '../../../../shared/models/filter.model';
import { CreateRoleRequest } from '../../../../shared/models/permission.model';
import { RolesService } from '../../services/roles.service';

@Component({
  selector: 'app-roles-permisos',
  imports: [CommonModule, DataTable, IconComponent, SearchFiltersComponent, PermissionsModalComponent, CreateRoleModalComponent],
  templateUrl: './roles-permisos.html',
  styleUrl: './roles-permisos.scss',
})
export class RolesPermisos implements OnInit {
  constructor(
    private rolesService: RolesService,
    private cdr: ChangeDetectorRef
  ) {}
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

  tableColumns: TableColumn[] = [
    { key: 'rol', label: 'Rol', sortable: true },
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

  // Modal state
  isPermissionsModalOpen = false;
  selectedPermissions: string[] = [];
  selectedRoleName: string = '';
  isCreateRoleModalOpen = false;

  // Computed stats
  get totalRoles(): number {
    return this.roles.length;
  }

  get rolesActivos(): number {
    return this.roles.filter(role => role.estado === 'Activo').length;
  }

  get permisosTotales(): number {
    // Obtener todos los permisos únicos de todos los roles
    const allPermissions = new Set<string>();
    this.roles.forEach(role => {
      if (role.permisos && Array.isArray(role.permisos)) {
        role.permisos.forEach(permiso => allPermissions.add(permiso));
      }
    });
    return allPermissions.size;
  }

  get usuariosConRoles(): number {
    // Por ahora retorna 0 ya que el modelo Role no incluye información de usuarios
    // Este valor debe ser proporcionado por un servicio que tenga acceso a los datos de usuarios
    return 0;
  }

  ngOnInit() {
    this.loadRoles();
  }

  loadRoles() {
    this.rolesService.getRoles().subscribe({
      next: (roles) => {
        console.log('Roles cargados:', roles);
        this.roles = [...roles]; // Crear una nueva referencia del array
        this.cdr.detectChanges(); // Forzar la detección de cambios
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
    this.isCreateRoleModalOpen = true;
  }

  handleCreateRole(request: CreateRoleRequest) {
    console.log('Crear rol con datos:', request);
    this.rolesService.createRole(request).subscribe({
      next: (response: any) => {
        console.log('Rol creado exitosamente:', response);
        this.closeCreateRoleModal();
        this.loadRoles(); // Recargar la lista de roles
      },
      error: (error: any) => {
        console.error('Error al crear rol:', error);
      }
    });
  }

  closeCreateRoleModal() {
    this.isCreateRoleModalOpen = false;
  }

  onFilterChange(filterData: SearchFilterData) {
    console.log('Filtros aplicados:', filterData);
    // Aquí puedes implementar la lógica de filtrado
    // Por ejemplo, filtrar el array de roles basado en searchTerm y filters
  }

  trackByRoleId(index: number, role: Role): string {
    return role.id;
  }

  handleViewMorePermissions(event: { permissions: string[]; roleName: string }) {
    this.selectedPermissions = event.permissions;
    this.selectedRoleName = event.roleName;
    this.isPermissionsModalOpen = true;
  }

  closePermissionsModal() {
    this.isPermissionsModalOpen = false;
  }
}
