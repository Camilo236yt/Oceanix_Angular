import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from '../../services/auth.service';

/**
 * Guard que previene acceso a rutas públicas (landing, register) cuando el usuario está autenticado
 * Redirige al dashboard del CRM si el usuario ya tiene sesión activa
 */
export const authRedirectGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar sesión con el backend
  return authService.checkSession().pipe(
    map(isValid => {
      if (isValid) {
        // Si está autenticado, redirigir al CRM
        router.navigate(['/crm/dashboard']);
        return false;
      }
      // Si no está autenticado, permitir acceso
      return true;
    }),
    catchError(() => {
      // Si hay error, permitir acceso (no está autenticado)
      return of(true);
    })
  );
};
