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

  // Menu visibility states
  showBarChartMenu = false;
  showPieChartMenu = false;

  // Chart type options
  barChartTypes = [
    { value: 'bar', label: 'Barras Verticales' },
    { value: 'horizontalBar', label: 'Barras Horizontales' },
    { value: 'line', label: 'Líneas' },
    { value: 'area', label: 'Área' }
  ];

  pieChartTypes = [
    { value: 'donut', label: 'Dona' },
    { value: 'pie', label: 'Circular' }
  ];

  // Current selected chart types
  selectedBarChartType = 'bar';
  selectedPieChartType = 'donut';

  ngOnInit(): void {
    this.loadSavedChartPreferences();
    this.loadData();
  }

  loadSavedChartPreferences(): void {
    const savedBarType = localStorage.getItem('dashboard_bar_chart_type');
    const savedPieType = localStorage.getItem('dashboard_pie_chart_type');

    if (savedBarType) {
      this.selectedBarChartType = savedBarType;
    }
    if (savedPieType) {
      this.selectedPieChartType = savedPieType;
    }
  }

  toggleBarChartMenu(): void {
    this.showBarChartMenu = !this.showBarChartMenu;
    if (this.showBarChartMenu) {
      this.showPieChartMenu = false;
    }
  }

  togglePieChartMenu(): void {
    this.showPieChartMenu = !this.showPieChartMenu;
    if (this.showPieChartMenu) {
      this.showBarChartMenu = false;
    }
  }

  changeBarChartType(type: string): void {
    this.selectedBarChartType = type;
    localStorage.setItem('dashboard_bar_chart_type', type);
    this.showBarChartMenu = false;
    this.initBarChart();
  }

  changePieChartType(type: string): void {
    this.selectedPieChartType = type;
    localStorage.setItem('dashboard_pie_chart_type', type);
    this.showPieChartMenu = false;
    this.initPieChart();
  }

  closeMenus(): void {
    this.showBarChartMenu = false;
    this.showPieChartMenu = false;
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

    // Configuración base común
    const baseConfig: any = {
      series: [{
        name: 'Incidencias',
        data: seriesData
      }],
      chart: {
        height: 260,
        width: '100%',
        toolbar: {
          show: false
        },
        background: 'transparent',
        foreColor: '#9CA3AF',
        animations: {
          enabled: false
        }
      },
      dataLabels: {
        enabled: true,
        offsetY: -18,
        style: {
          fontSize: '11px',
          fontWeight: 'bold',
          colors: ['#374151']
        },
        formatter: (val: number) => {
          return val.toString();
        }
      },
      colors: ['#7c3aed'],
      yaxis: {
        show: true,
        labels: {
          style: {
            fontSize: '9px',
            colors: '#9CA3AF'
          },
          formatter: (val: number) => {
            return val.toFixed(0);
          }
        }
      },
      grid: {
        show: true,
        borderColor: '#E5E7EB',
        strokeDashArray: 0,
        position: 'back',
        xaxis: {
          lines: {
            show: false
          }
        },
        yaxis: {
          lines: {
            show: true
          }
        },
        padding: {
          top: 0,
          bottom: 0,
          left: 10,
          right: 10
        }
      }
    };

    // Configuración específica según el tipo de gráfico
    switch (this.selectedBarChartType) {
      case 'bar':
        this.barChartOptions = {
          ...baseConfig,
          chart: {
            ...baseConfig.chart,
            type: 'bar'
          },
          plotOptions: {
            bar: {
              borderRadius: 4,
              columnWidth: '45%',
              dataLabels: {
                position: 'top'
              }
            }
          },
          xaxis: {
            categories: categories,
            labels: {
              style: {
                fontSize: '11px',
                colors: '#6B7280',
                fontWeight: 600
              },
              offsetY: 2
            },
            axisBorder: {
              show: false
            },
            axisTicks: {
              show: false
            }
          },
          fill: {
            opacity: 1,
            type: 'solid'
          }
        };
        break;

      case 'horizontalBar':
        this.barChartOptions = {
          ...baseConfig,
          chart: {
            ...baseConfig.chart,
            type: 'bar'
          },
          plotOptions: {
            bar: {
              borderRadius: 4,
              horizontal: true,
              barHeight: '50%',
              dataLabels: {
                position: 'center'
              }
            }
          },
          dataLabels: {
            enabled: true,
            style: {
              fontSize: '10px',
              fontWeight: 'bold',
              colors: ['#FFFFFF']
            },
            formatter: (val: number) => {
              return val.toString();
            }
          },
          xaxis: {
            labels: {
              style: {
                fontSize: '9px',
                colors: '#6B7280',
                fontWeight: 600
              }
            },
            axisBorder: {
              show: false
            },
            axisTicks: {
              show: false
            }
          },
          yaxis: {
            labels: {
              style: {
                fontSize: '10px',
                colors: '#6B7280',
                fontWeight: 600
              }
            }
          },
          fill: {
            opacity: 1,
            type: 'solid'
          }
        };
        break;

      case 'line':
        this.barChartOptions = {
          ...baseConfig,
          chart: {
            ...baseConfig.chart,
            type: 'line'
          },
          stroke: {
            curve: 'smooth',
            width: 3
          },
          xaxis: {
            categories: categories,
            labels: {
              style: {
                fontSize: '11px',
                colors: '#6B7280',
                fontWeight: 600
              },
              offsetY: 2
            },
            axisBorder: {
              show: false
            },
            axisTicks: {
              show: false
            }
          },
          markers: {
            size: 5,
            hover: {
              size: 7
            }
          }
        };
        break;

      case 'area':
        this.barChartOptions = {
          ...baseConfig,
          chart: {
            ...baseConfig.chart,
            type: 'area'
          },
          stroke: {
            curve: 'smooth',
            width: 2
          },
          fill: {
            type: 'gradient',
            gradient: {
              shadeIntensity: 1,
              opacityFrom: 0.7,
              opacityTo: 0.3,
              stops: [0, 90, 100]
            }
          },
          xaxis: {
            categories: categories,
            labels: {
              style: {
                fontSize: '11px',
                colors: '#6B7280',
                fontWeight: 600
              },
              offsetY: 2
            },
            axisBorder: {
              show: false
            },
            axisTicks: {
              show: false
            }
          }
        };
        break;
    }
  }

  initPieChart(): void {
    if (!this.dashboardData) return;

    const labels = this.dashboardData.estadoIncidencias.map((item) => item.estado);
    const series = this.dashboardData.estadoIncidencias.map((item) => item.porcentaje);
    const colors = this.dashboardData.estadoIncidencias.map((item) => item.color);

    // Configuración base común
    const baseConfig: any = {
      series: series,
      chart: {
        height: 170,
        background: 'transparent',
        foreColor: '#6B7280',
        animations: {
          enabled: false
        }
      },
      labels: labels,
      colors: colors,
      legend: {
        position: 'bottom',
        horizontalAlign: 'center',
        fontSize: '7px',
        fontWeight: 600,
        markers: {
          strokeWidth: 0
        },
        itemMargin: {
          horizontal: 5,
          vertical: 2
        },
        labels: {
          colors: '#374151'
        },
        offsetY: 5,
        floating: false
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => {
          return val.toFixed(0) + '%';
        },
        style: {
          fontSize: '7px',
          fontWeight: 'bold',
          colors: ['#FFFFFF']
        },
        dropShadow: {
          enabled: false
        }
      }
    };

    // Configuración específica según el tipo de gráfico
    switch (this.selectedPieChartType) {
      case 'donut':
        this.pieChartOptions = {
          ...baseConfig,
          chart: {
            ...baseConfig.chart,
            type: 'donut'
          },
          plotOptions: {
            pie: {
              donut: {
                size: '45%',
                labels: {
                  show: false
                }
              },
              expandOnClick: false
            }
          }
        };
        break;

      case 'pie':
        this.pieChartOptions = {
          ...baseConfig,
          chart: {
            ...baseConfig.chart,
            type: 'pie'
          },
          plotOptions: {
            pie: {
              expandOnClick: false
            }
          }
        };
        break;
    }
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
    try {
      const filename = `reporte-incidencias-${this.formatDate(this.currentDate)}.pdf`;
      await this.pdfService.generatePdfFromHtml('pdf-content', filename);
    } catch (error) {
      console.error('Error al generar PDF:', error);
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
