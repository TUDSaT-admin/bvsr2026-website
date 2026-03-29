import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { MaterialModule } from '../../material/material.module';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FooterComponent } from "../footer/footer.component";
import { SeoService } from '../../services/seo.service';
import { RegistrationService } from '../../services/registration.service';

@Component({
  selector: 'app-cv-upload',
  standalone: true,
  imports: [NavbarComponent, MaterialModule, ReactiveFormsModule, CommonModule, FooterComponent],
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
    private registrationService: RegistrationService
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
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        this.errorMsg = 'File size must be less than 5MB';
        return;
      }
      this.selectedFile = file;
      this.errorMsg = '';
    }
  }

  async onSubmit() {
    if (this.uploadForm.invalid || !this.selectedFile) {
      this.errorMsg = 'Please provide a valid email and select a file.';
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

      this.successMsg = 'CV uploaded successfully!';
      this.uploadForm.reset();
      this.selectedFile = null;

      setTimeout(() => {
        this.successMsg = '';
      }, 5000);

    } catch (error: any) {
      console.error('Upload error:', error);
      this.errorMsg = error.message || 'Failed to upload CV. Please try again.';
    } finally {
      this.submitting = false;
    }
  }
}
