import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SubdomainService {
  private readonly MAIN_DOMAIN = 'oceanix.space';
  private readonly DEV_SUBDOMAIN_KEY = 'dev_subdomain';

  /**
   * Obtiene el subdomain actual
   * En localhost usa localStorage, en producción extrae de la URL
   */
  getSubdomain(): string | null {
    const hostname = window.location.hostname;

    // Para desarrollo local, usar subdomain desde localStorage
    if (this.isLocalhost(hostname)) {
      return this.getDevSubdomain();
    }

    // Producción: extraer de la URL
    const subdomain = hostname.replace(`.${this.MAIN_DOMAIN}`, '');

    if (subdomain === hostname || subdomain === this.MAIN_DOMAIN) {
      return null;
    }

    return subdomain;
  }

  /**
   * Obtiene el subdomain configurado para desarrollo
   */
  getDevSubdomain(): string | null {
    return localStorage.getItem(this.DEV_SUBDOMAIN_KEY);
  }

  /**
   * Establece el subdomain para desarrollo
   */
  setDevSubdomain(subdomain: string): void {
    localStorage.setItem(this.DEV_SUBDOMAIN_KEY, subdomain);
    console.log(`[DEV] Subdomain establecido: ${subdomain}`);
  }

  /**
   * Limpia el subdomain de desarrollo
   */
  clearDevSubdomain(): void {
    localStorage.removeItem(this.DEV_SUBDOMAIN_KEY);
    console.log('[DEV] Subdomain limpiado');
  }

  /**
   * Verifica si estamos en localhost
   */
  private isLocalhost(hostname: string): boolean {
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.');
  }

  /**
   * Verifica si estamos en el dominio principal
   */
  isMainDomain(): boolean {
    return this.getSubdomain() === null;
  }

  /**
   * Verifica si estamos en un subdomain
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
