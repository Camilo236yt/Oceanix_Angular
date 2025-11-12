import { Component } from '@angular/core';
import { DataTable } from '../../../../shared/components/data-table/data-table';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { SearchFiltersComponent } from '../../../../shared/components/search-filters/search-filters.component';
import { TableColumn, TableAction } from '../../../../shared/models/table.model';
import { Incident } from '../../models/incident.model';
import { FilterConfig, SearchFilterData } from '../../../../shared/models/filter.model';

@Component({
  selector: 'app-incidencias',
  imports: [DataTable, IconComponent, SearchFiltersComponent],
  templateUrl: './incidencias.html',
  styleUrl: './incidencias.scss',
})
export class Incidencias {
  // Configuración de filtros
  filterConfigs: FilterConfig[] = [
    {
      key: 'estado',
      label: 'Todos los estados',
      options: [
        { label: 'En plazo', value: 'en-plazo' },
        { label: 'En riesgo', value: 'en-riesgo' },
        { label: 'Fuera de plazo', value: 'fuera-plazo' }
      ]
    },
    {
      key: 'tipo',
      label: 'Todos los tipos',
      options: [
        { label: 'Pérdida', value: 'perdida' },
        { label: 'Retraso', value: 'retraso' },
        { label: 'Daño', value: 'dano' },
        { label: 'Otro', value: 'otro' }
      ]
    }
  ];

  tableColumns: TableColumn[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'empresa', label: 'Empresa', sortable: true },
    { key: 'tipoIncidencia', label: 'Tipo de Incidencia', sortable: true },
    {
      key: 'estado',
      label: 'Estado',
      type: 'badge',
      sortable: true,
      badgeConfig: {
        'En plazo': {
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-transparent dark:bg-transparent',
          dotColor: 'bg-green-600 dark:bg-green-400'
        },
        'En riesgo': {
          color: 'text-orange-600 dark:text-orange-400',
          bgColor: 'bg-transparent dark:bg-transparent',
          dotColor: 'bg-orange-600 dark:bg-orange-400'
        },
        'Fuera de plazo': {
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-transparent dark:bg-transparent',
          dotColor: 'bg-red-600 dark:bg-red-400'
        }
      }
    },
    { key: 'empleadoAsignado', label: 'Empleado Asignado', sortable: true },
    { key: 'fechaCreacion', label: 'Fecha Creación', type: 'date', sortable: true },
    { key: 'actions', label: 'Acciones', type: 'actions', align: 'center' }
  ];

  tableActions: TableAction[] = [
    {
      icon: 'pencil',
      label: 'Editar',
      action: (row) => this.editIncident(row)
    },
    {
      icon: 'trash-2',
      label: 'Eliminar',
      action: (row) => this.deleteIncident(row),
      color: 'text-red-600 hover:text-red-700'
    }
  ];

  incidents: Incident[] = [
    {
      id: 'INC-001',
      empresa: 'Empresa A',
      tipoIncidencia: 'Pérdida',
      estado: 'En plazo',
      empleadoAsignado: 'Juan Pérez',
      fechaCreacion: '14/1/2024'
    },
    {
      id: 'INC-002',
      empresa: 'Empresa B',
      tipoIncidencia: 'Retraso',
      estado: 'En riesgo',
      empleadoAsignado: 'María García',
      fechaCreacion: '13/1/2024'
    },
    {
      id: 'INC-003',
      empresa: 'Empresa C',
      tipoIncidencia: 'Daño',
      estado: 'Fuera de plazo',
      empleadoAsignado: 'Carlos López',
      fechaCreacion: '9/1/2024'
    },
    {
      id: 'INC-004',
      empresa: 'Empresa D',
      tipoIncidencia: 'Otro',
      estado: 'En plazo',
      empleadoAsignado: 'Ana Martínez',
      fechaCreacion: '15/1/2024'
    }
  ];

  handleTableAction(event: { action: TableAction; row: any }) {
    event.action.action(event.row);
  }

  editIncident(incident: Incident) {
    console.log('Editar incidencia:', incident);
  }

  deleteIncident(incident: Incident) {
    console.log('Eliminar incidencia:', incident);
  }

  createNewIncident() {
    console.log('Crear nueva incidencia');
  }

  onFilterChange(filterData: SearchFilterData) {
    console.log('Filtros aplicados:', filterData);
    // Aquí puedes implementar la lógica de filtrado
    // Por ejemplo, filtrar el array de incidents basado en searchTerm y filters
  }
}
