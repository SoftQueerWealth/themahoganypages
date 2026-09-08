import type { PlaceholderTone } from './home';
import { DONATION_URL } from '../constants/donation';
import { SocialPlatform } from '../lib/analytics';

export const ABOUT_INTRO = {
  paragraph1:
    "Soft Queer Wealth is a home for Black queer creatives, culture, and community — a place to gather, be documented, and be seen. We review, curate, and cover the events that matter to our community, publish Soft Letters, and build the directory of businesses and organizations that hold us up. The Mahogany Pages started as an events guide; it's grown into a whole house: editorial, archive, and community, all under one roof.",
  paragraph2:
    'The Mahogany Pages centers Black queer women, femmes, and gender-expansive people — a community that is often underserved, overlooked, and undercounted, even within queer spaces. We built this because we needed it too.',
};

export const ABOUT_HERO_STAT = {
  num: '200+',
  label: 'Events reviewed and counting',
};

export const ABOUT_STATS = [
  { num: '100+', label: 'Events covered in July, across 3 cities' },
  { num: '65+', label: 'Events featured for DC Black Pride (May)' },
  { num: '70+', label: 'Events across DC, Baltimore & NYC Pride (June)' },
  { num: '3', label: 'Consistent cities: DC, Baltimore & NYC' },
  { num: '1', label: 'Major Black queer event spotlighted every month' },
  { num: '001', label: 'Soft Letters issue published' },
] as const;

export type AboutTeamMember = {
  name: string;
  role: string;
  tone: PlaceholderTone | '';
  bio?: string;
};

export const ABOUT_TEAM: AboutTeamMember[] = [
  { name: 'Briana', role: 'Founder + Partnerships', tone: 'dark' },
  { name: 'Rae', role: 'Brand Experience + UX Design', tone: 'rose' },
  { name: 'Dahnaya', role: 'Chief Technology Officer', tone: 'sage' },
  { name: 'Davina', role: 'Data Informatics + Strategy', tone: '' },
];

export const ABOUT_TEAM_INTRO =
  "Soft Queer Wealth is built by a four-person polycule and chosen family. Collectively, our expertise spans Product Management, Software Engineering, UX Design, and Data & Informatics — we've combined our professional experience to build digital infrastructure for Black queer community.";

export type AboutSocialLink = {
  label: string;
  href: string;
  platform?: SocialPlatform;
};

export const ABOUT_SOCIAL_LINKS: AboutSocialLink[] = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/softqueerwealth?igsh=NzVzaWt4N3BseDQ5',
    platform: SocialPlatform.Instagram,
  },
  {
    label: 'TikTok',
    href: 'https://www.tiktok.com/@softqueerwealth?_r=1&_t=ZT-99Y0M5ekXZV',
    platform: SocialPlatform.TikTok,
  },
  {
    label: 'YouTube',
    href: 'https://youtube.com/@softqueerwealth?si=RVF9Hz3qheVZAq69',
    platform: SocialPlatform.YouTube,
  },
  {
    label: 'Threads',
    href: 'https://www.threads.com/@softqueerwealth',
    platform: SocialPlatform.Threads,
  },
  {
    label: 'Email',
    href: 'mailto:SoftQueerWealth@gmail.com',
    platform: SocialPlatform.Email,
  },
  {
    label: 'Buy Me a Coffee',
    href: DONATION_URL,
  },
];

export const ABOUT_ETHICS = {
  intro:
    'We collect the minimum we need to run the guide — RSVPs, saved itineraries, and event engagement — and we treat it with the same care we ask our community spaces to treat us. In practice, that means:',
  bullets: [
    "We never sell personal data, and we don't run third-party ad trackers.",
    'Itinerary and RSVP data is used to improve the guide and our "by the numbers" reporting — aggregated and de-identified before it\'s shared publicly.',
    'Sharing an itinerary is opt-in, every time — nothing goes to your people unless you tap share.',
    'You can request a copy of your data, or ask us to delete it, at any time.',
    'Business and organizer info in Community is published with their consent and kept current on request.',
  ],
  automation:
    "Behind the scenes, our event listings are currently curated and entered by hand. We're exploring connecting to the Eventbrite and POSH APIs so event details can update automatically — while a human on our team still reviews and approves everything before it's published. Automation for speed, editorial judgment for what makes the cut.",
  disclaimer:
    'This is a working draft for the prototype — our full privacy & data policy will be linked here before launch.',
};

export const ABOUT_FOOTER_BAND = 'This guide grows with the community. Slide into our DMs. ♡';
