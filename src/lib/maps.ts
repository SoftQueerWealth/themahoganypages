const LOCATION_SEPARATOR = ' · ';

/** Split "Venue · Address" lines from the sheet into display parts. */
export function splitLocationParts(location: string): { venue: string | null; address: string | null } {
  const trimmed = location.trim();
  if (!trimmed) return { venue: null, address: null };

  const separatorIndex = trimmed.indexOf(LOCATION_SEPARATOR);
  if (separatorIndex === -1) {
    return { venue: null, address: trimmed.replace(/\s*\n\s*/g, ', ') };
  }

  const venue = trimmed.slice(0, separatorIndex).trim();
  const address = trimmed
    .slice(separatorIndex + LOCATION_SEPARATOR.length)
    .trim()
    .replace(/\s*\n\s*/g, ', ');

  return {
    venue: venue || null,
    address: address || null,
  };
}

/** Maps Google Maps search URL for a free-text address / venue line. */
export function mapsSearchUrl(query: string): string {
  const q = encodeURIComponent(query);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

export function isMappableLocation(location: string): boolean {
  const t = location.trim();
  if (!t) return false;
  if (/^see ticket link for address/i.test(t)) return false;
  if (/^varies\b/i.test(t)) return false;
  if (/^various\b/i.test(t)) return false;
  if (/^reach out\b/i.test(t)) return false;
  if (/^tbd\b/i.test(t)) return false;
  if (/^n\/?a\b/i.test(t)) return false;
  // Instructional / social-only lines are not map queries.
  if (/instagram|email |dm us|message /i.test(t) && !/\d/.test(t)) return false;
  return true;
}
