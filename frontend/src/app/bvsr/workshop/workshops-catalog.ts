export type WorkshopSlot = 1 | 2 | 'BOTH';

export interface Workshop {
  id: string;
  title: string;
  speaker: string;
  room: string;
  capacity: number;
  slot: WorkshopSlot;
}

export const BVSR_WORKSHOPS: Workshop[] = [
  {
    id: 'W01',
    title: 'CMEx-Versuchsaufbau – Beschreibung des CubeSat-Experiments auf TRACE',
    speaker: 'Peter Wieczorek (TUDSaT / GSI)',
    room: 'KBW 1.017',
    capacity: 20,
    slot: 'BOTH'
  },
  {
    id: 'W02',
    title: 'Strahldiagnose',
    speaker: 'Karl Reimers (GSI)',
    room: 'KBW 1.017',
    capacity: 60,
    slot: 'BOTH'
  },
  {
    id: 'W03',
    title: 'Missionsplanung 101 – Grundlagen der Missionsplanung',
    speaker: 'Volker Schmid (DLR)',
    room: 'BK1 1.001a',
    capacity: 42,
    slot: 2
  },
  {
    id: 'W04',
    title: 'Gespräche mit der studentischen Raumfahrt – Podcast "Auf Distanz"',
    speaker: 'Lars Naber',
    room: 'KBW 2.027',
    capacity: 20,
    slot: 2
  },
  {
    id: 'W05',
    title: 'Entwicklung der Paragon-Familie von Feststoffboostern (K bis P Klasse) sowie Telemetrieprotokolle der FAR',
    speaker: 'David Madlener',
    room: 'SB1 4.101',
    capacity: 26,
    slot: 1
  },
  {
    id: 'W06',
    title: 'News from BVSR Committee Legal – Rocketry',
    speaker: 'Michael Witthaus',
    room: 'BK1 3.020',
    capacity: 20,
    slot: 1
  },
  {
    id: 'W07',
    title: 'EMV Design Tipps – Techniken für bessere EMV von Geräten',
    speaker: 'Würth Elektronik',
    room: 'KBW 2.027',
    capacity: 20,
    slot: 1
  },
  {
    id: 'W10',
    title: 'How to start up your Startup – Informationen zum erfolgreichen Ausgründen',
    speaker: 'Cesah',
    room: 'KBW 5.029',
    capacity: 20,
    slot: 1
  },
  {
    id: 'W11',
    title: 'Schaffung eines Raumfahrterbes: Was versteht man unter Archivierung und wie funktioniert sie?',
    speaker: 'Frederic Forkel',
    room: 'KBW 5.032',
    capacity: 20,
    slot: 2
  },
  {
    id: 'W12',
    title: 'Space Analog and Student Space Flight',
    speaker: 'Ella Ganzer',
    room: 'KBW 2.028',
    capacity: 20,
    slot: 1
  },
  {
    id: 'W13',
    title: 'Future development of the BVSR',
    speaker: 'Natascha (BVSR)',
    room: 'KBW 5.029',
    capacity: 20,
    slot: 2
  },
  {
    id: 'W14',
    title: 'ODIN Meetup & Outlook-Brainstorming',
    speaker: 'Jonathan Mayer',
    room: 'BK1 3.020',
    capacity: 20,
    slot: 2
  },
  {
    id: 'W15',
    title: 'Introduction to the Launch and Early Orbit Phase (LEOP) of Satellite Operations',
    speaker: 'Serco',
    room: 'BK1 1.001a',
    capacity: 42,
    slot: 1
  },
  {
    id: 'W16',
    title: 'Momentum Aerospace Design Challenge',
    speaker: 'Momentum Aerospace',
    room: 'SB1 4.101',
    capacity: 26,
    slot: 2
  },
  {
    id: 'W17',
    title: 'EuRoC Conversations',
    speaker: 'Manu Schlüsener',
    room: 'KBW 2.028',
    capacity: 20,
    slot: 2
  },
  {
    id: 'W18',
    title: 'Code of Conduct for BVSR',
    speaker: "Dennis D'Argento (SeeSat e.V.)",
    room: 'KBW 5.032',
    capacity: 20,
    slot: 1
  }
];

export const BVSR_WORKSHOPS_BY_ID: Record<string, Workshop> = BVSR_WORKSHOPS.reduce(
  (acc, w) => {
    acc[w.id] = w;
    return acc;
  },
  {} as Record<string, Workshop>
);

export function workshopIsForSlot(w: Workshop, slot: 1 | 2): boolean {
  return w.slot === slot || w.slot === 'BOTH';
}

export function workshopSpansBoth(w: Workshop): boolean {
  return w.slot === 'BOTH';
}
