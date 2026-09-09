declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export enum SocialPlatform {
  Instagram = 'instagram',
  TikTok = 'tiktok',
  YouTube = 'youtube',
  Threads = 'threads',
  Linktree = 'linktree',
  Email = 'email',
}

import { isAnalyticsEnabled } from './initAnalytics';

function shouldTrackAnalytics(): boolean {
  return isAnalyticsEnabled() && typeof window !== 'undefined' && Boolean(window.gtag);
}

/** Shared gtag button_click with event_category / event_label. */
export function trackButtonClick(category: string, label: string): void {
  if (!shouldTrackAnalytics()) return;

  window.gtag?.('event', 'button_click', {
    event_category: category,
    event_label: label,
  });
}

export function trackCityFilterClick(cityLabel: string): void {
  trackButtonClick('City Filter', cityLabel);
}

export function trackDayFilterClick(dayLabel: string): void {
  trackButtonClick('Day Filter', dayLabel);
}

export function trackAudienceFilterClick(audienceLabel: string): void {
  trackButtonClick('Audience Filter', audienceLabel);
}

export function trackVenueFilterClick(venueLabel: string): void {
  trackButtonClick('Venue Filter', venueLabel);
}

export function trackVibesFilterClick(vibeLabel: string): void {
  trackButtonClick('Vibes Filter', vibeLabel);
}

export function trackPriceFilterClick(priceLabel: string): void {
  trackButtonClick('Price Filter', priceLabel);
}

export function trackEventCardClick(eventName: string): void {
  trackButtonClick('Event Card', eventName);
}

export function trackFeaturedEventCardClick(title: string): void {
  trackButtonClick('Featured Event Card', title);
}

export function trackPageView(pagePath: string): void {
  if (!shouldTrackAnalytics()) return;

  window.gtag?.('event', 'page_view', {
    page_path: pagePath,
    page_title: document.title,
    page_location: window.location.href,
  });
}

export function trackClick(eventName: string, label: string): void {
  if (!shouldTrackAnalytics()) return;

  window.gtag?.('event', 'button_click', {
    event_category: 'Event Guide',
    event_label: label,
    event_name_custom: eventName,
  });
}

export function trackBeautyClick(partnerName: string, url: string): void {
  if (!shouldTrackAnalytics()) return;

  window.gtag?.('event', 'beauty_partner_click', {
    event_category: 'Community Perks',
    event_label: 'Book Here',
    partner_name: partnerName,
    link_url: url,
  });
}

export function trackSocialClick(platform: SocialPlatform, url: string): void {
  if (!shouldTrackAnalytics()) return;

  window.gtag?.('event', 'social_link_click', {
    social_platform: platform,
    link_url: url,
    link_placement: 'hero',
  });
}

export function trackItineraryShare(eventCount: number): void {
  if (!shouldTrackAnalytics()) return;

  window.gtag?.('event', 'itinerary_share', {
    event_category: 'Event Guide',
    event_label: 'Share itinerary',
    event_count: eventCount,
  });
}

export function trackItineraryViewToggle(mode: string): void {
  if (!shouldTrackAnalytics()) return;

  window.gtag?.('event', 'itinerary_view_toggle', {
    event_category: 'Event Guide',
    event_label: mode,
  });
}

export function trackSharedItineraryOpen(eventCount: number): void {
  if (!shouldTrackAnalytics()) return;

  window.gtag?.('event', 'shared_itinerary_open', {
    event_category: 'Event Guide',
    event_label: 'Shared link landing',
    event_count: eventCount,
  });
}

export function trackDonationClick(linkUrl: string): void {
  if (!shouldTrackAnalytics()) return;

  window.gtag?.('event', 'donation_click', {
    event_category: 'Support',
    event_label: 'Support SoftQueerWealth',
    link_url: linkUrl,
  });
}
