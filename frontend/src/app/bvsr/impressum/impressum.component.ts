import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-impressum',
  standalone: true,
  imports: [NavbarComponent],
  templateUrl: './impressum.component.html',
  styleUrl: './impressum.component.css'
})
export class ImpressumComponent implements OnInit {
  constructor(private seoService: SeoService) {}

  ngOnInit() {
    this.seoService.updateSEO({
      title: 'Impressum · BVSR Conference 2026'
    });
  }

}
