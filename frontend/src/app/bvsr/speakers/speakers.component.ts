import { Component } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { FooterComponent } from "../footer/footer.component";

@Component({
  selector: 'app-speakers',
  standalone: true,
  imports: [NavbarComponent, FooterComponent],
  templateUrl: './speakers.component.html',
  styleUrl: './speakers.component.css'
})
export class SpeakersComponent {
  ngOnInit() {
    document.title = "Speakers · BVSR Conference 2026";
  }


}
