export interface UserRole {
  id: string;
  role: {
    id: string;
    name: string;
    description: string;
  };
}

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
  roles?: UserRole[];
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

// Paginated response structure
export interface UsuariosPaginatedMeta {
  itemsPerPage: number;
  totalItems: number;
  currentPage: number;
  totalPages: number;
}

export interface UsuariosPaginatedResponse {
  data: UsuarioData[];
  meta: UsuariosPaginatedMeta;
  links: {
    first?: string;
    previous?: string;
    current: string;
    next?: string;
    last?: string;
  };
}

export interface UsuariosPaginatedApiResponse {
  success: boolean;
  data: UsuariosPaginatedResponse;
  statusCode: number;
}
