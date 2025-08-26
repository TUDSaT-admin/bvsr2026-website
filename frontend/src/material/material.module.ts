import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';

import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatGridListModule } from '@angular/material/grid-list';



@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatCardModule,MatDialogModule,MatFormFieldModule,MatInputModule,MatSelectModule,
    MatGridListModule
  ],
  exports: [
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatCardModule,MatDialogModule,MatFormFieldModule,MatInputModule,MatSelectModule,
    MatGridListModule
  ]
})
export class MaterialModule { }
