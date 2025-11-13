import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, tap } from 'rxjs';

/**
 * HTTP Interceptor para manejar headers CORS y errores comunes
 * CON DEBUGGING EXHAUSTIVO PARA COOKIES
 */
export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  // 🔍 DEBUG: Detectar si es endpoint de auth
  const isAuthEndpoint = req.url.includes('/auth/');
  const requestHasCredentials = req.withCredentials;

  console.group(`🌐 HTTP Interceptor - ${req.method} ${req.url}`);
  console.log('📍 Paso 1: Request original recibido');
  console.log('  URL:', req.url);
  console.log('  Method:', req.method);
  console.log('  withCredentials (original):', requestHasCredentials);
  console.log('  Es endpoint de auth:', isAuthEndpoint);
  console.log('  Headers originales:', req.headers.keys());

  // Clonar la petición y agregar headers necesarios
  // IMPORTANTE: No forzar withCredentials aquí para respetar la configuración de cada request
  const clonedRequest = req.clone({
    setHeaders: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
    // withCredentials se respeta del request original (no se sobrescribe)
  });

  console.log('📍 Paso 2: Request clonado');
  console.log('  withCredentials (después de clone):', clonedRequest.withCredentials);

  if (clonedRequest.withCredentials) {
    console.log('✅ withCredentials preservado correctamente');
  }

  if (isAuthEndpoint && !clonedRequest.withCredentials) {
    console.error('❌ PROBLEMA DETECTADO: Endpoint de auth SIN withCredentials!');
    console.error('   Esto impedirá que el navegador guarde cookies');
  }
  console.groupEnd();

  return next(clonedRequest).pipe(
    tap({
      next: (event: any) => {
        // Log cuando llega la respuesta
        if (event?.type === 4) { // HttpEventType.Response
          console.group(`✅ HTTP Response - ${req.method} ${req.url}`);
          console.log('📍 Paso 3: Respuesta recibida');
          console.log('  Status:', event.status);
          console.log('  Headers de respuesta:', event.headers.keys());

          const setCookieHeader = event.headers.get('Set-Cookie');
          console.log('  Set-Cookie header:', setCookieHeader || 'NO PRESENTE');

          if (setCookieHeader) {
            console.log('🍪 Set-Cookie detectado en respuesta');
            if (!clonedRequest.withCredentials) {
              console.error('❌ PROBLEMA: Hay Set-Cookie pero request fue sin credentials!');
              console.error('   El navegador RECHAZARÁ estas cookies');
            } else {
              console.log('✅ Request con credentials, navegador debería guardar la cookie');
            }
          }
          console.groupEnd();
        }
      }
    }),
    catchError((error: HttpErrorResponse) => {
      console.group(`❌ HTTP Error - ${req.method} ${req.url}`);
      console.log('📍 Paso 3 (Error): Error en respuesta');
      console.error('Error details:', {
        status: error.status,
        statusText: error.statusText,
        url: error.url,
        message: error.message,
        error: error.error
      });

      if (error.status === 0) {
        console.error('💥 Error de red o CORS');
        console.error('   - Servidor caído?');
        console.error('   - CORS mal configurado?');
        console.error('   - URL incorrecta?');
      }
      console.groupEnd();

      return throwError(() => error);
    })
  );
};
