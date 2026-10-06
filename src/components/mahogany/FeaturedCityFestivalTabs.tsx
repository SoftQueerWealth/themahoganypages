import { useState, type ReactNode } from 'react';
import type { GbpHospitalityItem } from '../../data/globalBlackPride';
import type { BlaqTabDef, BlaqTabId, BlaqTravelCard } from '../../data/baltimoreBlaqPride';
import { badgeClassForLabel } from '../../lib/badgeClass';
import { displayAudienceBadges } from '../../lib/displayAudienceBadges';

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

function HospitalityList({
  items,
  intro,
  emptyMessage,
}: {
  items: GbpHospitalityItem[];
  intro: string;
  emptyMessage: string;
}) {
  const credits = uniqueHosCredits(items);

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
  };
  travel: FeaturedCityTravelContent;
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
}: FeaturedCityFestivalTabsProps) {
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
        {activeTab === 'travelinfo' ? (
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
