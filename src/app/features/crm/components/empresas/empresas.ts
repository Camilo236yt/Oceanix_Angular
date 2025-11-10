import { Component } from '@angular/core';
import { DataTable } from '../../../../shared/components/data-table/data-table';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { TableColumn, TableAction } from '../../../../shared/models/table.model';
import { Company } from '../../models/company.model';

@Component({
  selector: 'app-empresas',
  imports: [DataTable, IconComponent],
  templateUrl: './empresas.html',
  styleUrl: './empresas.scss',
})
export class Empresas {
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
          color: 'text-green-700',
          bgColor: 'bg-green-100',
          dotColor: 'bg-green-700'
        },
        'Inactivo': {
          color: 'text-red-700',
          bgColor: 'bg-red-100',
          dotColor: 'bg-red-700'
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
}
