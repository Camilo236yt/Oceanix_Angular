import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { SubdomainService } from '../services/subdomain.service';

/**
 * HTTP Interceptor para manejar headers CORS, autenticación y errores comunes
 */
export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  const subdomainService = inject(SubdomainService);

  // Obtener subdomain (en localhost lee de localStorage, en producción de la URL)
  const subdomain = subdomainService.getSubdomain();

  // Obtener token de autenticación desde localStorage
  const token = localStorage.getItem('auth_token');

  // Preparar headers
  const headers: { [key: string]: string } = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  // Agregar X-Subdomain header si existe
  if (subdomain) {
    headers['X-Subdomain'] = subdomain;
  }

  // Solo agregar Authorization header si:
  // 1. Existe token
  // 2. La petición NO usa withCredentials (cookies)
  // Esto evita conflictos cuando el backend espera solo uno de los dos métodos
  if (token && !req.withCredentials) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Clonar la petición y agregar headers necesarios
  // Mantener withCredentials de la petición original para cookies
  const clonedRequest = req.clone({
    setHeaders: headers
  });

  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('HTTP Error:', {
        status: error.status,
        statusText: error.statusText,
        url: error.url,
        message: error.message
      });

      return throwError(() => error);
    })
  );
};
