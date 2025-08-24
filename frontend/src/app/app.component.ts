import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BvsrModule } from '../bvsr/bvsr.module';
import { MaterialModule } from '../material/material.module';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'TU Darmstadt Space Technology e.V.';
}
