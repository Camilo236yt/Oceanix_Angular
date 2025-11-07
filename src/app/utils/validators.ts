import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validador personalizado para contraseñas de registro
 * Requiere al menos 1 mayúscula y 1 carácter especial
 */
export function passwordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null;
    }

    const hasUpperCase = /[A-Z]/.test(value);
    const hasSpecialChar = /[.,#%!@$&*]/.test(value);

    const passwordValid = hasUpperCase && hasSpecialChar;

    return !passwordValid ? { passwordStrength: true } : null;
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
