import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { MaterialModule } from '../../material/material.module';
import { SeoService } from '../../services/seo.service';

interface PubEntry {
  icon: string;
  iconAlt: string;
  iconLabel: string;
  name: string;
  address?: string;
  mapsUrl: string;
  iframeSrc: string;
}

interface ViewPubEntry extends PubEntry {
  safeSrc: SafeResourceUrl;
}

const PUB_CRAWL: PubEntry[] = [
  {
    iconLabel: 'GroundStation',
    icon: 'assets/pubicons/Groundstation.png',
    iconAlt: 'GroundStation icon',
    name: 'Red Barn | Western BBQ Restaurant',
    mapsUrl: 'https://maps.google.com/?q=Red+Barn+Western+BBQ+Restaurant+Darmstadt',
    iframeSrc:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2571.296963415163!2d8.659720912518143!3d49.87444957136913!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47bd706f381077bd%3A0x4348d598b1f740e3!2sRed%20Barn%20%7C%20Western%20BBQ%20Restaurant!5e0!3m2!1sen!2sde!4v1778770111273!5m2!1sen!2sde'
  },
  {
    iconLabel: 'Satellite',
    icon: 'assets/pubicons/satellite.png',
    iconAlt: 'Satellite icon',
    name: 'Cafe Chaos | Darmstadt',
    mapsUrl: 'https://maps.google.com/?q=Cafe+Chaos+Darmstadt',
    iframeSrc:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2571.4267633357917!2d8.658299312517956!3d49.87201177136854!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47bd706f908b43c5%3A0xe16d22cb1bb1c8e0!2sCafe%20Chaos%20-%20Darmstadt!5e0!3m2!1sen!2sde!4v1778770207781!5m2!1sen!2sde'
  },
  {
    iconLabel: 'Moon',
    icon: 'assets/pubicons/Moon.png',
    iconAlt: 'Moon icon',
    name: 'Wellnitz Café & Bar',
    mapsUrl: 'https://maps.google.com/?q=Wellnitz+Cafe+Bar+Darmstadt',
    iframeSrc:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2571.122675554473!2d8.654810112518287!3d49.87772277136955!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47bd7066fb5d8e4b%3A0xe453b3e000c52433!2sWellnitz%20Caf%C3%A9%20%26%20Bar%20-%20Darmstadt!5e0!3m2!1sen!2sde!4v1778770280202!5m2!1sen!2sde'
  },
  {
    iconLabel: 'Constellation',
    icon: 'assets/pubicons/Constellation.png',
    iconAlt: 'Constellation icon',
    name: 'Havana Restaurant',
    mapsUrl: 'https://maps.google.com/?q=Havana+Restaurant+Darmstadt',
    iframeSrc:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2571.10492788101!2d8.657986012518304!3d49.878056071369556!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47bd7067cd812287%3A0x346907801a27709a!2sHavana%20Restaurant%20-%20Darmstadt!5e0!3m2!1sen!2sde!4v1778770311670!5m2!1sen!2sde'
  },
  {
    iconLabel: 'Proton',
    icon: 'assets/pubicons/Proton.png',
    iconAlt: 'Proton icon',
    name: 'Grohe Brauhaus',
    mapsUrl: 'https://maps.google.com/?q=Grohe+Brauhaus+Darmstadt',
    iframeSrc:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2571.5773601253063!2d8.654169712517852!3d49.869183271368065!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47bd707ac1acb1bd%3A0x196e415559f8797d!2sGrohe%20Brauhaus!5e0!3m2!1sen!2sde!4v1778770357255!5m2!1sen!2sde'
  },
  {
    iconLabel: 'Earth',
    icon: 'assets/pubicons/Earth.png',
    iconAlt: 'Earth icon',
    name: 'COCO Restaurante Y Bar Mexicano',
    mapsUrl: 'https://maps.google.com/?q=COCO+Restaurante+Y+Bar+Mexicano+Darmstadt',
    iframeSrc:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5142.786620276746!2d8.641988512518012!3d49.872640071368686!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47bd71003811c6c7%3A0xc1df0a66aca39a3a!2sCOCO%20Restaurante%20Y%20Bar%20Mexicano!5e0!3m2!1sen!2sde!4v1778770392634!5m2!1sen!2sde'
  },
  {
    iconLabel: 'Alien',
    icon: 'assets/pubicons/Alien.png',
    iconAlt: 'Alien icon',
    name: '3klang',
    mapsUrl: 'https://maps.google.com/?q=3klang+Darmstadt',
    iframeSrc:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2570.96399239711!2d8.658697512518433!3d49.88070277137004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47bd705d5bd9e18f%3A0xea071acd79a192fc!2s3klang!5e0!3m2!1sen!2sde!4v1778770423331!5m2!1sen!2sde'
  },
  {
    iconLabel: 'Saturn',
    icon: 'assets/pubicons/Saturn.png',
    iconAlt: 'Saturn icon',
    name: 'An Sibin',
    mapsUrl: 'https://maps.google.com/?q=An+Sibin+Darmstadt',
    iframeSrc:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2571.3799032154966!2d8.656719612518012!3d49.872891871368786!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47bd71940f569ccd%3A0x48eba6d674da3363!2sAn%20Sibin%20Darmstadt%20GmbH%20-%20Darmstadt!5e0!3m2!1sen!2sde!4v1778770455303!5m2!1sen!2sde'
  },
  {
    iconLabel: 'Asteroid',
    icon: 'assets/pubicons/Asteroid.png',
    iconAlt: 'Asteroid icon',
    name: 'Hotzenplotz',
    mapsUrl: 'https://maps.google.com/?q=Hotzenplotz+Darmstadt',
    iframeSrc:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2571.1315892946354!2d8.656275012518204!3d49.87755537136963!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47bd706652201429%3A0x5faa24ffa817f297!2sHotzenplotz!5e0!3m2!1sen!2sde!4v1778770497586!5m2!1sen!2sde'
  },
  {
    iconLabel: 'Astronaut',
    icon: 'assets/pubicons/Astronaut.png',
    iconAlt: 'Astronaut icon',
    name: 'Green Gorilla',
    mapsUrl: 'https://maps.google.com/?q=Green+Gorilla+Darmstadt',
    iframeSrc:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2571.438833671866!2d8.646490612518024!3d49.87178507136858!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47bd710049ef59a3%3A0x52075e7949971231!2sGreen%20Gorilla!5e0!3m2!1sen!2sde!4v1778770538117!5m2!1sen!2sde'
  },
  {
    iconLabel: 'BinaryCode',
    icon: 'assets/pubicons/BinaryCode.png',
    iconAlt: 'Binary Code icon',
    name: 'Café Hess',
    mapsUrl: 'https://maps.google.com/?q=Cafe+Hess+Darmstadt',
    iframeSrc:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2571.576258025552!2d8.655485612517893!3d49.86920397136807!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47bd707aa33ee5ed%3A0xc240445f41e4dacb!2sCaf%C3%A9%20Hess%20-%20Darmstadt!5e0!3m2!1sen!2sde!4v1778770567451!5m2!1sen!2sde'
  },
  {
    iconLabel: 'Rocket',
    icon: 'assets/pubicons/Rocket.png',
    iconAlt: 'Rocket icon',
    name: 'Zoo',
    mapsUrl: 'https://maps.google.com/?q=Zoo+Bar+Darmstadt',
    iframeSrc:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2571.4652956264144!2d8.65329441251796!3d49.8712880713685!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47bd7064d9411ce9%3A0xe6162f16826ac72b!2sZoo!5e0!3m2!1sen!2sde!4v1778770603455!5m2!1sen!2sde'
  }
];

@Component({
  selector: 'app-pub-crawl',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent, MaterialModule],
  templateUrl: './pub-crawl.component.html',
  styleUrl: './pub-crawl.component.css'
})
export class PubCrawlComponent implements OnInit {
  pubs: ViewPubEntry[] = [];

  constructor(
    private seoService: SeoService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.seoService.updateSEO({
      title: 'Pub Crawl · BVSR Conference 2026',
      description:
        'Find your group for the Darmstadt pub crawl — each icon on your seat points to a bar.'
    });

    this.pubs = PUB_CRAWL.map(p => ({
      ...p,
      safeSrc: this.sanitizer.bypassSecurityTrustResourceUrl(p.iframeSrc)
    }));
  }

  trackPub(_: number, p: ViewPubEntry): string {
    return p.iconLabel;
  }
}
