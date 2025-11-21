import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DataTable } from '../../../../shared/components/data-table/data-table';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { SearchFiltersComponent } from '../../../../shared/components/search-filters/search-filters.component';
import { TableColumn, TableAction } from '../../../../shared/models/table.model';
import { Incident, IncidentData } from '../../models/incident.model';
import { FilterConfig, SearchFilterData } from '../../../../shared/models/filter.model';
import { IncidenciasService } from '../../services/incidencias.service';
import { ViewIncidentModalComponent } from '../../../../shared/components/view-incident-modal/view-incident-modal';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-incidencias',
  imports: [DataTable, IconComponent, SearchFiltersComponent, ViewIncidentModalComponent],
  templateUrl: './incidencias.html',
  styleUrl: './incidencias.scss',
})
export class Incidencias implements OnInit {
  // View incident modal state
  isViewIncidentModalOpen = false;
  viewingIncidentData: IncidentData | null = null;

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
      icon: 'eye',
      label: 'Ver',
      action: (row) => this.viewIncident(row)
    },
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

  viewIncident(incident: Incident) {
    // Show loading
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'info',
      title: 'Cargando datos de la incidencia...',
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Get full incident data from backend
    this.incidenciasService.getIncidenciaById(incident.id).subscribe({
      next: (incidentData) => {
        Swal.close();
        console.log('Incidencia completa:', incidentData);

        // Set incident data
        this.viewingIncidentData = incidentData;

        // Force change detection
        this.cdr.detectChanges();

        // Open modal
        setTimeout(() => {
          this.isViewIncidentModalOpen = true;
          this.cdr.detectChanges();
        }, 0);
      },
      error: (error: any) => {
        console.error('Error al cargar incidencia:', error);
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'Error al cargar la incidencia',
          text: 'No se pudo cargar la información de la incidencia',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });
      }
    });
  }

  closeViewIncidentModal() {
    this.isViewIncidentModalOpen = false;
    this.viewingIncidentData = null;
  }

  editIncident(incident: Incident) {
    console.log('Editar incidencia:', incident);
  }

  deleteIncident(incident: Incident) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar la incidencia "${incident.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#9333ea',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Show loading
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'info',
          title: 'Eliminando incidencia...',
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        this.incidenciasService.deleteIncidencia(incident.id).subscribe({
          next: () => {
            Swal.fire({
              toast: true,
              position: 'top-end',
              icon: 'success',
              title: 'Incidencia eliminada correctamente',
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true
            });
            // Reload incidents list
            this.loadIncidencias();
          },
          error: (error: any) => {
            console.error('Error al eliminar incidencia:', error);
            Swal.fire({
              toast: true,
              position: 'top-end',
              icon: 'error',
              title: 'Error al eliminar',
              text: 'No se pudo eliminar la incidencia',
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true
            });
          }
        });
      }
    });
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
