export interface EmpresasApiResponse {
  success: boolean;
  data: EmpresaData[];
  statusCode: number;
}

export interface EmpresaData {
  id: string;
  name: string;
  subdomain: string;
  email: string;
  phone: string;
  addressId: string | null;
  address: any | null;
  taxIdType: string | null;
  taxIdNumber: string | null;
  logo: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  users?: UserData[];
  roles?: RoleData[];
}

export interface UserData {
  id: string;
  enterpriseId: string;
  userType: string;
  name: string;
  phoneNumber: string;
  lastName: string;
  email: string;
  password: string;
  addressId: string | null;
  address: any | null;
  identificationType: string | null;
  identificationNumber: string | null;
  isActive: boolean;
  isEmailVerified: boolean;
  isLegalRepresentative: boolean;
  createdAt: string;
  updatedAt: string;
  roles?: UserRoleRelation[];
}

export interface UserRoleRelation {
  id: string;
  userId: string;
  roleId: string;
  role: RoleData;
  createdAt: string;
  updatedAt: string;
}

export interface RoleData {
  id: string;
  enterpriseId: string;
  name: string;
  description: string;
  isSystemRole: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmpresaRequest {
  name: string;
  subdomain: string;
  email: string;
  phone: string;
}

export interface CreateEmpresaResponse {
  success: boolean;
  data: EmpresaData;
  statusCode: number;
}

export interface UpdateEmpresaRequest {
  name: string;
  subdomain: string;
  email: string;
  phone: string;
}

export interface UpdateEmpresaResponse {
  success: boolean;
  data: EmpresaData;
  statusCode: number;
}
