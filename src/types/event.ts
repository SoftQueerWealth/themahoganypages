export enum EventDay {
  Monday = 'monday',
  Tuesday = 'tuesday',
  Wednesday = 'wednesday',
  Thursday = 'thursday',
  Friday = 'friday',
  Saturday = 'saturday',
  Sunday = 'sunday',
}

export enum EventType {
  AfterDark = 'after-dark',
  DayParty = 'day-party',
  Brunch = 'brunch',
  HappyHour = 'happy-hour',
  Workshop = 'workshop',
  Outdoors = 'outdoors',
  Ball = 'ball',
  Meetup = 'meetup',
  Cultural = 'cultural',
  Wellness = 'wellness',
}

export enum EventVibe {
  Flirt = 'flirt',
  AssShaking = 'ass shaking',
  Groove = 'groove',
  Chill = 'chill',
  Community = 'community',
  GrownAndSexy = 'grown & sexy',
  OpenBar = 'open bar',
  Food = 'food',
  Games = 'games',
  Dating = 'dating',
  Wellness = 'wellness',
  Networking = 'networking',
  Creative = 'creative',
  Cultural = 'cultural',
  ThirtyPlus = '30+',
}

export enum CtaButtonClass {
  Primary = 'btn-p',
  Free = 'btn-free',
  Waitlist = 'btn-w',
}

export type DayId = `${EventDay}`;
export type EventTypeId = `${EventType}`;
export type EventVibeId = `${EventVibe}`;
export type CtaButtonClassId = `${CtaButtonClass}`;

export interface PrideEvent {
  id: string;
  /** Festival grouping, e.g. baltimore-pride or capital-pride */
  festival?: string;
  day: DayId;
  /** ISO calendar date from sheet day cell, e.g. 2026-06-11 */
  dayDate?: string;
  dayLabel: string;
  name: string;
  organizer?: string;
  types: string[];
  /** Audience labels from the sheet Audience Tag column, e.g. Black, Sapphic. */
  audienceTags?: string[];
  /** Normalized lowercase string from `data-vibes` (multi-word tokens preserved). */
  vibesRaw: string;
  free: boolean;
  /** Human-readable ticket price from the sheet, e.g. "Free", "$25", "From $15". */
  price?: string;
  badges: string[];
  time: string;
  location: string;
  vibeTags: string[];
  ctaHref: string;
  ctaLabel: string;
  /** e.g. btn-p, btn-free, btn-w */
  ctaButtonClass: CtaButtonClassId | `btn-${string}`;
  /** tp-* class for left accent bar */
  cardClass: `tp-${string}`;
  /** Shown under the ticket CTA when set (e.g. promo code from the sheet). */
  discountCode?: string;
  /**
   * From sheet "registration directions" when Free Tickets? is "registration required".
   * Shown in a dialog via clickable text instead of an external ticket link.
   */
  registrationDirections?: string;
  /** Direct image URL for the event flyer/poster, when provided in the sheet. */
  flyerUrl?: string;
  /** Normalized city key from the sheet City column, e.g. dc, nyc, baltimore, dmv. */
  city?: string;
  /** Value from the sheet Black Pride / Festival column, when present. */
  prideSeries?: string;
}
