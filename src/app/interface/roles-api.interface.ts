export interface Permission {
  id: string;
  name: string;
  title: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RolePermission {
  id: string;
  permission: Permission;
}

export interface RoleData {
  id: string;
  enterpriseId: string;
  name: string;
  description: string;
  canReceiveIncidents: boolean;
  isSystemRole: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  permissions: RolePermission[];
}

export interface RolesApiResponse {
  success: boolean;
  data: RoleData[];
  statusCode: number;
}

// Paginated response from nestjs-paginate
export interface PaginatedMeta {
  itemsPerPage: number;
  totalItems: number;
  currentPage: number;
  totalPages: number;
  sortBy: [string, string][];
  searchBy: string[];
  search: string;
  filter?: Record<string, string | string[]>;
}

export interface PaginatedLinks {
  first?: string;
  previous?: string;
  current: string;
  next?: string;
  last?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginatedMeta;
  links: PaginatedLinks;
}

export interface RolesPaginatedApiResponse {
  success: boolean;
  data: PaginatedResponse<RoleData>;
  statusCode: number;
}
