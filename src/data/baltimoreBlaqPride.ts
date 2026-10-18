export type BlaqTabId =
  | 'program'
  | 'stay'
  | 'eat'
  | 'drink'
  | 'dance'
  | 'experience'
  | 'travelinfo';

export interface BlaqTabDef {
  id: BlaqTabId;
  label: string;
}

export const BLAQ_TABS: BlaqTabDef[] = [
  { id: 'program', label: '🌈 BLAQ Program' },
  { id: 'stay', label: '🛏️ Stay' },
  { id: 'eat', label: '🍽️ Eat' },
  { id: 'drink', label: '🍸 Drink' },
  { id: 'dance', label: '💃 Dance' },
  { id: 'experience', label: '🎟️ Experiences' },
  { id: 'travelinfo', label: '✈️ Travel Info' },
];

export interface BlaqTravelCard {
  icon: string;
  title: string;
  facts: string[];
  checklistLabel?: string;
  checklist?: string[];
  apps?: string[];
}

export const BLAQ_TRAVEL_CARDS: BlaqTravelCard[] = [
  {
    icon: '✈️',
    title: 'Getting Here',
    facts: [
      'Fly into BWI Thurgood Marshall Airport — about 20–30 minutes from downtown Baltimore by car or Light Rail.',
      'Amtrak and MARC trains arrive at Penn Station (Charles Street), a short ride from Mt. Vernon, Station North, and downtown.',
      'Driving in? Expect downtown parking garages and neighborhood street parking near many venues.',
    ],
  },
  {
    icon: '🚇',
    title: 'Getting Around',
    facts: [
      'Charm City Circulator is free and covers key corridors downtown and around Harbor East / Fed Hill.',
      'MTA Light Rail, Metro SubwayLink, and buses connect BWI, Penn Station, and neighborhoods across the city.',
      'Rideshare (Uber / Lyft) is widely available for late nights and venues outside the Circulator loop.',
    ],
    checklistLabel: 'Transit tips',
    checklist: [
      'Download a transit or maps app before you go out',
      'Screenshot venue addresses for offline nights',
      'Build in a little buffer for Light Rail / bus waits',
    ],
    apps: ['Google Maps', 'Transit', 'Charm City Circulator', 'Uber', 'Lyft'],
  },
  {
    icon: '📍',
    title: 'Neighborhoods to Know',
    facts: [
      'Mt. Vernon, Station North, and Charles Village sit near many queer-friendly cafés, bars, and arts spaces.',
      'Harbor East / Fells Point / Fed Hill are easy nightlife and waterfront hops.',
      'Check each listing for nearby transit tips — many Stay / Eat / Drink cards note a station or bus corridor.',
    ],
  },
  {
    icon: '🛡️',
    title: 'Stay Safe & Comfortable',
    facts: [
      'Share your location with a friend when heading to late events.',
      'Baltimore weather in early October can swing cool at night — bring a light layer.',
      'Carry a small amount of cash for tips, cover, or spots that prefer it — cards are widely accepted.',
    ],
  },
];

export const BLAQ_TRAVEL_FINAL_CHECKLIST = [
  'Travel or transit plan set (BWI, Amtrak, or drive)',
  'Phone charged + maps ready',
  'Event tickets / RSVPs saved',
  'Light layer packed for evening',
  'Lodging address saved offline',
  'Emergency contact shared with a friend',
];

export const BLAQ_TRAVEL_ATTRIBUTION =
  'Travel tips curated for SoftQueerWealth · Baltimore BLAQ Pride';
