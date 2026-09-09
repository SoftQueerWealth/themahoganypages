import {
  EventDay,
  EventType,
  EventVibe,
  type DayId,
  type PrideEvent,
} from '../types/event';
import type { BeautyField, BeautyItem } from '../types/beauty';
import { normalizeSheetCity } from '../constants/cities';
import { DEFAULT_FESTIVAL_ID, ENABLED_FESTIVALS, festivalById } from '../constants/festivals';
import { filterEventsForFestival } from '../lib/festivalCityFilter';
import { decodeHtmlEntities } from '../lib/decodeHtmlEntities';
import { ctaButtonClassForLabel, isInstagramUrl } from '../lib/eventCta';
import { shouldHideDiscountCode } from '../lib/parseDiscountDisplay';
import { formatTicketPriceDisplay, priceIndicatesFree } from '../lib/parsePriceDisplay';
import { parseEventTimeMinutes } from '../lib/eventTimeSort';

function normalizePrideSeriesFromSheet(value: string): string {
  const key = value.trim().toLowerCase().replace(/\s+/g, ' ');
  if (
    key === 'atl black pride' ||
    key === 'atl black pride (20th annual)' ||
    key === 'atlanta black pride (20th annual)'
  ) {
    return 'Atlanta Black Pride';
  }
  return value.trim();
}

const BEAUTY_SHEET_NAME = 'Business';
const SHEETS_ID_PLACEHOLDER = 'YOUR_GOOGLE_SHEETS_ID_HERE';
const API_KEY_PLACEHOLDER = 'YOUR_GOOGLE_SHEETS_API_KEY_HERE';

const TYPE_LABELS = {
  [EventType.AfterDark]: 'After Dark',
  [EventType.DayParty]: 'Day Party',
  [EventType.Brunch]: 'Brunch',
  [EventType.HappyHour]: 'Happy Hour',
  [EventType.Workshop]: 'Workshop',
  [EventType.Outdoors]: 'Outdoors',
  [EventType.Ball]: 'Ball',
  [EventType.Meetup]: 'Meetup',
  [EventType.Cultural]: 'Cultural',
  [EventType.Wellness]: 'Wellness',
} satisfies Record<EventType, string>;

const VIBE_LABELS = {
  [EventVibe.Flirt]: 'Flirt',
  [EventVibe.AssShaking]: 'Ass Shaking',
  [EventVibe.Groove]: 'Groove',
  [EventVibe.Chill]: 'Chill',
  [EventVibe.Community]: 'Community',
  [EventVibe.GrownAndSexy]: 'Grown & Sexy',
  [EventVibe.OpenBar]: 'Open Bar',
  [EventVibe.Food]: 'Food',
  [EventVibe.Games]: 'Games',
  [EventVibe.Dating]: 'Dating',
  [EventVibe.Wellness]: 'Wellness',
  [EventVibe.Networking]: 'Networking',
  [EventVibe.Creative]: 'Creative',
  [EventVibe.Cultural]: 'Cultural',
  [EventVibe.ThirtyPlus]: '30+',
} satisfies Record<EventVibe, string>;

function labelForEventType(type: string): string | undefined {
  return TYPE_LABELS[type as EventType];
}

const TYPE_ALIASES: Record<string, EventType> = {
  afterdark: EventType.AfterDark,
  'after dark': EventType.AfterDark,
  [EventType.AfterDark]: EventType.AfterDark,
  dayparty: EventType.DayParty,
  'day party': EventType.DayParty,
  [EventType.DayParty]: EventType.DayParty,
  happyhour: EventType.HappyHour,
  'happy hour': EventType.HappyHour,
  [EventType.HappyHour]: EventType.HappyHour,
  [EventType.Brunch]: EventType.Brunch,
  [EventType.Workshop]: EventType.Workshop,
  [EventType.Outdoors]: EventType.Outdoors,
  outdoor: EventType.Outdoors,
  [EventType.Ball]: EventType.Ball,
  [EventType.Meetup]: EventType.Meetup,
  [EventType.Cultural]: EventType.Cultural,
  [EventType.Wellness]: EventType.Wellness,
};

const DAY_ALIASES: Record<string, DayId> = {
  mon: EventDay.Monday,
  [EventDay.Monday]: EventDay.Monday,
  tue: EventDay.Tuesday,
  tues: EventDay.Tuesday,
  [EventDay.Tuesday]: EventDay.Tuesday,
  wed: EventDay.Wednesday,
  [EventDay.Wednesday]: EventDay.Wednesday,
  thu: EventDay.Thursday,
  thurs: EventDay.Thursday,
  [EventDay.Thursday]: EventDay.Thursday,
  fri: EventDay.Friday,
  [EventDay.Friday]: EventDay.Friday,
  sat: EventDay.Saturday,
  [EventDay.Saturday]: EventDay.Saturday,
  sun: EventDay.Sunday,
  [EventDay.Sunday]: EventDay.Sunday,
};

enum TicketStatus {
  SoldOut = 'sold out',
  SoldOutCompact = 'soldout',
  RsvpFree = 'rsvp free',
  WaitlistOpen = 'waitlist open',
}

const COLUMN_ALIASES = {
  id: ['id', 'eventid'],
  day: ['day', 'dataday', 'data-day', 'dayid', 'eventday', 'dayofweek', 'weekday'],
  dayLabel: ['daylabel', 'dayname', 'displayday'],
  name: ['name', 'event', 'eventname', 'eventtitle', 'title'],
  organizer: ['organizer', 'eventorganizer', 'host', 'hosts', 'presenter'],
  types: ['types', 'type', 'venuetype', 'eventtypes', 'eventtype', 'datatypes', 'data-types', 'category', 'categories'],
  audienceTags: ['audiencetag', 'audiencetags', 'audience'],
  vibesRaw: ['vibesraw', 'vibes', 'vibestags', 'datavibes', 'data-vibes', 'vibe'],
  free: ['free', 'freetickets', 'isfree', 'datafree', 'data-free'],
  registrationDirections: ['registrationdirections'],
  price: ['price', 'cost', 'ticketprice', 'data-price'],
  earlyBirdPrice: ['earlybirdticketprice', 'earlybirdprice', 'ebprice'],
  generalTicketPrice: ['generalticketprice', 'generalprice', 'gaprice'],
  badges: ['badges', 'eventbadges', 'badge', 'labels'],
  time: ['time', 'starttime', 'eventtime', 'event-time'],
  location: ['location', 'venuename', 'venue', 'venueaddress', 'address', 'eventlocation'],
  venueAddress: ['venueaddress', 'address'],
  vibeTags: ['vibestags', 'vibetags', 'vibesdisplay', 'displayvibes'],
  ticketStatus: ['ticketstatus', 'status', 'registrationstatus'],
  ctaHref: ['ctahref', 'href', 'url', 'link', 'ticketlink', 'tickets', 'eventlink', 'ctalink', 'iglink'],
  ctaLabel: ['ctalabel', 'buttonlabel', 'linklabel', 'actionlabel'],
  ctaButtonClass: ['ctabuttonclass', 'buttonclass', 'btnclass'],
  cardClass: ['cardclass', 'typeclass', 'accentclass'],
  discountCode: [
    'discountcode',
    'promocode',
    'promo',
    'coupon',
    'couponcode',
    'ticketcode',
    'code',
  ],
  festival: ['festival', 'pride', 'guide', 'eventgroup', 'festivalfilter'],
  prideSeries: ['blackpridefestival', 'blackpride', 'pridefestival', 'blackpridefest'],
  city: ['city', 'eventcity', 'market'],
  flyerUrl: ['flyer', 'flyerurl', 'flyerlink', 'flyerimage', 'eventflyer', 'poster', 'posterurl', 'iglinkflyer'],
  skip: ['skip', 'skiprow', 'skipevent', 'skipped'],
} as const;

const BEAUTY_COLUMN_ALIASES = {
  businessName: ['businessname', 'business', 'brand', 'brandname', 'partner', 'partnername', 'name'],
  businessType: ['businesstype', 'businesscategory', 'category', 'type'],
  confirmedPartner: ['confirmedpartner', 'partnerconfirmed', 'confirmed', 'partnerstatus', 'status'],
  testDiscountCodeStatus: ['testdiscountcodestatus', 'testdiscountcode', 'discountcodestatus', 'codestatus'],
} as const;

const BEAUTY_INTERNAL_COLUMNS = new Set([
  'confirmedpartner',
  'partnerconfirmed',
  'confirmed',
  'partnerstatus',
  'status',
  'testdiscountcodestatus',
  'testdiscountcode',
  'discountcodestatus',
  'codestatus',
]);

const BEAUTY_PRIMARY_LINK_COLUMNS = ['website', 'url', 'link', 'booking', 'book', 'instagram', 'social'];

interface SheetsApiResponse {
  values?: string[][];
  error?: {
    message?: string;
  };
}

type ColumnKey = keyof typeof COLUMN_ALIASES;
type BeautyColumnKey = keyof typeof BEAUTY_COLUMN_ALIASES;

function envValue(key: 'VITE_GOOGLE_SHEETS_API_KEY' | 'VITE_GOOGLE_SHEETS_ID'): string {
  const fromProcess = typeof process !== 'undefined' ? process.env[key]?.trim() : '';
  if (fromProcess) return fromProcess;

  const metaEnv = import.meta.env as Record<string, string | undefined>;
  return metaEnv[key]?.trim() ?? '';
}

export function isGoogleSheetsConfigured(): boolean {
  const apiKey = envValue('VITE_GOOGLE_SHEETS_API_KEY');
  const spreadsheetId = envValue('VITE_GOOGLE_SHEETS_ID');
  return !isMissingApiKey(apiKey) && !isMissingSpreadsheetId(spreadsheetId);
}

function getApiKey(): string {
  return envValue('VITE_GOOGLE_SHEETS_API_KEY');
}

function getSpreadsheetId(): string {
  return envValue('VITE_GOOGLE_SHEETS_ID');
}

function isMissingApiKey(apiKey: string): boolean {
  return apiKey.length === 0 || apiKey === API_KEY_PLACEHOLDER;
}

function isMissingSpreadsheetId(spreadsheetId: string): boolean {
  return spreadsheetId.length === 0 || spreadsheetId === SHEETS_ID_PLACEHOLDER;
}

function normalizeHeader(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function normalizeToken(value: string): string {
  return value.toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function splitListCell(value: string): string[] {
  return value
    .split(/[,;|\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function titleize(value: string): string {
  return value
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 80) || 'event'
  );
}

function cleanCellValue(value: unknown): string {
  const cell = String(value ?? '').trim();
  if (cell.toLowerCase() === 'nan') return '';
  return decodeHtmlEntities(cell);
}

function readCell(headers: string[], row: string[], key: ColumnKey): string {
  for (const alias of COLUMN_ALIASES[key]) {
    const index = headers.indexOf(normalizeHeader(alias));
    if (index < 0) continue;
    const value = cleanCellValue(row[index]);
    if (value) return value;
  }
  return '';
}

/** Uses the first matching header only — avoids reading a later alias column when the primary cell is empty. */
function readCellFromFirstMatchingHeader(headers: string[], row: string[], key: ColumnKey): string {
  for (const alias of COLUMN_ALIASES[key]) {
    const index = headers.indexOf(normalizeHeader(alias));
    if (index >= 0) return cleanCellValue(row[index]);
  }
  return '';
}

/** Collects sheet column indices for discount-code aliases, in column order. */
function discountCodeColumnIndices(headers: string[]): number[] {
  const aliasHeaders = new Set(COLUMN_ALIASES.discountCode.map((alias) => normalizeHeader(alias)));
  const indices: number[] = [];
  for (let index = 0; index < headers.length; index += 1) {
    if (aliasHeaders.has(headers[index])) indices.push(index);
  }
  return indices;
}

/**
 * Reads a promo code when the sheet uses a checkbox/flag column plus a code column.
 * The code is returned only when the flag column is TRUE (two-column sheets).
 */
function readDiscountCode(headers: string[], row: string[]): string {
  const indices = discountCodeColumnIndices(headers);

  if (indices.length >= 2) {
    const flagRaw = cleanCellValue(row[indices[0]]);
    if (!parseBoolean(flagRaw)) return '';
    const codeRaw = cleanCellValue(row[indices[1]]);
    if (codeRaw && !shouldHideDiscountCode(codeRaw)) return codeRaw;
    return '';
  }

  for (const index of indices) {
    const value = cleanCellValue(row[index]);
    if (value && !shouldHideDiscountCode(value)) return value;
  }
  return '';
}

function readDayCell(headers: string[], row: string[]): string {
  const values: string[] = [];
  for (const alias of COLUMN_ALIASES.day) {
    const index = headers.indexOf(normalizeHeader(alias));
    if (index < 0) continue;
    const value = cleanCellValue(row[index]);
    if (value) values.push(value);
  }

  const calendarValue = values.find((value) => parseCalendarDateCell(value) !== null);
  if (calendarValue) return calendarValue;

  return values[0] ?? '';
}

function readBeautyCell(headers: string[], row: string[], key: BeautyColumnKey): string {
  for (const alias of BEAUTY_COLUMN_ALIASES[key]) {
    const index = headers.indexOf(normalizeHeader(alias));
    if (index >= 0) return cleanCellValue(row[index]);
  }
  return '';
}

function extractGoogleDriveFileId(value: string): string | null {
  const patterns = [
    /drive\.google\.com\/file\/d\/([^/?#]+)/i,
    /drive\.google\.com\/open\?[^#]*\bid=([^&]+)/i,
    /drive\.google\.com\/uc\?[^#]*\bid=([^&]+)/i,
    /drive\.google\.com\/thumbnail\?[^#]*\bid=([^&]+)/i,
  ];

  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

function normalizeFlyerUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';

  const fileId = extractGoogleDriveFileId(trimmed);
  if (fileId) {
    return `https://lh3.googleusercontent.com/d/${fileId}=w200`;
  }

  return trimmed;
}

function beautyFieldHref(label: string, value: string): string | undefined {
  if (/^https?:\/\//i.test(value)) return value;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return `mailto:${value}`;

  const normalizedLabel = normalizeHeader(label);
  if (normalizedLabel.includes('instagram')) {
    const handle = value.replace(/^@/, '').trim();
    if (handle && !/\s/.test(handle)) return `https://www.instagram.com/${handle}`;
  }

  return undefined;
}

function isConfirmedPartner(value: string): boolean {
  const normalized = normalizeToken(value);
  return (
    normalized === 'yes' ||
    normalized === 'y' ||
    normalized === 'true' ||
    normalized === 'confirmed' ||
    normalized === 'confirmed partner' ||
    normalized === 'approved'
  );
}

function isFailingDiscountCodeStatus(value: string): boolean {
  const normalized = normalizeToken(value);
  return normalized === 'fail' || normalized === 'failed';
}

function isPrimaryBeautyLink(field: BeautyField): boolean {
  const normalizedLabel = normalizeHeader(field.label);
  return Boolean(field.href) && BEAUTY_PRIMARY_LINK_COLUMNS.some((column) => normalizedLabel.includes(column));
}

const CALENDAR_DAY_BY_DOW: Partial<Record<number, DayId>> = {
  0: EventDay.Sunday,
  1: EventDay.Monday,
  2: EventDay.Tuesday,
  3: EventDay.Wednesday,
  4: EventDay.Thursday,
  5: EventDay.Friday,
  6: EventDay.Saturday,
};

function toIsoDateString(year: number, month: number, day: number): string {
  const monthPart = String(month + 1).padStart(2, '0');
  const dayPart = String(day).padStart(2, '0');
  return `${year}-${monthPart}-${dayPart}`;
}

function parseCalendarDateCell(value: string): { day: DayId; dayDate: string } | null {
  const match = value.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (!match) return null;

  const month = Number(match[1]) - 1;
  const day = Number(match[2]);
  let year = Number(match[3]);
  if (year < 100) year += 2000;

  const date = new Date(year, month, day);
  if (Number.isNaN(date.getTime())) return null;

  const dayId = CALENDAR_DAY_BY_DOW[date.getDay()];
  if (!dayId) return null;

  return { day: dayId, dayDate: toIsoDateString(year, month, day) };
}

function parseWeekday(value: string): DayId | null {
  const normalized = normalizeToken(value);
  const exact = DAY_ALIASES[normalized];
  if (exact) return exact;

  const padded = ` ${normalized} `;
  for (const [alias, day] of Object.entries(DAY_ALIASES)) {
    if (padded.includes(` ${alias} `)) return day;
  }

  return null;
}

function parseDayFromCell(value: string): { day: DayId; dayDate?: string } | null {
  const calendar = parseCalendarDateCell(value);
  if (calendar) return calendar;

  const day = parseWeekday(value);
  if (!day) return null;

  return { day };
}

function dayLabelFor(day: DayId): string {
  return day.charAt(0).toUpperCase() + day.slice(1);
}

function normalizeType(value: string): string {
  const token = normalizeToken(value);
  return TYPE_ALIASES[token] ?? token.replace(/\s+/g, '-');
}

function parseTypes(value: string): string[] {
  if (!value) return [];

  const pieces = splitListCell(value);
  if (pieces.length > 1) {
    return unique(pieces.map(normalizeType).filter(Boolean));
  }

  const normalized = normalizeToken(value);
  const direct = TYPE_ALIASES[normalized];
  if (direct) return [direct];

  const found = Object.entries(TYPE_ALIASES)
    .filter(([alias]) => ` ${normalized} `.includes(` ${alias} `))
    .map(([, type]) => type);

  return unique(found.length > 0 ? found : [normalizeType(value)]);
}

function parseBoolean(value: string): boolean {
  const normalized = normalizeToken(value);
  return normalized === 'true' || normalized === 'yes' || normalized === 'y' || normalized === '1' || normalized === 'free' || normalized === '$0';
}

function isSoldOutStatus(value: string): boolean {
  const normalized = normalizeToken(value);
  return (
    normalized === TicketStatus.SoldOut ||
    normalized === TicketStatus.SoldOutCompact ||
    /\bsold\s*out\b/.test(normalized)
  );
}

function isRsvpFreeStatus(value: string): boolean {
  const normalized = normalizeToken(value);
  return normalized === TicketStatus.RsvpFree;
}

function isRegistrationRequired(value: string): boolean {
  return normalizeToken(value) === 'registration required';
}

function ctaLabelForTicketStatus(value: string): string | null {
  const normalized = normalizeToken(value);
  if (normalized === TicketStatus.RsvpFree) return 'RSVP Free';
  if (normalized === TicketStatus.WaitlistOpen) return 'Join Waitlist';
  return null;
}

function parseAudienceTags(value: string): string[] {
  return unique(splitListCell(value).map((tag) => tag.trim()).filter(Boolean));
}

function parseBadgesFromAudience(audienceTags: string[], free: boolean): string[] {
  const derived = [...audienceTags];
  if (free && !derived.some((badge) => normalizeHeader(badge) === 'free')) {
    derived.push('Free');
  }
  return unique(derived);
}

function parseBadges(value: string, types: string[], free: boolean): string[] {
  const directBadges = splitListCell(value);
  const badges =
    directBadges.length > 1
      ? directBadges
      : Object.values(TYPE_LABELS).filter((label) => {
          const normalized = normalizeHeader(value);
          return normalized.includes(normalizeHeader(label));
        });

  const derived = badges.length > 0 ? badges : types.map((type) => labelForEventType(type) ?? titleize(type));
  if (free && !derived.some((badge) => normalizeHeader(badge) === 'free')) {
    derived.push('Free');
  }
  return unique(derived);
}

function parseVibesRaw(vibesRaw: string, vibeTags: string): string {
  const raw = vibesRaw || vibeTags;
  return raw.toLowerCase().replace(/[,;|\n]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function parseVibeTags(vibesRaw: string, vibeTags: string): string[] {
  if (/[,;|\n]/.test(vibeTags)) return unique(splitListCell(vibeTags));

  const normalized = parseVibesRaw(vibesRaw, vibeTags);
  const matches = Object.entries(VIBE_LABELS)
    .map(([vibe, label]) => ({ index: ` ${normalized} `.indexOf(` ${vibe} `), label }))
    .filter(({ index }) => index >= 0)
    .sort((a, b) => a.index - b.index)
    .map(({ label }) => label);

  return unique(matches.length > 0 ? matches : splitListCell(vibesRaw).map(titleize));
}

function normalizeClass<TPrefix extends string>(
  value: string,
  prefix: TPrefix,
  fallback: `${TPrefix}${string}`,
): `${TPrefix}${string}` {
  const classes = value.split(/\s+/).map((item) => item.trim()).filter(Boolean);
  const matching = classes.find((item): item is `${TPrefix}${string}` => item.startsWith(prefix));
  return matching ?? fallback;
}

function readCellByHeader(headers: string[], row: string[], header: string): string {
  const index = headers.indexOf(normalizeHeader(header));
  return index >= 0 ? cleanCellValue(row[index]) : '';
}

/**
 * Some sheet rows are pasted one column off (e.g. Date Added filled while other rows leave it blank).
 * Detect when the Event cell holds a date and the Discount Code cell holds the real event name.
 */
function isDateShiftedRow(headers: string[], row: string[]): boolean {
  const eventValue = readCellByHeader(headers, row, 'event');
  const discountValue = readCellByHeader(headers, row, 'discountcode');
  if (!parseCalendarDateCell(eventValue)) return false;
  if (!discountValue || discountValue.toLowerCase() === 'reached out') return false;
  return !parseCalendarDateCell(discountValue);
}

const SHIFTED_HEADER_FOR_KEY = {
  name: 'discountcode',
  organizer: 'ticketlink',
  types: 'organizer',
  vibesRaw: 'day',
  vibeTags: 'day',
  time: 'earlybirdticketprice',
  ctaHref: 'venuename',
  ticketStatus: 'organizersite',
  free: 'venuename',
  earlyBirdPrice: 'vibestags',
  generalTicketPrice: 'venuetype',
  price: 'vibestags',
} as const satisfies Partial<Record<ColumnKey, string>>;

function readEventField(headers: string[], row: string[], key: ColumnKey, shifted: boolean): string {
  if (!shifted) return readCell(headers, row, key);
  const shiftedHeader = SHIFTED_HEADER_FOR_KEY[key as keyof typeof SHIFTED_HEADER_FOR_KEY];
  if (shiftedHeader) return readCellByHeader(headers, row, shiftedHeader);
  return readCell(headers, row, key);
}

function readEventDayCell(headers: string[], row: string[], shifted: boolean): string {
  if (shifted) return readCellByHeader(headers, row, 'event');
  return readDayCell(headers, row);
}

function readEventLocation(headers: string[], row: string[], shifted: boolean): string {
  if (!shifted) return readLocation(headers, row);
  const venue = readCellByHeader(headers, row, 'city');
  const area = readCellByHeader(headers, row, 'dayofweek');
  if (venue && area) return `${venue} · ${area}`;
  return venue || area;
}

function isPriceColumnShiftedRow(headers: string[], row: string[]): boolean {
  const name = readCell(headers, row, 'name');
  const parsedDay = parseDayFromCell(readDayCell(headers, row));
  if (!name || !parsedDay) return false;
  const vibesCell = readCellByHeader(headers, row, 'vibestags');
  return /^\$[\d,.]+/.test(vibesCell);
}

function readTimeFromRow(row: string[]): string {
  for (const cell of row) {
    const value = cleanCellValue(cell);
    if (parseEventTimeMinutes(value) !== null) return value;
  }
  return '';
}

function readTicketStatusCell(headers: string[], row: string[]): string {
  const direct = readCell(headers, row, 'ticketStatus');
  if (direct) return direct;
  return readCellByHeader(headers, row, 'organizersite');
}

function readEventPriceField(
  headers: string[],
  row: string[],
  key: 'earlyBirdPrice' | 'generalTicketPrice' | 'price',
  shifted: boolean,
): string {
  if (!shifted) return readCellFromFirstMatchingHeader(headers, row, key);
  const shiftedHeader = SHIFTED_HEADER_FOR_KEY[key];
  return shiftedHeader ? readCellByHeader(headers, row, shiftedHeader) : '';
}
function readLocationFromExtendedColumns(headers: string[], row: string[]): string {
  const city = readCellByHeader(headers, row, 'city').trim();
  const neighborhood = readCellByHeader(headers, row, 'neighborhood').trim();
  if (city && !/^https?:/i.test(city)) {
    return neighborhood && neighborhood !== city ? `${city} · ${neighborhood}` : city;
  }
  return '';
}

function readLocation(headers: string[], row: string[]): string {
  const location = readCell(headers, row, 'location');
  const address = readCell(headers, row, 'venueAddress');
  if (location && address && location !== address) {
    const combined = `${location} · ${address}`;
    if (/^https?:\/\//i.test(location)) {
      return readLocationFromExtendedColumns(headers, row) || combined;
    }
    return combined;
  }
  if (/^https?:\/\//i.test(location)) {
    return readLocationFromExtendedColumns(headers, row) || location;
  }
  return location || address || readLocationFromExtendedColumns(headers, row);
}

interface ParseSheetRowsOptions {
  festivalId: string;
  idPrefix?: string;
}

function parseSheetRows(values: string[][], options: ParseSheetRowsOptions): PrideEvent[] {
  const { festivalId, idPrefix = '' } = options;
  const [headerRow, ...dataRows] = values;
  if (!headerRow) return [];

  const headers = headerRow.map(normalizeHeader);
  return dataRows
    .map((row, index): PrideEvent | null => {
      if (row.every((cell) => !String(cell ?? '').trim())) return null;
      if (parseBoolean(readCellFromFirstMatchingHeader(headers, row, 'skip'))) return null;

      const shifted = isDateShiftedRow(headers, row);
      const priceShifted = !shifted && isPriceColumnShiftedRow(headers, row);
      const name = readEventField(headers, row, 'name', shifted);
      const parsedDay = parseDayFromCell(readEventDayCell(headers, row, shifted));
      if (!name || !parsedDay) return null;
      const { day, dayDate } = parsedDay;

      const ticketStatus = readTicketStatusCell(headers, row);
      if (isSoldOutStatus(ticketStatus) || isSoldOutStatus(name)) return null;

      const types = priceShifted
        ? [EventType.DayParty]
        : parseTypes(readEventField(headers, row, 'types', shifted));
      const earlyBirdRaw = readEventPriceField(headers, row, 'earlyBirdPrice', shifted);
      const generalRaw = readEventPriceField(headers, row, 'generalTicketPrice', shifted);
      const priceRaw = readEventPriceField(headers, row, 'price', shifted);
      const freeRaw = readEventField(headers, row, 'free', shifted);
      const registrationRequired = isRegistrationRequired(freeRaw);
      const registrationDirectionsRaw = readEventField(
        headers,
        row,
        'registrationDirections',
        shifted,
      ).trim();
      const registrationDirections = registrationDirectionsRaw || undefined;
      const free =
        registrationRequired ||
        parseBoolean(freeRaw) ||
        priceIndicatesFree(earlyBirdRaw) ||
        priceIndicatesFree(generalRaw) ||
        priceIndicatesFree(priceRaw) ||
        isRsvpFreeStatus(ticketStatus);
      const price = formatTicketPriceDisplay(earlyBirdRaw, generalRaw, priceRaw, free);
      const vibeTagsCell = readEventField(headers, row, 'vibeTags', shifted);
      const vibesRaw = priceShifted
        ? parseVibesRaw(readCellByHeader(headers, row, 'communityfocus'), vibeTagsCell)
        : parseVibesRaw(readEventField(headers, row, 'vibesRaw', shifted), vibeTagsCell);
      const ctaHrefRaw = priceShifted
        ? readCell(headers, row, 'ctaHref')
        : readEventField(headers, row, 'ctaHref', shifted);
      const ctaHref = registrationDirections ? '' : ctaHrefRaw;
      const statusCtaLabel = ctaLabelForTicketStatus(ticketStatus);
      let ctaLabel =
        statusCtaLabel ||
        readCell(headers, row, 'ctaLabel') ||
        (free ? 'More Info' : 'Get Tickets');
      if (registrationDirections) {
        ctaLabel = 'View registration info';
      } else if (!statusCtaLabel && ctaHref && !isInstagramUrl(ctaHref)) {
        ctaLabel = free ? 'RSVP Free' : 'Get Tickets';
      }
      const fallbackCardClass: `tp-${string}` = `tp-${types[0] ?? EventType.DayParty}`;
      const discountCodeRaw = readDiscountCode(headers, row).trim();
      const discountCode =
        discountCodeRaw && !shouldHideDiscountCode(discountCodeRaw) ? discountCodeRaw : '';

      const flyerUrl = normalizeFlyerUrl(readCell(headers, row, 'flyerUrl'));
      const prideSeriesRaw =
        readCell(headers, row, 'prideSeries') || readCell(headers, row, 'festival') || undefined;
      const prideSeries = prideSeriesRaw ? normalizePrideSeriesFromSheet(prideSeriesRaw) : undefined;
      const cityRaw = readCell(headers, row, 'city');
      const city = cityRaw ? normalizeSheetCity(cityRaw) : null;
      if (cityRaw && !city) return null;

      const audienceTags = parseAudienceTags(readCell(headers, row, 'audienceTags'));
      const badgeCell = readCell(headers, row, 'badges');
      const badges = audienceTags.length > 0
        ? parseBadgesFromAudience(audienceTags, free)
        : parseBadges(badgeCell, types, free);

      return {
        id: `${idPrefix}${index + 2}`,
        festival: festivalId,
        day,
        ...(dayDate ? { dayDate } : {}),
        dayLabel: readCell(headers, row, 'dayLabel') || dayLabelFor(day),
        name,
        organizer: readEventField(headers, row, 'organizer', shifted) || undefined,
        types,
        ...(audienceTags.length > 0 ? { audienceTags } : {}),
        vibesRaw,
        free,
        ...(price ? { price } : {}),
        badges,
        time: priceShifted ? readTimeFromRow(row) : readEventField(headers, row, 'time', shifted),
        location: priceShifted
          ? readLocationFromExtendedColumns(headers, row) || readLocation(headers, row)
          : readEventLocation(headers, row, shifted),
        vibeTags: parseVibeTags(vibesRaw, vibeTagsCell),
        ctaHref,
        ctaLabel,
        ctaButtonClass: normalizeClass<'btn-'>(readCell(headers, row, 'ctaButtonClass'), 'btn-', ctaButtonClassForLabel(ctaLabel)),
        cardClass: normalizeClass<'tp-'>(readCell(headers, row, 'cardClass'), 'tp-', fallbackCardClass),
        ...(discountCode ? { discountCode } : {}),
        ...(registrationDirections ? { registrationDirections } : {}),
        ...(flyerUrl ? { flyerUrl } : {}),
        ...(city ? { city } : {}),
        ...(prideSeries ? { prideSeries } : {}),
      };
    })
    .filter((event): event is PrideEvent => event !== null);
}

function parseBeautyRows(values: string[][]): BeautyItem[] {
  const [headerRow, ...dataRows] = values;
  if (!headerRow) return [];

  const headers = headerRow.map(normalizeHeader);
  const labels = headerRow.map((header) => titleize(cleanCellValue(header)));

  return dataRows
    .map((row, index): BeautyItem | null => {
      if (row.every((cell) => !cleanCellValue(cell))) return null;
      if (!isConfirmedPartner(readBeautyCell(headers, row, 'confirmedPartner'))) return null;
      if (isFailingDiscountCodeStatus(readBeautyCell(headers, row, 'testDiscountCodeStatus'))) return null;

      const fields = headers
        .map((header, fieldIndex): BeautyField | null => {
          const label = labels[fieldIndex];
          const value = cleanCellValue(row[fieldIndex]);
          if (!header || !label || !value || BEAUTY_INTERNAL_COLUMNS.has(header)) return null;
          return {
            key: header,
            label,
            value,
            href: beautyFieldHref(label, value),
          };
        })
        .filter((field): field is BeautyField => field !== null);

      const name = readBeautyCell(headers, row, 'businessName') || fields[0]?.value;
      if (!name) return null;

      const businessType = readBeautyCell(headers, row, 'businessType') || 'Beauty Partner';
      const primaryHref = fields.find(isPrimaryBeautyLink)?.href;

      return {
        id: `${slugify(`${businessType}-${name}`)}-${index}`,
        name,
        businessType,
        fields,
        primaryHref,
      };
    })
    .filter((item): item is BeautyItem => item !== null);
}

async function fetchSheetValues(
  sheetName: string,
  spreadsheetId: string = getSpreadsheetId(),
  signal?: AbortSignal,
): Promise<string[][]> {
  const apiKey = getApiKey();
  if (isMissingApiKey(apiKey)) {
    throw new Error('Add your Google Sheets API key to VITE_GOOGLE_SHEETS_API_KEY in .env.');
  }
  if (isMissingSpreadsheetId(spreadsheetId)) {
    throw new Error('Add your Google Sheets spreadsheet ID to VITE_GOOGLE_SHEETS_ID in .env.');
  }

  const range = /^[A-Za-z0-9_]+$/.test(sheetName)
    ? sheetName
    : `'${sheetName.replace(/'/g, "''")}'`;
  const url = new URL(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`,
  );
  url.searchParams.set('key', apiKey);
  url.searchParams.set('majorDimension', 'ROWS');
  url.searchParams.set('valueRenderOption', 'FORMATTED_VALUE');

  const response = await fetch(url, { signal });
  const payload = (await response.json()) as SheetsApiResponse;

  if (!response.ok) {
    throw new Error(payload.error?.message ?? `Unable to load ${sheetName} from Google Sheets.`);
  }

  return payload.values ?? [];
}

export async function fetchFestivalSheetEvents(
  festivalId: string,
  signal?: AbortSignal,
): Promise<PrideEvent[]> {
  const festival = festivalById(festivalId);
  if (!festival) {
    throw new Error(`Unknown festival: ${festivalId}`);
  }

  const idPrefix = festivalId === DEFAULT_FESTIVAL_ID ? '' : `${festivalId}-`;
  const spreadsheetId = festival.spreadsheetId ?? getSpreadsheetId();
  const events = parseSheetRows(await fetchSheetValues(festival.sheetName, spreadsheetId, signal), {
    festivalId,
    idPrefix,
  });
  return filterEventsForFestival(events, festival);
}

export async function fetchAllFestivalSheetEvents(
  signal?: AbortSignal,
): Promise<Record<string, PrideEvent[]>> {
  const results = await Promise.all(
    ENABLED_FESTIVALS.map(async (festival) => {
      const events = await fetchFestivalSheetEvents(festival.id, signal);
      return [festival.id, events] as const;
    }),
  );

  const eventsByFestival = Object.fromEntries(results);
  const totalEvents = results.reduce((sum, [, events]) => sum + events.length, 0);
  if (totalEvents === 0) {
    throw new Error('No valid events were found in the Google Sheet.');
  }

  return eventsByFestival;
}

export async function fetchSheetBeautyItems(signal?: AbortSignal): Promise<BeautyItem[]> {
  return parseBeautyRows(await fetchSheetValues(BEAUTY_SHEET_NAME, getSpreadsheetId(), signal));
}
