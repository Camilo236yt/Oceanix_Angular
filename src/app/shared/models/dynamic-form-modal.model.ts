/**
 * Configuración de campos del formulario dinámico
 */
export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'email' | 'number' | 'password';
  placeholder?: string;
  required?: boolean;
  rows?: number; // Para textarea
  value?: string | number;
}

/**
 * Configuración de sección con items seleccionables (como permisos)
 */
export interface SelectableSection<T = any> {
  name: string;
  items: T[];
  expanded?: boolean;
  selectedCount?: number;
}

/**
 * Configuración completa del modal dinámico
 */
export interface DynamicFormModalConfig {
  title: string;
  subtitle?: string;
  submitButtonText?: string;
  cancelButtonText?: string;

  // Campos del formulario
  fields: FormFieldConfig[];

  // Configuración de sección seleccionable (opcional)
  selectableSection?: {
    label: string;
    requiredMessage?: string;
    loadDataFn?: () => void; // Función para cargar datos
    groupByFn?: (items: any[]) => SelectableSection[];
    getCategoryNameFn?: (itemName: string) => string;
  };
}

/**
 * Datos del formulario al enviar
 */
export interface DynamicFormData {
  fields: { [key: string]: any };
  selectedItems?: string[]; // IDs de items seleccionados
}
