import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

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
    }
  ]
};
