import { Component, HostListener, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from "../navbar/navbar.component";
import { FooterComponent } from "../footer/footer.component";
import { SeoService } from '../../services/seo.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { I18nService } from '../../services/i18n.service';

interface SpeakerEntry {
  id: string;
  name: string;
  translationKey: string;
  image: string;
  imageCredit?: string;
  contentLength: number;
}

@Component({
  selector: 'app-speakers',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent, TranslatePipe],
  templateUrl: './speakers.component.html',
  styleUrl: './speakers.component.css'
})
export class SpeakersComponent implements OnInit {
  selectedSpeakerId: string | null = null;
  private readonly i18n = inject(I18nService);

  readonly speakers: SpeakerEntry[] = [
    {
      id: 'volker-schmid',
      name: 'Volker Schmid',
      translationKey: 'speakers.items.volkerSchmid',
      image: 'assets/images/volkerSchmid.jpg',
      imageCredit: '© DLR/A.Schütz',
      contentLength: 10
    },
    {
      id: 'holger-krag',
      name: 'Holger Krag',
      translationKey: 'speakers.items.holgerKrag',
      image: 'assets/images/holgerKrag.jpg',
      contentLength: 11
    },
    {
      id: 'michael-boss',
      name: 'Michael Boss',
      translationKey: 'speakers.items.michaelBoss',
      image: 'assets/images/michaelBoss.png',
      contentLength: 3
    },
    {
      id: 'momentum-aerospace',
      name: 'Momentum Aerospace',
      translationKey: 'speakers.items.momentumAerospace',
      image: 'assets/images/MAVertical.jpg',
      contentLength: 1
    },
    {
      id: 'Jan Wörner',
      name: 'Jan Wörner',
      translationKey: 'speakers.items.janWoerner',
      image: 'assets/images/janWoerner.png',
      contentLength: 1
    }
  ];

  constructor(private seoService: SeoService) {}

  ngOnInit() {
    this.seoService.updateSEO({
      title: 'Speakers · BVSR Conference 2026'
    });
  }

  selectSpeaker(speakerId: string): void {
    this.selectedSpeakerId = speakerId;
  }

  closeSpeaker(): void {
    this.selectedSpeakerId = null;
  }

  @HostListener('document:keydown.escape')
  handleEscape(): void {
    this.closeSpeaker();
  }

  get selectedSpeaker(): SpeakerEntry | null {
    return this.speakers.find((speaker) => speaker.id === this.selectedSpeakerId) ?? null;
  }

  /** Returns translated text for a speaker field; empty string if blank. */
  tr(speaker: SpeakerEntry, suffix: string): string {
    // Read the lang signal so Angular tracks it for change detection
    void this.i18n.lang();
    return this.i18n.translate(`${speaker.translationKey}.${suffix}`);
  }

  /** Returns translated paragraphs for a speaker's bio content. */
  contentParagraphs(speaker: SpeakerEntry): string[] {
    void this.i18n.lang();
    const out: string[] = [];
    for (let i = 0; i < speaker.contentLength; i++) {
      out.push(this.i18n.translate(`${speaker.translationKey}.content.${i}`));
    }
    return out;
  }
}
