const PINNED_AUDIENCE_BADGES = ['black', 'queer'];
const MAX_VISIBLE_AUDIENCE_BADGES = 3;

function normalizeAudienceBadge(value: string): string {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

export type AudienceBadgeDisplay = {
  shown: string[];
  overflow: string[];
};

/**
 * Audience badges for event cards. Black and Queer stay on the card when tagged.
 * Cap at 3 shown, rest in overflow.
 */
export function displayAudienceBadges(badges: string[]): AudienceBadgeDisplay {
  const pinned: string[] = [];
  const rest: string[] = [];
  for (const badge of badges) {
    if (PINNED_AUDIENCE_BADGES.includes(normalizeAudienceBadge(badge))) pinned.push(badge);
    else rest.push(badge);
  }
  const visible = [...pinned, ...rest];
  if (visible.length <= MAX_VISIBLE_AUDIENCE_BADGES) {
    return { shown: visible, overflow: [] };
  }

  return {
    shown: visible.slice(0, MAX_VISIBLE_AUDIENCE_BADGES),
    overflow: visible.slice(MAX_VISIBLE_AUDIENCE_BADGES),
  };
}
