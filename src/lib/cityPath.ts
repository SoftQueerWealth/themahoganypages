import { type CityKey, cityDisplayLabel } from '../constants/cities';

const CITY_SLUGS = new Set<string>([
  'atlanta',
  'baltimore',
  'dc',
  'dmv',
  'nyc',
  'chicago',
  'paris',
]);

export function isCitySlug(value: string): value is CityKey {
  return CITY_SLUGS.has(value);
}

/** Known city from pathname (`/nyc` → `nyc`), or `''` for `/` / unknown. */
export function cityFromPathname(pathname: string): string {
  const segment = pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  if (!segment || segment.includes('/')) return '';
  return isCitySlug(segment) ? segment : '';
}

export function pathnameForCity(city: string): string {
  if (!city || !isCitySlug(city)) return '/';
  return `/${city}`;
}

/** Update the browser path while preserving search + hash. */
export function setCityPathname(city: string, mode: 'push' | 'replace' = 'push'): string {
  if (typeof window === 'undefined') return pathnameForCity(city);

  const pathname = pathnameForCity(city);
  const url = new URL(window.location.href);
  if (url.pathname !== pathname) {
    url.pathname = pathname;
    const next = `${url.pathname}${url.search}${url.hash}`;
    if (mode === 'replace') {
      window.history.replaceState(null, '', next);
    } else {
      window.history.pushState(null, '', next);
    }
  }
  return pathname;
}

export function cityPathLabel(city: string): string {
  return city ? cityDisplayLabel(city) : 'All Cities';
}
