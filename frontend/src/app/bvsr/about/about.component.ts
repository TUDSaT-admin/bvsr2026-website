import { Component } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { FooterComponent } from "../footer/footer.component";

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    MatCardModule,
    MatButtonModule,
    FooterComponent
],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent {
  ngOnInit() {
    document.title = "About · BVSR Conference 2026";
  }

  scrollTo(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

}

