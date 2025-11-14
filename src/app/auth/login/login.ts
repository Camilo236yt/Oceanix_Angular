import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { emailValidator } from '../../utils/validators';
import { AuthService } from '../../services/auth.service';
import { LoginResponse } from '../../interface/auth.interface';
import { SubdomainService } from '../../core/services/subdomain.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  showPassword = false;
  errorMessage = '';
  isSubdomain = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private subdomainService: SubdomainService
  ) {}

  ngOnInit(): void {
    // Reiniciar scroll al inicio de la página
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 0);

    // Detectar si estamos en un subdominio
    this.isSubdomain = this.subdomainService.hasSubdomain();

    this.initializeForm();
  }

  /**
   * Inicializa el formulario con validaciones
   */
  private initializeForm(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [
        Validators.required,
        emailValidator()
      ]],
      password: ['', [
        Validators.required
      ]],
      rememberMe: [false]
    });
  }

  /**
   * Maneja el envío del formulario
   */
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const credentials = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.authService.login(credentials).subscribe({
      next: (response: LoginResponse) => {
        this.isLoading = false;
        if (response.success) {
          // Redirigir al dashboard del CRM
          this.authService.redirectToSubdomain(response.data.enterprise.subdomain);
        }
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        console.error('Error en login:', error);

        // Mostrar Sweet Alert según el tipo de error
        if (error.status === 401) {
          this.showLoginErrorAlert();
        } else if (error.status === 0) {
          this.showConnectionErrorAlert();
        } else {
          this.showGenericErrorAlert(error.error?.message);
        }
      }
    });
  }

  /**
   * Maneja el login con Google (sin funcionalidad por ahora)
   */
  onGoogleLogin(): void {
    console.log('Google login clicked - Functionality to be implemented');
  }

  /**
   * Navega a la página anterior
   */
  goBack(): void {
    this.router.navigate(['/']);
  }

  /**
   * Alterna la visibilidad de la contraseña
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Marca todos los campos del formulario como touched para mostrar errores
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Obtiene el mensaje de error para el campo email
   */
  getEmailError(): string {
    const emailControl = this.loginForm.get('email');
    if (emailControl?.hasError('required')) {
      return 'El email es requerido';
    }
    if (emailControl?.hasError('email') || emailControl?.hasError('pattern')) {
      return 'Ingresa un email válido';
    }
    return '';
  }

  /**
   * Obtiene el mensaje de error para el campo password
   */
  getPasswordError(): string {
    const passwordControl = this.loginForm.get('password');
    if (passwordControl?.hasError('required')) {
      return 'La contraseña es requerida';
    }
    return '';
  }

  /**
   * Verifica si un campo es inválido y ha sido tocado
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Muestra Sweet Alert para credenciales incorrectas (error 401)
   */
  private showLoginErrorAlert(): void {
    const config: any = {
      icon: 'error',
      title: 'No se pudo iniciar sesión',
      text: 'Usuario o contraseña incorrectos.',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#9333ea',
      allowOutsideClick: true,
      allowEscapeKey: true
    };

    // Solo mostrar footer con link de registro si NO estamos en un subdominio
    if (!this.isSubdomain) {
      config.footer = '<a href="/register" style="color: #9333ea; font-weight: 600;">¿No tienes cuenta? Regístrate aquí</a>';
    }

    Swal.fire(config);
  }

  /**
   * Muestra Sweet Alert para error de conexión
   */
  private showConnectionErrorAlert(): void {
    Swal.fire({
      icon: 'error',
      title: 'Error de conexión',
      text: 'No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet.',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#9333ea',
      allowOutsideClick: true,
      allowEscapeKey: true
    });
  }

  /**
   * Muestra Sweet Alert para errores genéricos
   */
  private showGenericErrorAlert(message?: string): void {
    Swal.fire({
      icon: 'error',
      title: 'Error inesperado',
      text: message || 'Ocurrió un error al iniciar sesión. Por favor, intenta nuevamente.',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#9333ea',
      allowOutsideClick: true,
      allowEscapeKey: true
    });
  }
}
