import { useCallback, useEffect, useMemo, useState } from 'react';
import { CityFilter } from '../CityFilter';
import { CitySection } from '../CitySection';
import { DaySection } from '../DaySection';
import { ItineraryBar } from '../ItineraryBar';
import { SharedItineraryHeader } from '../SharedItineraryHeader';
import { EventFilterSidebar } from './EventFilterSidebar';
import { FeaturedCarousel } from './FeaturedCarousel';
import { GlobalBlackPrideTabs } from './GlobalBlackPrideTabs';
import { HeroSocial } from '../HeroSocial';
import { cityFilterOptionsForKeys } from '../../constants/cities';
import {
  AUGUST_FESTIVAL_ID,
  featuredFestivalById,
  type FeaturedFestival,
} from '../../constants/festivals';
import type { GbpTabId } from '../../data/globalBlackPride';
import { PUBLIC_SITE_ORIGIN } from '../../constants/site';
import { LAST_UPDATED_LABEL } from '../../constants/lastUpdated';
import { FOOTER_BAND, FOOTER_COPY } from '../../data/home';
import { useEvents } from '../../hooks/useEvents';
import { useEventFilters } from '../../hooks/useEventFilters';
import { useItinerary } from '../../hooks/useItinerary';
import { trackItineraryShare } from '../../lib/analytics';
import { eventMatchesPrideSeries, isUntaggedPrideSeries } from '../../lib/festivalCityFilter';
import { formatItineraryShare } from '../../lib/formatItinerary';
import { groupEventsByCityThenDate, groupFestivalEvents } from '../../lib/groupFestivalEvents';
import { shareItinerary } from '../../lib/shareItinerary';
import { filterUpcomingEvents } from '../../lib/upcomingEvents';
import type { PrideEvent } from '../../types/event';

function splitFeaturedEvents(
  guideEvents: PrideEvent[],
  featured: FeaturedFestival,
): { official: PrideEvent[]; more: PrideEvent[] } {
  const cityMonthEvents = guideEvents.filter(
    (event) =>
      event.city === featured.city && Boolean(event.dayDate?.startsWith(featured.monthPrefix)),
  );
  const official = cityMonthEvents.filter((event) =>
    eventMatchesPrideSeries(event, featured.prideSeries),
  );
  const more = cityMonthEvents.filter((event) => isUntaggedPrideSeries(event));
  return { official, more };
}

export function MahoganyPages() {
  const [featuredId, setFeaturedId] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [gbpTab, setGbpTab] = useState<GbpTabId>('programme');

  const featured = featuredId ? featuredFestivalById(featuredId) : undefined;
  const isGlobalBlackPride = featuredId === 'global-black-pride';
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

  const cityOptions = useMemo(
    () => cityFilterOptionsForKeys(guideEvents.map((event) => event.city ?? '')),
    [guideEvents],
  );

  const filter = useEventFilters(cityFilteredEvents);
  const itinerary = useItinerary(allEvents);

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

  const showNoResults = itinerary.isInSharedView
    ? !isLoading && sharedEvents.length === 0
    : !isLoading && cityFilteredEvents.length > 0 && !anyEventsVisible;

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
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
    setFeaturedId(id);
    setSelectedCity(next?.city ?? '');
    if (id === 'global-black-pride') setGbpTab('programme');
    filter.clearAll();
  };

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
      className={`screen active${itinerary.myCount > 0 ? ' has-itinerary-bar' : ''}${mobileFiltersOpen ? ' filters-open' : ''}`}
      id="screen-neighborhood"
      aria-label="The Mahogany Pages"
    >
      <div className={`wrap section-pad${itinerary.myCount > 0 ? ' has-itinerary-bar' : ''}`}>
        <div className="mahogany-intro">
          <div className="mahogany-intro-copy">
            <p className="eyebrow">Find Community</p>
            <h1 className="mahogany-title">The Mahogany Pages</h1>
            <p className="mahogany-lede">
              Black and Brown Queer Events Near You — curated with locals who know the scene.
            </p>
            <p className="last-updated">Last updated · {LAST_UPDATED_LABEL}</p>
          </div>
          <div className="mahogany-intro-aside">
            <div className="sidebar-box mahogany-vibe-box">
              <h3>✨ Find your vibe, save your favorites</h3>
              <p>
                Sort the guide by day, audience, venue type, vibes, and price — then tap <b>Add</b> and share
                your itinerary with your people.
              </p>
            </div>
            <HeroSocial />
          </div>
        </div>

        {itinerary.isInSharedView ? null : (
          <div className="mahogany-controls">
            <FeaturedCarousel featuredId={featuredId} onSelect={handleSelectFeatured} />

            <CityFilter
              value={selectedCity}
              onChange={handleCityChange}
              className="mahogany-city-filter"
              options={cityOptions}
            />
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
          {itinerary.isInSharedView ? null : (
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
                isGlobalBlackPride ? (
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

      {itinerary.isInSharedView ? null : (
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
            className="mahogany-filters-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Event filters"
          >
            <EventFilterSidebar
              activeFilterCount={filter.activeFilterCount}
              isPillActive={filter.isPillActive}
              onTogglePill={filter.togglePill}
              onClearAll={filter.clearAll}
            />
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
