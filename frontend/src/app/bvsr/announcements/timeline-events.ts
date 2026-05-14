export interface TimelineLocation {
  label: string;
  description?: string;
  iframeSrc?: string;
}

export interface TimelineActionLink {
  label: string;
  routerLink: string;
  icon?: string;
}

export interface TimelineEvent {
  id: string;
  dayLabel: string;
  dayKey: string;
  start: string;
  end?: string;
  timeLabel: string;
  title: string;
  subtitle?: string;
  details?: string[];
  locations?: TimelineLocation[];
  actionLink?: TimelineActionLink;
}

const S1_05 =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2571.1532292511365!2d8.654950612518306!3d49.87714897136948!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47bd7066f1300a21%3A0x3bb60871395e06da!2sS1%7C05%20Maschinenhaus!5e0!3m2!1sen!2sde!4v1778693673379!5m2!1sen!2sde';

const GSI_MEETING_POINT =
  'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d321.42678385100277!2d8.6309058!3d49.8722464!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47bd71007c3505ef%3A0x1f2d6a01a6153f9c!2sTaxistand!5e0!3m2!1sen!2sde!4v1778695618961!5m2!1sen!2sde';

const ESOC =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d10286.006105884744!2d8.623219729396823!3d49.87060758929039!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47bd7099f19cfac5%3A0xa1f760e143dac291!2sESOC%20-%20European%20Space%20Operations%20Centre!5e0!3m2!1sen!2sde!4v1778695401309!5m2!1sen!2sde';

const GSI =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6503.492882436546!2d8.668615335435396!3d49.93283206042983!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47bd71856b29d64b%3A0x5a1771fdb6cbd633!2sDarmstadt-Wixhausen%20GSI%20Helmholtzzentrum!5e0!3m2!1sen!2sde!4v1778694010999!5m2!1sen!2sde';

const AUDIMAX =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2571.24747656883!2d8.653894812518152!3d49.875378971369216!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47bd70643aea76a1%3A0x1affcbba14cbd7bd!2sAudimax%2C%20Karolinenpl.%205%2C%2064289%20Darmstadt!5e0!3m2!1sen!2sde!4v1778694240276!5m2!1sen!2sde';

const ORANGERIE =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2572.180557624236!2d8.650898312517297!3d49.85785287136617!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47bd7a831f6fe8b9%3A0xab393081b9159a00!2sOrangerie%20Darmstadt%2C%2064285%20Darmstadt-Bessungen!5e0!3m2!1sen!2sde!4v1778695726432!5m2!1sen!2sde';

const BBQ =
  'https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d295.7344132564359!2d8.684527141271875!3d49.86211248286587!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zNDnCsDUxJzQ0LjAiTiA4wrA0MScwNC4yIkU!5e1!3m2!1sen!2sde!4v1778700304908!5m2!1sen!2sde';

const L4_02 =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2572.0001462487016!2d8.676366756686784!3d49.86124189818833!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47bd70088c4fce85%3A0x23a7ab3d0b03e4b8!2sL4%7C02%20H%C3%B6rsaal-%20und%20Medienzentrum%20(HMZ)!5e0!3m2!1sen!2sde!4v1778695747547!5m2!1sen!2sde';

export const TIMELINE_EVENTS: TimelineEvent[] = [
  // ───────── Thursday, 14 May ─────────
  {
    id: 'thu-arrival',
    dayLabel: 'Thursday · 14 May',
    dayKey: '2026-05-14',
    start: '2026-05-14T13:00:00+02:00',
    end: '2026-05-14T14:00:00+02:00',
    timeLabel: '13:00 – 14:00',
    title: 'Arrival & Registration',
    subtitle: 'Welcome to Darmstadt! Pick up your conference pass.',
    details: [
      'Check in at S1|05 Maschinenhaus.',
      'Grab some food downstairs before the General Assembly starts.'
    ],
    locations: [{ label: 'S1|05 Maschinenhaus, TU Darmstadt', iframeSrc: S1_05 }]
  },
  {
    id: 'thu-general-assembly',
    dayLabel: 'Thursday · 14 May',
    dayKey: '2026-05-14',
    start: '2026-05-14T14:00:00+02:00',
    end: '2026-05-14T16:00:00+02:00',
    timeLabel: '14:00 – 16:00',
    title: 'General Assembly',
    subtitle: 'Room S1|05/122.',
    locations: [{ label: 'S1|05/122, Maschinenhaus', iframeSrc: S1_05 }]
  },
  {
    id: 'thu-intro',
    dayLabel: 'Thursday · 14 May',
    dayKey: '2026-05-14',
    start: '2026-05-14T16:30:00+02:00',
    end: '2026-05-14T16:45:00+02:00',
    timeLabel: '16:30 – 16:45',
    title: 'Welcome Ceremony',
    subtitle: 'Speaker: Prof. Oechsner.'
  },
  {
    id: 'thu-club-intros',
    dayLabel: 'Thursday · 14 May',
    dayKey: '2026-05-14',
    start: '2026-05-14T16:45:00+02:00',
    end: '2026-05-14T18:00:00+02:00',
    timeLabel: '16:45 – 18:00',
    title: 'Club Introductions',
    subtitle: 'Each club presents itself — grab food / drinks in the break.'
  },
  {
    id: 'thu-orga',
    dayLabel: 'Thursday · 14 May',
    dayKey: '2026-05-14',
    start: '2026-05-14T18:00:00+02:00',
    end: '2026-05-14T18:30:00+02:00',
    timeLabel: '18:00 – 18:30',
    title: 'Orga Presentation',
    subtitle: ''
  },
  {
    id: 'thu-workshop-tour-reg',
    dayLabel: 'Thursday · 14 May',
    dayKey: '2026-05-14',
    start: '2026-05-14T18:30:00+02:00',
    end: '2026-05-14T19:30:00+02:00',
    timeLabel: 'from 18:30',
    title: 'Workshop Registration',
    subtitle: 'Sign up for tours and workshop slots.'
  },
  {
    id: 'thu-pub',
    dayLabel: 'Thursday · 14 May',
    dayKey: '2026-05-14',
    start: '2026-05-14T19:30:00+02:00',
    end: '2026-05-14T23:30:00+02:00',
    timeLabel: 'from 19:30',
    title: 'Pub Night',
    subtitle: 'Mingle with everyone in the Darmstadt pub crawl. Use the icon in your seat to find the group you are in. If any doubts, contact us.',
    actionLink: {
      label: 'See all pub icons & bars',
      routerLink: '/pub-crawl',
      icon: 'local_bar'
    }
  },

  // ───────── Friday, 15 May ─────────
  {
    id: 'fri-tours',
    dayLabel: 'Friday · 15 May',
    dayKey: '2026-05-15',
    start: '2026-05-15T06:00:00+02:00',
    end: '2026-05-15T12:00:00+02:00',
    timeLabel: '06:00 – 12:00',
    title: 'Tours (ESOC & GSI)',
    subtitle: 'Two parallel tours — please be at your meeting point on time.',
    details: [
      'GSI group: Meet at Darmstadt Hbf taxi stand at 08:20.',
      'Train at 08:35, Platform 3 — S6 from Darmstadt Hbf to Darmstadt-Wixhausen Bahnhof.',
      'ESOC group: Meet directly at the gate of ESOC.',
      'If you signed up for ESOC you will join at GSI afterwards for the rest of the program, we will accompany you to GSI!'
    ],
    locations: [
      { label: 'GSI meeting point — Darmstadt Hbf taxi stand', iframeSrc: GSI_MEETING_POINT },
      { label: 'ESOC – European Space Operations Centre', iframeSrc: ESOC },
      { label: 'GSI Helmholtzzentrum (Darmstadt-Wixhausen)', iframeSrc: GSI }
    ]
  },
  {
    id: 'fri-lunch',
    dayLabel: 'Friday · 15 May',
    dayKey: '2026-05-15',
    start: '2026-05-15T12:00:00+02:00',
    end: '2026-05-15T13:00:00+02:00',
    timeLabel: '12:00 – 13:00',
    title: 'Lunch',
    subtitle: 'Lunch served at GSI.',
    locations: [{ label: 'GSI Helmholtzzentrum', iframeSrc: GSI }]
  },
  {
    id: 'fri-workshops',
    dayLabel: 'Friday · 15 May',
    dayKey: '2026-05-15',
    start: '2026-05-15T13:00:00+02:00',
    end: '2026-05-15T17:30:00+02:00',
    timeLabel: '13:00 – 17:30',
    title: 'Workshops',
    subtitle: 'Hands-on workshops at GSI. Check your assigned slot.',
    locations: [{ label: 'GSI Helmholtzzentrum', iframeSrc: GSI }]
  },
  {
    id: 'fri-transfer-audimax',
    dayLabel: 'Friday · 15 May',
    dayKey: '2026-05-15',
    start: '2026-05-15T17:30:00+02:00',
    end: '2026-05-15T18:30:00+02:00',
    timeLabel: '17:30 – 18:30',
    title: 'Transfer to Audimax',
    subtitle: 'Two ways to reach Audimax — pick whichever is easiest.',
    details: [
      'There will be a person to accompany you to the Audimax from GSI. Contact us if you need help.',
      'Option 1 — Bus + Tram: Take bus "G" from GSI to Darmstadt-Arheilgen Dreieichweg, then tram 6 to Darmstadt Willy-Brandt-Platz, then walk 7 min.',
      'Option 2 — Train: Take bus "G" (or walk) to Wixhausen Bahnhof, then S6 to Darmstadt Hbf. From Hbf many trams/buses go to Luisenplatz; walk 8 min to Audimax.'
    ],
    locations: [{ label: 'Audimax, Karolinenpl. 5, Darmstadt', iframeSrc: AUDIMAX }]
  },
  {
    id: 'fri-movie',
    dayLabel: 'Friday · 15 May',
    dayKey: '2026-05-15',
    start: '2026-05-15T19:00:00+02:00',
    end: '2026-05-15T22:00:00+02:00',
    timeLabel: '19:00 – 22:00',
    title: 'Movie Night',
    subtitle: '',
    locations: [{ label: 'Audimax, Karolinenpl. 5, Darmstadt', iframeSrc: AUDIMAX }]
  },

  // ───────── Saturday, 16 May ─────────
  {
    id: 'sat-setup',
    dayLabel: 'Saturday · 16 May',
    dayKey: '2026-05-16',
    start: '2026-05-16T08:00:00+02:00',
    end: '2026-05-16T10:00:00+02:00',
    timeLabel: '08:00 – 10:00',
    title: 'Public Forum',
    subtitle: '',
    locations: [{ label: 'Orangerie Darmstadt', iframeSrc: ORANGERIE }]
  },
  {
    id: 'sat-group-photo',
    dayLabel: 'Saturday · 16 May',
    dayKey: '2026-05-16',
    start: '2026-05-16T10:00:00+02:00',
    end: '2026-05-16T10:15:00+02:00',
    timeLabel: '10:00 – 10:15',
    title: 'Group Picture',
    subtitle: 'All participants — be on time!'
  },
  {
    id: 'sat-forum-vip',
    dayLabel: 'Saturday · 16 May',
    dayKey: '2026-05-16',
    start: '2026-05-16T10:15:00+02:00',
    end: '2026-05-16T11:00:00+02:00',
    timeLabel: '10:15 – 11:00',
    title: 'Forum (Teams & VIPs only)',
    subtitle: 'Forum for teams and VIPs.'
  },
  {
    id: 'sat-forum-open',
    dayLabel: 'Saturday · 16 May',
    dayKey: '2026-05-16',
    start: '2026-05-16T11:00:00+02:00',
    end: '2026-05-16T11:15:00+02:00',
    timeLabel: '11:00 – 11:15',
    title: 'Opening of the Forum'
  },
  {
    id: 'sat-welcome-woerner',
    dayLabel: 'Saturday · 16 May',
    dayKey: '2026-05-16',
    start: '2026-05-16T11:15:00+02:00',
    end: '2026-05-16T11:30:00+02:00',
    timeLabel: '11:15 – 11:30',
    title: 'Welcome Ceremony',
    subtitle: 'Speaker: Jan Wörner.'
  },
  {
    id: 'sat-speaker-schmid',
    dayLabel: 'Saturday · 16 May',
    dayKey: '2026-05-16',
    start: '2026-05-16T12:30:00+02:00',
    end: '2026-05-16T13:15:00+02:00',
    timeLabel: '12:30 – 13:15',
    title: 'Speaker: Volker Schmid'
  },
  {
    id: 'sat-speaker-krag',
    dayLabel: 'Saturday · 16 May',
    dayKey: '2026-05-16',
    start: '2026-05-16T14:00:00+02:00',
    end: '2026-05-16T14:30:00+02:00',
    timeLabel: '14:00 – 14:30',
    title: 'Speaker: Holger Krag'
  },
  {
    id: 'sat-speaker-momentum',
    dayLabel: 'Saturday · 16 May',
    dayKey: '2026-05-16',
    start: '2026-05-16T15:00:00+02:00',
    end: '2026-05-16T15:30:00+02:00',
    timeLabel: '15:00 – 15:30',
    title: 'Speaker: Momentum Aerospace'
  },
  {
    id: 'sat-bbq',
    dayLabel: 'Saturday · 16 May',
    dayKey: '2026-05-16',
    start: '2026-05-16T18:30:00+02:00',
    end: '2026-05-16T23:00:00+02:00',
    timeLabel: 'from 18:30',
    title: 'BBQ Party',
    subtitle: 'Food, drinks and a chance to wind down with everyone.',
    locations: [{ label: 'BBQ Party', iframeSrc: BBQ }]
  },

  // ───────── Sunday, 17 May ─────────
  {
    id: 'sun-breakfast',
    dayLabel: 'Sunday · 17 May',
    dayKey: '2026-05-17',
    start: '2026-05-17T09:00:00+02:00',
    end: '2026-05-17T10:00:00+02:00',
    timeLabel: '09:00 – 10:00',
    title: 'Breakfast',
    subtitle: 'L4|02 — breakfast in room 6.',
    locations: [{ label: 'L4|02 Hörsaal- und Medienzentrum (HMZ)', iframeSrc: L4_02 }]
  },
  {
    id: 'sun-spaceups',
    dayLabel: 'Sunday · 17 May',
    dayKey: '2026-05-17',
    start: '2026-05-17T10:00:00+02:00',
    end: '2026-05-17T12:30:00+02:00',
    timeLabel: '10:00 – 12:30',
    title: 'SpaceUps',
    subtitle: 'Short, lightning-style talks in parallel rooms at L4|02.',
    details: ['Check announcements for current SpaceUps.'],
    locations: [{ label: 'L4|02 Hörsaal- und Medienzentrum (HMZ)', iframeSrc: L4_02 }]
  },
  {
    id: 'sun-workshop-pres',
    dayLabel: 'Sunday · 17 May',
    dayKey: '2026-05-17',
    start: '2026-05-17T12:30:00+02:00',
    end: '2026-05-17T13:30:00+02:00',
    timeLabel: '12:30 – 13:30',
    title: 'Workshop Presentations',
    subtitle: 'Rooms L4|02/1 and L4|02/2.',
    locations: [{ label: 'L4|02 Hörsaal- und Medienzentrum (HMZ)', iframeSrc: L4_02 }]
  },
  {
    id: 'sun-closing',
    dayLabel: 'Sunday · 17 May',
    dayKey: '2026-05-17',
    start: '2026-05-17T13:30:00+02:00',
    end: '2026-05-17T14:30:00+02:00',
    timeLabel: '13:30 – 14:30',
    title: 'RULER + Closing & Banner Ceremony',
    subtitle: 'Wrap-up and handover.',
    locations: [{ label: 'L4|02 Hörsaal- und Medienzentrum (HMZ)', iframeSrc: L4_02 }]
  }
];
