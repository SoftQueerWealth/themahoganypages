import type { BlaqTravelCard } from './baltimoreBlaqPride';

export const ATL_TRAVEL_CARDS: BlaqTravelCard[] = [
  {
    icon: '✈️',
    title: 'Getting Here',
    facts: [
      'Fly into Hartsfield-Jackson Atlanta International Airport (ATL) — MARTA, rideshare, and rental cars all connect to downtown and Midtown.',
      'Amtrak arrives at Peachtree Station; from there it’s a short MARTA or rideshare hop to Midtown and downtown venues.',
      'Driving in? Expect paid decks downtown and Midtown; street parking is limited near festival corridors.',
    ],
  },
  {
    icon: '🚇',
    title: 'Getting Around',
    facts: [
      'MARTA rail and buses cover downtown, Midtown, and Buckhead — buy a Breeze Card or use contactless fare.',
      'The Atlanta Streetcar links some downtown stops; rideshare fills gaps for late nights and outer neighborhoods.',
      'Traffic around Peachtree and I-75/85 can slow evenings — leave a little buffer between venues.',
    ],
    checklistLabel: 'Transit tips',
    checklist: [
      'Download MARTA or Google Maps before you head out',
      'Screenshot venue addresses for offline nights',
      'Build in buffer for rush-hour traffic',
    ],
    apps: ['Google Maps', 'MARTA', 'Uber', 'Lyft'],
  },
  {
    icon: '📍',
    title: 'Neighborhoods to Know',
    facts: [
      'Midtown and downtown hold many Pride weekend stages, marches, and nightlife spots.',
      'Edgewood, East Atlanta, and Little Five Points are easy hops for queer bars, food, and late nights.',
      'Check each listing for nearby transit tips — many Stay / Eat / Drink cards note a station or corridor.',
    ],
  },
  {
    icon: '🛡️',
    title: 'Stay Safe & Comfortable',
    facts: [
      'Share your location with a friend when heading to late events.',
      'Atlanta in October is usually mild — still pack a light layer for evening marches and outdoor sets.',
      'Carry a little cash for tips or cover; cards are widely accepted.',
    ],
  },
];

export const ATL_TRAVEL_FINAL_CHECKLIST = [
  'Travel or transit plan set (ATL airport, MARTA, or drive)',
  'Phone charged + maps ready',
  'Event tickets / RSVPs saved',
  'Light layer packed for evening',
  'Lodging address saved offline',
  'Emergency contact shared with a friend',
];

export const ATL_TRAVEL_ATTRIBUTION =
  'Travel tips curated for SoftQueerWealth · Atlanta Pride 2026';
