import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';

/**
 * Directiva estructural para mostrar/ocultar elementos según permisos del usuario
 *
 * Uso:
 * <button *hasPermission="'view_users'">Ver Usuarios</button>
 * <button *hasPermission="['edit_users', 'delete_users']">Editar o Eliminar</button>
 * <button *hasPermission="['edit_users', 'delete_users']; requireAll: true">Editar Y Eliminar</button>
 *
 * Por defecto, si el permiso NO existe en el array de permisos del usuario, el elemento se OCULTA
 */
@Directive({
  selector: '[hasPermission]',
  standalone: true
})
export class HasPermissionDirective implements OnInit, OnDestroy {
  private permissions: string[] = [];
  private requireAll = false;
  private subscription?: Subscription;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) {}

  @Input()
  set hasPermission(val: string | string[]) {
    this.permissions = Array.isArray(val) ? val : [val];
    this.updateView();
  }

  @Input()
  set hasPermissionRequireAll(val: boolean) {
    this.requireAll = val;
    this.updateView();
  }

  ngOnInit() {
    // Suscribirse a cambios en los permisos del usuario
    this.subscription = this.authService.permissions$.subscribe(() => {
      this.updateView();
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  private updateView() {
    const hasPermission = this.requireAll
      ? this.authService.hasAllPermissions(this.permissions)
      : this.authService.hasAnyPermission(this.permissions);

    if (hasPermission) {
      // Mostrar el elemento
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      // Ocultar el elemento
      this.viewContainer.clear();
    }
  }
}
