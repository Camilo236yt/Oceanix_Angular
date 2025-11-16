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

export interface UpdateUserRequest {
  name: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password?: string;
  confirmPassword?: string;
}

export type IdentificationType = 'CC' | 'CE' | 'PASSPORT' | 'NIT';
