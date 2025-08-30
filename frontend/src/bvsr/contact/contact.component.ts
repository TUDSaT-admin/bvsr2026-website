import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../material/material.module';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [NavbarComponent, RouterModule,MaterialModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})


export class ContactComponent implements OnInit {
  ngOnInit() {
    document.title = "Contact · BVSR Conference 2026";

  }
}


// export class GetInTouchComponent {
//   socialLinks: SocialLink[] = [
//     {
//       name: 'Instagram',
//       url: 'https://www.instagram.com',
//       icon: '../../assets/icons/insta.jpg'
//     },
//     {
//       name: 'Discord',
//       url: 'https://discord.gg',
//       icon: '../../assets/icons/discordicon.jpg'
//     },
//     {
//       name: 'YouTube',
//       url: 'https://www.youtube.com',
//       icon: '../../assets/icons/youtubeicon.png'
//     },
//     {
//       name: 'LinkedIn',
//       url: 'https://www.linkedin.com',
//       icon: '../../assets/icons/linkedin.jpg'
//     }
//   ];
// }
