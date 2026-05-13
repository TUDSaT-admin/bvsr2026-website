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
  RegistrationService
} from '../../services/registration.service';
import { TIMELINE_EVENTS, TimelineEvent, TimelineLocation } from './timeline-events';

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

  private tickTimer: ReturnType<typeof setInterval> | null = null;
  private annTimer: ReturnType<typeof setInterval> | null = null;
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
      organisation: ['', [Validators.required, Validators.minLength(2)]]
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
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.scrollToCurrentIfNeeded(), 200);
    this.eventCards?.changes.subscribe(() => this.scrollToCurrentIfNeeded());
  }

  ngOnDestroy(): void {
    if (this.tickTimer) clearInterval(this.tickTimer);
    if (this.annTimer) clearInterval(this.annTimer);
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
      this.spaceupError = 'Please fill in all fields correctly.';
      return;
    }

    this.submittingSpaceUp = true;
    try {
      const v = this.spaceupForm.value;
      await this.registrationService.submitSpaceUpRegistration({
        title: v.title,
        description: v.description,
        email: v.email,
        organisation: v.organisation
      });
      this.spaceupSuccess =
        'Your SpaceUp has been submitted! We will get back to you with a time slot.';
      this.spaceupFormDir?.resetForm();
      this.spaceupForm.reset();
    } catch (e: unknown) {
      const err = e as { message?: string };
      this.spaceupError = err?.message || 'Could not submit. Please try again later.';
    } finally {
      this.submittingSpaceUp = false;
    }
  }

  trackEvent = (_: number, ev: ViewEvent): string => ev.raw.id;
  trackAnn = (_: number, a: Announcement): string => a.timestamp + a.title;
}
