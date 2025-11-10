import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

/**
 * HTTP Interceptor para manejar headers CORS y errores comunes
 */
export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  // Clonar la petición y agregar headers necesarios
  const clonedRequest = req.clone({
    setHeaders: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    withCredentials: false // Desactivar credenciales para evitar problemas con CORS
  });

  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      // Log detallado del error para debugging
      console.error('HTTP Error:', {
        status: error.status,
        statusText: error.statusText,
        url: error.url,
        message: error.message,
        error: error.error
      });

      // Mejorar el mensaje de error
      if (error.status === 0) {
        console.error('Error de red o CORS. El servidor puede estar caído o hay problemas de configuración CORS.');
      }

      return throwError(() => error);
    })
  );
};
