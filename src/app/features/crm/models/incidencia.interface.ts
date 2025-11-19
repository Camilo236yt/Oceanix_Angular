// Interfaces para la respuesta del backend
export interface MetricCard {
  value: number | string;
  label: string;
  trend?: string;
  trendDirection?: 'up' | 'down';
  icon?: string;
}

export interface IncidenciasPorTipo {
  perdidas: number;
  retrasos: number;
  danos: number;
  otros: number;
}

export interface EstadoIncidencia {
  label: string;
  count: number;
  percentage: number;
  color: string;
}

export interface DashboardDataBackend {
  totalIncidencias: MetricCard;
  incidenciasResueltas: MetricCard;
  pendientes: MetricCard;
  tiempoPromedio: MetricCard;
  incidenciasPorTipo: IncidenciasPorTipo;
  estadoIncidencias: EstadoIncidencia[];
  fechaConsulta: string;
  periodo: string;
}

export interface DashboardApiResponse {
  success: boolean;
  data: DashboardDataBackend;
  statusCode: number;
}

// Interfaces para compatibilidad con el componente actual
export interface DashboardStats {
  totalIncidencias: {
    total: number;
    cambio: string;
  };
  incidenciasResueltas: {
    total: number;
    cambio: string;
  };
  pendientes: {
    total: number;
  };
  tiempoPromedio: {
    dias: number;
    cambio: string;
  };
}

export interface IncidenciasPorTipoUI {
  tipo: string;
  cantidad: number;
}

export interface EstadoIncidencias {
  estado: string;
  porcentaje: number;
  color: string;
}

export interface DashboardData {
  stats: DashboardStats;
  incidenciasPorTipo: IncidenciasPorTipoUI[];
  estadoIncidencias: EstadoIncidencias[];
}
