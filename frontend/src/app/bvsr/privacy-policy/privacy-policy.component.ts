import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { SeoService } from '../../services/seo.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [NavbarComponent, TranslatePipe],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.css'
})
export class PrivacyPolicyComponent implements OnInit {
  constructor(private seoService: SeoService) {}

  ngOnInit() {
    this.seoService.updateSEO({
      title: 'Privacy Policy · BVSR Conference 2026'
    });
  }

}
