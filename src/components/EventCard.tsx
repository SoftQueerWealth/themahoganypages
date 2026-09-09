import { Check, Clock, Lightbulb, MapPin } from 'lucide-react';
import { useState } from 'react';
import type { PrideEvent } from '../types/event';
import { trackClick } from '../lib/analytics';
import { eventCtaButtonClass, eventCtaLabel } from '../lib/eventCta';
import { badgeClassForLabel } from '../lib/badgeClass';
import { displayAudienceBadges } from '../lib/displayAudienceBadges';
import { flyerModalUrl } from '../lib/flyerUrl';
import { parseDiscountDisplay, hasVisibleDiscountCode } from '../lib/parseDiscountDisplay';
import { isMappableLocation, mapsSearchUrl, splitLocationParts } from '../lib/maps';
import { FlyerLightbox } from './FlyerLightbox';

interface EventCardProps {
  event: PrideEvent;
  visible: boolean;
  going?: boolean;
  onToggleGoing?: () => void;
}

function hasDisplayableTime(time: string | undefined): boolean {
  const t = (time ?? '').trim();
  return Boolean(t) && /\d/.test(t);
}

function LocationDisplay({
  location,
  mapsHref,
  onMapsClick,
}: {
  location: string;
  mapsHref: string | null;
  onMapsClick?: () => void;
}) {
  const { venue, address } = splitLocationParts(location);
  const linkProps = {
    href: mapsHref!,
    target: '_blank' as const,
    rel: 'noopener noreferrer',
    className: 'meta-pill-maplink',
    onClick: onMapsClick,
  };

  if (!mapsHref) {
    return <span className="meta-pill-location-text">{location}</span>;
  }

  if (venue && address) {
    return (
      <span className="meta-pill-location-text">
        <span className="meta-pill-venue">{venue}</span>
        <span className="meta-pill-sep" aria-hidden>
          {' · '}
        </span>
        <a {...linkProps}>{address}</a>
      </span>
    );
  }

  return (
    <span className="meta-pill-location-text">
      <a {...linkProps}>{address ?? location}</a>
    </span>
  );
}

export function EventCard({ event, visible, going = false, onToggleGoing }: EventCardProps) {
  const [flyerOpen, setFlyerOpen] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [audienceExpanded, setAudienceExpanded] = useState(false);
  const registrationDirections = event.registrationDirections?.trim() || '';
  const ctaLabel = eventCtaLabel(event);
  const ctaButtonClass = eventCtaButtonClass(event);
  const mapsHref = isMappableLocation(event.location) ? mapsSearchUrl(event.location) : null;
  const discountParsed = hasVisibleDiscountCode(event.discountCode)
    ? parseDiscountDisplay(event.discountCode!)
    : null;
  const hasFlyer = Boolean(event.flyerUrl);
  const { shown: shownAudienceBadges, overflow: overflowAudienceBadges } = displayAudienceBadges(
    event.badges,
  );
  const visibleAudienceBadges = audienceExpanded
    ? [...shownAudienceBadges, ...overflowAudienceBadges]
    : shownAudienceBadges;
  const showTime = hasDisplayableTime(event.time);

  return (
    <div
      className={`event-card ${event.cardClass}${visible ? '' : ' filtered-out'}${going ? ' event-card--going' : ''}${hasFlyer ? ' event-card--has-flyer' : ''}`}
      data-event-id={event.id}
    >
      {hasFlyer && event.flyerUrl ? (
        <button
          type="button"
          className="event-flyer-thumb"
          aria-label={`View flyer for ${event.name}`}
          onClick={() => setFlyerOpen(true)}
        >
          <img
            src={event.flyerUrl}
            alt=""
            className="event-flyer"
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
          />
          <span className="event-flyer-expand" aria-hidden>
            ⤢
          </span>
        </button>
      ) : null}

      {flyerOpen && event.flyerUrl ? (
        <FlyerLightbox
          src={flyerModalUrl(event.flyerUrl)}
          label={event.name}
          onClose={() => setFlyerOpen(false)}
        />
      ) : null}

      {registrationOpen && registrationDirections ? (
        <div
          className="modal-overlay open"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`registration-directions-${event.id}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) setRegistrationOpen(false);
          }}
        >
          <div className="modal-box">
            <button
              type="button"
              className="modal-close"
              aria-label="Close"
              onClick={() => setRegistrationOpen(false)}
            >
              ✕
            </button>
            <h2 id={`registration-directions-${event.id}`} className="registration-directions-title">
              Registration info
            </h2>
            <p className="registration-directions-body">{registrationDirections}</p>
          </div>
        </div>
      ) : null}

      <div className="event-body">
        <div className="event-main">
          <div className="event-badges">
            {visibleAudienceBadges.map((b) => (
              <span key={b} className={`badge ${badgeClassForLabel(b)}`}>
                {b}
              </span>
            ))}
            {!audienceExpanded && overflowAudienceBadges.length > 0 ? (
              <button
                type="button"
                className="badge badge-overflow"
                aria-label={`Show ${overflowAudienceBadges.length} more audience tags`}
                onClick={() => setAudienceExpanded(true)}
              >
                +{overflowAudienceBadges.length}
              </button>
            ) : null}
          </div>
          <div className="event-name">{event.name}</div>
          {event.organizer ? <div className="event-organizer">{event.organizer}</div> : null}
          <div className="event-meta">
            {showTime || event.price ? (
              <span className="meta-pill">
                {showTime ? (
                  <>
                    <Clock size={10} strokeWidth={2} aria-hidden />
                    {event.time.trim()}
                  </>
                ) : null}
                {showTime && event.price ? (
                  <span className="meta-pill-sep" aria-hidden>
                    {' · '}
                  </span>
                ) : null}
                {event.price ? (
                  <span className={event.free ? 'meta-pill--price-free' : undefined}>{event.price}</span>
                ) : null}
              </span>
            ) : null}
            <span className="meta-pill meta-pill--location">
              <MapPin size={10} strokeWidth={2} aria-hidden />
              <LocationDisplay
                location={event.location}
                mapsHref={mapsHref}
                onMapsClick={() => trackClick(event.name, 'Open in Maps')}
              />
            </span>
          </div>
          {event.vibeTags.length > 0 ? (
            <div className="event-vibes">
              {event.vibeTags.map((v) => (
                <span key={v} className="vibes-tag">
                  {v}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="event-action">
          {onToggleGoing ? (
            <button
              type="button"
              className={`event-going-toggle${going ? ' active' : ''}`}
              role="checkbox"
              aria-checked={going}
              aria-label={going ? 'Remove from your itinerary' : 'Add to your itinerary'}
              title={going ? 'Remove from your itinerary' : 'Add to your itinerary'}
              onClick={onToggleGoing}
            >
              <span className="event-going-toggle-box" aria-hidden>
                <Check size={14} strokeWidth={2.5} />
              </span>
              <span className="event-going-toggle-label" aria-hidden>
                {going ? 'Added' : 'Add'}
              </span>
            </button>
          ) : null}
          {registrationDirections ? (
            <button
              type="button"
              className="event-registration-link"
              onClick={() => {
                trackClick(event.name, 'View registration info');
                setRegistrationOpen(true);
              }}
            >
              View registration info
            </button>
          ) : (
            <a
              href={event.ctaHref}
              target="_blank"
              rel="noopener noreferrer"
              className={`btn ${ctaButtonClass}`}
              onClick={() => trackClick(event.name, ctaLabel)}
            >
              {ctaLabel} →
            </a>
          )}
          {discountParsed ? (
            <div className="discount-code" role="note">
              {discountParsed.kind === 'code' ? (
                <span className="discount-code-row-inner">
                  <span className="discount-code-emoji" aria-hidden>
                    🏷️
                  </span>
                  <span className="discount-code-label">Code:</span>
                  <span className="discount-code-value">{discountParsed.code}</span>
                  {discountParsed.expiresSuffix ? (
                    <span className="discount-code-expires">{discountParsed.expiresSuffix}</span>
                  ) : null}
                </span>
              ) : (
                <span className="discount-code-row-inner discount-code-row-inner--tip">
                  <Lightbulb className="discount-code-tip-icon" size={11} strokeWidth={2} aria-hidden />
                  <span className="discount-code-tip-text">{discountParsed.text}</span>
                </span>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
