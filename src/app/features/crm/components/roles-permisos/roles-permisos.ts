import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTable } from '../../../../shared/components/data-table/data-table';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { SearchFiltersComponent } from '../../../../shared/components/search-filters/search-filters.component';
import { SkeletonLoader } from '../../../../shared/components/skeleton-loader/skeleton-loader';
import { PermissionsModalComponent } from '../../../../shared/components/permissions-modal/permissions-modal.component';
import { DynamicFormModalComponent } from '../../../../shared/components/dynamic-form-modal/dynamic-form-modal.component';
import { ViewRoleModalComponent } from '../../../../shared/components/view-role-modal/view-role-modal';
import { TableColumn, TableAction } from '../../../../shared/models/table.model';
import { Role, RoleStats } from '../../models/role.model';
import { FilterConfig, SearchFilterData } from '../../../../shared/models/filter.model';
import { CreateRoleRequest } from '../../../../shared/models/permission.model';
import { RolesService } from '../../services/roles.service';
import { RoleData } from '../../../../interface/roles-api.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-roles-permisos',
  imports: [CommonModule, DataTable, IconComponent, SearchFiltersComponent, SkeletonLoader, PermissionsModalComponent, DynamicFormModalComponent, ViewRoleModalComponent],
  templateUrl: './roles-permisos.html',
  styleUrl: './roles-permisos.scss',
})
export class RolesPermisos implements OnInit {
  // Loading state
  isLoading = true;

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
      icon: 'eye',
      label: 'Ver',
      action: (row) => this.viewRole(row)
    },
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
  isEditRoleModalOpen = false;
  editingRoleId: string | null = null;
  editingRoleData: { name: string; description: string; canReceiveIncidents: boolean; permissionIds: string[] } | null = null;

  // View role modal state
  isViewRoleModalOpen = false;
  viewingRoleData: RoleData | null = null;

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
    this.isLoading = true;
    this.rolesService.getRoles().subscribe({
      next: (roles) => {
        console.log('Roles cargados:', roles);
        this.roles = [...roles]; // Crear una nueva referencia del array
        this.isLoading = false;
        this.cdr.detectChanges(); // Forzar la detección de cambios
      },
      error: (error) => {
        console.error('Error al cargar roles:', error);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  handleTableAction(event: { action: TableAction; row: any }) {
    event.action.action(event.row);
  }

  viewRole(role: Role) {
    // Show loading
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'info',
      title: 'Cargando datos del rol...',
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Get full role data from backend
    this.rolesService.getRoleById(role.id).subscribe({
      next: (roleData) => {
        Swal.close();
        this.viewingRoleData = roleData;
        this.isViewRoleModalOpen = true;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error al cargar rol:', error);
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'Error al cargar el rol',
          text: 'No se pudo cargar la información del rol',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });
      }
    });
  }

  closeViewRoleModal() {
    this.isViewRoleModalOpen = false;
    this.viewingRoleData = null;
  }

  editRole(role: Role) {
    console.log('Editar rol:', role);

    // Mostrar loading inmediatamente
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'info',
      title: 'Cargando datos del rol...',
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Preparar los datos primero
    this.editingRoleId = role.id;

    // Obtener los datos completos del rol desde el backend
    this.rolesService.getRoleById(role.id).subscribe({
      next: (roleData) => {
        // Cerrar loading
        Swal.close();

        this.editingRoleData = {
          name: roleData.name,
          description: roleData.description,
          canReceiveIncidents: roleData.canReceiveIncidents ?? false,
          permissionIds: roleData.permissions.map(p => p.permission.id)
        };
        // Abrir el modal inmediatamente después de cargar los datos
        this.isEditRoleModalOpen = true;
        this.cdr.detectChanges();
      },
      error: (error) => {
        // Cerrar loading
        Swal.close();

        console.error('Error al cargar rol:', error);
        this.editingRoleId = null;
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'Error al cargar el rol',
          text: 'No se pudo cargar la información del rol',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });
      }
    });
  }

  deleteRole(role: Role) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `El rol "${role.rol}" será eliminado permanentemente`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.rolesService.deleteRole(role.id).subscribe({
          next: () => {
            this.loadRoles(); // Recargar la lista de roles

            // Mostrar notificación de éxito
            Swal.fire({
              toast: true,
              position: 'top-end',
              icon: 'success',
              title: 'Rol eliminado exitosamente',
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
              didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
              }
            });
          },
          error: (error: any) => {
            console.error('Error al eliminar rol:', error);

            // Mostrar notificación de error
            const errorMessage = error?.error?.message || 'No se pudo eliminar el rol. Por favor, intenta nuevamente.';
            Swal.fire({
              toast: true,
              position: 'top-end',
              icon: 'error',
              title: 'Error al eliminar el rol',
              text: errorMessage,
              showConfirmButton: false,
              timer: 4000,
              timerProgressBar: true,
              didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
              }
            });
          }
        });
      }
    });
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

        // Mostrar notificación de éxito
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Rol creado exitosamente',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
          }
        });
      },
      error: (error: any) => {
        console.error('Error al crear rol:', error);

        // Mostrar notificación de error
        const errorMessage = error?.error?.message || 'No se pudo crear el rol. Por favor, intenta nuevamente.';
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'Error al crear el rol',
          text: errorMessage,
          showConfirmButton: false,
          timer: 4000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
          }
        });
      }
    });
  }

  closeCreateRoleModal() {
    this.isCreateRoleModalOpen = false;
  }

  handleEditRole(data: any) {
    const { roleId, name, description, canReceiveIncidents, permissionIds } = data;
    console.log('Actualizar rol con datos:', data);

    this.rolesService.updateRole(roleId, { name, description, canReceiveIncidents, permissionIds }).subscribe({
      next: (response: any) => {
        console.log('Rol actualizado exitosamente:', response);
        this.closeEditRoleModal();
        this.loadRoles(); // Recargar la lista de roles

        // Mostrar notificación de éxito
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Rol actualizado exitosamente',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
          }
        });
      },
      error: (error: any) => {
        console.error('Error al actualizar rol:', error);

        // Mostrar notificación de error
        const errorMessage = error?.error?.message || 'No se pudo actualizar el rol. Por favor, intenta nuevamente.';
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'Error al actualizar el rol',
          text: errorMessage,
          showConfirmButton: false,
          timer: 4000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
          }
        });
      }
    });
  }

  closeEditRoleModal() {
    this.isEditRoleModalOpen = false;
    this.editingRoleId = null;
    this.editingRoleData = null;
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
