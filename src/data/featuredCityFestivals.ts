import { featuredFestivalById } from '../constants/festivals';
import type { BlaqTabDef } from '../data/baltimoreBlaqPride';
import {
  BLAQ_TRAVEL_ATTRIBUTION,
  BLAQ_TRAVEL_CARDS,
  BLAQ_TRAVEL_FINAL_CHECKLIST,
} from '../data/baltimoreBlaqPride';
import {
  ATL_TRAVEL_ATTRIBUTION,
  ATL_TRAVEL_CARDS,
  ATL_TRAVEL_FINAL_CHECKLIST,
} from '../data/atlantaPride';
import type {
  FeaturedCityHospitalityLists,
  FeaturedCityTravelContent,
} from '../components/mahogany/FeaturedCityFestivalTabs';
import {
  getCityHospitality,
  type HospitalityCity,
} from '../lib/gbpStayHotels';

export interface CityGuide {
  city: HospitalityCity;
  eventsTabLabel: string;
  hospitality: FeaturedCityHospitalityLists;
  hospitalityIntros: {
    stay: string;
    eat: string;
    drink: string;
    dance: string;
    experience: string;
  };
  travel?: FeaturedCityTravelContent;
}

function hospitalityIntros(cityName: string): CityGuide['hospitalityIntros'] {
  return {
    stay: `Queer-friendly stays and hotels around ${cityName}.`,
    eat: 'Community favorites 😋',
    drink: 'Bars, cafés & queer nightlife drinks.',
    dance: 'Clubs, cabaret & dance floors.',
    experience: 'Cultural, wellness & community experiences beyond nightlife.',
  };
}

const CITY_GUIDES: Record<HospitalityCity, CityGuide> = {
  baltimore: {
    city: 'baltimore',
    eventsTabLabel: '📅 Events',
    hospitality: getCityHospitality('baltimore'),
    hospitalityIntros: hospitalityIntros('Baltimore'),
    travel: {
      eyebrow: 'Baltimore Know Before You Go',
      lede: 'Quick travel essentials for Baltimore.',
      attribution: BLAQ_TRAVEL_ATTRIBUTION,
      cards: BLAQ_TRAVEL_CARDS,
      finalChecklist: BLAQ_TRAVEL_FINAL_CHECKLIST,
    },
  },
  atlanta: {
    city: 'atlanta',
    eventsTabLabel: '📅 Events',
    hospitality: getCityHospitality('atlanta'),
    hospitalityIntros: hospitalityIntros('Atlanta'),
    travel: {
      eyebrow: 'Atlanta Know Before You Go',
      lede: 'Quick travel essentials for Atlanta.',
      attribution: ATL_TRAVEL_ATTRIBUTION,
      cards: ATL_TRAVEL_CARDS,
      finalChecklist: ATL_TRAVEL_FINAL_CHECKLIST,
    },
  },
  dc: {
    city: 'dc',
    eventsTabLabel: '📅 Events',
    hospitality: getCityHospitality('dc'),
    hospitalityIntros: hospitalityIntros('DC'),
  },
};

const FEATURE_COPY: Record<string, { ariaLabel: string; programSectionLabel: string; programTabLabel: string }> = {
  'baltimore-blaq-pride': {
    ariaLabel: 'Baltimore BLAQ Pride',
    programSectionLabel: 'Official Baltimore BLAQ Pride Program',
    programTabLabel: '🌈 BLAQ Program',
  },
  'uprise-live': {
    ariaLabel: 'UPRISE LIVE',
    programSectionLabel: 'Official UPRISE LIVE Program',
    programTabLabel: '🌈 UPRISE Program',
  },
};

export interface FeaturedCityUiConfig {
  ariaLabel: string;
  programSectionLabel: string;
  tabs: BlaqTabDef[];
  hospitality: FeaturedCityHospitalityLists;
  hospitalityIntros: CityGuide['hospitalityIntros'];
  travel?: FeaturedCityTravelContent;
}

export function cityGuideByKey(city: string): CityGuide | undefined {
  if (city === 'baltimore' || city === 'atlanta' || city === 'dc') return CITY_GUIDES[city];
  return undefined;
}

/** Events tab plus hospitality tabs that have listings, and travel when the city has it. */
export function cityGuideTabs(programLabel: string, guide: CityGuide): BlaqTabDef[] {
  const tabs: BlaqTabDef[] = [{ id: 'program', label: programLabel }];
  if (guide.hospitality.stay.length) tabs.push({ id: 'stay', label: '🛏️ Stay' });
  if (guide.hospitality.eat.length) tabs.push({ id: 'eat', label: '🍽️ Eat' });
  if (guide.hospitality.drink.length) tabs.push({ id: 'drink', label: '🍸 Drink' });
  if (guide.hospitality.dance.length) tabs.push({ id: 'dance', label: '💃 Dance' });
  if (guide.hospitality.experience.length) tabs.push({ id: 'experience', label: '🎟️ Experiences' });
  if (guide.travel) tabs.push({ id: 'travelinfo', label: '✈️ Travel Info' });
  return tabs;
}

export function featuredCityUiById(id: string): FeaturedCityUiConfig | undefined {
  const copy = FEATURE_COPY[id];
  const festival = featuredFestivalById(id);
  const guide = festival ? cityGuideByKey(festival.city) : undefined;
  if (!copy || !guide) return undefined;
  return {
    ariaLabel: copy.ariaLabel,
    programSectionLabel: copy.programSectionLabel,
    tabs: cityGuideTabs(copy.programTabLabel, guide),
    hospitality: guide.hospitality,
    hospitalityIntros: guide.hospitalityIntros,
    travel: guide.travel,
  };
}

export function isFeaturedCityFestival(id: string | null): boolean {
  return Boolean(id && featuredCityUiById(id));
}
