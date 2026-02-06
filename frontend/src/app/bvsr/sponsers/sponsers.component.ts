import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { MaterialModule } from '../../material/material.module';
import { CommonModule } from '@angular/common';
import { SponsorFormDialogComponent } from '../sponsor-form-dialog/sponsor-form-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { FooterComponent } from "../footer/footer.component";
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-sponsers',
  standalone: true,
  imports: [NavbarComponent, MaterialModule, CommonModule, FooterComponent],
  templateUrl: './sponsers.component.html',
  styleUrls: ['./sponsers.component.css']
})
export class SponsersComponent implements OnInit {
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
}
