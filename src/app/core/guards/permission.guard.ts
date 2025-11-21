import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from '../../services/auth.service';

/**
 * Guard que verifica si el usuario tiene un permiso específico para acceder a una ruta
 * Primero verifica la sesión con el backend, luego verifica el permiso
 * Si NO está autenticado, redirige al login
 * Si NO tiene el permiso, previene el acceso
 *
 * Uso en rutas:
 * {
 *   path: 'usuarios',
 *   component: UsuariosComponent,
 *   canActivate: [permissionGuard('view_users')]
 * }
 */
export const permissionGuard = (requiredPermission: string): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Verificar sesión con el backend
    return authService.checkSession().pipe(
      map(isValid => {
        if (!isValid) {
          router.navigate(['/login']);
          return false;
        }

        // Si el usuario tiene el permiso, permitir acceso
        if (authService.hasPermission(requiredPermission)) {
          return true;
        }

        // Si no tiene el permiso, prevenir acceso
        console.warn(`[PermissionGuard] Acceso denegado. Permiso requerido: ${requiredPermission}`);
        return false;
      }),
      catchError(() => {
        router.navigate(['/login']);
        return of(false);
      })
    );
  };
};

/**
 * Guard que verifica si el usuario tiene ALGUNO de los permisos especificados
 * Primero verifica la sesión con el backend
 * Si NO está autenticado, redirige al login
 * Si NO tiene ninguno de los permisos, previene el acceso
 *
 * Uso en rutas:
 * {
 *   path: 'incidentes',
 *   component: IncidentsComponent,
 *   canActivate: [anyPermissionGuard(['view_incidents', 'view_own_incidents'])]
 * }
 */
export const anyPermissionGuard = (requiredPermissions: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Verificar sesión con el backend
    return authService.checkSession().pipe(
      map(isValid => {
        if (!isValid) {
          router.navigate(['/login']);
          return false;
        }

        // Si el usuario tiene al menos uno de los permisos, permitir acceso
        if (authService.hasAnyPermission(requiredPermissions)) {
          return true;
        }

        // Si no tiene ninguno de los permisos, prevenir acceso
        console.warn(`[PermissionGuard] Acceso denegado. Se requiere al menos uno de: ${requiredPermissions.join(', ')}`);
        return false;
      }),
      catchError(() => {
        router.navigate(['/login']);
        return of(false);
      })
    );
  };
};

/**
 * Guard que verifica si el usuario tiene TODOS los permisos especificados
 * Primero verifica la sesión con el backend
 * Si NO está autenticado, redirige al login
 * Si NO tiene todos los permisos, previene el acceso
 *
 * Uso en rutas:
 * {
 *   path: 'admin',
 *   component: AdminComponent,
 *   canActivate: [allPermissionsGuard(['manage_users', 'manage_roles'])]
 * }
 */
export const allPermissionsGuard = (requiredPermissions: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Verificar sesión con el backend
    return authService.checkSession().pipe(
      map(isValid => {
        if (!isValid) {
          router.navigate(['/login']);
          return false;
        }

        // Si el usuario tiene todos los permisos, permitir acceso
        if (authService.hasAllPermissions(requiredPermissions)) {
          return true;
        }

        // Si no tiene todos los permisos, prevenir acceso
        console.warn(`[PermissionGuard] Acceso denegado. Se requieren todos: ${requiredPermissions.join(', ')}`);
        return false;
      }),
      catchError(() => {
        router.navigate(['/login']);
        return of(false);
      })
    );
  };
};
