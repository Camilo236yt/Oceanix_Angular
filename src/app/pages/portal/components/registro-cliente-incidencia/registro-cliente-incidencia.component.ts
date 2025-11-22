import { Component, signal, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Incidencia } from '../../models/incidencia.model';
import { IncidenciasService } from '../../services/incidencias.service';

@Component({
  selector: 'app-registro-cliente-incidencia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registro-cliente-incidencia.component.html',
  styleUrl: './registro-cliente-incidencia.component.scss'
})
export class RegistroClienteIncidenciaComponent implements OnInit {
  // Estado del panel de historial
  historialVisible = signal(true);
  panelHistorialMobileVisible = signal(false);
  panelClosing = signal(false);

  // Datos del formulario
  nombreIncidencia = '';
  numeroGuia = '';
  tipoIncidencia = '';
  descripcion = '';
  archivoSeleccionado: File | null = null;

  // Datos del historial
  incidencias: Incidencia[] = [];

  // Modal de detalles
  isModalOpen = signal(false);
  selectedIncidencia: Incidencia | null = null;

  constructor(
    private router: Router,
    private incidenciasService: IncidenciasService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarIncidencias();
  }

  cargarIncidencias(): void {
    this.incidenciasService.getIncidencias().subscribe({
      next: (incidencias) => {
        console.log('Incidencias cargadas:', incidencias);
        this.incidencias = [...incidencias];
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar incidencias:', error);
      }
    });
  }

  toggleHistorial(): void {
    this.historialVisible.set(!this.historialVisible());
  }

  abrirHistorialMobile(): void {
    this.panelHistorialMobileVisible.set(true);
    this.panelClosing.set(false);
  }

  cerrarHistorialMobile(): void {
    this.panelClosing.set(true);
    // Esperar a que termine la animación antes de ocultar
    setTimeout(() => {
      this.panelHistorialMobileVisible.set(false);
      this.panelClosing.set(false);
    }, 300); // 300ms = duración de la animación
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.archivoSeleccionado = input.files[0];
    }
  }

  enviarIncidencia(): void {
    if (!this.nombreIncidencia || !this.numeroGuia || !this.tipoIncidencia || !this.descripcion) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    this.incidenciasService.crearIncidencia({
      nombre: this.nombreIncidencia,
      numeroGuia: this.numeroGuia,
      tipoIncidencia: this.tipoIncidencia,
      descripcion: this.descripcion,
      archivo: this.archivoSeleccionado || undefined
    }).subscribe({
      next: (nuevaIncidencia) => {
        console.log('Incidencia creada:', nuevaIncidencia);
        alert('Incidencia enviada correctamente');

        // Limpiar formulario
        this.nombreIncidencia = '';
        this.numeroGuia = '';
        this.tipoIncidencia = '';
        this.descripcion = '';
        this.archivoSeleccionado = null;

        // Recargar incidencias
        this.cargarIncidencias();
      },
      error: (error) => {
        console.error('Error al crear incidencia:', error);
        alert('Error al enviar la incidencia');
      }
    });
  }

  cancelar(): void {
    if (confirm('¿Estás seguro de cancelar el registro?')) {
      this.router.navigate(['/portal/login']);
    }
  }

  verDetalles(incidencia: Incidencia): void {
    console.log('Ver detalles - alertLevel:', incidencia.alertLevel);
    this.selectedIncidencia = incidencia;
    this.isModalOpen.set(true);
    document.body.style.overflow = 'hidden';
    this.cdr.detectChanges();
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedIncidencia = null;
    document.body.style.overflow = '';
  }

  handleBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  getEstadoClass(status: string): string {
    switch (status) {
      case 'IN_PROGRESS':
        return 'bg-orange-100 text-orange-800';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-red-100 text-red-800';
      case 'CLOSED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'RESOLVED': 'Resuelto',
      'PENDING': 'Pendiente',
      'IN_PROGRESS': 'En Progreso',
      'CLOSED': 'Cerrado'
    };
    return statusMap[status] || status;
  }

  getTipoLabel(tipo: string): string {
    const tipoMap: { [key: string]: string } = {
      'por_perdida': 'Pérdida',
      'por_dano': 'Daño',
      'por_error_humano': 'Error Humano',
      'por_mantenimiento': 'Mantenimiento',
      'por_falla_tecnica': 'Falla Técnica',
      'otro': 'Otro'
    };
    return tipoMap[tipo] || tipo;
  }

  formatDate(isoDate: string): string {
    const date = new Date(isoDate);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  formatDateTime(isoDate: string): string {
    const date = new Date(isoDate);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }
}
