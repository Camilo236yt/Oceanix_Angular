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
  private googleInitialized = false;

  constructor(
    private router: Router,
    private authClienteService: AuthClienteService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initializeGoogle();
  }

  private initializeGoogle(): void {
    let attempts = 0;
    const maxAttempts = 100; // 10 segundos (100ms * 100)

    const checkGoogle = setInterval(() => {
      attempts++;

      if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
        clearInterval(checkGoogle);

        try {
          google.accounts.id.initialize({
            client_id: '72886373796-tpm8lsidvdrkv19t1qf8467a20ihec1d.apps.googleusercontent.com',
            callback: (response: any) => {
              this.ngZone.run(() => {
                this.handleCredentialResponse(response);
              });
            }
          });

          this.googleInitialized = true;
          console.log('✅ Google Identity Services initialized successfully');
        } catch (error) {
          console.error('❌ Error initializing Google Identity Services:', error);
          this.errorMessage = 'Error al inicializar Google. Por favor, recarga la página.';
        }
      } else if (attempts >= maxAttempts) {
        clearInterval(checkGoogle);
        console.error('❌ Google Identity Services failed to load after 10 seconds');
        console.error('Script de Google no cargado. Verifica tu conexión a internet.');
      }
    }, 100);
  }

  continueWithGoogle(): void {
    if (!this.googleInitialized) {
      this.errorMessage = 'Google no está disponible. Por favor, recarga la página.';
      return;
    }

    this.errorMessage = '';

    // Renderizar el botón de Google en un div oculto y hacer click automático
    const googleButtonDiv = document.createElement('div');
    googleButtonDiv.style.position = 'absolute';
    googleButtonDiv.style.top = '-9999px';
    document.body.appendChild(googleButtonDiv);

    google.accounts.id.renderButton(googleButtonDiv, {
      type: 'standard',
      size: 'large',
      text: 'continue_with',
      shape: 'rectangular'
    });

    // Hacer click automático en el botón de Google
    setTimeout(() => {
      const googleButton = googleButtonDiv.querySelector('div[role="button"]') as HTMLElement;
      if (googleButton) {
        googleButton.click();
      }
      // Limpiar el div después de un tiempo
      setTimeout(() => {
        document.body.removeChild(googleButtonDiv);
      }, 1000);
    }, 100);
  }

  private handleCredentialResponse(response: any): void {
    if (response.credential) {
      console.log('Got credential (idToken)');
      this.loginWithIdToken(response.credential);
    } else {
      this.errorMessage = 'Error al obtener credenciales de Google';
    }
  }

  private loginWithIdToken(idToken: string): void {
    // Usar setTimeout para evitar el error de ChangeDetection
    setTimeout(() => {
      this.isLoading = true;
      this.cdr.detectChanges();

      this.authClienteService.loginConGoogle(idToken)
        .subscribe({
          next: (response) => {
            console.log('Login exitoso:', response);
            // Mantener la animación mientras redirige
            setTimeout(() => {
              this.router.navigate(['/portal/registro-incidencia']);
            }, 1000);
          },
          error: (error) => {
            console.error('Error en login:', error);
            this.isLoading = false;
            this.cdr.detectChanges();
            this.errorMessage = error.error?.message || 'Error al iniciar sesión. Por favor, intenta nuevamente.';
          }
        });
    }, 0);
  }
}
