export interface Address {
  street: string;
  line2?: string;
  line3?: string;
  city: string;
  postalCode: string;
  country: string;
  region?: string;
}

export interface Contact {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface CategoryRegion {
  category: string;
  region?: string;
}

export interface AdditionalInfo {
  details?: string;
}

export interface SupplierData {
  supplierName: string;
  status?: string;
  businessPartnerId?: string;
  aiExtractedText?: string;
  gstValidationStatus?: string;
  gstValidationRemarks?: string;
  mainAddress: Address;
  primaryContact: Contact;
  categoryAndRegion: CategoryRegion;
  additionalInfo: AdditionalInfo;
}

export interface Approver {
  name: string;
  email: string;
  country: string;
  level: string;
}

export interface ApprovalComment {
  level: string;
  email: string;
  name: string;
  status: string;
  comment?: string;
  updatedAt?: string;
}

export interface UploadedFile {
  documentId: string;
  name: string;
  type: string;
  size: number;
  file: File;
}

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
}

export interface GSTValidationResult {
  field: string;
  status: 'Success' | 'Failed';
  remarks: string;
}

export interface GSTValidation {
  results: GSTValidationResult[];
  overallStatus: 'Success' | 'Failed';
  remarks?: string;
}
