import { useState, type ReactNode } from 'react';
import type { GbpHospitalityItem } from '../../data/globalBlackPride';
import type { BlaqTabId, BlaqTravelCard } from '../../data/baltimoreBlaqPride';
import {
  BLAQ_TABS,
  BLAQ_TRAVEL_ATTRIBUTION,
  BLAQ_TRAVEL_CARDS,
  BLAQ_TRAVEL_FINAL_CHECKLIST,
} from '../../data/baltimoreBlaqPride';
import { badgeClassForLabel } from '../../lib/badgeClass';
import { displayAudienceBadges } from '../../lib/displayAudienceBadges';
import {
  getBlaqDancePlaces,
  getBlaqDrinkPlaces,
  getBlaqEatPlaces,
  getBlaqExperiences,
  getBlaqStayPlaces,
} from '../../lib/gbpStayHotels';

const BLAQ_STAY = getBlaqStayPlaces();
const BLAQ_EAT = getBlaqEatPlaces();
const BLAQ_DRINK = getBlaqDrinkPlaces();
const BLAQ_DANCE = getBlaqDancePlaces();
const BLAQ_EXPERIENCES = getBlaqExperiences();

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

export interface BaltimoreBlaqPrideTabsProps {
  activeTab: BlaqTabId;
  onTabChange: (tab: BlaqTabId) => void;
  programPanel: ReactNode;
}

export function BaltimoreBlaqPrideTabs({
  activeTab,
  onTabChange,
  programPanel,
}: BaltimoreBlaqPrideTabsProps) {
  return (
    <div className="gbp-tabs-wrap">
      <div className="tab-scroll" role="tablist" aria-label="Baltimore BLAQ Pride">
        {BLAQ_TABS.map((tab) => (
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
            items={BLAQ_STAY}
            intro="Queer-friendly stays and hotels around Baltimore."
            emptyMessage="Stay listings are coming soon — check back after the hospitality sheet is updated."
          />
        ) : null}
        {activeTab === 'eat' ? (
          <HospitalityList
            items={BLAQ_EAT}
            intro="Community favorites 😋"
            emptyMessage="No eat listings in the guide right now."
          />
        ) : null}
        {activeTab === 'drink' ? (
          <HospitalityList
            items={BLAQ_DRINK}
            intro="Bars, cafés & queer nightlife drinks."
            emptyMessage="No drink listings in the guide right now."
          />
        ) : null}
        {activeTab === 'dance' ? (
          <HospitalityList
            items={BLAQ_DANCE}
            intro="Clubs, cabaret & dance floors."
            emptyMessage="Dance listings are coming soon — check back after the hospitality sheet is updated."
          />
        ) : null}
        {activeTab === 'experience' ? (
          <HospitalityList
            items={BLAQ_EXPERIENCES}
            intro="Cultural, wellness & community experiences beyond nightlife."
            emptyMessage="No experiences in the guide right now."
          />
        ) : null}
        {activeTab === 'travelinfo' ? (
          <div className="gbp-travel-panel">
            <p className="eyebrow">Baltimore Know Before You Go</p>
            <p className="gbp-travel-lede">Quick travel essentials for Baltimore BLAQ Pride week.</p>
            <div className="attribution-banner">{BLAQ_TRAVEL_ATTRIBUTION}</div>
            {BLAQ_TRAVEL_CARDS.map((card) => (
              <TravelCard key={card.title} card={card} />
            ))}
            <div className="final-checklist">
              <h4>Before You Go</h4>
              {BLAQ_TRAVEL_FINAL_CHECKLIST.map((item) => (
                <div key={item} className="check-item">
                  <span className="mark" aria-hidden="true">
                    ✓
                  </span>
                  {item}
                </div>
              ))}
            </div>
            <div className="attribution-banner">{BLAQ_TRAVEL_ATTRIBUTION}</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
