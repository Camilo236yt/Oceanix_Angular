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
import { AuthService } from '../../services/auth.service';
import { RegisterEnterpriseRequest } from '../../interface/auth.interface';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, NumericOnlyDirective],
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
    // Asegurar que los formularios estén limpios al iniciar
    this.step1Form.markAsUntouched();
    this.step1Form.markAsPristine();
    this.step2Form.markAsUntouched();
    this.step2Form.markAsPristine();
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
   * Navega a la página de login
   */
  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  /**
   * Navega a la página de login
   */
  goBack(): void {
    this.router.navigate(['/login']);
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
          const subdomain = response.data.enterprise.subdomain;
          const adminEmail = response.data.admin.email;
          const password = this.step2Form.value.password;

          // Login automático después del registro
          this.authService.login({
            email: adminEmail,
            password: password
          }).subscribe({
            next: (loginResponse) => {
              if (loginResponse.success) {
                this.isLoading = false;
                // Redirigir directamente al dashboard del CRM
                this.router.navigate(['/crm/dashboard']);
              }
            },
            error: (loginError) => {
              this.isLoading = false;

              // Si falla el login, redirigir a la página de login
              alert('Registro exitoso. Por favor inicia sesión.');
              this.router.navigate(['/login']);
            }
          });
        }
      },
      error: (error) => {
        this.isLoading = false;

        // Manejar errores específicos
        if (error.status === 409) {
          alert('El subdominio o email ya está en uso. Por favor, intenta con otros datos.');
        } else if (error.status === 400) {
          // Verificar si es error de subdominio duplicado
          const errorDetails = error.error?.error?.details;

          if (Array.isArray(errorDetails) && errorDetails.some(detail =>
            detail.toLowerCase().includes('subdomain') && detail.toLowerCase().includes('exist')
          )) {
            alert('⚠️ El subdominio ingresado ya está en uso.\n\nPor favor, elige un subdominio diferente para tu empresa.');
            // Volver al paso 1 para que pueda cambiar el subdominio
            this.currentStep = 1;
            setTimeout(() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 0);
          } else if (Array.isArray(errorDetails) && errorDetails.some(detail =>
            detail.toLowerCase().includes('email') && detail.toLowerCase().includes('exist')
          )) {
            alert('⚠️ El email ingresado ya está registrado.\n\nPor favor, usa un email diferente.');
          } else {
            // Extraer el mensaje de error detallado
            let errorMsg = 'Datos inválidos';

            if (error.error?.error?.message) {
              errorMsg = error.error.error.message;
            } else if (Array.isArray(errorDetails)) {
              errorMsg = errorDetails.join('\n');
            } else if (error.error?.message) {
              errorMsg = error.error.message;
            }

            alert(`Error de validación:\n\n${errorMsg}\n\nPor favor verifica la información ingresada.`);
          }
        } else {
          alert('Error al registrar la empresa. Por favor intenta nuevamente.');
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
