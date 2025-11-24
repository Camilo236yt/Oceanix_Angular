import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DataTable } from '../../../../shared/components/data-table/data-table';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { SearchFiltersComponent } from '../../../../shared/components/search-filters/search-filters.component';
import { SkeletonLoader } from '../../../../shared/components/skeleton-loader/skeleton-loader';
import { TableColumn, TableAction } from '../../../../shared/models/table.model';
import { Incident, IncidentData } from '../../models/incident.model';
import { FilterConfig, SearchFilterData } from '../../../../shared/models/filter.model';
import { IncidenciasService, IncidentPaginationParams, PaginatedIncidentsResult } from '../../services/incidencias.service';
import { ViewIncidentModalComponent } from '../../../../shared/components/view-incident-modal/view-incident-modal';
import { AttendIncidentModalComponent } from '../../../../shared/components/attend-incident-modal/attend-incident-modal';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-incidencias',
  imports: [DataTable, IconComponent, SearchFiltersComponent, SkeletonLoader, ViewIncidentModalComponent, AttendIncidentModalComponent],
  templateUrl: './incidencias.html',
  styleUrl: './incidencias.scss',
})
export class Incidencias implements OnInit {
  // Loading state
  isLoading = true;

  // Pagination state
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;
  searchTerm = '';
  activeFilters: Record<string, string> = {};

  // View incident modal state
  isViewIncidentModalOpen = false;
  viewingIncidentData: IncidentData | null = null;

  // Attend incident modal state
  isAttendModalOpen = false;
  attendingIncidentData: IncidentData | null = null;

  constructor(
    private incidenciasService: IncidenciasService,
    private cdr: ChangeDetectorRef
  ) {}
  // Configuración de filtros
  filterConfigs: FilterConfig[] = [
    {
      key: 'status',
      label: 'Todos los estados',
      options: [
        { label: 'Pendiente', value: 'PENDING' },
        { label: 'En Progreso', value: 'IN_PROGRESS' },
        { label: 'Resuelto', value: 'RESOLVED' }
      ]
    },
    {
      key: 'tipo',
      label: 'Todos los tipos',
      options: [
        { label: 'Pérdida', value: 'por_perdida' },
        { label: 'Daño', value: 'por_dano' },
        { label: 'Error Humano', value: 'por_error_humano' },
        { label: 'Mantenimiento', value: 'por_mantenimiento' },
        { label: 'Falla Técnica', value: 'por_falla_tecnica' },
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
    this.isLoading = true;

    const params: IncidentPaginationParams = {
      page: this.currentPage,
      limit: this.itemsPerPage,
      sortBy: 'createdAt',
      sortOrder: 'DESC'
    };

    if (this.searchTerm) {
      params.search = this.searchTerm;
    }

    // Add active filters to params
    if (Object.keys(this.activeFilters).length > 0) {
      params.filter = {};
      Object.keys(this.activeFilters).forEach(key => {
        if (this.activeFilters[key]) {
          params.filter![key] = this.activeFilters[key];
        }
      });
    }

    this.incidenciasService.getIncidenciasPaginated(params).subscribe({
      next: (result: PaginatedIncidentsResult) => {
        this.incidents = [...result.incidents];
        this.totalItems = result.meta.totalItems;
        this.totalPages = result.meta.totalPages;
        this.currentPage = result.meta.currentPage;
        this.itemsPerPage = result.meta.itemsPerPage;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar incidencias:', error);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadIncidencias();
  }

  onPageSizeChange(size: number): void {
    this.itemsPerPage = size;
    this.currentPage = 1;
    this.loadIncidencias();
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
    // Get full incident data and open attend modal
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

    this.incidenciasService.getIncidenciaById(incident.id).subscribe({
      next: (incidentData) => {
        Swal.close();
        this.attendingIncidentData = incidentData;
        this.isAttendModalOpen = true;
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

  closeAttendModal() {
    this.isAttendModalOpen = false;
    this.attendingIncidentData = null;
  }

  handleStatusChange(event: { id: string; status: string }) {
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
    this.searchTerm = filterData.searchTerm || '';
    this.activeFilters = filterData.filters || {};
    this.currentPage = 1;
    this.loadIncidencias();
  }
}
