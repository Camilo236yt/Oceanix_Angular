export interface UsuarioData {
  id: string;
  enterpriseId: string;
  userType: string;
  name: string;
  phoneNumber: string;
  lastName: string;
  email: string;
  addressId: string | null;
  address: string | null;
  identificationType: string | null;
  identificationNumber: string | null;
  isActive: boolean;
  isEmailVerified: boolean;
  isLegalRepresentative: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UsuariosApiDataResponse {
  data: UsuarioData[];
  total: number;
  page: number;
  lastPage: number;
}

export interface UsuariosApiResponse {
  success: boolean;
  data: UsuariosApiDataResponse;
  statusCode: number;
}
