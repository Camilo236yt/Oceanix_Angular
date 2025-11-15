export interface PermissionData {
  id: string;
  name: string;
  title: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionsApiResponse {
  success: boolean;
  data: PermissionData[];
  statusCode: number;
}
