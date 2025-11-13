import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

/**
 * HTTP Interceptor para manejar headers CORS y errores comunes
 */
export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  // Clonar la petición y agregar headers necesarios
  // IMPORTANTE: No forzar withCredentials aquí para respetar la configuración de cada request
  const clonedRequest = req.clone({
    setHeaders: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
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
