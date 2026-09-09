const HIDDEN_AUDIENCE_BADGES = new Set(['black', 'queer']);
const MAX_VISIBLE_AUDIENCE_BADGES = 3;

function normalizeAudienceBadge(value: string): string {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

export type AudienceBadgeDisplay = {
  shown: string[];
  overflow: string[];
};

/**
 * Audience badges for event cards: drop bare Black/Queer, cap at 3 shown, rest in overflow.
 */
export function displayAudienceBadges(badges: string[]): AudienceBadgeDisplay {
  const visible = badges.filter((badge) => !HIDDEN_AUDIENCE_BADGES.has(normalizeAudienceBadge(badge)));
  if (visible.length <= MAX_VISIBLE_AUDIENCE_BADGES) {
    return { shown: visible, overflow: [] };
  }

  return {
    shown: visible.slice(0, MAX_VISIBLE_AUDIENCE_BADGES),
    overflow: visible.slice(MAX_VISIBLE_AUDIENCE_BADGES),
  };
}
