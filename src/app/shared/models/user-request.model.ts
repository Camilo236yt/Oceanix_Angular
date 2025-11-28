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

export interface CreateUserWithRolesRequest {
  userData: CreateUserRequest;
  roleIds: string[];
}

export interface UpdateUserRequest {
  name?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  confirmPassword?: string;
  isActive?: boolean;
}

export type IdentificationType = 'CC' | 'CE' | 'PASSPORT' | 'NIT';

export interface RoleOption {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
}
