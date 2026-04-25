import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { MaterialModule } from '../../material/material.module';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FooterComponent } from "../footer/footer.component";
import { SeoService } from '../../services/seo.service';
import { RegistrationService } from '../../services/registration.service';
import { I18nService } from '../../services/i18n.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-cv-upload',
  standalone: true,
  imports: [NavbarComponent, MaterialModule, ReactiveFormsModule, CommonModule, FooterComponent, TranslatePipe],
  templateUrl: './cv-upload.component.html',
  styleUrls: ['./cv-upload.component.css']
})
export class CvUploadComponent implements OnInit {
  uploadForm: FormGroup;
  selectedFile: File | null = null;
  submitting = false;
  successMsg = '';
  errorMsg = '';

  constructor(
    private fb: FormBuilder,
    private seoService: SeoService,
    private registrationService: RegistrationService,
    private i18n: I18nService
  ) {
    this.uploadForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {
    this.seoService.updateSEO({
      title: 'Upload CV · BVSR Conference 2026'
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        this.errorMsg = this.i18n.translate('cv.fileTooLarge');
        return;
      }
      this.selectedFile = file;
      this.errorMsg = '';
    }
  }

  async onSubmit() {
    if (this.uploadForm.invalid || !this.selectedFile) {
      this.errorMsg = this.i18n.translate('cv.needFile');
      return;
    }

    this.submitting = true;
    this.errorMsg = '';
    this.successMsg = '';

    try {
      await this.registrationService.uploadCVByEmail(
        this.selectedFile,
        this.uploadForm.get('email')?.value
      );

      this.successMsg = this.i18n.translate('cv.success');
      this.uploadForm.reset();
      this.selectedFile = null;

      setTimeout(() => {
        this.successMsg = '';
      }, 5000);

    } catch (error: any) {
      console.error('Upload error:', error);
      this.errorMsg = error.message || this.i18n.translate('cv.uploadFailedGeneric');
    } finally {
      this.submitting = false;
    }
  }
}
