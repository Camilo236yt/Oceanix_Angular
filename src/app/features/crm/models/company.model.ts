export interface Company {
  id: string;
  nombreEmpresa: string;
  subdomain: string;
  correoEmpresarial: string;
  telefono: string;
  estado: string;
}

export type CompanyStatus = 'Activo' | 'Inactivo';
