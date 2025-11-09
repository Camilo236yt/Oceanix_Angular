import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DashboardData } from '../models/incidencia.interface';

@Injectable({
  providedIn: 'root',
})
export class IncidenciasService {

  private mockData: DashboardData = {
    stats: {
      totalIncidencias: {
        total: 120,
        cambio: '+12% vs mes anterior'
      },
      incidenciasResueltas: {
        total: 78,
        cambio: '+8% vs mes anterior'
      },
      pendientes: {
        total: 42
      },
      tiempoPromedio: {
        dias: 2.5,
        cambio: '-15% vs mes anterior'
      }
    },
    incidenciasPorTipo: [
      { tipo: 'Pérdidas', cantidad: 45 },
      { tipo: 'Retrasos', cantidad: 30 },
      { tipo: 'Daños', cantidad: 27 },
      { tipo: 'Otros', cantidad: 18 }
    ],
    estadoIncidencias: [
      { estado: 'Resueltas', porcentaje: 65, color: '#10b981' },
      { estado: 'Pendientes', porcentaje: 25, color: '#f59e0b' },
      { estado: 'Críticas', porcentaje: 10, color: '#ef4444' }
    ]
  };

  getDashboardData(): Observable<DashboardData> {
    return of(this.mockData);
  }
}
