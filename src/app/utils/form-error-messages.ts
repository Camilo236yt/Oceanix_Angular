/**
 * Mensajes de error centralizados para validaciones de formularios
 */

export const COMMON_ERRORS = {
  required: 'Este campo es requerido',
  minLength: (length: number) => `Mínimo ${length} caracteres`,
};

export const FIELD_ERRORS = {
  companyName: {
    invalid: 'Ingresa un nombre válido (mínimo 2 caracteres)',
  },
  subdomain: {
    invalid: 'Solo minúsculas, números y guiones (3-20 caracteres)',
  },
  email: {
    invalid: 'Ingresa un correo electrónico válido',
  },
  phone: {
    invalid: 'El teléfono debe tener exactamente 10 dígitos',
  },
  taxIdNumber: {
    RUC: 'El RUC debe tener 11 dígitos',
    NIT: 'El NIT debe tener 9-10 dígitos',
    RFC: 'El RFC debe tener 12-13 caracteres',
    default: 'Número de identificación inválido',
  },
  name: {
    invalid: 'Solo letras, espacios y acentos (mínimo 2 caracteres)',
  },
  documentNumber: {
    DNI: 'El DNI debe tener 8 dígitos',
    Pasaporte: 'El pasaporte debe tener 6-12 caracteres alfanuméricos',
    Cedula: 'La cédula debe tener 6-10 dígitos',
    default: 'Número de documento inválido',
  },
  password: {
    minLength: 'mínimo 8 caracteres',
    hasUpperCase: '1 mayúscula',
    hasLowerCase: '1 minúscula',
    hasNumber: '1 número',
    hasSpecialChar: '1 carácter especial (.,#%!@$&*)',
    prefix: 'Debe contener: ',
    default: 'Contraseña inválida',
  },
  confirmPassword: {
    mismatch: 'Las contraseñas no coinciden',
  },
  acceptTerms: {
    required: 'Debes aceptar los términos y condiciones',
  },
};
