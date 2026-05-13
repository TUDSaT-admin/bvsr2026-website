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
    room: 'BK1 3.019',
    capacity: 20,
    slot: 'BOTH'
  },
  {
    id: 'W02',
    title: 'Strahldiagnose',
    speaker: 'Karl Reimers (GSI)',
    room: 'SB3 3.170a',
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
    title: 'How to print your engine – Additive Manufacturing Techniken',
    speaker: 'Stefan Bindl',
    room: 'SB1 4.101',
    capacity: 26,
    slot: 1
  },
  {
    id: 'W06',
    title: 'News from BVSR Committee Legal – Rocketry',
    speaker: 'Michael Witthaus',
    room: 'KBW 2.028',
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
    id: 'W08',
    title: 'Space Law – Überblick Space Law',
    speaker: 'Prof. Kristoff Ritlewski',
    room: 'KBW 5.032',
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
    title: 'Datenarchivierung',
    speaker: 'Frederic Forkel',
    room: 'KBW 5.032',
    capacity: 20,
    slot: 2
  },
  {
    id: 'W12',
    title: 'Student Analog Astronaut Missions',
    speaker: 'Ella Ganzer',
    room: 'BK1 3.020',
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
    room: 'KBW 2.028',
    capacity: 20,
    slot: 2
  },
  {
    id: 'W15',
    title: 'LEOP',
    speaker: 'Serco',
    room: 'BK1 1.001a',
    capacity: 42,
    slot: 1
  },
  {
    id: 'W16',
    title: 'Rocketry Startup Design Challenge',
    speaker: 'Momentum Aerospace',
    room: 'SB1 4.101',
    capacity: 26,
    slot: 2
  },
  {
    id: 'W17',
    title: 'EuRoC Conversations',
    speaker: 'Manu Schlüsener',
    room: 'BK1 3.020',
    capacity: 20,
    slot: 2
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
