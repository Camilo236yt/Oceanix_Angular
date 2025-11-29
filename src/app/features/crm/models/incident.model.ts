// Interface para la respuesta del backend
export interface IncidentApiResponse {
  success: boolean;
  data: IncidentData[];
  statusCode: number;
}

export interface IncidentImage {
  id: string;
  url: string;
  key: string;
  mimeType: string;
  originalName: string;
  createdAt: string;
  uploadType?: 'INITIAL' | 'ADDITIONAL';
}

export interface User {
  id: string;
  enterpriseId: string;
  userType: string;
  name: string;
  phoneNumber: string;
  lastName: string;
  email: string;
  password: string;
  addressId: string | null;
  address: any | null;
  identificationType: string | null;
  identificationNumber: string | null;
  isActive: boolean;
  isEmailVerified: boolean;
  isLegalRepresentative: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IncidentData {
  id: string;
  tipo: string;
  name: string;
  description: string;
  status: string;
  ProducReferenceId: string;
  enterpriseId: string;
  createdByUserId: string | null;
  createdBy?: User;
  assignedEmployeeId: string | null;
  assignedEmployee?: User;
  isActive: boolean;
  alertLevel: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  canClientUploadImages?: boolean;
  imagesUploadAllowedUntil?: string | null;
  imageUploadRequestedBy?: string | null;
  images?: IncidentImage[];
}

// Interface para el DataTable
export interface Incident {
  id: string;
  name: string;
  descripcion: string;
  tipoIncidencia: string;
  estado: string;
  empleadoAsignado: string;
  fechaCreacion: string;
}

export type IncidentStatus = 'RESOLVED' | 'PENDING' | 'IN_PROGRESS';
export type IncidentType = 'por_perdida' | 'por_dano' | 'por_error_humano' | 'por_mantenimiento' | 'por_falla_tecnica' | 'otro';
