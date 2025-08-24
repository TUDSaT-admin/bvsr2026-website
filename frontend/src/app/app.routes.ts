import { Routes } from '@angular/router';
import { BvsrModule } from '../bvsr/bvsr.module';
import { HomeComponent } from '../bvsr/home/home.component';
import { AboutComponent } from '../bvsr/about/about.component';
import { ScheduleComponent } from '../bvsr/schedule/schedule.component';
import { SpeakersComponent } from '../bvsr/speakers/speakers.component';
import { SponsersComponent } from '../bvsr/sponsers/sponsers.component';
import { ContactComponent } from '../bvsr/contact/contact.component';

export const routes: Routes = [
  {path: '' ,  component: HomeComponent},
  {path: 'about', component:AboutComponent},
  {path: 'schedule', component:ScheduleComponent},
  {path: 'speakers', component:SpeakersComponent},
  {path: 'sponsers', component:SponsersComponent},
  {path: 'contact', component:ContactComponent}

];
