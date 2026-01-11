import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { FooterComponent } from "../footer/footer.component";

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    MatButtonModule,
    RouterModule,
    FooterComponent
],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit, AfterViewInit, OnDestroy {
  timelineItemsVisible: boolean[] = [false, false, false, false];
  pastConferencesVisible: boolean[] = [false, false, false, false];
  timelineFooterVisible: boolean = false;
  private observers: IntersectionObserver[] = [];

  ngOnInit() {
    document.title = "About · BVSR Conference 2026";
    document.body.style.scrollSnapType = 'y mandatory';
    document.body.style.scrollBehavior = 'smooth';
    document.documentElement.style.scrollSnapType = 'y mandatory';
    document.documentElement.style.scrollBehavior = 'smooth';
  }

  ngOnDestroy() {
    this.observers.forEach(observer => observer.disconnect());
    document.body.style.scrollSnapType = '';
    document.body.style.scrollBehavior = '';
    document.documentElement.style.scrollSnapType = '';
    document.documentElement.style.scrollBehavior = '';
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.setupTimelineAnimations();
    }, 100);
  }

  private setupTimelineAnimations() {
    const timelineSection = document.querySelector('.timeline-section');
    if (!timelineSection) return;

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const timelineItems = document.querySelectorAll('.timeline-item');
            const timelineItemsCount = timelineItems.length;
            timelineItems.forEach((item, index) => {
              setTimeout(() => {
                this.timelineItemsVisible[index] = true;
              }, index * 300);
            });

            setTimeout(() => {
              this.setupPastConferencesAnimations();
            }, timelineItemsCount * 300 + 200);

            sectionObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.2
      }
    );
    sectionObserver.observe(timelineSection);
    this.observers.push(sectionObserver);
  }

  private setupPastConferencesAnimations() {
    const pastConferenceItems = document.querySelectorAll('.past-conference-item');
    if (pastConferenceItems.length === 0) return;

    const containerObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            pastConferenceItems.forEach((item, index) => {
              setTimeout(() => {
                this.pastConferencesVisible[index] = true;
              }, index * 200);
            });

            setTimeout(() => {
              this.timelineFooterVisible = true;
            }, pastConferenceItems.length * 200 + 300);

            containerObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1
      }
    );

    const pastConferencesContainer = document.querySelector('.past-conferences');
    if (pastConferencesContainer) {
      containerObserver.observe(pastConferencesContainer);
      this.observers.push(containerObserver);
    }
  }
}
