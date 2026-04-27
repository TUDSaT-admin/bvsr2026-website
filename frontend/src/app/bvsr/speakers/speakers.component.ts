import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from "../navbar/navbar.component";
import { FooterComponent } from "../footer/footer.component";
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-speakers',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent],
  templateUrl: './speakers.component.html',
  styleUrl: './speakers.component.css'
})
export class SpeakersComponent implements OnInit {
  selectedSpeakerId: string | null = null;

  readonly speakers = [
    {
      id: 'volker-schmid',
      name: 'Volker Schmid',
      position: 'Deutsches Zentrum fur Luft- und Raumfahrt (DLR)',
      image: 'assets/images/volkerSchmid.jpg',
      talkTitle: 'The ISS Missions of Alexander Gerst and Matthias Maurer and Their Societal Relevance',
      content: [
        'In 1998, the first module of the International Space Station (ISS) was launched. The largest project in human spaceflight initially progressed slowly and faced strong criticism, especially in Europe and Germany, where many questioned its cost-benefit ratio.',
        'Following the Space Shuttle Columbia disaster in 2003, European contributions were delayed until 2008.',
        'Thomas Reiter became the first German ESA astronaut on the ISS. Although the first German experiment took place in 2001, full utilization only began in 2011 with a permanent six-person crew.',
        'In 2014, Alexander Gerst spent six months aboard the ISS. His "Blue Dot" mission created widespread public interest in Germany, which continued during his second mission in 2018, when he served as commander.',
        'In 2021, Matthias Maurer became the fourth German astronaut on the ISS and the 600th human in space.',
        'Germany is the largest European stakeholder in the ISS. This raises key questions: Do we benefit from it, or are we only contributing financially? How does logistics work? How are experiments transported to space? What does everyday life on the ISS look like, and what challenges arise?',
        'This talk explores the history, present, and future of the ISS, highlighting its results and wide range of applications through the missions of Gerst and Maurer.',
        'It also explains the complex global cooperation behind the ISS, supported by real mission insights, images, and anecdotes. Selected experiments demonstrate the immense future potential of low Earth orbit as an emerging economic space.',
        'Additionally, the talk addresses the societal relevance of ISS missions, key scientific outcomes, and the cost-benefit relationship. It offers a behind-the-scenes perspective, from the teams planning, preparing, and executing these missions.',
        'Finally, the ISS is presented as a testing ground for long-duration missions to the Moon and Mars. With its planned deorbit in 2031, the talk concludes with an outlook on the future of human space exploration and its continued importance for Earth.'
      ]
    },
    {
      id: 'holger-krag',
      name: 'Holger Krag',
      position: 'Head of Space Safety Programme Office, ESA',
      image: 'assets/images/holgerKrag.jpg',
      talkTitle: '',
      content: [
        'Holger Krag is Head of the Space Safety Programme Office at the European Space Agency, where he leads Europe\'s efforts to ensure safe and sustainable operations in space.',
        'He holds a Master\'s degree in Aerospace Engineering from the Technical University of Braunschweig and began his career with research focused on space debris modelling and surveillance.',
        'In 2002, he joined Thales ATM in Germany and contributed to the development of the Galileo Ground Mission Segment, including validation systems, working closely with international teams in France.',
        'Since joining ESA in 2006, he has played a key role in developing space debris risk models, collision avoidance systems, and early space surveillance capabilities. In 2014, he became Head of the Space Debris Office, supporting ESA\'s Space Situational Awareness Programme.',
        'In 2019, he took over leadership of the Space Safety Programme, expanding its scope to include:',
        'Space debris monitoring and mitigation.',
        'Space weather forecasting.',
        'Planetary defence.',
        'The programme includes major missions such as Lagrange, Hera, and ADRIOS, aimed at protecting Earth and space infrastructure.',
        'His responsibilities include defining programme strategy, coordinating with international partners, managing resources and contracts, and representing ESA globally on space safety matters.',
        'Through his work, Holger Krag contributes to shaping the future of space as a secure, sustainable, and operational environment for science, industry, and society.'
      ]
    }
  ];

  constructor(private seoService: SeoService) {}

  ngOnInit() {
    this.seoService.updateSEO({
      title: 'Speakers · BVSR Conference 2026'
    });
  }

  selectSpeaker(speakerId: string): void {
    this.selectedSpeakerId = speakerId;
  }

  closeSpeaker(): void {
    this.selectedSpeakerId = null;
  }

  @HostListener('document:keydown.escape')
  handleEscape(): void {
    this.closeSpeaker();
  }

  get selectedSpeaker() {
    return this.speakers.find((speaker) => speaker.id === this.selectedSpeakerId) ?? null;
  }
}
