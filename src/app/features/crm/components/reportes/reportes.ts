import { Component, OnInit, ViewChild, AfterViewInit, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule, ChartComponent } from 'ng-apexcharts';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { PdfReportModalComponent } from '../pdf-report-modal/pdf-report-modal.component';
import { SkeletonLoader } from '../../../../shared/components/skeleton-loader/skeleton-loader';
import { ThemeService } from '../../../../core/services/theme.service';
import { IncidenciasService } from '../../services/incidencias';
import { ReportesService } from '../../services/reportes.service';
import { DashboardData } from '../../models/incidencia.interface';
import { ReporteDataBackend } from '../../models/reporte.interface';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexPlotOptions,
  ApexFill,
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexLegend
} from 'ng-apexcharts';

export type BarChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  xaxis: ApexXAxis;
  fill: ApexFill;
  colors: string[];
  responsive: ApexResponsive[];
};

export type PieChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  colors: string[];
  responsive: ApexResponsive[];
  legend: ApexLegend;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
};

@Component({
  selector: 'app-reportes',
  imports: [CommonModule, FormsModule, NgApexchartsModule, IconComponent, PdfReportModalComponent, SkeletonLoader],
  templateUrl: './reportes.html',
  styleUrl: './reportes.scss',
})
export class Reportes implements OnInit, AfterViewInit {
  @ViewChild('barChart') barChart!: ChartComponent;
  @ViewChild('pieChart') pieChart!: ChartComponent;
  @ViewChild(PdfReportModalComponent) pdfModal?: PdfReportModalComponent;

  dashboardData = signal<DashboardData | null>(null);
  reporteData = signal<ReporteDataBackend | null>(null);
  barChartOptions!: Partial<BarChartOptions>;
  pieChartOptions!: Partial<PieChartOptions>;

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
    { value: 'pie', label: 'Circular' },
    { value: 'radialBar', label: 'Radial' }
  ];

  // Current selected chart types
  selectedBarChartType = 'bar';
  selectedPieChartType = 'donut';

  private incidenciasService = inject(IncidenciasService);
  private reportesService = inject(ReportesService);
  public themeService = inject(ThemeService);

  // Estado del collapse
  isFiltersCollapsed: boolean = true;

  // Filtros
  fechaInicio: string = '';
  fechaFin: string = '';

  constructor() {
    // Efecto para actualizar gráficos cuando cambie el tema
    effect(() => {
      const isDark = this.themeService.isDark();
      if (this.dashboardData()) {
        this.updateChartsTheme(isDark);
      }
    });
  }

  ngOnInit(): void {
    this.loadSavedChartPreferences();
    this.loadDashboardData();
    this.loadReportData();
  }

  ngAfterViewInit() {
    console.log('PdfModal inicializado en Reportes:', this.pdfModal);
  }

  toggleFilters() {
    this.isFiltersCollapsed = !this.isFiltersCollapsed;
  }

  loadSavedChartPreferences(): void {
    const savedBarType = localStorage.getItem('reportes_bar_chart_type');
    const savedPieType = localStorage.getItem('reportes_pie_chart_type');

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
    localStorage.setItem('reportes_bar_chart_type', type);
    this.showBarChartMenu = false;
    this.initBarChart();
  }

  changePieChartType(type: string): void {
    this.selectedPieChartType = type;
    localStorage.setItem('reportes_pie_chart_type', type);
    this.showPieChartMenu = false;
    this.initPieChart();
  }

  closeMenus(): void {
    this.showBarChartMenu = false;
    this.showPieChartMenu = false;
  }

  loadDashboardData(): void {
    // Cargar datos de las gráficas desde el nuevo endpoint
    this.reportesService.getChartsData().subscribe({
      next: (data) => {
        this.updateChartsWithNewData(data);
      },
      error: (error) => {
        console.error('Error al cargar datos de gráficas:', error);
      }
    });
  }

  updateChartsWithNewData(data: any): void {
    // Transformar los datos del backend al formato que espera dashboardData
    const total = data.incidenciasPorTipo.perdidas + data.incidenciasPorTipo.retrasos +
                  data.incidenciasPorTipo.danos + data.incidenciasPorTipo.otros;

    this.dashboardData.set({
      stats: {
        totalIncidencias: { total: total, cambio: '' },
        incidenciasResueltas: { total: data.estadoIncidencias.resueltas.count, cambio: '' },
        pendientes: { total: data.estadoIncidencias.pendientes.count },
        tiempoPromedio: { dias: 0, cambio: '' }
      },
      incidenciasPorTipo: [
        { tipo: 'Pérdidas', cantidad: data.incidenciasPorTipo.perdidas },
        { tipo: 'Retrasos', cantidad: data.incidenciasPorTipo.retrasos },
        { tipo: 'Daños', cantidad: data.incidenciasPorTipo.danos },
        { tipo: 'Otros', cantidad: data.incidenciasPorTipo.otros }
      ],
      estadoIncidencias: [
        {
          estado: 'Resueltas',
          porcentaje: data.estadoIncidencias.resueltas.percentage,
          color: '#10b981'
        },
        {
          estado: 'Pendientes',
          porcentaje: data.estadoIncidencias.pendientes.percentage,
          color: '#f59e0b'
        },
        {
          estado: 'Críticas',
          porcentaje: data.estadoIncidencias.criticas.percentage,
          color: '#ef4444'
        }
      ]
    });

    // Reinicializar los gráficos
    this.initBarChart();
    this.initPieChart();
  }

  loadReportData(): void {
    this.reportesService.getReportData().subscribe({
      next: (data) => {
        this.reporteData.set(data);
        console.log('Datos del reporte cargados:', data);
      },
      error: (error) => {
        console.error('Error al cargar datos del reporte:', error);
      }
    });
  }

  initBarChart(): void {
    const data = this.dashboardData();
    if (!data) return;

    const categories = data.incidenciasPorTipo.map(item => item.tipo);
    const seriesData = data.incidenciasPorTipo.map(item => item.cantidad);
    const isDark = this.themeService.isDark();

    // Configuración base común
    const baseConfig: any = {
      series: [{
        name: 'Incidencias',
        data: seriesData
      }],
      chart: {
        height: 320,
        width: '100%',
        toolbar: {
          show: false
        },
        background: 'transparent',
        foreColor: isDark ? '#CBD5E1' : '#6B7280'
      },
      dataLabels: {
        enabled: false
      },
      colors: ['#7c3aed'],
      responsive: [
        {
          breakpoint: 768,
          options: {
            chart: {
              height: 256
            }
          }
        }
      ]
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
              borderRadius: 8,
              columnWidth: '50%',
            }
          },
          xaxis: {
            categories: categories,
            labels: {
              style: {
                fontSize: '12px',
                colors: isDark ? '#CBD5E1' : '#6B7280'
              },
              rotate: -45,
              rotateAlways: false
            },
            axisBorder: {
              color: isDark ? '#334155' : '#E5E7EB'
            },
            axisTicks: {
              color: isDark ? '#334155' : '#E5E7EB'
            }
          },
          fill: {
            opacity: 1
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
              borderRadius: 8,
              horizontal: true,
              barHeight: '60%'
            }
          },
          xaxis: {
            categories: categories,
            labels: {
              style: {
                fontSize: '12px',
                colors: isDark ? '#CBD5E1' : '#6B7280'
              }
            },
            axisBorder: {
              color: isDark ? '#334155' : '#E5E7EB'
            }
          },
          fill: {
            opacity: 1
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
                fontSize: '12px',
                colors: isDark ? '#CBD5E1' : '#6B7280'
              },
              rotate: -45,
              rotateAlways: false
            },
            axisBorder: {
              color: isDark ? '#334155' : '#E5E7EB'
            },
            axisTicks: {
              color: isDark ? '#334155' : '#E5E7EB'
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
                fontSize: '12px',
                colors: isDark ? '#CBD5E1' : '#6B7280'
              },
              rotate: -45,
              rotateAlways: false
            },
            axisBorder: {
              color: isDark ? '#334155' : '#E5E7EB'
            },
            axisTicks: {
              color: isDark ? '#334155' : '#E5E7EB'
            }
          }
        };
        break;
    }
  }

  initPieChart(): void {
    const data = this.dashboardData();
    if (!data) return;

    const labels = data.estadoIncidencias.map(item => item.estado);
    const series = data.estadoIncidencias.map(item => item.porcentaje);
    const colors = data.estadoIncidencias.map(item => item.color);
    const isDark = this.themeService.isDark();

    // Configuración base común
    const baseConfig: any = {
      series: series,
      chart: {
        height: 320,
        background: 'transparent',
        foreColor: isDark ? '#CBD5E1' : '#6B7280'
      },
      labels: labels,
      colors: colors,
      legend: {
        position: 'bottom',
        labels: {
          colors: isDark ? '#CBD5E1' : '#6B7280'
        }
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => {
          return val.toFixed(0) + '%';
        },
        style: {
          colors: ['#FFFFFF']
        }
      },
      responsive: [
        {
          breakpoint: 768,
          options: {
            chart: {
              height: 280
            }
          }
        },
        {
          breakpoint: 480,
          options: {
            chart: {
              height: 240
            }
          }
        }
      ]
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
                size: '65%',
                labels: {
                  show: false
                }
              }
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
              expandOnClick: true
            }
          }
        };
        break;

      case 'radialBar':
        this.pieChartOptions = {
          series: series,
          chart: {
            height: 320,
            type: 'radialBar',
            background: 'transparent',
            foreColor: isDark ? '#CBD5E1' : '#6B7280'
          },
          plotOptions: {
            radialBar: {
              offsetY: -10,
              startAngle: -135,
              endAngle: 135,
              hollow: {
                margin: 0,
                size: '50%',
                background: 'transparent',
              },
              track: {
                background: isDark ? '#1e293b' : '#f1f5f9',
                strokeWidth: '100%',
                margin: 8,
              },
              dataLabels: {
                name: {
                  show: false
                },
                value: {
                  show: false
                },
                total: {
                  show: false
                }
              }
            }
          },
          colors: colors,
          labels: labels,
          legend: {
            show: true,
            floating: false,
            fontSize: '11px',
            position: 'bottom',
            offsetX: 0,
            offsetY: 0,
            labels: {
              useSeriesColors: true,
              colors: isDark ? '#CBD5E1' : '#6B7280'
            },
            formatter: function(seriesName: string, opts: any) {
              return seriesName + ": " + opts.w.globals.series[opts.seriesIndex].toFixed(0) + '%';
            },
            itemMargin: {
              horizontal: 8,
              vertical: 2
            }
          },
          responsive: [
            {
              breakpoint: 768,
              options: {
                chart: {
                  height: 280
                },
                plotOptions: {
                  radialBar: {
                    offsetY: -5
                  }
                }
              }
            },
            {
              breakpoint: 480,
              options: {
                chart: {
                  height: 240
                },
                plotOptions: {
                  radialBar: {
                    offsetY: 0,
                    hollow: {
                      size: '45%'
                    }
                  }
                },
                legend: {
                  fontSize: '10px'
                }
              }
            }
          ]
        };
        break;
    }
  }

  updateChartsTheme(isDark: boolean): void {
    // Actualizar gráfico de barras
    if (this.barChart) {
      this.barChart.updateOptions({
        chart: {
          foreColor: isDark ? '#CBD5E1' : '#6B7280'
        },
        xaxis: {
          labels: {
            style: {
              colors: isDark ? '#CBD5E1' : '#6B7280'
            }
          },
          axisBorder: {
            color: isDark ? '#334155' : '#E5E7EB'
          },
          axisTicks: {
            color: isDark ? '#334155' : '#E5E7EB'
          }
        }
      });
    }

    // Actualizar gráfico circular
    if (this.pieChart) {
      this.pieChart.updateOptions({
        chart: {
          foreColor: isDark ? '#CBD5E1' : '#6B7280'
        },
        legend: {
          labels: {
            colors: isDark ? '#CBD5E1' : '#6B7280'
          }
        }
      });
    }
  }

  aplicarFiltros() {
    // Aplicar filtros de fecha a las gráficas
    const startDate = this.fechaInicio || undefined;
    const endDate = this.fechaFin || undefined;

    this.reportesService.getChartsData(startDate, endDate).subscribe({
      next: (data) => {
        this.updateChartsWithNewData(data);
        console.log('Filtros aplicados:', { startDate, endDate });
      },
      error: (error) => {
        console.error('Error al aplicar filtros:', error);
      }
    });
  }

  limpiarFiltros() {
    this.fechaInicio = '';
    this.fechaFin = '';

    // Recargar los datos sin filtros (toda la data)
    this.reportesService.getChartsData().subscribe({
      next: (data) => {
        this.updateChartsWithNewData(data);
        console.log('Filtros limpiados - mostrando toda la data');
      },
      error: (error) => {
        console.error('Error al limpiar filtros:', error);
      }
    });
  }

  exportarPDF() {
    console.log('exportarPDF llamado');
    console.log('pdfModal:', this.pdfModal);
    if (this.pdfModal) {
      this.pdfModal.open();
    } else {
      console.error('El modal PDF no está inicializado');
    }
  }

  exportarExcel() {
    console.log('Exportar Excel');
  }
}
