import { Component, OnInit, NgZone } from '@angular/core';
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
export class PortalLoginComponent implements OnInit {
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
      }
    }, 100);

    setTimeout(() => {
      clearInterval(checkGoogle);
      if (!this.googleInitialized) {
        console.error('Google Identity Services failed to load');
      }
    }, 10000);
  }

  continueWithGoogle(): void {
    if (!this.googleInitialized) {
      this.errorMessage = 'Google no está disponible. Por favor, recarga la página.';
      return;
    }

    this.errorMessage = '';

    // Usar prompt de Google que funciona en desktop y mobile
    google.accounts.id.prompt((notification: any) => {
      this.ngZone.run(() => {
        if (notification.isNotDisplayed()) {
          console.log('Prompt not displayed:', notification.getNotDisplayedReason());
          // Si el prompt no se muestra, mostrar el botón de Google en un modal
          this.showGoogleButtonModal();
        } else if (notification.isSkippedMoment()) {
          console.log('Prompt skipped:', notification.getSkippedReason());
          this.showGoogleButtonModal();
        }
      });
    });
  }

  private showGoogleButtonModal(): void {
    // Verificar si ya existe el modal
    if (document.getElementById('google-modal-overlay')) return;

    // Crear overlay
    const overlay = document.createElement('div');
    overlay.id = 'google-modal-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 9998;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    // Crear modal
    const modal = document.createElement('div');
    modal.id = 'google-modal-content';
    modal.style.cssText = `
      background: white;
      padding: 24px;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      text-align: center;
      max-width: 320px;
      width: 90%;
    `;

    // Título
    const title = document.createElement('p');
    title.textContent = 'Selecciona tu cuenta';
    title.style.cssText = `
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 600;
      color: #374151;
    `;
    modal.appendChild(title);

    // Contenedor del botón de Google
    const buttonContainer = document.createElement('div');
    buttonContainer.id = 'google-btn-container';
    buttonContainer.style.cssText = `
      display: flex;
      justify-content: center;
    `;
    modal.appendChild(buttonContainer);

    // Botón cancelar
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.style.cssText = `
      margin-top: 16px;
      padding: 8px 16px;
      background: transparent;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      color: #6b7280;
      font-size: 14px;
      cursor: pointer;
    `;
    cancelBtn.onclick = () => this.closeGoogleModal();
    modal.appendChild(cancelBtn);

    overlay.appendChild(modal);

    // Click en overlay para cerrar
    overlay.onclick = (e) => {
      if (e.target === overlay) {
        this.closeGoogleModal();
      }
    };

    document.body.appendChild(overlay);

    // Renderizar el botón de Google
    google.accounts.id.renderButton(buttonContainer, {
      theme: 'outline',
      size: 'large',
      type: 'standard',
      text: 'signin_with',
      shape: 'rectangular',
      logo_alignment: 'center',
      width: 250
    });
  }

  private closeGoogleModal(): void {
    const overlay = document.getElementById('google-modal-overlay');
    if (overlay) {
      overlay.remove();
    }
  }

  private handleCredentialResponse(response: any): void {
    this.closeGoogleModal();

    if (response.credential) {
      console.log('Got credential (idToken)');
      this.loginWithToken(response.credential);
    } else {
      this.errorMessage = 'Error al obtener credenciales de Google';
    }
  }

  private loginWithToken(idToken: string): void {
    this.authClienteService.loginConGoogle(idToken)
      .subscribe({
        next: (response) => {
          console.log('Login exitoso:', response);
          this.router.navigate(['/portal/registro-incidencia']);
        },
        error: (error) => {
          console.error('Error en login:', error);
          this.errorMessage = error.error?.message || 'Error al iniciar sesión. Por favor, intenta nuevamente.';
        }
      });
  }
}
