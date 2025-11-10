import { Component } from '@angular/core';
import { DataTable } from '../../../../shared/components/data-table/data-table';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { TableColumn, TableAction } from '../../../../shared/models/table.model';
import { Incident } from '../../models/incident.model';

@Component({
  selector: 'app-incidencias',
  imports: [DataTable, IconComponent],
  templateUrl: './incidencias.html',
  styleUrl: './incidencias.scss',
})
export class Incidencias {
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
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          dotColor: 'bg-green-600'
        },
        'En riesgo': {
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          dotColor: 'bg-orange-600'
        },
        'Fuera de plazo': {
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          dotColor: 'bg-red-600'
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
}
