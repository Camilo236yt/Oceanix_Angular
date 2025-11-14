import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

/**
 * Guard que previene acceso a rutas públicas (landing, register) cuando el usuario está autenticado
 * Redirige al dashboard del CRM si el usuario ya tiene sesión activa
 */
export const authRedirectGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si el usuario está autenticado, redirigir al CRM
  if (authService.isAuthenticated()) {
    router.navigate(['/crm/dashboard']);
    return false;
  }

  return true;
};
