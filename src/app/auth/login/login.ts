import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { emailValidator } from '../../utils/validators';

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

  constructor(
    private formBuilder: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Reiniciar scroll al inicio de la página
    window.scrollTo(0, 0);

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

    // Por ahora solo simula el proceso (sin backend)
    setTimeout(() => {
      this.isLoading = false;
      console.log('Login data:', this.loginForm.value);
      // Aquí irá la lógica de autenticación cuando se implemente el backend
    }, 1500);
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
}
