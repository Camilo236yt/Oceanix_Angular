import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoadingSpinner } from '../../../../shared/components/loading-spinner/loading-spinner';
import { AuthClienteService } from '../../services/auth-cliente.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule, LoadingSpinner],
  template: `
    <div class="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      <div class="text-center">
        <app-loading-spinner></app-loading-spinner>
        <h2 class="mt-6 text-2xl font-semibold text-gray-800">Autenticando...</h2>
        <p class="mt-2 text-gray-600">Por favor espera un momento</p>

        @if (errorMessage) {
          <div class="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <p class="font-semibold">Error</p>
            <p class="text-sm">{{ errorMessage }}</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: []
})
export class AuthCallbackComponent implements OnInit {
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authClienteService: AuthClienteService
  ) { }

  ngOnInit() {
    console.log('🔄 AuthCallbackComponent initialized');
    console.log('📍 Current URL:', window.location.href);
    console.log('📍 Current pathname:', window.location.pathname);

    // Detectar si estamos en entorno local o producción
    const isLocal = window.location.hostname === 'localhost';
    console.log('🔧 Environment:', isLocal ? 'LOCAL' : 'PRODUCTION');

    this.route.queryParams.subscribe(params => {
      console.log('📦 Query params received:', params);

      const token = params['token'];
      const error = params['error'];

      if (error) {
        console.error('❌ Authentication error:', error);
        this.errorMessage = 'Error de autenticación. Redirigiendo al login...';

        setTimeout(() => {
          this.router.navigate(['/portal/login'], {
            queryParams: { error: 'auth_failed' }
          });
        }, 2000);
        return;
      }

      // Guardar token en localStorage si viene en los query params
      // Esto es necesario para que el guard authClienteGuard pueda verificar autenticación
      if (token) {
        console.log('🔑 Token received in query params (first 50 chars):', token.substring(0, 50) + '...');
        console.log('💾 Saving token to localStorage for guard verification');
        localStorage.setItem('authToken', token);
        console.log('✅ Token saved to localStorage');
      } else {
        // En producción puede que no venga token en query params si solo usa cookie
        console.warn('⚠️ No token in query params');

        if (isLocal) {
          // En local, el token es OBLIGATORIO
          console.error('❌ No token received in local environment - this is an error');
          console.error('❌ Available query params:', Object.keys(params));
          this.errorMessage = 'No se recibió token de autenticación.';
          setTimeout(() => {
            this.router.navigate(['/portal/login'], {
              queryParams: { error: 'no_token' }
            });
          }, 2000);
          return;
        } else {
          // En producción, intentar validar con cookie
          console.log('🔒 Production: Will try to validate with httpOnly cookie');
        }
      }

      // Validar el token con el backend
      console.log('🔍 Validating token with backend...');
      const startTime = Date.now();
      const MIN_LOADING_TIME = 1500; // 1.5 segundos mínimo de carga

      this.authClienteService.checkToken().subscribe({
        next: (response) => {
          console.log('✅ Token validation SUCCESS:', response);

          // IMPORTANTE: En producción con httpOnly cookies, necesitamos marcar que está autenticado
          // aunque no tengamos el token real en localStorage
          if (!token && !isLocal) {
            console.log('🔒 Production: No token in query params, setting auth flag for guard');
            console.log('🔒 Real token is in httpOnly cookie, setting session marker');
            // Guardar timestamp de la sesión como marcador para el guard
            // El verdadero token JWT está en la cookie httpOnly (más seguro)
            const sessionTimestamp = new Date().toISOString();
            localStorage.setItem('authToken', sessionTimestamp);
          }

          // Calcular tiempo transcurrido
          const elapsedTime = Date.now() - startTime;
          const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime);

          console.log(`⏱️ Elapsed time: ${elapsedTime}ms, waiting ${remainingTime}ms more...`);

          // Esperar el tiempo restante antes de redirigir
          setTimeout(() => {
            console.log('🔄 Redirecting to /portal/registro-incidencia...');
            this.router.navigate(['/portal/registro-incidencia']).then(success => {
              if (success) {
                console.log('✅ Navigation successful');
              } else {
                console.error('❌ Navigation failed');
              }
            });
          }, remainingTime);
        },
        error: (error) => {
          console.error('❌ Token validation FAILED');
          console.error('❌ Error status:', error.status);
          console.error('❌ Error message:', error.message);
          console.error('❌ Error body:', error.error);
          console.error('❌ Full error object:', error);

          // Calcular tiempo transcurrido
          const elapsedTime = Date.now() - startTime;
          const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime);

          console.log(`⏱️ Elapsed time: ${elapsedTime}ms, waiting ${remainingTime}ms more before showing error...`);

          // Esperar el tiempo restante antes de mostrar error
          setTimeout(() => {
            // Limpiar el token inválido
            console.log('🗑️ Removing invalid token from localStorage');
            localStorage.removeItem('authToken');

            // Determinar el mensaje de error según el tipo de problema
            let title = 'Error de Autenticación';
            let message = 'No se pudo completar la autenticación. Por favor, intenta nuevamente.';
            let icon: 'error' | 'warning' = 'error';

            // Extraer el mensaje de error del backend
            const backendMessage = error.error?.error?.message || error.error?.message || '';
            const errorCode = error.error?.error?.code || error.error?.code || '';

            console.log('🔍 Backend error message:', backendMessage);
            console.log('🔍 Backend error code:', errorCode);

            // Verificar si es un error de cuenta no activa o email no verificado
            if (backendMessage.toLowerCase().includes('not active') ||
                backendMessage.toLowerCase().includes('verify your email') ||
                backendMessage.toLowerCase().includes('contact with the admin')) {
              icon = 'warning';
              title = 'Cuenta Desactivada';
              message = 'Tu cuenta está desactivada. Contacta al administrador para activar tu cuenta.';
            }
            // Verificar si es un error de token expirado
            else if (error.status === 401 && (backendMessage.toLowerCase().includes('expired') ||
                     backendMessage.toLowerCase().includes('invalid token'))) {
              title = 'Sesión Expirada';
              message = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
            }
            // Verificar si es un error de permisos
            else if (error.status === 403) {
              title = 'Acceso Denegado';
              message = 'No tienes permisos para acceder a esta sección. Contacta al administrador si necesitas ayuda.';
            }
            // Verificar si es un error del servidor
            else if (error.status >= 500) {
              title = 'Error del Servidor';
              message = 'Ocurrió un problema en el servidor. Por favor, intenta nuevamente más tarde o contacta a soporte técnico.';
            }
            // Para otros errores 401 (no autorizados)
            else if (error.status === 401) {
              title = 'Autenticación Inválida';
              message = 'Las credenciales no son válidas. Por favor, inicia sesión nuevamente.';
            }

            // Mostrar error con SweetAlert2
            Swal.fire({
              icon: icon,
              title: title,
              text: message,
              confirmButtonColor: '#7c3aed',
              confirmButtonText: 'Ir al Login',
              footer: error.status >= 500 ? '<span style="color: #666;">Si el problema persiste, contacta a soporte técnico</span>' : undefined
            }).then(() => {
              console.log('🔄 Redirecting to /portal/login...');
              this.router.navigate(['/portal/login']);
            });
          }, remainingTime);
        }
      });
    });
  }
}
