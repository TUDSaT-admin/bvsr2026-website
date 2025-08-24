import { Component } from '@angular/core';

import { NavbarComponent } from "../navbar/navbar.component";
import { MaterialModule } from '../../material/material.module';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NavbarComponent, MaterialModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})

export class HomeComponent {

}
