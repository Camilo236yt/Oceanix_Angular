import { Component, OnInit, NgZone, AfterViewInit } from '@angular/core';
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
export class PortalLoginComponent implements OnInit, AfterViewInit {
  isLoading = false;
  errorMessage = '';
  private googleInitialized = false;

  constructor(
    private router: Router,
    private authClienteService: AuthClienteService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.initializeGoogle();
  }

  ngAfterViewInit(): void {
    // Renderizar botón oculto de Google después de que la vista esté lista
    this.renderHiddenGoogleButton();
  }

  private initializeGoogle(): void {
    const checkGoogle = setInterval(() => {
      if (typeof google !== 'undefined' && google.accounts) {
        clearInterval(checkGoogle);

        google.accounts.id.initialize({
          client_id: '72886373796-tpm8lsidvdrkv19t1qf8467a20ihec1d.apps.googleusercontent.com',
          callback: (response: any) => {
            this.ngZone.run(() => {
              this.handleCredentialResponse(response);
            });
          },
          auto_select: false,
          cancel_on_tap_outside: true
        });

        this.googleInitialized = true;
        console.log('Google Identity Services initialized');

        // Renderizar el botón oculto una vez inicializado
        this.renderHiddenGoogleButton();
      }
    }, 100);

    setTimeout(() => {
      clearInterval(checkGoogle);
      if (!this.googleInitialized) {
        console.error('Google Identity Services failed to load');
      }
    }, 10000);
  }

  private renderHiddenGoogleButton(): void {
    if (!this.googleInitialized) return;

    // Verificar si ya existe
    if (document.getElementById('hidden-google-btn')) return;

    // Crear contenedor oculto para el botón de Google
    const hiddenDiv = document.createElement('div');
    hiddenDiv.id = 'hidden-google-btn';
    hiddenDiv.style.position = 'absolute';
    hiddenDiv.style.left = '-9999px';
    hiddenDiv.style.top = '-9999px';
    document.body.appendChild(hiddenDiv);

    // Renderizar el botón de Google
    google.accounts.id.renderButton(hiddenDiv, {
      theme: 'outline',
      size: 'large',
      type: 'standard',
      text: 'signin_with',
      shape: 'rectangular',
      width: 280
    });
  }

  continueWithGoogle(): void {
    if (!this.googleInitialized) {
      this.errorMessage = 'Google no está disponible. Por favor, recarga la página.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Buscar y hacer clic en el botón oculto de Google
    const hiddenBtn = document.getElementById('hidden-google-btn');
    if (hiddenBtn) {
      const googleBtn = hiddenBtn.querySelector('div[role="button"]') as HTMLElement;
      if (googleBtn) {
        googleBtn.click();
        return;
      }
    }

    // Fallback: si no encuentra el botón, mostrar error
    this.errorMessage = 'Error al iniciar Google Sign-In. Recarga la página.';
    this.isLoading = false;
  }

  private handleCredentialResponse(response: any): void {
    if (response.credential) {
      console.log('Got credential (idToken)');
      this.loginWithToken(response.credential);
    } else {
      this.errorMessage = 'Error al obtener credenciales de Google';
      this.isLoading = false;
    }
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
