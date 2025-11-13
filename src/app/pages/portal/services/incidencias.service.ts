import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Incidencia, CrearIncidenciaRequest } from '../models/incidencia.model';

@Injectable({
  providedIn: 'root'
})
export class IncidenciasService {
  // Datos mock - en producción esto vendría de una API
  private incidenciasMock: Incidencia[] = [
    {
      id: 'INC-001',
      empresa: 'DHL',
      guia: 'DU-1234567890',
      tipo: 'Pérdida',
      estado: 'En proceso',
      fecha: '15/01/2025'
    },
    {
      id: 'INC-002',
      empresa: 'FedEx',
      guia: 'DU-0987654321',
      tipo: 'Retraso',
      estado: 'Resuelto',
      fecha: '12/01/2025'
    },
    {
      id: 'INC-003',
      empresa: 'UPS',
      guia: 'DU-5555666677',
      tipo: 'Daño',
      estado: 'Pendiente',
      fecha: '10/01/2025'
    }
  ];

  constructor() {}

  /**
   * Obtener todas las incidencias del cliente
   */
  getIncidencias(): Observable<Incidencia[]> {
    // Mock: Retorna datos de ejemplo
    return of(this.incidenciasMock);
  }

  /**
   * Obtener una incidencia por ID
   */
  getIncidenciaById(id: string): Observable<Incidencia | undefined> {
    const incidencia = this.incidenciasMock.find(inc => inc.id === id);
    return of(incidencia);
  }

  /**
   * Crear una nueva incidencia
   */
  crearIncidencia(request: CrearIncidenciaRequest): Observable<Incidencia> {
    // Mock: Simula la creación de una incidencia
    const nuevaIncidencia: Incidencia = {
      id: `INC-00${this.incidenciasMock.length + 1}`,
      empresa: request.empresa,
      guia: request.numeroGuia,
      tipo: request.tipoIncidencia,
      estado: 'Pendiente',
      fecha: new Date().toLocaleDateString('es-CO'),
      descripcion: request.descripcion,
      archivoAdjunto: request.archivo?.name
    };

    this.incidenciasMock.unshift(nuevaIncidencia);
    return of(nuevaIncidencia);
  }

  /**
   * Eliminar una incidencia
   */
  eliminarIncidencia(id: string): Observable<boolean> {
    const index = this.incidenciasMock.findIndex(inc => inc.id === id);
    if (index > -1) {
      this.incidenciasMock.splice(index, 1);
      return of(true);
    }
    return of(false);
  }
}
