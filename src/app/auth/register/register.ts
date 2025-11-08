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
    private router: Router
  ) {}

  ngOnInit(): void {
    // Reiniciar scroll al inicio de la página
    window.scrollTo(0, 0);

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
    window.scrollTo(0, 0);
  }

  /**
   * Regresa al paso anterior
   */
  previousStep(): void {
    this.currentStep = 1;
    // Reiniciar scroll al inicio cuando regresa al paso 1
    window.scrollTo(0, 0);
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

    // Simular el proceso de registro
    setTimeout(() => {
      this.isLoading = false;
      const registerData = {
        ...this.step1Form.value,
        ...this.step2Form.value
      };
      console.log('Register data:', registerData);
      // Aquí irá la lógica de registro cuando se implemente el backend
    }, 1500);
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
