import { generatedHospitalityItems } from '../data/hospitality.generated';
import type { GbpHospitalityItem, HosThumbTone } from '../data/globalBlackPride';
import type { HospitalityItem } from '../types/hospitality';
import { isMappableLocation, mapsSearchUrl } from './maps';

const THUMB_TONES: HosThumbTone[] = ['dark', 'rose', 'sage'];

function normalizeToken(value: string): string {
  return value.toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function isHotel(item: HospitalityItem): boolean {
  const type = normalizeToken(item.venueType);
  if (type === 'hotel') return true;
  return type.split(/[,;/|]+/).some((part) => part.trim() === 'hotel');
}

function isWhereToEat(item: HospitalityItem): boolean {
  return normalizeToken(item.uiCategory) === 'where to eat';
}

function isWhereToDrink(item: HospitalityItem): boolean {
  return normalizeToken(item.uiCategory) === 'where to drink';
}

function isWhereToDance(item: HospitalityItem): boolean {
  return normalizeToken(item.uiCategory) === 'where to dance';
}

function isExperiences(item: HospitalityItem): boolean {
  return normalizeToken(item.uiCategory) === 'experiences';
}

function prefersParis(item: HospitalityItem): boolean {
  const city = item.city.trim();
  if (!city) return true;
  return /paris/i.test(city);
}

function formatVenueAddress(address: string): string {
  return address
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join(', ');
}

/** Normalize sheet price to Yelp-style $ / $$ / $$$ / $$$$ (or Free). */
function formatPrice(raw: string): string | undefined {
  const value = raw.trim();
  if (!value) return undefined;
  if (/^free$/i.test(value)) return 'Free';
  const dollars = value.match(/^\$+$/);
  if (dollars) return dollars[0];
  return value;
}

function resolveAddress(item: HospitalityItem): string {
  const address = formatVenueAddress(item.venueAddress);
  if (address) return address;
  return item.city.trim();
}

function toHospitalityCard(
  item: HospitalityItem,
  index: number,
  options: {
    includeBio: boolean;
    bookLabel: string;
    fallbackTag: string;
    includeNearbyStation?: boolean;
  },
): GbpHospitalityItem {
  const bookingLink = item.bookingLink.trim();
  const discountCode = item.code.trim() || undefined;
  const address = resolveAddress(item) || undefined;
  const addressMapsUrl =
    address && isMappableLocation(item.venueAddress.trim() || address)
      ? mapsSearchUrl(item.venueAddress.trim() || address)
      : undefined;
  const nearbyStation = options.includeNearbyStation
    ? item.nearbyStation.trim() || undefined
    : undefined;

  return {
    id: item.id,
    title: item.venueName.trim() || item.business.trim(),
    address,
    addressMapsUrl,
    nearbyStation,
    price: formatPrice(item.price),
    tags: item.audienceTags.length ? item.audienceTags : [options.fallbackTag],
    tone: THUMB_TONES[index % THUMB_TONES.length],
    bio: options.includeBio ? item.description.trim() : '',
    bookUrl: bookingLink || undefined,
    bookLabel: bookingLink ? options.bookLabel : options.bookLabel.replace(/\s*→\s*$/, ''),
    discountCode,
    communityPerk: !discountCode && item.hasCommunityPerk ? true : undefined,
  };
}

/** Hotels from City_Hospitality_Tourism_Sept for the GBP Stay tab. */
export function getGbpStayHotels(): GbpHospitalityItem[] {
  return generatedHospitalityItems
    .filter(isHotel)
    .filter(prefersParis)
    .map((item, index) =>
      toHospitalityCard(item, index, {
        includeBio: false,
        bookLabel: 'Book →',
        fallbackTag: 'Hotel',
        includeNearbyStation: true,
      }),
    );
}

/** Places with UI Category "Where to Eat" for the GBP Eat tab. */
export function getGbpEatPlaces(): GbpHospitalityItem[] {
  return generatedHospitalityItems
    .filter(isWhereToEat)
    .filter(prefersParis)
    .map((item, index) =>
      toHospitalityCard(item, index, {
        includeBio: true,
        bookLabel: 'Reserve →',
        fallbackTag: 'Eat',
      }),
    );
}

/** Places with UI Category "Where to Drink" for the GBP Drink tab. */
export function getGbpDrinkPlaces(): GbpHospitalityItem[] {
  return generatedHospitalityItems
    .filter(isWhereToDrink)
    .filter(prefersParis)
    .map((item, index) =>
      toHospitalityCard(item, index, {
        includeBio: true,
        bookLabel: 'More Info →',
        fallbackTag: 'Drink',
      }),
    );
}

/** Places with UI Category "Where to Dance" for the GBP Dance tab. */
export function getGbpDancePlaces(): GbpHospitalityItem[] {
  return generatedHospitalityItems
    .filter(isWhereToDance)
    .filter(prefersParis)
    .map((item, index) =>
      toHospitalityCard(item, index, {
        includeBio: true,
        bookLabel: 'More Info →',
        fallbackTag: 'Dance',
      }),
    );
}

/** Places with UI Category "Experiences" for the GBP Experiences tab. */
export function getGbpExperiences(): GbpHospitalityItem[] {
  return generatedHospitalityItems
    .filter(isExperiences)
    .filter(prefersParis)
    .map((item, index) =>
      toHospitalityCard(item, index, {
        includeBio: false,
        bookLabel: 'More Info →',
        fallbackTag: 'Experience',
      }),
    );
}
