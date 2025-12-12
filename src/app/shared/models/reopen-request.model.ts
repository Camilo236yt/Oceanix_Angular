/**
 * Modelos para el sistema de reapertura de incidencias
 */

export enum ReopenRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum ReviewDecision {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface ReopenRequest {
  id: string;
  incidenciaId: string;
  requestedByUserId: string;
  clientReason: string;
  status: ReopenRequestStatus;
  reviewedByUserId: string | null;
  reviewNotes: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  // Relaciones populadas (si el backend las incluye)
  incidencia?: {
    id: string;
    name: string;
    description: string;
    status: string;
  };
  requestedByUser?: {
    id: string;
    name: string;
    lastName: string;
    email: string;
  };
  reviewedByUser?: {
    id: string;
    name: string;
    lastName: string;
  };
}

export interface CreateReopenRequestDto {
  clientReason: string;
}

export interface ReviewReopenRequestDto {
  decision: ReviewDecision;
  reviewNotes?: string;
}

export interface PaginatedReopenRequests {
  data: ReopenRequest[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ReopenRequestResponse {
  message: string;
  request: ReopenRequest;
  incidencia?: any;
}
