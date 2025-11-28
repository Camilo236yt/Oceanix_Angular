import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { SubdomainService } from '../services/subdomain.service';
import Swal from 'sweetalert2';

/**
 * HTTP Interceptor para manejar headers CORS, autenticación y errores comunes
 */
export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  const subdomainService = inject(SubdomainService);
  const router = inject(Router);

  // Obtener subdomain (en localhost lee de localStorage, en producción de la URL)
  const subdomain = subdomainService.getSubdomain();

  // Detectar si estamos en localhost (desarrollo local) o producción/dev
  const isLocalhost = window.location.hostname === 'localhost';

  // Obtener token de autenticación desde localStorage
  // Intentar varias keys comunes
  const token = localStorage.getItem('authToken')
    || localStorage.getItem('auth_token')
    || localStorage.getItem('token')
    || localStorage.getItem('access_token');

  console.log('🔍 [Interceptor] Debug:', {
    url: req.url,
    isLocalhost,
    hasToken: !!token,
    tokenPrefix: token ? token.substring(0, 10) + '...' : 'none',
    isTokenValid: token && token.startsWith('eyJ')
  });

  // Preparar headers
  const headers: { [key: string]: string } = {
    'Accept': 'application/json',
  };

  // NO agregar Content-Type si el body es FormData
  // Angular y el navegador lo configurarán automáticamente con el boundary correcto
  if (!(req.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // Agregar X-Subdomain header si existe
  if (subdomain) {
    headers['X-Subdomain'] = subdomain;
  }

  // SOLO en localhost: Usar Bearer token desde localStorage
  // En producción/dev: Usar cookies httpOnly (withCredentials: true)
  const isTokenValid = token && token.startsWith('eyJ');

  if (isLocalhost && isTokenValid) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('🔑 [Interceptor] LOCALHOST: Using Bearer token from localStorage');
  } else if (isLocalhost && !isTokenValid) {
    console.warn('⚠️ [Interceptor] LOCALHOST: NO VALID TOKEN - Request may fail if auth required');
  } else {
    console.log('🔒 [Interceptor] PRODUCTION/DEV: Using httpOnly cookies (withCredentials: true)');
  }

  // Clonar la petición con headers y configuración apropiada
  const clonedRequest = req.clone({
    setHeaders: headers,
    // Siempre enviar withCredentials para cookies (producción) y CORS
    withCredentials: true
  });

  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('HTTP Error:', {
        status: error.status,
        statusText: error.statusText,
        url: error.url,
        message: error.message
      });

      // Manejo de token expirado o no autorizado
      // Excluir URLs de autenticación y de incidencias para evitar loops
      const isAuthUrl = req.url.includes('/auth/');
      const isIncidenciaUrl = req.url.includes('/incidencias');

      if (error.status === 401 && !isAuthUrl && !isIncidenciaUrl) {
        handleTokenExpiration(router);
      }

      return throwError(() => error);
    })
  );
};

/**
 * Maneja la expiración del token: limpia la sesión y redirige al login
 */
function handleTokenExpiration(router: Router): void {
  // Limpiar localStorage completamente
  localStorage.removeItem('authToken');
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
  localStorage.removeItem('auth_enterprise');
  localStorage.removeItem('subdomain');
  localStorage.removeItem('dev_subdomain');

  // Limpiar sessionStorage completamente
  sessionStorage.removeItem('user_config_user');
  sessionStorage.removeItem('user_config_enterprise');
  sessionStorage.removeItem('user_config_config');
  sessionStorage.removeItem('user_config_roles');
  sessionStorage.removeItem('user_config_permissions');

  // Mostrar mensaje al usuario
  Swal.fire({
    icon: 'warning',
    title: 'Sesión expirada',
    text: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
    confirmButtonText: 'Entendido',
    confirmButtonColor: '#9333ea',
    allowOutsideClick: false,
    allowEscapeKey: false
  }).then(() => {
    // Redirigir al login después de cerrar el alert
    router.navigate(['/admin']);
  });
}
