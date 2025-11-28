import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoadingSpinner } from '../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-activate-account',
  standalone: true,
  imports: [CommonModule, LoadingSpinner],
  templateUrl: './activate-account.html',
  styleUrl: './activate-account.scss',
})
export class ActivateAccount implements OnInit {
  isLoading = true;
  activationStatus: 'loading' | 'success' | 'error' = 'loading';
  errorMessage = '';
  successMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Obtener el token de los query params
    this.route.queryParams.subscribe(params => {
      const token = params['token'] || params['t'];

      if (!token) {
        this.activationStatus = 'error';
        this.errorMessage = 'Token de activación no encontrado en la URL.';
        this.isLoading = false;
        return;
      }

      console.log('Token de activación obtenido de URL:', token);

      // Activar la cuenta
      this.activateAccount(token);
    });
  }

  /**
   * Activa la cuenta con el token proporcionado
   */
  private activateAccount(token: string): void {
    this.authService.activateAccount(token).subscribe({
      next: (response) => {
        console.log('Respuesta de activación:', response);

        if (response.success) {
          this.activationStatus = 'success';
          this.successMessage = response.data.message || 'Cuenta activada exitosamente';
          this.isLoading = false;

          // Redirigir automáticamente al CRM después de 2 segundos
          setTimeout(() => {
            this.router.navigate(['/crm/dashboard']);
          }, 2000);
        } else {
          this.activationStatus = 'error';
          this.errorMessage = 'No se pudo activar la cuenta. Intenta nuevamente.';
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error al activar cuenta:', error);
        this.activationStatus = 'error';
        this.isLoading = false;

        // Manejar diferentes tipos de errores
        if (error.status === 401) {
          this.errorMessage = 'Token de activación inválido o expirado.';
        } else if (error.status === 404) {
          this.errorMessage = 'Cuenta no encontrada.';
        } else if (error.status === 409) {
          this.errorMessage = 'Esta cuenta ya ha sido activada.';
          // Si ya está activada, redirigir al CRM después de 2 segundos
          setTimeout(() => {
            this.router.navigate(['/crm/dashboard']);
          }, 2000);
        } else if (error.status === 0) {
          this.errorMessage = 'Error de conexión. Por favor verifica tu conexión a internet.';
        } else {
          this.errorMessage = error.error?.message || 'Error al activar la cuenta. Por favor contacta al soporte.';
        }
      }
    });
  }

  /**
   * Redirige al usuario al login
   */
  goToLogin(): void {
    this.router.navigate(['/admin']);
  }

  /**
   * Redirige al usuario al CRM
   */
  goToCRM(): void {
    this.router.navigate(['/crm/dashboard']);
  }
}
