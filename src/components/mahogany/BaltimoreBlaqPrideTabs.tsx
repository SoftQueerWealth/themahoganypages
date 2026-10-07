import type { ReactNode } from 'react';
import {
  BLAQ_TABS,
  BLAQ_TRAVEL_ATTRIBUTION,
  BLAQ_TRAVEL_CARDS,
  BLAQ_TRAVEL_FINAL_CHECKLIST,
  type BlaqTabId,
} from '../../data/baltimoreBlaqPride';
import {
  getBlaqDancePlaces,
  getBlaqDrinkPlaces,
  getBlaqEatPlaces,
  getBlaqExperiences,
  getBlaqStayPlaces,
} from '../../lib/gbpStayHotels';
import { FeaturedCityFestivalTabs } from './FeaturedCityFestivalTabs';

const BLAQ_STAY = getBlaqStayPlaces();
const BLAQ_EAT = getBlaqEatPlaces();
const BLAQ_DRINK = getBlaqDrinkPlaces();
const BLAQ_DANCE = getBlaqDancePlaces();
const BLAQ_EXPERIENCES = getBlaqExperiences();

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
    <FeaturedCityFestivalTabs
      ariaLabel="Baltimore BLAQ Pride"
      tabs={BLAQ_TABS.filter((tab) => tab.id !== 'stay')}
      activeTab={activeTab}
      onTabChange={onTabChange}
      programPanel={programPanel}
      hospitality={{
        stay: BLAQ_STAY,
        eat: BLAQ_EAT,
        drink: BLAQ_DRINK,
        dance: BLAQ_DANCE,
        experience: BLAQ_EXPERIENCES,
      }}
      hospitalityIntros={{
        stay: 'Queer-friendly stays and hotels around Baltimore.',
        eat: 'Community favorites 😋',
        drink: 'Bars, cafés & queer nightlife drinks.',
        dance: 'Clubs, cabaret & dance floors.',
        experience: 'Cultural, wellness & community experiences beyond nightlife.',
      }}
      travel={{
        eyebrow: 'Baltimore Know Before You Go',
        lede: 'Quick travel essentials for Baltimore BLAQ Pride week.',
        attribution: BLAQ_TRAVEL_ATTRIBUTION,
        cards: BLAQ_TRAVEL_CARDS,
        finalChecklist: BLAQ_TRAVEL_FINAL_CHECKLIST,
      }}
    />
  );
}
