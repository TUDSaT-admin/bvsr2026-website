import { Routes } from '@angular/router';
import { AboutComponent } from './bvsr/about/about.component';
import { ContactComponent } from './bvsr/contact/contact.component';
import { HomeComponent } from './bvsr/home/home.component';
import { ScheduleComponent } from './bvsr/schedule/schedule.component';
import { SpeakersComponent } from './bvsr/speakers/speakers.component';
import { SponsersComponent } from './bvsr/sponsers/sponsers.component';
import { ImpressumComponent } from './bvsr/impressum/impressum.component';
import { PrivacyPolicyComponent } from './bvsr/privacy-policy/privacy-policy.component';

export const routes: Routes = [
  {path: '' ,  component: HomeComponent},
  {path: 'about', component:AboutComponent},
  {path: 'schedule', component:ScheduleComponent},
  {path: 'speakers', component:SpeakersComponent},
  {path: 'sponsers', component:SponsersComponent},
  {path: 'contact', component:ContactComponent},
  {path: 'privacy-policy', component: PrivacyPolicyComponent },
  {path: 'impressum', component: ImpressumComponent }

];
