import { Injectable } from '@angular/core';

export interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  association: string;
  registrationId: string;
  timestamp: string;
}

export const BVSR_MAX_CONFERENCE_TICKETS = 250;

export interface RegistrationCapacity {
  soldOut: boolean;
  registeredCount: number;
  maxTickets: number;
  remaining: number;
}

export interface RegisterSubmitResult {
  success: boolean;
  code?: string;
  message?: string;
  registrationId?: string;
  simulated?: boolean;
}

export type TourRegistrationResult =
  | { status: 'saved' }
  | { status: 'name_mismatch' };
export type BvsrTourCode = 'GSI' | 'ESOC1' | 'ESOC2' | 'CASIMAR' | 'CITY';

export const BVSR_TOUR_MAX_CAPACITY: Record<BvsrTourCode, number> = {
  GSI: 125,
  ESOC1: 50,
  ESOC2: 50,
  CASIMAR: 30,
  CITY: 20
};

export const BVSR_TOUR_CODES: BvsrTourCode[] = ['GSI', 'ESOC1', 'ESOC2', 'CASIMAR', 'CITY'];

export interface TourEligibilityResult {
  success: boolean;
  found: boolean;
  hasNationality: boolean;
  firstName?: string;
  lastName?: string;
  association?: string;
  code?: string;
  message?: string;
}

export interface TourAvailabilitySnapshot {
  success: boolean;
  remaining: Partial<Record<BvsrTourCode, number>>;
  max: Partial<Record<BvsrTourCode, number>>;
  booked?: Partial<Record<BvsrTourCode, number>>;
  liveData?: boolean;
  message?: string;
}

export type SaveTourSelectionResult =
  | { status: 'saved' }
  | { status: 'name_mismatch' }
  | { status: 'tour_full'; message?: string }
  | { status: 'error'; message?: string };

export interface VerifyRegistrationResult {
  success: boolean;
  found: boolean;
  alreadyVerified: boolean;
  firstName?: string;
  lastName?: string;
  association?: string;
  email?: string;
  registrationId?: string;
  verifiedAt?: string;
  code?: string;
  message?: string;
}

export interface Announcement {
  timestamp: string;
  title: string;
  body: string;
  priority?: 'high' | 'normal';
}

export interface SpaceUpRegistrationPayload {
  title: string;
  description: string;
  email: string;
  organisation: string;
}

export interface SpaceUpRegistrationResult {
  success: boolean;
  message?: string;
}

export interface WorkshopAvailabilitySnapshot {
  success: boolean;
  remaining: Record<string, number>;
  max: Record<string, number>;
  booked?: Record<string, number>;
  liveData?: boolean;
  message?: string;
}

export interface WorkshopSelectionPayload {
  firstName: string;
  lastName: string;
  email: string;
  slot1?: string;
  slot2?: string;
  confirmNameMismatch?: boolean;
}

export type SubmitWorkshopSelectionResult =
  | { status: 'saved' }
  | { status: 'name_mismatch' }
  | { status: 'workshop_full'; message?: string }
  | { status: 'not_found'; message?: string }
  | { status: 'error'; message?: string };
export interface SaveTourSelectionPayload {
  email: string;
  tourSelected: BvsrTourCode;
  firstName?: string;
  lastName?: string;
  countryOfOrigin?: string;
  nationality?: string;
  confirmNameMismatch?: boolean;
}

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
  tourSelected?: BvsrTourCode;
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

  async fetchRegistrationCapacity(): Promise<RegistrationCapacity | null> {
    if (!this.isConfigured(this.registrationScriptURL)) {
      return null;
    }

    const url =
      this.registrationScriptURL + (this.registrationScriptURL.includes('?') ? '&' : '?') + 'checkCapacity=true';
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 18_000);
      const res = await fetch(url, { method: 'GET', mode: 'cors', signal: ctrl.signal });
      clearTimeout(timer);
      const text = await res.text();
      let data: RegistrationCapacity & { success?: boolean };
      try {
        data = JSON.parse(text) as RegistrationCapacity & { success?: boolean };
      } catch {
        return null;
      }
      if (data.success === false) return null;
      if (typeof data.registeredCount !== 'number' || typeof data.soldOut !== 'boolean') {
        return null;
      }

      const maxTickets = typeof data.maxTickets === 'number' ? data.maxTickets : BVSR_MAX_CONFERENCE_TICKETS;
      const registeredCount = typeof data.registeredCount === 'number' ? data.registeredCount : 0;
      const remaining =
        typeof data.remaining === 'number' ? Math.max(0, data.remaining) : Math.max(0, maxTickets - registeredCount);

      const soldOut = Boolean(data.soldOut) || registeredCount >= maxTickets;

      return { soldOut, registeredCount, maxTickets, remaining };
    } catch {
      return null;
    }
  }

  async register(data: RegistrationData): Promise<RegisterSubmitResult> {
    if (!this.isConfigured(this.registrationScriptURL)) {
      console.warn('Registration script URL not configured. Registration will be simulated.');
      return { success: true, simulated: true };
    }

    const params = new URLSearchParams();
    params.set('action', 'register');
    params.set('firstName', data.firstName.trim());
    params.set('lastName', data.lastName.trim());
    params.set('email', data.email.trim());
    params.set('association', data.association.trim());
    params.set('registrationId', data.registrationId.trim());
    params.set('timestamp', data.timestamp);

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 35_000);

    try {
      const res = await fetch(this.registrationScriptURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: params.toString(),
        mode: 'cors',
        signal: ctrl.signal,
      });

      const text = await res.text();
      let json: { success?: boolean; message?: string; code?: string; registrationId?: string };
      try {
        json = JSON.parse(text);
      } catch {
        console.error('[register] Non-JSON response', text.slice(0, 200));
        throw new Error('Unexpected response from the registration server. Please try again later.');
      }

      if (!json.success) {
        return {
          success: false,
          code: json.code,
          message:
            json.message ||
            'Registration failed. Please verify your details or try again later.',
        };
      }

      return { success: true, registrationId: json.registrationId };
    } catch (e: unknown) {
      console.error('Registration error:', e);
      if (e instanceof Error && e.name === 'AbortError') {
        throw new Error('Registration request timed out. Check your connection and try again.');
      }
      throw e instanceof Error ? e : new Error('Registration failed.');
    } finally {
      clearTimeout(timer);
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


  async fetchTourAvailability(): Promise<TourAvailabilitySnapshot> {
    const fallback = this.buildFallbackTourAvailability_();
    if (!this.isConfigured(this.registrationScriptURL)) {
      return fallback;
    }

    const url =
      this.registrationScriptURL +
      (this.registrationScriptURL.includes('?') ? '&' : '?') +
      'action=tourAvailability';

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 18_000);
    try {
      const res = await fetch(url, { method: 'GET', mode: 'cors', signal: ctrl.signal });
      const text = await res.text();
      let raw: unknown;
      try {
        raw = JSON.parse(text);
      } catch {
        console.warn('[tourAvailability] Non-JSON response; using fallback caps.', text.slice(0, 120));
        return fallback;
      }
      const live = this.normalizeTourAvailabilityPayload_(raw);
      if (live) {
        return live;
      }
      console.warn('[tourAvailability] Unexpected payload; using fallback caps.', raw);
      return fallback;
    } catch (e: unknown) {
      console.warn('[tourAvailability] Request failed; using fallback caps.', e);
      return fallback;
    } finally {
      clearTimeout(timer);
    }
  }

  private buildFallbackTourAvailability_(): TourAvailabilitySnapshot {
    const max: Partial<Record<BvsrTourCode, number>> = {};
    const remaining: Partial<Record<BvsrTourCode, number>> = {};
    for (const c of BVSR_TOUR_CODES) {
      const cap = BVSR_TOUR_MAX_CAPACITY[c];
      max[c] = cap;
      remaining[c] = cap;
    }
    return { success: true, max, remaining, liveData: false };
  }

  private normalizeTourAvailabilityPayload_(raw: unknown): TourAvailabilitySnapshot | null {
    if (!raw || typeof raw !== 'object') {
      return null;
    }
    const o = raw as Record<string, unknown>;
    if (o['success'] === false) {
      return null;
    }
    const rawMax = o['max'];
    const rawRem = o['remaining'];
    if (!rawMax || typeof rawMax !== 'object' || !rawRem || typeof rawRem !== 'object') {
      return null;
    }
    const maxObj = rawMax as Record<string, unknown>;
    const remObj = rawRem as Record<string, unknown>;

    const max: Partial<Record<BvsrTourCode, number>> = {};
    const remaining: Partial<Record<BvsrTourCode, number>> = {};

    for (const c of BVSR_TOUR_CODES) {
      const m = Number(maxObj[c]);
      const r = Number(remObj[c]);
      if (!Number.isFinite(m) || m < 0 || !Number.isFinite(r) || r < 0) {
        return null;
      }
      max[c] = Math.floor(m);
      remaining[c] = Math.floor(r);
    }

    let booked: Partial<Record<BvsrTourCode, number>> | undefined;
    const rawBooked = o['booked'];
    if (rawBooked && typeof rawBooked === 'object') {
      const bObj = rawBooked as Record<string, unknown>;
      booked = {};
      for (const c of BVSR_TOUR_CODES) {
        const b = Number(bObj[c]);
        if (Number.isFinite(b) && b >= 0) {
          booked[c] = Math.floor(b);
        }
      }
    }

    return { success: true, max, remaining, booked, liveData: true };
  }

  async checkTourEligibility(email: string): Promise<TourEligibilityResult> {
    if (!this.isConfigured(this.registrationScriptURL)) {
      throw new Error('Registration service is not configured. Please contact the administrator.');
    }

    const trimmed = email.trim();
    const url =
      this.registrationScriptURL +
      (this.registrationScriptURL.includes('?') ? '&' : '?') +
      'action=checkTourEligibility&email=' +
      encodeURIComponent(trimmed);

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 18_000);
    try {
      const res = await fetch(url, { method: 'GET', mode: 'cors', signal: ctrl.signal });
      const text = await res.text();
      let data: TourEligibilityResult;
      try {
        data = JSON.parse(text) as TourEligibilityResult;
      } catch {
        throw new Error('Unexpected response from server. Please try again later.');
      }
      return data;
    } catch (e: unknown) {
      if (e instanceof Error && e.name === 'AbortError') {
        throw new Error('Request timed out. Check your connection and try again.');
      }
      throw e instanceof Error ? e : new Error('Failed to check tour eligibility.');
    } finally {
      clearTimeout(timer);
    }
  }

  async saveTourSelection(payload: SaveTourSelectionPayload): Promise<SaveTourSelectionResult> {
    if (!this.isConfigured(this.registrationScriptURL)) {
      throw new Error('Registration service is not configured. Please contact the administrator.');
    }

    const params = new URLSearchParams();
    params.set('action', 'saveTourSelection');
    params.set('email', payload.email.trim());
    params.set('tourSelected', payload.tourSelected);
    params.set('confirmNameMismatch', payload.confirmNameMismatch ? 'true' : 'false');
    if (payload.firstName != null && payload.firstName !== '') {
      params.set('firstName', payload.firstName.trim());
    }
    if (payload.lastName != null && payload.lastName !== '') {
      params.set('lastName', payload.lastName.trim());
    }
    if (payload.countryOfOrigin != null && payload.countryOfOrigin !== '') {
      params.set('countryOfOrigin', payload.countryOfOrigin.trim());
    }
    if (payload.nationality != null && payload.nationality !== '') {
      params.set('nationality', payload.nationality.trim());
    }

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
        return { status: 'error', message: 'Unexpected response from server. Please try again later.' };
      }

      if (data.success) {
        return { status: 'saved' };
      }
      if (data.code === 'NAME_MISMATCH') {
        return { status: 'name_mismatch' };
      }
      if (data.code === 'TOUR_FULL' || data.code === 'SOLD_OUT_TOUR') {
        return { status: 'tour_full', message: data.message };
      }
      return { status: 'error', message: data.message || 'Could not save tour selection.' };
    } catch (e: unknown) {
      if (e instanceof Error && e.name === 'AbortError') {
        return { status: 'error', message: 'Request timed out. Check your connection and try again.' };
      }
      throw e instanceof Error ? e : new Error('Tour selection failed.');
    } finally {
      clearTimeout(timer);
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
    if (payload.tourSelected) {
      params.set('tourSelected', payload.tourSelected);
    }

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

  async fetchAnnouncements(): Promise<Announcement[]> {
    if (!this.isConfigured(this.registrationScriptURL)) {
      return [];
    }

    const url =
      this.registrationScriptURL +
      (this.registrationScriptURL.includes('?') ? '&' : '?') +
      'action=getAnnouncements';

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15_000);

    try {
      const res = await fetch(url, { method: 'GET', mode: 'cors', signal: ctrl.signal });
      const text = await res.text();
      let data: { success?: boolean; announcements?: Announcement[]; message?: string };
      try {
        data = JSON.parse(text);
      } catch {
        return [];
      }
      if (!data.success || !Array.isArray(data.announcements)) {
        return [];
      }
      return data.announcements
        .filter(a => a && (a.title || a.body))
        .map(a => ({
          timestamp: String(a.timestamp || ''),
          title: String(a.title || ''),
          body: String(a.body || ''),
          priority: a.priority === 'high' ? 'high' : 'normal'
        }));
    } catch (e) {
      console.warn('[announcements] fetch failed', e);
      return [];
    } finally {
      clearTimeout(timer);
    }
  }

  async submitSpaceUpRegistration(payload: SpaceUpRegistrationPayload): Promise<SpaceUpRegistrationResult> {
    if (!this.isConfigured(this.registrationScriptURL)) {
      throw new Error('Registration service is not configured. Please contact the administrator.');
    }

    const params = new URLSearchParams();
    params.set('action', 'submitSpaceUp');
    params.set('title', payload.title.trim());
    params.set('description', payload.description.trim());
    params.set('email', payload.email.trim());
    params.set('organisation', payload.organisation.trim());
    params.set('timestamp', new Date().toISOString());

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 25_000);
    try {
      const res = await fetch(this.registrationScriptURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: params.toString(),
        mode: 'cors',
        signal: ctrl.signal
      });
      const text = await res.text();
      let data: SpaceUpRegistrationResult;
      try {
        data = JSON.parse(text) as SpaceUpRegistrationResult;
      } catch {
        throw new Error('Unexpected response from server. Please try again later.');
      }
      if (!data.success) {
        throw new Error(data.message || 'Could not submit SpaceUp. Please try again later.');
      }
      return data;
    } catch (e: unknown) {
      if (e instanceof Error && e.name === 'AbortError') {
        throw new Error('Request timed out. Check your connection and try again.');
      }
      throw e instanceof Error ? e : new Error('SpaceUp submission failed.');
    } finally {
      clearTimeout(timer);
    }
  }

  async fetchWorkshopAvailability(): Promise<WorkshopAvailabilitySnapshot | null> {
    if (!this.isConfigured(this.registrationScriptURL)) {
      return null;
    }

    const url =
      this.registrationScriptURL +
      (this.registrationScriptURL.includes('?') ? '&' : '?') +
      'action=workshopAvailability';

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 18_000);
    try {
      const res = await fetch(url, { method: 'GET', mode: 'cors', signal: ctrl.signal });
      const text = await res.text();
      let data: WorkshopAvailabilitySnapshot;
      try {
        data = JSON.parse(text) as WorkshopAvailabilitySnapshot;
      } catch {
        return null;
      }
      if (!data.success) {
        return null;
      }
      return {
        success: true,
        remaining: data.remaining || {},
        max: data.max || {},
        booked: data.booked || {},
        liveData: true
      };
    } catch (e) {
      console.warn('[workshops] availability fetch failed', e);
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  async submitWorkshopSelection(
    payload: WorkshopSelectionPayload
  ): Promise<SubmitWorkshopSelectionResult> {
    if (!this.isConfigured(this.registrationScriptURL)) {
      return { status: 'error', message: 'Registration service is not configured.' };
    }

    const slot1 = (payload.slot1 || '').trim();
    const slot2 = (payload.slot2 || '').trim();
    if (!slot1 && !slot2) {
      return { status: 'error', message: 'Please pick at least one workshop.' };
    }

    const params = new URLSearchParams();
    params.set('action', 'submitWorkshopSelection');
    params.set('firstName', payload.firstName.trim());
    params.set('lastName', payload.lastName.trim());
    params.set('email', payload.email.trim());
    params.set('slot1', slot1);
    params.set('slot2', slot2);
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
        return {
          status: 'error',
          message: 'Unexpected response from server. Please try again later.'
        };
      }

      if (data.success) {
        return { status: 'saved' };
      }
      if (data.code === 'NAME_MISMATCH') {
        return { status: 'name_mismatch' };
      }
      if (data.code === 'WORKSHOP_FULL') {
        return { status: 'workshop_full', message: data.message };
      }
      if (data.code === 'NOT_FOUND') {
        return { status: 'not_found', message: data.message };
      }
      return { status: 'error', message: data.message || 'Could not save workshop selection.' };
    } catch (e: unknown) {
      if (e instanceof Error && e.name === 'AbortError') {
        return {
          status: 'error',
          message: 'Request timed out. Check your connection and try again.'
        };
      }
      if (
        e instanceof TypeError &&
        /failed to fetch|networkerror|load failed/i.test(String((e as TypeError).message))
      ) {
        return {
          status: 'error',
          message:
            'Could not reach the registration server. Check your connection and try again.'
        };
      }
      throw e instanceof Error ? e : new Error('Workshop selection failed.');
    } finally {
      clearTimeout(timer);
    }
  }

  async verifyQRCode(registrationId: string): Promise<VerifyRegistrationResult> {
    if (!this.isConfigured(this.registrationScriptURL)) {
      console.warn('Verification script URL not configured.');
      throw new Error('Verification service is not configured. Please contact the administrator.');
    }

    const trimmed = (registrationId || '').trim();
    if (!trimmed) {
      throw new Error('Please provide a registration ID.');
    }

    const url =
      this.registrationScriptURL +
      (this.registrationScriptURL.includes('?') ? '&' : '?') +
      'action=verifyRegistration&registrationId=' +
      encodeURIComponent(trimmed);

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 20_000);

    try {
      const res = await fetch(url, { method: 'GET', mode: 'cors', signal: ctrl.signal });
      const text = await res.text();
      let data: VerifyRegistrationResult;
      try {
        data = JSON.parse(text) as VerifyRegistrationResult;
      } catch {
        console.error('[verify] Non-JSON response', text.slice(0, 200));
        throw new Error('Unexpected response from the verification server. Please try again later.');
      }

      if (data.success === false) {
        throw new Error(data.message || 'Verification failed. Please try again.');
      }

      return {
        success: true,
        found: !!data.found,
        alreadyVerified: !!data.alreadyVerified,
        firstName: data.firstName,
        lastName: data.lastName,
        association: data.association,
        email: data.email,
        registrationId: data.registrationId || trimmed,
        verifiedAt: data.verifiedAt,
        code: data.code,
        message: data.message
      };
    } catch (e: unknown) {
      if (e instanceof Error && e.name === 'AbortError') {
        throw new Error('Verification request timed out. Check your connection and try again.');
      }
      console.error('QR verification error:', e);
      throw e instanceof Error
        ? e
        : new Error('Failed to verify QR code. Please check the registration ID and try again.');
    } finally {
      clearTimeout(timer);
    }
  }
}
