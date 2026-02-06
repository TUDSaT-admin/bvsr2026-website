import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { FooterComponent } from "../footer/footer.component";
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [NavbarComponent, FooterComponent],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.css'
})
export class ScheduleComponent implements OnInit {
  constructor(private seoService: SeoService) {}

  ngOnInit() {
    this.seoService.updateSEO({
      title: 'Schedule · BVSR Conference 2026'
    });
  }


}
