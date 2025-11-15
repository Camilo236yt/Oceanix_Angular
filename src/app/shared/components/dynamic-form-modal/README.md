# Dynamic Form Modal Component

Componente de modal reutilizable que puede funcionar en dos modos: **modo role** (compatibilidad con implementación anterior) y **modo genérico** (completamente configurable).

## Ubicación
`src/app/shared/components/dynamic-form-modal/`

## Características
- ✅ Completamente reutilizable
- ✅ Configuración mediante inputs
- ✅ Soporte para formularios dinámicos
- ✅ Secciones seleccionables opcionales (como permisos, categorías, etc.)
- ✅ Validación integrada
- ✅ Animaciones suaves
- ✅ Modo de compatibilidad para el módulo de roles existente

## Modos de Uso

### 1. Modo Role (Compatibilidad)

Este modo mantiene la funcionalidad original del componente para crear roles con permisos.

```html
<app-dynamic-form-modal
  [isOpen]="isCreateRoleModalOpen"
  [mode]="'role'"
  (onClose)="closeCreateRoleModal()"
  (onSubmit)="handleCreateRole($event)">
</app-dynamic-form-modal>
```

**Output del evento onSubmit:**
```typescript
{
  name: string;
  description: string;
  permissionIds: string[];
}
```

### 2. Modo Genérico

Este modo permite crear formularios completamente personalizados mediante configuración.

#### Ejemplo 1: Formulario simple sin sección seleccionable

**TypeScript:**
```typescript
import { DynamicFormModalConfig, DynamicFormData } from '../../../../shared/models/dynamic-form-modal.model';

export class MiComponente {
  isModalOpen = false;

  modalConfig: DynamicFormModalConfig = {
    title: 'Crear Nueva Categoría',
    subtitle: 'Ingresa los datos de la categoría',
    submitButtonText: 'Crear',
    cancelButtonText: 'Cancelar',
    fields: [
      {
        name: 'nombre',
        label: 'Nombre',
        type: 'text',
        placeholder: 'Ej: Soporte técnico',
        required: true
      },
      {
        name: 'descripcion',
        label: 'Descripción',
        type: 'textarea',
        placeholder: 'Describe la categoría...',
        required: true,
        rows: 3
      },
      {
        name: 'codigo',
        label: 'Código',
        type: 'text',
        placeholder: 'Ej: SOPORTE-TEC',
        required: false
      }
    ]
  };

  handleSubmit(data: DynamicFormData) {
    console.log('Datos del formulario:', data.fields);
    // data.fields = { nombre: '...', descripcion: '...', codigo: '...' }

    // Aquí puedes enviar los datos al servicio
    this.miServicio.crear(data.fields).subscribe(...);
  }
}
```

**HTML:**
```html
<app-dynamic-form-modal
  [isOpen]="isModalOpen"
  [mode]="'generic'"
  [config]="modalConfig"
  (onClose)="isModalOpen = false"
  (onSubmit)="handleSubmit($event)">
</app-dynamic-form-modal>
```

#### Ejemplo 2: Formulario con sección seleccionable

**TypeScript:**
```typescript
export class MiComponente implements OnInit {
  isModalOpen = false;
  items: any[] = [];

  modalConfig: DynamicFormModalConfig = {
    title: 'Crear Equipo',
    subtitle: 'Define el equipo y selecciona sus miembros',
    submitButtonText: 'Crear Equipo',
    fields: [
      {
        name: 'nombre',
        label: 'Nombre del Equipo',
        type: 'text',
        required: true
      },
      {
        name: 'descripcion',
        label: 'Descripción',
        type: 'textarea',
        required: true,
        rows: 2
      }
    ],
    selectableSection: {
      label: 'Seleccionar Miembros',
      requiredMessage: 'Debes seleccionar al menos un miembro',
      loadDataFn: () => this.loadMembers(),
      groupByFn: (items) => this.groupMembersByDepartment(items),
      getCategoryNameFn: (itemName) => this.getDepartmentName(itemName)
    }
  };

  loadMembers() {
    // Cargar miembros desde el servicio
    this.miServicio.getMembers().subscribe(members => {
      this.items = members;
    });
  }

  groupMembersByDepartment(members: any[]): SelectableSection[] {
    // Agrupar miembros por departamento
    // Similar a groupPermissionsByResource en el modo role
  }

  handleSubmit(data: DynamicFormData) {
    console.log('Datos:', data.fields);
    console.log('IDs seleccionados:', data.selectedItems);

    const request = {
      nombre: data.fields.nombre,
      descripcion: data.fields.descripcion,
      miembroIds: data.selectedItems
    };

    this.miServicio.crearEquipo(request).subscribe(...);
  }
}
```

## Configuración

### DynamicFormModalConfig

```typescript
interface DynamicFormModalConfig {
  title: string;                    // Título del modal
  subtitle?: string;                // Subtítulo opcional
  submitButtonText?: string;        // Texto del botón de envío (default: 'Guardar')
  cancelButtonText?: string;        // Texto del botón de cancelar (default: 'Cancelar')
  fields: FormFieldConfig[];        // Campos del formulario
  selectableSection?: {             // Sección seleccionable opcional
    label: string;
    requiredMessage?: string;
    loadDataFn?: () => void;
    groupByFn?: (items: any[]) => SelectableSection[];
    getCategoryNameFn?: (itemName: string) => string;
  };
}
```

### FormFieldConfig

```typescript
interface FormFieldConfig {
  name: string;                     // Nombre del campo (key en el objeto de datos)
  label: string;                    // Etiqueta del campo
  type: 'text' | 'textarea' | 'email' | 'number' | 'password';
  placeholder?: string;             // Placeholder opcional
  required?: boolean;               // Si el campo es requerido
  rows?: number;                    // Número de filas (solo para textarea)
  value?: string | number;          // Valor inicial
}
```

### DynamicFormData (Output)

```typescript
interface DynamicFormData {
  fields: { [key: string]: any };   // Objeto con los valores de los campos
  selectedItems?: string[];         // IDs de items seleccionados (si hay sección seleccionable)
}
```

## Inputs del Componente

| Input | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `isOpen` | `boolean` | Sí | Controla la visibilidad del modal |
| `mode` | `'role' \| 'generic'` | Sí | Modo de operación del modal |
| `config` | `DynamicFormModalConfig \| null` | Condicional | Configuración (requerido en modo 'generic') |

## Outputs del Componente

| Output | Tipo | Descripción |
|--------|------|-------------|
| `onClose` | `EventEmitter<void>` | Se emite cuando se cierra el modal |
| `onSubmit` | `EventEmitter<any>` | Se emite cuando se envía el formulario |

## Validación

El componente incluye validación automática:
- Campos requeridos (si `required: true`)
- Sección seleccionable (si está configurada, requiere al menos un item seleccionado)
- Los mensajes de error se muestran automáticamente debajo de cada campo

## Estilo y Diseño

- Diseño responsive (mobile-first)
- Animaciones suaves de entrada/salida
- Soporte para modo oscuro
- Usa variables CSS para temas personalizados
- Clases de Tailwind CSS

## Migración desde create-role-modal

Si tienes código que usaba el componente anterior `create-role-modal`:

**Antes:**
```html
<app-create-role-modal
  [isOpen]="isOpen"
  (onClose)="onClose()"
  (onSubmit)="onSubmit($event)">
</app-create-role-modal>
```

**Después (mantiene la misma funcionalidad):**
```html
<app-dynamic-form-modal
  [isOpen]="isOpen"
  [mode]="'role'"
  (onClose)="onClose()"
  (onSubmit)="onSubmit($event)">
</app-dynamic-form-modal>
```

Solo necesitas:
1. Cambiar el selector de `app-create-role-modal` a `app-dynamic-form-modal`
2. Agregar el input `[mode]="'role'"`
3. Actualizar la importación en tu componente

## Notas Importantes

- El modo `'role'` está diseñado para mantener compatibilidad con el módulo de roles y permisos existente
- En modo `'generic'`, debes proporcionar la configuración mediante el input `config`
- Las funciones `loadDataFn`, `groupByFn`, y `getCategoryNameFn` son opcionales en la sección seleccionable
- El componente usa `ChangeDetectorRef` para optimizar las detecciones de cambios
