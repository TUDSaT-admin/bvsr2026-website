import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-announcements',
  standalone: true,
  imports: [NavbarComponent, FooterComponent],
  templateUrl: './announcements.component.html',
  styleUrl: './announcements.component.css'
})
export class AnnouncementsComponent implements OnInit {
  constructor(private seoService: SeoService) {}

  ngOnInit(): void {
    this.seoService.updateSEO({
      title: 'Announcements · BVSR Conference 2026'
    });
  }
}
