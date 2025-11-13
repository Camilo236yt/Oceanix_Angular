export interface Incidencia {
  id: string;
  empresa: string;
  guia: string;
  tipo: string;
  estado: 'En proceso' | 'Resuelto' | 'Pendiente';
  fecha: string;
  descripcion?: string;
  archivoAdjunto?: string;
}

export interface CrearIncidenciaRequest {
  empresa: string;
  numeroGuia: string;
  tipoIncidencia: string;
  descripcion: string;
  archivo?: File;
}
