import { Component, OnInit } from '@angular/core';

import { NavbarComponent } from "../navbar/navbar.component";
import { MaterialModule } from '../../material/material.module';
import { RouterModule } from '@angular/router';
import { FooterComponent } from "../footer/footer.component";
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NavbarComponent, MaterialModule, RouterModule, FooterComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {
  constructor(private seoService: SeoService) {}

  ngOnInit() {
    this.seoService.updateSEO({
      title: 'BVSR Conference 2026'
    });
  }

}
