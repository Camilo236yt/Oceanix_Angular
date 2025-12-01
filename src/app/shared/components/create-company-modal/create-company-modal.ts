import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';
import { CreateEmpresaRequest } from '../../../interface/empresas-api.interface';
import { AuthService } from '../../../services/auth.service';

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
  @Input() initialVerificationStatus: string = 'pending';
  @Input() initialRejectionReason: string = '';
  @Input() enterpriseDocuments: any[] = [];
  @Output() onClose = new EventEmitter<void>();
  @Output() onCreate = new EventEmitter<CreateEmpresaRequest>();
  @Output() onUpdate = new EventEmitter<{ id: string; data: CreateEmpresaRequest }>();
  @Output() onVerificationUpdate = new EventEmitter<{ enterpriseId: string; verificationStatus: string; rejectionReason?: string }>();
  @Output() onDocumentPreview = new EventEmitter<{ enterpriseId: string; documentId: string }>();

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

  // Verification fields (only for SUPER_ADMIN in edit mode)
  authService = inject(AuthService);
  isSuperAdmin = false;
  showVerificationFields = false;

  verificationStatus: string = 'pending';
  rejectionReason: string = '';

  verificationStatusOptions = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'in_progress', label: 'En Progreso' },
    { value: 'verified', label: 'Verificado' },
    { value: 'rejected', label: 'Rechazado' }
  ];

  // Documents (only for SUPER_ADMIN in edit mode)
  documents: any[] = [];
  isLoadingDocuments = false;
  previewDocument: { url: string; fileName: string; mimeType: string } | null = null;
  showPreviewModal = false;

  ngOnInit() {
    this.isSuperAdmin = this.authService.hasUserType('SUPER_ADMIN');
  }

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
      // Load verification data if SUPER_ADMIN
      if (this.isSuperAdmin) {
        console.log('🔧 SUPER_ADMIN detected, loading verification data');
        this.verificationStatus = this.initialVerificationStatus;
        this.rejectionReason = this.initialRejectionReason;
        // Load documents
        this.documents = this.enterpriseDocuments || [];
        console.log('📄 Documents loaded:', this.documents);
      } else {
        console.log('❌ Not SUPER_ADMIN, skipping verification fields');
      }
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
        // Update company data
        this.onUpdate.emit({ id: this.companyId, data: this.formData });

        // If SUPER_ADMIN, also emit verification status update
        if (this.isSuperAdmin) {
          this.onVerificationUpdate.emit({
            enterpriseId: this.companyId,
            verificationStatus: this.verificationStatus,
            rejectionReason: this.verificationStatus === 'rejected' ? this.rejectionReason : undefined
          });
        }
      } else {
        this.onCreate.emit(this.formData);
      }
    }
  }

  openDocumentPreview(document: any) {
    // Emit event to parent to get download URL
    this.onDocumentPreview.emit({
      enterpriseId: this.companyId!,
      documentId: document.id
    });
  }

  setPreviewDocument(url: string, fileName: string, mimeType: string) {
    this.previewDocument = { url, fileName, mimeType };
    this.showPreviewModal = true;
  }

  closePreviewModal() {
    this.showPreviewModal = false;
    this.previewDocument = null;
  }

  getDocumentIcon(type: string): string {
    const icons: Record<string, string> = {
      'tax_id': 'file-text',
      'chamber_commerce': 'building',
      'legal_rep_id': 'user',
      'power_attorney': 'file-signature',
      'bank_certificate': 'bank',
      'other': 'file'
    };
    return icons[type] || 'file';
  }

  getDocumentLabel(type: string): string {
    const labels: Record<string, string> = {
      'tax_id': 'RUT/NIT',
      'chamber_commerce': 'Cámara de Comercio',
      'legal_rep_id': 'Cédula Rep. Legal',
      'power_attorney': 'Poder Notarial',
      'bank_certificate': 'Certificado Bancario',
      'other': 'Otro'
    };
    return labels[type] || 'Documento';
  }
}
