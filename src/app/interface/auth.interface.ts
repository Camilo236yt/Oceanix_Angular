/**
 * Interface for enterprise registration request
 */
export interface RegisterEnterpriseRequest {
  enterpriseName: string;
  subdomain: string;
  enterpriseEmail: string;
  enterprisePhone: string;
  enterpriseTaxIdType: string;
  enterpriseTaxIdNumber: string;
  adminName: string;
  adminLastName: string;
  adminEmail: string;
  adminPhoneNumber: string;
  adminPassword: string;
  adminConfirmPassword: string;
  adminIdentificationType: string;
  adminIdentificationNumber: string;
  acceptTerms: boolean;
}

/**
 * Interface for enterprise data in response
 */
export interface Enterprise {
  id: string;
  name: string;
  subdomain: string;
  email: string;
  phone: string;
  addressId: string | null;
  taxIdType: string;
  taxIdNumber: string;
  logo: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface for admin user data in response
 */
export interface AdminUser {
  id: string;
  enterpriseId: string;
  userType: string;
  name: string;
  phoneNumber: string;
  lastName: string;
  email: string;
  addressId: string | null;
  identificationType: string;
  identificationNumber: string;
  isActive: boolean;
  isEmailVerified: boolean;
  isLegalRepresentative: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface for enterprise registration response data
 */
export interface RegisterEnterpriseData {
  subdomain: string;
  activationToken: string;
  message: string;
  redirectUrl: string;
  enterprise?: Enterprise;
  admin?: AdminUser;
}

/**
 * Interface for enterprise registration response
 */
export interface RegisterEnterpriseResponse {
  success: boolean;
  data: RegisterEnterpriseData;
  statusCode: number;
}

/**
 * Interface for login request
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Interface for login response
 */
export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    user: AdminUser;
    enterprise: Enterprise;
  };
  statusCode: number;
}

/**
 * Interface for activate account request
 */
export interface ActivateAccountRequest {
  activationToken: string;
}

/**
 * Interface for activate account response
 */
export interface ActivateAccountResponse {
  success: boolean;
  data: {
    message: string;
  };
  statusCode: number;
}

/**
 * Interface for user data from /auth/me endpoint
 */
export interface MeUser {
  id: string;
  email: string;
  name: string;
  lastName: string;
  phoneNumber: string;
  userType: string;
  isEmailVerified: boolean;
  isActive: boolean;
}

/**
 * Interface for enterprise data from /auth/me endpoint
 */
export interface MeEnterprise {
  id: string;
  name: string;
  subdomain: string;
  email: string;
  phone: string;
}

/**
 * Interface for enterprise configuration from /auth/me endpoint
 */
export interface EnterpriseConfig {
  isVerified: boolean;
  verificationStatus: string;
  primaryColor: string | null;
  secondaryColor: string | null;
  accentColor: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  bannerUrl: string | null;
  requireCorporateEmail: boolean;
}

/**
 * Interface for user role from /auth/me endpoint
 */
export interface UserRole {
  id: string;
  name: string;
  description: string;
}

/**
 * Interface for /auth/me response data
 */
export interface MeResponseData {
  user: MeUser;
  enterprise: MeEnterprise;
  config: EnterpriseConfig;
  roles: UserRole[];
  permissions: string[];
}

/**
 * Interface for /auth/me response
 */
export interface MeResponse {
  success: boolean;
  data: MeResponseData;
  statusCode: number;
}
