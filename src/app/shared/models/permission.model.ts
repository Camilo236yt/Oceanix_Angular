export interface Permission {
  id: string;
  name: string;
  title: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionCategory {
  name: string;
  permissions: Permission[];
  expanded: boolean;
  selectedCount: number;
}

export interface CreateRoleRequest {
  name: string;
  description: string;
  canReceiveIncidents: boolean;
  permissionIds: string[];
}
