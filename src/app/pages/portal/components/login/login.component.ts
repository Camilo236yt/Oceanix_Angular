import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthClienteService } from '../../services/auth-cliente.service';
import { LoadingSpinner } from '../../../../shared/components/loading-spinner/loading-spinner';

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
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Ya no necesitamos inicializar Google Identity Services
    // Usamos redirect flow en lugar de popup
  }

  /**
   * Inicia el flujo de Google OAuth con redirect centralizado
   * Detecta el subdomain actual y lo pasa en el state parameter
   */
  continueWithGoogle(): void {
    this.errorMessage = '';

    // 1. Obtener el subdomain actual
    const subdomain = this.getSubdomain();

    if (!subdomain) {
      this.errorMessage = 'No se pudo detectar el subdomain. Por favor, accede desde tu empresa.oceanix.space';
      return;
    }

    console.log(`🏢 Subdomain detected: ${subdomain}`);

    // 2. Crear state parameter con el subdomain y ruta de retorno
    const state = {
      subdomain: subdomain,
      returnPath: '/portal/callback', // Ruta donde Angular manejará el token
      timestamp: Date.now(),
      nonce: this.generateNonce()
    };

    const stateEncoded = btoa(JSON.stringify(state));

    // 3. Construir URL de Google OAuth con redirect centralizado
    const googleClientId = '72886373796-tpm8lsidvdrkv19t1qf8467a20ihec1d.apps.googleusercontent.com';
    const redirectUri = 'https://oceanix.space/auth/google/callback';

    const googleAuthUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(googleClientId)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent('openid email profile')}&` +
      `state=${encodeURIComponent(stateEncoded)}`;

    console.log('🔄 Redirecting to Google OAuth...');

    // 4. Redirigir a Google
    window.location.href = googleAuthUrl;
  }

  /**
   * Obtiene el subdomain actual del hostname
   * Por ejemplo: "techcorp" de "techcorp.oceanix.space"
   */
  private getSubdomain(): string {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');

    // localhost o dominio sin subdomain 
    if (parts.length < 3 || hostname.includes('localhost')) {
      return '';
    }

    // Retornar el primer segmento (subdomain)
    return parts[0];
  }

  /**
   * Genera un nonce aleatorio para prevenir CSRF
   */
  private generateNonce(): string {
    return Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
  }
}
