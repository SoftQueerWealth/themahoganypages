import { CtaButtonClass, type CtaButtonClassId } from '../types/event';

const SPECIAL_CTA_LABELS = new Set(['RSVP Free', 'Join Waitlist', 'View registration info']);

export function isInstagramUrl(href: string): boolean {
  if (!href.trim()) return false;

  try {
    const host = new URL(href).hostname.toLowerCase();
    return host === 'instagram.com' || host.endsWith('.instagram.com');
  } catch {
    return /instagram\.com/i.test(href);
  }
}

export function eventCtaLabel(event: {
  ctaHref: string;
  ctaLabel: string;
  registrationDirections?: string;
}): string {
  if (event.registrationDirections) return 'View registration info';
  if (SPECIAL_CTA_LABELS.has(event.ctaLabel)) return event.ctaLabel;
  if (!isInstagramUrl(event.ctaHref)) return 'Get Tickets';
  return event.ctaLabel;
}

export function defaultCtaLabel(ctaHref: string, free: boolean): string {
  if (!isInstagramUrl(ctaHref)) return 'Get Tickets';
  return free ? 'More Info' : 'Get Tickets';
}

export function ctaButtonClassForLabel(label: string): CtaButtonClassId {
  switch (label) {
    case 'Join Waitlist':
      return CtaButtonClass.Waitlist;
    case 'More Info':
    case 'RSVP Free':
      return CtaButtonClass.Free;
    case 'Get Tickets':
    default:
      return CtaButtonClass.Primary;
  }
}

export function eventCtaButtonClass(event: { ctaHref: string; ctaLabel: string }): CtaButtonClassId {
  return ctaButtonClassForLabel(eventCtaLabel(event));
}

export function formatRoundedEventCount(count: number): string {
  if (count <= 0) return '0';
  const rounded = Math.floor(count / 10) * 10;
  if (rounded < 10) return String(count);
  return `${rounded}+`;
}
