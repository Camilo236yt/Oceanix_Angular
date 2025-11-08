import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validador personalizado para contraseñas de registro
 * Requiere al menos 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial
 */
export function passwordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null;
    }

    const errors: any = {};

    if (value.length < 8) {
      errors.minLength = true;
    }

    if (!/[A-Z]/.test(value)) {
      errors.hasUpperCase = false;
    }

    if (!/[a-z]/.test(value)) {
      errors.hasLowerCase = false;
    }

    if (!/[0-9]/.test(value)) {
      errors.hasNumber = false;
    }

    if (!/[.,#%!@$&*]/.test(value)) {
      errors.hasSpecialChar = false;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  };
}

/**
 * Validador de email con patrón personalizado
 */
export function emailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null;
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isValid = emailPattern.test(value);

    return !isValid ? { email: true } : null;
  };
}

/**
 * Validador de teléfono (10 dígitos)
 */
export function phoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null;
    }

    // Formato: 10 dígitos exactos
    const phonePattern = /^\d{10}$/;
    const isValid = phonePattern.test(value);

    return !isValid ? { phone: true } : null;
  };
}

/**
 * Validador de subdominio
 */
export function subdomainValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null;
    }

    // Solo minúsculas, números y guiones, 3-20 caracteres
    const subdomainPattern = /^[a-z0-9-]{3,20}$/;
    const isValid = subdomainPattern.test(value);

    return !isValid ? { subdomain: true } : null;
  };
}

/**
 * Validador de nombre (solo letras, espacios, ñ, acentos)
 */
export function nameValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null;
    }

    const namePattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    const isValid = namePattern.test(value) && value.trim().length >= 2;

    return !isValid ? { name: true } : null;
  };
}

/**
 * Validador de número tributario según tipo
 */
export function taxIdValidator(taxIdType: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value || !taxIdType) {
      return null;
    }

    let isValid = false;

    switch (taxIdType) {
      case 'RUC':
        // RUC Perú: 11 dígitos
        isValid = /^\d{11}$/.test(value);
        break;
      case 'NIT':
        // NIT Colombia: 9-10 dígitos
        isValid = /^\d{9,10}$/.test(value);
        break;
      case 'RFC':
        // RFC México: 12-13 caracteres alfanuméricos
        isValid = /^[A-Z0-9Ñ&]{12,13}$/.test(value.toUpperCase());
        break;
      default:
        isValid = true;
    }

    return !isValid ? { taxId: true } : null;
  };
}

/**
 * Validador de número de documento según tipo
 */
export function documentNumberValidator(documentType: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value || !documentType) {
      return null;
    }

    let isValid = false;

    switch (documentType) {
      case 'DNI':
        // DNI: 8 dígitos
        isValid = /^\d{8}$/.test(value);
        break;
      case 'Pasaporte':
        // Pasaporte: 6-12 caracteres alfanuméricos
        isValid = /^[A-Z0-9]{6,12}$/.test(value.toUpperCase());
        break;
      case 'Cedula':
        // Cédula: 6-10 dígitos
        isValid = /^\d{6,10}$/.test(value);
        break;
      default:
        isValid = true;
    }

    return !isValid ? { documentNumber: true } : null;
  };
}

/**
 * Validador para confirmar que dos campos coinciden
 */
export function matchValidator(matchTo: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const parent = control.parent;
    if (!parent) {
      return null;
    }

    const matchControl = parent.get(matchTo);
    if (!matchControl) {
      return null;
    }

    if (control.value !== matchControl.value) {
      return { mismatch: true };
    }

    return null;
  };
}
