import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SubdomainService } from '../services/subdomain.service';

/**
 * Guard que protege rutas para que solo sean accesibles desde el dominio principal
 * Redirige a /login si se accede desde un subdominio
 */
export const mainDomainGuard: CanActivateFn = () => {
  const subdomainService = inject(SubdomainService);
  const router = inject(Router);

  // Si estamos en un subdominio, redirigir al login
  if (subdomainService.hasSubdomain()) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};
