import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { BackgroundComponent } from "./background/background.component";
import { FooterComponent } from "./bvsr/footer/footer.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, BackgroundComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'TU Darmstadt Space Technology e.V.';
}
