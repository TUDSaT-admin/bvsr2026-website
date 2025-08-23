import { Routes } from '@angular/router';
import { BvsrModule } from '../bvsr/bvsr.module';
import { HomeComponent } from '../bvsr/home/home.component';
import { AboutComponent } from '../bvsr/about/about.component';

export const routes: Routes = [
  {path: '' ,  component: HomeComponent},
  {path: 'about', component:AboutComponent}
];
