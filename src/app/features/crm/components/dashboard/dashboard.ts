import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule, ChartComponent } from 'ng-apexcharts';
import { IncidenciasService } from '../../services/incidencias';
import { DashboardData } from '../../models/incidencia.interface';
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

  constructor(private incidenciasService: IncidenciasService) {}

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
        }
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
            fontSize: '12px'
          },
          rotate: -45,
          rotateAlways: false
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

    this.pieChartOptions = {
      series: series,
      chart: {
        type: 'donut',
        height: 320
      },
      labels: labels,
      colors: colors,
      legend: {
        position: 'bottom'
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => {
          return val.toFixed(0) + '%';
        }
      },
      plotOptions: {
        pie: {
          donut: {
            size: '65%'
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
}
