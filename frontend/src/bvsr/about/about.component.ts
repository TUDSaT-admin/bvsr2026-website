import { Component } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { MaterialModule } from '../../material/material.module';


@Component({
  selector: 'app-about',
  standalone: true,
  imports: [NavbarComponent, MaterialModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {

}
