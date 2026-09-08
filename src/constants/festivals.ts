import type { CityKey } from './cities';

export type FestivalGrouping = 'weekday' | 'calendar';

/** Sheet value in Black Pride / Festival for NYC Black Pride. */
export const NYC_BLACK_PRIDE_SERIES = 'NYC Black Pride (29th Annual)';
export const ATL_BLACK_PRIDE_SERIES = 'Atlanta Black Pride';
export const STAMINA_PRIDE_SERIES = 'STAMINA 2026: Queer Caribbean Festival';
export const GLOBAL_BLACK_PRIDE_SERIES = 'Global Black Pride';

export const AUGUST_FESTIVAL_ID = 'august-events';
export const SEPTEMBER_FESTIVAL_ID = 'september-events';
export const NYC_BLACK_PRIDE_FESTIVAL_ID = 'nyc-black-pride';

export interface PrideFestival {
  id: string;
  tabLabel: string;
  dateRange: string;
  location: string;
  sheetName: string;
  spreadsheetId?: string;
  grouping: FestivalGrouping;
  enabled: boolean;
  cityInclude?: CityKey[];
  cityExclude?: CityKey[];
  /** Keep only rows whose Black Pride / Festival column matches. */
  prideSeriesInclude?: string[];
  /** Drop rows whose Black Pride / Festival column matches. */
  prideSeriesExclude?: string[];
}

export const PRIDE_FESTIVALS: PrideFestival[] = [
  {
    id: 'baltimore-pride',
    tabLabel: 'Baltimore Pride',
    dateRange: 'June 8 – 14, 2026',
    location: 'Baltimore, MD',
    sheetName: 'Baltimore Pride Master',
    grouping: 'weekday',
    enabled: false,
  },
  {
    id: 'capital-pride',
    tabLabel: 'Capital Pride',
    dateRange: 'June 2026',
    location: 'Washington, DC',
    sheetName: 'Capital Pride Master',
    grouping: 'calendar',
    enabled: false,
  },
  {
    id: 'june-2026',
    tabLabel: 'DC Events',
    dateRange: 'June 2026',
    location: 'Washington, DC',
    sheetName: 'June Events',
    spreadsheetId: '1DPgR56Fl7Y47x1ILoa9ek-2eg7AL6RbcHuX_h-Pu3nY',
    grouping: 'calendar',
    enabled: false,
  },
  {
    id: 'nyc-pride',
    tabLabel: 'NYC Pride',
    dateRange: 'June 2026',
    location: 'New York, NY',
    sheetName: 'NYC Pride Master',
    spreadsheetId: '15qGvOIUMxTFy3ncvUW1z8XXT6Pz9iTbZ-MW4UhDmjiM',
    grouping: 'calendar',
    enabled: false,
  },
  {
    id: 'july-events',
    tabLabel: 'Events',
    dateRange: 'July 2026',
    location: 'DC · NYC · Baltimore · DMV',
    sheetName: 'July_Events',
    spreadsheetId: '1DPgR56Fl7Y47x1ILoa9ek-2eg7AL6RbcHuX_h-Pu3nY',
    grouping: 'calendar',
    enabled: false,
    cityExclude: ['chicago'],
  },
  {
    id: 'wnba-all-star-weekend',
    tabLabel: 'WNBA All-Star Weekend',
    dateRange: 'July 2026',
    location: 'Chicago',
    sheetName: 'July_Events',
    spreadsheetId: '1DPgR56Fl7Y47x1ILoa9ek-2eg7AL6RbcHuX_h-Pu3nY',
    grouping: 'calendar',
    enabled: false,
    cityInclude: ['chicago'],
  },
  {
    id: 'august-events',
    tabLabel: 'August Events',
    dateRange: 'August – September 2026',
    location: 'DC · NYC · Baltimore · DMV · Atlanta',
    sheetName: 'Filterable August Sept Events',
    spreadsheetId: '1DPgR56Fl7Y47x1ILoa9ek-2eg7AL6RbcHuX_h-Pu3nY',
    grouping: 'calendar',
    enabled: true,
  },
  {
    id: NYC_BLACK_PRIDE_FESTIVAL_ID,
    tabLabel: 'NYC Black Pride (29th Annual)',
    dateRange: 'August 2026',
    location: 'New York, NY',
    sheetName: 'Filterable August Sept Events',
    spreadsheetId: '1DPgR56Fl7Y47x1ILoa9ek-2eg7AL6RbcHuX_h-Pu3nY',
    grouping: 'calendar',
    enabled: false,
    cityInclude: ['nyc'],
    prideSeriesInclude: [NYC_BLACK_PRIDE_SERIES],
  },
  {
    id: SEPTEMBER_FESTIVAL_ID,
    tabLabel: 'September Events',
    dateRange: 'September 2026',
    location: 'DC · NYC · Baltimore · DMV · Atlanta',
    sheetName: 'Filterable August Sept Events',
    spreadsheetId: '1DPgR56Fl7Y47x1ILoa9ek-2eg7AL6RbcHuX_h-Pu3nY',
    grouping: 'calendar',
    enabled: false,
  },
];

export interface FeaturedFestival {
  id: string;
  monthId: string;
  /** ISO year-month, e.g. 2026-08 — Featured views only include events in this month. */
  monthPrefix: string;
  tabLabel: string;
  location: string;
  city: CityKey;
  prideSeries: string;
  includeCityAsMoreEvents: boolean;
}

export const FEATURED_FESTIVALS: FeaturedFestival[] = [
  {
    id: 'stamina-2026',
    monthId: SEPTEMBER_FESTIVAL_ID,
    monthPrefix: '2026-09',
    tabLabel: 'STAMINA 2026: Queer Caribbean Festival',
    location: 'New York · September 2026',
    city: 'nyc',
    prideSeries: STAMINA_PRIDE_SERIES,
    includeCityAsMoreEvents: true,
  },
  {
    id: 'atl-black-pride',
    monthId: SEPTEMBER_FESTIVAL_ID,
    monthPrefix: '2026-09',
    tabLabel: 'Atlanta Black Pride',
    location: 'Atlanta · September 2026',
    city: 'atlanta',
    prideSeries: ATL_BLACK_PRIDE_SERIES,
    includeCityAsMoreEvents: true,
  },
  {
    id: 'global-black-pride',
    monthId: SEPTEMBER_FESTIVAL_ID,
    monthPrefix: '2026-09',
    tabLabel: 'Global Black Pride',
    location: 'Paris · September 2026',
    city: 'paris',
    prideSeries: GLOBAL_BLACK_PRIDE_SERIES,
    includeCityAsMoreEvents: true,
  },
];

export const DEFAULT_FESTIVAL_ID = AUGUST_FESTIVAL_ID;

export const ENABLED_FESTIVALS = PRIDE_FESTIVALS.filter((festival) => festival.enabled);

export function festivalById(id: string): PrideFestival | undefined {
  return PRIDE_FESTIVALS.find((festival) => festival.id === id);
}

export function featuredFestivalById(id: string): FeaturedFestival | undefined {
  return FEATURED_FESTIVALS.find((featured) => featured.id === id);
}

