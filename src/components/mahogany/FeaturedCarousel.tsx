import { FEATURED_FESTIVALS, type FeaturedFestival } from '../../constants/festivals';

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

interface FeaturedCarouselProps {
  featuredId: string | null;
  onSelect: (id: string) => void;
}

export function FeaturedCarousel({ featuredId, onSelect }: FeaturedCarouselProps) {
  return (
    <div className="featured-carousel">
      <p className="featured-section-label">Featured</p>
      <div className="featured-scroll" role="listbox" aria-label="Featured festivals">
        {FEATURED_FESTIVALS.map((card: FeaturedFestival) => {
          const selected = featuredId === card.id;
          return (
            <button
              key={card.id}
              type="button"
              role="option"
              aria-selected={selected}
              className={`featured-card${selected ? ' active' : ''}`}
              onClick={() => onSelect(card.id)}
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
