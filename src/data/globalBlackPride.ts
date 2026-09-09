export type GbpTabId =
  | 'programme'
  | 'queerparis'
  | 'stay'
  | 'eat'
  | 'drink'
  | 'dance'
  | 'experience'
  | 'travelinfo';

export interface GbpTabDef {
  id: GbpTabId;
  label: string;
}

export const GBP_TABS: GbpTabDef[] = [
  { id: 'programme', label: '🌈 GBP Programme' },
  { id: 'queerparis', label: '🪩 Queer Paris' },
  { id: 'stay', label: '🛏️ Stay' },
  { id: 'eat', label: '🍽️ Eat' },
  { id: 'drink', label: '🍸 Drink' },
  { id: 'dance', label: '💃 Dance' },
  { id: 'experience', label: '🎟️ Experiences' },
  { id: 'travelinfo', label: '✈️ Travel Info' },
];

export type HosThumbTone = 'dark' | 'rose' | 'sage';

export interface GbpHospitalityItem {
  id: string;
  title: string;
  /** Display address (or city fallback). */
  address?: string;
  /** Google Maps URL when the address is mappable. */
  addressMapsUrl?: string;
  /** Transit tip from sheet Nearby Station — Stay listings. */
  nearbyStation?: string;
  price?: string;
  tags: string[];
  vibeTags: string[];
  tone: HosThumbTone;
  bio: string;
  igHandle?: string;
  bookUrl?: string;
  bookLabel: string;
  discountCode?: string;
  /** True when the listing has a community perk but no discrete code string. */
  communityPerk?: boolean;
  credit?: string;
  creditSourceLink?: string;
}

export interface GbpTravelCard {
  icon: string;
  title: string;
  facts: string[];
  checklistLabel?: string;
  checklist?: string[];
  apps?: string[];
}

export const GBP_TRAVEL_CARDS: GbpTravelCard[] = [
  {
    icon: '🇺🇸',
    title: 'Travel Documents',
    facts: [
      'U.S. passport holders can visit France visa-free for up to 90 days within a 180-day period.',
      'Passport should have at least 3 months validity beyond your planned departure from France.',
      'Have at least one blank passport page.',
    ],
    checklistLabel: 'Before Leaving',
    checklist: [
      'Check passport expiration',
      'Save digital copies of passport, flight & hotel info',
      'Bring enough prescription medication, plus a few extra days',
      'Consider travel insurance',
    ],
  },
  {
    icon: '📱',
    title: 'Stay Connected',
    facts: ["Don't rely solely on public Wi-Fi while you're out and about."],
    checklistLabel: 'Before Departure',
    checklist: [
      'Confirm international coverage with your carrier, or set up an eSIM',
      'Download offline Google Maps',
      'Download useful transportation & communication apps',
    ],
    apps: ['Google Maps', 'Google Translate', 'Bonjour RATP', 'Citymapper', 'Uber', 'WhatsApp'],
  },
  {
    icon: '🔌',
    title: 'Power + Plugs',
    facts: [
      'France uses Type C and Type E outlets, 230V.',
      'Bring a European or universal travel adapter, and check your chargers/devices for 110–240V compatibility before use.',
    ],
  },
  {
    icon: '💶',
    title: 'Money in Paris',
    facts: [
      'Currency is the Euro (€ / EUR).',
      'Visa and Mastercard are widely accepted. American Express may not be accepted everywhere.',
      'Carry a small amount of Euro cash for small businesses, markets, tips where appropriate, and emergencies.',
    ],
  },
];

export const GBP_TRAVEL_FINAL_CHECKLIST = [
  'Passport checked',
  'Travel documents saved digitally',
  'Phone / eSIM ready',
  'Adapter packed',
  'Medication packed',
  'Travel insurance considered',
  'Offline map downloaded',
];

export const GBP_TRAVEL_ATTRIBUTION = 'Travel guidance provided by Lesbifriends Travel';
