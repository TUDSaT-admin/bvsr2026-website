export interface SpaceUpRoom {
  id: string;
  label: string;
  capacity: number;
}

export interface SpaceUpSlot {
  slot: number;
  startLabel: string;
  endLabel: string;
  rangeLabel: string;
}

export const SPACEUP_ROOMS: SpaceUpRoom[] = [
  { id: 'HMZ L4|02/3',   label: 'HMZ L4|02/3',   capacity: 22 },
  { id: 'HMZ L4|02/4',   label: 'HMZ L4|02/4',   capacity: 24 },
  { id: 'HMZ L4|02/5',   label: 'HMZ L4|02/5',   capacity: 24 },
  { id: 'HMZ L4|02/203', label: 'HMZ L4|02/203', capacity: 24 },
  { id: 'HMZ L4|02/204', label: 'HMZ L4|02/204', capacity: 20 },
  { id: 'HMZ L4|02/228', label: 'HMZ L4|02/228', capacity: 24 },
  { id: 'HMZ L4|02/301', label: 'HMZ L4|02/301', capacity: 40 },
  { id: 'HMZ L4|02/304', label: 'HMZ L4|02/304', capacity: 20 },
  { id: 'HMZ L4|02/338', label: 'HMZ L4|02/338', capacity: 25 }
];

export const SPACEUP_SLOTS: SpaceUpSlot[] = [
  { slot: 1, startLabel: '10:00', endLabel: '10:20', rangeLabel: '10:00 – 10:20' },
  { slot: 2, startLabel: '10:30', endLabel: '10:50', rangeLabel: '10:30 – 10:50' },
  { slot: 3, startLabel: '11:00', endLabel: '11:20', rangeLabel: '11:00 – 11:20' },
  { slot: 4, startLabel: '11:30', endLabel: '11:50', rangeLabel: '11:30 – 11:50' },
  { slot: 5, startLabel: '12:00', endLabel: '12:20', rangeLabel: '12:00 – 12:20' }
];

export const SPACEUP_VALID_ROOM_IDS: string[] = SPACEUP_ROOMS.map(r => r.id);
export const SPACEUP_VALID_SLOT_NUMBERS: number[] = SPACEUP_SLOTS.map(s => s.slot);

export function spaceupSlotKey(room: string, slot: number): string {
  return `${room}__${slot}`;
}
