import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

/**
 * Guard que protege rutas autenticadas
 * Redirige a /admin si el usuario no está autenticado
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si el usuario NO está autenticado, redirigir al login
  if (!authService.isAuthenticated()) {
    router.navigate(['/admin']);
    return false;
  }

  return true;
};
