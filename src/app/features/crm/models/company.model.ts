export interface Company {
  id: string;
  nombreEmpresa: string;
  nit: string;
  correoEmpresarial: string;
  direccion: string;
  estado: string;
}

export type CompanyStatus = 'Activo' | 'Inactivo';
