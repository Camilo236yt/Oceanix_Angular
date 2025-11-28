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

    // Detectar si estamos en entorno local o producción
    const isLocal = window.location.hostname === 'localhost';

    this.route.queryParams.subscribe(params => {
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

      if (isLocal) {
        // DESARROLLO LOCAL: Usar Bearer token en localStorage
        if (token) {
          console.log('🔧 Local environment: Saving token to localStorage for Bearer auth');
          localStorage.setItem('authToken', token);
        } else {
          console.error('❌ No token received in local environment');
          this.errorMessage = 'No se recibió token de autenticación.';
          setTimeout(() => {
            this.router.navigate(['/portal/login'], {
              queryParams: { error: 'no_token' }
            });
          }, 2000);
          return;
        }
      } else {
        // PRODUCCIÓN: Usar cookie httpOnly (ya seteada por el backend)
        console.log('🔒 Production environment: Using httpOnly cookie');
      }

      // Validar el token con el backend
      console.log('🔍 Validating token with backend...');
      const startTime = Date.now();
      const MIN_LOADING_TIME = 1500; // 1.5 segundos mínimo de carga

      this.authClienteService.checkToken().subscribe({
        next: (response) => {
          console.log('✅ Token is valid:', response);

          // Calcular tiempo transcurrido
          const elapsedTime = Date.now() - startTime;
          const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime);

          // Esperar el tiempo restante antes de redirigir
          setTimeout(() => {
            console.log('🔄 Redirecting to dashboard...');
            this.router.navigate(['/portal/registro-incidencia']);
          }, remainingTime);
        },
        error: (error) => {
          console.error('❌ Token validation failed:', error);

          // Calcular tiempo transcurrido
          const elapsedTime = Date.now() - startTime;
          const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime);

          // Esperar el tiempo restante antes de mostrar error
          setTimeout(() => {
            // Limpiar el token inválido
            localStorage.removeItem('authToken');

            // Mostrar error con SweetAlert2
            Swal.fire({
              icon: 'error',
              title: 'Token Inválido',
              text: 'Tu sesión ha expirado o el token no es válido. Por favor, inicia sesión nuevamente.',
              confirmButtonColor: '#7c3aed',
              confirmButtonText: 'Ir al Login'
            }).then(() => {
              this.router.navigate(['/portal/login']);
            });
          }, remainingTime);
        }
      });
    });
  }
}
