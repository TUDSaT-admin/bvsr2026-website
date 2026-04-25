import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { FooterComponent } from "../footer/footer.component";
import { SeoService } from '../../services/seo.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-speakers',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, TranslatePipe],
  templateUrl: './speakers.component.html',
  styleUrl: './speakers.component.css'
})
export class SpeakersComponent implements OnInit {
  constructor(private seoService: SeoService) {}

  ngOnInit() {
    this.seoService.updateSEO({
      title: 'Speakers · BVSR Conference 2026'
    });
  }


}
