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

export interface IncidenciasPorTipo {
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
  incidenciasPorTipo: IncidenciasPorTipo[];
  estadoIncidencias: EstadoIncidencias[];
}
