import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NavbarComponent } from "../navbar/navbar.component";
import { MaterialModule } from '../../material/material.module';
import { RouterModule } from '@angular/router';
import { FooterComponent } from "../footer/footer.component";
import { SeoService } from '../../services/seo.service';
import { RegistrationService } from '../../services/registration.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NavbarComponent, MaterialModule, RouterModule, FooterComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {
  registrationSoldOut = false;

  constructor(
    private seoService: SeoService,
    private registrationService: RegistrationService
  ) {}

  ngOnInit() {
    this.seoService.updateSEO({
      title: 'BVSR Conference 2026'
    });
    void this.registrationService.fetchRegistrationCapacity().then((cap) => {
      if (cap?.soldOut) {
        this.registrationSoldOut = true;
      }
    });
  }

}
