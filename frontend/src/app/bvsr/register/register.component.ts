import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../material/material.module';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FooterComponent } from "../footer/footer.component";
import { SeoService } from '../../services/seo.service';
import { BVSR_MAX_CONFERENCE_TICKETS, RegistrationCapacity, RegistrationService } from '../../services/registration.service';
import { TicketService } from '../../services/ticket.service';
import { MatDialog } from '@angular/material/dialog';
import { TourRegistrationPromptDialogComponent } from './tour-registration-prompt-dialog/tour-registration-prompt-dialog.component';
import QRCode from 'qrcode';

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

  capacityLoading = true;
  registrationSoldOut = false;
  capacity: RegistrationCapacity | null = null;

  readonly maxTicketsUi = BVSR_MAX_CONFERENCE_TICKETS;

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
    'Sundspace eV',
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
    private registrationService: RegistrationService,
    private ticketService: TicketService,
    private dialog: MatDialog
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
    void this.loadRegistrationCapacity();
  }

  async loadRegistrationCapacity() {
    this.capacityLoading = true;
    const cap = await this.registrationService.fetchRegistrationCapacity();
    this.capacityLoading = false;
    this.capacity = cap;
    if (cap?.soldOut) {
      this.registrationSoldOut = true;
      this.registrationForm.disable({ emitEvent: false });
    }
  }

  private setSoldOutFromServer(message?: string) {
    this.registrationSoldOut = true;
    this.registrationForm.disable({ emitEvent: false });
    this.errorMsg = message || `Conference registration is sold out. All ${BVSR_MAX_CONFERENCE_TICKETS} passes have been allocated.`;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        this.errorMsg = 'File size must be less than 5MB';
        return;
      }
      this.selectedFile = file;
      this.registrationForm.patchValue({ cvFile: file });
      this.errorMsg = '';
    }
  }

  nextStep() {
    if (this.capacityLoading || this.registrationSoldOut) {
      return;
    }

    if (this.currentStep === 1) {
      const step1Fields = ['firstName', 'lastName', 'email', 'association'];
      let isValid = true;

      step1Fields.forEach(field => {
        const control = this.registrationForm.get(field);
        if (control && !control.valid) {
          control.markAsTouched();
          isValid = false;
        }
      });

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
    if (this.registrationSoldOut) {
      return;
    }
    if (this.registrationForm.invalid) {
      this.errorMsg = 'Please fill in all required fields correctly.';
      return;
    }

    this.submitting = true;
    this.errorMsg = '';
    this.successMsg = '';

    try {
      const refreshed = await this.registrationService.fetchRegistrationCapacity();
      if (refreshed?.soldOut) {
        this.capacity = refreshed;
        this.setSoldOutFromServer();
        return;
      }

      const formData = this.registrationForm.value;

      // here we generate unique registration ID @tyler
      this.registrationId = this.generateRegistrationId();

      // to prepare registration data @tyler
      const registrationData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        association: formData.association === 'Others' ? formData.otherAssociation : formData.association,
        registrationId: this.registrationId,
        timestamp: new Date().toISOString()
      };

      const regResult = await this.registrationService.register(registrationData);

      if (!regResult.success) {
        if (regResult.code === 'SOLD_OUT') {
          this.setSoldOutFromServer(regResult.message);
        } else if (regResult.message === 'Email already registered') {
          this.errorMsg = regResult.message;
        } else {
          this.errorMsg = regResult.message || 'Registration failed. Please try again.';
        }
        return;
      }

      //sometimes CV upload is very slow (large base64 POST to Apps Script). Do not block the success screen.
      if (this.selectedFile && formData.uploadCV) {
        void this.registrationService
          .uploadCV(this.selectedFile, formData.email, this.registrationId)
          .then((r) => {
            if (!r?.success) console.warn('[register] CV upload finished with issues', r);
          })
          .catch((e) => console.error('[register] CV upload error', e));
      }

      // Generate QR code for display
      this.qrCodeDataUrl = await QRCode.toDataURL(this.registrationId, {
        width: 200,
        margin: 1
      });

      // Store registration data for success page
      this.registrationData = registrationData;
      this.registrationComplete = true;
      this.currentStep = 3;

      // Generate and download PDF
      await this.generateAndDownloadPDF(registrationData);

      setTimeout(() => {
        this.dialog.open(TourRegistrationPromptDialogComponent, {
          width: 'min(640px, 94vw)',
          maxHeight: '90vh',
          panelClass: 'bvsr-tour-dialog',
          backdropClass: 'bvsr-tour-dialog-backdrop',
          autoFocus: 'dialog',
          data: {
            email: registrationData.email,
            firstName: registrationData.firstName,
            lastName: registrationData.lastName
          }
        });
      }, 0);

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
    return this.ticketService.generateAndDownloadTicket({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      association: data.association,
      registrationId: data.registrationId
    });
  }
}
