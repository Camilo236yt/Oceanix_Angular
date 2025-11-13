import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthClienteService } from '../../services/auth-cliente.service';

@Component({
  selector: 'app-portal-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class PortalLoginComponent {
  constructor(
    private router: Router,
    private authClienteService: AuthClienteService
  ) {}

  continueWithGoogle(): void {
    // Mock: Simula login con Google
    this.authClienteService.loginConGoogle({ googleToken: 'mock-token' })
      .subscribe({
        next: (response) => {
          console.log('Login exitoso:', response);
          this.router.navigate(['/portal/registro-incidencia']);
        },
        error: (error) => {
          console.error('Error en login:', error);
        }
      });
  }
}
