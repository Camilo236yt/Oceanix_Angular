import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SubdomainService {
  private readonly mainDomain = 'oceanix.space';

  /**
   * Obtiene el subdominio actual
   * @returns El subdominio o null si es el dominio principal
   */
  getSubdomain(): string | null {
    const hostname = window.location.hostname;

    // Para desarrollo local
    if (hostname === 'localhost' || hostname.startsWith('127.0.0.1')) {
      return null;
    }

    // Remover el dominio principal
    const subdomain = hostname.replace(`.${this.mainDomain}`, '');

    // Si el hostname es igual al subdominio, significa que no hay subdominio
    if (subdomain === hostname || subdomain === this.mainDomain) {
      return null;
    }

    return subdomain;
  }

  /**
   * Verifica si estamos en el dominio principal (sin subdominio)
   */
  isMainDomain(): boolean {
    return this.getSubdomain() === null;
  }

  /**
   * Verifica si estamos en un subdominio
   */
  hasSubdomain(): boolean {
    return this.getSubdomain() !== null;
  }

  /**
   * Obtiene el dominio completo actual
   */
  getCurrentDomain(): string {
    return window.location.hostname;
  }
}
