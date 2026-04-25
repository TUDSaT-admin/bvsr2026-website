import { Component, OnInit, OnDestroy, HostListener, AfterViewInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavbarComponent } from '../navbar/navbar.component';
import { SeoService } from '../../services/seo.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { I18nService } from '../../services/i18n.service';

interface ScheduleSessionKeys {
  timeKey: string;
  titleKey: string;
}

interface ScheduleDayBlock {
  id: number;
  dateKey: string;
  weekdayKey: string;
  headingKey: string;
  sessions: ScheduleSessionKeys[];
}

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [NavbarComponent, TranslatePipe],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.css'
})
export class ScheduleComponent implements OnInit, AfterViewInit, OnDestroy {
  activeDay: number = 1;
  scrollProgress: number = 0;
  overlay1Opacity: number = 1;
  overlay2Opacity: number = 0;
  overlay3Opacity: number = 0;
  overlay4Opacity: number = 0;

  readonly dayBlocks: ScheduleDayBlock[] = [
    {
      id: 1,
      dateKey: 'schedule.d1.date',
      weekdayKey: 'schedule.d1.weekday',
      headingKey: 'schedule.d1.heading',
      sessions: [
        { timeKey: 'schedule.d1.s0.time', titleKey: 'schedule.d1.s0.title' },
        { timeKey: 'schedule.d1.s1.time', titleKey: 'schedule.d1.s1.title' },
        { timeKey: 'schedule.d1.s2.time', titleKey: 'schedule.d1.s2.title' },
        { timeKey: 'schedule.d1.s3.time', titleKey: 'schedule.d1.s3.title' }
      ]
    },
    {
      id: 2,
      dateKey: 'schedule.d2.date',
      weekdayKey: 'schedule.d2.weekday',
      headingKey: 'schedule.d2.heading',
      sessions: [
        { timeKey: 'schedule.d2.s0.time', titleKey: 'schedule.d2.s0.title' },
        { timeKey: 'schedule.d2.s1.time', titleKey: 'schedule.d2.s1.title' },
        { timeKey: 'schedule.d2.s2.time', titleKey: 'schedule.d2.s2.title' },
        { timeKey: 'schedule.d2.s3.time', titleKey: 'schedule.d2.s3.title' },
        { timeKey: 'schedule.d2.s4.time', titleKey: 'schedule.d2.s4.title' }
      ]
    },
    {
      id: 3,
      dateKey: 'schedule.d3.date',
      weekdayKey: 'schedule.d3.weekday',
      headingKey: 'schedule.d3.heading',
      sessions: [
        { timeKey: 'schedule.d3.s0.time', titleKey: 'schedule.d3.s0.title' },
        { timeKey: 'schedule.d3.s1.time', titleKey: 'schedule.d3.s1.title' },
        { timeKey: 'schedule.d3.s2.time', titleKey: 'schedule.d3.s2.title' }
      ]
    },
    {
      id: 4,
      dateKey: 'schedule.d4.date',
      weekdayKey: 'schedule.d4.weekday',
      headingKey: 'schedule.d4.heading',
      sessions: [
        { timeKey: 'schedule.d4.s0.time', titleKey: 'schedule.d4.s0.title' },
        { timeKey: 'schedule.d4.s1.time', titleKey: 'schedule.d4.s1.title' },
        { timeKey: 'schedule.d4.s2.time', titleKey: 'schedule.d4.s2.title' }
      ]
    }
  ];

  private scrambleIntervals: Map<string, ReturnType<typeof setInterval>> = new Map();
  private readonly scrambleChars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  private scrambledDays: Set<number> = new Set();

  constructor(
    private seoService: SeoService,
    private i18n: I18nService,
    destroyRef: DestroyRef
  ) {
    this.i18n.languageChanged.pipe(takeUntilDestroyed(destroyRef)).subscribe(() => {
      this.resetScrambleState();
    });
  }

  ngOnInit() {
    this.seoService.updateSEO({
      title: 'Schedule · BVSR Conference 2026'
    });
    this.handleScroll();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.scrambleActiveDay();
    }, 300);
  }

  private resetScrambleState(): void {
    this.scrambledDays.clear();
    this.scrambleIntervals.forEach((interval) => clearInterval(interval));
    this.scrambleIntervals.clear();
    document.querySelectorAll('.scramble-text[data-original]').forEach((el) => {
      el.removeAttribute('data-original');
    });
    setTimeout(() => this.scrambleActiveDay(), 0);
  }

  private scrambleActiveDay() {
    if (this.scrambledDays.has(this.activeDay)) {
      return;
    }

    this.scrambledDays.add(this.activeDay);

    const activeSchedule = document.querySelector(`.schedule.active`);
    if (!activeSchedule) return;

    const timeElements = activeSchedule.querySelectorAll('.time');
    const titleElements = activeSchedule.querySelectorAll('.title');

    timeElements.forEach((el, index) => {
      const originalText = el.getAttribute('data-original') || el.textContent?.trim() || '';
      if (!el.getAttribute('data-original') && originalText) {
        el.setAttribute('data-original', originalText);
        this.startScrambling(`time-${this.activeDay}-${index}`, el as HTMLElement, originalText);
      }
    });

    titleElements.forEach((el, index) => {
      const originalText = el.getAttribute('data-original') || el.textContent?.trim() || '';
      if (!el.getAttribute('data-original') && originalText) {
        el.setAttribute('data-original', originalText);
        this.startScrambling(`title-${this.activeDay}-${index}`, el as HTMLElement, originalText);
      }
    });
  }

  private startScrambling(id: string, element: HTMLElement, originalText: string) {
    if (this.scrambleIntervals.has(id)) {
      clearInterval(this.scrambleIntervals.get(id)!);
    }

    let iteration = 0;
    const scrambleInterval = setInterval(() => {
      const scrambled = originalText
        .split('')
        .map((char, index) => {
          if (index < iteration) {
            return originalText[index];
          }
          if (/\s/.test(char)) return char;
          return this.scrambleChars[Math.floor(Math.random() * this.scrambleChars.length)];
        })
        .join('');

      element.textContent = scrambled;

      if (iteration >= originalText.length) {
        clearInterval(scrambleInterval);
        this.scrambleIntervals.delete(id);
      }

      iteration += 1 / 3;
    }, 30);

    this.scrambleIntervals.set(id, scrambleInterval);
  }

  private scrollAnimationFrame: number | null = null;

  @HostListener('window:scroll')
  onScroll() {
    if (this.scrollAnimationFrame) {
      cancelAnimationFrame(this.scrollAnimationFrame);
    }

    this.scrollAnimationFrame = requestAnimationFrame(() => {
      this.handleScroll();
    });
  }

  private handleScroll() {
    const scrollY = window.scrollY;
    const height = document.documentElement.scrollHeight - window.innerHeight;
    this.scrollProgress = height > 0 ? scrollY / height : 0;

    const previousDay = this.activeDay;
    if (this.scrollProgress < 0.25) {
      this.activeDay = 1;
    } else if (this.scrollProgress < 0.5) {
      this.activeDay = 2;
    } else if (this.scrollProgress < 0.75) {
      this.activeDay = 3;
    } else {
      this.activeDay = 4;
    }

    if (previousDay !== this.activeDay) {
      setTimeout(() => {
        this.scrambleActiveDay();
      }, 100);
    }

    this.updateBackgroundOpacity();
  }

  private updateBackgroundOpacity() {
    if (this.scrollProgress < 0.25) {
      this.overlay1Opacity = 1;
      this.overlay2Opacity = 0;
      this.overlay3Opacity = 0;
      this.overlay4Opacity = 0;
    } else if (this.scrollProgress < 0.5) {
      const localProgress = (this.scrollProgress - 0.25) / 0.25;
      this.overlay1Opacity = 1 - localProgress;
      this.overlay2Opacity = localProgress;
      this.overlay3Opacity = 0;
      this.overlay4Opacity = 0;
    } else if (this.scrollProgress < 0.75) {
      const localProgress = (this.scrollProgress - 0.5) / 0.25;
      this.overlay1Opacity = 0;
      this.overlay2Opacity = 1 - localProgress;
      this.overlay3Opacity = localProgress;
      this.overlay4Opacity = 0;
    } else {
      const localProgress = (this.scrollProgress - 0.75) / 0.25;
      this.overlay1Opacity = 0;
      this.overlay2Opacity = 0;
      this.overlay3Opacity = 1 - localProgress;
      this.overlay4Opacity = localProgress;
    }
  }

  setDay(dayIndex: number) {
    this.activeDay = dayIndex;

    const targetProgress = (dayIndex - 1) * 0.25;
    const height = document.documentElement.scrollHeight - window.innerHeight;

    window.scrollTo({
      top: targetProgress * height,
      behavior: 'smooth'
    });

    setTimeout(() => {
      this.scrollProgress = targetProgress;
      this.updateBackgroundOpacity();
      this.scrambleActiveDay();
    }, 100);
  }

  ngOnDestroy() {
    if (this.scrollAnimationFrame) {
      cancelAnimationFrame(this.scrollAnimationFrame);
    }
    this.scrambleIntervals.forEach((interval) => {
      clearInterval(interval);
    });
    this.scrambleIntervals.clear();
  }
}
