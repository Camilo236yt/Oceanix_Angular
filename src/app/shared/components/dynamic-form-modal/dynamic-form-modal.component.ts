import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';
import { Permission, PermissionCategory, CreateRoleRequest } from '../../models/permission.model';
import { PermissionsService } from '../../services/permissions.service';
import { DynamicFormModalConfig, DynamicFormData, SelectableSection } from '../../models/dynamic-form-modal.model';

@Component({
  selector: 'app-dynamic-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './dynamic-form-modal.component.html',
  styleUrl: './dynamic-form-modal.component.scss'
})
export class DynamicFormModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() config: DynamicFormModalConfig | null = null;
  @Input() mode: 'role' | 'generic' = 'role'; // Modo de compatibilidad
  @Input() editMode = false; // Indica si está en modo edición
  @Input() roleId: string | null = null; // ID del rol a editar
  @Input() initialData: { name?: string; description?: string; canReceiveIncidents?: boolean; permissionIds?: string[] } | null = null;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSubmit = new EventEmitter<any>();

  // Modo role (compatibilidad con implementación anterior)
  roleName = '';
  roleDescription = '';
  canReceiveIncidents = false;
  categories: PermissionCategory[] = [];
  selectedPermissions: Set<string> = new Set();
  isLoading = false;
  errorMessage = '';
  isClosing = false;

  // Modo genérico
  formData: { [key: string]: any } = {};
  selectedItems: Set<string> = new Set();
  sections: SelectableSection[] = [];

  // Validation errors
  fieldErrors: { [key: string]: string } = {};
  nameError = '';
  descriptionError = '';
  permissionsError = '';

  constructor(
    private permissionsService: PermissionsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (this.mode === 'generic' && this.config) {
      this.initializeGenericForm();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // Cargar datos iniciales PRIMERO cuando se pasa initialData
    if (changes['initialData'] && this.initialData && this.editMode) {
      this.roleName = this.initialData.name || '';
      this.roleDescription = this.initialData.description || '';
      this.canReceiveIncidents = this.initialData.canReceiveIncidents ?? false;
      if (this.initialData.permissionIds) {
        this.selectedPermissions = new Set(this.initialData.permissionIds);
      }
    }

    if (changes['isOpen'] && changes['isOpen'].currentValue) {
      if (this.mode === 'role') {
        console.log('Modal abierto, cargando permisos...');
        if (!this.editMode) {
          this.resetFormFields();
        }
        this.loadPermissions();
      } else if (this.mode === 'generic' && this.config) {
        this.resetGenericForm();
        if (this.config.selectableSection?.loadDataFn) {
          this.config.selectableSection.loadDataFn();
        }
      }
    }
  }

  // Métodos para modo genérico
  initializeGenericForm() {
    if (!this.config) return;

    this.config.fields.forEach(field => {
      this.formData[field.name] = field.value || '';
    });
  }

  resetGenericForm() {
    if (!this.config) return;

    this.config.fields.forEach(field => {
      this.formData[field.name] = '';
    });
    this.selectedItems.clear();
    this.fieldErrors = {};
    this.sections = [];
  }

  validateGenericForm(): boolean {
    if (!this.config) return false;

    let isValid = true;
    this.fieldErrors = {};

    // Validar campos
    this.config.fields.forEach(field => {
      if (field.required && !this.formData[field.name]?.toString().trim()) {
        this.fieldErrors[field.name] = `${field.label} es obligatorio`;
        isValid = false;
      }
    });

    // Validar sección seleccionable si existe
    if (this.config.selectableSection && this.selectedItems.size === 0) {
      this.fieldErrors['selectable'] = this.config.selectableSection.requiredMessage || 'Debes seleccionar al menos un elemento';
      isValid = false;
    }

    return isValid;
  }

  handleGenericSubmit() {
    if (!this.validateGenericForm()) {
      return;
    }

    const data: DynamicFormData = {
      fields: { ...this.formData },
      selectedItems: Array.from(this.selectedItems)
    };

    this.onSubmit.emit(data);
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

        // Actualizar selectedCount de las categorías si hay permisos pre-seleccionados
        if (this.editMode && this.selectedPermissions.size > 0) {
          this.categories.forEach(category => {
            category.selectedCount = category.permissions.filter(p =>
              this.selectedPermissions.has(p.id)
            ).length;
          });
        }

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

      // Si se desmarca el permiso de asignar incidencias, desmarcar también "Puede recibir incidencias"
      if (permission.name === 'assign_incidents') {
        this.canReceiveIncidents = false;
      }
    } else {
      this.selectedPermissions.add(permission.id);
      category.selectedCount++;

      // Si se marca el permiso de asignar incidencias, marcar también "Puede recibir incidencias"
      if (permission.name === 'assign_incidents') {
        this.canReceiveIncidents = true;
      }
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
    } else if (this.roleName.trim().length < 3) {
      this.nameError = 'El nombre debe tener al menos 3 caracteres';
      isValid = false;
    } else if (this.roleName.trim().length > 50) {
      this.nameError = 'El nombre no puede exceder 50 caracteres';
      isValid = false;
    }

    // Validate description
    if (!this.roleDescription.trim()) {
      this.descriptionError = 'La descripción es obligatoria';
      isValid = false;
    } else if (this.roleDescription.trim().length < 5) {
      this.descriptionError = 'La descripción debe tener al menos 5 caracteres';
      isValid = false;
    } else if (this.roleDescription.trim().length > 200) {
      this.descriptionError = 'La descripción no puede exceder 200 caracteres';
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

  onNameBlur() {
    if (this.roleName.trim()) {
      if (this.roleName.trim().length < 3) {
        this.nameError = 'El nombre debe tener al menos 3 caracteres';
      } else if (this.roleName.trim().length > 50) {
        this.nameError = 'El nombre no puede exceder 50 caracteres';
      } else {
        this.nameError = '';
      }
    }
  }

  onDescriptionBlur() {
    if (this.roleDescription.trim()) {
      if (this.roleDescription.trim().length < 5) {
        this.descriptionError = 'La descripción debe tener al menos 5 caracteres';
      } else if (this.roleDescription.trim().length > 200) {
        this.descriptionError = 'La descripción no puede exceder 200 caracteres';
      } else {
        this.descriptionError = '';
      }
    }
  }

  clearPermissionsError() {
    this.permissionsError = '';
  }

  onCanReceiveIncidentsChange() {
    // Buscar el permiso de assign_incidents en todas las categorías
    this.categories.forEach(category => {
      const assignIncidentsPermission = category.permissions.find(p =>
        p.name === 'assign_incidents'
      );

      if (assignIncidentsPermission) {
        if (this.canReceiveIncidents) {
          // Si se marca "Puede recibir incidencias", marcar automáticamente "Asignar Incidencias"
          if (!this.selectedPermissions.has(assignIncidentsPermission.id)) {
            this.selectedPermissions.add(assignIncidentsPermission.id);
            category.selectedCount++;
          }
        } else {
          // Si se desmarca "Puede recibir incidencias", desmarcar también "Asignar Incidencias"
          if (this.selectedPermissions.has(assignIncidentsPermission.id)) {
            this.selectedPermissions.delete(assignIncidentsPermission.id);
            category.selectedCount--;
          }
        }
      }
    });

    this.clearPermissionsError();
    this.cdr.markForCheck();
  }

  handleSubmit() {
    if (this.mode === 'generic') {
      this.handleGenericSubmit();
    } else {
      this.handleRoleSubmit();
    }
  }

  handleRoleSubmit() {
    if (!this.validateForm()) {
      return;
    }

    const request: CreateRoleRequest = {
      name: this.roleName.trim(),
      description: this.roleDescription.trim(),
      canReceiveIncidents: this.canReceiveIncidents,
      permissionIds: Array.from(this.selectedPermissions)
    };

    // Si está en modo edición, emitir también el roleId
    if (this.editMode && this.roleId) {
      this.onSubmit.emit({ ...request, roleId: this.roleId });
    } else {
      this.onSubmit.emit(request);
    }
  }

  resetFormFields() {
    this.roleName = '';
    this.roleDescription = '';
    this.canReceiveIncidents = false;
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
    this.isClosing = true;
    this.cdr.markForCheck();

    // Esperar a que la animación de salida termine antes de cerrar
    // 300ms para mobile (slideDown), 150ms para desktop (modalFadeOutPro)
    const isMobile = window.innerWidth < 640;
    const delay = isMobile ? 300 : 150;

    setTimeout(() => {
      this.isClosing = false;
      if (this.mode === 'generic') {
        this.resetGenericForm();
      } else {
        this.resetForm();
      }
      this.onClose.emit();
      this.cdr.markForCheck();
    }, delay);
  }

  // Getters para el template
  get modalTitle(): string {
    if (this.mode === 'generic' && this.config) {
      return this.config.title;
    }
    return this.editMode ? 'Editar Rol' : 'Crear Nuevo Rol';
  }

  get modalSubtitle(): string | undefined {
    if (this.mode === 'generic' && this.config) {
      return this.config.subtitle;
    }
    return this.editMode
      ? 'Modifica el nombre, descripción y permisos del rol'
      : 'Define el nombre, descripción y permisos del rol';
  }

  get submitButtonLabel(): string {
    if (this.mode === 'generic' && this.config) {
      return this.config.submitButtonText || 'Guardar';
    }
    return this.editMode ? 'Actualizar Rol' : 'Crear Rol';
  }

  get cancelButtonLabel(): string {
    if (this.mode === 'generic' && this.config) {
      return this.config.cancelButtonText || 'Cancelar';
    }
    return 'Cancelar';
  }

  get isGenericMode(): boolean {
    return this.mode === 'generic';
  }

  get isRoleMode(): boolean {
    return this.mode === 'role';
  }
}
