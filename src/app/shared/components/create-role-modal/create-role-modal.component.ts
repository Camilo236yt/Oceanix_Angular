import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';
import { Permission, PermissionCategory, CreateRoleRequest } from '../../models/permission.model';
import { PermissionsService } from '../../services/permissions.service';

@Component({
  selector: 'app-create-role-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './create-role-modal.component.html',
  styleUrl: './create-role-modal.component.scss'
})
export class CreateRoleModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSubmit = new EventEmitter<CreateRoleRequest>();

  roleName = '';
  roleDescription = '';
  categories: PermissionCategory[] = [];
  selectedPermissions: Set<string> = new Set();
  isLoading = false;
  errorMessage = '';

  // Validation errors
  nameError = '';
  descriptionError = '';
  permissionsError = '';

  constructor(
    private permissionsService: PermissionsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Los permisos se cargan cuando se abre el modal
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen'] && changes['isOpen'].currentValue) {
      console.log('Modal abierto, cargando permisos...');
      this.resetFormFields();
      this.loadPermissions();
    }
  }

  loadPermissions() {
    this.isLoading = true;
    this.errorMessage = '';
    this.categories = [];
    console.log('Iniciando carga de permisos...');

    this.permissionsService.getPermissions().subscribe({
      next: (permissions) => {
        console.log('Permisos recibidos:', permissions);
        console.log('Cantidad de permisos:', permissions.length);
        const categoriesData = this.groupPermissionsByResource(permissions);
        console.log('Categorías creadas:', categoriesData);
        console.log('Cantidad de categorías:', categoriesData.length);

        this.categories = categoriesData;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error al cargar permisos:', error);
        this.errorMessage = 'Error al cargar los permisos. Por favor, intenta nuevamente.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  groupPermissionsByResource(permissions: Permission[]): PermissionCategory[] {
    const grouped = permissions.reduce((acc, permission) => {
      const category = this.getCategoryFromPermissionName(permission.name);

      if (!acc[category]) {
        acc[category] = {
          name: category,
          permissions: [],
          expanded: false,
          selectedCount: 0
        };
      }

      acc[category].permissions.push(permission);
      return acc;
    }, {} as { [key: string]: PermissionCategory });

    return Object.values(grouped).sort((a, b) => a.name.localeCompare(b.name));
  }

  getCategoryFromPermissionName(permissionName: string): string {
    // Extraer la categoría del nombre del permiso
    // Ejemplos: "manage_incidents" -> "Incidencias", "create_users" -> "Usuarios"

    if (permissionName.includes('incident')) return 'Incidencias';
    if (permissionName.includes('user')) return 'Usuarios';
    if (permissionName.includes('role')) return 'Roles';
    if (permissionName.includes('permission')) return 'Permisos';
    if (permissionName.includes('categor')) return 'Categorías';
    if (permissionName.includes('priorit')) return 'Prioridades';
    if (permissionName.includes('status')) return 'Estados';
    if (permissionName.includes('comment')) return 'Comentarios';
    if (permissionName.includes('file')) return 'Archivos';
    if (permissionName.includes('notification')) return 'Notificaciones';
    if (permissionName.includes('email')) return 'Emails';
    if (permissionName.includes('redis') || permissionName.includes('system')) return 'Sistema';
    if (permissionName.includes('dashboard')) return 'Dashboard';
    if (permissionName.includes('report')) return 'Reportes';

    return 'Otros';
  }

  toggleCategory(category: PermissionCategory) {
    category.expanded = !category.expanded;
  }

  toggleCategorySelection(category: PermissionCategory, event: Event) {
    event.stopPropagation();
    const checkbox = event.target as HTMLInputElement;

    if (checkbox.checked) {
      category.permissions.forEach(p => this.selectedPermissions.add(p.id));
      category.selectedCount = category.permissions.length;
    } else {
      category.permissions.forEach(p => this.selectedPermissions.delete(p.id));
      category.selectedCount = 0;
    }

    this.clearPermissionsError();
  }

  togglePermission(permission: Permission, category: PermissionCategory) {
    if (this.selectedPermissions.has(permission.id)) {
      this.selectedPermissions.delete(permission.id);
      category.selectedCount--;
    } else {
      this.selectedPermissions.add(permission.id);
      category.selectedCount++;
    }

    this.clearPermissionsError();
  }

  isPermissionSelected(permissionId: string): boolean {
    return this.selectedPermissions.has(permissionId);
  }

  isCategoryFullySelected(category: PermissionCategory): boolean {
    return category.selectedCount === category.permissions.length;
  }

  isCategoryPartiallySelected(category: PermissionCategory): boolean {
    return category.selectedCount > 0 && category.selectedCount < category.permissions.length;
  }

  get totalSelectedPermissions(): number {
    return this.selectedPermissions.size;
  }

  validateForm(): boolean {
    let isValid = true;

    // Reset errors
    this.nameError = '';
    this.descriptionError = '';
    this.permissionsError = '';

    // Validate name
    if (!this.roleName.trim()) {
      this.nameError = 'El nombre del rol es obligatorio';
      isValid = false;
    }

    // Validate description
    if (!this.roleDescription.trim()) {
      this.descriptionError = 'La descripción es obligatoria';
      isValid = false;
    }

    // Validate permissions
    if (this.selectedPermissions.size === 0) {
      this.permissionsError = 'Debes seleccionar al menos un permiso';
      isValid = false;
    }

    return isValid;
  }

  clearNameError() {
    this.nameError = '';
  }

  clearDescriptionError() {
    this.descriptionError = '';
  }

  clearPermissionsError() {
    this.permissionsError = '';
  }

  handleSubmit() {
    if (!this.validateForm()) {
      return;
    }

    const request: CreateRoleRequest = {
      name: this.roleName.trim(),
      description: this.roleDescription.trim(),
      permissionIds: Array.from(this.selectedPermissions)
    };

    this.onSubmit.emit(request);
  }

  resetFormFields() {
    this.roleName = '';
    this.roleDescription = '';
    this.selectedPermissions.clear();
    this.nameError = '';
    this.descriptionError = '';
    this.permissionsError = '';
    this.errorMessage = '';
  }

  resetForm() {
    this.resetFormFields();

    // Reset category selections
    this.categories.forEach(category => {
      category.selectedCount = 0;
      category.expanded = false;
    });
  }

  closeModal() {
    this.resetForm();
    this.onClose.emit();
  }
}
