export interface IncidenciaImage {
  id: string;
  url: string;
  originalName: string;
  mimeType?: string;
  uploadType?: 'INITIAL' | 'ADDITIONAL';
}

export interface Incidencia {
  id: number;
  tipo: string;
  name: string;
  description: string;
  status: 'IN_PROGRESS' | 'PENDING' | 'RESOLVED' | 'CLOSED';
  alertLevel: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';
  ProducReferenceId: string;
  canClientUploadImages: boolean;
  createdAt: string;
  updatedAt: string;
  clientId?: number;
  assignedEmployeeId?: number;
  createdByUserId?: number;
  isActive?: boolean;
  images?: IncidenciaImage[];
  hasPendingReopenRequest?: boolean;
}

export interface CrearIncidenciaRequest {
  name: string;
  description: string;
  ProducReferenceId: string;
  tipo: string;
  images?: string[];
}
