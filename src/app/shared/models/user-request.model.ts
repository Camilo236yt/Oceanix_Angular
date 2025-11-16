export interface CreateUserRequest {
  name: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  identificationType: string;
  identificationNumber: string;
}

export type IdentificationType = 'CC' | 'CE' | 'PASSPORT' | 'NIT';
