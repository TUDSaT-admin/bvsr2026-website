import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export const TOUR_REGISTRATION_URL = 'https://bvsr.tudsat.space/tour-registration';

@Component({
  selector: 'app-tour-registration-prompt-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './tour-registration-prompt-dialog.component.html',
  styleUrls: ['./tour-registration-prompt-dialog.component.css'],
})
export class TourRegistrationPromptDialogComponent {
  readonly tourUrl = TOUR_REGISTRATION_URL;

  constructor(private dialogRef: MatDialogRef<TourRegistrationPromptDialogComponent>) {}

  openTourRegistration(): void {
    window.open(this.tourUrl, '_blank', 'noopener,noreferrer');
    this.dialogRef.close(true);
  }

  dismiss(): void {
    this.dialogRef.close(false);
  }
}
