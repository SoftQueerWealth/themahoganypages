import type { ReactNode } from 'react';
import type { GbpHospitalityItem, GbpTabId, GbpTravelCard } from '../../data/globalBlackPride';
import {
  GBP_TABS,
  GBP_TRAVEL_ATTRIBUTION,
  GBP_TRAVEL_CARDS,
  GBP_TRAVEL_FINAL_CHECKLIST,
} from '../../data/globalBlackPride';
import {
  getGbpDancePlaces,
  getGbpDrinkPlaces,
  getGbpEatPlaces,
  getGbpExperiences,
  getGbpStayHotels,
} from '../../lib/gbpStayHotels';

const GBP_STAY = getGbpStayHotels();
const GBP_EAT = getGbpEatPlaces();
const GBP_DRINK = getGbpDrinkPlaces();
const GBP_DANCE = getGbpDancePlaces();
const GBP_EXPERIENCES = getGbpExperiences();

function HospitalityList({
  items,
  intro,
}: {
  items: GbpHospitalityItem[];
  intro: string;
}) {
  return (
    <div className="gbp-hos-panel">
      <p className="gbp-hos-intro">{intro}</p>
      {items.map((item) => (
        <article key={item.id} className="hos-row">
          <div className="hos-info">
            <div className="hos-tags">
              {item.tags.map((tag) => (
                <span key={tag} className="hos-badge">
                  {tag}
                </span>
              ))}
            </div>
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
    </div>
  );
}

function TravelCard({ card }: { card: GbpTravelCard }) {
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

export interface GlobalBlackPrideTabsProps {
  activeTab: GbpTabId;
  onTabChange: (tab: GbpTabId) => void;
  programmePanel: ReactNode;
  queerParisPanel: ReactNode;
}

export function GlobalBlackPrideTabs({
  activeTab,
  onTabChange,
  programmePanel,
  queerParisPanel,
}: GlobalBlackPrideTabsProps) {
  return (
    <div className="gbp-tabs-wrap">
      <div className="tab-scroll" role="tablist" aria-label="Global Black Pride">
        {GBP_TABS.map((tab) => (
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
        {activeTab === 'programme' ? programmePanel : null}
        {activeTab === 'queerparis' ? queerParisPanel : null}
        {activeTab === 'stay' ? (
          <HospitalityList items={GBP_STAY} intro="Queer-friendly stays, TMP-vetted." />
        ) : null}
        {activeTab === 'eat' ? (
          <HospitalityList
            items={GBP_EAT}
            intro="Black-owned, queer-owned & community favorites."
          />
        ) : null}
        {activeTab === 'drink' ? (
          <HospitalityList
            items={GBP_DRINK}
            intro="Bars, cafés & queer nightlife drinks."
          />
        ) : null}
        {activeTab === 'dance' ? (
          <HospitalityList
            items={GBP_DANCE}
            intro="Clubs, cabaret & dance floors."
          />
        ) : null}
        {activeTab === 'experience' ? (
          <HospitalityList
            items={GBP_EXPERIENCES}
            intro="Cultural, wellness & community experiences beyond nightlife."
          />
        ) : null}
        {activeTab === 'travelinfo' ? (
          <div className="gbp-travel-panel">
            <p className="eyebrow">Paris Know Before You Go</p>
            <p className="gbp-travel-lede">Quick travel essentials for Global Black Pride week.</p>
            <div className="attribution-banner">{GBP_TRAVEL_ATTRIBUTION}</div>
            {GBP_TRAVEL_CARDS.map((card) => (
              <TravelCard key={card.title} card={card} />
            ))}
            <div className="final-checklist">
              <h4>Before You Fly</h4>
              {GBP_TRAVEL_FINAL_CHECKLIST.map((item) => (
                <div key={item} className="check-item">
                  <span className="mark" aria-hidden="true">
                    ✓
                  </span>
                  {item}
                </div>
              ))}
            </div>
            <div className="attribution-banner">{GBP_TRAVEL_ATTRIBUTION}</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
