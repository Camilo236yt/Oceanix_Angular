import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';
import { CreateEmpresaRequest } from '../../../interface/empresas-api.interface';

@Component({
  selector: 'app-create-company-modal',
  standalone: true,
  imports: [CommonModule, IconComponent, FormsModule],
  templateUrl: './create-company-modal.html',
  styleUrl: './create-company-modal.scss'
})
export class CreateCompanyModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() isEditMode = false;
  @Input() companyId: string | null = null;
  @Input() initialData: CreateEmpresaRequest | null = null;
  @Output() onClose = new EventEmitter<void>();
  @Output() onCreate = new EventEmitter<CreateEmpresaRequest>();
  @Output() onUpdate = new EventEmitter<{ id: string; data: CreateEmpresaRequest }>();

  isClosing = false;

  formData: CreateEmpresaRequest = {
    name: '',
    subdomain: '',
    email: '',
    phone: ''
  };

  errors: { [key: string]: string } = {
    name: '',
    subdomain: '',
    email: '',
    phone: ''
  };

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen']) {
      if (this.isOpen) {
        this.isClosing = false;
        document.body.style.overflow = 'hidden';
        this.loadFormData();
      } else {
        document.body.style.overflow = '';
      }
    }

    if (changes['initialData'] && this.initialData) {
      this.loadFormData();
    }
  }

  loadFormData() {
    if (this.isEditMode && this.initialData) {
      this.formData = { ...this.initialData };
    } else {
      this.resetForm();
    }
    this.clearAllErrors();
  }

  resetForm() {
    this.formData = {
      name: '',
      subdomain: '',
      email: '',
      phone: ''
    };
    this.clearAllErrors();
  }

  clearError(field: string) {
    this.errors[field] = '';
  }

  clearAllErrors() {
    this.errors = {
      name: '',
      subdomain: '',
      email: '',
      phone: ''
    };
  }

  closeModal() {
    this.isClosing = true;
    setTimeout(() => {
      this.onClose.emit();
      this.isClosing = false;
    }, 200);
  }

  validateForm(): boolean {
    let isValid = true;
    this.clearAllErrors();

    // Validate name
    if (!this.formData.name.trim()) {
      this.errors['name'] = 'El nombre es requerido';
      isValid = false;
    }

    // Validate subdomain
    if (!this.formData.subdomain.trim()) {
      this.errors['subdomain'] = 'El subdominio es requerido';
      isValid = false;
    }

    // Validate email
    if (!this.formData.email.trim()) {
      this.errors['email'] = 'El correo electrónico es requerido';
      isValid = false;
    } else if (!this.isValidEmail(this.formData.email)) {
      this.errors['email'] = 'Ingrese un correo electrónico válido';
      isValid = false;
    }

    // Validate phone
    if (!this.formData.phone.trim()) {
      this.errors['phone'] = 'El teléfono es requerido';
      isValid = false;
    }

    return isValid;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  handleSubmit() {
    if (this.validateForm()) {
      if (this.isEditMode && this.companyId) {
        this.onUpdate.emit({ id: this.companyId, data: this.formData });
      } else {
        this.onCreate.emit(this.formData);
      }
    }
  }
}
