import { useCallback, useMemo, useState } from 'react';
import { FILTER_SECTIONS, FilterKind } from '../constants/filters';
import {
  trackAudienceFilterClick,
  trackDayFilterClick,
  trackPriceFilterClick,
  trackVenueFilterClick,
  trackVibesFilterClick,
} from '../lib/analytics';
import { hasVisibleDiscountCode } from '../lib/parseDiscountDisplay';
import type { PrideEvent } from '../types/event';

export interface EventFilterState {
  activeTypes: Set<string>;
  activeAudiences: Set<string>;
  activeVibes: Set<string>;
  activeDays: Set<string>;
  freeOnly: boolean;
  discountOnly: boolean;
}

function toggleSetMember(set: Set<string>, value: string): Set<string> {
  const next = new Set(set);
  const v = value.toLowerCase();
  if (next.has(v)) next.delete(v);
  else next.add(v);
  return next;
}

function filterPillLabel(kind: FilterKind, value: string): string {
  for (const section of FILTER_SECTIONS) {
    const pill = section.pills.find(
      (p) => p.kind === kind && String(p.value).toLowerCase() === value.toLowerCase(),
    );
    if (pill) return pill.label;
  }
  return value;
}

export function useEventFilters(allEvents: PrideEvent[]) {
  const [activeTypes, setActiveTypes] = useState<Set<string>>(() => new Set());
  const [activeAudiences, setActiveAudiences] = useState<Set<string>>(() => new Set());
  const [activeVibes, setActiveVibes] = useState<Set<string>>(() => new Set());
  const [activeDays, setActiveDays] = useState<Set<string>>(() => new Set());
  const [freeOnly, setFreeOnly] = useState(false);
  const [discountOnly, setDiscountOnly] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

  const activeFilterCount =
    activeTypes.size +
    activeAudiences.size +
    activeVibes.size +
    activeDays.size +
    (freeOnly ? 1 : 0) +
    (discountOnly ? 1 : 0);

  const isPillActive = useCallback(
    (kind: FilterKind, value: string) => {
      const v = value.toLowerCase();
      if (kind === FilterKind.Free) return freeOnly;
      if (kind === FilterKind.Discount) return discountOnly;
      if (kind === FilterKind.Type) return activeTypes.has(v);
      if (kind === FilterKind.Audience) return activeAudiences.has(v);
      if (kind === FilterKind.Vibe) return activeVibes.has(v);
      if (kind === FilterKind.Day) return activeDays.has(v);
      return false;
    },
    [activeTypes, activeAudiences, activeVibes, activeDays, freeOnly, discountOnly],
  );

  const togglePill = useCallback((kind: FilterKind, value: string) => {
    const v = value.toLowerCase();
    const label = filterPillLabel(kind, value);

    if (kind === FilterKind.Free) {
      trackPriceFilterClick(label);
      setFreeOnly((f) => !f);
    } else if (kind === FilterKind.Discount) {
      trackPriceFilterClick(label);
      setDiscountOnly((d) => !d);
    } else if (kind === FilterKind.Type) {
      trackVenueFilterClick(label);
      setActiveTypes((s) => toggleSetMember(s, v));
    } else if (kind === FilterKind.Audience) {
      trackAudienceFilterClick(label);
      setActiveAudiences((s) => toggleSetMember(s, v));
    } else if (kind === FilterKind.Vibe) {
      trackVibesFilterClick(label);
      setActiveVibes((s) => toggleSetMember(s, v));
    } else if (kind === FilterKind.Day) {
      trackDayFilterClick(label);
      setActiveDays((s) => toggleSetMember(s, v));
    }
  }, []);

  const clearAll = useCallback(() => {
    setActiveTypes(new Set());
    setActiveAudiences(new Set());
    setActiveVibes(new Set());
    setActiveDays(new Set());
    setFreeOnly(false);
    setDiscountOnly(false);
  }, []);

  const isEventVisible = useCallback(
    (event: PrideEvent): boolean => {
      const cardTypes = event.types.map((t) => t.toLowerCase());
      const cardAudience = (event.audienceTags ?? []).map((t) => t.toLowerCase());
      const cardVibesNorm = ` ${event.vibesRaw.replace(/\s+/g, ' ').trim()} `;
      const cardDay = event.day.toLowerCase();

      if (activeDays.size > 0 && !activeDays.has(cardDay)) return false;
      if (activeTypes.size > 0 && ![...activeTypes].some((t) => cardTypes.includes(t))) return false;
      if (activeAudiences.size > 0 && ![...activeAudiences].some((t) => cardAudience.includes(t))) return false;
      if (activeVibes.size > 0 && ![...activeVibes].some((v) => cardVibesNorm.includes(` ${v} `))) return false;
      if (freeOnly && !event.free) return false;
      if (discountOnly && !hasVisibleDiscountCode(event.discountCode)) return false;
      return true;
    },
    [activeTypes, activeAudiences, activeVibes, activeDays, freeOnly, discountOnly],
  );

  const anyVisible = useMemo(
    () => allEvents.some((e) => isEventVisible(e)),
    [allEvents, isEventVisible],
  );

  return {
    panelOpen,
    setPanelOpen,
    togglePanel: () => setPanelOpen((o) => !o),
    activeFilterCount,
    isPillActive,
    togglePill,
    clearAll,
    isEventVisible,
    anyVisible,
  };
}
