import { FormGroup } from '@angular/forms';
import { COMMON_ERRORS, FIELD_ERRORS } from './form-error-messages';

/**
 * Obtiene el mensaje de error para un campo específico del formulario
 */
export function getFieldError(formGroup: FormGroup, fieldName: string): string {
  const control = formGroup.get(fieldName);

  if (!control || !control.errors || !control.touched) {
    return '';
  }

  // Casos especiales que deben manejarse antes de errores comunes
  if (fieldName === 'acceptTerms' && control.errors['required']) {
    return FIELD_ERRORS.acceptTerms.required;
  }

  // Errores comunes
  if (control.errors['required']) {
    return COMMON_ERRORS.required;
  }

  if (control.errors['minlength']) {
    return COMMON_ERRORS.minLength(control.errors['minlength'].requiredLength);
  }

  // Errores específicos por campo
  switch (fieldName) {
    case 'companyName':
      return FIELD_ERRORS.companyName.invalid;

    case 'subdomain':
      if (control.errors['subdomain']) {
        return FIELD_ERRORS.subdomain.invalid;
      }
      break;

    case 'companyEmail':
    case 'email':
      if (control.errors['email']) {
        return FIELD_ERRORS.email.invalid;
      }
      break;

    case 'companyPhone':
    case 'phone':
      if (control.errors['phone']) {
        return FIELD_ERRORS.phone.invalid;
      }
      break;

    case 'taxIdNumber':
      if (control.errors['taxId']) {
        const taxIdType = formGroup.get('taxIdType')?.value;
        return FIELD_ERRORS.taxIdNumber[taxIdType as keyof typeof FIELD_ERRORS.taxIdNumber]
          || FIELD_ERRORS.taxIdNumber.default;
      }
      break;

    case 'firstName':
    case 'lastName':
      if (control.errors['name']) {
        return FIELD_ERRORS.name.invalid;
      }
      break;

    case 'documentNumber':
      if (control.errors['documentNumber']) {
        const documentType = formGroup.get('documentType')?.value;
        return FIELD_ERRORS.documentNumber[documentType as keyof typeof FIELD_ERRORS.documentNumber]
          || FIELD_ERRORS.documentNumber.default;
      }
      break;

    case 'password':
      return getPasswordErrors(control.errors);

    case 'confirmPassword':
      if (control.errors['mismatch']) {
        return FIELD_ERRORS.confirmPassword.mismatch;
      }
      break;

    case 'acceptTerms':
      return FIELD_ERRORS.acceptTerms.required;
  }

  return 'Campo inválido';
}

/**
 * Obtiene mensajes de error específicos para contraseñas
 */
function getPasswordErrors(errors: any): string {
  const messages: string[] = [];

  if (errors['minLength']) {
    messages.push(FIELD_ERRORS.password.minLength);
  }
  if (errors['hasUpperCase'] === false) {
    messages.push(FIELD_ERRORS.password.hasUpperCase);
  }
  if (errors['hasLowerCase'] === false) {
    messages.push(FIELD_ERRORS.password.hasLowerCase);
  }
  if (errors['hasNumber'] === false) {
    messages.push(FIELD_ERRORS.password.hasNumber);
  }
  if (errors['hasSpecialChar'] === false) {
    messages.push(FIELD_ERRORS.password.hasSpecialChar);
  }

  if (messages.length > 0) {
    return `${FIELD_ERRORS.password.prefix}${messages.join(', ')}`;
  }

  return FIELD_ERRORS.password.default;
}

/**
 * Verifica si un campo es inválido y ha sido tocado
 */
export function isFieldInvalid(formGroup: FormGroup, fieldName: string): boolean {
  const field = formGroup.get(fieldName);
  return !!(field && field.invalid && field.touched);
}

/**
 * Marca todos los campos del formulario como touched
 */
export function markFormGroupTouched(formGroup: FormGroup): void {
  Object.keys(formGroup.controls).forEach(key => {
    const control = formGroup.get(key);
    control?.markAsTouched();
  });
}
