import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DataTable } from '../../../../shared/components/data-table/data-table';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { SearchFiltersComponent } from '../../../../shared/components/search-filters/search-filters.component';
import { TableColumn, TableAction } from '../../../../shared/models/table.model';
import { Incident } from '../../models/incident.model';
import { FilterConfig, SearchFilterData } from '../../../../shared/models/filter.model';
import { IncidenciasService } from '../../services/incidencias.service';

@Component({
  selector: 'app-incidencias',
  imports: [DataTable, IconComponent, SearchFiltersComponent],
  templateUrl: './incidencias.html',
  styleUrl: './incidencias.scss',
})
export class Incidencias implements OnInit {
  constructor(
    private incidenciasService: IncidenciasService,
    private cdr: ChangeDetectorRef
  ) {}
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
    { key: 'name', label: 'Nombre', sortable: true },
    { key: 'descripcion', label: 'Descripción', sortable: true },
    { key: 'tipoIncidencia', label: 'Tipo de Incidencia', sortable: true },
    {
      key: 'estado',
      label: 'Estado',
      type: 'badge',
      sortable: true,
      badgeConfig: {
        'RESOLVED': {
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-transparent dark:bg-transparent',
          dotColor: 'bg-green-600 dark:bg-green-400'
        },
        'IN_PROGRESS': {
          color: 'text-orange-600 dark:text-orange-400',
          bgColor: 'bg-transparent dark:bg-transparent',
          dotColor: 'bg-orange-600 dark:bg-orange-400'
        },
        'PENDING': {
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

  incidents: Incident[] = [];

  ngOnInit(): void {
    this.loadIncidencias();
  }

  loadIncidencias(): void {
    this.incidenciasService.getIncidencias().subscribe({
      next: (data) => {
        console.log('Incidencias cargadas:', data);
        this.incidents = [...data];
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar incidencias:', error);
      }
    });
  }

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
