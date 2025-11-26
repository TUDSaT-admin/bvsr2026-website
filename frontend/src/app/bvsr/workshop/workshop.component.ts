import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn, ReactiveFormsModule } from '@angular/forms';
import { NavbarComponent } from "../navbar/navbar.component";
import { FooterComponent } from "../footer/footer.component";

interface Workshop {
  id: string;
  slot: number;
  time: string;
  title: string;
  max: number | null;       // null for unlimited (dont remove the comments)
  seatsLeft: number | null; // for limited workshops
  registered: number;
}

@Component({
  selector: 'app-workshop',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent, FooterComponent],
  templateUrl: './workshop.component.html',
  styleUrls: ['./workshop.component.css']
})
export class WorkshopComponent implements OnInit {
  readonly ASSET_ZIP_URL = '/mnt/data/tudsat.zip';

  workshops: Workshop[] = [
    { id: 'w1', slot: 1, time: '1100–1400', title: 'How to design a high power rocket', max: 20, seatsLeft: 20, registered: 0 },
    { id: 'w2', slot: 1, time: '1100–1400', title: 'Hybrid propulsion', max: null, seatsLeft: null, registered: 0 },
    { id: 'w3', slot: 2, time: '1500–1800', title: 'Fusion', max: 20, seatsLeft: 20, registered: 0 },
    { id: 'w4', slot: 2, time: '1500–1800', title: 'KiCAD', max: null, seatsLeft: null, registered: 0 }
  ];

  SHEETS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzAxob4Nnh_FbfzI6y5M5NQh6kDB_nqXPOpPC3RkRFw0HGCHtS3ZF0tOkiBg87BvNglQA/exec';

  form: FormGroup;
  submitting = false;
  serverMessage = '';
  serverError = false;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(120)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
      slot1Choice: [''],
      slot2Choice: [''],
      agree: [false, Validators.requiredTrue]
    }, { validators: this.slotValidator() });
  }

  ngOnInit(): void {
    document.title = 'Workshops · BVSR Conference 2026';
    this.loadCounts();
  }

  get name() { return this.form.get('name'); }
  get email() { return this.form.get('email'); }
  get slot1Choice() { return this.form.get('slot1Choice'); }
  get slot2Choice() { return this.form.get('slot2Choice'); }
  get agree() { return this.form.get('agree'); }

  get slot1Workshops(): Workshop[] { return this.workshops.filter(w => w.slot === 1); }
  get slot2Workshops(): Workshop[] { return this.workshops.filter(w => w.slot === 2); }

  trackById(index: number, item: Workshop) { return item.id; }

  slotValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const s1 = group.get('slot1Choice')?.value || '';
      const s2 = group.get('slot2Choice')?.value || '';
      if (!s1 && !s2) return { atLeastOne: true };
      if (s1 && s2 && s1 === s2) return { sameWorkshop: true };

      const w1 = this.findWorkshop(s1 || null);
      const w2 = this.findWorkshop(s2 || null);
      if (w1 && w2 && w1.slot === w2.slot) return { sameSlot: true };

      return null;
    };
  }

  findWorkshop(id: string | null): Workshop | null {
    if (!id) return null;
    return this.workshops.find(w => w.id === id) ?? null;
  }

  async loadCounts() {
    try {
      const resp = await fetch(this.SHEETS_ENDPOINT + '?action=counts');
      const data = await resp.json();
      if (data && data.success && data.counts) {
        Object.keys(data.counts).forEach((id: string) => {
          const info = data.counts[id];
          const w = this.workshops.find(x => x.id === id);
          if (w) {
            w.registered = info.registered || 0;
            w.seatsLeft = (info.seatsLeft === null || info.seatsLeft === undefined) ? (w.max === null ? null : w.seatsLeft ?? w.max) : info.seatsLeft;
          }
        });
      }
    } catch (err) {
      console.warn('[workshop] loadCounts error', err);
    }
  }

  async onSubmit() {
    this.serverMessage = '';
    this.serverError = false;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const name = (this.name?.value || '').toString().trim();
    const email = (this.email?.value || '').toString().trim().toLowerCase();
    const slot1 = this.slot1Choice?.value || '';
    const slot2 = this.slot2Choice?.value || '';

    if (slot1) {
      const w = this.findWorkshop(slot1);
      if (w && w.max !== null && (w.seatsLeft ?? 0) <= 0) {
        this.serverMessage = `No seats left for ${w.title}`;
        this.serverError = true;
        return;
      }
    }
    if (slot2) {
      const w = this.findWorkshop(slot2);
      if (w && w.max !== null && (w.seatsLeft ?? 0) <= 0) {
        this.serverMessage = `No seats left for ${w.title}`;
        this.serverError = true;
        return;
      }
    }

    const body = new URLSearchParams();
    body.set('name', name);
    body.set('email', email);
    body.set('slot1Choice', slot1);
    body.set('slot2Choice', slot2);
    body.set('timestamp', new Date().toISOString());

    this.submitting = true;
    try {
      const res = await fetch(this.SHEETS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
      });
      const result = await res.json();

      if (!result || !result.success) {
        this.serverMessage = result?.message || 'Registration error.';
        this.serverError = true;
        return;
      }

      if (result.updatedCounts) {
        Object.keys(result.updatedCounts).forEach((id: string) => {
          const info = result.updatedCounts[id];
          const w = this.workshops.find(x => x.id === id);
          if (!w) return;
          if (info.seatsLeft !== undefined && info.seatsLeft !== null) w.seatsLeft = info.seatsLeft;
          if (info.registered !== undefined) w.registered = info.registered;
        });
      } else {
        await this.loadCounts();
      }

      this.serverMessage = 'Successfully registered!';
      this.serverError = false;

      this.form.reset({ name: '', email: '', slot1Choice: '', slot2Choice: '', agree: false });

    } catch (err) {
      console.error('[workshop] submit error', err);
      this.serverMessage = 'Network or server error. Please try again.';
      this.serverError = true;
    } finally {
      this.submitting = false;
    }
  }
}
