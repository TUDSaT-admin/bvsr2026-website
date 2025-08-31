import { Component } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";

@Component({
  selector: 'app-speakers',
  standalone: true,
  imports: [NavbarComponent],
  templateUrl: './speakers.component.html',
  styleUrl: './speakers.component.css'
})
export class SpeakersComponent {
  ngOnInit() {
    document.title = "Speakers · BVSR Conference 2026";
  }


}
