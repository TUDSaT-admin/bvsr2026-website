import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';


@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,MatDialogModule,MatFormFieldModule,MatInputModule,MatSelectModule
  ],
  exports: [
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,MatDialogModule,MatFormFieldModule,MatInputModule,MatSelectModule
  ]
})
export class MaterialModule { }
