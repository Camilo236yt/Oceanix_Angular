import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-reportes',
  imports: [CommonModule, FormsModule, BaseChartDirective, IconComponent],
  templateUrl: './reportes.html',
  styleUrl: './reportes.scss',
})
export class Reportes {
  // Estado del collapse
  isFiltersCollapsed: boolean = false;

  // Filtros
  fechaInicio: string = '';
  fechaFin: string = '';
  tipoIncidencia: string = 'Todos';
  empresa: string = 'Todas';

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
          stepSize: 0.7
        }
      },
      x: {
        ticks: {
          font: {
            size: 12
          }
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
          stepSize: 25
        }
      },
      x: {
        ticks: {
          font: {
            size: 12
          }
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
}
