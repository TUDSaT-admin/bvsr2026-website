import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { MaterialModule } from '../../material/material.module';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FooterComponent } from "../footer/footer.component";
import { SeoService } from '../../services/seo.service';
import { RegistrationService, VerifyRegistrationResult } from '../../services/registration.service';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';

type VerificationView = {
  state: 'valid_new' | 'valid_already' | 'invalid';
  title: string;
  message: string;
  firstName?: string;
  lastName?: string;
  association?: string;
  registrationId?: string;
  verifiedAt?: string;
};

@Component({
  selector: 'app-qr-verify',
  standalone: true,
  imports: [NavbarComponent, MaterialModule, ReactiveFormsModule, CommonModule, FooterComponent],
  templateUrl: './qr-verify.component.html',
  styleUrls: ['./qr-verify.component.css']
})
export class QrVerifyComponent implements OnInit, OnDestroy {
  @ViewChild('videoEl') videoEl?: ElementRef<HTMLVideoElement>;

  verifyForm: FormGroup;
  verifying = false;
  verificationResult: VerificationView | null = null;
  errorMsg = '';

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
    this.verifyForm = this.fb.group({
      registrationId: ['', [Validators.required]]
    });

    const hints = new Map<DecodeHintType, unknown>();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);
    hints.set(DecodeHintType.TRY_HARDER, true);
    this.codeReader = new BrowserMultiFormatReader(hints);
  }

  ngOnInit() {
    this.seoService.updateSEO({
      title: 'Verify QR Code · BVSR Conference 2026'
    });
  }

  ngOnDestroy() {
    this.stopScanner();
  }

  async onSubmit() {
    if (this.verifyForm.invalid) {
      this.errorMsg = 'Please enter a registration ID.';
      return;
    }
    const id = String(this.verifyForm.get('registrationId')?.value || '').trim();
    await this.verifyRegistrationId(id);
  }

  async onScanQR() {
    if (this.scannerActive) {
      this.stopScanner();
      return;
    }
    await this.startScanner();
  }

  resetResult() {
    this.verificationResult = null;
    this.errorMsg = '';
    this.verifyForm.reset();
  }

  private async startScanner() {
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
        (result, err) => {
          if (result) {
            const text = result.getText();
            const now = Date.now();
            // De-bounce: ignore repeated decodes within 2 seconds.
            if (now - this.lastScannedAt < 2000) return;
            this.lastScannedAt = now;
            this.stopScanner();
            this.verifyForm.patchValue({ registrationId: text });
            void this.verifyRegistrationId(text);
          }
          // err is expected continuously while no QR is in frame; ignore.
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

  private stopScanner() {
    try {
      this.scannerControls?.stop();
    } catch (e) {
      console.warn('Scanner stop error:', e);
    }
    this.scannerControls = null;
    this.scannerActive = false;
    this.scannerStarting = false;
  }

  private async verifyRegistrationId(rawId: string) {
    const id = rawId.trim();
    if (!id) {
      this.errorMsg = 'Please enter or scan a registration ID.';
      return;
    }

    this.verifying = true;
    this.errorMsg = '';
    this.verificationResult = null;

    try {
      const result: VerifyRegistrationResult = await this.registrationService.verifyQRCode(id);

      if (!result.found) {
        this.verificationResult = {
          state: 'invalid',
          title: 'Invalid registration',
          message:
            result.message ||
            'This QR code does not match any registration in our records.',
          registrationId: id
        };
        return;
      }

      this.verificationResult = {
        state: result.alreadyVerified ? 'valid_already' : 'valid_new',
        title: result.alreadyVerified ? 'Already checked in' : 'Verified successfully',
        message: result.alreadyVerified
          ? 'This pass has already been scanned and is valid.'
          : 'Welcome! This pass is now marked as checked in.',
        firstName: result.firstName,
        lastName: result.lastName,
        association: result.association,
        registrationId: result.registrationId || id,
        verifiedAt: result.verifiedAt
      };
    } catch (error: unknown) {
      const err = error as { message?: string };
      this.verificationResult = {
        state: 'invalid',
        title: 'Verification failed',
        message: err?.message || 'Invalid registration ID. Please check and try again.',
        registrationId: id
      };
    } finally {
      this.verifying = false;
    }
  }

  formatVerifiedAt(value?: string): string {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    try {
      return new Intl.DateTimeFormat('de-DE', {
        timeZone: 'Europe/Berlin',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZoneName: 'short'
      }).format(d);
    } catch {
      return d.toLocaleString();
    }
  }
}
