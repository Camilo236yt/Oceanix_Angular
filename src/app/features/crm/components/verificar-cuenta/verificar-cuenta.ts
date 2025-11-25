import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatosVerificacion, Paso1Documentos, Paso2Marca, Paso3Email, TipoDocumento } from './verificar-cuenta.models';

@Component({
  selector: 'app-verificar-cuenta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './verificar-cuenta.html',
  styleUrl: './verificar-cuenta.scss',
})
export class VerificarCuenta implements OnInit {
  // Estado del stepper
  pasoActual: number = 0;
  totalPasos: number = 3;

  // Datos de cada paso
  datosVerificacion: DatosVerificacion = {
    paso1: {
      documentosObligatorios: [
        { tipo: TipoDocumento.RUT, obligatorio: true },
        { tipo: TipoDocumento.CAMARA, obligatorio: true },
        { tipo: TipoDocumento.CEDULA, obligatorio: true }
      ],
      documentosOpcionales: []
    },
    paso2: {
      colores: {
        principal: '#1976D2',
        secundario: '#424242',
        acento: '#FF4081'
      }
    },
    paso3: {
      dominios: [],
      requerirEmailCorporativo: false
    }
  };

  // Información de los pasos
  pasos = [
    { label: 'Documentos', icon: 'description' },
    { label: 'Marca', icon: 'palette' },
    { label: 'Email', icon: 'email' }
  ];

  constructor() {}

  ngOnInit(): void {
    // Cargar datos guardados si existen
    this.cargarDatosGuardados();
  }

  // ============================================
  // NAVEGACIÓN
  // ============================================

  siguientePaso(): void {
    if (this.pasoActual < this.totalPasos - 1) {
      if (this.validarPasoActual()) {
        this.guardarDatosPaso();
        this.pasoActual++;
      }
    }
  }

  pasoAnterior(): void {
    if (this.pasoActual > 0) {
      this.pasoActual--;
    }
  }

  omitirPaso(): void {
    if (this.pasoActual === 1 || this.pasoActual === 2) {
      this.pasoActual++;
    }
  }

  irAPaso(paso: number): void {
    if (paso >= 0 && paso < this.totalPasos) {
      this.pasoActual = paso;
    }
  }

  // ============================================
  // VALIDACIONES
  // ============================================

  validarPasoActual(): boolean {
    switch (this.pasoActual) {
      case 0:
        return this.validarPaso1();
      case 1:
        return true; // Paso 2 es opcional
      case 2:
        return this.validarPaso3();
      default:
        return true;
    }
  }

  validarPaso1(): boolean {
    const obligatorios = this.datosVerificacion.paso1.documentosObligatorios;
    const todosSubidos = obligatorios.every(doc => doc.archivo || doc.archivoUrl);

    if (!todosSubidos) {
      alert('Por favor, sube todos los documentos obligatorios');
      return false;
    }

    return true;
  }

  validarPaso3(): boolean {
    const { dominios, requerirEmailCorporativo } = this.datosVerificacion.paso3;

    if (requerirEmailCorporativo && dominios.length === 0) {
      alert('Debes agregar al menos un dominio si activas la restricción de email corporativo');
      return false;
    }

    return true;
  }

  // ============================================
  // GESTIÓN DE DATOS
  // ============================================

  actualizarPaso1(datos: Paso1Documentos): void {
    this.datosVerificacion.paso1 = datos;
  }

  actualizarPaso2(datos: Paso2Marca): void {
    this.datosVerificacion.paso2 = datos;
  }

  actualizarPaso3(datos: Paso3Email): void {
    this.datosVerificacion.paso3 = datos;
  }

  // ============================================
  // MANEJO DE ARCHIVOS - PASO 1
  // ============================================

  onFileSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validar tamaño (10 MB máximo)
      const maxSize = 10 * 1024 * 1024; // 10MB en bytes
      if (file.size > maxSize) {
        alert('El archivo excede el tamaño máximo de 10 MB');
        input.value = '';
        return;
      }

      // Validar tipo de archivo
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        alert('Tipo de archivo no permitido. Solo se aceptan PDF, JPG, PNG');
        input.value = '';
        return;
      }

      // Asignar archivo al documento
      this.datosVerificacion.paso1.documentosObligatorios[index].archivo = file;
      this.datosVerificacion.paso1.documentosObligatorios[index].nombreArchivo = file.name;
      this.datosVerificacion.paso1.documentosObligatorios[index].tamanoArchivo = file.size;
      this.datosVerificacion.paso1.documentosObligatorios[index].fechaSubida = new Date();

      console.log('Archivo seleccionado:', file.name, 'Tamaño:', this.formatBytes(file.size));
    }
  }

  eliminarArchivo(index: number): void {
    this.datosVerificacion.paso1.documentosObligatorios[index].archivo = undefined;
    this.datosVerificacion.paso1.documentosObligatorios[index].nombreArchivo = undefined;
    this.datosVerificacion.paso1.documentosObligatorios[index].tamanoArchivo = undefined;
    this.datosVerificacion.paso1.documentosObligatorios[index].fechaSubida = undefined;
  }

  // ============================================
  // MANEJO DE DOMINIOS - PASO 3
  // ============================================

  nuevoDominio: string = '';

  agregarDominio(): void {
    const dominio = this.nuevoDominio.trim().toLowerCase();

    // Validar formato de dominio
    const dominioRegex = /^[a-z0-9-]+\.[a-z]{2,}$/;
    if (!dominioRegex.test(dominio)) {
      alert('Formato de dominio inválido. Ejemplo: empresa.com');
      return;
    }

    // Validar que no esté duplicado
    if (this.datosVerificacion.paso3.dominios.includes(dominio)) {
      alert('Este dominio ya ha sido agregado');
      return;
    }

    // Agregar dominio
    this.datosVerificacion.paso3.dominios.push(dominio);
    this.nuevoDominio = '';
  }

  eliminarDominio(index: number): void {
    this.datosVerificacion.paso3.dominios.splice(index, 1);
  }

  // ============================================
  // UTILIDADES
  // ============================================

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  guardarDatosPaso(): void {
    // Guardar en localStorage (simular guardado automático)
    localStorage.setItem('verificacion-cuenta', JSON.stringify(this.datosVerificacion));
    console.log('Datos guardados:', this.datosVerificacion);
  }

  cargarDatosGuardados(): void {
    const datosGuardados = localStorage.getItem('verificacion-cuenta');
    if (datosGuardados) {
      try {
        this.datosVerificacion = JSON.parse(datosGuardados);
      } catch (error) {
        console.error('Error al cargar datos guardados:', error);
      }
    }
  }

  // ============================================
  // FINALIZAR
  // ============================================

  finalizar(): void {
    if (this.validarPasoActual()) {
      this.guardarDatosPaso();
      console.log('Verificación finalizada:', this.datosVerificacion);
      alert('¡Verificación completada! Los datos han sido guardados.');
      // Aquí iría la llamada al backend
      // this.verificacionService.enviarVerificacion(this.datosVerificacion).subscribe(...)
    }
  }

  // ============================================
  // HELPERS
  // ============================================

  get progreso(): number {
    return ((this.pasoActual + 1) / this.totalPasos) * 100;
  }

  get textoPaso(): string {
    return `PASO ${this.pasoActual + 1} DE ${this.totalPasos}`;
  }

  get mostrarBotonOmitir(): boolean {
    return this.pasoActual === 1 || this.pasoActual === 2;
  }

  get mostrarBotonAnterior(): boolean {
    return this.pasoActual > 0;
  }

  get textoBotonPrincipal(): string {
    if (this.pasoActual === this.totalPasos - 1) {
      return 'Finalizar';
    }
    return 'Siguiente';
  }
}
