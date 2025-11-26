import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SubdomainService } from '../services/subdomain.service';

/**
 * Guard que redirige /login a la ruta correcta según el contexto:
 * - Con subdominio: redirige a /portal/login (empresas)
 * - Sin subdominio: redirige a /admin (super administradores)
 */
export const loginRedirectGuard: CanActivateFn = () => {
  const subdomainService = inject(SubdomainService);
  const router = inject(Router);

  // Si estamos en un subdominio, redirigir al login del portal
  if (subdomainService.hasSubdomain()) {
    router.navigate(['/portal/login']);
    return false;
  }

  // Si estamos en el dominio principal, redirigir a /admin
  router.navigate(['/admin']);
  return false;
};
