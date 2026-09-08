const HIDDEN_AUDIENCE_BADGES = new Set(['black', 'queer']);
const MAX_VISIBLE_AUDIENCE_BADGES = 3;

function normalizeAudienceBadge(value: string): string {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Audience badges for event cards: drop bare Black/Queer, cap at 3, append +N for overflow.
 */
export function displayAudienceBadges(badges: string[]): string[] {
  const visible = badges.filter((badge) => !HIDDEN_AUDIENCE_BADGES.has(normalizeAudienceBadge(badge)));
  if (visible.length <= MAX_VISIBLE_AUDIENCE_BADGES) return visible;

  const shown = visible.slice(0, MAX_VISIBLE_AUDIENCE_BADGES);
  const overflow = visible.length - MAX_VISIBLE_AUDIENCE_BADGES;
  return [...shown, `+${overflow}`];
}
