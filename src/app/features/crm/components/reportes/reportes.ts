import { Component, OnInit, ViewChild, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { ThemeService } from '../../../../core/services/theme.service';

@Component({
  selector: 'app-reportes',
  imports: [CommonModule, FormsModule, BaseChartDirective, IconComponent],
  templateUrl: './reportes.html',
  styleUrl: './reportes.scss',
})
export class Reportes implements OnInit {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
  private themeService = inject(ThemeService);

  // Estado del collapse
  isFiltersCollapsed: boolean = true;

  // Filtros
  fechaInicio: string = '';
  fechaFin: string = '';
  tipoIncidencia: string = 'Todos';
  empresa: string = 'Todas';

  constructor() {
    effect(() => {
      const isDark = this.themeService.isDark();
      this.updateChartsTheme(isDark);
    });
  }

  ngOnInit(): void {
    const isDark = this.themeService.isDark();
    this.initCharts(isDark);
  }

  toggleFilters() {
    this.isFiltersCollapsed = !this.isFiltersCollapsed;
  }

  // Configuración de la gráfica de línea (Tiempo Promedio de Respuesta)
  lineChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [2.5, 2.8, 2.4, 2.7, 2.1],
        label: 'Tiempo Promedio (días)',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        borderColor: 'rgb(147, 51, 234)',
        pointBackgroundColor: 'rgb(147, 51, 234)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(147, 51, 234)',
        fill: true,
        tension: 0.4
      }
    ],
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May']
  };

  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 3,
        ticks: {
          stepSize: 0.7,
          color: '#6B7280'
        },
        grid: {
          color: '#E5E7EB'
        }
      },
      x: {
        ticks: {
          font: {
            size: 12
          },
          color: '#6B7280'
        },
        grid: {
          color: '#E5E7EB'
        }
      }
    }
  };

  // Configuración de la gráfica de barras (Porcentaje de Cumplimiento)
  barChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [88, 95, 78, 92],
        label: 'Cumplimiento (%)',
        backgroundColor: 'rgb(34, 197, 94)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 0,
        borderRadius: 8
      }
    ],
    labels: ['Empresa A', 'Empresa B', 'Empresa C', 'Empresa D']
  };

  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 25,
          color: '#6B7280'
        },
        grid: {
          color: '#E5E7EB'
        }
      },
      x: {
        ticks: {
          font: {
            size: 12
          },
          color: '#6B7280'
        },
        grid: {
          color: '#E5E7EB'
        }
      }
    }
  };

  aplicarFiltros() {
    console.log('Aplicar filtros:', {
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin,
      tipoIncidencia: this.tipoIncidencia,
      empresa: this.empresa
    });
  }

  limpiarFiltros() {
    this.fechaInicio = '';
    this.fechaFin = '';
    this.tipoIncidencia = 'Todos';
    this.empresa = 'Todas';
    console.log('Filtros limpiados');
  }

  exportarPDF() {
    console.log('Exportar PDF');
  }

  exportarExcel() {
    console.log('Exportar Excel');
  }

  initCharts(isDark: boolean): void {
    const textColor = isDark ? '#CBD5E1' : '#6B7280';
    const gridColor = isDark ? '#334155' : '#E5E7EB';

    if (this.lineChartOptions?.scales?.['y']) {
      this.lineChartOptions.scales['y'].ticks = {
        ...this.lineChartOptions.scales['y'].ticks,
        color: textColor
      };
      this.lineChartOptions.scales['y'].grid = {
        color: gridColor
      };
    }

    if (this.lineChartOptions?.scales?.['x']) {
      this.lineChartOptions.scales['x'].ticks = {
        ...this.lineChartOptions.scales['x'].ticks,
        color: textColor
      };
      this.lineChartOptions.scales['x'].grid = {
        color: gridColor
      };
    }

    if (this.barChartOptions?.scales?.['y']) {
      this.barChartOptions.scales['y'].ticks = {
        ...this.barChartOptions.scales['y'].ticks,
        color: textColor
      };
      this.barChartOptions.scales['y'].grid = {
        color: gridColor
      };
    }

    if (this.barChartOptions?.scales?.['x']) {
      this.barChartOptions.scales['x'].ticks = {
        ...this.barChartOptions.scales['x'].ticks,
        color: textColor
      };
      this.barChartOptions.scales['x'].grid = {
        color: gridColor
      };
    }
  }

  updateChartsTheme(isDark: boolean): void {
    const textColor = isDark ? '#CBD5E1' : '#6B7280';
    const gridColor = isDark ? '#334155' : '#E5E7EB';

    if (this.lineChartOptions?.scales?.['y']) {
      this.lineChartOptions.scales['y'].ticks = {
        ...this.lineChartOptions.scales['y'].ticks,
        color: textColor
      };
      this.lineChartOptions.scales['y'].grid = {
        color: gridColor
      };
    }

    if (this.lineChartOptions?.scales?.['x']) {
      this.lineChartOptions.scales['x'].ticks = {
        ...this.lineChartOptions.scales['x'].ticks,
        color: textColor
      };
      this.lineChartOptions.scales['x'].grid = {
        color: gridColor
      };
    }

    if (this.barChartOptions?.scales?.['y']) {
      this.barChartOptions.scales['y'].ticks = {
        ...this.barChartOptions.scales['y'].ticks,
        color: textColor
      };
      this.barChartOptions.scales['y'].grid = {
        color: gridColor
      };
    }

    if (this.barChartOptions?.scales?.['x']) {
      this.barChartOptions.scales['x'].ticks = {
        ...this.barChartOptions.scales['x'].ticks,
        color: textColor
      };
      this.barChartOptions.scales['x'].grid = {
        color: gridColor
      };
    }

    // Forzar actualización del gráfico
    if (this.chart) {
      this.chart.update();
    }
  }
}
