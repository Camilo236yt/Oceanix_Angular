import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthClienteService } from '../../services/auth-cliente.service';

declare const google: any;

@Component({
  selector: 'app-portal-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class PortalLoginComponent {
  isLoading = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private authClienteService: AuthClienteService
  ) {}

  continueWithGoogle(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Inicializar Google Identity Services
    google.accounts.id.initialize({
      client_id: '72886373796-tpm8lsidvdrkv19t1qf8467a20ihec1d.apps.googleusercontent.com',
      callback: (response: any) => this.handleCredentialResponse(response)
    });

    // Mostrar el popup de Google
    google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        // Si el prompt no se muestra, usar el botón tradicional
        google.accounts.oauth2.initTokenClient({
          client_id: '72886373796-tpm8lsidvdrkv19t1qf8467a20ihec1d.apps.googleusercontent.com',
          scope: 'email profile',
          callback: (tokenResponse: any) => {
            if (tokenResponse.access_token) {
              // Obtener el ID token usando el access token
              this.handleAccessToken(tokenResponse.access_token);
            }
          }
        }).requestAccessToken();
      }
    });
  }

  private handleCredentialResponse(response: any): void {
    if (response.credential) {
      this.loginWithToken(response.credential);
    } else {
      this.errorMessage = 'Error al obtener credenciales de Google';
      this.isLoading = false;
    }
  }

  private handleAccessToken(accessToken: string): void {
    // Con el access token, hacer login
    this.authClienteService.loginConGoogle(accessToken)
      .subscribe({
        next: (response) => {
          console.log('Login exitoso:', response);
          this.isLoading = false;
          this.router.navigate(['/portal/registro-incidencia']);
        },
        error: (error) => {
          console.error('Error en login:', error);
          this.errorMessage = error.error?.message || 'Error al iniciar sesión. Por favor, intenta nuevamente.';
          this.isLoading = false;
        }
      });
  }

  private loginWithToken(idToken: string): void {
    this.authClienteService.loginConGoogle(idToken)
      .subscribe({
        next: (response) => {
          console.log('Login exitoso:', response);
          this.isLoading = false;
          this.router.navigate(['/portal/registro-incidencia']);
        },
        error: (error) => {
          console.error('Error en login:', error);
          this.errorMessage = error.error?.message || 'Error al iniciar sesión. Por favor, intenta nuevamente.';
          this.isLoading = false;
        }
      });
  }
}
