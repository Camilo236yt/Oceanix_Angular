import { Component, signal, OnInit } from '@angular/core';
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
  empresaSeleccionada = '';
  numeroGuia = '';
  tipoIncidencia = '';
  descripcion = '';
  archivoSeleccionado: File | null = null;

  // Datos del historial
  incidencias: Incidencia[] = [];

  constructor(
    private router: Router,
    private incidenciasService: IncidenciasService
  ) {}

  ngOnInit(): void {
    this.cargarIncidencias();
  }

  cargarIncidencias(): void {
    this.incidenciasService.getIncidencias().subscribe({
      next: (incidencias) => {
        this.incidencias = incidencias;
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
    if (!this.empresaSeleccionada || !this.numeroGuia || !this.tipoIncidencia || !this.descripcion) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    this.incidenciasService.crearIncidencia({
      empresa: this.empresaSeleccionada,
      numeroGuia: this.numeroGuia,
      tipoIncidencia: this.tipoIncidencia,
      descripcion: this.descripcion,
      archivo: this.archivoSeleccionado || undefined
    }).subscribe({
      next: (nuevaIncidencia) => {
        console.log('Incidencia creada:', nuevaIncidencia);
        alert('Incidencia enviada correctamente');

        // Limpiar formulario
        this.empresaSeleccionada = '';
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
    // Mock: Solo visual
    console.log('Ver detalles de:', incidencia);
    alert(`Detalles de ${incidencia.id}\n\nEmpresa: ${incidencia.empresa}\nGuía: ${incidencia.guia}\nTipo: ${incidencia.tipo}\nEstado: ${incidencia.estado}`);
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'En proceso':
        return 'bg-blue-100 text-blue-800';
      case 'Resuelto':
        return 'bg-green-100 text-green-800';
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}
