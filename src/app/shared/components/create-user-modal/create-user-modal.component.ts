import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';
import { CreateUserRequest, UpdateUserRequest } from '../../models/user-request.model';

@Component({
  selector: 'app-create-user-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './create-user-modal.component.html',
  styleUrl: './create-user-modal.component.scss'
})
export class CreateUserModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() isEditMode = false;
  @Input() editUserData: { name: string; lastName: string; email: string; phoneNumber: string } | null = null;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSubmit = new EventEmitter<CreateUserRequest>();
  @Output() onUpdate = new EventEmitter<UpdateUserRequest>();

  // Form fields
  userName = '';
  userLastName = '';
  userEmail = '';
  userPassword = '';
  userConfirmPassword = '';
  userPhoneNumber = '';
  identificationType = '';
  identificationNumber = '';

  // Validation errors
  nameError = '';
  lastNameError = '';
  emailError = '';
  passwordError = '';
  confirmPasswordError = '';
  phoneError = '';
  identificationTypeError = '';
  identificationNumberError = '';

  // Modal state
  isClosing = false;

  // Select options
  identificationTypeOptions = [
    { value: '', label: 'Seleccionar tipo' },
    { value: 'CC', label: 'Cédula de Ciudadanía' },
    { value: 'CE', label: 'Cédula de Extranjería' },
    { value: 'PASSPORT', label: 'Pasaporte' },
    { value: 'NIT', label: 'NIT' }
  ];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges) {
    // Check if modal is opening
    if (changes['isOpen'] && changes['isOpen'].currentValue) {
      // Use setTimeout to ensure all inputs are updated before processing
      setTimeout(() => {
        if (this.isEditMode && this.editUserData) {
          this.loadEditData();
        } else {
          this.resetForm();
        }
        this.cdr.detectChanges();
      }, 0);
    }

    // Also handle when editUserData changes while modal is already open
    if (changes['editUserData'] && this.isOpen && this.isEditMode && this.editUserData) {
      this.loadEditData();
      this.cdr.detectChanges();
    }
  }

  loadEditData() {
    if (this.editUserData) {
      this.userName = this.editUserData.name;
      this.userLastName = this.editUserData.lastName;
      this.userEmail = this.editUserData.email;
      this.userPhoneNumber = this.editUserData.phoneNumber;
      this.userPassword = '';
      this.userConfirmPassword = '';
      this.identificationType = '';
      this.identificationNumber = '';

      // Clear all errors
      this.nameError = '';
      this.lastNameError = '';
      this.emailError = '';
      this.passwordError = '';
      this.confirmPasswordError = '';
      this.phoneError = '';
      this.identificationTypeError = '';
      this.identificationNumberError = '';
    }
  }

  validateForm(): boolean {
    let isValid = true;

    // Reset errors
    this.nameError = '';
    this.lastNameError = '';
    this.emailError = '';
    this.passwordError = '';
    this.confirmPasswordError = '';
    this.phoneError = '';
    this.identificationTypeError = '';
    this.identificationNumberError = '';

    // Validate name
    if (!this.userName.trim()) {
      this.nameError = 'El nombre es obligatorio';
      isValid = false;
    }

    // Validate lastName
    if (!this.userLastName.trim()) {
      this.lastNameError = 'El apellido es obligatorio';
      isValid = false;
    }

    // Validate email
    if (!this.userEmail.trim()) {
      this.emailError = 'El correo es obligatorio';
      isValid = false;
    } else if (!this.isValidEmail(this.userEmail)) {
      this.emailError = 'El correo no es válido';
      isValid = false;
    }

    // Validate password (required for create, optional for edit)
    if (!this.isEditMode) {
      if (!this.userPassword.trim()) {
        this.passwordError = 'La contraseña es obligatoria';
        isValid = false;
      } else if (this.userPassword.length < 8) {
        this.passwordError = 'La contraseña debe tener al menos 8 caracteres';
        isValid = false;
      }

      // Validate confirm password
      if (!this.userConfirmPassword.trim()) {
        this.confirmPasswordError = 'Debe confirmar la contraseña';
        isValid = false;
      } else if (this.userPassword !== this.userConfirmPassword) {
        this.confirmPasswordError = 'Las contraseñas no coinciden';
        isValid = false;
      }
    } else {
      // In edit mode, validate password only if provided
      if (this.userPassword.trim()) {
        if (this.userPassword.length < 8) {
          this.passwordError = 'La contraseña debe tener al menos 8 caracteres';
          isValid = false;
        }
        if (this.userPassword !== this.userConfirmPassword) {
          this.confirmPasswordError = 'Las contraseñas no coinciden';
          isValid = false;
        }
      }
    }

    // Validate phone
    if (!this.userPhoneNumber.trim()) {
      this.phoneError = 'El teléfono es obligatorio';
      isValid = false;
    } else if (!this.isValidPhone(this.userPhoneNumber)) {
      this.phoneError = 'El teléfono debe contener exactamente 10 dígitos numéricos';
      isValid = false;
    }

    // Validate identificationType (only for create mode)
    if (!this.isEditMode) {
      if (!this.identificationType) {
        this.identificationTypeError = 'El tipo de identificación es obligatorio';
        isValid = false;
      }

      // Validate identificationNumber
      if (!this.identificationNumber.trim()) {
        this.identificationNumberError = 'El número de identificación es obligatorio';
        isValid = false;
      } else if (!this.isValidIdentificationNumber(this.identificationNumber)) {
        this.identificationNumberError = 'El número de identificación debe contener solo números';
        isValid = false;
      }
    }

    return isValid;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  isValidPhone(phone: string): boolean {
    // Remove any non-digit characters and check if it has exactly 10 digits
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length === 10;
  }

  isValidIdentificationNumber(idNumber: string): boolean {
    // Check if contains only numbers
    const numbersOnlyRegex = /^\d+$/;
    return numbersOnlyRegex.test(idNumber.trim());
  }

  // Filter input to only allow numbers for phone
  onPhoneInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const filtered = input.value.replace(/\D/g, '');
    if (filtered.length <= 10) {
      this.userPhoneNumber = filtered;
    } else {
      this.userPhoneNumber = filtered.slice(0, 10);
    }
    input.value = this.userPhoneNumber;
    this.clearPhoneError();
  }

  // Filter input to only allow numbers for identification number
  onIdentificationNumberInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const filtered = input.value.replace(/\D/g, '');
    this.identificationNumber = filtered;
    input.value = this.identificationNumber;
    this.clearIdentificationNumberError();
  }

  clearNameError() {
    this.nameError = '';
  }

  clearLastNameError() {
    this.lastNameError = '';
  }

  clearEmailError() {
    this.emailError = '';
  }

  // Validate email on input and show error in real-time
  onEmailInput() {
    if (this.userEmail.trim() && !this.isValidEmail(this.userEmail)) {
      this.emailError = 'Ingrese un correo válido (ejemplo: usuario@dominio.com)';
    } else {
      this.emailError = '';
    }
  }

  clearPasswordError() {
    this.passwordError = '';
  }

  clearPhoneError() {
    this.phoneError = '';
  }

  clearConfirmPasswordError() {
    this.confirmPasswordError = '';
  }

  clearIdentificationTypeError() {
    this.identificationTypeError = '';
  }

  clearIdentificationNumberError() {
    this.identificationNumberError = '';
  }

  handleSubmit() {
    if (!this.validateForm()) {
      return;
    }

    if (this.isEditMode) {
      const updateRequest: UpdateUserRequest = {
        name: this.userName.trim(),
        lastName: this.userLastName.trim(),
        email: this.userEmail.trim(),
        phoneNumber: this.userPhoneNumber.trim()
      };

      // Only include password if provided
      if (this.userPassword.trim()) {
        updateRequest.password = this.userPassword;
        updateRequest.confirmPassword = this.userConfirmPassword;
      }

      this.onUpdate.emit(updateRequest);
    } else {
      const request: CreateUserRequest = {
        name: this.userName.trim(),
        lastName: this.userLastName.trim(),
        email: this.userEmail.trim(),
        password: this.userPassword,
        confirmPassword: this.userConfirmPassword,
        phoneNumber: this.userPhoneNumber.trim(),
        identificationType: this.identificationType,
        identificationNumber: this.identificationNumber.trim()
      };

      this.onSubmit.emit(request);
    }
  }

  resetForm() {
    this.userName = '';
    this.userLastName = '';
    this.userEmail = '';
    this.userPassword = '';
    this.userConfirmPassword = '';
    this.userPhoneNumber = '';
    this.identificationType = '';
    this.identificationNumber = '';

    this.nameError = '';
    this.lastNameError = '';
    this.emailError = '';
    this.passwordError = '';
    this.confirmPasswordError = '';
    this.phoneError = '';
    this.identificationTypeError = '';
    this.identificationNumberError = '';
  }

  closeModal() {
    this.isClosing = true;
    this.cdr.markForCheck();

    const isMobile = window.innerWidth < 640;
    const delay = isMobile ? 300 : 150;

    setTimeout(() => {
      this.isClosing = false;
      this.resetForm();
      this.onClose.emit();
      this.cdr.markForCheck();
    }, delay);
  }
}
