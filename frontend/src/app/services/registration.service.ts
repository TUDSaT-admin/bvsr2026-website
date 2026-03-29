import { Injectable } from '@angular/core';

export interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  association: string;
  registrationId: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {
  // Replace with your Google Apps Script URL for registration
  // You can use the same URL for all operations or separate URLs
  private registrationScriptURL = 'https://script.google.com/macros/s/AKfycbws1151EnnuvS-hqOvKLhJJJ-JC_6TJkETXYDbvByxueQQ4AyCJUki-20VsvwkS2ttVVg/exec';

  // Replace with your Google Apps Script URL for CV upload
  // Set to same as registrationScriptURL if using one script for all
  private cvUploadScriptURL = 'https://script.google.com/macros/s/AKfycbws1151EnnuvS-hqOvKLhJJJ-JC_6TJkETXYDbvByxueQQ4AyCJUki-20VsvwkS2ttVVg/exec';

  private isConfigured(url: string): boolean {
    return !!(url && !url.includes('YOUR_') && url.includes('script.google.com'));
  }

  async register(data: RegistrationData): Promise<any> {
    if (!this.isConfigured(this.registrationScriptURL)) {
      console.warn('Registration script URL not configured. Registration will be simulated.');
      // Simulate successful registration for development
      return { success: true, simulated: true };
    }

    const formData = new FormData();
    formData.append('action', 'register');
    Object.keys(data).forEach(key => {
      formData.append(key, (data as any)[key]);
    });

    try {
      await this.fetchPostNoCors(this.registrationScriptURL, formData, 35_000);

      // Since no-cors doesn't return response body, we assume success
      // In production, you might want to use a different approach
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      // Don't throw error - allow registration to continue even if backend fails
      // This allows PDF generation and QR code display to work
      return { success: true, warning: 'Registration submitted but backend confirmation pending' };
    }
  }

  async uploadCV(file: File, email: string, registrationId: string): Promise<any> {
    if (!this.isConfigured(this.cvUploadScriptURL)) {
      console.warn('CV upload script URL not configured. CV upload will be simulated.');
      return { success: true, simulated: true };
    }

    // Convert file to base64 for better compatibility with Google Apps Script
    const base64File = await this.fileToBase64(file);

    const formData = new FormData();
    formData.append('cvFile', file); // Keep original for multipart
    formData.append('cvFileBase64', base64File); // Add base64 version
    formData.append('fileName', file.name);
    formData.append('fileType', file.type);
    formData.append('email', email);
    formData.append('registrationId', registrationId);
    formData.append('timestamp', new Date().toISOString());

    try {
      await this.fetchPostNoCors(this.cvUploadScriptURL, formData, 120_000);
      return { success: true };
    } catch (error) {
      console.error('CV upload error:', error);
      // Don't throw - allow registration to continue
      return { success: false, warning: 'CV upload failed but registration continues' };
    }
  }

  /** POST with no-cors; aborts after timeoutMs so the UI never waits indefinitely. */
  private fetchPostNoCors(url: string, body: FormData, timeoutMs: number): Promise<void> {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    return fetch(url, { method: 'POST', body, mode: 'no-cors', signal: ctrl.signal })
      .finally(() => clearTimeout(timer))
      .then(() => undefined);
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix (e.g., "data:application/pdf;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }

  async uploadCVByEmail(file: File, email: string): Promise<any> {
    if (!this.isConfigured(this.cvUploadScriptURL)) {
      console.warn('CV upload script URL not configured.');
      throw new Error('CV upload service is not configured. Please contact the administrator.');
    }

    // Same payload as uploadCV during registration: base64 + metadata is what GAS receives reliably with fetch/no-cors
    const base64File = await this.fileToBase64(file);
    const formData = new FormData();
    formData.append('action', 'uploadCV');
    formData.append('cvFile', file);
    formData.append('cvFileBase64', base64File);
    formData.append('fileName', file.name);
    formData.append('fileType', file.type || 'application/pdf');
    formData.append('email', email);
    formData.append('registrationId', '');
    formData.append('timestamp', new Date().toISOString());

    try {
      await this.fetchPostNoCors(this.cvUploadScriptURL, formData, 120_000);
      return { success: true };
    } catch (error) {
      console.error('CV upload error:', error);
      throw new Error('Failed to upload CV. Please check your email address and try again.');
    }
  }

  async verifyQRCode(registrationId: string): Promise<any> {
    if (!this.isConfigured(this.registrationScriptURL)) {
      console.warn('Verification script URL not configured.');
      throw new Error('Verification service is not configured. Please contact the administrator.');
    }

    // This will be used for QR verification on conference day
    const formData = new FormData();
    formData.append('registrationId', registrationId);
    formData.append('action', 'verify');

    try {
      const response = await fetch(this.registrationScriptURL, {
        method: 'POST',
        body: formData,
        mode: 'no-cors'
      });

      return { success: true };
    } catch (error) {
      console.error('QR verification error:', error);
      throw new Error('Failed to verify QR code. Please check the registration ID and try again.');
    }
  }
}
