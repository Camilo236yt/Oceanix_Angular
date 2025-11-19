import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DashboardData, DashboardApiResponse, DashboardDataBackend, IncidenciasPorTipoUI, EstadoIncidencias } from '../models/incidencia.interface';

@Injectable({
  providedIn: 'root',
})
export class IncidenciasService {
  private apiUrl = 'https://backend-dev.oceanix.space/api/v1/dashboard';

  constructor(private http: HttpClient) {}

  getDashboardData(): Observable<DashboardData> {
    return this.http.get<DashboardApiResponse>(this.apiUrl, {
      withCredentials: true
    }).pipe(
      map(response => this.transformDashboardData(response.data))
    );
  }

  private transformDashboardData(backendData: DashboardDataBackend): DashboardData {
    // Transformar incidencias por tipo
    const incidenciasPorTipo: IncidenciasPorTipoUI[] = [
      { tipo: 'Pérdidas', cantidad: backendData.incidenciasPorTipo.perdidas },
      { tipo: 'Retrasos', cantidad: backendData.incidenciasPorTipo.retrasos },
      { tipo: 'Daños', cantidad: backendData.incidenciasPorTipo.danos },
      { tipo: 'Otros', cantidad: backendData.incidenciasPorTipo.otros }
    ];

    // Transformar estado de incidencias
    const estadoIncidencias: EstadoIncidencias[] = backendData.estadoIncidencias.map(estado => ({
      estado: estado.label,
      porcentaje: estado.percentage,
      color: estado.color
    }));

    // Extraer el valor numérico del tiempo promedio
    const extractNumericValue = (value: number | string): number => {
      if (typeof value === 'number') return value;
      const match = value.match(/[\d.]+/);
      return match ? parseFloat(match[0]) : 0;
    };

    // Retornar datos en formato compatible con el componente
    return {
      stats: {
        totalIncidencias: {
          total: typeof backendData.totalIncidencias.value === 'number'
            ? backendData.totalIncidencias.value
            : parseInt(backendData.totalIncidencias.value as string),
          cambio: backendData.totalIncidencias.trend || ''
        },
        incidenciasResueltas: {
          total: typeof backendData.incidenciasResueltas.value === 'number'
            ? backendData.incidenciasResueltas.value
            : parseInt(backendData.incidenciasResueltas.value as string),
          cambio: backendData.incidenciasResueltas.trend || ''
        },
        pendientes: {
          total: typeof backendData.pendientes.value === 'number'
            ? backendData.pendientes.value
            : parseInt(backendData.pendientes.value as string)
        },
        tiempoPromedio: {
          dias: extractNumericValue(backendData.tiempoPromedio.value),
          cambio: backendData.tiempoPromedio.trend || ''
        }
      },
      incidenciasPorTipo,
      estadoIncidencias
    };
  }
}
