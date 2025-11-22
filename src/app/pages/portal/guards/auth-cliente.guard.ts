import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthClienteService } from '../services/auth-cliente.service';

export const authClienteGuard: CanActivateFn = (route, state) => {
  const authClienteService = inject(AuthClienteService);
  const router = inject(Router);

  if (authClienteService.isAuthenticated()) {
    return true;
  }

  // Redirigir al login si no está autenticado
  router.navigate(['/portal/login']);
  return false;
};
