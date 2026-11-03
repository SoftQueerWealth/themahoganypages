import { useCallback, useEffect, useMemo, useState } from 'react';
import { CityFilter } from '../CityFilter';
import { CitySection } from '../CitySection';
import { DaySection } from '../DaySection';
import { ItineraryBar } from '../ItineraryBar';
import { SharedItineraryHeader } from '../SharedItineraryHeader';
import { EventFilterSidebar } from './EventFilterSidebar';
import { FeaturedCarousel } from './FeaturedCarousel';
import { FeaturedCityFestivalTabs } from './FeaturedCityFestivalTabs';
import { GlobalBlackPrideTabs } from './GlobalBlackPrideTabs';
import { HeroSocial } from '../HeroSocial';
import { cityDisplayLabel, cityFilterOptionsForKeys, compareCityKeysByLabel } from '../../constants/cities';
import {
  AUGUST_FESTIVAL_ID,
  FEATURED_FESTIVALS,
  featuredFestivalById,
  type FeaturedFestival,
} from '../../constants/festivals';
import type { BlaqTabId } from '../../data/baltimoreBlaqPride';
import { cityGuideByKey, cityGuideTabs, featuredCityUiById, isFeaturedCityFestival } from '../../data/featuredCityFestivals';
import type { GbpTabId } from '../../data/globalBlackPride';
import { PUBLIC_SITE_ORIGIN } from '../../constants/site';
import { LAST_UPDATED_LABEL } from '../../constants/lastUpdated';
import { FILTER_SECTIONS } from '../../constants/filters';
import { FOOTER_BAND, FOOTER_COPY } from '../../data/home';
import { useEvents } from '../../hooks/useEvents';
import { useEventFilters } from '../../hooks/useEventFilters';
import { useItinerary } from '../../hooks/useItinerary';
import { trackCityFilterClick, trackFeaturedEventCardClick, trackItineraryShare, trackPageView } from '../../lib/analytics';
import { applyCityDocumentMeta } from '../../lib/cityMeta';
import { cityFromPathname, setCityPathname } from '../../lib/cityPath';
import { eventMatchesPrideSeries, isUntaggedPrideSeries } from '../../lib/festivalCityFilter';
import { formatItineraryShare } from '../../lib/formatItinerary';
import { groupEventsByCityThenDate, groupFestivalEvents } from '../../lib/groupFestivalEvents';
import { shareItinerary } from '../../lib/shareItinerary';
import { filterUpcomingEvents } from '../../lib/upcomingEvents';
import type { PrideEvent } from '../../types/event';
import type { GbpHospitalityItem } from '../../data/globalBlackPride';

const GUIDE_EVENT_SECTIONS = FILTER_SECTIONS.filter((section) => section.label !== 'Vibes').map((section) =>
  section.label === 'Venue Type' ? { ...section, label: 'Event type' } : section,
);

const PLACE_FALLBACK_TAGS = new Set(['eat', 'drink', 'dance', 'experience', 'stay', 'wellness', 'hotel']);

function listingFilterTags(items: GbpHospitalityItem[]): string[] {
  const tags = new Set<string>();
  for (const item of items) {
    for (const tag of item.tags) {
      if (!PLACE_FALLBACK_TAGS.has(tag.trim().toLowerCase())) tags.add(tag);
    }
  }
  return [...tags].sort((a, b) => a.localeCompare(b));
}

function splitFeaturedEvents(
  guideEvents: PrideEvent[],
  featured: FeaturedFestival,
): { official: PrideEvent[]; more: PrideEvent[] } {
  const monthEvents = guideEvents.filter((event) =>
    Boolean(event.dayDate?.startsWith(featured.monthPrefix)),
  );
  const official = monthEvents.filter((event) =>
    eventMatchesPrideSeries(event, featured.prideSeries),
  );
  const more = featured.includeCityAsMoreEvents
    ? monthEvents.filter(
        (event) => event.city === featured.city && isUntaggedPrideSeries(event),
      )
    : [];
  return { official, more };
}

function syncCityToUrl(city: string, mode: 'push' | 'replace' = 'push'): void {
  const previousPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const pathname = setCityPathname(city, mode);
  applyCityDocumentMeta(city);
  if (previousPath !== pathname) {
    trackPageView(pathname);
  }
}

type MahoganyPagesProps = {
  onOpenWellness?: () => void;
};

export function MahoganyPages({ onOpenWellness }: MahoganyPagesProps) {
  const [featuredId, setFeaturedId] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState(() =>
    typeof window !== 'undefined' ? cityFromPathname(window.location.pathname) : '',
  );
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [blaqTab, setBlaqTab] = useState<BlaqTabId>('program');
  const [wellnessBannerOpen, setWellnessBannerOpen] = useState(true);
  const [activePlaceTags, setActivePlaceTags] = useState<Set<string>>(() => new Set());
  const [gbpTab, setGbpTab] = useState<GbpTabId>('programme');

  const featured = featuredId ? featuredFestivalById(featuredId) : undefined;
  const featuredCityUi = featuredId ? featuredCityUiById(featuredId) : undefined;
  const isCityFeatured = isFeaturedCityFestival(featuredId);
  const isGlobalBlackPride = featuredId === 'global-black-pride';
  const selectedCityGuide = !featured && selectedCity ? cityGuideByKey(selectedCity) : undefined;
  const isCityGuide = Boolean((!featured && selectedCityGuide) || (isCityFeatured && featuredCityUi));
  const grouping = 'calendar';

  const { allEvents, eventsForFestival, error, isLoading } = useEvents();

  const guideEvents = useMemo(
    () => filterUpcomingEvents(eventsForFestival(AUGUST_FESTIVAL_ID)),
    [eventsForFestival],
  );

  const { official: officialEvents, more: moreEvents } = useMemo(
    () =>
      featured
        ? splitFeaturedEvents(guideEvents, featured)
        : { official: [] as PrideEvent[], more: [] as PrideEvent[] },
    [featured, guideEvents],
  );

  const cityFilteredEvents = useMemo(() => {
    if (featured) return [...officialEvents, ...moreEvents];
    if (!selectedCity) return guideEvents;
    return guideEvents.filter((event) => event.city === selectedCity);
  }, [featured, guideEvents, moreEvents, officialEvents, selectedCity]);

  const grouped = useMemo(() => {
    if (featured || !selectedCity) return [];
    return groupFestivalEvents(cityFilteredEvents, grouping);
  }, [cityFilteredEvents, featured, selectedCity]);

  const officialGrouped = useMemo(() => {
    if (!featured || officialEvents.length === 0) return [];
    return groupFestivalEvents(officialEvents, grouping);
  }, [featured, officialEvents]);

  const moreGrouped = useMemo(() => {
    if (!featured || moreEvents.length === 0) return [];
    return groupFestivalEvents(moreEvents, grouping);
  }, [featured, moreEvents]);

  const cityGroups = useMemo(() => {
    if (featured || selectedCity) return [];
    return groupEventsByCityThenDate(guideEvents);
  }, [featured, guideEvents, selectedCity]);

  const cityOptions = useMemo(() => {
    const keys = guideEvents.map((event) => event.city ?? '');
    if (selectedCity) keys.push(selectedCity);
    return cityFilterOptionsForKeys(keys).sort((a, b) => compareCityKeysByLabel(a.value, b.value));
  }, [guideEvents, selectedCity]);

  const filter = useEventFilters(cityFilteredEvents);
  const itinerary = useItinerary(allEvents);
  const guideHospitality = (isCityFeatured ? featuredCityUi?.hospitality : selectedCityGuide?.hospitality) ?? null;
  const placeListings = useMemo(() => {
    if (!guideHospitality) return [];
    if (blaqTab === 'hangouts') {
      return [
        ...guideHospitality.eat,
        ...guideHospitality.drink,
        ...guideHospitality.dance,
        ...guideHospitality.experience,
      ];
    }
    if (blaqTab === 'wellness') return guideHospitality.wellness;
    return [];
  }, [blaqTab, guideHospitality]);
  const placeTagOptions = useMemo(() => listingFilterTags(placeListings), [placeListings]);
  const guideFilterCount = blaqTab === 'program' ? filter.activeFilterCount : activePlaceTags.size;

  const changeGuideTab = (tab: BlaqTabId) => {
    setBlaqTab(tab);
    setActivePlaceTags(new Set());
    if (tab === 'travelinfo') setMobileFiltersOpen(false);
  };

  const togglePlaceTag = (tag: string) => {
    const key = tag.toLowerCase();
    setActivePlaceTags((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const sharedEvents = useMemo(
    () => (itinerary.isInSharedView ? allEvents.filter((event) => itinerary.sharedIds.has(event.id)) : []),
    [allEvents, itinerary.isInSharedView, itinerary.sharedIds],
  );

  const sharedCityGroups = useMemo(
    () => (itinerary.isInSharedView ? groupEventsByCityThenDate(sharedEvents) : []),
    [itinerary.isInSharedView, sharedEvents],
  );

  const isEventShown = useCallback(
    (event: PrideEvent) => {
      if (itinerary.isInSharedView) return true;
      return itinerary.isEventShownInView(event.id) && filter.isEventVisible(event);
    },
    [filter, itinerary],
  );

  const anyEventsVisible = useMemo(
    () =>
      itinerary.isInSharedView
        ? sharedEvents.length > 0
        : cityFilteredEvents.some(isEventShown),
    [cityFilteredEvents, isEventShown, itinerary.isInSharedView, sharedEvents.length],
  );

  const showNoResults = (!isCityGuide || blaqTab === 'program') && (
    itinerary.isInSharedView
      ? !isLoading && sharedEvents.length === 0
      : !isLoading && cityFilteredEvents.length > 0 && !anyEventsVisible
  );

  const handleCityChange = (city: string) => {
    trackCityFilterClick(city ? cityDisplayLabel(city) : 'All Cities');
    setSelectedCity(city);
    syncCityToUrl(city);
    setBlaqTab('program');
    setWellnessBannerOpen(true);
    setActivePlaceTags(new Set());
    if (!city || (featured && city !== featured.city)) {
      setFeaturedId(null);
    }
    filter.clearAll();
  };

  const handleSelectFeatured = (id: string) => {
    if (featuredId === id) {
      setFeaturedId(null);
      filter.clearAll();
      return;
    }

    const next = featuredFestivalById(id);
    if (next?.tabLabel) trackFeaturedEventCardClick(next.tabLabel);
    setFeaturedId(id);
    const nextCity = next?.city ?? '';
    setSelectedCity(nextCity);
    if (nextCity) syncCityToUrl(nextCity);
    if (isFeaturedCityFestival(id)) setBlaqTab('program');
    if (id === 'global-black-pride') setGbpTab('programme');
    filter.clearAll();
  };

  useEffect(() => {
    applyCityDocumentMeta(selectedCity);
  }, [selectedCity]);

  useEffect(() => {
    setWellnessBannerOpen(true);
    setActivePlaceTags(new Set());
  }, [selectedCity]);

  useEffect(() => {
    const onPopState = () => {
      const city = cityFromPathname(window.location.pathname);
      setSelectedCity(city);
      applyCityDocumentMeta(city);
      trackPageView(window.location.pathname || '/');
      setBlaqTab('program');
      setWellnessBannerOpen(true);
      setActivePlaceTags(new Set());
      if (!city) setFeaturedId(null);
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    if (itinerary.isInSharedView) setMobileFiltersOpen(false);
  }, [itinerary.isInSharedView]);

  useEffect(() => {
    if (!mobileFiltersOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setMobileFiltersOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileFiltersOpen]);

  useEffect(() => {
    if (!mobileFiltersOpen) return;

    const html = document.documentElement;
    const { body } = document;
    html.classList.add('filters-lock');
    body.classList.add('filters-lock');

    const preventBackgroundScroll = (event: TouchEvent) => {
      const sheet = document.getElementById('mahogany-filters-sheet');
      const target = event.target;
      if (sheet && target instanceof Node && sheet.contains(target)) return;
      event.preventDefault();
    };

    document.addEventListener('touchmove', preventBackgroundScroll, { passive: false });

    return () => {
      html.classList.remove('filters-lock');
      body.classList.remove('filters-lock');
      document.removeEventListener('touchmove', preventBackgroundScroll);
    };
  }, [mobileFiltersOpen]);

  const handleShareItinerary = useCallback(async () => {
    const payload = formatItineraryShare(allEvents, itinerary.mySelection, PUBLIC_SITE_ORIGIN);
    if (!payload) return 'failed' as const;
    trackItineraryShare(itinerary.myCount);
    return shareItinerary({ text: payload.text });
  }, [allEvents, itinerary.myCount, itinerary.mySelection]);

  return (
    <section
      className={`screen active${itinerary.myCount > 0 ? ' has-itinerary-bar' : ''}${mobileFiltersOpen ? ' filters-open' : ''}${isCityGuide ? ' city-guide' : ''}`}
      id="screen-neighborhood"
      aria-label="The Mahogany Pages"
    >
      {isCityGuide && wellnessBannerOpen ? (
        <div className="wellness-banner">
          <button type="button" className="wellness-banner-link" onClick={onOpenWellness}>
            <span className="wellness-banner-new">NEW</span>
            <span className="wellness-banner-copy">
              Sexual wellness, made for us. Free guides and care near you.
            </span>
          </button>
          <button
            type="button"
            className="wellness-banner-dismiss"
            aria-label="Dismiss"
            onClick={() => setWellnessBannerOpen(false)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      ) : null}
      <div className={`wrap section-pad${itinerary.myCount > 0 ? ' has-itinerary-bar' : ''}`}>
        <div className="mahogany-intro">
          <div className="mahogany-intro-copy">
            <p className="eyebrow">Find Community</p>
            <h1 className="mahogany-title">The Mahogany Pages</h1>
            <p className="mahogany-lede">
              Your next pull up, picked by locals who know the scene.
            </p>
            <p className="last-updated">Last updated · {LAST_UPDATED_LABEL}</p>
          </div>
          <div className="mahogany-intro-aside">
            <div className="come-card">
              <p className="come-card-line">
                <span className="come-card-script">Come as you are. </span>
                We picked everything here with <span className="come-card-black">Black</span>{' '}
                <span className="come-card-queer">queer</span> people in mind.
              </p>
              <div className="come-note">
                <div className="come-note-script">Psssst...</div>
                <p>
                  Tap Filters to find your vibe. Tap Add on anything with your name on it, then send it to the
                  group chat and see who&apos;s pulling up.
                </p>
              </div>
            </div>
            <HeroSocial />
          </div>
        </div>

        {itinerary.isInSharedView ? null : (
          <div className="mahogany-controls">
            {FEATURED_FESTIVALS.length > 0 ? (
              <FeaturedCarousel featuredId={featuredId} onSelect={handleSelectFeatured} />
            ) : null}

            <div className={isCityGuide ? 'city-guide-bar' : undefined}>
              <CityFilter
                value={selectedCity}
                onChange={handleCityChange}
                className="mahogany-city-filter"
                options={cityOptions}
              />
              {isCityGuide && blaqTab !== 'travelinfo' ? (
                <button
                  type="button"
                  className="city-guide-filters"
                  aria-expanded={mobileFiltersOpen}
                  aria-controls="mahogany-filters-sheet"
                  onClick={() => setMobileFiltersOpen(true)}
                >
                  Filters{guideFilterCount > 0 ? ` · ${guideFilterCount}` : ''}
                </button>
              ) : null}
            </div>
          </div>
        )}

        {itinerary.hasSharedContext ? (
          <SharedItineraryHeader
            viewMode={itinerary.viewMode}
            onViewModeChange={itinerary.setViewMode}
            onClear={itinerary.clearSharedView}
          />
        ) : null}

        <div className={`mahogany-layout${itinerary.isInSharedView ? ' mahogany-layout--shared' : ''}`}>
          {itinerary.isInSharedView || isCityGuide ? null : (
            <div className="mahogany-filters-desktop">
              <EventFilterSidebar
                activeFilterCount={filter.activeFilterCount}
                isPillActive={filter.isPillActive}
                onTogglePill={filter.togglePill}
                onClearAll={filter.clearAll}
              />
            </div>
          )}

          <div className="mahogany-events">
            {isLoading ? <div className="data-status">Loading events...</div> : null}
            {error ? (
              <div className="data-status data-status-error" role="alert">
                {error}
              </div>
            ) : null}

            <div className="event-list">
              {itinerary.isInSharedView ? (
                sharedCityGroups.map((cityGroup) => (
                  <CitySection
                    key={cityGroup.cityKey}
                    cityLabel={cityGroup.cityLabel}
                    dayGroups={cityGroup.dayGroups}
                    isEventVisible={isEventShown}
                    isGoing={(event) => itinerary.isGoing(event.id)}
                    onToggleGoing={(event) => itinerary.toggleGoing(event.id)}
                  />
                ))
              ) : featured ? (
                isCityFeatured && featuredCityUi ? (
                  <FeaturedCityFestivalTabs
                    ariaLabel={featuredCityUi.ariaLabel}
                    tabs={featuredCityUi.tabs}
                    activeTab={blaqTab}
                    onTabChange={changeGuideTab}
                    hospitality={featuredCityUi.hospitality}
                    hospitalityIntros={featuredCityUi.hospitalityIntros}
                    travel={featuredCityUi.travel}
                    layout="city-feature"
                    cityName={featured ? cityDisplayLabel(featured.city) : undefined}
                    onOpenGuide={onOpenWellness}
                    placeTags={activePlaceTags}
                    programPanel={
                      officialGrouped.length > 0 ? (
                        <CitySection
                          cityLabel={featuredCityUi.programSectionLabel}
                          showTitle={false}
                          cardVariant="guide"
                          dayGroups={officialGrouped}
                          isEventVisible={isEventShown}
                          isGoing={(event) => itinerary.isGoing(event.id)}
                          onToggleGoing={(event) => itinerary.toggleGoing(event.id)}
                        />
                      ) : (
                        <p className="gbp-empty">No program events in the guide right now.</p>
                      )
                    }
                  />
                ) : isGlobalBlackPride ? (
                  <GlobalBlackPrideTabs
                    activeTab={gbpTab}
                    onTabChange={setGbpTab}
                    programmePanel={
                      officialGrouped.length > 0 ? (
                        <CitySection
                          cityLabel="Official Global Black Pride Programme"
                          dayGroups={officialGrouped}
                          isEventVisible={isEventShown}
                          isGoing={(event) => itinerary.isGoing(event.id)}
                          onToggleGoing={(event) => itinerary.toggleGoing(event.id)}
                        />
                      ) : (
                        <p className="gbp-empty">No programme events in the guide right now.</p>
                      )
                    }
                    queerParisPanel={
                      moreGrouped.length > 0 ? (
                        <CitySection
                          cityLabel="Black Queer & Sapphic Events"
                          dayGroups={moreGrouped}
                          isEventVisible={isEventShown}
                          isGoing={(event) => itinerary.isGoing(event.id)}
                          onToggleGoing={(event) => itinerary.toggleGoing(event.id)}
                        />
                      ) : (
                        <p className="gbp-empty">
                          More happening around the city during Global Black Pride week — check back
                          soon.
                        </p>
                      )
                    }
                  />
                ) : (
                  <>
                    {officialGrouped.length > 0 ? (
                      <CitySection
                        cityLabel="Pride events"
                        dayGroups={officialGrouped}
                        isEventVisible={isEventShown}
                        isGoing={(event) => itinerary.isGoing(event.id)}
                        onToggleGoing={(event) => itinerary.toggleGoing(event.id)}
                        className={moreGrouped.length > 0 ? 'city-section--before-more' : undefined}
                      />
                    ) : null}
                    {moreGrouped.length > 0 ? (
                      <CitySection
                        cityLabel="Other events"
                        dayGroups={moreGrouped}
                        isEventVisible={isEventShown}
                        isGoing={(event) => itinerary.isGoing(event.id)}
                        onToggleGoing={(event) => itinerary.toggleGoing(event.id)}
                      />
                    ) : null}
                  </>
                )
              ) : selectedCityGuide ? (
                <FeaturedCityFestivalTabs
                  ariaLabel={`${cityDisplayLabel(selectedCity)} guide`}
                  tabs={cityGuideTabs(selectedCityGuide.eventsTabLabel, selectedCityGuide)}
                  activeTab={blaqTab}
                  onTabChange={changeGuideTab}
                  hospitality={selectedCityGuide.hospitality}
                  hospitalityIntros={selectedCityGuide.hospitalityIntros}
                  travel={selectedCityGuide.travel}
                  layout="city-feature"
                  cityName={cityDisplayLabel(selectedCity)}
                  onOpenGuide={onOpenWellness}
                  placeTags={activePlaceTags}
                  programPanel={
                    grouped.length > 0 ? (
                      grouped.map((dayGroup) => (
                        <DaySection
                          key={dayGroup.key}
                          day={dayGroup.day}
                          dayLabel={dayGroup.dayLabel}
                          dayDate={dayGroup.dayDate}
                          events={dayGroup.events}
                          isEventVisible={isEventShown}
                          isGoing={(event) => itinerary.isGoing(event.id)}
                          onToggleGoing={(event) => itinerary.toggleGoing(event.id)}
                          cardVariant="guide"
                        />
                      ))
                    ) : (
                      <p className="gbp-empty">No events in the guide right now.</p>
                    )
                  }
                />
              ) : selectedCity ? (
                grouped.map((dayGroup) => (
                  <DaySection
                    key={dayGroup.key}
                    day={dayGroup.day}
                    dayLabel={dayGroup.dayLabel}
                    dayDate={dayGroup.dayDate}
                    events={dayGroup.events}
                    isEventVisible={isEventShown}
                    isGoing={(event) => itinerary.isGoing(event.id)}
                    onToggleGoing={(event) => itinerary.toggleGoing(event.id)}
                  />
                ))
              ) : (
                cityGroups.map((cityGroup) => (
                  <CitySection
                    key={cityGroup.cityKey}
                    cityLabel={cityGroup.cityLabel}
                    dayGroups={cityGroup.dayGroups}
                    isEventVisible={isEventShown}
                    isGoing={(event) => itinerary.isGoing(event.id)}
                    onToggleGoing={(event) => itinerary.toggleGoing(event.id)}
                  />
                ))
              )}
            </div>

            <div className={`no-results${showNoResults ? ' visible' : ''}`}>
              {itinerary.isInSharedView
                ? 'Those shared events are no longer in the guide.'
                : 'No events match your filters. Try clearing some!'}
            </div>
          </div>
        </div>
      </div>

      {itinerary.isInSharedView || isCityGuide ? null : (
        <button
          type="button"
          className="mahogany-filters-fab"
          aria-expanded={mobileFiltersOpen}
          aria-controls="mahogany-filters-sheet"
          onClick={(event) => {
            event.currentTarget.focus({ preventScroll: true });
            setMobileFiltersOpen((open) => !open);
          }}
        >
          {mobileFiltersOpen ? 'Close' : 'Filters'}
          {!mobileFiltersOpen && filter.activeFilterCount > 0 ? (
            <span className="filter-sidebar-count">{filter.activeFilterCount}</span>
          ) : null}
        </button>
      )}

      {mobileFiltersOpen && !itinerary.isInSharedView ? (
        <>
          <button
            type="button"
            className="mahogany-filters-backdrop"
            aria-label="Close filters"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div
            id="mahogany-filters-sheet"
            className={`mahogany-filters-sheet${isCityGuide ? ' guide-filter-sheet' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
          >
            {isCityGuide ? (
              <>
                <div className="guide-sheet-top">
                  <h3>Filters</h3>
                  <button
                    type="button"
                    className="guide-sheet-x"
                    aria-label="Close filters"
                    onClick={() => setMobileFiltersOpen(false)}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2A1F18" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                </div>
                {blaqTab === 'program' ? (
                  <button type="button" className="guide-sheet-clear" onClick={filter.clearAll}>
                    Clear all
                  </button>
                ) : activePlaceTags.size > 0 ? (
                  <button type="button" className="guide-sheet-clear" onClick={() => setActivePlaceTags(new Set())}>
                    Clear all
                  </button>
                ) : null}
                {blaqTab === 'program' ? (
                  <EventFilterSidebar
                    activeFilterCount={filter.activeFilterCount}
                    isPillActive={filter.isPillActive}
                    onTogglePill={filter.togglePill}
                    onClearAll={filter.clearAll}
                    sections={GUIDE_EVENT_SECTIONS}
                    showHeader={false}
                  />
                ) : placeTagOptions.length > 0 ? (
                  <div className="filter-section">
                    <div className="filter-section-label">
                      {blaqTab === 'wellness' ? 'Type of care' : 'Who it is for'}
                    </div>
                    <div className="filter-pills">
                      {placeTagOptions.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          className={`filter-pill${activePlaceTags.has(tag.toLowerCase()) ? ' active' : ''}`}
                          onClick={() => togglePlaceTag(tag)}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="guide-sheet-empty">No filters for these listings yet.</p>
                )}
                <button type="button" className="guide-sheet-done" onClick={() => setMobileFiltersOpen(false)}>
                  Close
                </button>
              </>
            ) : (
              <EventFilterSidebar
                activeFilterCount={filter.activeFilterCount}
                isPillActive={filter.isPillActive}
                onTogglePill={filter.togglePill}
                onClearAll={filter.clearAll}
              />
            )}
          </div>
        </>
      ) : null}

      <ItineraryBar
        count={itinerary.myCount}
        onShare={handleShareItinerary}
        onClear={itinerary.clearMySelection}
      />

      <div className="footer-band">{FOOTER_BAND}</div>
      <div className="site-footer">{FOOTER_COPY}</div>
    </section>
  );
}
