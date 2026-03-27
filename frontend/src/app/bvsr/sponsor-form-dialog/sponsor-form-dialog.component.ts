import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material/material.module';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-sponsor-form-dialog',
  standalone: true,
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  templateUrl: './sponsor-form-dialog.component.html',
  styleUrls: ['./sponsor-form-dialog.component.css']
})
export class SponsorFormDialogComponent {
  form: FormGroup;
  submitting = false;
  successMsg = '';
  errorMsg = '';

  private scriptURL =
    'https://script.google.com/macros/s/AKfycbzg8tFMijrWWNMRzKnHNsWUaLvBuHDjWz12CI4s6qSUmqsxyZfm0N3owqKy6lWGsCHnLg/exec';

  constructor(private fb: FormBuilder, private dialogRef: MatDialogRef<SponsorFormDialogComponent>) {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      companyName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      sponsorTier: ['', Validators.required],
      message: ['']
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const raw = this.form.getRawValue();
    const formData = new FormData();
    Object.keys(raw).forEach((key) => {
      const value = raw[key as keyof typeof raw];
      if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });

    fetch(this.scriptURL, { method: 'POST', body: formData })
      .then(() => {
        this.successMsg = 'Form submitted successfully!';
        this.submitting = false;

        setTimeout(() => {
          this.successMsg = '';
          this.dialogRef.close();
        }, 2000);
      })
      .catch((err) => {
        console.error('Error!', err);
        this.errorMsg = 'Submission failed. Please try again.';
        this.submitting = false;
      });
  }
}
