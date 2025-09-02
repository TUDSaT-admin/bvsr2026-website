import { Component } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { MaterialModule } from '../../material/material.module';
import { CommonModule } from '@angular/common';
import { SponsorFormDialogComponent } from '../sponsor-form-dialog/sponsor-form-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-sponsers',
  standalone: true,
  imports: [NavbarComponent, MaterialModule, CommonModule],
  templateUrl: './sponsers.component.html',
  styleUrls: ['./sponsers.component.css']
})
export class SponsersComponent {
  constructor(private dialog: MatDialog) {}

  ngOnInit() {
    document.title = "Sponsers · BVSR Conference 2026";
  }

  openPopup() {
    this.dialog.open(SponsorFormDialogComponent, {
      width: '600px',
    });
  }
}
