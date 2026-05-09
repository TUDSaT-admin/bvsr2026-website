import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TourSelectionWizardComponent } from '../../tour-selection/tour-selection-wizard.component';

export interface TourRegistrationPromptDialogData {
  email?: string;
  firstName?: string;
  lastName?: string;
}

@Component({
  selector: 'app-tour-registration-prompt-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, TourSelectionWizardComponent],
  templateUrl: './tour-registration-prompt-dialog.component.html',
  styleUrls: ['./tour-registration-prompt-dialog.component.css']
})
export class TourRegistrationPromptDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<TourRegistrationPromptDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TourRegistrationPromptDialogData | null
  ) {}

  onWizardCompleted(): void {
    this.dialogRef.close(true);
  }
}
