// Interfaces para la respuesta del backend de reportes

export interface EstadisticasReporte {
  totalIncidencias: number;
  resueltas: number;
  pendientes: number;
  tiempoPromedioResolucion: string;
}

export interface EstadoItem {
  count: number;
  percentage: number;
}

export interface DistribucionEstados {
  resueltas: EstadoItem;
  pendientes: EstadoItem;
  criticas: EstadoItem;
}

export interface IncidenciasPorTipoBackend {
  perdidas: number;
  retrasos: number;
  danos: number;
  otros: number;
}

export interface MetricasClaveBackend {
  tasaResolucion: string;
  incidenciasCriticas: number;
  eficienciaOperativa: string;
  tendenciaMensual: string;
}

export interface InformacionReporte {
  fechaGeneracion: string;
  periodo: string;
  sistema: string;
}

export interface ReporteDataBackend {
  estadisticas: EstadisticasReporte;
  distribucionEstados: DistribucionEstados;
  incidenciasPorTipo: IncidenciasPorTipoBackend;
  metricasClave: MetricasClaveBackend;
  informacionReporte: InformacionReporte;
}

export interface ReporteApiResponse {
  success: boolean;
  data: ReporteDataBackend;
  statusCode: number;
}
