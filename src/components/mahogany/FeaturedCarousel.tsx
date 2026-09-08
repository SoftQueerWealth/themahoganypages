import { useEffect, useRef } from 'react';
import { FEATURED_FESTIVALS, type FeaturedFestival } from '../../constants/festivals';

const MOBILE_FEATURED_MQ = '(max-width: 900px)';

function photoClassForFeatured(id: string): string {
  switch (id) {
    case 'global-black-pride':
      return 'paris';
    case 'atl-black-pride':
      return 'atlanta';
    case 'stamina-2026':
      return 'stamina';
    default:
      return 'default';
  }
}

function isMobileFeaturedViewport(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(MOBILE_FEATURED_MQ).matches;
}

function centerCardInTrack(track: HTMLElement, card: HTMLElement) {
  const trackRect = track.getBoundingClientRect();
  const cardRect = card.getBoundingClientRect();
  const cardCenterInTrack = cardRect.left - trackRect.left + track.scrollLeft + cardRect.width / 2;
  const targetLeft = cardCenterInTrack - track.clientWidth / 2;
  const maxLeft = Math.max(0, track.scrollWidth - track.clientWidth);
  track.scrollTo({
    left: Math.max(0, Math.min(maxLeft, targetLeft)),
    behavior: 'smooth',
  });
}

interface FeaturedCarouselProps {
  featuredId: string | null;
  onSelect: (id: string) => void;
}

export function FeaturedCarousel({ featuredId, onSelect }: FeaturedCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const centerSelectedCard = (id: string) => {
    if (!isMobileFeaturedViewport()) return;
    const track = trackRef.current;
    const card = cardRefs.current.get(id);
    if (!track || !card) return;
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        centerCardInTrack(track, card);
      });
    });
  };

  useEffect(() => {
    if (!featuredId) return;
    centerSelectedCard(featuredId);
  }, [featuredId]);

  return (
    <div className="featured-carousel">
      <p className="featured-section-label">Featured</p>
      <div
        ref={trackRef}
        className="featured-scroll"
        role="listbox"
        aria-label="Featured festivals"
      >
        {FEATURED_FESTIVALS.map((card: FeaturedFestival) => {
          const selected = featuredId === card.id;
          return (
            <button
              key={card.id}
              type="button"
              role="option"
              aria-selected={selected}
              className={`featured-card${selected ? ' active' : ''}`}
              ref={(el) => {
                if (el) cardRefs.current.set(card.id, el);
                else cardRefs.current.delete(card.id);
              }}
              onClick={() => {
                onSelect(card.id);
                // Parent may toggle off when tapping the active card; only center when selecting.
                if (featuredId !== card.id) centerSelectedCard(card.id);
              }}
            >
              <div className={`featured-card-photo ${photoClassForFeatured(card.id)}`} />
              <div className="featured-card-scrim" />
              <span className="featured-badge">Featured</span>
              <div className="featured-card-text">
                <h3>{card.tabLabel}</h3>
                <p>{card.location}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
