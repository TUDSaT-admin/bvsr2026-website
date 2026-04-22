import { Injectable } from '@angular/core';

export interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  association: string;
  registrationId: string;
  timestamp: string;
}

export type TourRegistrationResult =
  | { status: 'saved' }
  | { status: 'name_mismatch' };
export interface TourRegistrationPayload {
  firstName: string;
  lastName: string;
  email: string;
  countryOfOrigin: string;
  nationality: string;
  may14: 'Yes' | 'No';
  may15: 'Yes' | 'No';
  may16: 'Yes' | 'No';
  may17: 'Yes' | 'No';
  confirmNameMismatch?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {
  private registrationScriptURL = 'https://script.google.com/macros/s/AKfycbws1151EnnuvS-hqOvKLhJJJ-JC_6TJkETXYDbvByxueQQ4AyCJUki-20VsvwkS2ttVVg/exec';

  private cvUploadScriptURL = 'https://script.google.com/macros/s/AKfycbws1151EnnuvS-hqOvKLhJJJ-JC_6TJkETXYDbvByxueQQ4AyCJUki-20VsvwkS2ttVVg/exec';

  private isConfigured(url: string): boolean {
    return !!(url && !url.includes('YOUR_') && url.includes('script.google.com'));
  }

  async register(data: RegistrationData): Promise<any> {
    if (!this.isConfigured(this.registrationScriptURL)) {
      console.warn('Registration script URL not configured. Registration will be simulated.');
      return { success: true, simulated: true };
    }

    const formData = new FormData();
    formData.append('action', 'register');
    Object.keys(data).forEach(key => {
      formData.append(key, (data as any)[key]);
    });

    try {
      await this.fetchPostNoCors(this.registrationScriptURL, formData, 35_000);
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: true, warning: 'Registration submitted but backend confirmation pending' };
    }
  }

  async uploadCV(file: File, email: string, registrationId: string): Promise<any> {
    if (!this.isConfigured(this.cvUploadScriptURL)) {
      console.warn('CV upload script URL not configured. CV upload will be simulated.');
      return { success: true, simulated: true };
    }

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
      return { success: false, warning: 'CV upload failed but registration continues' };
    }
  }

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

  async submitTourRegistration(payload: TourRegistrationPayload): Promise<TourRegistrationResult> {
    if (!this.isConfigured(this.registrationScriptURL)) {
      throw new Error('Registration service is not configured. Please contact the administrator.');
    }

    const params = new URLSearchParams();
    params.set('action', 'tourRegistration');
    params.set('firstName', payload.firstName.trim());
    params.set('lastName', payload.lastName.trim());
    params.set('email', payload.email.trim());
    params.set('countryOfOrigin', payload.countryOfOrigin.trim());
    params.set('nationality', payload.nationality.trim());
    params.set('may14', payload.may14);
    params.set('may15', payload.may15);
    params.set('may16', payload.may16);
    params.set('may17', payload.may17);
    params.set('confirmNameMismatch', payload.confirmNameMismatch ? 'true' : 'false');

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 35_000);
    try {
      const res = await fetch(this.registrationScriptURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: params.toString(),
        mode: 'cors',
        signal: ctrl.signal
      });

      const text = await res.text();
      let data: { success?: boolean; message?: string; code?: string };
      try {
        data = JSON.parse(text) as { success?: boolean; message?: string; code?: string };
      } catch {
        throw new Error('Unexpected response from server. Please try again later.');
      }

      if (!data.success) {
        if (data.code === 'NAME_MISMATCH') {
          return { status: 'name_mismatch' };
        }
        throw new Error(
          data.message ||
            'No registration found for this email. Use the same email address you used when you registered for the conference.'
        );
      }

      return { status: 'saved' };
    } catch (e: unknown) {
      if (e instanceof Error && e.name === 'AbortError') {
        throw new Error('Request timed out. Check your connection and try again.');
      }
      if (
        e instanceof TypeError &&
        /failed to fetch|networkerror|load failed/i.test(String((e as TypeError).message))
      ) {
        throw new Error(
          'Could not reach the registration server. Check your connection, or ask the team to redeploy the Google Apps Script (CORS update).'
        );
      }
      throw e;
    } finally {
      clearTimeout(timer);
    }
  }

  async verifyQRCode(registrationId: string): Promise<any> {
    if (!this.isConfigured(this.registrationScriptURL)) {
      console.warn('Verification script URL not configured.');
      throw new Error('Verification service is not configured. Please contact the administrator.');
    }

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
