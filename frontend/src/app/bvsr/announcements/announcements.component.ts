import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormGroupDirective,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { MaterialModule } from '../../material/material.module';
import { SeoService } from '../../services/seo.service';
import {
  Announcement,
  RegistrationService,
  SpaceUpEntry
} from '../../services/registration.service';
import { TIMELINE_EVENTS, TimelineEvent, TimelineLocation } from './timeline-events';
import {
  SPACEUP_ROOMS,
  SPACEUP_SLOTS,
  SpaceUpRoom,
  SpaceUpSlot,
  spaceupSlotKey
} from './spaceups-catalog';

type EventState = 'past' | 'current' | 'upcoming';

interface ViewLocation extends TimelineLocation {
  safeSrc?: SafeResourceUrl;
}

interface ViewEvent {
  raw: TimelineEvent;
  startMs: number;
  endMs: number;
  dayKey: string;
  dayLabel: string;
  state: EventState;
  locations: ViewLocation[];
  expanded: boolean;
}

interface DayGroup {
  dayKey: string;
  dayLabel: string;
  events: ViewEvent[];
}

@Component({
  selector: 'app-announcements',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NavbarComponent,
    FooterComponent,
    MaterialModule
  ],
  templateUrl: './announcements.component.html',
  styleUrl: './announcements.component.css'
})
export class AnnouncementsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('eventCard') eventCards!: QueryList<ElementRef<HTMLElement>>;
  @ViewChild('spaceupFormDir') spaceupFormDir?: FormGroupDirective;
  @ViewChild('timelineWindow') timelineWindow?: ElementRef<HTMLElement>;

  days: DayGroup[] = [];
  nowMs = Date.now();
  currentEventId: string | null = null;

  announcements: Announcement[] = [];
  announcementsLoading = true;

  spaceupForm: FormGroup;
  submittingSpaceUp = false;
  spaceupSuccess = '';
  spaceupError = '';

  spaceups: SpaceUpEntry[] = [];
  spaceupsLoading = true;
  spaceupBookings = new Map<string, SpaceUpEntry>();

  readonly spaceupRooms: SpaceUpRoom[] = SPACEUP_ROOMS;
  readonly spaceupSlots: SpaceUpSlot[] = SPACEUP_SLOTS;

  private tickTimer: ReturnType<typeof setInterval> | null = null;
  private annTimer: ReturnType<typeof setInterval> | null = null;
  private spaceupsTimer: ReturnType<typeof setInterval> | null = null;
  private didInitialScroll = false;

  constructor(
    private seoService: SeoService,
    private sanitizer: DomSanitizer,
    private registrationService: RegistrationService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.spaceupForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(800)]],
      email: ['', [Validators.required, Validators.email]],
      organisation: ['', [Validators.required, Validators.minLength(2)]],
      room: ['', [Validators.required]],
      slot: [null as number | null, [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.seoService.updateSEO({
      title: 'Live · BVSR Conference 2026'
    });

    this.days = this.buildDays();
    this.recomputeStates();

    this.tickTimer = setInterval(() => {
      this.nowMs = Date.now();
      this.recomputeStates();
    }, 30_000);

    void this.refreshAnnouncements();
    this.annTimer = setInterval(() => void this.refreshAnnouncements(), 45_000);

    void this.refreshSpaceUps();
    this.spaceupsTimer = setInterval(() => void this.refreshSpaceUps(), 30_000);
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.scrollToCurrentIfNeeded(), 200);
    this.eventCards?.changes.subscribe(() => this.scrollToCurrentIfNeeded());
  }

  ngOnDestroy(): void {
    if (this.tickTimer) clearInterval(this.tickTimer);
    if (this.annTimer) clearInterval(this.annTimer);
    if (this.spaceupsTimer) clearInterval(this.spaceupsTimer);
  }

  private buildDays(): DayGroup[] {
    const groups = new Map<string, DayGroup>();
    for (const ev of TIMELINE_EVENTS) {
      const startMs = new Date(ev.start).getTime();
      const endMs = ev.end
        ? new Date(ev.end).getTime()
        : startMs + 90 * 60 * 1000;

      const view: ViewEvent = {
        raw: ev,
        startMs,
        endMs,
        dayKey: ev.dayKey,
        dayLabel: ev.dayLabel,
        state: 'upcoming',
        locations: (ev.locations ?? []).map(loc => ({
          ...loc,
          safeSrc: loc.iframeSrc
            ? this.sanitizer.bypassSecurityTrustResourceUrl(loc.iframeSrc)
            : undefined
        })),
        expanded: false
      };

      const existing = groups.get(ev.dayKey);
      if (existing) {
        existing.events.push(view);
      } else {
        groups.set(ev.dayKey, {
          dayKey: ev.dayKey,
          dayLabel: ev.dayLabel,
          events: [view]
        });
      }
    }
    return Array.from(groups.values())
      .map(g => ({
        ...g,
        events: g.events.sort((a, b) => a.startMs - b.startMs)
      }))
      .sort((a, b) => a.dayKey.localeCompare(b.dayKey));
  }

  private recomputeStates(): void {
    const now = this.nowMs;
    let realCurrent: ViewEvent | null = null;

    for (const day of this.days) {
      for (const ev of day.events) {
        if (now < ev.startMs) {
          ev.state = 'upcoming';
        } else if (now >= ev.startMs && now < ev.endMs) {
          ev.state = 'current';
          if (!realCurrent) realCurrent = ev;
        } else {
          ev.state = 'past';
        }
      }
    }

    let highlighted: ViewEvent | null = realCurrent;
    if (!highlighted) {
      const allUpcoming: ViewEvent[] = [];
      for (const day of this.days) {
        for (const ev of day.events) {
          if (ev.state === 'upcoming') allUpcoming.push(ev);
        }
      }
      allUpcoming.sort((a, b) => a.startMs - b.startMs);
      if (allUpcoming.length > 0) {
        allUpcoming[0].state = 'current';
        highlighted = allUpcoming[0];
      }
    }

    for (const day of this.days) {
      for (const ev of day.events) {
        ev.expanded = ev.expanded || ev.state === 'current';
      }
    }

    this.currentEventId = highlighted ? highlighted.raw.id : null;
  }

  isLive(ev: ViewEvent): boolean {
    return this.nowMs >= ev.startMs && this.nowMs < ev.endMs;
  }

  private scrollToCurrentIfNeeded(): void {
    if (this.didInitialScroll) return;
    const targetId = this.currentEventId || this.findNextUpcomingId();
    if (!targetId) return;
    const card = this.eventCards?.find(c => c.nativeElement.dataset['eventId'] === targetId);
    const window = this.timelineWindow?.nativeElement;
    if (!card) return;

    if (window) {
      try {
        const cardEl = card.nativeElement;
        const offset = cardEl.offsetTop - window.clientHeight / 2 + cardEl.clientHeight / 2;
        window.scrollTo({ top: Math.max(0, offset), behavior: 'smooth' });
        this.didInitialScroll = true;
        return;
      } catch {
      }
    }

    try {
      card.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch {
    }
    this.didInitialScroll = true;
  }

  private findNextUpcomingId(): string | null {
    const now = this.nowMs;
    for (const day of this.days) {
      for (const ev of day.events) {
        if (ev.startMs > now) return ev.raw.id;
      }
    }
    return null;
  }

  toggleEvent(ev: ViewEvent): void {
    ev.expanded = !ev.expanded;
  }

  async refreshAnnouncements(): Promise<void> {
    try {
      const items = await this.registrationService.fetchAnnouncements();
      items.sort((a, b) => {
        const at = new Date(a.timestamp).getTime() || 0;
        const bt = new Date(b.timestamp).getTime() || 0;
        return bt - at;
      });
      this.announcements = items;
    } finally {
      this.announcementsLoading = false;
      this.cdr.markForCheck();
    }
  }

  formatBerlinTime(value?: string | number): string {
    if (value == null || value === '') return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    try {
      return new Intl.DateTimeFormat('de-DE', {
        timeZone: 'Europe/Berlin',
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(d);
    } catch {
      return d.toLocaleString();
    }
  }

  async submitSpaceUp(): Promise<void> {
    this.spaceupSuccess = '';
    this.spaceupError = '';

    if (this.spaceupForm.invalid) {
      this.spaceupForm.markAllAsTouched();
      this.spaceupError = 'Please fill in all fields, including a room and a time slot.';
      return;
    }

    const v = this.spaceupForm.value;
    const room = String(v.room || '').trim();
    const slot = Number(v.slot);

    if (this.isSlotTaken(room, slot)) {
      this.spaceupError =
        'That room and slot was just taken by someone else. Please pick another free cell from the board above.';
      return;
    }

    this.submittingSpaceUp = true;
    try {
      await this.registrationService.submitSpaceUpRegistration({
        title: v.title,
        description: v.description,
        email: v.email,
        organisation: v.organisation,
        room: room,
        slot: slot
      });
      this.spaceupSuccess =
        'Your SpaceUp is booked! Check the board above to see your slot.';
      this.spaceupFormDir?.resetForm();
      this.spaceupForm.reset();
      void this.refreshSpaceUps();
    } catch (e: unknown) {
      const err = e as { message?: string; code?: string };
      if (err?.code === 'SLOT_TAKEN') {
        this.spaceupError =
          err.message ||
          'That room and slot was just taken by someone else. Please pick another free cell.';
        void this.refreshSpaceUps();
      } else {
        this.spaceupError = err?.message || 'Could not submit. Please try again later.';
      }
    } finally {
      this.submittingSpaceUp = false;
    }
  }

  async refreshSpaceUps(): Promise<void> {
    try {
      const items = await this.registrationService.fetchSpaceUps();
      this.spaceups = items;
      const map = new Map<string, SpaceUpEntry>();
      for (const s of items) {
        map.set(spaceupSlotKey(s.room, s.slot), s);
      }
      this.spaceupBookings = map;
    } finally {
      this.spaceupsLoading = false;
      this.cdr.markForCheck();
    }
  }

  isSlotTaken(room: string, slot: number): boolean {
    return this.spaceupBookings.has(spaceupSlotKey(room, slot));
  }

  bookingFor(room: string, slot: number): SpaceUpEntry | undefined {
    return this.spaceupBookings.get(spaceupSlotKey(room, slot));
  }

  selectSlot(room: string, slot: number): void {
    if (this.isSlotTaken(room, slot)) return;
    this.spaceupForm.patchValue({ room, slot });
    this.spaceupForm.get('room')?.markAsTouched();
    this.spaceupForm.get('slot')?.markAsTouched();
    this.spaceupError = '';
  }

  isCellSelected(room: string, slot: number): boolean {
    const v = this.spaceupForm.value;
    return v.room === room && Number(v.slot) === slot;
  }

  trackEvent = (_: number, ev: ViewEvent): string => ev.raw.id;
  trackAnn = (_: number, a: Announcement): string => a.timestamp + a.title;
  trackRoom = (_: number, r: SpaceUpRoom): string => r.id;
  trackSlot = (_: number, s: SpaceUpSlot): number => s.slot;
}
