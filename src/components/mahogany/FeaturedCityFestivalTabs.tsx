import { useState, type ReactNode } from 'react';
import type { GbpHospitalityItem } from '../../data/globalBlackPride';
import type { BlaqTabDef, BlaqTabId, BlaqTravelCard } from '../../data/baltimoreBlaqPride';
import { badgeClassForLabel } from '../../lib/badgeClass';
import { displayAudienceBadges } from '../../lib/displayAudienceBadges';
import { AccessDialog, AccessMark } from '../AccessDialog';

type HosCredit = { credit: string; creditSourceLink?: string };

function uniqueHosCredits(items: GbpHospitalityItem[]): HosCredit[] {
  const seen = new Set<string>();
  const credits: HosCredit[] = [];
  for (const item of items) {
    const credit = item.credit?.trim();
    if (!credit) continue;
    const key = credit.toLowerCase().replace(/\s+/g, ' ');
    if (seen.has(key)) continue;
    seen.add(key);
    credits.push({
      credit,
      creditSourceLink: item.creditSourceLink?.trim() || undefined,
    });
  }
  return credits;
}

function HosAudienceTags({ tags }: { tags: string[] }) {
  const [expanded, setExpanded] = useState(false);
  const { shown, overflow } = displayAudienceBadges(tags);
  const visible = expanded ? [...shown, ...overflow] : shown;

  return (
    <div className="hos-tags event-badges">
      {visible.map((tag) => (
        <span key={tag} className={`badge ${badgeClassForLabel(tag)}`}>
          {tag}
        </span>
      ))}
      {!expanded && overflow.length > 0 ? (
        <button
          type="button"
          className="badge badge-overflow"
          aria-label={`Show ${overflow.length} more audience tags`}
          onClick={() => setExpanded(true)}
        >
          +{overflow.length}
        </button>
      ) : null}
    </div>
  );
}

function matchesPlaceTags(item: GbpHospitalityItem, tags: ReadonlySet<string> | undefined): boolean {
  if (!tags || tags.size === 0) return true;
  const itemTags = item.tags.map((tag) => tag.toLowerCase());
  return [...tags].some((tag) => itemTags.includes(tag));
}

function GuidePlaceRow({ item }: { item: GbpHospitalityItem }) {
  const [accessOpen, setAccessOpen] = useState(false);

  return (
    <article className="guide-row">
      <div className="guide-row-main">
        <div className="event-badges">
          {item.tags.map((tag) => (
            <span key={tag} className={`badge ${badgeClassForLabel(tag)}`}>
              {tag}
            </span>
          ))}
        </div>
        <h4 className="guide-row-title">{item.title}</h4>
        {item.bio ? <p className="guide-row-note">{item.bio}</p> : null}
        {item.address ? (
          item.addressMapsUrl ? (
            <p className="guide-row-address">
              <a href={item.addressMapsUrl} target="_blank" rel="noopener noreferrer">
                {item.address}
              </a>
            </p>
          ) : (
            <p className="guide-row-address">{item.address}</p>
          )
        ) : null}
        <div className="guide-learn-row">
          <button type="button" className="guide-access-btn" aria-label="Accessibility details" onClick={() => setAccessOpen(true)}>
            <AccessMark />
          </button>
          <button type="button" className="guide-learn" onClick={() => setAccessOpen(true)}>
            Learn more about this place
          </button>
        </div>
      </div>
      {item.bookUrl ? (
        <div className="guide-row-actions">
          <a className="guide-tickets" href={item.bookUrl} target="_blank" rel="noopener noreferrer">
            {item.bookLabel}
          </a>
        </div>
      ) : null}
      {accessOpen ? (
        <AccessDialog title={item.title} titleId={`access-${item.id}`} onClose={() => setAccessOpen(false)}>
          {item.bio ? <p className="guide-modal-note">{item.bio}</p> : null}
          {item.address ? <p>{item.address}</p> : null}
          {item.price ? <p>{item.price}</p> : null}
        </AccessDialog>
      ) : null}
    </article>
  );
}

function HospitalityList({
  items,
  intro,
  emptyMessage,
  variant = 'classic',
}: {
  items: GbpHospitalityItem[];
  intro: string;
  emptyMessage: string;
  variant?: 'classic' | 'guide';
}) {
  const credits = uniqueHosCredits(items);

  if (variant === 'guide') {
    return (
      <div className="guide-list">
        {intro ? <p className="gbp-hos-intro">{intro}</p> : null}
        {items.length === 0 ? <p className="gbp-empty">{emptyMessage}</p> : null}
        {items.map((item) => (
          <GuidePlaceRow key={item.id} item={item} />
        ))}
        {credits.length > 0 ? (
          <p className="hos-credits">
            Sourced with help from{' '}
            {credits.map((entry, index) => (
              <span key={entry.credit}>
                {index > 0 ? ', ' : null}
                {entry.creditSourceLink ? (
                  <a className="hos-credit-link" href={entry.creditSourceLink} target="_blank" rel="noopener noreferrer">
                    {entry.credit}
                  </a>
                ) : (
                  entry.credit
                )}
              </span>
            ))}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="gbp-hos-panel">
      <p className="gbp-hos-intro">{intro}</p>
      {items.length === 0 ? <p className="gbp-empty">{emptyMessage}</p> : null}
      {items.map((item) => (
        <article key={item.id} className="hos-row">
          <div className="hos-info">
            <HosAudienceTags tags={item.tags} />
            <h5>{item.title}</h5>
            {item.price ? (
              <p className="hos-price" aria-label={`Price ${item.price}`}>
                {item.price}
              </p>
            ) : null}
            {item.address ? (
              item.addressMapsUrl ? (
                <p className="hos-meta">
                  <a
                    className="hos-maplink"
                    href={item.addressMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {item.address}
                  </a>
                </p>
              ) : (
                <p className="hos-meta">{item.address}</p>
              )
            ) : null}
            {item.nearbyStation ? (
              <p className="hos-station">Nearby Station: {item.nearbyStation}</p>
            ) : null}
            {item.bio ? <p className="hos-bio">{item.bio}</p> : null}
            {item.discountCode ? (
              <p className="hos-code" role="note">
                Code: <span className="hos-code-value">{item.discountCode}</span>
              </p>
            ) : item.communityPerk ? (
              <p className="hos-code" role="note">
                Community perk
              </p>
            ) : null}
            {item.igHandle ? (
              <a
                className="hos-ig"
                href={`https://instagram.com/${item.igHandle.replace(/^@/, '')}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.igHandle}
              </a>
            ) : null}
            {item.vibeTags.length > 0 ? (
              <div className="hos-vibes">
                {item.vibeTags.map((vibe) => (
                  <span key={vibe} className="vibes-tag">
                    {vibe}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
          {item.bookUrl ? (
            <div className="hos-action">
              <a className="hos-book" href={item.bookUrl} target="_blank" rel="noopener noreferrer">
                {item.bookLabel}
              </a>
            </div>
          ) : null}
        </article>
      ))}
      {credits.length > 0 ? (
        <p className="hos-credits">
          Sourced with help from{' '}
          {credits.map((entry, index) => (
            <span key={entry.credit}>
              {index > 0 ? ', ' : null}
              {entry.creditSourceLink ? (
                <a
                  className="hos-credit-link"
                  href={entry.creditSourceLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {entry.credit}
                </a>
              ) : (
                entry.credit
              )}
            </span>
          ))}
        </p>
      ) : null}
    </div>
  );
}

function TravelCard({ card }: { card: BlaqTravelCard }) {
  return (
    <div className="travel-card">
      <div className="travel-card-head">
        <span className="travel-card-ic" aria-hidden="true">
          {card.icon}
        </span>
        <h4>{card.title}</h4>
      </div>
      {card.facts.map((fact) => (
        <p key={fact} className="travel-fact">
          {fact}
        </p>
      ))}
      {card.checklistLabel && card.checklist?.length ? (
        <div className="travel-checklist">
          <div className="travel-check-lbl">{card.checklistLabel}</div>
          {card.checklist.map((item) => (
            <div key={item} className="check-item">
              <span className="mark" aria-hidden="true">
                ✓
              </span>
              {item}
            </div>
          ))}
        </div>
      ) : null}
      {card.apps?.length ? (
        <div className="app-chips">
          {card.apps.map((app) => (
            <span key={app} className="app-chip">
              {app}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export interface FeaturedCityHospitalityLists {
  stay: GbpHospitalityItem[];
  eat: GbpHospitalityItem[];
  drink: GbpHospitalityItem[];
  dance: GbpHospitalityItem[];
  experience: GbpHospitalityItem[];
  wellness: GbpHospitalityItem[];
}

export interface FeaturedCityTravelContent {
  eyebrow: string;
  lede: string;
  attribution: string;
  cards: BlaqTravelCard[];
  finalChecklist: string[];
}

export interface FeaturedCityFestivalTabsProps {
  ariaLabel: string;
  tabs: BlaqTabDef[];
  activeTab: BlaqTabId;
  onTabChange: (tab: BlaqTabId) => void;
  programPanel: ReactNode;
  hospitality: FeaturedCityHospitalityLists;
  hospitalityIntros: {
    stay: string;
    eat: string;
    drink: string;
    dance: string;
    experience: string;
    wellness: string;
  };
  travel?: FeaturedCityTravelContent;
  layout?: 'classic' | 'city-feature';
  cityName?: string;
  onOpenGuide?: () => void;
  placeTags?: ReadonlySet<string>;
}

const CITY_FEATURE_PROGRAM_COPY: Record<string, { title: string; lede: string }> = {
  Atlanta: {
    title: "Atlanta, what's the plan?",
    lede: "There's always something going on. Pull up with your people.",
  },
  Baltimore: {
    title: "What's the move in Baltimore?",
    lede: "Charm City's got plans. Parties, brunches, shows and more. Come through.",
  },
  DC: {
    title: "What's happening, DC?",
    lede: 'Chocolate City we outside! Find a spot and pull up.',
  },
  DMV: {
    title: 'The DMV is outside tonight.',
    lede: 'DC, Maryland and Virginia in one list. Pick your side and come through.',
  },
  'New York': {
    title: "New York, who's out tonight?",
    lede: 'The city that never sleeps has a lot going on. Find your people and go.',
  },
  Paris: {
    title: 'Paris is calling.',
    lede: "Black and queer life abroad, picked by locals. Let's goooo!",
  },
};

function cityFeatureProgramCopy(cityName: string): { title: string; lede: string } {
  return (
    CITY_FEATURE_PROGRAM_COPY[cityName] ?? {
      title: `What's the move in ${cityName}`,
      lede: 'Parties, brunches, shows and more. Come through.',
    }
  );
}

const CITY_FEATURE_TABS: { id: BlaqTabId; label: string }[] = [
  { id: 'program', label: 'Things to Do' },
  { id: 'hangouts', label: 'Hangouts' },
  { id: 'wellness', label: 'Sexual Wellness' },
  { id: 'travelinfo', label: 'Know Before You Go' },
];

function CityFeatureIcon({ id }: { id: BlaqTabId }) {
  if (id === 'program') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="4" y="5" width="16" height="15" rx="3" />
        <path d="M4 10h16M9 3v4M15 3v4" />
      </svg>
    );
  }
  if (id === 'hangouts') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z" />
      </svg>
    );
  }
  if (id === 'wellness') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8v.01" />
    </svg>
  );
}

export function FeaturedCityFestivalTabs({
  ariaLabel,
  tabs,
  activeTab,
  onTabChange,
  programPanel,
  hospitality,
  hospitalityIntros,
  travel,
  layout = 'classic',
  cityName = 'this city',
  onOpenGuide,
  placeTags,
}: FeaturedCityFestivalTabsProps) {
  if (layout === 'city-feature') {
    const hangoutGroups = [
      { title: 'Eat', items: hospitality.eat, intro: hospitalityIntros.eat, empty: 'No eat listings in the guide right now.' },
      { title: 'Drink', items: hospitality.drink, intro: hospitalityIntros.drink, empty: 'No drink listings in the guide right now.' },
      { title: 'Dance', items: hospitality.dance, intro: hospitalityIntros.dance, empty: 'No dance listings in the guide right now.' },
      {
        title: 'Experiences',
        items: hospitality.experience,
        intro: hospitalityIntros.experience,
        empty: 'No experiences in the guide right now.',
      },
    ]
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => matchesPlaceTags(item, placeTags)),
      }))
      .filter((group) => group.items.length > 0);
    const programCopy = cityFeatureProgramCopy(cityName);

    return (
      <div className="gbp-tabs-wrap city-feature">
        <div className="city-feature-tabs" role="tablist" aria-label={ariaLabel}>
          {CITY_FEATURE_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`city-feature-tab${activeTab === tab.id ? ' active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              <CityFeatureIcon id={tab.id} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="gbp-tab-panel" role="tabpanel">
          {activeTab === 'program' ? (
            <div className="city-feature-panel">
              <h2 className="city-feature-title">{programCopy.title}</h2>
              <p className="city-feature-lede">{programCopy.lede}</p>
              {programPanel}
            </div>
          ) : null}

          {activeTab === 'hangouts' ? (
            <div className="city-feature-panel">
              <h2 className="city-feature-title">Where we link up in {cityName}</h2>
              <p className="city-feature-lede">
                Spots that stay open all year. Every listing tells you who the space is for, so you know what
                you&apos;re walking into.
              </p>
              {hangoutGroups.length === 0 ? (
                <p className="gbp-empty">Nothing&apos;s popping yet. Loosen a filter or two and try again.</p>
              ) : (
                hangoutGroups.map((group) => (
                  <section key={group.title} className="city-feature-group">
                    <h3 className="city-feature-subhead">{group.title}</h3>
                    <HospitalityList items={group.items} intro={group.intro} emptyMessage={group.empty} variant="guide" />
                  </section>
                ))
              )}
            </div>
          ) : null}

          {activeTab === 'wellness' ? (
            <div className="city-feature-panel">
              <h2 className="city-feature-title">Sexual Health and Wellness in {cityName}</h2>
              <HospitalityList
                items={hospitality.wellness.filter((item) => matchesPlaceTags(item, placeTags))}
                intro={`Affirming care and resources for Black queer people in ${cityName}.`}
                emptyMessage="Nothing's popping yet. Loosen a filter or two and try again."
                variant="guide"
              />
              <div className="city-feature-guide">
                <div className="city-feature-guide-kicker">The full guide</div>
                <h3>Beyond {cityName}</h3>
                <p>
                  Safer sex, pleasure, kink and consent and national resources live in the full Sexual Wellness
                  guide.
                </p>
                <button type="button" className="city-feature-guide-btn" onClick={onOpenGuide}>
                  Open the guide
                </button>
              </div>
            </div>
          ) : null}

          {activeTab === 'travelinfo' ? (
            <div className="city-feature-panel">
              <h2 className="city-feature-title">{cityName} Guide for Black Queer Visitors</h2>
              <p className="city-feature-lede">
                Know before you go: a few things to know about {cityName} before you get here.
              </p>
              {travel ? (
                <div className="gbp-travel-panel">
                  <p className="eyebrow">{travel.eyebrow}</p>
                  <p className="gbp-travel-lede">{travel.lede}</p>
                  <div className="attribution-banner">{travel.attribution}</div>
                  {travel.cards.map((card) => (
                    <TravelCard key={card.title} card={card} />
                  ))}
                  <div className="final-checklist">
                    <h4>Before You Go</h4>
                    {travel.finalChecklist.map((item) => (
                      <div key={item} className="check-item">
                        <span className="mark" aria-hidden="true">
                          ✓
                        </span>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              <section className="city-feature-group">
                <h3 className="city-feature-subhead">Where to stay</h3>
                <HospitalityList
                  items={hospitality.stay}
                  intro={hospitalityIntros.stay}
                  emptyMessage="Stay listings are coming soon."
                  variant="guide"
                />
              </section>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="gbp-tabs-wrap">
      <div className="tab-scroll" role="tablist" aria-label={ariaLabel}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`tab-pill${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="gbp-tab-panel" role="tabpanel">
        {activeTab === 'program' ? programPanel : null}
        {activeTab === 'stay' ? (
          <HospitalityList
            items={hospitality.stay}
            intro={hospitalityIntros.stay}
            emptyMessage="Stay listings are coming soon — check back after the hospitality sheet is updated."
          />
        ) : null}
        {activeTab === 'eat' ? (
          <HospitalityList
            items={hospitality.eat}
            intro={hospitalityIntros.eat}
            emptyMessage="No eat listings in the guide right now."
          />
        ) : null}
        {activeTab === 'drink' ? (
          <HospitalityList
            items={hospitality.drink}
            intro={hospitalityIntros.drink}
            emptyMessage="No drink listings in the guide right now."
          />
        ) : null}
        {activeTab === 'dance' ? (
          <HospitalityList
            items={hospitality.dance}
            intro={hospitalityIntros.dance}
            emptyMessage="Dance listings are coming soon — check back after the hospitality sheet is updated."
          />
        ) : null}
        {activeTab === 'experience' ? (
          <HospitalityList
            items={hospitality.experience}
            intro={hospitalityIntros.experience}
            emptyMessage="No experiences in the guide right now."
          />
        ) : null}
        {activeTab === 'wellness' ? (
          <HospitalityList
            items={hospitality.wellness}
            intro={hospitalityIntros.wellness}
            emptyMessage="No sexual wellness listings in the guide right now."
          />
        ) : null}
        {activeTab === 'travelinfo' && travel ? (
          <div className="gbp-travel-panel">
            <p className="eyebrow">{travel.eyebrow}</p>
            <p className="gbp-travel-lede">{travel.lede}</p>
            <div className="attribution-banner">{travel.attribution}</div>
            {travel.cards.map((card) => (
              <TravelCard key={card.title} card={card} />
            ))}
            <div className="final-checklist">
              <h4>Before You Go</h4>
              {travel.finalChecklist.map((item) => (
                <div key={item} className="check-item">
                  <span className="mark" aria-hidden="true">
                    ✓
                  </span>
                  {item}
                </div>
              ))}
            </div>
            <div className="attribution-banner">{travel.attribution}</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
