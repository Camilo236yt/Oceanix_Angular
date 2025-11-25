// ============================================
// INTERFACES PARA VERIFICAR CUENTA
// ============================================

// Estados de documentos
export enum EstadoDocumento {
  PENDIENTE = 'pendiente',
  APROBADO = 'aprobado',
  RECHAZADO = 'rechazado'
}

// Tipos de documentos
export enum TipoDocumento {
  RUT = 'RUT / NIT / CUIT',
  CAMARA = 'Cámara de Comercio',
  CEDULA = 'Cédula Representante Legal',
  PODER = 'Poder Notarial',
  CERTIFICADO = 'Certificado Bancario',
  OTRO = 'Otro Documento'
}

// ============================================
// PASO 1: DOCUMENTOS
// ============================================

export interface Documento {
  id?: string;
  tipo: TipoDocumento;
  obligatorio: boolean;
  archivo?: File;
  archivoUrl?: string;
  nombreArchivo?: string;
  tamanoArchivo?: number;
  descripcion?: string;
  fechaVencimiento?: Date | string;
  estado?: EstadoDocumento;
  motivoRechazo?: string;
  fechaSubida?: Date | string;
  fechaAprobacion?: Date | string;
}

export interface Paso1Documentos {
  documentosObligatorios: Documento[];
  documentosOpcionales: Documento[];
}

// ============================================
// PASO 2: MARCA
// ============================================

export interface ImagenMarca {
  archivo?: File;
  archivoUrl?: string;
  preview?: string;
}

export interface ColoresMarca {
  principal: string;
  secundario: string;
  acento: string;
}

export interface TemaAvanzado {
  tamanoFuente: '12px' | '14px' | '16px' | '18px';
  familiaFuente: 'Roboto' | 'Arial' | 'Open Sans';
  radioBordes: '0px' | '4px' | '8px' | '12px';
}

export interface Paso2Marca {
  logo?: ImagenMarca;
  favicon?: ImagenMarca;
  banner?: ImagenMarca;
  colores: ColoresMarca;
  temaAvanzado?: TemaAvanzado;
}

// ============================================
// PASO 3: EMAIL CORPORATIVO
// ============================================

export interface Paso3Email {
  dominios: string[];
  requerirEmailCorporativo: boolean;
}

// ============================================
// DATOS COMPLETOS DE VERIFICACIÓN
// ============================================

export interface DatosVerificacion {
  paso1: Paso1Documentos;
  paso2: Paso2Marca;
  paso3: Paso3Email;
}
