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

  // Primero verificar si hay token en localStorage (check rápido y sincrónico)
  const hasToken = authService.isAuthenticated();

  if (!hasToken) {
    // Si no hay token, permitir acceso inmediatamente sin llamar al backend
    console.log('[authRedirectGuard] No hay token, permitiendo acceso');
    return of(true);
  }

  // Si hay token, verificar con el backend que la sesión sea válida
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
