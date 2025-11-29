import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthClienteService } from '../../services/auth-cliente.service';
import { LoadingSpinner } from '../../../../shared/components/loading-spinner/loading-spinner';
import { SubdomainService } from '../../../../services/subdomain.service';
import { environment } from '../../../../environments/environment';
import Swal from 'sweetalert2';

declare const google: any;

@Component({
  selector: 'app-portal-login',
  standalone: true,
  imports: [CommonModule, LoadingSpinner],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class PortalLoginComponent implements OnInit {
  errorMessage = '';
  isLoading = false;

  constructor(
    private router: Router,
    private authClienteService: AuthClienteService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private subdomainService: SubdomainService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Interceptar errores del callback de Google OAuth
    this.route.queryParams.subscribe(params => {
      const error = params['error'];

      if (error) {
        // Limpiar el parámetro de error de la URL
        this.router.navigate([], {
          queryParams: {},
          replaceUrl: true
        });

        // Mostrar mensaje de error personalizado según el tipo
        this.showErrorAlert(error);
      }
    });
  }

  /**
   * Muestra un SweetAlert con el mensaje de error apropiado
   */
  private showErrorAlert(error: string): void {
    let title = 'Acceso Denegado';
    let message = '';
    let icon: 'error' | 'warning' | 'info' = 'warning';

    // Detectar el tipo de error y personalizar el mensaje
    if (error.includes('empleado') || error.includes('Este email ya está registrado como empleado')) {
      title = 'Cuenta de Empleado Detectada';
      message = 'Este correo electrónico está registrado como empleado de la empresa. ' +
                'El portal de clientes es exclusivo para clientes externos. ' +
                'Por favor, utiliza otro correo electrónico para acceder como cliente.';
      icon = 'info';
    } else if (error === 'auth_failed') {
      title = 'Error de Autenticación';
      message = 'No se pudo completar la autenticación con Google. Por favor, intenta nuevamente.';
      icon = 'error';
    } else if (error === 'no_token') {
      title = 'Error de Autenticación';
      message = 'No se recibió el token de autenticación. Por favor, intenta nuevamente.';
      icon = 'error';
    } else {
      // Mensaje genérico para otros errores
      title = 'Error de Autenticación';
      message = decodeURIComponent(error);
      icon = 'error';
    }

    Swal.fire({
      icon: icon,
      title: title,
      text: message,
      confirmButtonColor: '#7c3aed',
      confirmButtonText: 'Entendido',
      allowOutsideClick: false
    });
  }

  /**
   * Inicia el flujo de Google OAuth con redirect centralizado
   * Detecta el subdomain actual y lo pasa en el state parameter
   */
  continueWithGoogle(): void {
    this.errorMessage = '';

    // 1. Obtener el subdomain usando el servicio centralizado
    const subdomain = this.subdomainService.getSubdomain();

    if (!subdomain) {
      // Verificar si estamos en localhost sin subdomain configurado
      if (this.subdomainService.getCurrentDomain().includes('localhost')) {
        this.errorMessage = 'En desarrollo local, necesitas configurar un subdomain. Abre la consola (F12) y ejecuta: localStorage.setItem("dev_subdomain", "tu-empresa")';
      } else {
        this.errorMessage = 'No se pudo detectar el subdomain. Por favor, accede desde tu empresa.oceanix.space';
      }
      return;
    }

    console.log(`🏢 Subdomain detected: ${subdomain}`);

    // 2. Obtener el hostname del frontend (sin protocolo)
    // Ej: "localhost:4200" o "techcorp.oceanix.space"
    const originDomain = window.location.host;
    console.log(`🌐 Origin domain (frontend): ${originDomain}`);

    // 3. Crear state parameter con el subdomain, originDomain y ruta de retorno
    const state = {
      subdomain: subdomain,
      originDomain: originDomain, // Dominio del frontend sin protocolo
      returnPath: '/portal/callback', // Ruta donde Angular manejará el token
      timestamp: Date.now(),
      nonce: this.generateNonce()
    };

    const stateEncoded = btoa(JSON.stringify(state));

    // 4. Construir URL de Google OAuth con redirect centralizado
    const googleClientId = '72886373796-tpm8lsidvdrkv19t1qf8467a20ihec1d.apps.googleusercontent.com';
    // IMPORTANTE: Debe apuntar al BACKEND porque es donde Google hace el callback
    // En desarrollo: http://localhost:3000/api/v1/auth/google/callback
    // En producción: https://oceanix.space/api/v1/auth/google/callback
    const redirectUri = `${environment.backendUrl}/api/v1/auth/google/callback`;

    const googleAuthUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(googleClientId)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent('openid email profile')}&` +
      `prompt=select_account&` + // Forzar selector de cuentas
      `state=${encodeURIComponent(stateEncoded)}`;

    console.log('🔄 Redirecting to Google OAuth...');
    console.log('📦 State parameter:', state);

    // 5. Redirigir a Google
    window.location.href = googleAuthUrl;
  }

  /**
   * Genera un nonce aleatorio para prevenir CSRF
   */
  private generateNonce(): string {
    return Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
  }
}
