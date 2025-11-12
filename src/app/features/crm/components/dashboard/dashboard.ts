import { Component, OnInit, ViewChild, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule, ChartComponent } from 'ng-apexcharts';
import { IncidenciasService } from '../../services/incidencias';
import { DashboardData } from '../../models/incidencia.interface';
import { ThemeService } from '../../../../core/services/theme.service';
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
  selector: 'app-dashboard',
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  @ViewChild('barChart') barChart!: ChartComponent;
  @ViewChild('pieChart') pieChart!: ChartComponent;

  dashboardData?: DashboardData;
  barChartOptions!: Partial<BarChartOptions>;
  pieChartOptions!: Partial<PieChartOptions>;

  private incidenciasService = inject(IncidenciasService);
  private themeService = inject(ThemeService);

  constructor() {
    // Efecto para actualizar gráficos cuando cambie el tema
    effect(() => {
      const isDark = this.themeService.isDark();
      if (this.dashboardData) {
        this.updateChartsTheme(isDark);
      }
    });
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.incidenciasService.getDashboardData().subscribe(data => {
      this.dashboardData = data;
      this.initBarChart();
      this.initPieChart();
    });
  }

  initBarChart(): void {
    if (!this.dashboardData) return;

    const categories = this.dashboardData.incidenciasPorTipo.map(item => item.tipo);
    const seriesData = this.dashboardData.incidenciasPorTipo.map(item => item.cantidad);
    const isDark = this.themeService.isDark();

    this.barChartOptions = {
      series: [{
        name: 'Incidencias',
        data: seriesData
      }],
      chart: {
        type: 'bar',
        height: 320,
        width: '100%',
        toolbar: {
          show: false
        },
        background: 'transparent',
        foreColor: isDark ? '#CBD5E1' : '#6B7280'
      },
      plotOptions: {
        bar: {
          borderRadius: 8,
          columnWidth: '50%',
        }
      },
      dataLabels: {
        enabled: false
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
      },
      colors: ['#7c3aed'],
      responsive: [
        {
          breakpoint: 768,
          options: {
            chart: {
              height: 256
            },
            xaxis: {
              labels: {
                style: {
                  fontSize: '10px'
                },
                rotate: -45,
                rotateAlways: true
              }
            }
          }
        }
      ]
    };
  }

  initPieChart(): void {
    if (!this.dashboardData) return;

    const labels = this.dashboardData.estadoIncidencias.map(item => item.estado);
    const series = this.dashboardData.estadoIncidencias.map(item => item.porcentaje);
    const colors = this.dashboardData.estadoIncidencias.map(item => item.color);
    const isDark = this.themeService.isDark();

    this.pieChartOptions = {
      series: series,
      chart: {
        type: 'donut',
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
      plotOptions: {
        pie: {
          donut: {
            size: '65%',
            labels: {
              show: false
            }
          }
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
            },
            plotOptions: {
              pie: {
                donut: {
                  size: '60%'
                }
              }
            }
          }
        }
      ]
    };
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
}
