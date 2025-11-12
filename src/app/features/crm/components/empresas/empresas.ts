import { Component } from '@angular/core';
import { DataTable } from '../../../../shared/components/data-table/data-table';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { SearchFiltersComponent } from '../../../../shared/components/search-filters/search-filters.component';
import { TableColumn, TableAction } from '../../../../shared/models/table.model';
import { Company } from '../../models/company.model';
import { FilterConfig, SearchFilterData } from '../../../../shared/models/filter.model';

@Component({
  selector: 'app-empresas',
  imports: [DataTable, IconComponent, SearchFiltersComponent],
  templateUrl: './empresas.html',
  styleUrl: './empresas.scss',
})
export class Empresas {
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
    { key: 'nit', label: 'NIT', sortable: true },
    { key: 'correoEmpresarial', label: 'Correo Empresarial', sortable: true },
    { key: 'direccion', label: 'Dirección', sortable: true },
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
    { key: 'actions', label: 'Acciones', type: 'actions', align: 'center' }
  ];

  tableActions: TableAction[] = [
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

  companies: Company[] = [
    {
      id: '1',
      nombreEmpresa: 'Empresa A S.A.S.',
      nit: '900123456-1',
      correoEmpresarial: 'contacto@empresaa.com',
      direccion: 'Calle 123 #45-67',
      estado: 'Activo'
    },
    {
      id: '2',
      nombreEmpresa: 'Empresa B Ltda.',
      nit: '900234567-2',
      correoEmpresarial: 'info@empresab.com',
      direccion: 'Carrera 45 #12-34',
      estado: 'Activo'
    },
    {
      id: '3',
      nombreEmpresa: 'Empresa C S.A.',
      nit: '900345678-3',
      correoEmpresarial: 'contacto@empresac.com',
      direccion: 'Avenida 89 #23-45',
      estado: 'Inactivo'
    }
  ];

  handleTableAction(event: { action: TableAction; row: any }) {
    event.action.action(event.row);
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
