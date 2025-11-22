export interface Incidencia {
  id: number;
  tipo: string;
  name: string;
  description: string;
  status: 'IN_PROGRESS' | 'PENDING' | 'RESOLVED' | 'CLOSED';
  alertLevel: 'GREEN' | 'YELLOW' | 'RED';
  ProducReferenceId: string;
  canClientUploadImages: boolean;
  createdAt: string;
  updatedAt: string;
  clientId?: number;
  assignedEmployeeId?: number;
  createdByUserId?: number;
}

export interface CrearIncidenciaRequest {
  empresa: string;
  numeroGuia: string;
  tipoIncidencia: string;
  descripcion: string;
  archivo?: File;
}
