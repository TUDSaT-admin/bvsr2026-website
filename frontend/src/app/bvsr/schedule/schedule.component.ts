import { Component, OnInit, OnDestroy, HostListener, AfterViewInit } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { SeoService } from '../../services/seo.service';
 
@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [NavbarComponent],
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
 
  private scrambleIntervals: Map<string, any> = new Map();
  private readonly scrambleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  private scrambledDays: Set<number> = new Set();
 
  constructor(private seoService: SeoService) {}
 
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
      clearInterval(this.scrambleIntervals.get(id));
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