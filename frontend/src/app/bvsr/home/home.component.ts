import { Component } from '@angular/core';

import { NavbarComponent } from "../navbar/navbar.component";
import { MaterialModule } from '../../material/material.module';
import { RouterModule } from '@angular/router';
import { FooterComponent } from "../footer/footer.component";
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NavbarComponent, MaterialModule, RouterModule, FooterComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})

export class HomeComponent {
  ngOnInit() {
    document.title = "BVSR Conference 2026";
  }

}
