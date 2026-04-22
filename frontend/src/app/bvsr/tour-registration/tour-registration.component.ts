import { Component, OnInit, ViewChild } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { MaterialModule } from '../../material/material.module';
import { FormBuilder, FormGroup, FormGroupDirective, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../footer/footer.component';
import { SeoService } from '../../services/seo.service';
import { RegistrationService, TourRegistrationPayload } from '../../services/registration.service';

@Component({
  selector: 'app-tour-registration',
  standalone: true,
  imports: [NavbarComponent, MaterialModule, ReactiveFormsModule, CommonModule, FooterComponent],
  templateUrl: './tour-registration.component.html',
  styleUrls: ['./tour-registration.component.css']
})
export class TourRegistrationComponent implements OnInit {
  @ViewChild(FormGroupDirective) private formGroupDir?: FormGroupDirective;

  form: FormGroup;
  submitting = false;
  successMsg = '';
  errorMsg = '';
  nameMismatchAwaitingConfirm = false;

  readonly yesNoOptions: Array<'Yes' | 'No'> = ['Yes', 'No'];

  constructor(
    private fb: FormBuilder,
    private seoService: SeoService,
    private registrationService: RegistrationService
  ) {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(120)]],
      lastName: ['', [Validators.required, Validators.maxLength(120)]],
      email: ['', [Validators.required, Validators.email]],
      countryOfOrigin: ['', [Validators.required, Validators.maxLength(120)]],
      nationality: ['', [Validators.required, Validators.maxLength(120)]],
      may14: ['No' as const, Validators.required],
      may15: ['No' as const, Validators.required],
      may16: ['No' as const, Validators.required],
      may17: ['No' as const, Validators.required]
    });
  }

  ngOnInit(): void {
    this.seoService.updateSEO({
      title: 'Tour & attendance · BVSR Conference 2026'
    });
  }

  private payloadFromForm(confirmNameMismatch: boolean): TourRegistrationPayload {
    const v = this.form.getRawValue();
    return {
      firstName: v.firstName,
      lastName: v.lastName,
      email: v.email,
      countryOfOrigin: v.countryOfOrigin,
      nationality: v.nationality,
      may14: v.may14,
      may15: v.may15,
      may16: v.may16,
      may17: v.may17,
      confirmNameMismatch
    };
  }

  private afterSaved(): void {
    this.successMsg = 'Your details have been saved.';
    this.nameMismatchAwaitingConfirm = false;
    const empty = {
      firstName: '',
      lastName: '',
      email: '',
      countryOfOrigin: '',
      nationality: '',
      may14: 'No' as const,
      may15: 'No' as const,
      may16: 'No' as const,
      may17: 'No' as const
    };

    this.formGroupDir?.resetForm(empty);
    if (!this.formGroupDir) {
      this.form.reset(empty);
      this.form.markAsPristine();
      this.form.markAsUntouched();
    }
    setTimeout(() => (this.successMsg = ''), 8000);
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMsg = 'Please fill in all required fields.';
      return;
    }

    this.submitting = true;
    this.errorMsg = '';
    this.successMsg = '';

    try {
      const result = await this.registrationService.submitTourRegistration(this.payloadFromForm(false));
      if (result.status === 'name_mismatch') {
        this.nameMismatchAwaitingConfirm = true;
        this.formGroupDir?.resetForm(this.form.getRawValue());
        return;
      }
      this.afterSaved();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Submission failed. Please try again.';
      this.errorMsg =
        msg.includes('abort') || msg.includes('timed out')
          ? 'Request timed out. Check your connection and try again.'
          : msg;
    } finally {
      this.submitting = false;
    }
  }

  onVerifyNamesAgain(): void {
    this.nameMismatchAwaitingConfirm = false;
    this.errorMsg = '';
    this.successMsg = '';
    this.formGroupDir?.resetForm(this.form.getRawValue());
  }

  async onSaveWithEnteredName(): Promise<void> {
    if (this.form.invalid) {
      return;
    }
    this.submitting = true;
    this.errorMsg = '';
    this.successMsg = '';
    try {
      const result = await this.registrationService.submitTourRegistration(this.payloadFromForm(true));
      if (result.status === 'saved') {
        this.afterSaved();
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Submission failed. Please try again.';
      this.errorMsg =
        msg.includes('abort') || msg.includes('timed out')
          ? 'Request timed out. Check your connection and try again.'
          : msg;
    } finally {
      this.submitting = false;
    }
  }
}
