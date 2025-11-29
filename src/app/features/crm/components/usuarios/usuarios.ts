import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DataTable } from '../../../../shared/components/data-table/data-table';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { SearchFiltersComponent } from '../../../../shared/components/search-filters/search-filters.component';
import { SkeletonLoader } from '../../../../shared/components/skeleton-loader/skeleton-loader';
import { TableColumn, TableAction } from '../../../../shared/models/table.model';
import { User } from '../../models/user.model';
import { FilterConfig, SearchFilterData } from '../../../../shared/models/filter.model';
import { UsuariosService, UserPaginationParams, PaginatedUsersResult } from '../../services/usuarios.service';
import { RolesService } from '../../services/roles.service';
import { AuthService } from '../../../../services/auth.service';
import { CreateUserModalComponent } from '../../../../shared/components/create-user-modal/create-user-modal.component';
import { ViewUserModalComponent } from '../../../../shared/components/view-user-modal/view-user-modal';
import { CreateUserWithRolesRequest, UpdateUserRequest, RoleOption } from '../../../../shared/models/user-request.model';
import { UsuarioData } from '../../../../interface/usuarios-api.interface';
import { HasPermissionDirective } from '../../../../directives/has-permission.directive';
import Swal from 'sweetalert2';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-usuarios',
  imports: [DataTable, IconComponent, SearchFiltersComponent, SkeletonLoader, CreateUserModalComponent, ViewUserModalComponent, HasPermissionDirective],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss',
})
export class Usuarios implements OnInit {
  // Loading state
  isLoading = true;

  // Pagination state
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;
  searchTerm = '';
  activeFilters: Record<string, string> = { userType: 'EMPLOYEE', isActive: 'true' };

  // Modal state
  isCreateUserModalOpen = false;
  isEditMode = false;
  editingUserId: string | null = null;
  editingUserData: { name: string; lastName: string; email: string; phoneNumber: string; roleIds?: string[]; userType?: string } | null = null;
  availableRoles: RoleOption[] = [];

  // View user modal state
  isViewUserModalOpen = false;
  viewingUserData: UsuarioData | null = null;

  // Permisos para acciones
  canCreateUser = false;
  canEditUser = false;
  canDeleteUser = false;

  constructor(
    private usuariosService: UsuariosService,
    private rolesService: RolesService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { }
  // Configuración de filtros
  filterConfigs: FilterConfig[] = [
    {
      key: 'userType',
      label: 'Todos los tipos',
      options: [
        { label: 'Empleado', value: 'EMPLOYEE' },
        { label: 'Cliente', value: 'CLIENT' }
      ]
    },
    {
      key: 'isActive',
      label: 'Todos los estados',
      options: [
        { label: 'Activo', value: 'true' },
        { label: 'Inactivo', value: 'false' }
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
        'Admin Empresarial': {
          color: 'text-purple-600 dark:text-purple-400',
          bgColor: 'bg-transparent dark:bg-transparent',
          dotColor: 'bg-purple-600 dark:bg-purple-400'
        },
        'Empleado': {
          color: 'text-purple-600 dark:text-purple-400',
          bgColor: 'bg-transparent dark:bg-transparent',
          dotColor: 'bg-purple-600 dark:bg-purple-400'
        },
        'Cliente': {
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-transparent dark:bg-transparent',
          dotColor: 'bg-blue-600 dark:bg-blue-400'
        },
        'Super Admin': {
          color: 'text-purple-600 dark:text-purple-400',
          bgColor: 'bg-transparent dark:bg-transparent',
          dotColor: 'bg-purple-600 dark:bg-purple-400'
        },
        'Administrador techcorp': {
          color: 'text-purple-600 dark:text-purple-400',
          bgColor: 'bg-transparent dark:bg-transparent',
          dotColor: 'bg-purple-600 dark:bg-purple-400'
        },
        'Gestor de Usuarios techcorp': {
          color: 'text-purple-600 dark:text-purple-400',
          bgColor: 'bg-transparent dark:bg-transparent',
          dotColor: 'bg-purple-600 dark:bg-purple-400'
        },
        'Agente de Soporte techcorp': {
          color: 'text-purple-600 dark:text-purple-400',
          bgColor: 'bg-transparent dark:bg-transparent',
          dotColor: 'bg-purple-600 dark:bg-purple-400'
        },
        'Visualizador Limitado techcorp': {
          color: 'text-purple-600 dark:text-purple-400',
          bgColor: 'bg-transparent dark:bg-transparent',
          dotColor: 'bg-purple-600 dark:bg-purple-400'
        },
        'Gestor de Incidencias techcorp': {
          color: 'text-purple-600 dark:text-purple-400',
          bgColor: 'bg-transparent dark:bg-transparent',
          dotColor: 'bg-purple-600 dark:bg-purple-400'
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
    { key: 'fechaRegistro', label: 'Fecha Registro', type: 'date', sortable: true },
    { key: 'actions', label: 'Acciones', type: 'actions', align: 'left' }
  ];

  tableActions: TableAction[] = [];

  users: User[] = [];

  ngOnInit() {
    this.loadPermissions();
    this.loadUsuarios();
    this.loadRoles();
  }

  /**
   * Carga los permisos del usuario y configura las acciones de la tabla
   */
  private loadPermissions(): void {
    this.canCreateUser = this.authService.hasAnyPermission(['create_users']);
    this.canEditUser = this.authService.hasAnyPermission(['edit_users']);
    this.canDeleteUser = this.authService.hasAnyPermission(['delete_users']);

    // Configurar acciones de la tabla según permisos y estado del usuario
    this.tableActions = [];

    // Ver solo disponible para usuarios ACTIVOS
    this.tableActions.push({
      icon: 'eye',
      label: 'Ver',
      action: (row) => this.viewUser(row),
      condition: (row) => row.estado === 'Activo'
    });

    // Editar disponible para TODOS los usuarios (activos e inactivos)
    if (this.canEditUser) {
      this.tableActions.push({
        icon: 'pencil',
        label: 'Editar',
        action: (row) => this.editUser(row)
      });
    }

    // Eliminar solo para usuarios ACTIVOS
    if (this.canDeleteUser) {
      this.tableActions.push({
        icon: 'trash-2',
        label: 'Eliminar',
        action: (row) => this.deleteUser(row),
        color: 'text-red-600 hover:text-red-700',
        condition: (row) => row.estado === 'Activo'
      });
    }
  }

  loadRoles() {
    this.rolesService.getRoles().subscribe({
      next: (roles) => {
        this.availableRoles = roles
          .filter(role => role.estado === 'Activo')
          .map(role => ({
            id: role.id,
            name: role.rol,
            description: role.descripcion,
            isActive: role.estado === 'Activo'
          }));
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar roles:', error);
      }
    });
  }

  loadUsuarios() {
    this.isLoading = true;

    const params: UserPaginationParams = {
      page: this.currentPage,
      limit: this.itemsPerPage,
      sortBy: 'name',
      sortOrder: 'ASC'
    };

    if (this.searchTerm) {
      params.search = this.searchTerm;
    }

    // Add active filters to params
    if (Object.keys(this.activeFilters).length > 0) {
      params.filter = {};
      Object.keys(this.activeFilters).forEach(key => {
        if (this.activeFilters[key]) {
          params.filter![key] = this.activeFilters[key];
        }
      });
    }

    this.usuariosService.getUsuariosPaginated(params).subscribe({
      next: (result: PaginatedUsersResult) => {
        this.users = [...result.users];
        this.totalItems = result.meta.totalItems;
        this.totalPages = result.meta.totalPages;
        this.currentPage = result.meta.currentPage;
        this.itemsPerPage = result.meta.itemsPerPage;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadUsuarios();
  }

  onPageSizeChange(size: number): void {
    this.itemsPerPage = size;
    this.currentPage = 1;
    this.loadUsuarios();
  }

  // Computed statistics
  get totalUsuarios(): number {
    return this.users.length;
  }

  get usuariosActivos(): number {
    return this.users.filter(user => user.estado === 'Activo').length;
  }

  get usuariosInactivos(): number {
    return this.users.filter(user => user.estado === 'Inactivo').length;
  }

  handleTableAction(event: { action: TableAction; row: any }) {
    event.action.action(event.row);
  }

  viewUser(user: User) {
    // Show loading
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'info',
      title: 'Cargando datos del usuario...',
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Get full user data from backend
    this.usuariosService.getUsuarioById(user.id).subscribe({
      next: (userData) => {
        Swal.close();
        console.log('Usuario completo para ver:', userData);
        console.log('Roles del usuario:', userData.roles);

        // Set user data first
        this.viewingUserData = userData;

        // Force change detection
        this.cdr.detectChanges();

        // Open modal after data is set
        setTimeout(() => {
          this.isViewUserModalOpen = true;
          this.cdr.detectChanges();
        }, 0);
      },
      error: (error: any) => {
        console.error('Error al cargar usuario:', error);
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'Error al cargar el usuario',
          text: 'No se pudo cargar la información del usuario',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });
      }
    });
  }

  closeViewUserModal() {
    this.isViewUserModalOpen = false;
    this.viewingUserData = null;
  }

  editUser(user: User) {
    // Si el usuario está inactivo, mostrar modal para activarlo
    if (user.estado === 'Inactivo') {
      Swal.fire({
        title: 'Usuario Inactivo',
        text: `El usuario "${user.nombre}" está inactivo. ¿Deseas activarlo?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#9333ea',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Sí, activar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
      }).then((result) => {
        if (result.isConfirmed) {
          // Mostrar loading mientras se activa
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'info',
            title: 'Activando usuario...',
            showConfirmButton: false,
            didOpen: () => {
              Swal.showLoading();
            }
          });

          // Log para debug
          console.log('Reactivando usuario con ID:', user.id);

          // Reactivar el usuario usando el endpoint específico
          this.usuariosService.reactivateUser(user.id).subscribe({
            next: (response) => {
              console.log('Usuario reactivado exitosamente:', response);
              this.loadUsuarios(); // Recargar la lista

              // Usar el mensaje del backend si está disponible, sino usar mensaje por defecto
              const successMessage = response?.message || 'Usuario reactivado correctamente';

              Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: successMessage,
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
              console.error('Error al reactivar usuario:', error);
              console.error('Error completo:', JSON.stringify(error, null, 2));
              console.error('User ID que falló:', user.id);

              const errorMessage = error?.error?.error?.message || error?.error?.message || 'No se pudo reactivar el usuario. Por favor, intenta nuevamente.';

              Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'error',
                title: 'Error al reactivar el usuario',
                text: errorMessage,
                showConfirmButton: false,
                timer: 4000,
                timerProgressBar: true
              });
            }
          });
        }
      });
      return; // No continuar con la edición normal
    }

    // Usuario activo - proceder con edición normal
    // Show loading
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'info',
      title: 'Cargando datos del usuario...',
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.editingUserId = user.id;

    // Get full user data from backend
    this.usuariosService.getUsuarioById(user.id).subscribe({
      next: (userData) => {
        Swal.close();

        // Extract role IDs from user data - handle different API response structures
        console.log('User data received:', userData);
        console.log('User roles:', userData.roles);

        let roleIds: string[] = [];
        if (userData.roles && Array.isArray(userData.roles)) {
          // Try different structures the API might return
          roleIds = userData.roles.map((r: any) => {
            // Structure 1: { role: { id: '...' } }
            if (r.role && r.role.id) {
              return r.role.id;
            }
            // Structure 2: { roleId: '...' }
            if (r.roleId) {
              return r.roleId;
            }
            // Structure 3: { id: '...' } (role object directly)
            if (r.id && !r.role) {
              return r.id;
            }
            // Structure 4: string ID directly
            if (typeof r === 'string') {
              return r;
            }
            return null;
          }).filter((id: string | null) => id !== null);
        }
        console.log('Extracted role IDs:', roleIds);

        // Set edit mode first
        this.isEditMode = true;

        // Set edit data with roleIds and userType
        this.editingUserData = {
          name: userData.name,
          lastName: userData.lastName,
          email: userData.email,
          phoneNumber: userData.phoneNumber,
          roleIds: roleIds,
          userType: userData.userType
        };
        console.log('Edit user data:', this.editingUserData);

        // Force change detection to update all bindings
        this.cdr.detectChanges();

        // Use setTimeout to ensure bindings are complete before opening modal
        setTimeout(() => {
          this.isCreateUserModalOpen = true;
          this.cdr.detectChanges();
        }, 0);
      },
      error: (error: any) => {
        console.error('Error al cargar usuario:', error);
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'Error al cargar el usuario',
          text: 'No se pudo cargar la información del usuario',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });
      }
    });
  }

  deleteUser(user: User) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `El usuario "${user.nombre}" será eliminado permanentemente`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.usuariosService.deleteUser(user.id).subscribe({
          next: () => {
            this.loadUsuarios(); // Recargar la lista de usuarios

            // Mostrar notificación de éxito
            Swal.fire({
              toast: true,
              position: 'top-end',
              icon: 'success',
              title: 'Usuario eliminado exitosamente',
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
            console.error('Error al eliminar usuario:', error);

            // Mostrar notificación de error
            const errorMessage = error?.error?.message || 'No se pudo eliminar el usuario. Por favor, intenta nuevamente.';
            Swal.fire({
              toast: true,
              position: 'top-end',
              icon: 'error',
              title: 'Error al eliminar el usuario',
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

  createNewUser() {
    this.isEditMode = false;
    this.editingUserId = null;
    this.editingUserData = null;
    this.isCreateUserModalOpen = true;
  }

  closeCreateUserModal() {
    this.isCreateUserModalOpen = false;
    this.isEditMode = false;
    this.editingUserId = null;
    this.editingUserData = null;
  }

  handleCreateUser(request: CreateUserWithRolesRequest) {
    console.log('Crear usuario con datos:', request);

    // First create the user, then assign roles
    this.usuariosService.createUser(request.userData).pipe(
      switchMap((response: any) => {
        console.log('Usuario creado exitosamente:', response);
        const userId = response.data?.id || response.id;

        if (!userId) {
          throw new Error('No se pudo obtener el ID del usuario creado');
        }

        // Now assign roles to the created user
        return this.usuariosService.assignRolesToUser(userId, request.roleIds);
      })
    ).subscribe({
      next: () => {
        console.log('Roles asignados exitosamente');
        this.closeCreateUserModal();
        this.loadUsuarios(); // Reload data

        // Show success notification
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Usuario creado exitosamente',
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
        console.error('Error al crear usuario o asignar roles:', error);

        // Verificar si es un error de correo duplicado
        const errorMessage = error?.error?.message || '';
        const errorDetails = error?.error?.error?.details || error?.error?.details || [];

        console.log('Error message:', errorMessage);
        console.log('Error details:', errorDetails);

        // Verificar en el mensaje principal
        const isDuplicateEmail = errorMessage.toLowerCase().includes('email') &&
          (errorMessage.toLowerCase().includes('already') ||
            errorMessage.toLowerCase().includes('existe') ||
            errorMessage.toLowerCase().includes('registrado') ||
            errorMessage.toLowerCase().includes('duplicado'));

        // Verificar en los detalles (puede estar en error.error.details o error.error.error.details)
        const hasDuplicateEmailDetail = Array.isArray(errorDetails) &&
          errorDetails.some((detail: string) =>
            detail.toLowerCase().includes('email') &&
            (detail.toLowerCase().includes('already') ||
              detail.toLowerCase().includes('exist') ||
              detail.toLowerCase().includes('registrado') ||
              detail.toLowerCase().includes('está registrado')));

        if (isDuplicateEmail || hasDuplicateEmailDetail) {
          // Mostrar modal de confirmación para correo duplicado (NO cerrar el modal de crear usuario)
          Swal.fire({
            icon: 'error',
            title: 'Correo ya registrado',
            text: 'El correo ingresado ya existe en el sistema. Por favor, ingrese otro correo.',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#9333ea',
            allowOutsideClick: false,
            allowEscapeKey: false
          });
        } else {
          // Error genérico
          const message = errorMessage || 'No se pudo crear el usuario. Intente nuevamente.';
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'error',
            title: 'Error al crear el usuario',
            text: message,
            showConfirmButton: false,
            timer: 4000,
            timerProgressBar: true
          });
        }
      }
    });
  }

  handleUpdateUser(request: UpdateUserRequest & { roleIds?: string[] }) {
    if (!this.editingUserId) return;

    console.log('Actualizar usuario con datos:', request);

    // Extract roleIds from request
    const { roleIds, ...userUpdateData } = request;

    // First update user data, then update roles
    this.usuariosService.updateUser(this.editingUserId, userUpdateData).pipe(
      switchMap(() => {
        // Now assign roles to the user
        if (roleIds && roleIds.length > 0) {
          return this.usuariosService.assignRolesToUser(this.editingUserId!, roleIds);
        }
        return of(null);
      })
    ).subscribe({
      next: () => {
        console.log('Usuario y roles actualizados exitosamente');
        this.closeCreateUserModal();
        this.loadUsuarios();

        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Usuario actualizado exitosamente',
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
        console.error('Error al actualizar usuario:', error);
        const errorMessage = error?.error?.message || 'No se pudo actualizar el usuario. Por favor, intenta nuevamente.';
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'Error al actualizar el usuario',
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

  onFilterChange(filterData: SearchFilterData) {
    this.searchTerm = filterData.searchTerm || '';
    this.activeFilters = filterData.filters || {};
    this.currentPage = 1;
    this.loadUsuarios();
  }
}
