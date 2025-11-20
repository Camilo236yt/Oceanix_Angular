import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ReporteDataBackend, ReporteApiResponse } from '../models/reporte.interface';

@Injectable({
  providedIn: 'root',
})
export class ReportesService {
  private apiUrl = 'https://backend-dev.oceanix.space/api/v1/reports/generate';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene los datos del reporte desde el backend
   * Nota: No se envían parámetros de fecha para obtener todos los datos
   */
  getReportData(): Observable<ReporteDataBackend> {
    return this.http.get<ReporteApiResponse>(this.apiUrl, {
      withCredentials: true
    }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Obtiene los datos del reporte con fechas específicas (opcional)
   * @param startDate - Fecha de inicio en formato YYYY-MM-DD
   * @param endDate - Fecha de fin en formato YYYY-MM-DD
   */
  getReportDataWithDates(startDate?: string, endDate?: string): Observable<ReporteDataBackend> {
    let url = this.apiUrl;
    const params: string[] = [];

    if (startDate) {
      params.push(`startDate=${startDate}`);
    }
    if (endDate) {
      params.push(`endDate=${endDate}`);
    }

    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    return this.http.get<ReporteApiResponse>(url, {
      withCredentials: true
    }).pipe(
      map(response => response.data)
    );
  }
}
