import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { TourSelectionWizardComponent } from './tour-selection-wizard.component';
import { SeoService } from '../../services/seo.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-tour-selection',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, TourSelectionWizardComponent, TranslatePipe],
  templateUrl: './tour-selection.component.html',
  styleUrls: ['./tour-selection.component.css']
})
export class TourSelectionComponent implements OnInit {
  constructor(private seoService: SeoService) {}

  ngOnInit(): void {
    this.seoService.updateSEO({
      title: 'Tour selection · BVSR Conference 2026'
    });
  }
}
