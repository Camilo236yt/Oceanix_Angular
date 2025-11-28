import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DatosVerificacion, Paso1Documentos, Paso2Marca, Paso3EmailVerificacion, TipoDocumento } from './verificar-cuenta.models';
import { VerificacionService, EnterpriseConfigStatus } from '../../services/verificacion.service';
import Swal from 'sweetalert2';

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
  totalPasos: number = 2;

  // Estado de progreso del backend
  documentosYaSubidos: boolean = false;
  cargandoEstadoInicial: boolean = true; // Indica si está cargando el estado inicial

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
    { label: 'Verificación', icon: 'phone' }
  ];

  // Ruta desde donde se ingresó al componente
  private previousRoute: string = '/crm/dashboard';

  constructor(
    private verificacionService: VerificacionService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('🚀 Iniciando componente VerificarCuenta - pasoActual inicial:', this.pasoActual);

    // Guardar la ruta anterior desde localStorage o usar la navegación del router
    const savedRoute = localStorage.getItem('previousRouteBeforeVerification');
    if (savedRoute) {
      this.previousRoute = savedRoute;
    } else {
      // Si no hay ruta guardada, guardar la ruta actual antes de entrar
      const currentUrl = this.router.url;
      if (!currentUrl.includes('verificar-cuenta')) {
        localStorage.setItem('previousRouteBeforeVerification', currentUrl);
        this.previousRoute = currentUrl;
      }
    }

    // Cargar email primero, luego el estado del backend
    this.cargarEmailUsuario();
    this.cargarEstadoBackend();
  }

  // ============================================
  // NAVEGACIÓN
  // ============================================

  cargandoDocumentos: boolean = false;
  finalizandoVerificacion: boolean = false;

  siguientePaso(): void {
    console.log('🔄 siguientePaso() llamado - pasoActual:', this.pasoActual);

    if (this.pasoActual < this.totalPasos - 1) {
      const esValido = this.validarPasoActual();
      console.log('✅ Validación del paso actual:', esValido);

      if (esValido) {
        // Si estamos en el paso 0 (Documentos), enviar documentos al backend
        if (this.pasoActual === 0) {
          console.log('📤 Subiendo documentos al backend...');
          this.subirDocumentos();
        } else {
          this.guardarDatosPaso();
          this.pasoActual++;
        }
      } else {
        console.error('❌ Validación fallida - errores:', this.erroresPaso1);
        // Mostrar mensaje de error si la validación falla
        Swal.fire({
          icon: 'warning',
          title: 'Documentos Faltantes',
          text: 'Por favor, sube todos los documentos obligatorios antes de continuar.',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#9333ea'
        });
      }
    }
  }
 
  /**
   * Sube los documentos al backend
   */
  subirDocumentos(): void {
    const docs = this.datosVerificacion.paso1.documentosObligatorios;

    console.log('📄 Documentos a subir:', {
      doc0: docs[0],
      doc1: docs[1],
      doc2: docs[2]
    });

    // Obtener los archivos (ya validados en validarPaso1)
    const taxId = docs[0].archivo!; // RUT/NIT/CUIT
    const chamberCommerce = docs[1].archivo!; // Cámara de Comercio
    const legalRepId = docs[2].archivo!; // Cédula Representante Legal

    console.log('📦 Archivos preparados para subir:', {
      taxId: taxId.name,
      chamberCommerce: chamberCommerce.name,
      legalRepId: legalRepId.name
    });

    this.cargandoDocumentos = true;

    this.verificacionService.uploadDocuments(taxId, chamberCommerce, legalRepId).subscribe({
      next: (response) => {
        console.log('✅ Documentos subidos exitosamente:', response);
        this.cargandoDocumentos = false;
        this.documentosYaSubidos = true; // Marcar que los documentos ya fueron subidos
        this.guardarDatosPaso();
        this.pasoActual++; // Pasar al paso 2
        console.log('✅ Avanzando al paso:', this.pasoActual);

        // Forzar detección de cambios para actualizar la vista
        this.cdr.detectChanges();
        console.log('✅ detectChanges() ejecutado después de cambiar paso');
      },
      error: (error) => {
        console.error('❌ Error al subir documentos:', error);
        console.error('❌ Detalles del error:', {
          status: error.status,
          statusText: error.statusText,
          message: error.error?.message,
          fullError: error
        });
        this.cargandoDocumentos = false;

        // Mostrar error en SweetAlert
        let errorMessage = 'Ocurrió un error al subir los documentos';

        if (error.status === 0) {
          errorMessage = 'Error de conexión. Por favor verifica tu conexión a internet.';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }

        Swal.fire({
          icon: 'error',
          title: 'Error al subir documentos',
          text: errorMessage,
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#9333ea'
        });
      }
    });
  }

  pasoAnterior(): void {
    // No permitir volver al paso 0 si ya se subieron documentos
    if (this.pasoActual > 0 && !this.documentosYaSubidos) {
      this.pasoActual--;
    }
  }

  omitirPaso(): void {
    // No hay pasos opcionales para omitir
    return;
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
        return this.validarPaso3();
      default:
        return true;
    }
  }

  validarPaso1(): boolean {
    this.erroresPaso1.clear();
    const obligatorios = this.datosVerificacion.paso1.documentosObligatorios;
    let esValido = true;

    console.log('🔍 Validando paso 1 - documentos obligatorios:', obligatorios);

    obligatorios.forEach((doc, index) => {
      console.log(`📋 Documento ${index}:`, {
        tipo: doc.tipo,
        archivo: doc.archivo,
        archivoUrl: doc.archivoUrl,
        nombreArchivo: doc.nombreArchivo
      });

      if (!doc.archivo && !doc.archivoUrl) {
        console.error(`❌ Documento ${index} (${doc.tipo}) faltante`);
        this.erroresPaso1.set(index, 'Este documento es obligatorio');
        esValido = false;
      } else {
        console.log(`✅ Documento ${index} (${doc.tipo}) válido`);
      }
    });

    console.log('🔍 Resultado de validación paso 1:', esValido);
    console.log('🔍 Errores encontrados:', this.erroresPaso1);

    return esValido;
  }

  tieneErrorDocumento(index: number): boolean {
    return this.erroresPaso1.has(index);
  }

  obtenerErrorDocumento(index: number): string {
    return this.erroresPaso1.get(index) || '';
  }

  validarPaso3(): boolean {
    const { email, emailVerificado } = this.datosVerificacion.paso3;
    let esValido = true;

    // Limpiar errores previos
    this.errorEmail = '';

    // Validar email
    if (!email) {
      this.errorEmail = 'El correo electrónico es obligatorio';
      esValido = false;
    } else if (!emailVerificado) {
      this.errorEmail = 'Debes verificar tu correo electrónico antes de continuar';
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
    console.log('📂 onFileSelected() llamado - index:', index);
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      console.log('📄 Archivo seleccionado:', {
        name: file.name,
        size: file.size,
        type: file.type
      });

      // Validar tamaño (10 MB máximo)
      const maxSize = 10 * 1024 * 1024; // 10MB en bytes
      if (file.size > maxSize) {
        console.error('❌ Archivo excede el tamaño máximo');
        Swal.fire({
          icon: 'error',
          title: 'Archivo muy grande',
          text: 'El archivo excede el tamaño máximo de 10 MB',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#9333ea'
        });
        input.value = '';
        return;
      }

      // Validar tipo de archivo
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        console.error('❌ Tipo de archivo no permitido:', file.type);
        Swal.fire({
          icon: 'error',
          title: 'Tipo de archivo no permitido',
          text: 'Solo se aceptan archivos PDF, JPG y PNG',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#9333ea'
        });
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

      console.log('✅ Archivo asignado correctamente al documento', index);
      console.log('📋 Estado del documento:', this.datosVerificacion.paso1.documentosObligatorios[index]);
    } else {
      console.error('❌ No se seleccionó ningún archivo');
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
  errorDominio: string = '';

  agregarDominio(): void {
    const dominio = this.nuevoDominio.trim().toLowerCase();

    // Validar que no esté vacío
    if (!dominio) {
      this.errorDominio = 'El dominio no puede estar vacío';
      return;
    }

    // Validar que no tenga @
    if (dominio.includes('@')) {
      this.errorDominio = 'El dominio no debe contener el símbolo @';
      return;
    }

    // Validar que no tenga espacios
    if (dominio.includes(' ')) {
      this.errorDominio = 'El dominio no debe contener espacios';
      return;
    }

    // Validar formato de dominio
    const dominioRegex = /^[a-z0-9-]+\.[a-z]{2,}$/;
    if (!dominioRegex.test(dominio)) {
      this.errorDominio = 'Formato de dominio inválido. Ejemplo: empresa.com';
      return;
    }

    // Validar que no esté duplicado
    if (this.datosVerificacion.paso3.dominios.includes(dominio)) {
      this.errorDominio = 'Este dominio ya ha sido agregado';
      return;
    }

    // Agregar dominio
    this.datosVerificacion.paso3.dominios.push(dominio);
    this.nuevoDominio = '';
    this.errorDominio = '';
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

  enviarCodigoEmail(): void {
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

    // Activar estado de carga
    this.enviandoCodigoEmail = true;

    // Enviar código al backend
    this.verificacionService.sendEmailVerification().subscribe({
      next: (response: any) => {
        console.log('Código enviado exitosamente:', response);
        this.enviandoCodigoEmail = false;

        // Extraer datos de la respuesta (puede venir envuelto en { success, data, statusCode })
        const data = response.data || response;

        console.log('✅ Código enviado a:', data.emailSentTo);
      },
      error: (error) => {
        console.error('Error al enviar código:', error);
        this.enviandoCodigoEmail = false;

        // Ocultar campo de código si hubo error
        this.mostrarCampoCodigoEmail = false;

        // Mostrar error con SweetAlert
        const errorMessage = error.error?.message || error.message || 'Ocurrió un error al enviar el código de verificación';
        Swal.fire({
          icon: 'error',
          title: 'Error al enviar código',
          text: errorMessage,
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#9333ea'
        });
      }
    });
  }

  verificandoCodigoEmail: boolean = false;

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

    // Activar estado de carga
    this.verificandoCodigoEmail = true;

    // Verificar código en el backend
    this.verificacionService.verifyEmailCode(codigoIngresado).subscribe({
      next: (response: any) => {
        console.log('Código verificado exitosamente:', response);
        this.verificandoCodigoEmail = false;

        // Extraer datos de la respuesta (puede venir envuelto en { success, data, statusCode })
        const data = response.data || response;

        if (data.verified) {
          // Marcar email como verificado
          this.datosVerificacion.paso3.emailVerificado = true;
          this.mostrarCampoCodigoEmail = false;
          console.log('✅ ¡Correo verificado exitosamente!');
        } else {
          // Si el backend dice que no está verificado
          this.errorCodigoEmail = 'El código ingresado no es válido';
        }
      },
      error: (error) => {
        console.error('Error al verificar código:', error);
        this.verificandoCodigoEmail = false;

        // Mostrar error con SweetAlert
        const errorMessage = error.error?.message || error.message || 'El código ingresado no es válido';
        Swal.fire({
          icon: 'error',
          title: 'Código incorrecto',
          text: errorMessage,
          confirmButtonText: 'Aceptar'
        });
      }
    });
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

  /**
   * Carga el estado de verificación desde el backend
   * Esto permite recuperar el progreso del usuario si salió y volvió a entrar
   */
  cargarEstadoBackend(): void {
    this.verificacionService.getEnterpriseConfigStatus().subscribe({
      next: (response: any) => {
        console.log('Estado de configuración empresarial:', response);

        // El backend puede devolver la respuesta en formato { success, data, statusCode }
        // o directamente los campos
        const status: EnterpriseConfigStatus = response.data || response;

        // Guardar el email actual antes de cargar desde localStorage
        const emailDelBackend = this.datosVerificacion.paso3.email;
        console.log('💾 Email antes de cargar localStorage:', emailDelBackend);

        // IMPORTANTE: Primero cargar datos guardados localmente (para tener los archivos seleccionados)
        // DESPUÉS mapear el estado del backend (para determinar el paso correcto)
        this.cargarDatosGuardados();
        this.mapearEstadoAComponente(status);

        // Restaurar el email del backend después de cargar desde localStorage
        if (emailDelBackend) {
          this.datosVerificacion.paso3.email = emailDelBackend;
          console.log('💾 Email restaurado del backend:', this.datosVerificacion.paso3.email);
        }

        // Indicar que ya terminó de cargar el estado inicial
        this.cargandoEstadoInicial = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar estado del backend:', error);
        // Si falla, cargar datos guardados localmente
        this.cargarDatosGuardados();

        // Indicar que ya terminó de cargar (aunque haya fallado)
        this.cargandoEstadoInicial = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Carga el email del usuario registrado
   */
  cargarEmailUsuario(): void {
    this.verificacionService.getCurrentEmail().subscribe({
      next: (response: any) => {
        console.log('📧 Respuesta completa del backend:', response);

        // El backend puede devolver la respuesta en formato { success, data, statusCode }
        // o directamente los campos
        const emailData = response.data || response;
        console.log('📧 Datos extraídos:', emailData);

        if (emailData.hasEmail && emailData.email) {
          // Asignar el email al modelo
          this.datosVerificacion.paso3.email = emailData.email;
          console.log('✅ Email asignado a datosVerificacion.paso3.email:', this.datosVerificacion.paso3.email);
          console.log('✅ Valor actual de datosVerificacion.paso3:', this.datosVerificacion.paso3);

          // Forzar detección de cambios para que se actualice el input
          this.cdr.detectChanges();

          console.log('✅ detectChanges() ejecutado');
        } else {
          // Si no tiene email, mostrar error
          console.error('❌ El usuario no tiene email registrado');
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se encontró un email registrado para este usuario',
            confirmButtonText: 'Aceptar'
          });
        }
      },
      error: (error) => {
        console.error('Error al cargar email del usuario:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error al cargar email',
          text: error.error?.message || 'No se pudo cargar el email del usuario',
          confirmButtonText: 'Aceptar'
        });
      }
    });
  }

  /**
   * Mapea la respuesta del backend al estado del componente
   * Permite determinar en qué paso quedó el usuario
   */
  mapearEstadoAComponente(status: EnterpriseConfigStatus): void {
    console.log('📊 Mapeando estado del backend:', {
      documentsUploaded: status.documentsUploaded,
      brandingConfigured: status.brandingConfigured,
      emailDomainsConfigured: status.emailDomainsConfigured
    });
    console.log('📍 pasoActual ANTES de mapear:', this.pasoActual);

    // Guardar el estado de documentos subidos
    this.documentosYaSubidos = status.documentsUploaded;

    // Determinar el paso actual basado en qué ya completó el usuario

    // Paso 0: Documentos (índice 0)
    // Paso 1: Verificación (índice 1)

    // Si NO ha subido documentos, debe empezar en el Paso 0 (Documentos)
    if (!status.documentsUploaded) {
      this.pasoActual = 0;
      console.log('✅ Paso asignado: 0 - Documentos pendientes');
      console.log('📍 pasoActual DESPUÉS de mapear:', this.pasoActual);
      this.cdr.detectChanges(); // Forzar detección de cambios
      return;
    }

    // Si YA subió documentos, debe continuar con el Paso 1 (Verificación)
    if (status.documentsUploaded && !status.emailDomainsConfigured) {
      this.pasoActual = 1;
      console.log('✅ Paso asignado: 1 - Documentos completados, continuar con verificación');
      console.log('📍 pasoActual DESPUÉS de mapear:', this.pasoActual);
      this.cdr.detectChanges(); // Forzar detección de cambios
      return;
    }

    // Si YA completó todo (documentos Y verificación de email)
    if (status.documentsUploaded && status.emailDomainsConfigured) {
      this.pasoActual = 1; // Mantenerse en el último paso
      console.log('✅ Paso asignado: 1 - Todo completado');
      console.log('📍 pasoActual DESPUÉS de mapear:', this.pasoActual);
      this.cdr.detectChanges(); // Forzar detección de cambios
      return;
    }
  }

  cargarDatosGuardados(): void {
    const datosGuardados = localStorage.getItem('verificacion-cuenta');
    if (datosGuardados) {
      try {
        const datosParseados = JSON.parse(datosGuardados);
        // No sobrescribir el email que viene del backend
        const emailActual = this.datosVerificacion.paso3.email;
        this.datosVerificacion = datosParseados;
        // Restaurar el email del backend si existe
        if (emailActual) {
          this.datosVerificacion.paso3.email = emailActual;
          console.log('🔄 Email restaurado después de cargar localStorage:', emailActual);
        }
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
      // Enviar dominios de email al backend
      this.actualizarDominiosEmail();
    }
  }

  /**
   * Actualiza los dominios de email corporativo en el backend
   */
  actualizarDominiosEmail(): void {
    const dominios = this.datosVerificacion.paso3.dominios || [];
    const requireCorporateEmail = false; // Siempre false según requerimiento

    this.finalizandoVerificacion = true;

    this.verificacionService.updateEmailDomains(dominios, requireCorporateEmail).subscribe({
      next: (response) => {
        console.log('Dominios de email actualizados exitosamente:', response);
        this.finalizandoVerificacion = false;
        this.guardarDatosPaso();

        // Mostrar mensaje de éxito
        Swal.fire({
          icon: 'success',
          title: '¡Verificación Completada!',
          text: 'Tu información ha sido enviada correctamente. Estamos verificando tus datos, pronto recibirás una confirmación.',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#9333ea'
        }).then(() => {
          // Actualizar el mensaje del banner en localStorage
          localStorage.setItem('verificationStatus', 'pending_review');

          // Limpiar la ruta guardada
          localStorage.removeItem('previousRouteBeforeVerification');

          // Redirigir a la ruta anterior
          console.log('✅ Redirigiendo a:', this.previousRoute);
          this.router.navigate([this.previousRoute]);
        });
      },
      error: (error) => {
        console.error('Error al actualizar dominios de email:', error);
        this.finalizandoVerificacion = false;

        // Mostrar error en SweetAlert
        const errorMessage = error.error?.message || error.message || 'Ocurrió un error al actualizar los dominios de email';
        Swal.fire({
          icon: 'error',
          title: 'Error al finalizar verificación',
          text: errorMessage,
          confirmButtonText: 'Aceptar'
        });
      }
    });
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
    return false; // No hay pasos opcionales
  }

  get mostrarBotonAnterior(): boolean {
    // Solo mostrar el botón "Anterior" si estamos en paso > 0 Y no se han subido documentos
    return this.pasoActual > 0 && !this.documentosYaSubidos;
  }

  get textoBotonPrincipal(): string {
    if (this.pasoActual === this.totalPasos - 1) {
      return 'Finalizar';
    }
    return 'Siguiente';
  }
}
