import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DataTable } from '../../../../shared/components/data-table/data-table';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { SearchFiltersComponent } from '../../../../shared/components/search-filters/search-filters.component';
import { TableColumn, TableAction } from '../../../../shared/models/table.model';
import { Incident, IncidentData } from '../../models/incident.model';
import { FilterConfig, SearchFilterData } from '../../../../shared/models/filter.model';
import { IncidenciasService } from '../../services/incidencias.service';
import { ViewIncidentModalComponent } from '../../../../shared/components/view-incident-modal/view-incident-modal';
import { EditIncidentStatusModalComponent } from '../../../../shared/components/edit-incident-status-modal/edit-incident-status-modal';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-incidencias',
  imports: [DataTable, IconComponent, SearchFiltersComponent, ViewIncidentModalComponent, EditIncidentStatusModalComponent],
  templateUrl: './incidencias.html',
  styleUrl: './incidencias.scss',
})
export class Incidencias implements OnInit {
  // View incident modal state
  isViewIncidentModalOpen = false;
  viewingIncidentData: IncidentData | null = null;

  // Edit incident status modal state
  isEditStatusModalOpen = false;
  editingIncidentId: string = '';
  editingIncidentName: string = '';
  editingIncidentStatus: string = '';

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
        'Resuelto': {
          color: 'text-emerald-500',
          bgColor: 'bg-transparent',
          dotColor: 'bg-emerald-400'
        },
        'En Progreso': {
          color: 'text-amber-500',
          bgColor: 'bg-transparent',
          dotColor: 'bg-amber-400'
        },
        'Pendiente': {
          color: 'text-rose-500',
          bgColor: 'bg-transparent',
          dotColor: 'bg-rose-400'
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

        // Set incident data and open modal
        this.viewingIncidentData = incidentData;
        this.isViewIncidentModalOpen = true;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
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
    // Get full incident data to get current status
    this.incidenciasService.getIncidenciaById(incident.id).subscribe({
      next: (incidentData) => {
        this.editingIncidentId = incident.id;
        this.editingIncidentName = incident.name;
        this.editingIncidentStatus = incidentData.status;
        this.isEditStatusModalOpen = true;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error al cargar incidencia:', error);
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'Error al cargar la incidencia',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });
      }
    });
  }

  closeEditStatusModal() {
    this.isEditStatusModalOpen = false;
    this.editingIncidentId = '';
    this.editingIncidentName = '';
    this.editingIncidentStatus = '';
  }

  saveIncidentStatus(event: { id: string; status: string }) {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'info',
      title: 'Actualizando estado...',
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.incidenciasService.updateIncidenciaStatus(event.id, event.status).subscribe({
      next: () => {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Estado actualizado correctamente',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });
        this.closeEditStatusModal();
        this.loadIncidencias();
      },
      error: (error: any) => {
        console.error('Error al actualizar estado:', error);
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'Error al actualizar',
          text: 'No se pudo actualizar el estado de la incidencia',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });
      }
    });
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
