import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { IconComponent } from '../icon/icon.component';
import { CreateEmpresaRequest } from '../../../interface/empresas-api.interface';
import { AuthService } from '../../../services/auth.service';
import { PdfThumbnailService } from '../../services/pdf-thumbnail.service';
import { EmpresaService } from '../../../features/crm/services/empresa.service';

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
  sanitizer = inject(DomSanitizer);
  pdfThumbnailService = inject(PdfThumbnailService);
  empresaService = inject(EmpresaService);
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

  // Sanitize blob URLs for iframe
  getSafeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  // Get PDF URL without toolbar (cleaner view)
  getPdfUrlWithoutToolbar(url: string): SafeResourceUrl {
    // Add parameters to hide PDF toolbar
    // #toolbar=0 hides the toolbar in most PDF viewers
    const urlWithParams = `${url}#toolbar=0&navpanes=0&scrollbar=0`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(urlWithParams);
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
        this.documents = (this.enterpriseDocuments || []).map(doc => ({
          ...doc,
          _loadingPreview: false,
          _previewUrl: null
        }));
        console.log('📄 Documents loaded:', this.documents);

        // Load document previews
        this.loadDocumentPreviews();
      } else {
        console.log('❌ Not SUPER_ADMIN, skipping verification fields');
      }
    } else {
      this.resetForm();
    }
    this.clearAllErrors();
  }

  // Load previews for documents
  private async loadDocumentPreviews() {
    console.log('📸 Starting to load document previews from backend...');

    for (let index = 0; index < this.documents.length; index++) {
      const doc = this.documents[index];

      // Mark as loading
      this.documents[index]._loadingPreview = true;

      try {
        // For PDFs, fetch thumbnail from backend
        if (doc.mimeType?.includes('pdf')) {
          console.log(`📄 Fetching thumbnail for PDF: ${doc.fileName}`);

          this.empresaService.getDocumentThumbnail(
            this.companyId!,
            doc.id
          ).subscribe({
            next: (thumbnailUrl) => {
              this.documents[index]._previewUrl = thumbnailUrl;
              this.documents[index]._loadingPreview = false;
              console.log(`✅ Thumbnail loaded for ${doc.fileName}`);
            },
            error: (error) => {
              console.error(`❌ Error loading thumbnail for ${doc.fileName}:`, error);
              this.documents[index]._loadingPreview = false;
            }
          });
        }
        // For images, download and display directly
        else if (doc.mimeType?.includes('image')) {
          console.log(`🖼️ Fetching image: ${doc.fileName}`);

          const result = await this.empresaService.getDocumentDownloadUrl(
            this.companyId!,
            doc.id
          ).toPromise();

          if (result) {
            this.documents[index]._previewUrl = result.url;
          }
          this.documents[index]._loadingPreview = false;
        }
        // For other file types, just mark as loaded (no preview)
        else {
          console.log(`📦 Document is ${doc.mimeType}, no preview available`);
          this.documents[index]._loadingPreview = false;
        }
      } catch (error) {
        console.error(`❌ Error loading preview for document ${doc.fileName}:`, error);
        this.documents[index]._loadingPreview = false;
      }
    }

    console.log('✅ Finished loading all document previews');
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

  /**
   * Handle document click with proper event handling
   */
  handleDocumentClick(event: MouseEvent, document: any) {
    // Stop propagation immediately to prevent double clicks
    event.stopPropagation();
    event.preventDefault();

    // Open document preview
    this.openDocumentPreview(document);
  }

  async openDocumentPreview(document: any) {
    console.log('🔍 Opening document preview:', document);

    try {
      // Show loading indicator
      const loadingToast = await import('sweetalert2').then(m => m.default);
      loadingToast.fire({
        toast: true,
        position: 'top-end',
        icon: 'info',
        title: 'Cargando documento...',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
        didOpen: () => {
          loadingToast.showLoading();
        }
      });

      // Get download URL
      const result = await this.empresaService.getDocumentDownloadUrl(
        this.companyId!,
        document.id
      ).toPromise();

      if (result) {
        console.log('✅ Document loaded, opening preview');
        this.setPreviewDocument(result.url, result.fileName, result.mimeType);

        loadingToast.close();
      } else {
        throw new Error('Failed to get document URL');
      }
    } catch (error) {
      console.error('❌ Error loading document:', error);
      const Swal = await import('sweetalert2').then(m => m.default);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cargar el documento',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });
    }
  }

  setPreviewDocument(url: string, fileName: string, mimeType: string) {
    // Clean up previous blob URL if exists
    if (this.previewDocument?.url && this.previewDocument.url.startsWith('blob:')) {
      URL.revokeObjectURL(this.previewDocument.url);
    }

    this.previewDocument = { url, fileName, mimeType };
    this.showPreviewModal = true;
  }

  closePreviewModal() {
    // Clean up blob URL to prevent memory leaks
    if (this.previewDocument?.url && this.previewDocument.url.startsWith('blob:')) {
      URL.revokeObjectURL(this.previewDocument.url);
    }

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
