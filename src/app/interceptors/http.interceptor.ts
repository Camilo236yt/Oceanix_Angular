import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { SubdomainService } from '../services/subdomain.service';

/**
 * HTTP Interceptor para manejar headers CORS y errores comunes
 */
export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  const subdomainService = inject(SubdomainService);

  // Obtener subdomain (en localhost lee de localStorage, en producción de la URL)
  const subdomain = subdomainService.getSubdomain();

  // Preparar headers
  const headers: { [key: string]: string } = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  // Agregar X-Subdomain header si existe
  if (subdomain) {
    headers['X-Subdomain'] = subdomain;
  }

  // Clonar la petición y agregar headers necesarios
  // IMPORTANTE: No forzar withCredentials aquí para respetar la configuración de cada request
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
