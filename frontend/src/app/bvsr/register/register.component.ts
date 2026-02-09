import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../material/material.module';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FooterComponent } from "../footer/footer.component";
import { SeoService } from '../../services/seo.service';
import { RegistrationService } from '../../services/registration.service';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [NavbarComponent, RouterModule, MaterialModule, ReactiveFormsModule, CommonModule, FooterComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registrationForm: FormGroup;
  currentStep = 1;
  totalSteps = 2;
  submitting = false;
  successMsg = '';
  errorMsg = '';
  selectedFile: File | null = null;
  registrationId: string = '';
  registrationComplete = false;
  registrationData: any = null;
  qrCodeDataUrl: string = '';

  associations = [
    'FAR eV',
    'Auxspace eV',
    'KSat eV',
    'BEARS eV',
    'Moon Experts eV',
    'WARR eV',
    'Space Team Aachen (STA) eV',
    'SeeSat eV',
    'ERIG eV',
    'ASTRA eV',
    'Soundspace eV',
    'WüSpace eV',
    'SPROG eV',
    'ROCKIT eV',
    'STAR Dresden eV',
    'TU Wien Space Team',
    'TUDSaT eV',
    'HyEnD eV',
    'Aerospace Team Graz (ASTG)',
    'Other'
  ];

  constructor(
    private fb: FormBuilder,
    private seoService: SeoService,
    private registrationService: RegistrationService
  ) {
    this.registrationForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      association: ['', Validators.required],
      otherAssociation: [''],
      uploadCV: [false],
      cvFile: [null]
    });

    // Show otherAssociation field only when "Others" is selected
    this.registrationForm.get('association')?.valueChanges.subscribe(value => {
      if (value === 'Others') {
        this.registrationForm.get('otherAssociation')?.setValidators([Validators.required]);
      } else {
        this.registrationForm.get('otherAssociation')?.clearValidators();
        this.registrationForm.get('otherAssociation')?.setValue('');
      }
      this.registrationForm.get('otherAssociation')?.updateValueAndValidity();
    });
  }

  ngOnInit() {
    this.seoService.updateSEO({
      title: 'Register · BVSR Conference 2026'
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        this.errorMsg = 'File size must be less than 5MB';
        return;
      }
      this.selectedFile = file;
      this.registrationForm.patchValue({ cvFile: file });
      this.errorMsg = '';
    }
  }

  nextStep() {
    if (this.currentStep === 1) {
      // Validate step 1 fields
      const step1Fields = ['firstName', 'lastName', 'email', 'association'];
      let isValid = true;

      step1Fields.forEach(field => {
        const control = this.registrationForm.get(field);
        if (control && !control.valid) {
          control.markAsTouched();
          isValid = false;
        }
      });

      // Check if otherAssociation is required
      if (this.registrationForm.get('association')?.value === 'Others') {
        const otherControl = this.registrationForm.get('otherAssociation');
        if (otherControl && !otherControl.valid) {
          otherControl.markAsTouched();
          isValid = false;
        }
      }

      if (isValid) {
        this.currentStep = 2;
      }
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  async onSubmit() {
    if (this.registrationForm.invalid) {
      this.errorMsg = 'Please fill in all required fields correctly.';
      return;
    }

    this.submitting = true;
    this.errorMsg = '';
    this.successMsg = '';

    try {
      const formData = this.registrationForm.value;

      // Generate unique registration ID
      this.registrationId = this.generateRegistrationId();

      // Prepare registration data
      const registrationData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        association: formData.association === 'Others' ? formData.otherAssociation : formData.association,
        registrationId: this.registrationId,
        timestamp: new Date().toISOString()
      };

      // Submit registration
      const result = await this.registrationService.register(registrationData);

      // Upload CV if provided
      if (this.selectedFile && formData.uploadCV) {
        await this.registrationService.uploadCV(this.selectedFile, formData.email, this.registrationId);
      }

      // Generate QR code for display
      this.qrCodeDataUrl = await QRCode.toDataURL(this.registrationId, {
        width: 200,
        margin: 1
      });

      // Store registration data for success page
      this.registrationData = registrationData;
      this.registrationComplete = true;
      this.currentStep = 3; // Move to success step

      // Generate and download PDF
      const pdfBlob = await this.generateAndDownloadPDF(registrationData);

      // Send confirmation email with PDF attachment
      await this.registrationService.sendConfirmationEmail(registrationData, pdfBlob);

    } catch (error: any) {
      console.error('Registration error:', error);
      this.errorMsg = error.message || 'Registration failed. Please try again.';
    } finally {
      this.submitting = false;
    }
  }

  generateRegistrationId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `BVSR2026-${timestamp}-${random}`;
  }

  async downloadPDF() {
    if (!this.registrationData) return;
    await this.generateAndDownloadPDF(this.registrationData);
  }

  async generateAndDownloadPDF(data: any): Promise<Blob> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;

    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('BVSR Conference 2026', pageWidth / 2, margin + 10, { align: 'center' });

    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text('Registration Pass', pageWidth / 2, margin + 25, { align: 'center' });

    // Details
    doc.setFontSize(12);
    let yPos = margin + 45;

    doc.setFont('helvetica', 'bold');
    doc.text('Name:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(`${data.firstName} ${data.lastName}`, margin + 30, yPos);

    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Email:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(data.email, margin + 30, yPos);

    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Association:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(data.association, margin + 40, yPos);

    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Registration ID:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(data.registrationId, margin + 50, yPos);

    // Generate QR Code
    try {
      const qrDataUrl = await QRCode.toDataURL(data.registrationId, {
        width: 100,
        margin: 1
      });

      // Add QR code to PDF (center right)
      const qrSize = 60;
      const qrX = pageWidth - margin - qrSize;
      const qrY = margin + 50;
      doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

      // Add text below QR code
      doc.setFontSize(10);
      doc.text('Scan for verification', qrX + qrSize / 2, qrY + qrSize + 5, { align: 'center' });
    } catch (err) {
      console.error('QR code generation error:', err);
    }

    // Footer
    doc.setFontSize(10);
    doc.text('Please bring this pass to the conference', pageWidth / 2, pageHeight - margin, { align: 'center' });
    doc.text('Darmstadt · May 14–17, 2026', pageWidth / 2, pageHeight - margin + 10, { align: 'center' });

    // Get PDF as blob
    const pdfBlob = doc.output('blob');

    // Download PDF
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BVSR2026-Pass-${data.registrationId}.pdf`;
    link.click();
    URL.revokeObjectURL(url);

    return pdfBlob;
  }
}
