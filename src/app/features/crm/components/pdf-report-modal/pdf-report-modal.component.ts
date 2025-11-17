import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IncidenciasService } from '../../services/incidencias';
import { PdfExportService } from '../../services/pdf-export.service';
import { DashboardData } from '../../models/incidencia.interface';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexDataLabels,
  ApexPlotOptions,
  ApexFill,
  ApexNonAxisChartSeries,
  ApexLegend,
  ApexGrid,
} from 'ng-apexcharts';

export type BarChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  fill: ApexFill;
  colors: string[];
  grid: ApexGrid;
};

export type PieChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  colors: string[];
  legend: ApexLegend;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
};

@Component({
  selector: 'app-pdf-report-modal',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
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

  // Chart options
  barChartOptions: Partial<BarChartOptions> | null = null;
  pieChartOptions: Partial<PieChartOptions> | null = null;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.incidenciasService.getDashboardData().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.initBarChart();
        this.initPieChart();
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
      },
    });
  }

  initBarChart(): void {
    if (!this.dashboardData) return;

    const categories = this.dashboardData.incidenciasPorTipo.map((item) => item.tipo);
    const seriesData = this.dashboardData.incidenciasPorTipo.map((item) => item.cantidad);

    this.barChartOptions = {
      series: [
        {
          name: 'Incidencias',
          data: seriesData,
        },
      ],
      chart: {
        type: 'bar',
        height: 260,
        width: '100%',
        toolbar: {
          show: false,
        },
        background: 'transparent',
        foreColor: '#9CA3AF',
        animations: {
          enabled: false,
        },
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          columnWidth: '45%',
          distributed: false,
          dataLabels: {
            position: 'top',
          },
        },
      },
      dataLabels: {
        enabled: true,
        offsetY: -18,
        style: {
          fontSize: '11px',
          fontWeight: 'bold',
          colors: ['#374151'],
        },
        formatter: (val: number) => {
          return val.toString();
        },
      },
      xaxis: {
        categories: categories,
        labels: {
          style: {
            fontSize: '11px',
            colors: '#6B7280',
            fontWeight: 600,
          },
          offsetY: 2,
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      },
      yaxis: {
        show: true,
        labels: {
          style: {
            fontSize: '9px',
            colors: '#9CA3AF',
          },
          formatter: (val: number) => {
            return val.toFixed(0);
          },
        },
      },
      grid: {
        show: true,
        borderColor: '#E5E7EB',
        strokeDashArray: 0,
        position: 'back',
        xaxis: {
          lines: {
            show: false,
          },
        },
        yaxis: {
          lines: {
            show: true,
          },
        },
        padding: {
          top: 0,
          bottom: 0,
          left: 10,
          right: 10,
        },
      },
      fill: {
        opacity: 1,
        type: 'solid',
      },
      colors: ['#7c3aed'], // Color morado
    };
  }

  initPieChart(): void {
    if (!this.dashboardData) return;

    const labels = this.dashboardData.estadoIncidencias.map((item) => item.estado);
    const series = this.dashboardData.estadoIncidencias.map((item) => item.porcentaje);
    const colors = this.dashboardData.estadoIncidencias.map((item) => item.color);

    this.pieChartOptions = {
      series: series,
      chart: {
        type: 'donut',
        height: 180,
        background: 'transparent',
        foreColor: '#6B7280',
        animations: {
          enabled: false,
        },
      },
      labels: labels,
      colors: colors,
      legend: {
        position: 'bottom',
        fontSize: '8px',
        fontWeight: 500,
        markers: {
          strokeWidth: 0,
        },
        itemMargin: {
          horizontal: 8,
          vertical: 0,
        },
        labels: {
          colors: '#374151',
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => {
          return val.toFixed(0) + '%';
        },
        style: {
          fontSize: '9px',
          fontWeight: 'bold',
          colors: ['#FFFFFF'],
        },
        dropShadow: {
          enabled: false,
        },
      },
      plotOptions: {
        pie: {
          donut: {
            size: '55%',
            labels: {
              show: false,
            },
          },
          expandOnClick: false,
        },
      },
    };
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
