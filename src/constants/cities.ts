export const CITY_ORDER = ['atlanta', 'baltimore', 'dc', 'dmv', 'nyc'] as const;

export type MainCityKey = (typeof CITY_ORDER)[number];
export type CityKey = MainCityKey | 'chicago' | 'paris';

const SHEET_CITY_MAP: Record<string, CityKey> = {
  dc: 'dc',
  dmv: 'dmv',
  nyc: 'nyc',
  newyork: 'nyc',
  baltimore: 'baltimore',
  atlanta: 'atlanta',
  atl: 'atlanta',
  chicago: 'chicago',
  thechi: 'chicago',
  chi: 'chicago',
  paris: 'paris',
};

const CITY_LABELS: Record<CityKey, string> = {
  dc: 'DC',
  nyc: 'New York',
  baltimore: 'Baltimore',
  dmv: 'DMV',
  atlanta: 'Atlanta',
  chicago: 'Chicago',
  paris: 'Paris',
};

export function normalizeSheetCity(raw: string): CityKey | null {
  const key = raw.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  return SHEET_CITY_MAP[key] ?? null;
}

export function cityDisplayLabel(key: string): string {
  return CITY_LABELS[key as CityKey] ?? key;
}

/** Sort city keys A–Z by display label; blank/unknown city keys sort last. */
export function compareCityKeysByLabel(a: string, b: string): number {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return cityDisplayLabel(a).localeCompare(cityDisplayLabel(b), undefined, { sensitivity: 'base' });
}

export type CityFilterOption = { value: string; label: string };

export const cityFilterOptions: CityFilterOption[] = CITY_ORDER.map((key) => ({
  value: key,
  label: CITY_LABELS[key],
}));

export function cityFilterOptionsForKeys(keys: Iterable<string>): CityFilterOption[] {
  const present = [...new Set([...keys].filter(Boolean))].sort(compareCityKeysByLabel);
  return present.map((key) => ({
    value: key,
    label: cityDisplayLabel(key),
  }));
}
