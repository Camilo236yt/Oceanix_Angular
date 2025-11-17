import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IncidenciasService } from '../../services/incidencias';
import { PdfExportService } from '../../services/pdf-export.service';
import { DashboardData } from '../../models/incidencia.interface';

@Component({
  selector: 'app-pdf-report-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pdf-report-modal.component.html',
  styleUrl: './pdf-report-modal.component.scss',
})
export class PdfReportModalComponent implements OnInit {
  private incidenciasService = inject(IncidenciasService);
  private pdfService = inject(PdfExportService);

  isOpen = false;
  dashboardData: DashboardData | null = null;
  isGenerating = false;
  currentDate = new Date();

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.incidenciasService.getDashboardData().subscribe({
      next: (data) => {
        this.dashboardData = data;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
      },
    });
  }

  open(): void {
    console.log('Modal open() llamado');
    console.log('dashboardData:', this.dashboardData);
    this.isOpen = true;
    document.body.style.overflow = 'hidden';
    console.log('isOpen ahora es:', this.isOpen);
  }

  close(): void {
    this.isOpen = false;
    document.body.style.overflow = 'auto';
  }

  async downloadPdf(): Promise<void> {
    this.isGenerating = true;

    try {
      const filename = `reporte-incidencias-${this.formatDate(this.currentDate)}.pdf`;
      await this.pdfService.generatePdfFromHtml('pdf-content', filename);
      console.log('PDF generado exitosamente');
    } catch (error) {
      console.error('Error al generar PDF:', error);
    } finally {
      this.isGenerating = false;
    }
  }

  formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  getMaxIncidenciasTipo(): number {
    if (!this.dashboardData) return 0;
    return Math.max(...this.dashboardData.incidenciasPorTipo.map((t) => t.cantidad));
  }

  getBarHeight(cantidad: number): number {
    const max = this.getMaxIncidenciasTipo();
    return max > 0 ? (cantidad / max) * 100 : 0;
  }

  // Función auxiliar para calcular el ángulo del gráfico de dona
  calculateDonutSegments(): { estado: string; porcentaje: number; color: string; offset: number }[] {
    if (!this.dashboardData) return [];

    let currentOffset = 0;
    return this.dashboardData.estadoIncidencias.map((item) => {
      const segment = {
        ...item,
        offset: currentOffset,
      };
      currentOffset += item.porcentaje;
      return segment;
    });
  }

  getCriticasPercentage(): number {
    if (!this.dashboardData) return 0;
    const criticas = this.dashboardData.estadoIncidencias.find((e) => e.estado === 'Críticas');
    return criticas?.porcentaje || 0;
  }
}
