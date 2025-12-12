import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface MenuItem {
  id: string;
  label: string;
  iconPath?: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

@Component({
  selector: 'app-documentation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './documentation.html',
  styleUrl: './documentation.scss',
})
export class Documentation {
  selectedItem: string = 'introduccion';

  menuSections: MenuSection[] = [
    {
      title: 'Comenzando',
      items: [
        { id: 'introduccion', label: 'Introducción', iconPath: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
        { id: 'dominios', label: 'Dominios', iconPath: 'M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418' }
      ]
    },
    {
      title: 'Autenticación',
      items: [
        { id: 'login', label: 'Login', iconPath: 'M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z' },
        { id: 'registro', label: 'Registro', iconPath: 'M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z' }
      ]
    },
    {
      title: 'Módulos CRM',
      items: [
        { id: 'incidencias', label: 'Incidencias', iconPath: 'M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z' },
        { id: 'clientes', label: 'Usuarios', iconPath: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z' },
        { id: 'notificaciones', label: 'Notificaciones', iconPath: 'M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0' },
        { id: 'usuarios', label: 'Clientes', iconPath: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z' },
        { id: 'roles', label: 'Roles y Permisos', iconPath: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z' },
        { id: 'reportes', label: 'Reportes', iconPath: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z' }
      ]
    }
  ];

  selectItem(itemId: string): void {
    this.selectedItem = itemId;
  }

  getContent(): any {
    const content: any = {
      introduccion: {
        title: '¿Qué es Oceanix?',
        sections: [
          {
            heading: 'Sistema de Gestión de Incidencias',
            content: 'Oceanix es una plataforma integral diseñada para gestionar incidencias de envíos de manera eficiente, rápida y transparente. Permite a las empresas automatizar el seguimiento de pérdidas, retrasos o daños en sus envíos, manteniendo a sus clientes informados en todo momento.'
          },
          {
            heading: 'Características Principales',
            content: 'Sistema inteligente de tickets con asignación automática, semáforo de tiempos basado en SLA, notificaciones en tiempo real, portal para clientes, gestión completa de usuarios y roles, y reportes detallados de incidencias.'
          },
          {
            heading: 'Tecnología',
            content: 'Desarrollado con Angular 19, utilizando componentes standalone, TypeScript, y una arquitectura moderna y escalable. Implementa las mejores prácticas de desarrollo frontend con un diseño responsivo y profesional.'
          },
          {
            heading: 'Beneficios',
            content: 'Reduce tiempos de respuesta, mejora la satisfacción del cliente, automatiza procesos repetitivos, proporciona visibilidad completa del estado de las incidencias, y facilita la toma de decisiones basada en datos.'
          }
        ]
      },
      dominios: {
        title: 'Sistema de Dominios',
        description: 'Oceanix utiliza un sistema de acceso personalizado mediante dominios únicos para cada empresa. Esto garantiza que cada organización tenga su propio espacio privado y seguro dentro de la plataforma.',
        sections: [
          {
            heading: '¿Qué es un Dominio en Oceanix?',
            content: 'Un dominio es como la "dirección web exclusiva" de tu empresa dentro de Oceanix. Piensa en ello como tener tu propia puerta de entrada privada a la plataforma, completamente independiente de otras empresas.\n\nCuando tu empresa se registra en Oceanix, se crea automáticamente un dominio único para ti. Por ejemplo, si tu empresa se llama "Acme Logística", tu dominio podría ser:\n\nacme.oceanix.space\n\nEste será el enlace que tú y tu equipo usarán para acceder al sistema.'
          },
          {
            heading: '¿Cómo Funciona?',
            content: 'Cuando creas tu cuenta en Oceanix, el sistema te asigna un "subdominio" único basado en el nombre de tu empresa. Este subdominio es la parte que va antes de ".oceanix.space".\n\nPor ejemplo:\n• Tu empresa: "Transportes Rápidos"\n• Tu subdominio: transportesrapidos\n• Tu dominio completo: transportesrapidos.oceanix.space\n\nCada vez que tú o alguien de tu equipo quiera entrar al sistema, solo necesitan ir a ese enlace personalizado. Es como tener tu propia versión privada de Oceanix.'
          },
          {
            heading: 'Beneficios de este Sistema',
            content: 'Seguridad Total: Tu información está completamente separada de otras empresas. Cada empresa solo puede ver sus propios datos, incidencias y clientes.\n\nAcceso Directo: No necesitas buscar tu empresa en una lista ni recordar códigos. Simplemente entras a tu dominio personalizado y listo.\n\nOrganización Clara: Cada empleado de tu empresa accede desde el mismo dominio, lo que facilita la gestión y evita confusiones.\n\nPrivacidad Garantizada: Otras empresas que usan Oceanix no pueden ver ni acceder a tu información, ya que cada una tiene su propio dominio separado.\n\nProfesionalismo: Tu equipo y clientes verán un enlace personalizado con el nombre de tu empresa, lo que proyecta una imagen más profesional.'
          },
          {
            heading: 'Ejemplo Práctico',
            content: 'Imagina que tienes una empresa de logística llamada "EnvíosExpress":\n\n1. Al registrarte en Oceanix, el sistema crea el dominio: enviosexpress.oceanix.space\n\n2. Tú y tu equipo pueden guardar este enlace en favoritos o como acceso directo\n\n3. Cuando tus empleados quieran revisar incidencias, solo ingresan a enviosexpress.oceanix.space\n\n4. Tus clientes también tendrán acceso al mismo dominio para ver el estado de sus reportes\n\n5. Aunque otras empresas de logística también usen Oceanix (como "LogísticaPro" con logisticapro.oceanix.space), nunca verán tu información ni tú la de ellos. Cada empresa trabaja en su propio espacio privado.'
          },
          {
            heading: 'Resumen',
            content: 'El sistema de dominios de Oceanix es como tener tu propia oficina virtual privada. Cada empresa tiene su propia "puerta de entrada" (dominio) que lleva a su espacio exclusivo y seguro, donde solo tú y tu equipo pueden acceder a sus datos e incidencias.\n\nNo necesitas preocuparte por la configuración técnica, Oceanix se encarga de todo automáticamente cuando creas tu cuenta.'
          }
        ]
      },
      login: {
        title: 'Inicio de Sesión',
        description: 'Aprende cómo acceder a tu cuenta de Oceanix de forma segura para comenzar a gestionar tus incidencias.',
        sections: [
          {
            heading: 'Pantalla de Inicio de Sesión',
            content: 'Esta es la pantalla principal donde podrás ingresar a tu cuenta de Oceanix. El sistema te solicitará tu correo electrónico y contraseña para validar tu identidad y darte acceso a la plataforma.',
            image: 'assets/documentacion-imagenes/1. Login.png'
          },
          {
            heading: 'Pasos para Iniciar Sesión',
            content: '1. Accede a la página de inicio de sesión desde la URL que te proporcionó tu empresa.\n2. Ingresa tu correo electrónico que registraste en el sistema.\n3. Escribe tu contraseña (asegúrate de escribirla correctamente, respetando mayúsculas y minúsculas).\n4. Haz clic en el botón "Iniciar Sesión".\n5. Una vez validadas tus credenciales, serás redirigido automáticamente a tu panel de control según tu tipo de usuario.'
          },
          {
            heading: '¿Olvidaste tu Contraseña?',
            content: 'Si no recuerdas tu contraseña, no te preocupes. En la pantalla de login encontrarás un enlace que dice "¿Olvidaste tu contraseña?". Haz clic ahí, ingresa tu correo electrónico y recibirás instrucciones para crear una nueva contraseña de forma segura.'
          },
          {
            heading: 'Seguridad de tu Cuenta',
            content: 'Oceanix protege tu información personal y empresarial. Tu contraseña está encriptada y nadie más puede verla. Te recomendamos usar una contraseña segura que combine letras, números y símbolos, y no compartirla con otras personas.'
          }
        ]
      },
      registro: {
        title: 'Registro de Nuevo Usuario',
        description: 'El proceso de registro permite a las empresas crear cuentas en Oceanix para gestionar sus incidencias de envío de manera profesional.',
        sections: [
          {
            heading: 'Proceso de Registro - Paso 1',
            content: 'El registro en Oceanix es un proceso de dos pasos diseñado para recopilar la información necesaria de forma organizada y segura.',
            image: 'assets/documentacion-imagenes/2. Registro.png'
          },
          {
            heading: 'Datos Básicos (Paso 1)',
            content: '1. Accede a la página de registro desde el botón "Registrarse" en la página principal.\n2. Completa los datos básicos:\n   • Nombre completo de la empresa o usuario\n   • Correo electrónico corporativo (será tu usuario de acceso)\n   • Número de teléfono de contacto\n   • Contraseña segura (mínimo 8 caracteres, con mayúsculas, minúsculas y números)\n   • Confirmación de contraseña\n3. Haz clic en "Siguiente" para continuar al paso 2.'
          },
          {
            heading: 'Proceso de Registro - Paso 2',
            content: 'En el segundo paso, se completa la información adicional necesaria para personalizar tu cuenta.',
            image: 'assets/documentacion-imagenes/3. Registro.png'
          },
          {
            heading: 'Información Complementaria (Paso 2)',
            content: '1. Selecciona el tipo de empresa (Logística, E-commerce, Retail, etc.)\n2. Indica el tamaño aproximado de tu operación (número de envíos mensuales)\n3. Especifica tu ubicación geográfica principal\n4. Acepta los términos y condiciones del servicio\n5. Haz clic en "Registrarse" para crear tu cuenta.\n6. Recibirás un correo de confirmación para activar tu cuenta.'
          },
          {
            heading: 'Acceso Inmediato al CRM',
            content: 'Una vez que completes el registro y hagas clic en "Registrarse", serás redirigido automáticamente al sistema CRM de Oceanix. ¡Puedes empezar a usar la plataforma de inmediato!'
          }
        ]
      },
      incidencias: {
        title: 'Módulo de Incidencias',
        description: 'El Módulo de Incidencias es el corazón del sistema Oceanix. Aquí podrás visualizar, gestionar y dar seguimiento a todas las incidencias reportadas por tus clientes de manera organizada y eficiente.',
        sections: [
          {
            heading: 'Pantalla Principal del Módulo',
            content: 'Cuando ingreses al módulo de Incidencias, verás una tabla completa con todas las incidencias registradas en el sistema. Esta pantalla principal te permite tener control total sobre cada caso reportado por tus clientes.',
            image: 'assets/documentacion-imagenes/4. incidencias.png'
          },
          {
            heading: 'Tabla de Incidencias',
            content: 'La tabla muestra un listado completo con toda la información importante de cada incidencia:\n\n• Nombre de la incidencia\n• Descripción breve del problema\n• Tipo de incidencia (Pérdida, Daño, Error Humano, Mantenimiento, Falla Técnica, Otro)\n• Estado actual (Pendiente, En Progreso, Resuelta)\n• Empleado asignado para resolver el caso\n• Fecha de creación\n• Botones de acción disponibles (Ver, Editar, Eliminar)\n\nEsta información te ayuda a tener una visión completa de todas las incidencias de un solo vistazo.'
          },
          {
            heading: 'Buscador General',
            content: 'En la parte superior de la tabla encontrarás un campo de búsqueda que filtra en tiempo real. Simplemente escribe cualquier término (nombre, descripción, empleado, etc.) y la tabla mostrará únicamente las incidencias que coincidan con tu búsqueda. Es una forma rápida y eficiente de encontrar casos específicos.'
          },
          {
            heading: 'Filtros Avanzados',
            content: 'El sistema ofrece filtros específicos que te permiten refinar tu búsqueda de manera más precisa:\n\n• Filtro por Estado: Ver solo incidencias "Pendientes", "En Progreso" o "Resueltas"\n• Filtro por Tipo: Mostrar solo tipos específicos (Pérdida, Daño, Error Humano, etc.)\n\nPara aplicar los filtros:\n1. Haz clic en el botón "Filtros" o en el ícono de filtro en la parte superior\n2. Selecciona los criterios que necesites\n3. La tabla se actualizará automáticamente mostrando solo las incidencias que cumplan los criterios seleccionados'
          },
          {
            heading: 'Ver Detalles de una Incidencia',
            content: 'Cuando necesites consultar toda la información de una incidencia específica:\n\n1. Localiza la incidencia en la tabla\n2. Haz clic en el botón "Ver" (ícono de ojo) en la columna de acciones\n3. Se abrirá una ventana modal con la vista detallada',
            image: 'assets/documentacion-imagenes/5. incidencias 2.png'
          },
          {
            heading: 'Información Detallada del Ticket',
            content: 'La vista detallada te muestra información completa del ticket:\n\n• Información completa del ticket y su referencia\n• Descripción detallada del problema reportado\n• Datos del cliente que reportó la incidencia\n• Historial completo de cambios de estado\n• Comentarios y notas internas del equipo\n• Archivos o imágenes adjuntas como evidencia\n• Fechas de creación y resolución (si aplica)\n\nEsta vista te da todo el contexto necesario para entender el caso completo.',
            image: 'assets/documentacion-imagenes/6. incidencias 3.png'
          },
          {
            heading: 'Resolver una Incidencia',
            content: 'Para trabajar activamente en resolver una incidencia y comunicarte con el cliente:\n\n1. En la fila de la incidencia en la tabla, haz clic en el ícono del lápiz (Editar)\n2. Se abrirá la pantalla de gestión dividida en dos secciones principales\n\nEsta es la herramienta principal para dar seguimiento y resolver los casos reportados.',
            image: 'assets/documentacion-imagenes/7. incidencias 4.png'
          },
          {
            heading: 'Gestionar la Información del Ticket',
            content: 'En el lado izquierdo de la pantalla de resolución podrás visualizar y actualizar los datos esenciales del caso:\n\n• Ver y cambiar el tipo de incidencia\n• Actualizar el nivel de alerta (Bajo, Medio, Alto, Crítico)\n• Cambiar el estado del ticket (Pendiente → En Progreso → Resuelta)\n• Ver la descripción completa proporcionada por el cliente\n• Consultar la referencia única y fecha de creación\n\nEl cambio de estado es la acción principal para avanzar en la gestión e indicar el progreso de la resolución.',
            image: 'assets/documentacion-imagenes/8. incidencias 5.bmp'
          },
          {
            heading: 'Conversación con el Cliente',
            content: 'En el lado derecho encontrarás una sección de chat en tiempo real donde puedes:\n\n• Enviar mensajes al cliente para informarle del progreso\n• Solicitar información o evidencia adicional mediante texto\n• Adjuntar archivos si es necesario\n• Ver todo el historial de mensajes intercambiados\n\nToda la comunicación queda registrada y asociada al ticket como parte del historial.\n\nCuando termines de trabajar en la incidencia, haz clic en el botón "Cerrar" para salir de la vista y volver a la lista principal.'
          },
          {
            heading: 'Eliminar una Incidencia',
            content: 'Esta acción es permanente y generalmente requiere permisos especiales. Úsala con precaución:\n\n1. Localiza la incidencia que deseas eliminar en la tabla\n2. Haz clic en el botón "Eliminar" (ícono de papelera o cruz)\n3. El sistema mostrará un mensaje de confirmación\n4. Lee cuidadosamente la advertencia\n5. Si estás seguro, confirma la eliminación\n\nImportante: Una vez eliminada, la incidencia será removida permanentemente del sistema y no se puede recuperar. Esta acción queda registrada en el log de auditoría.',
            images: ['assets/documentacion-imagenes/9. incidencias 6.png', 'assets/documentacion-imagenes/10. incidencias 7.png']
          }
        ]
      },
      clientes: {
        title: 'Módulo de Usuarios',
        description: 'El Módulo de Usuarios te permite gestionar todas las cuentas del sistema Oceanix, incluyendo administradores, personal de soporte y clientes. Aquí puedes crear nuevos usuarios, asignarles roles y controlar sus accesos.',
        sections: [
          {
            heading: 'Pantalla Principal del Módulo',
            content: 'Cuando ingreses al módulo de Usuarios, verás una tabla con todos los usuarios registrados en el sistema. Esta vista te permite administrar quién tiene acceso a la plataforma y qué nivel de permisos tiene cada persona.',
            image: 'assets/documentacion-imagenes/11. usuarios.png'
          },
          {
            heading: 'Buscador y Filtros',
            content: 'En la parte superior de la tabla encontrarás herramientas para buscar y filtrar usuarios:\n\n• Campo de búsqueda: Escribe cualquier término (nombre, correo, rol) para filtrar en tiempo real\n• Filtros avanzados: Permite filtrar por rol específico o estado de cuenta (Activo/Inactivo)\n\nEstas herramientas te ayudan a encontrar rápidamente usuarios específicos cuando manejas una lista grande.',
            image: 'assets/documentacion-imagenes/20. usuarios 10.png'
          },
          {
            heading: 'Tabla de Usuarios',
            content: 'La tabla muestra información importante de cada usuario registrado:\n\n• Nombre completo del usuario\n• Correo electrónico de acceso\n• Rol asignado (Administrador, Operador, Cliente, etc.)\n• Estado de la cuenta (Activo/Inactivo)\n• Fecha de registro en el sistema\n• Botones de acción disponibles (Ver, Editar, Eliminar)\n\nEsta información te ayuda a tener control completo sobre quién puede acceder al sistema y con qué permisos.'
          },
          {
            heading: 'Añadir Nuevo Usuario',
            content: 'Para crear un nuevo usuario en el sistema:\n\n1. Haz clic en el botón "Añadir Usuario" ubicado en la parte superior derecha de la pantalla\n2. Se abrirá un formulario para registrar la nueva cuenta',
            image: 'assets/documentacion-imagenes/12. usuarios 2 .png'
          },
          {
            heading: 'Completar Datos del Nuevo Usuario',
            content: 'En el formulario de creación deberás completar:\n\nDatos Personales:\n• Nombre completo del usuario\n• Correo electrónico (será su usuario de acceso)\n• Teléfono de contacto\n• Documento de identidad (opcional)\n\nCredenciales de Acceso:\n• Contraseña inicial\n• Confirmación de contraseña\n• Opción para forzar cambio de contraseña en el primer inicio de sesión\n\nAsignación de Rol:\n• Selecciona el rol apropiado del menú desplegable\n• Roles disponibles: Administrador, Supervisor, Operador, Cliente, etc.\n• Los permisos se asignan automáticamente según el rol seleccionado\n\nUna vez completado todo, haz clic en "Crear Usuario" o "Guardar".',
            image: 'assets/documentacion-imagenes/13. usuarios 3.png'
          },
          {
            heading: 'Ver Detalles de un Usuario',
            content: 'Para consultar toda la información de un usuario específico:\n\n1. Localiza el usuario en la tabla\n2. Haz clic en el botón "Ver" (ícono de ojo) en la columna de acciones\n3. Se abrirá una vista detallada con toda la información',
            image: 'assets/documentacion-imagenes/14. usuarios 4 .png'
          },
          {
            heading: 'Información Detallada del Usuario',
            content: 'La vista detallada te muestra:\n\n• Información personal completa del usuario\n• Datos de contacto actualizados\n• Rol y permisos asignados actualmente\n• Estado de verificación del correo electrónico\n• Fecha y hora de registro en el sistema\n• Historial de actividad (si está disponible)\n\nEsta vista te da una visión completa del perfil del usuario sin necesidad de editar nada.',
            image: 'assets/documentacion-imagenes/15. usuarios 5.png'
          },
          {
            heading: 'Editar un Usuario',
            content: 'Para modificar la información de un usuario existente:\n\n1. Localiza el usuario en la tabla\n2. Haz clic en el botón "Editar" (ícono de lápiz)\n3. Se abrirá el formulario de edición con los datos actuales del usuario',
            image: 'assets/documentacion-imagenes/16. usuarios 6 .png'
          },
          {
            heading: 'Modificar Información del Usuario',
            content: 'En el formulario de edición puedes modificar:\n\n• Información personal (nombre, teléfono, etc.)\n• Correo electrónico (ten cuidado al cambiarlo)\n• Rol asignado (esto cambiará automáticamente los permisos del usuario)\n• Restablecer contraseña si el usuario la olvidó\n• Estado de la cuenta (Activo/Inactivo)\n\nUna vez realizados los cambios, haz clic en "Guardar Cambios". Si modificaste el rol, los permisos se actualizarán inmediatamente y el usuario tendrá acceso a las nuevas funcionalidades según su nuevo rol.',
            image: 'assets/documentacion-imagenes/17. usuarios 7.png'
          },
          {
            heading: 'Eliminar un Usuario',
            content: 'Importante: Eliminar un usuario es una acción permanente. Si solo necesitas que el usuario no acceda temporalmente, es mejor desactivar su cuenta en lugar de eliminarla, para preservar el historial.\n\nPara eliminar un usuario:\n\n1. Localiza el usuario que deseas eliminar en la tabla\n2. Haz clic en el botón "Eliminar" (ícono de papelera)\n3. El sistema mostrará una advertencia confirmando si realmente deseas eliminar al usuario\n4. Lee cuidadosamente la advertencia\n5. Si estás seguro, confirma la eliminación\n\nEl usuario será removido permanentemente del sistema. Ten en cuenta que algunos registros asociados al usuario pueden quedar sin asignar o reasignarse según la configuración del sistema.',
            images: ['assets/documentacion-imagenes/18. usuarios 8.png', 'assets/documentacion-imagenes/19. usuarios 9.png']
          }
        ]
      },
      notificaciones: {
        title: 'Módulo de Notificaciones',
        description: 'El Módulo de Notificaciones te permite mantenerte informado sobre todos los eventos importantes del sistema Oceanix. Aquí puedes ver actualizaciones de incidencias, cambios de estado, mensajes de clientes y cualquier actividad relevante que requiera tu atención.',
        sections: [
          {
            heading: 'Pantalla de Notificaciones',
            content: 'Cuando accedas al módulo de Notificaciones, verás una lista completa de todas las notificaciones del sistema. Esta vista te mantiene al tanto de todo lo que está sucediendo en tiempo real, desde nuevas incidencias hasta mensajes de clientes y actualizaciones de estado.\n\nLas notificaciones se organizan cronológicamente, mostrando las más recientes en la parte superior. Cada notificación incluye:\n\n• Icono que identifica el tipo de evento\n• Mensaje descriptivo de lo que sucedió\n• Fecha y hora exacta del evento\n• Estado de lectura (leída o no leída)\n\nLas notificaciones no leídas se destacan visualmente para que puedas identificar rápidamente lo que aún no has revisado.\n\nEn la parte superior de la pantalla encontrarás el botón "Marcar todas como leídas" que te permite limpiar todas las notificaciones de una sola vez.',
            image: 'assets/documentacion-imagenes/21. notificaciones.png',
            imageSmall: true
          },
          {
            heading: 'Tipos de Notificaciones',
            content: 'El sistema genera diferentes tipos de notificaciones según la actividad:\n\n• Nueva Incidencia: Cuando un cliente reporta un nuevo caso\n• Cambio de Estado: Cuando una incidencia cambia de Pendiente a En Progreso o a Resuelta\n• Mensaje Nuevo: Cuando un cliente envía un mensaje en el chat de una incidencia\n• Asignación de Ticket: Cuando se te asigna una incidencia para resolver\n• Usuario Nuevo: Cuando se registra un nuevo usuario en el sistema\n• Actualización de Perfil: Cuando se modifica información importante de un usuario\n\nCada tipo de notificación tiene su propio ícono para que puedas identificar rápidamente de qué se trata sin necesidad de leer todo el mensaje.'
          },
          {
            heading: 'Ver Detalles de una Notificación',
            content: 'Para ver la información completa de una notificación:\n\n1. Haz clic sobre cualquier notificación de la lista\n2. Se abrirá un modal (ventana emergente) mostrando todos los detalles\n3. En esta vista podrás ver la información completa del evento\n\nEsta vista detallada te permite consultar toda la información relacionada con la notificación sin salir del módulo.',
            image: 'assets/documentacion-imagenes/22. notificaciones 2.png'
          },
          {
            heading: 'Notificaciones en Tiempo Real',
            content: 'El sistema de notificaciones funciona en tiempo real, lo que significa que:\n\n• Recibirás notificaciones al instante cuando ocurra un evento importante\n• No necesitas refrescar la página para ver nuevas notificaciones\n• Verás un indicador visual (generalmente un número) en el ícono de notificaciones del menú principal indicando cuántas notificaciones no leídas tienes\n• Las notificaciones se actualizan automáticamente sin interrumpir tu trabajo\n\nEsto te permite estar siempre al tanto de lo que sucede en el sistema sin tener que revisar constantemente cada módulo.'
          },
          {
            heading: 'Importancia de las Notificaciones',
            content: 'Las notificaciones son una herramienta clave para:\n\n• Mantenerte informado: Conocer al instante cualquier cambio o evento importante\n• Responder rápidamente: Actuar de inmediato cuando un cliente necesita atención\n• No perder información: Asegurarte de que no se te escape ningún mensaje o actualización importante\n• Mejorar el tiempo de respuesta: Atender las incidencias más rápido al recibir alertas inmediatas\n• Coordinación del equipo: Saber cuando otros miembros del equipo realizan cambios o asignaciones\n\nRevisa tus notificaciones regularmente para asegurarte de estar al día con todas las actividades del sistema y brindar el mejor servicio a tus clientes.'
          }
        ]
      },
      usuarios: {
        title: 'Portal del Cliente',
        description: 'El Portal del Cliente es la vista que utilizan las empresas y organizaciones para reportar y dar seguimiento a sus incidencias de envío. Aquí los clientes pueden crear nuevas incidencias, consultar el estado de sus casos y comunicarse directamente con tu equipo de soporte.',
        sections: [
          {
            heading: 'Pantalla Principal del Portal',
            content: 'Cuando un cliente ingresa a su portal, verá una interfaz simplificada y fácil de usar diseñada específicamente para reportar y consultar sus incidencias de envío.\n\nEl portal muestra:\n\n• Listado de todas las incidencias reportadas por el cliente\n• Estado actual de cada incidencia (Pendiente, En Progreso, Resuelta)\n• Fecha de reporte y última actualización\n• Botón destacado para crear nuevas incidencias\n• Acceso rápido a los detalles de cada caso\n\nEsta vista está optimizada para que los clientes puedan gestionar sus reportes de manera autónoma y mantenerse informados sobre el progreso de cada caso.',
            image: 'assets/documentacion-imagenes/23. cliente .png'
          },
          {
            heading: 'Crear Nueva Incidencia',
            content: 'Los clientes pueden reportar nuevas incidencias de manera sencilla:\n\n• Hacer clic en el botón "Crear Incidencia" o "Reportar Problema"\n• Completar un formulario con la información del problema\n• Adjuntar evidencia fotográfica o documentos si es necesario\n• Enviar el reporte para que sea atendido por tu equipo\n\nEl proceso está diseñado para ser rápido e intuitivo, permitiendo a los clientes reportar problemas sin complicaciones.'
          },
          {
            heading: 'Ver Detalles de una Incidencia',
            content: 'Para consultar el estado y detalles de una incidencia reportada:\n\n1. El cliente localiza la incidencia en su lista\n2. Hace clic en el botón "Ver" o directamente sobre la incidencia\n3. Se abre una vista detallada con toda la información del caso',
            image: 'assets/documentacion-imagenes/24. cliente 2 .png'
          },
          {
            heading: 'Información y Seguimiento del Caso',
            content: 'En la vista detallada, el cliente puede ver:\n\n• Información completa de la incidencia reportada\n• Estado actual del caso y quién está trabajando en él\n• Historial de actualizaciones y cambios de estado\n• Chat en tiempo real para comunicarse con el equipo de soporte\n• Archivos y evidencia adjuntada\n• Fecha de reporte y última actualización\n\nEsta transparencia permite a los clientes estar siempre informados sobre el progreso de sus casos y mantener comunicación directa con tu equipo.'
          },
          {
            heading: 'Comunicación con el Equipo de Soporte',
            content: 'El portal incluye un sistema de chat integrado que permite:\n\n• Enviar mensajes directamente al equipo que atiende la incidencia\n• Recibir actualizaciones en tiempo real sobre el progreso del caso\n• Adjuntar información adicional o evidencia según sea solicitado\n• Ver todo el historial de comunicación relacionado con la incidencia\n\nEsta funcionalidad elimina la necesidad de correos electrónicos o llamadas, centralizando toda la comunicación en un solo lugar.'
          },
          {
            heading: 'Notificaciones para el Cliente',
            content: 'Los clientes reciben notificaciones automáticas cuando:\n\n• Su incidencia cambia de estado (de Pendiente a En Progreso, o a Resuelta)\n• El equipo de soporte envía un nuevo mensaje\n• Se requiere información adicional para resolver el caso\n• La incidencia ha sido resuelta exitosamente\n\nEstas notificaciones mantienen al cliente informado sin necesidad de ingresar constantemente al portal.',
            image: 'assets/documentacion-imagenes/25. cliente 3.png'
          },
          {
            heading: 'Beneficios del Portal del Cliente',
            content: 'El Portal del Cliente ofrece ventajas tanto para los clientes como para tu equipo:\n\nPara los clientes:\n• Autonomía para reportar incidencias 24/7\n• Transparencia total sobre el estado de sus casos\n• Comunicación directa y rápida con soporte\n• Acceso a todo el historial de sus incidencias\n\nPara tu equipo:\n• Reducción de llamadas y correos electrónicos\n• Información estructurada y completa desde el inicio\n• Evidencia y documentación centralizada\n• Mejor eficiencia en la gestión de casos\n\nEste portal mejora significativamente la experiencia del cliente y la eficiencia operativa de tu equipo.'
          }
        ]
      },
      roles: {
        title: 'Módulo de Roles y Permisos',
        description: 'El Módulo de Roles y Permisos te permite gestionar y controlar los niveles de acceso dentro del sistema Oceanix. Aquí puedes crear roles personalizados, asignar permisos específicos y definir qué acciones puede realizar cada tipo de usuario en la plataforma.',
        sections: [
          {
            heading: 'Pantalla Principal del Módulo',
            content: 'Cuando ingreses al módulo de Roles y Permisos, verás una tabla con todos los roles configurados en el sistema. Esta vista te permite administrar los diferentes niveles de acceso y controlar qué funcionalidades están disponibles para cada tipo de usuario.',
            image: 'assets/documentacion-imagenes/26. roles y permisos.png'
          },
          {
            heading: 'Tabla de Roles',
            content: 'La tabla muestra información importante de cada rol registrado:\n\n• Nombre del rol\n• Descripción del rol y su propósito\n• Número de usuarios asignados a ese rol\n• Fecha de creación del rol\n• Botones de acción disponibles (Ver, Editar, Eliminar)\n\nEsta información te ayuda a tener una visión clara de cómo está estructurado el control de acceso en tu sistema.'
          },
          {
            heading: 'Buscador y Filtros',
            content: 'En la parte superior de la tabla encontrarás herramientas para buscar y filtrar roles:\n\n• Campo de búsqueda: Escribe cualquier término (nombre del rol, descripción) para filtrar en tiempo real\n• Filtros avanzados: Permite filtrar roles según criterios específicos\n\nEstas herramientas te ayudan a encontrar rápidamente roles específicos cuando manejas múltiples configuraciones de acceso.',
            image: 'assets/documentacion-imagenes/36. roles y permisos 11.png'
          },
          {
            heading: 'Añadir Nuevo Rol',
            content: 'Para crear un nuevo rol en el sistema:\n\n1. Haz clic en el botón "Añadir Rol" o "Crear Rol" ubicado en la parte superior derecha de la pantalla\n2. Se abrirá un formulario para configurar el nuevo rol',
            images: ['assets/documentacion-imagenes/29. roles y permisos 4 .png', 'assets/documentacion-imagenes/30. roles y permisos 5.png']
          },
          {
            heading: 'Configurar Permisos del Rol',
            content: 'En el formulario de creación del rol, verás una sección de permisos donde podrás configurar el acceso del rol:\n\n• Lista completa de permisos organizados por categorías y módulos\n• Cada permiso tiene un interruptor (switch) para activarlo o desactivarlo\n• Los permisos incluyen: Gestionar Notificaciones, Gestionar Configuración de Empresa, Ver Dashboard, Ver Incidencias Propias, Cerrar Incidencias, Reabrir Incidencias, Eliminar Usuarios, Gestionar Usuarios, y más\n• Puedes hacer clic en "Ver más" para expandir y ver todos los permisos disponibles del sistema\n\nEsta configuración te permite definir exactamente qué acciones puede realizar cada rol.',
            image: 'assets/documentacion-imagenes/27. roles y permisos 2 .png'
          },
          {
            heading: 'Permisos por Módulo',
            content: 'El sistema te permite configurar permisos granulares para cada módulo:\n\n• Incidencias: Ver, crear, editar, eliminar, asignar tickets\n• Usuarios: Ver, crear, editar, eliminar, cambiar roles\n• Notificaciones: Ver, gestionar\n• Portal del Cliente: Acceso completo o restringido\n• Reportes: Ver, exportar, crear reportes personalizados\n• Roles y Permisos: Ver, crear, editar (permisos administrativos)\n\nCada permiso se puede activar o desactivar individualmente según las necesidades del rol.',
            image: 'assets/documentacion-imagenes/28. roles y permisos 3.png'
          },
          {
            heading: 'Ver Detalles de un Rol',
            content: 'Para consultar toda la información de un rol específico:\n\n1. Localiza el rol en la tabla\n2. Haz clic en el botón "Ver" (ícono de ojo) en la columna de acciones\n3. Se abrirá una vista detallada con toda la configuración',
            image: 'assets/documentacion-imagenes/31. roles y permisos 6 .png'
          },
          {
            heading: 'Información Detallada del Rol',
            content: 'La vista detallada te muestra:\n\n• Nombre y descripción completa del rol\n• Lista completa de todos los permisos asignados\n• Permisos organizados por módulo\n• Acciones permitidas para cada módulo\n• Número de usuarios que actualmente tienen este rol\n• Fecha de creación y última modificación\n\nEsta vista te permite revisar toda la configuración del rol sin necesidad de editarlo.',
            image: 'assets/documentacion-imagenes/32. roles y permisos 7.png'
          },
          {
            heading: 'Editar un Rol',
            content: 'Para modificar la configuración de un rol existente:\n\n1. Localiza el rol en la tabla\n2. Haz clic en el botón "Editar" (ícono de lápiz)\n3. Se abrirá el formulario de edición con la configuración actual del rol',
            image: 'assets/documentacion-imagenes/33. roles y permisos 8.png'
          },
          {
            heading: 'Eliminar un Rol',
            content: 'Importante: Eliminar un rol es una acción que requiere precaución. Si hay usuarios asignados a este rol, deberás reasignarlos a otro rol antes de eliminarlo.\n\nPara eliminar un rol:\n\n1. Localiza el rol que deseas eliminar en la tabla\n2. Haz clic en el botón "Eliminar" (ícono de papelera)\n3. El sistema mostrará una advertencia confirmando si realmente deseas eliminar el rol\n4. Lee cuidadosamente la advertencia y las implicaciones\n5. Si estás seguro, confirma la eliminación\n\nEl rol será removido del sistema. Los usuarios que tenían este rol quedarán sin rol asignado y necesitarán ser reasignados manualmente.',
            images: ['assets/documentacion-imagenes/34. roles y permisos 9 .png', 'assets/documentacion-imagenes/35. roles y permisos 10.png']
          },
          {
            heading: 'Importancia de los Roles y Permisos',
            content: 'La gestión adecuada de roles y permisos es fundamental para:\n\n• Seguridad: Controlar quién puede acceder a información sensible\n• Organización: Definir claramente las responsabilidades de cada usuario\n• Eficiencia: Mostrar solo las funcionalidades relevantes para cada tipo de usuario\n• Cumplimiento: Asegurar que solo personal autorizado realice acciones críticas\n• Escalabilidad: Facilitar la incorporación de nuevos usuarios con permisos predefinidos\n\nMantén tus roles actualizados y revisa periódicamente los permisos asignados para garantizar que se ajusten a las necesidades de tu equipo.'
          }
        ]
      },
      reportes: {
        title: 'Módulo de Reportes',
        description: 'El Módulo de Reportes proporciona herramientas avanzadas de análisis y visualización de datos del sistema Oceanix. Permite generar reportes estadísticos, gráficas interactivas y exportar información en formato PDF para análisis y presentación.',
        sections: [
          {
            heading: 'Pantalla Principal del Módulo',
            content: 'El Módulo de Reportes te permite analizar y visualizar datos del sistema mediante gráficas interactivas y reportes exportables.\n\nLa pantalla principal incluye:\n\n• Panel de filtros con selector de rango de fechas\n• Área de visualización de gráficas estadísticas\n• Botones de exportación a PDF y otros formatos\n• Panel de resumen con totales y métricas clave\n• Opciones de configuración de reportes\n\nTodas las gráficas y estadísticas se actualizan dinámicamente según los filtros aplicados, permitiéndote analizar períodos específicos y tendencias del sistema.',
            image: 'assets/documentacion-imagenes/37. reportes.png'
          },
          {
            heading: 'Filtro por Rango de Fechas',
            content: 'El filtro por rango de fechas es la herramienta principal para acotar el período de análisis. Todas las gráficas y estadísticas se recalculan automáticamente según el rango seleccionado.\n\nPara aplicar el filtro:\n\n1. Localiza el selector de rango de fechas en la parte superior del módulo\n2. Haz clic en el campo "Fecha Inicio"\n3. Selecciona la fecha inicial del período que deseas analizar\n4. Haz clic en el campo "Fecha Fin"\n5. Selecciona la fecha final del período\n6. Haz clic en "Aplicar" o "Filtrar"\n7. El sistema recalculará las estadísticas para el período seleccionado\n8. Todas las gráficas se actualizarán automáticamente\n\nEsta funcionalidad te permite generar reportes mensuales, trimestrales, anuales o para cualquier período personalizado que necesites analizar.',
            image: 'assets/documentacion-imagenes/38. reportes 2.png'
          },
          {
            heading: 'Gráficas Estadísticas',
            content: 'El módulo presenta múltiples visualizaciones gráficas que ayudan a comprender el comportamiento y tendencias del sistema:\n\n• Incidencias por Estado: Distribución de incidencias según su estado (Abierta, En Proceso, Resuelta, Cerrada)\n• Tendencia Temporal: Evolución de incidencias creadas a lo largo del tiempo\n• Incidencias por Prioridad: Distribución según nivel de prioridad (Alta, Media, Baja)\n• Top Empresas: Ranking de empresas con mayor volumen de incidencias\n• Tiempo Promedio de Resolución: Indicador del tiempo que toma resolver una incidencia\n• Distribución por Categoría: Categorías de incidencias más frecuentes\n• Rendimiento del Equipo: Estadísticas sobre incidencias resueltas por usuario\n\nLas gráficas son interactivas: puedes hacer clic en elementos para ver detalles, pasar el cursor sobre puntos de datos para valores exactos, ampliar secciones (zoom), activar/desactivar series de datos, y descargar gráficas individuales como imagen.'
          },
          {
            heading: 'Exportación de Reportes a PDF',
            content: 'El botón "Exportar PDF" genera un documento completo con todas las gráficas y un listado detallado de incidencias del período seleccionado.\n\nPara exportar:\n\n1. Configura el rango de fechas deseado (si no lo has hecho)\n2. Espera a que todas las gráficas se carguen completamente\n3. Haz clic en el botón "Exportar PDF" ubicado en la parte superior derecha\n4. Se abrirá un modal con vista previa del reporte\n5. Revisa el contenido que incluye: portada con logo y rango de fechas, resumen ejecutivo con métricas principales, todas las gráficas estadísticas, tabla detallada de incidencias, y pie de página con fecha de generación\n6. Si es necesario, ajusta configuraciones de formato\n7. Haz clic en "Descargar" o "Confirmar Exportación"\n8. El archivo PDF se descargará automáticamente\n\nEl reporte PDF es ideal para presentaciones gerenciales, análisis de tendencias, reportes mensuales y presentación de resultados a stakeholders.',
            image: 'assets/documentacion-imagenes/39. reportes 3.png'
          },
          {
            heading: 'Casos de Uso y Consideraciones',
            content: 'Casos de Uso Comunes:\n\n• Reporte Mensual: Configura fechas del primer al último día del mes anterior, exporta PDF para presentación gerencial\n• Análisis de Tendencias: Usa rango de varios meses para identificar patrones estacionales\n• Reporte por Empresa: Aplica filtro de empresa específica antes de exportar\n• Presentación de Resultados: Descarga gráficas individuales como imágenes para presentaciones\n\nConsideraciones de Rendimiento:\n\n• Rangos de fechas muy amplios pueden tomar más tiempo en procesar\n• La generación de PDF con muchas incidencias puede demorar varios segundos\n• Es recomendable filtrar por períodos específicos para reportes más ágiles\n• Los reportes exportados se guardan en el historial por un período determinado\n• Algunos navegadores pueden bloquear descargas automáticas, autoriza si es necesario\n\nUtiliza este módulo regularmente para monitorear el desempeño del sistema, identificar áreas de mejora y presentar resultados de manera profesional.'
          }
        ]
      }
    };

    return content[this.selectedItem] || null;
  }
}
