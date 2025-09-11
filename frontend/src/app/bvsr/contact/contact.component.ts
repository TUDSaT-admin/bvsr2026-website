import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../material/material.module';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FooterComponent } from "../footer/footer.component";

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [NavbarComponent, RouterModule, MaterialModule, ReactiveFormsModule, CommonModule, FooterComponent],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {
  form: FormGroup;
  submitting = false;
  successMsg = '';
  errorMsg = '';

  private scriptURL = 'https://script.google.com/macros/s/AKfycbzpHFeCwTOemg62tM5CWmBGrPw3T7TUqqWOVMHKlLiJshYX6wH5tenjWzM2J76PaBWzAw/exec';

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      questions: ['']
    });
  }

  ngOnInit() {
    document.title = "Contact · BVSR Conference 2026";
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.submitting = true;
    const formData = new FormData();
    Object.keys(this.form.value).forEach((key) => {
      formData.append(key, this.form.value[key]);
    });

    fetch(this.scriptURL, { method: 'POST', body: formData })
      .then(() => {
        this.successMsg = '✅ Message sent successfully!';
        this.form.reset();
        this.submitting = false;
        setTimeout(() => (this.successMsg = ''), 5000);
      })
      .catch((err) => {
        console.error('Error!', err);
        this.errorMsg = '❌ Submission failed. Please try again.';
        this.submitting = false;
      });
  }
}
