import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatosVerificacion, Paso1Documentos, Paso2Marca, Paso3EmailVerificacion, TipoDocumento } from './verificar-cuenta.models';

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
        principal: '#9333EA',
        secundario: '#424242',
        acento: '#FF4081'
      }
    },
    paso3: {
      dominios: [],
      requerirEmailCorporativo: false,
      email: '',
      emailVerificado: false,
      telefono: '',
      telefonoVerificado: false
    }
  };

  // Información de los pasos
  pasos = [
    { label: 'Documentos', icon: 'description' },
    { label: 'Marca', icon: 'palette' },
    { label: 'Contacto', icon: 'phone' }
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

  // Errores de validación
  erroresPaso1: Map<number, string> = new Map();

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
    this.erroresPaso1.clear();
    const obligatorios = this.datosVerificacion.paso1.documentosObligatorios;
    let esValido = true;

    obligatorios.forEach((doc, index) => {
      if (!doc.archivo && !doc.archivoUrl) {
        this.erroresPaso1.set(index, 'Este documento es obligatorio');
        esValido = false;
      }
    });

    return esValido;
  }

  tieneErrorDocumento(index: number): boolean {
    return this.erroresPaso1.has(index);
  }

  obtenerErrorDocumento(index: number): string {
    return this.erroresPaso1.get(index) || '';
  }

  validarPaso3(): boolean {
    const { email, emailVerificado, telefono, telefonoVerificado } = this.datosVerificacion.paso3;
    let esValido = true;

    // Limpiar errores previos
    this.errorEmail = '';
    this.errorTelefono = '';

    // Validar email
    if (!email) {
      this.errorEmail = 'El correo electrónico es obligatorio';
      esValido = false;
    } else if (!emailVerificado) {
      this.errorEmail = 'Debes verificar tu correo electrónico antes de continuar';
      esValido = false;
    }

    // Validar teléfono
    if (!telefono) {
      this.errorTelefono = 'El número de teléfono es obligatorio';
      esValido = false;
    } else if (!telefonoVerificado) {
      this.errorTelefono = 'Debes verificar tu número de teléfono antes de continuar';
      esValido = false;
    }

    return esValido;
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

  actualizarPaso3(datos: Paso3EmailVerificacion): void {
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

      // Limpiar error si existe
      this.erroresPaso1.delete(index);

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
  // MANEJO DE IMÁGENES - PASO 2
  // ============================================

  triggerFileInput(inputId: string): void {
    const input = document.getElementById(inputId) as HTMLInputElement;
    if (input) {
      input.click();
    }
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validar tamaño (5 MB máximo)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('El logo excede el tamaño máximo de 5 MB');
        input.value = '';
        return;
      }

      // Validar tipo de archivo
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        alert('Tipo de archivo no permitido. Solo se aceptan PNG, JPG');
        input.value = '';
        return;
      }

      // Guardar archivo y crear URL para preview
      this.datosVerificacion.paso2.logo = file;
      this.datosVerificacion.paso2.logoUrl = URL.createObjectURL(file);
      console.log('Logo cargado:', file.name);
    }
  }

  onFaviconSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validar tamaño (1 MB máximo)
      const maxSize = 1 * 1024 * 1024; // 1MB
      if (file.size > maxSize) {
        alert('El favicon excede el tamaño máximo de 1 MB');
        input.value = '';
        return;
      }

      // Validar tipo de archivo
      const allowedTypes = ['image/x-icon', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        alert('Tipo de archivo no permitido. Solo se aceptan ICO, PNG');
        input.value = '';
        return;
      }

      // Guardar archivo y crear URL para preview
      this.datosVerificacion.paso2.favicon = file;
      this.datosVerificacion.paso2.faviconUrl = URL.createObjectURL(file);
      console.log('Favicon cargado:', file.name);
    }
  }

  onBannerSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validar tamaño (10 MB máximo)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        alert('El banner excede el tamaño máximo de 10 MB');
        input.value = '';
        return;
      }

      // Validar tipo de archivo
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        alert('Tipo de archivo no permitido. Solo se aceptan PNG, JPG');
        input.value = '';
        return;
      }

      // Guardar archivo y crear URL para preview
      this.datosVerificacion.paso2.banner = file;
      this.datosVerificacion.paso2.bannerUrl = URL.createObjectURL(file);
      console.log('Banner cargado:', file.name);
    }
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
  // VERIFICACIÓN DE CONTACTO - PASO 3
  // ============================================

  enviandoCodigoEmail: boolean = false;
  enviandoCodigoTelefono: boolean = false;
  mostrarCampoCodigoEmail: boolean = false;
  mostrarCampoCodigoTelefono: boolean = false;
  errorEmail: string = '';
  errorTelefono: string = '';
  errorCodigoEmail: string = '';
  errorCodigoTelefono: string = '';

  async enviarCodigoEmail(): Promise<void> {
    const email = this.datosVerificacion.paso3.email.trim();
    this.errorEmail = '';

    // Validar que no esté vacío
    if (!email) {
      this.errorEmail = 'El correo electrónico es obligatorio';
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.errorEmail = 'Por favor, ingresa un correo electrónico válido';
      return;
    }

    // Mostrar campo de código inmediatamente
    this.mostrarCampoCodigoEmail = true;
    console.log('Código enviado a:', email);

    // Simular envío de código (aquí iría la llamada al backend)
    // await this.verificacionService.enviarCodigoEmail(email);
  }

  verificarCodigoEmail(): void {
    const codigoIngresado = this.datosVerificacion.paso3.codigoEmail?.trim();
    this.errorCodigoEmail = '';

    // Validar que no esté vacío
    if (!codigoIngresado) {
      this.errorCodigoEmail = 'El código es obligatorio';
      return;
    }

    // Validar longitud
    if (codigoIngresado.length !== 6) {
      this.errorCodigoEmail = 'El código debe tener 6 dígitos';
      return;
    }

    // Validar que sean solo números
    if (!/^\d+$/.test(codigoIngresado)) {
      this.errorCodigoEmail = 'El código solo debe contener números';
      return;
    }

    // Simular verificación (aquí iría la llamada al backend)
    // Por ahora, cualquier código de 6 dígitos es válido
    this.datosVerificacion.paso3.emailVerificado = true;
    this.mostrarCampoCodigoEmail = false;
    console.log('¡Correo verificado exitosamente!');
  }

  async enviarCodigoTelefono(): Promise<void> {
    const telefono = this.datosVerificacion.paso3.telefono.trim();
    this.errorTelefono = '';

    // Validar que no esté vacío
    if (!telefono) {
      this.errorTelefono = 'El número de teléfono es obligatorio';
      return;
    }

    // Validar formato de teléfono (solo números, mínimo 10 dígitos)
    const telefonoRegex = /^\d{10,}$/;
    if (!telefonoRegex.test(telefono)) {
      this.errorTelefono = 'Ingresa un número válido (mínimo 10 dígitos, solo números)';
      return;
    }

    // Mostrar campo de código inmediatamente
    this.mostrarCampoCodigoTelefono = true;
    console.log('Código SMS enviado a:', telefono);

    // Simular envío de código SMS (aquí iría la llamada al backend)
    // await this.verificacionService.enviarCodigoTelefono(telefono);
  }

  verificarCodigoTelefono(): void {
    const codigoIngresado = this.datosVerificacion.paso3.codigoTelefono?.trim();
    this.errorCodigoTelefono = '';

    // Validar que no esté vacío
    if (!codigoIngresado) {
      this.errorCodigoTelefono = 'El código es obligatorio';
      return;
    }

    // Validar longitud
    if (codigoIngresado.length !== 6) {
      this.errorCodigoTelefono = 'El código debe tener 6 dígitos';
      return;
    }

    // Validar que sean solo números
    if (!/^\d+$/.test(codigoIngresado)) {
      this.errorCodigoTelefono = 'El código solo debe contener números';
      return;
    }

    // Simular verificación (aquí iría la llamada al backend)
    this.datosVerificacion.paso3.telefonoVerificado = true;
    this.mostrarCampoCodigoTelefono = false;
    console.log('¡Teléfono verificado exitosamente!');
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
