import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { SeoService } from '../../services/seo.service';
import {RegistrationService, WorkshopAvailabilitySnapshot} from '../../services/registration.service';
import {
  BVSR_WORKSHOPS,
  BVSR_WORKSHOPS_BY_ID,
  Workshop,
  workshopIsForSlot,
  workshopSpansBoth
} from './workshops-catalog';

interface WorkshopView extends Workshop {
  registered: number;
  seatsLeft: number;
  isFull: boolean;
}

@Component({
  selector: 'app-workshop',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent, FooterComponent],
  templateUrl: './workshop.component.html',
  styleUrls: ['./workshop.component.css']
})
export class WorkshopComponent implements OnInit, OnDestroy {
  workshops: WorkshopView[] = BVSR_WORKSHOPS.map(w => ({
    ...w,
    registered: 0,
    seatsLeft: w.capacity,
    isFull: false
  }));

  form: FormGroup;
  submitting = false;
  serverMessage = '';
  serverError = false;
  nameMismatchAwaitingConfirm = false;
  availabilityLoading = false;
  availabilityError = '';
  lastAvailabilityFetch: number | null = null;

  private availabilityTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private fb: FormBuilder,
    private seoService: SeoService,
    private registrationService: RegistrationService
  ) {
    this.form = this.fb.group(
      {
        firstName: ['', [Validators.required, Validators.maxLength(80)]],
        lastName: ['', [Validators.required, Validators.maxLength(80)]],
        email: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
        slot1Choice: [''],
        slot2Choice: ['']
      },
      { validators: this.workshopSelectionValidator() }
    );

    this.form.get('slot1Choice')!.valueChanges.subscribe(v => this.onSlot1Change(v));
    this.form.get('slot2Choice')!.valueChanges.subscribe(v => this.onSlot2Change(v));
    this.form.valueChanges.subscribe(() => {
      if (this.serverMessage && !this.serverError) {
        this.serverMessage = '';
      }
    });
  }

  ngOnInit(): void {
    this.seoService.updateSEO({ title: 'Workshops · BVSR Conference 2026' });
    this.refreshAvailability();
    this.availabilityTimer = setInterval(() => this.refreshAvailability(true), 60_000);
  }

  ngOnDestroy(): void {
    if (this.availabilityTimer) {
      clearInterval(this.availabilityTimer);
      this.availabilityTimer = null;
    }
  }

  get firstName() { return this.form.get('firstName'); }
  get lastName() { return this.form.get('lastName'); }
  get email() { return this.form.get('email'); }
  get slot1Choice() { return this.form.get('slot1Choice'); }
  get slot2Choice() { return this.form.get('slot2Choice'); }

  get slot1Workshops(): WorkshopView[] {
    return this.workshops.filter(w => workshopIsForSlot(w, 1));
  }
  get slot2Workshops(): WorkshopView[] {
    return this.workshops.filter(w => workshopIsForSlot(w, 2));
  }

  isOtherSlotLocked(slot: 1 | 2): boolean {
    const other = slot === 1 ? this.slot2Choice?.value : this.slot1Choice?.value;
    const otherWs = this.findWorkshop(other);
    return !!otherWs && workshopSpansBoth(otherWs);
  }


  isOptionDisabled(workshop: WorkshopView, slot: 1 | 2): boolean {
    const currentChoice = slot === 1 ? this.slot1Choice?.value : this.slot2Choice?.value;
    if (currentChoice === workshop.id) return false;
    return workshop.isFull;
  }

  trackById(_: number, item: WorkshopView): string { return item.id; }

  private workshopSelectionValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const s1 = String(group.get('slot1Choice')?.value || '').trim();
      const s2 = String(group.get('slot2Choice')?.value || '').trim();

      if (!s1 && !s2) return { atLeastOne: true };

      const w1 = this.findWorkshop(s1);
      const w2 = this.findWorkshop(s2);

      if (w1 && !workshopIsForSlot(w1, 1)) return { wrongSlot: true };
      if (w2 && !workshopIsForSlot(w2, 2)) return { wrongSlot: true };

      if (s1 && s2) {
        if (w1 && workshopSpansBoth(w1) && s2 === s1) return null;
        if (w2 && workshopSpansBoth(w2) && s1 === s2) return null;
        if (s1 === s2) return { sameWorkshop: true };
      }

      return null;
    };
  }

  findWorkshop(id: string | null | undefined): WorkshopView | null {
    if (!id) return null;
    return this.workshops.find(w => w.id === id) ?? null;
  }

  private onSlot1Change(value: string | null): void {
    const slot1Ws = this.findWorkshop(value);
    const slot2Ctrl = this.slot2Choice!;
    if (slot1Ws && workshopSpansBoth(slot1Ws)) {
      if (slot2Ctrl.value !== slot1Ws.id) {
        slot2Ctrl.setValue(slot1Ws.id, { emitEvent: false });
      }
      slot2Ctrl.disable({ emitEvent: false });
    } else {
      const slot2Ws = this.findWorkshop(slot2Ctrl.value);
      if (slot2Ws && workshopSpansBoth(slot2Ws)) {
        slot2Ctrl.setValue('', { emitEvent: false });
      }
      if (slot2Ctrl.disabled) {
        slot2Ctrl.enable({ emitEvent: false });
      }
    }
  }

  private onSlot2Change(value: string | null): void {
    const slot2Ws = this.findWorkshop(value);
    const slot1Ctrl = this.slot1Choice!;
    if (slot2Ws && workshopSpansBoth(slot2Ws)) {
      if (slot1Ctrl.value !== slot2Ws.id) {
        slot1Ctrl.setValue(slot2Ws.id, { emitEvent: false });
      }
      slot1Ctrl.disable({ emitEvent: false });
    } else {
      const slot1Ws = this.findWorkshop(slot1Ctrl.value);
      if (slot1Ws && workshopSpansBoth(slot1Ws)) {
        slot1Ctrl.setValue('', { emitEvent: false });
      }
      if (slot1Ctrl.disabled) {
        slot1Ctrl.enable({ emitEvent: false });
      }
    }
  }

  async refreshAvailability(silent = false): Promise<void> {
    if (!silent) {
      this.availabilityLoading = true;
      this.availabilityError = '';
    }
    try {
      const snap = await this.registrationService.fetchWorkshopAvailability();
      if (snap) {
        this.applyAvailability(snap);
        this.lastAvailabilityFetch = Date.now();
      } else if (!silent) {
        this.availabilityError =
          'Live seat counts are temporarily unavailable. Showing capacity only.';
      }
    } catch {
      if (!silent) {
        this.availabilityError =
          'Live seat counts are temporarily unavailable. Showing capacity only.';
      }
    } finally {
      this.availabilityLoading = false;
    }
  }

  private applyAvailability(snap: WorkshopAvailabilitySnapshot): void {
    const remaining = snap.remaining || {};
    const booked = snap.booked || {};
    this.workshops = this.workshops.map(w => {
      const r = typeof remaining[w.id] === 'number' ? Math.max(0, remaining[w.id]) : w.capacity;
      const reg = typeof booked[w.id] === 'number' ? booked[w.id] : Math.max(0, w.capacity - r);
      return {
        ...w,
        registered: reg,
        seatsLeft: r,
        isFull: r <= 0
      };
    });
  }

  dismissNameMismatch(): void {
    this.nameMismatchAwaitingConfirm = false;
    this.serverMessage = '';
    this.serverError = false;
  }

  async onSubmit(): Promise<void> {
    if (!this.nameMismatchAwaitingConfirm) {
      this.serverMessage = '';
      this.serverError = false;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const slot1 = String(this.slot1Choice?.value || '').trim();
    const slot2 = String(this.slot2Choice?.value || '').trim();

    const w1 = this.findWorkshop(slot1);
    const w2 = this.findWorkshop(slot2);

    if (w1 && w1.isFull && w1.id !== slot2) {
      this.serverMessage = `No seats left for "${w1.title}". Please choose another workshop.`;
      this.serverError = true;
      return;
    }
    if (w2 && w2.isFull && w2.id !== slot1) {
      this.serverMessage = `No seats left for "${w2.title}". Please choose another workshop.`;
      this.serverError = true;
      return;
    }

    this.submitting = true;
    try {
      const result = await this.registrationService.submitWorkshopSelection({
        firstName: String(this.firstName?.value || '').trim(),
        lastName: String(this.lastName?.value || '').trim(),
        email: String(this.email?.value || '').trim(),
        slot1,
        slot2,
        confirmNameMismatch: this.nameMismatchAwaitingConfirm
      });

      if (result.status === 'saved') {
        this.nameMismatchAwaitingConfirm = false;
        const summary = this.buildSelectionSummary(w1, w2);
        this.serverMessage = `Workshop selection saved! ${summary}`;
        this.serverError = false;
        this.form.reset({
          firstName: '',
          lastName: '',
          email: '',
          slot1Choice: '',
          slot2Choice: ''
        });
        if (this.slot1Choice?.disabled) this.slot1Choice.enable({ emitEvent: false });
        if (this.slot2Choice?.disabled) this.slot2Choice.enable({ emitEvent: false });
        await this.refreshAvailability(true);
        return;
      }

      if (result.status === 'name_mismatch') {
        this.nameMismatchAwaitingConfirm = true;
        this.serverError = true;
        this.serverMessage =
          'The name you entered does not match the name we have for this email. Please check your name, or confirm below to save anyway.';
        return;
      }

      if (result.status === 'workshop_full') {
        this.serverError = true;
        this.serverMessage =
          result.message ||
          'One of the workshops you picked just filled up. Please refresh and choose another.';
        await this.refreshAvailability(true);
        return;
      }

      if (result.status === 'not_found') {
        this.serverError = true;
        this.serverMessage =
          result.message ||
          'No registration found for this email. Please use the same email address you used to register for the conference.';
        return;
      }

      this.serverError = true;
      this.serverMessage = result.message || 'Could not save your workshop selection. Please try again.';
    } catch (err: unknown) {
      console.error('[workshop] submit error', err);
      this.serverError = true;
      this.serverMessage =
        err instanceof Error ? err.message : 'Network or server error. Please try again.';
    } finally {
      this.submitting = false;
    }
  }

  private buildSelectionSummary(w1: WorkshopView | null, w2: WorkshopView | null): string {
    if (w1 && w2 && w1.id === w2.id && workshopSpansBoth(w1)) {
      return `You are attending "${w1.title}" (full afternoon, ${w1.room}).`;
    }
    const parts: string[] = [];
    if (w1) parts.push(`Slot 1: "${w1.title}" (${w1.room})`);
    if (w2) parts.push(`Slot 2: "${w2.title}" (${w2.room})`);
    return parts.join(' · ');
  }

  describe(id: string | null | undefined): Workshop | null {
    if (!id) return null;
    return BVSR_WORKSHOPS_BY_ID[id] || null;
  }
}
