import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import {
  BvsrTourCode,
  RegistrationService,
  SaveTourSelectionResult,
  TourAvailabilitySnapshot
} from '../../services/registration.service';

export type TourWizardAppearance = 'dialog' | 'page';

export type TourCardId = 'GSI' | 'ESOC' | 'CASIMAR' | 'CITY';

@Component({
  selector: 'app-tour-selection-wizard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './tour-selection-wizard.component.html',
  styleUrls: ['./tour-selection-wizard.component.css']
})
export class TourSelectionWizardComponent implements OnInit {
  @Input() appearance: TourWizardAppearance = 'page';
  @Input() prefillEmail = '';
  @Input() prefillFirstName = '';
  @Input() prefillLastName = '';

  /** When true (e.g. post-registration dialog), start eligibility check immediately when email is prefilled. */
  @Input() autoStartWhenPrefilled = true;

  @Output() completed = new EventEmitter<void>();

  step: 'email' | 'checking' | 'notRegistered' | 'nationality' | 'tours' | 'success' = 'email';

  emailForm: FormGroup;
  nationalityForm: FormGroup;

  contextualEmail = '';
  contextualFirst = '';
  contextualLast = '';
  contextualAssociation = '';

  needsNationality = false;
  eligibilityError = '';
  submitError = '';
  submitting = false;
  nameMismatchAwaitingConfirm = false;

  tourAvail: TourAvailabilitySnapshot | null = null;
  availabilityLoading = false;

  readonly tourCards: Array<{
    id: TourCardId;
    name: string;
    image: string | null;
    imageAlt: string;
  }> = [
    {
      id: 'GSI',
      name: 'GSI Facility Tour',
      image: 'assets/images/GSIFair.jpg',
      imageAlt: 'GSI'
    },
    {
      id: 'ESOC',
      name: 'ESOC Visit',
      image: 'assets/images/ESA.jpg',
      imageAlt: 'ESA / ESOC'
    },
    {
      id: 'CASIMAR',
      name: 'CASIMAR Workday',
      image: 'assets/images/CASIMAR.png',
      imageAlt: 'CASIMAR'
    },
    {
      id: 'CITY',
      name: 'Darmstadt City Tour',
      image: 'assets/images/darmstadt2.png',
      imageAlt: 'Darmstadt city tour'
    }
  ];

  selectedCardId: TourCardId | null = null;
  esocSlot: 1 | 2 | null = null;

  constructor(
    private fb: FormBuilder,
    private registrationService: RegistrationService
  ) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
    this.nationalityForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(120)]],
      lastName: ['', [Validators.required, Validators.maxLength(120)]],
      countryOfOrigin: ['', [Validators.required, Validators.maxLength(120)]],
      nationality: ['', [Validators.required, Validators.maxLength(120)]]
    });
  }

  ngOnInit(): void {
    const em = this.prefillEmail?.trim() || '';
    const fn = this.prefillFirstName?.trim() || '';
    const ln = this.prefillLastName?.trim() || '';

    if (em) {
      this.emailForm.patchValue({ email: em });
      this.contextualEmail = em;
    }
    if (fn || ln) {
      this.nationalityForm.patchValue({
        firstName: fn,
        lastName: ln
      });
      this.contextualFirst = fn;
      this.contextualLast = ln;
      if (fn && ln) {
        this.nationalityForm.get('firstName')?.disable();
        this.nationalityForm.get('lastName')?.disable();
      }
    }

    if (em && this.autoStartWhenPrefilled) {
      this.step = 'checking';
      void this.runEligibility(em);
    }
  }

  private syncContextFromForms(): void {
    const rawNat = this.nationalityForm.getRawValue();
    this.contextualEmail =
      this.contextualEmail || this.prefillEmail?.trim() || this.emailForm.get('email')?.value?.trim() || '';
    this.contextualFirst =
      this.contextualFirst || this.prefillFirstName?.trim() || rawNat.firstName?.trim() || '';
    this.contextualLast =
      this.contextualLast || this.prefillLastName?.trim() || rawNat.lastName?.trim() || '';
  }

  continueFromEmail(): void {
    this.emailForm.markAllAsTouched();
    if (this.emailForm.invalid) {
      return;
    }
    const email = (this.emailForm.get('email')?.value as string).trim();
    this.contextualEmail = email;
    void this.runEligibility(email);
  }

  async runEligibility(email: string): Promise<void> {
    this.step = 'checking';
    this.eligibilityError = '';
    try {
      const r = await this.registrationService.checkTourEligibility(email);
      if (!r.success || !r.found) {
        this.step = 'notRegistered';
        this.eligibilityError =
          r.message ||
          'We could not find a conference registration for this email. Register first, then sign up for a tour.';
        return;
      }
      const sheetFn = r.firstName?.trim();
      const sheetLn = r.lastName?.trim();
      if (sheetFn) {
        this.contextualFirst = sheetFn;
      }
      if (sheetLn) {
        this.contextualLast = sheetLn;
      }
      this.contextualAssociation = (r.association ?? '').trim();

      if (sheetFn && sheetLn) {
        this.nationalityForm.patchValue({ firstName: sheetFn, lastName: sheetLn });
        this.nationalityForm.get('firstName')?.disable();
        this.nationalityForm.get('lastName')?.disable();
      }

      if (!r.hasNationality) {
        this.needsNationality = true;
        if (!this.nationalityForm.get('firstName')?.disabled) {
          this.nationalityForm.patchValue({
            firstName: this.contextualFirst || this.prefillFirstName?.trim() || '',
            lastName: this.contextualLast || this.prefillLastName?.trim() || ''
          });
        }
        this.step = 'nationality';
        return;
      }
      this.needsNationality = false;
      this.syncContextFromForms();
      this.step = 'tours';
      void this.loadTourAvailability();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Could not verify your registration.';
      this.eligibilityError = msg.includes('configured')
        ? msg
        : msg +
          ' If this keeps happening, the registration server may need an update for tour eligibility.';
      this.step = 'notRegistered';
    }
  }

  retryEmailAfterFailure(): void {
    this.step = 'email';
  }

  private async loadTourAvailability(): Promise<void> {
    this.availabilityLoading = true;
    try {
      this.tourAvail = await this.registrationService.fetchTourAvailability();
    } finally {
      this.availabilityLoading = false;
    }
  }

  continueFromNationality(): void {
    this.nationalityForm.markAllAsTouched();
    if (this.nationalityForm.invalid) {
      return;
    }
    const raw = this.nationalityForm.getRawValue();
    this.contextualFirst = raw.firstName?.trim() || '';
    this.contextualLast = raw.lastName?.trim() || '';
    this.syncContextFromForms();
    this.step = 'tours';
    void this.loadTourAvailability();
  }

  selectCard(id: TourCardId): void {
    this.submitError = '';
    this.selectedCardId = id;
    if (id !== 'ESOC') {
      this.esocSlot = null;
    } else if (this.esocSlot === null) {
      this.esocSlot = 1;
    }
  }

  pickEsocSlot(slot: 1 | 2): void {
    this.esocSlot = slot;
    this.selectedCardId = 'ESOC';
    this.submitError = '';
  }

  isCardGreyed(cardId: TourCardId): boolean {
    return this.selectedCardId !== null && this.selectedCardId !== cardId;
  }

  isEsocSlotGreyed(slotNum: 1 | 2): boolean {
    return this.selectedCardId === 'ESOC' && this.esocSlot !== null && this.esocSlot !== slotNum;
  }

  remainingCaptionForCode(code: BvsrTourCode): string | null {
    if (!this.tourAvail && this.availabilityLoading) {
      return 'Loading capacities…';
    }
    const m = this.tourAvail?.max?.[code];
    const r = this.tourAvail?.remaining?.[code];
    if (typeof m !== 'number' || typeof r !== 'number') {
      return null;
    }
    return `${r} of ${m} spots remaining`;
  }

  displayNameForGreeting(): string {
    const n = `${this.contextualFirst ?? ''} ${this.contextualLast ?? ''}`.trim();
    return n || 'there';
  }

  associationSubtitle(): string {
    return (this.contextualAssociation ?? '').trim();
  }

  cardCapacityLine(cardId: TourCardId): string {
    if (cardId === 'ESOC') {
      const c1 = this.remainingCaptionForCode('ESOC1');
      const c2 = this.remainingCaptionForCode('ESOC2');
      const resolved = this.resolveTourCode();
      if (resolved === 'ESOC1' || resolved === 'ESOC2') {
        const cap = this.remainingCaptionForCode(resolved);
        if (cap) {
          const label = resolved === 'ESOC1' ? 'Slot 1' : 'Slot 2';
          return `${label}: ${cap}`;
        }
      }
      if (c1 && c2) {
        return `${c1} · ${c2}`;
      }
      return [c1, c2].filter(Boolean).join(' · ');
    }

    const tc = this.tourCodeFromCard(cardId);
    if (!tc) {
      return '';
    }
    return this.remainingCaptionForCode(tc) ?? '';
  }

  tourCodeFromCard(cardId: TourCardId): BvsrTourCode | null {
    if (cardId === 'GSI') return 'GSI';
    if (cardId === 'CASIMAR') return 'CASIMAR';
    if (cardId === 'CITY') return 'CITY';
    return null;
  }

  private resolveTourCode(): BvsrTourCode | null {
    if (this.selectedCardId === 'GSI') return 'GSI';
    if (this.selectedCardId === 'CASIMAR') return 'CASIMAR';
    if (this.selectedCardId === 'CITY') return 'CITY';
    if (this.selectedCardId === 'ESOC') {
      if (this.esocSlot === 1) return 'ESOC1';
      if (this.esocSlot === 2) return 'ESOC2';
      return null;
    }
    return null;
  }

  canSubmitTour(): boolean {
    return this.resolveTourCode() !== null;
  }

  private payloadForSubmit(confirmMismatch: boolean) {
    const tourSelected = this.resolveTourCode();
    if (!tourSelected) return null;

    const natVal = this.nationalityForm.getRawValue();
    const country = natVal.countryOfOrigin?.trim();
    const nationality = natVal.nationality?.trim();

    const payload: Parameters<RegistrationService['saveTourSelection']>[0] = {
      email: this.contextualEmail,
      tourSelected,
      confirmNameMismatch: confirmMismatch,
      firstName: this.contextualFirst || undefined,
      lastName: this.contextualLast || undefined
    };

    if (this.needsNationality && country && nationality) {
      payload.countryOfOrigin = country;
      payload.nationality = nationality;
    }

    return payload;
  }

  async submitTourChoice(): Promise<void> {
    if (!this.canSubmitTour() || !this.contextualEmail) {
      return;
    }
    this.submitting = true;
    this.submitError = '';
    const payload = this.payloadForSubmit(false);
    if (!payload) {
      this.submitting = false;
      return;
    }

    try {
      const result = await this.registrationService.saveTourSelection(payload);
      this.afterSaveResult(result);
    } finally {
      this.submitting = false;
    }
  }

  dismissNameMismatch(): void {
    this.nameMismatchAwaitingConfirm = false;
    this.submitError = '';
  }

  async confirmTourWithEnteredName(): Promise<void> {
    const payload = this.payloadForSubmit(true);
    if (!payload) return;
    this.submitting = true;
    try {
      const result = await this.registrationService.saveTourSelection(payload);
      this.afterSaveResult(result);
    } finally {
      this.submitting = false;
    }
  }

  private afterSaveResult(result: SaveTourSelectionResult): void {
    if (result.status === 'saved') {
      this.nameMismatchAwaitingConfirm = false;
      this.step = 'success';
      return;
    }
    if (result.status === 'name_mismatch') {
      this.nameMismatchAwaitingConfirm = true;
      return;
    }
    if (result.status === 'tour_full') {
      this.submitError = result.message || 'This tour slot is full. Please pick another.';
      void this.loadTourAvailability();
      return;
    }
    this.submitError = result.message || 'Something went wrong. Please try again.';
  }

  onSuccessDone(): void {
    if (this.appearance === 'dialog') {
      this.completed.emit();
    }
  }

  selectedDescription(): string {
    if (this.selectedCardId === 'GSI') {
      return (
        'Experience an exclusive guided tour of GSI and explore cutting-edge research in particle accelerators, and more!'
      );
    }
    if (this.selectedCardId === 'ESOC') {
      return (
        'Visit the European Space Operations Centre (ESOC) in Darmstadt and get an exciting behind-the-scenes experience of how European space missions and satellites are monitored and controlled.'
      );
    }
    if (this.selectedCardId === 'CASIMAR') {
      return 'CASIMAR Workday';
    }
    if (this.selectedCardId === 'CITY') {
      return 'A guided tour of Darmstadt by Jonathan David Mayer';
    }
    return '';
  }
}
