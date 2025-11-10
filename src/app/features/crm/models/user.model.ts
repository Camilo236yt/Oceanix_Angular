export interface User {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
  estado: string;
  fechaRegistro: string;
}

export type UserRole = 'Admin' | 'Empleado' | 'Supervisor';
export type UserStatus = 'Activo' | 'Inactivo';
