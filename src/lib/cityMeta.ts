import { cityDisplayLabel, type CityKey } from '../constants/cities';
import { isCitySlug } from './cityPath';

export const DEFAULT_PAGE_TITLE = 'The Mahogany Pages|BIPOC Queer Events by SoftQueerWealth';

export const DEFAULT_PAGE_DESCRIPTION =
  'SoftQueerWealth curates queer events weekly for DC, Baltimore, NYC, and beyond. Black and Brown queer centered, inclusive of all queer identities.';

type CityMeta = {
  title: string;
  description: string;
};

function cityMetaFor(city: CityKey): CityMeta {
  const label = cityDisplayLabel(city);
  return {
    title: `Queer events in ${label} | The Mahogany Pages`,
    description: `Black and Brown queer events in ${label}, curated by SoftQueerWealth. Find community, filter by vibe, and build your itinerary.`,
  };
}

export function getCityPageMeta(city: string): CityMeta {
  if (city && isCitySlug(city)) return cityMetaFor(city);
  return {
    title: DEFAULT_PAGE_TITLE,
    description: DEFAULT_PAGE_DESCRIPTION,
  };
}

/** Update the browser tab title (and description meta when present) for the active city. */
export function applyCityDocumentMeta(city: string): void {
  if (typeof document === 'undefined') return;

  const { title, description } = getCityPageMeta(city);
  document.title = title;

  const descriptionEl = document.querySelector('meta[name="description"]');
  if (descriptionEl) {
    descriptionEl.setAttribute('content', description);
  }

  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', title);

  const ogDescription = document.querySelector('meta[property="og:description"]');
  if (ogDescription) ogDescription.setAttribute('content', description);

  const pathname = city && isCitySlug(city) ? `/${city}` : '/';
  const origin = window.location.origin;
  const canonicalUrl = `${origin}${pathname === '/' ? '/' : pathname}`;

  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) ogUrl.setAttribute('content', canonicalUrl);

  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.setAttribute('href', canonicalUrl);
}
