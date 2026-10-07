import type { BlaqTabDef } from '../data/baltimoreBlaqPride';
import {
  BLAQ_TRAVEL_ATTRIBUTION,
  BLAQ_TRAVEL_CARDS,
  BLAQ_TRAVEL_FINAL_CHECKLIST,
  featuredCityTabs,
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
  getAtlDancePlaces,
  getAtlDrinkPlaces,
  getAtlEatPlaces,
  getAtlExperiences,
  getAtlStayPlaces,
  getBlaqDancePlaces,
  getBlaqDrinkPlaces,
  getBlaqEatPlaces,
  getBlaqExperiences,
  getBlaqStayPlaces,
} from '../lib/gbpStayHotels';

const BALTIMORE_HOSPITALITY: FeaturedCityHospitalityLists = {
  stay: getBlaqStayPlaces(),
  eat: getBlaqEatPlaces(),
  drink: getBlaqDrinkPlaces(),
  dance: getBlaqDancePlaces(),
  experience: getBlaqExperiences(),
};

const ATLANTA_HOSPITALITY: FeaturedCityHospitalityLists = {
  stay: getAtlStayPlaces(),
  eat: getAtlEatPlaces(),
  drink: getAtlDrinkPlaces(),
  dance: getAtlDancePlaces(),
  experience: getAtlExperiences(),
};

const BALTIMORE_HOS_INTROS = {
  stay: 'Queer-friendly stays and hotels around Baltimore.',
  eat: 'Community favorites 😋',
  drink: 'Bars, cafés & queer nightlife drinks.',
  dance: 'Clubs, cabaret & dance floors.',
  experience: 'Cultural, wellness & community experiences beyond nightlife.',
};

const ATLANTA_HOS_INTROS = {
  stay: 'Queer-friendly stays and hotels around Atlanta.',
  eat: 'Community favorites 😋',
  drink: 'Bars, cafés & queer nightlife drinks.',
  dance: 'Clubs, cabaret & dance floors.',
  experience: 'Cultural, wellness & community experiences beyond nightlife.',
};

export interface FeaturedCityUiConfig {
  ariaLabel: string;
  programSectionLabel: string;
  tabs: BlaqTabDef[];
  hospitality: FeaturedCityHospitalityLists;
  hospitalityIntros: typeof BALTIMORE_HOS_INTROS;
  travel: FeaturedCityTravelContent;
}

const FEATURED_CITY_UI: Record<string, FeaturedCityUiConfig> = {
  'baltimore-blaq-pride': {
    ariaLabel: 'Baltimore BLAQ Pride',
    programSectionLabel: 'Official Baltimore BLAQ Pride Program',
    tabs: featuredCityTabs('🌈 BLAQ Program', { hideStay: true }),
    hospitality: BALTIMORE_HOSPITALITY,
    hospitalityIntros: BALTIMORE_HOS_INTROS,
    travel: {
      eyebrow: 'Baltimore Know Before You Go',
      lede: 'Quick travel essentials for Baltimore BLAQ Pride week.',
      attribution: BLAQ_TRAVEL_ATTRIBUTION,
      cards: BLAQ_TRAVEL_CARDS,
      finalChecklist: BLAQ_TRAVEL_FINAL_CHECKLIST,
    },
  },
  'uprise-live': {
    ariaLabel: 'UPRISE LIVE',
    programSectionLabel: 'Official UPRISE LIVE Program',
    tabs: featuredCityTabs('🌈 UPRISE Program', { hideStay: true }),
    hospitality: BALTIMORE_HOSPITALITY,
    hospitalityIntros: BALTIMORE_HOS_INTROS,
    travel: {
      eyebrow: 'Baltimore Know Before You Go',
      lede: 'Quick travel essentials for UPRISE LIVE weekend.',
      attribution: BLAQ_TRAVEL_ATTRIBUTION,
      cards: BLAQ_TRAVEL_CARDS,
      finalChecklist: BLAQ_TRAVEL_FINAL_CHECKLIST,
    },
  },
  'atlanta-pride-2026': {
    ariaLabel: 'Atlanta Pride',
    programSectionLabel: 'Official Atlanta Pride Program',
    tabs: featuredCityTabs('🌈 Pride Program', { hideStay: true }),
    hospitality: ATLANTA_HOSPITALITY,
    hospitalityIntros: ATLANTA_HOS_INTROS,
    travel: {
      eyebrow: 'Atlanta Know Before You Go',
      lede: 'Quick travel essentials for Atlanta Pride weekend.',
      attribution: ATL_TRAVEL_ATTRIBUTION,
      cards: ATL_TRAVEL_CARDS,
      finalChecklist: ATL_TRAVEL_FINAL_CHECKLIST,
    },
  },
};

export function featuredCityUiById(id: string): FeaturedCityUiConfig | undefined {
  return FEATURED_CITY_UI[id];
}

export function isFeaturedCityFestival(id: string | null): boolean {
  return Boolean(id && FEATURED_CITY_UI[id]);
}
