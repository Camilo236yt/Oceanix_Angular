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
