export interface Incident {
  id: string;
  empresa: string;
  tipoIncidencia: string;
  estado: string;
  empleadoAsignado: string;
  fechaCreacion: string;
}

export type IncidentStatus = 'En plazo' | 'En riesgo' | 'Fuera de plazo';
export type IncidentType = 'Pérdida' | 'Retraso' | 'Daño' | 'Otro';
