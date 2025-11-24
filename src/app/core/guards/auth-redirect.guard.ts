import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from '../../services/auth.service';

/**
 * Guard que previene acceso a rutas públicas (landing, register) cuando el usuario está autenticado
 * Redirige al dashboard del CRM si el usuario ya tiene sesión activa
 */
export const authRedirectGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('[authRedirectGuard] Verificando sesión...');

  // Verificar sesión con el backend
  return authService.checkSession().pipe(
    tap(isValid => console.log('[authRedirectGuard] Sesión válida:', isValid)),
    map(isValid => {
      if (isValid) {
        // Si está autenticado, redirigir al CRM
        console.log('[authRedirectGuard] Usuario autenticado, redirigiendo a /crm/dashboard');
        router.navigate(['/crm/dashboard']);
        return false;
      }
      // Si no está autenticado, permitir acceso
      console.log('[authRedirectGuard] Usuario no autenticado, permitiendo acceso');
      return true;
    }),
    catchError((error) => {
      // Si hay error, permitir acceso (no está autenticado)
      console.log('[authRedirectGuard] Error al verificar sesión, permitiendo acceso:', error);
      return of(true);
    })
  );
};
