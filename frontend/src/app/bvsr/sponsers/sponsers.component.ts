import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { MaterialModule } from '../../material/material.module';
import { CommonModule } from '@angular/common';
import { SponsorFormDialogComponent } from '../sponsor-form-dialog/sponsor-form-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { FooterComponent } from "../footer/footer.component";
import { SeoService } from '../../services/seo.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

/** Logo frame size on the page (reflects sponsorship / partnership level) */
export type LogoDisplaySize =
  | 'tier-primary'
  | 'tier-sponsor'
  | 'tier-friends'
  | 'partner-large'
  | 'partner'
  | 'donation';

export interface SupporterLogo {
  name: string;
  tier?: string;
  amount?: string;
  /** Visual weight of the logo area */
  logoSize?: LogoDisplaySize;
  /** Place image at e.g. assets/sponsors/serco.png — omit for placeholder */
  logoSrc?: string;
  showPlaceholder?: boolean;
}

@Component({
  selector: 'app-sponsers',
  standalone: true,
  imports: [NavbarComponent, MaterialModule, CommonModule, FooterComponent, TranslatePipe],
  templateUrl: './sponsers.component.html',
  styleUrls: ['./sponsers.component.css']
})
export class SponsersComponent implements OnInit {
  readonly programListIndices = [0, 1, 2];
  readonly tier1BenefitIndices = [0, 1, 2];
  readonly tier2BenefitIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  readonly tier3BenefitIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  readonly extraBoothIndices = [0, 1];

  /** Tier 2 — Sponsors package */
  sponsorsSponsorTier: SupporterLogo[] = [
    { name: 'Serco', tier: 'Sponsor', logoSize: 'tier-sponsor', logoSrc: 'assets/sponsors/serco.png' },
  ];

  /** Tier 1 — Friends package */
  sponsorsFriendsTier: SupporterLogo[] = [
    { name: 'Würth Elektronik', tier: 'Friends', logoSize: 'tier-friends', logoSrc: 'assets/sponsors/wurth.png' },
    { name: 'Merck', tier: 'Friends', logoSize: 'tier-friends', logoSrc: 'assets/sponsors/merck.JPG' },
  ];

  donations: SupporterLogo[] = [
    { name: 'Sparkasse', logoSize: 'donation', logoSrc: 'assets/sponsors/sparkasse.jpg' },
    { name: 'Kultur Förderkreis Darmstadt', logoSize: 'donation', logoSrc: 'assets/sponsors/KulturFörderkreisDarmstadt.png' },
  ];

  partners: SupporterLogo[] = [
    { name: 'DLR', logoSize: 'partner-large', logoSrc: 'assets/sponsors/dlr.jpg' },
    { name: 'GSI', logoSize: 'partner-large', logoSrc: 'assets/sponsors/gsi.png' },
  ];

  constructor(
    private dialog: MatDialog,
    private seoService: SeoService
  ) {}

  ngOnInit() {
    this.seoService.updateSEO({
      title: 'Sponsors · BVSR Conference 2026'
    });
  }

  openPopup() {
    this.dialog.open(SponsorFormDialogComponent, {
      width: '600px',
    });
  }

  onLogoError(item: SupporterLogo) {
    item.showPlaceholder = true;
  }
}
