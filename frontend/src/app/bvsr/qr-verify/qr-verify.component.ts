import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { MaterialModule } from '../../material/material.module';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FooterComponent } from "../footer/footer.component";
import { SeoService } from '../../services/seo.service';
import { RegistrationService } from '../../services/registration.service';

@Component({
  selector: 'app-qr-verify',
  standalone: true,
  imports: [NavbarComponent, MaterialModule, ReactiveFormsModule, CommonModule, FooterComponent],
  templateUrl: './qr-verify.component.html',
  styleUrls: ['./qr-verify.component.css']
})
export class QrVerifyComponent implements OnInit {
  verifyForm: FormGroup;
  verifying = false;
  verificationResult: any = null;
  errorMsg = '';

  constructor(
    private fb: FormBuilder,
    private seoService: SeoService,
    private registrationService: RegistrationService
  ) {
    this.verifyForm = this.fb.group({
      registrationId: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.seoService.updateSEO({
      title: 'Verify QR Code · BVSR Conference 2026'
    });
  }

  async onSubmit() {
    if (this.verifyForm.invalid) {
      this.errorMsg = 'Please enter a registration ID.';
      return;
    }

    this.verifying = true;
    this.errorMsg = '';
    this.verificationResult = null;

    try {
      const result = await this.registrationService.verifyQRCode(
        this.verifyForm.get('registrationId')?.value
      );

      this.verificationResult = {
        valid: true,
        registrationId: this.verifyForm.get('registrationId')?.value,
        message: 'Registration verified successfully!'
      };

      // Reset form after successful verification
      setTimeout(() => {
        this.verifyForm.reset();
        this.verificationResult = null;
      }, 5000);

    } catch (error: any) {
      this.verificationResult = {
        valid: false,
        message: error.message || 'Invalid registration ID. Please check and try again.'
      };
    } finally {
      this.verifying = false;
    }
  }

  onScanQR() {
    // This would integrate with a QR scanner library
    // For now, we'll use manual entry
    alert('QR scanner integration coming soon. Please enter the registration ID manually.');
  }
}
