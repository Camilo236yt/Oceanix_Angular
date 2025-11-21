import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { catchError, of, tap } from 'rxjs';

import { routes } from './app.routes';
import { httpInterceptor } from './interceptors/http.interceptor';
import { AuthService } from './services/auth.service';

/**
 * Inicializador que valida el subdomain al cargar la aplicación
 * Si el usuario está en un subdomain incorrecto, limpia la sesión
 */
function initializeSubdomainValidation(authService: AuthService) {
  return () => {
    authService.validateSubdomain();
  };
}

/**
 * Inicializador que recupera los datos de configuración del usuario al cargar la app
 * Solo hace la petición si:
 * 1. El usuario está autenticado (tiene token)
 * 2. NO hay datos en sessionStorage (evita petición duplicada después del login)
 * Los BehaviorSubjects se inicializan automáticamente desde sessionStorage si existen
 */
function initializeUserConfig(authService: AuthService) {
  return () => {
    // Solo intentar recuperar datos si el usuario está autenticado Y no hay datos cargados
    if (authService.isAuthenticated() && !authService.getCurrentMeUser()) {
      return authService.getMe().pipe(
        tap(() => {
          console.log('[App Init] Configuración de usuario cargada desde backend');
        }),
        catchError((error) => {
          console.warn('[App Init] No se pudo cargar la configuración del usuario:', error);
          // Si falla, los BehaviorSubjects ya tienen los datos de sessionStorage (si existen)
          // No bloqueamos la aplicación si falla la petición
          return of(null);
        })
      );
    }
    // Si ya hay datos o no está autenticado, no hacer nada
    return of(null);
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withInterceptors([httpInterceptor])
    ),
    provideCharts(withDefaultRegisterables()),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeSubdomainValidation,
      deps: [AuthService],
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeUserConfig,
      deps: [AuthService],
      multi: true
    }
  ]
};
