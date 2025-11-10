export interface Role {
  id: string;
  rol: string;
  descripcion: string;
  permisos: string[];
  estado: string;
}

export type RoleStatus = 'Activo' | 'Inactivo';

export interface RoleStats {
  totalRoles: number;
  rolesActivos: number;
  permisosTotales: number;
  usuariosConRoles: number;
}
