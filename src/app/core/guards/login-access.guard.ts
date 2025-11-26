import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SubdomainService } from '../services/subdomain.service';

/**
 * Guard que controla el acceso a la ruta /login:
 * - Sin subdominio (dominio principal): redirige a /admin
 * - Con subdominio (empresas): permite acceso al login
 */
export const loginAccessGuard: CanActivateFn = () => {
  const subdomainService = inject(SubdomainService);
  const router = inject(Router);

  // Si estamos en el dominio principal (SIN subdominio), redirigir a /admin
  if (!subdomainService.hasSubdomain()) {
    router.navigate(['/admin']);
    return false;
  }

  // Si estamos en un subdominio, permitir acceso al login
  return true;
};
