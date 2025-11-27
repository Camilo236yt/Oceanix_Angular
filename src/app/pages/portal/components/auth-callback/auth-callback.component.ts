import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoadingSpinner } from '../../../../shared/components/loading-spinner/loading-spinner';

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
        private router: Router
    ) { }

    ngOnInit() {
        console.log('🔄 AuthCallbackComponent initialized');

        // El backend redirige con ?token=xxx después de autenticar
        this.route.queryParams.subscribe(params => {
            const token = params['token'];
            const error = params['error'];

            console.log('📥 Received params:', { hasToken: !!token, error });

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

            if (token) {
                console.log('✅ Token received, saving to localStorage');

                // Guardar token en localStorage
                localStorage.setItem('portal_cliente_token', token);

                console.log('🔄 Redirecting to dashboard...');

                // Redirigir al dashboard
                this.router.navigate(['/portal/registro-incidencia']);
            } else {
                console.error('❌ No token received');
                this.errorMessage = 'No se recibió token de autenticación. Redirigiendo al login...';

                setTimeout(() => {
                    this.router.navigate(['/portal/login'], {
                        queryParams: { error: 'no_token' }
                    });
                }, 2000);
            }
        });
    }
}
