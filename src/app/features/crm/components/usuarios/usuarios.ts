import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DataTable } from '../../../../shared/components/data-table/data-table';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { SearchFiltersComponent } from '../../../../shared/components/search-filters/search-filters.component';
import { TableColumn, TableAction } from '../../../../shared/models/table.model';
import { User } from '../../models/user.model';
import { FilterConfig, SearchFilterData } from '../../../../shared/models/filter.model';
import { UsuariosService } from '../../services/usuarios.service';
import { CreateUserModalComponent } from '../../../../shared/components/create-user-modal/create-user-modal.component';
import { CreateUserRequest, UpdateUserRequest } from '../../../../shared/models/user-request.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-usuarios',
  imports: [DataTable, IconComponent, SearchFiltersComponent, CreateUserModalComponent],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss',
})
export class Usuarios implements OnInit {
  // Modal state
  isCreateUserModalOpen = false;
  isEditMode = false;
  editingUserId: string | null = null;
  editingUserData: { name: string; lastName: string; email: string; phoneNumber: string } | null = null;

  constructor(
    private usuariosService: UsuariosService,
    private cdr: ChangeDetectorRef
  ) {}
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
          color: 'text-purple-600 dark:text-purple-400',
          bgColor: 'bg-transparent dark:bg-transparent',
          dotColor: 'bg-purple-600 dark:bg-purple-400'
        },
        'Empleado': {
          color: 'text-gray-600 dark:text-gray-300',
          bgColor: 'bg-transparent dark:bg-transparent',
          dotColor: 'bg-gray-600 dark:bg-gray-300'
        },
        'Supervisor': {
          color: 'text-orange-600 dark:text-orange-400',
          bgColor: 'bg-transparent dark:bg-transparent',
          dotColor: 'bg-orange-600 dark:bg-orange-400'
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

  users: User[] = [];

  ngOnInit() {
    this.loadUsuarios();
  }

  loadUsuarios() {
    this.usuariosService.getUsuarios().subscribe({
      next: (usuarios) => {
        console.log('Usuarios cargados:', usuarios);
        this.users = [...usuarios]; // Create new array reference
        this.cdr.detectChanges(); // Force change detection
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
      }
    });
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

  editUser(user: User) {
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

        // Set edit data first
        this.editingUserData = {
          name: userData.name,
          lastName: userData.lastName,
          email: userData.email,
          phoneNumber: userData.phoneNumber
        };
        this.isEditMode = true;

        // Force change detection before opening modal
        this.cdr.detectChanges();

        // Then open modal
        this.isCreateUserModalOpen = true;
        this.cdr.detectChanges();
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

  handleCreateUser(request: CreateUserRequest) {
    console.log('Crear usuario con datos:', request);
    this.usuariosService.createUser(request).subscribe({
      next: (response: any) => {
        console.log('Usuario creado exitosamente:', response);
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
        console.error('Error al crear usuario:', error);
        const errorMessage = error?.error?.message || 'No se pudo crear el usuario. Intente nuevamente.';
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'Error al crear el usuario',
          text: errorMessage,
          showConfirmButton: false,
          timer: 4000,
          timerProgressBar: true
        });
      }
    });
  }

  handleUpdateUser(request: UpdateUserRequest) {
    if (!this.editingUserId) return;

    console.log('Actualizar usuario con datos:', request);
    this.usuariosService.updateUser(this.editingUserId, request).subscribe({
      next: (response: any) => {
        console.log('Usuario actualizado exitosamente:', response);
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
    console.log('Filtros aplicados:', filterData);
    // Aquí puedes implementar la lógica de filtrado
    // Por ejemplo, filtrar el array de users basado en searchTerm y filters
  }
}
