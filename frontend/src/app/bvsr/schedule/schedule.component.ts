import { Component } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [NavbarComponent],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.css'
})
export class ScheduleComponent {
  ngOnInit() {
    document.title = "Schedule · BVSR Conference 2026";
  }


}
