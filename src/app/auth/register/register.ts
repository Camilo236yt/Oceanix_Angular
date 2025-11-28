import { Component, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {
  emailValidator,
  phoneValidator,
  subdomainValidator,
  nameValidator,
  taxIdValidator,
  documentNumberValidator,
  passwordStrengthValidator,
  matchValidator
} from '../../utils/validators';
import {
  getFieldError,
  isFieldInvalid,
  markFormGroupTouched
} from '../../utils/form-helpers';
import { NumericOnlyDirective } from '../../utils/numeric-only.directive';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';
import { RegisterEnterpriseRequest } from '../../interface/auth.interface';
import { LoadingSpinner } from '../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, NumericOnlyDirective, LoadingSpinner],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register implements OnInit {
  currentStep = 1;
  step1Form!: FormGroup;
  step2Form!: FormGroup;
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;
  showSubdomainTooltip = false;

  // Límites de caracteres dinámicos
  taxIdMaxLength = 13;
  documentMaxLength = 12;

  // Referencia al contenedor del tooltip
  @ViewChild('tooltipContainer') tooltipContainer!: ElementRef;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Reiniciar scroll al inicio de la página
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 0);

    this.initializeForms();
    this.setupDynamicValidators();
    this.setupSubdomainFormatter();

    // Llenar con datos de prueba en desarrollo
    this.fillTestData();

    // Asegurar que los formularios estén limpios al iniciar
    this.step1Form.markAsUntouched();
    this.step1Form.markAsPristine();
    this.step2Form.markAsUntouched();
    this.step2Form.markAsPristine();
  }

  /**
   * Llena el formulario con datos de prueba aleatorios
   */
  private fillTestData(): void {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 7);

    // Paso 1: Datos de la Empresa
    this.step1Form.patchValue({
      companyName: `TechSolutions ${randomId.toUpperCase()} SAS`,
      subdomain: `techsol-${randomId}`,
      companyEmail: `contact-${timestamp}@techsolutions.co`,
      companyPhone: `320${Math.floor(1000000 + Math.random() * 9000000)}`,
      taxIdType: 'NIT',
      taxIdNumber: `90${Math.floor(10000000 + Math.random() * 90000000)}`
    });

    // Paso 2: Datos del Administrador
    this.step2Form.patchValue({
      firstName: 'Carlos',
      lastName: 'Mendoza',
      email: `carlos.${randomId}.${timestamp}@techsolutions.co`,
      phone: `315${Math.floor(1000000 + Math.random() * 9000000)}`,
      documentType: 'Cedula',
      documentNumber: `10${Math.floor(10000000 + Math.random() * 90000000)}`,
      password: 'SecurePass123!',
      confirmPassword: 'SecurePass123!',
      acceptTerms: true
    });
  }

  /**
   * Inicializa los formularios de ambos pasos
   */
  private initializeForms(): void {
    // Paso 1: Datos de la Empresa
    this.step1Form = this.formBuilder.group({
      companyName: ['', [Validators.required, Validators.minLength(2)]],
      subdomain: ['', [Validators.required, subdomainValidator()]],
      companyEmail: ['', [Validators.required, emailValidator()]],
      companyPhone: ['', [Validators.required, phoneValidator()]],
      taxIdType: ['', Validators.required],
      taxIdNumber: ['', Validators.required]
    });

    // Paso 2: Datos del Administrador
    this.step2Form = this.formBuilder.group({
      firstName: ['', [Validators.required, nameValidator()]],
      lastName: ['', [Validators.required, nameValidator()]],
      email: ['', [Validators.required, emailValidator()]],
      phone: ['', [Validators.required, phoneValidator()]],
      documentType: ['', Validators.required],
      documentNumber: ['', Validators.required],
      password: ['', [Validators.required, passwordStrengthValidator()]],
      confirmPassword: ['', [Validators.required, matchValidator('password')]],
      acceptTerms: [false, Validators.requiredTrue]
    });
  }

  /**
   * Configura el formateador del campo subdomain para convertir a minúsculas y eliminar espacios
   */
  private setupSubdomainFormatter(): void {
    this.step1Form.get('subdomain')?.valueChanges.subscribe(value => {
      if (value) {
        // Convertir a minúsculas y eliminar espacios
        const formatted = value.toLowerCase().replace(/\s/g, '');
        if (value !== formatted) {
          this.step1Form.get('subdomain')?.setValue(formatted, { emitEvent: false });
        }
      }
    });
  }

  /**
   * Configura validadores dinámicos que dependen de otros campos
   */
  private setupDynamicValidators(): void {
    // Validador dinámico para taxIdNumber basado en taxIdType
    this.step1Form.get('taxIdType')?.valueChanges.subscribe(taxIdType => {
      const taxIdNumberControl = this.step1Form.get('taxIdNumber');
      if (taxIdNumberControl) {
        // Actualizar maxlength según el tipo
        switch(taxIdType) {
          case 'RUC':
            this.taxIdMaxLength = 11;
            break;
          case 'NIT':
            this.taxIdMaxLength = 10;
            break;
          case 'RFC':
            this.taxIdMaxLength = 13;
            break;
          default:
            this.taxIdMaxLength = 13;
        }

        taxIdNumberControl.setValidators([
          Validators.required,
          taxIdValidator(taxIdType)
        ]);
        taxIdNumberControl.updateValueAndValidity();
      }
    });

    // Validador dinámico para documentNumber basado en documentType
    this.step2Form.get('documentType')?.valueChanges.subscribe(documentType => {
      const documentNumberControl = this.step2Form.get('documentNumber');
      if (documentNumberControl) {
        // Actualizar maxlength según el tipo de documento
        switch(documentType) {
          case 'DNI':
            this.documentMaxLength = 8;
            break;
          case 'Pasaporte':
            this.documentMaxLength = 12;
            break;
          case 'Cedula':
            this.documentMaxLength = 10;
            break;
          default:
            this.documentMaxLength = 12;
        }

        documentNumberControl.setValidators([
          Validators.required,
          documentNumberValidator(documentType)
        ]);
        documentNumberControl.updateValueAndValidity();
      }
    });

    // Revalidar confirmPassword cuando cambia password
    this.step2Form.get('password')?.valueChanges.subscribe(() => {
      this.step2Form.get('confirmPassword')?.updateValueAndValidity();
    });
  }

  /**
   * Navega al siguiente paso
   */
  nextStep(): void {
    if (this.step1Form.invalid) {
      markFormGroupTouched(this.step1Form);
      return;
    }
    this.currentStep = 2;
    // Reiniciar scroll al inicio cuando cambia al paso 2
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 0);
  }

  /**
   * Regresa al paso anterior
   */
  previousStep(): void {
    this.currentStep = 1;
    // Reiniciar scroll al inicio cuando regresa al paso 1
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 0);
  }

  /**
   * Navega a la página de login con animación de carga
   */
  goToLogin(): void {
    this.isLoading = true;
    // Delay estándar para que se vea la animación antes de navegar
    setTimeout(() => {
      this.router.navigate(['/admin']);
    }, 800);
  }

  /**
   * Navega a la página landing con animación de carga
   */
  goBack(): void {
    this.isLoading = true;
    // Delay estándar para que se vea la animación antes de navegar
    setTimeout(() => {
      this.router.navigate(['/']);
    }, 800);
  }

  /**
   * Maneja el envío del formulario final
   */
  onSubmit(): void {
    if (this.step2Form.invalid) {
      markFormGroupTouched(this.step2Form);
      return;
    }

    this.isLoading = true;

    // Preparar datos para el registro según el formato esperado por el backend
    const registerData: RegisterEnterpriseRequest = {
      enterpriseName: this.step1Form.value.companyName,
      subdomain: this.step1Form.value.subdomain,
      enterpriseEmail: this.step1Form.value.companyEmail,
      enterprisePhone: `+57${this.step1Form.value.companyPhone}`, // Formato internacional
      enterpriseTaxIdType: this.step1Form.value.taxIdType,
      enterpriseTaxIdNumber: this.step1Form.value.taxIdNumber,
      adminName: this.step2Form.value.firstName,
      adminLastName: this.step2Form.value.lastName,
      adminEmail: this.step2Form.value.email,
      adminPhoneNumber: `+57${this.step2Form.value.phone}`, // Formato internacional
      adminPassword: this.step2Form.value.password,
      adminConfirmPassword: this.step2Form.value.confirmPassword,
      adminIdentificationType: this.step2Form.value.documentType === 'Cedula' ? 'CC' : 'PA',
      adminIdentificationNumber: this.step2Form.value.documentNumber,
      acceptTerms: this.step2Form.value.acceptTerms
    };

    // Realizar el registro
    this.authService.registerEnterprise(registerData).subscribe({
      next: (response) => {
        if (response.success) {
          // Verificar que los datos necesarios existen
          if (!response.data || !response.data.activationToken || !response.data.subdomain) {
            console.error('Estructura de respuesta inesperada:', response);
            this.isLoading = false;
            alert('Error: La respuesta del servidor no tiene el formato esperado.');
            return;
          }

          const redirectUrl = response.data.redirectUrl;
          const subdomain = response.data.subdomain;

          // Mantener isLoading = true para mostrar la animación durante la navegación

          // En local, simular el flujo redirigiendo a /auth/activate con el token
          if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            // Extraer el token del redirectUrl
            const url = new URL(redirectUrl);
            const token = url.searchParams.get('token');

            // Redirigir a la página de activación local con el token
            this.router.navigate(['/auth/activate'], {
              queryParams: { token: token }
            });
            return;
          }

          // En producción, redirigir al redirectUrl del backend (subdominio)
          window.location.href = redirectUrl;
        }
      },
      error: (error) => {
        this.isLoading = false;

        console.error('Error en registro:', error);

        // Manejar errores de conexión y servidor
        if (error.status === 0) {
          alert('❌ Error de conexión\n\nNo se pudo conectar con el servidor. Por favor verifica:\n\n1. Tu conexión a internet\n2. Que el servidor esté disponible\n3. Que no haya problemas de CORS\n\nIntenta nuevamente en unos momentos.');
          return;
        }

        if (error.status === 500) {
          // Error interno del servidor
          let errorMessage = 'Error interno del servidor';

          // Intentar extraer el mensaje de error del backend
          if (error.error?.error?.message) {
            errorMessage = error.error.error.message;
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          }

          console.error('Detalles del error 500:', error.error);

          Swal.fire({
            icon: 'error',
            title: 'Error del Servidor',
            text: `${errorMessage}. El servidor tiene un problema procesando tu solicitud. Por favor, contacta al administrador del sistema.`,
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#7c3aed',
            footer: '<span style="color: #666;">Código de error: 500</span>'
          });
          return;
        }

        if (error.status === 502 || error.status === 503 || error.status === 504) {
          Swal.fire({
            icon: 'error',
            title: 'Servidor No Disponible',
            text: 'El servidor no está disponible temporalmente. Por favor, intenta nuevamente más tarde o contacta al administrador del sistema.',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#7c3aed',
            footer: '<span style="color: #666;">Si el problema persiste, contacta a soporte técnico</span>'
          });
          return;
        }

        // Manejar errores específicos
        if (error.status === 409) {
          Swal.fire({
            icon: 'warning',
            title: 'Datos en Uso',
            text: 'El subdominio o email ya está registrado en nuestro sistema. Por favor, intenta con otros datos.',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#7c3aed'
          });
        } else if (error.status === 400) {
          // Verificar si es error de subdominio duplicado
          const errorDetails = error.error?.error?.details;

          if (Array.isArray(errorDetails) && errorDetails.some(detail =>
            detail.toLowerCase().includes('subdomain') && detail.toLowerCase().includes('exist')
          )) {
            Swal.fire({
              icon: 'error',
              title: 'Subdominio No Disponible',
              text: 'El subdominio que ingresaste ya está en uso. Por favor, elige un subdominio diferente para tu empresa.',
              confirmButtonText: 'Cambiar Subdominio',
              confirmButtonColor: '#7c3aed',
              allowOutsideClick: false
            }).then(() => {
              // Volver al paso 1 para que pueda cambiar el subdominio
              this.currentStep = 1;
              setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }, 0);
            });
          } else if (Array.isArray(errorDetails) && errorDetails.some(detail =>
            detail.toLowerCase().includes('email') && detail.toLowerCase().includes('exist')
          )) {
            Swal.fire({
              icon: 'error',
              title: 'Email Ya Registrado',
              text: 'El email que ingresaste ya está registrado en nuestro sistema. Por favor, usa un email diferente o inicia sesión si ya tienes una cuenta.',
              confirmButtonText: 'Entendido',
              confirmButtonColor: '#7c3aed'
            });
          } else {
            // Extraer el mensaje de error detallado
            let errorMsg = 'Datos inválidos';

            if (error.error?.error?.message) {
              errorMsg = error.error.error.message;
            } else if (Array.isArray(errorDetails)) {
              errorMsg = errorDetails.join(', ');
            } else if (error.error?.message) {
              errorMsg = error.error.message;
            }

            Swal.fire({
              icon: 'error',
              title: 'Error de Validación',
              text: `${errorMsg}. Por favor verifica la información ingresada.`,
              confirmButtonText: 'Revisar Datos',
              confirmButtonColor: '#7c3aed'
            });
          }
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error en el Registro',
            text: `Ocurrió un error al registrar la empresa. Por favor, intenta nuevamente o contacta a soporte técnico si el problema persiste.`,
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#7c3aed',
            footer: `<span style="color: #666;">Código de error: ${error.status || 'desconocido'}</span>`
          });
        }
      }
    });
  }

  /**
   * Alterna la visibilidad del tooltip de subdominio
   */
  toggleSubdomainTooltip(event: Event): void {
    event.stopPropagation();
    this.showSubdomainTooltip = !this.showSubdomainTooltip;
  }

  /**
   * Cierra el tooltip cuando se hace click fuera de él
   */
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (this.showSubdomainTooltip && this.tooltipContainer) {
      const clickedInside = this.tooltipContainer.nativeElement.contains(event.target);
      if (!clickedInside) {
        this.showSubdomainTooltip = false;
      }
    }
  }

  /**
   * Alterna la visibilidad de la contraseña
   */
  togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  /**
   * Verifica si un campo es inválido y ha sido tocado
   */
  isFieldInvalid(formGroup: FormGroup, fieldName: string): boolean {
    return isFieldInvalid(formGroup, fieldName);
  }

  /**
   * Obtiene el mensaje de error para un campo específico
   */
  getFieldError(formGroup: FormGroup, fieldName: string): string {
    return getFieldError(formGroup, fieldName);
  }
}
