import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material/material.module';

@Component({
  selector: 'app-sponsor-form-dialog',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './sponsor-form-dialog.component.html',
  styleUrls: ['./sponsor-form-dialog.component.css']
})
export class SponsorFormDialogComponent {}
