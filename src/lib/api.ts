import { SupplierData, Approver, ApprovalComment, User } from '@/types/vendor';

const BASE_URL = '/odata/v4/supplier';

export const api = {
  // Authentication
  async sendOtp(email: string): Promise<string> {
    const response = await fetch(`${BASE_URL}/sendOtp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await response.json();
    return data.value || data;
  },

  async verifyOtp(email: string, otp: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${BASE_URL}/verifyOtp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });
    const data = await response.json();
    return data.value || data;
  },

  async registerUser(firstName: string, lastName: string, email: string, username: string, password: string) {
    const response = await fetch(`${BASE_URL}/registerUser`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, lastName, email, username, password })
    });
    const data = await response.json();
    return data.value || data;
  },

  async login(username: string, password: string): Promise<string> {
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    return data.value || data;
  },

  async getUserInfo(username: string): Promise<User> {
    const response = await fetch(`${BASE_URL}/userinfo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    });
    const data = await response.json();
    return data.value?.[0] || data;
  },

  // Suppliers
  async getSuppliers(username: string): Promise<SupplierData[]> {
    const response = await fetch(`${BASE_URL}/getsuppliers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    });
    const data = await response.json();
    return data.value || [];
  },

  async checkIfSupplierExists(supplierName: string, username: string): Promise<boolean> {
    const response = await fetch(`${BASE_URL}/checkIfSupplierExists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ supplierName, username })
    });
    const data = await response.json();
    return data.value || false;
  },

  async createSupplierWithFiles(supplierData: SupplierData, username: string): Promise<string> {
    const response = await fetch(`${BASE_URL}/createSupplierWithFiles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ supplierData, username })
    });
    const data = await response.json();
    return data.value || data;
  },

  async deleteSupplier(supplierName: string, username: string) {
    const response = await fetch(`${BASE_URL}/deletesuppliers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ supplierName, username })
    });
    return response.json();
  },

  // Approvers
  async getApprovers(): Promise<Approver[]> {
    const response = await fetch(`${BASE_URL}/Approvers()`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    return data.value || [];
  },

  async addApprover(approver: Approver) {
    const response = await fetch(`${BASE_URL}/approverentry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approverentry: approver })
    });
    return response.json();
  },

  async updateApprover(approver: Approver) {
    const response = await fetch(`${BASE_URL}/approverupdateentry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approverentry: approver })
    });
    return response.json();
  },

  async deleteApprover(name: string, country: string, level: string) {
    const response = await fetch(`${BASE_URL}/deleteapprover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, country, level })
    });
    return response.json();
  },

  async getApprovals(suppliername: string, username: string): Promise<ApprovalComment[]> {
    const response = await fetch(`${BASE_URL}/Approvals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ suppliername, username })
    });
    const data = await response.json();
    return data.value || [];
  },

  // Files
  async uploadAttachments(supplierName: string, username: string, files: File[]) {
    const formData = new FormData();
    formData.append('supplierName', supplierName);
    formData.append('username', username);
    files.forEach(file => formData.append('files', file));
    
    const response = await fetch('/uploadattachments', {
      method: 'POST',
      body: formData
    });
    return response.json();
  },

  async extractTextFromFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/fileextraction', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to extract text');
    }
    
    const data = await response.json();
    return data.extractedText || '';
  },

  async validateGST(gstin: string) {
    const response = await fetch('/fetchGSTDetails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gstin })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch GST details');
    }
    
    return response.json();
  },

  async saveValidationResult(
    username: string,
    supplierName: string,
    field: string,
    validationStatus: string,
    validationRemarks: string
  ) {
    const response = await fetch(`${BASE_URL}/saveValidationResult`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        supplierName,
        field,
        validationStatus,
        validationRemarks
      })
    });
    return response.json();
  },

  async saveExtractedText(username: string, suppliername: string, extractedGstin: string) {
    const response = await fetch(`${BASE_URL}/saveextractedtext`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, suppliername, extractedGstin })
    });
    return response.json();
  },

  async downloadAttachments(supplierName: string, username: string) {
    const response = await fetch(`${BASE_URL}/downloadAttachments(supplierName='${supplierName}',username='${username}')`, {
      method: 'GET'
    });
    return response.json();
  },

  async downloadZip(supplierName: string, username: string) {
    window.open(`/downloadZip/${supplierName}/${username}`, '_blank');
  },

  async downloadFile(fileID: string) {
    window.open(`/downloadFile/${fileID}`, '_blank');
  }
};
