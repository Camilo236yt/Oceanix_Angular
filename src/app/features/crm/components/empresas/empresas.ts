import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DataTable } from '../../../../shared/components/data-table/data-table';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { SearchFiltersComponent } from '../../../../shared/components/search-filters/search-filters.component';
import { TableColumn, TableAction } from '../../../../shared/models/table.model';
import { Company } from '../../models/company.model';
import { FilterConfig, SearchFilterData } from '../../../../shared/models/filter.model';
import { EmpresaService } from '../../services/empresa.service';
import { ViewCompanyModalComponent } from '../../../../shared/components/view-company-modal/view-company-modal';
import { EmpresaData } from '../../../../interface/empresas-api.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-empresas',
  imports: [DataTable, IconComponent, SearchFiltersComponent, ViewCompanyModalComponent],
  templateUrl: './empresas.html',
  styleUrl: './empresas.scss',
})
export class Empresas implements OnInit {
  constructor(
    private empresaService: EmpresaService,
    private cdr: ChangeDetectorRef
  ) {}
  // Configuración de filtros
  filterConfigs: FilterConfig[] = [
    {
      key: 'estado',
      label: 'Todos los estados',
      options: [
        { label: 'Activo', value: 'activo' },
        { label: 'Inactivo', value: 'inactivo' }
      ]
    }
  ];

  tableColumns: TableColumn[] = [
    { key: 'nombreEmpresa', label: 'Nombre Empresa', sortable: true },
    { key: 'subdomain', label: 'Subdominio', sortable: true },
    { key: 'correoEmpresarial', label: 'Correo Empresarial', sortable: true },
    { key: 'telefono', label: 'Teléfono', sortable: true },
    {
      key: 'estado',
      label: 'Estado',
      type: 'badge',
      sortable: true,
      badgeConfig: {
        'Activo': {
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-transparent dark:bg-transparent',
          dotColor: 'bg-green-600 dark:bg-green-400'
        },
        'Inactivo': {
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-transparent dark:bg-transparent',
          dotColor: 'bg-red-600 dark:bg-red-400'
        }
      }
    },
    { key: 'actions', label: 'Acciones', type: 'actions', align: 'left' }
  ];

  tableActions: TableAction[] = [
    {
      icon: 'eye',
      label: 'Ver',
      action: (row) => this.viewCompany(row)
    },
    {
      icon: 'pencil',
      label: 'Editar',
      action: (row) => this.editCompany(row)
    },
    {
      icon: 'trash-2',
      label: 'Eliminar',
      action: (row) => this.deleteCompany(row),
      color: 'text-red-600 hover:text-red-700'
    }
  ];

  companies: Company[] = [];

  // View company modal state
  isViewCompanyModalOpen = false;
  viewingCompanyData: EmpresaData | null = null;

  ngOnInit() {
    this.loadEmpresas();
  }

  loadEmpresas() {
    this.empresaService.getEmpresas().subscribe({
      next: (data) => {
        console.log('Empresas cargadas:', data);
        this.companies = [...data]; // Create new array reference
        this.cdr.detectChanges(); // Force change detection
      },
      error: (error) => {
        console.error('Error al cargar empresas:', error);
      }
    });
  }

  handleTableAction(event: { action: TableAction; row: any }) {
    event.action.action(event.row);
  }

  viewCompany(company: Company) {
    // Show loading
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'info',
      title: 'Cargando datos de la empresa...',
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Get full company data from backend
    this.empresaService.getEmpresaById(company.id).subscribe({
      next: (companyData) => {
        Swal.close();
        console.log('Empresa completa para ver:', companyData);
        console.log('Usuarios de la empresa:', companyData.users);
        console.log('Roles de la empresa:', companyData.roles);

        // Set company data first
        this.viewingCompanyData = companyData;

        // Force change detection
        this.cdr.detectChanges();

        // Open modal after data is set
        setTimeout(() => {
          this.isViewCompanyModalOpen = true;
          this.cdr.detectChanges();
        }, 0);
      },
      error: (error: any) => {
        console.error('Error al cargar empresa:', error);
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'Error al cargar la empresa',
          text: 'No se pudo cargar la información de la empresa',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });
      }
    });
  }

  closeViewCompanyModal() {
    this.isViewCompanyModalOpen = false;
    this.viewingCompanyData = null;
  }

  editCompany(company: Company) {
    console.log('Editar empresa:', company);
  }

  deleteCompany(company: Company) {
    console.log('Eliminar empresa:', company);
  }

  createNewCompany() {
    console.log('Crear nueva empresa');
  }

  onFilterChange(filterData: SearchFilterData) {
    console.log('Filtros aplicados:', filterData);
    // Aquí puedes implementar la lógica de filtrado
    // Por ejemplo, filtrar el array de companies basado en searchTerm y filters
  }
}
