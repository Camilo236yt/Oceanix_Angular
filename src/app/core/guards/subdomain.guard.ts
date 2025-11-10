import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SubdomainService } from '../services/subdomain.service';

/**
 * Guard que protege rutas del CRM para que solo sean accesibles desde subdominios
 * Redirige al dominio principal si se accede sin subdominio
 */
export const subdomainGuard: CanActivateFn = () => {
  const subdomainService = inject(SubdomainService);
  const router = inject(Router);

  // Si NO estamos en un subdominio, redirigir al dominio principal
  if (subdomainService.isMainDomain()) {
    // Redirigir al dominio principal
    window.location.href = `https://oceanix.space`;
    return false;
  }

  return true;
};
