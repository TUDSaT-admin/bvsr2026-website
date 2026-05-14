import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';

import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { MaterialModule } from '../../material/material.module';
import { SeoService } from '../../services/seo.service';
import {
  RegisteredEventsResult,
  RegistrationService
} from '../../services/registration.service';

type LookupMode = 'qr' | 'email';

interface DayRow {
  label: string;
  date: string;
  attending: boolean;
}

const TOUR_NAMES: Record<string, string> = {
  GSI: 'GSI Facility Tour',
  ESOC1: 'ESOC Visit – Slot 1',
  ESOC2: 'ESOC Visit – Slot 2',
  CASIMAR: 'CASIMAR Workday',
  CITY: 'Darmstadt City Tour'
};

@Component({
  selector: 'app-events-registered',
  standalone: true,
  imports: [
    NavbarComponent,
    FooterComponent,
    MaterialModule,
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './events-registered.component.html',
  styleUrls: ['./events-registered.component.css']
})
export class EventsRegisteredComponent implements OnInit, OnDestroy {
  @ViewChild('videoEl') videoEl?: ElementRef<HTMLVideoElement>;

  mode: LookupMode = 'qr';

  emailForm: FormGroup;
  looking = false;
  errorMsg = '';

  result: RegisteredEventsResult | null = null;
  notFound = false;
  scannedRegistrationId = '';

  scannerActive = false;
  scannerStarting = false;
  scannerError = '';

  private codeReader: BrowserMultiFormatReader;
  private scannerControls: IScannerControls | null = null;
  private lastScannedAt = 0;

  constructor(
    private fb: FormBuilder,
    private seoService: SeoService,
    private registrationService: RegistrationService
  ) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    const hints = new Map<DecodeHintType, unknown>();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);
    hints.set(DecodeHintType.TRY_HARDER, true);
    this.codeReader = new BrowserMultiFormatReader(hints);
  }

  ngOnInit(): void {
    this.seoService.updateSEO({
      title: 'Your Events · BVSR Conference 2026'
    });
  }

  ngOnDestroy(): void {
    this.stopScanner();
  }

  setMode(mode: LookupMode): void {
    if (this.mode === mode) return;
    this.mode = mode;
    this.errorMsg = '';
    if (mode === 'email') {
      this.stopScanner();
    }
  }

  async onScanQR(): Promise<void> {
    if (this.scannerActive) {
      this.stopScanner();
      return;
    }
    await this.startScanner();
  }

  async onLookupByEmail(): Promise<void> {
    if (this.emailForm.invalid) {
      this.errorMsg = 'Please enter a valid email address.';
      this.emailForm.markAllAsTouched();
      return;
    }
    const email = String(this.emailForm.get('email')?.value || '').trim();
    await this.lookup({ email });
  }

  reset(): void {
    this.result = null;
    this.notFound = false;
    this.errorMsg = '';
    this.scannedRegistrationId = '';
    this.emailForm.reset();
  }

  private async startScanner(): Promise<void> {
    this.scannerError = '';
    this.errorMsg = '';

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      this.scannerError =
        'Camera access is not available. Open the site over HTTPS in Chrome or Safari and try again.';
      this.scannerActive = true;
      return;
    }

    this.scannerStarting = true;
    this.scannerActive = true;

    await Promise.resolve();

    const video = this.videoEl?.nativeElement;
    if (!video) {
      this.scannerStarting = false;
      this.scannerActive = false;
      this.scannerError = 'Camera surface unavailable. Please reload the page.';
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: { facingMode: { ideal: 'environment' } },
        audio: false
      };

      this.scannerControls = await this.codeReader.decodeFromConstraints(
        constraints,
        video,
        (result) => {
          if (result) {
            const text = result.getText();
            const now = Date.now();
            if (now - this.lastScannedAt < 2000) return;
            this.lastScannedAt = now;
            this.stopScanner();
            void this.lookup({ registrationId: text });
          }
        }
      );
      this.scannerStarting = false;
    } catch (e: unknown) {
      this.scannerStarting = false;
      this.scannerActive = false;
      const err = e as { name?: string; message?: string };
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        this.scannerError =
          'Camera access was denied. Allow camera permission in your browser settings and try again.';
      } else if (err?.name === 'NotFoundError' || err?.name === 'OverconstrainedError') {
        this.scannerError = 'No camera found on this device.';
      } else if (err?.name === 'NotReadableError') {
        this.scannerError = 'Camera is already in use by another application.';
      } else if (err?.name === 'SecurityError') {
        this.scannerError =
          'Camera blocked by the browser. Make sure the site is loaded over HTTPS.';
      } else {
        this.scannerError = err?.message || 'Could not start the camera. Please try again.';
      }
      console.error('Scanner start error:', e);
    }
  }

  private stopScanner(): void {
    try {
      this.scannerControls?.stop();
    } catch (e) {
      console.warn('Scanner stop error:', e);
    }
    this.scannerControls = null;
    this.scannerActive = false;
    this.scannerStarting = false;
  }

  private async lookup(opts: { email?: string; registrationId?: string }): Promise<void> {
    this.looking = true;
    this.errorMsg = '';
    this.result = null;
    this.notFound = false;
    this.scannedRegistrationId = (opts.registrationId || '').trim();

    try {
      const res = await this.registrationService.fetchRegisteredEvents(opts);
      if (!res.found) {
        this.notFound = true;
        this.result = res;
        return;
      }
      this.result = res;
    } catch (error: unknown) {
      const err = error as { message?: string };
      this.errorMsg = err?.message || 'Failed to look up your registration. Please try again.';
    } finally {
      this.looking = false;
    }
  }

  tourDisplayName(code?: string): string {
    if (!code) return '';
    const trimmed = code.trim();
    return TOUR_NAMES[trimmed] || trimmed;
  }

  isYes(value: string | undefined): boolean {
    return String(value || '').trim().toLowerCase() === 'yes';
  }

  get hasAnyEvent(): boolean {
    if (!this.result || !this.result.found) return false;
    const r = this.result;
    return !!(
      (r.tourSelected && r.tourSelected.trim()) ||
      (r.workshopSlot1 && r.workshopSlot1.trim()) ||
      (r.workshopSlot2 && r.workshopSlot2.trim()) ||
      this.isYes(r.may14) ||
      this.isYes(r.may15) ||
      this.isYes(r.may16) ||
      this.isYes(r.may17)
    );
  }

  get conferenceDays(): DayRow[] {
    const r = this.result;
    if (!r) return [];
    return [
      { label: 'May 14', date: 'Thu, 14 May 2026', attending: this.isYes(r.may14) },
      { label: 'May 15', date: 'Fri, 15 May 2026', attending: this.isYes(r.may15) },
      { label: 'May 16', date: 'Sat, 16 May 2026', attending: this.isYes(r.may16) },
      { label: 'May 17', date: 'Sun, 17 May 2026', attending: this.isYes(r.may17) }
    ];
  }

  get workshopsBooked(): Array<{ slot: string; name: string }> {
    const r = this.result;
    if (!r) return [];
    const items: Array<{ slot: string; name: string }> = [];
    const w1 = (r.workshopSlot1 || '').trim();
    const w2 = (r.workshopSlot2 || '').trim();
    if (w1 && w2 && w1 === w2) {
      items.push({ slot: 'Slot 1 & 2 (full afternoon)', name: w1 });
    } else {
      if (w1) items.push({ slot: 'Slot 1', name: w1 });
      if (w2) items.push({ slot: 'Slot 2', name: w2 });
    }
    return items;
  }
}
