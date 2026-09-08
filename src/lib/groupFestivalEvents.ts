import { compareCityKeysByLabel, cityDisplayLabel } from '../constants/cities';
import { DAY_ORDER } from '../constants/days';
import type { FestivalGrouping } from '../constants/festivals';
import type { DayId, PrideEvent } from '../types/event';
import { compareByEventTime } from './eventTimeSort';

export type FestivalDayGroup = {
  key: string;
  day: DayId;
  dayLabel: string;
  dayDate?: string;
  events: PrideEvent[];
};

function groupByWeekday(events: PrideEvent[]): FestivalDayGroup[] {
  const map = new Map<DayId, PrideEvent[]>();
  for (const day of DAY_ORDER) {
    map.set(day, []);
  }
  for (const event of events) {
    map.get(event.day)?.push(event);
  }

  return DAY_ORDER.map((day) => {
    const dayEvents = [...(map.get(day) ?? [])].sort(compareByEventTime);
    return {
      key: day,
      day,
      dayLabel: dayEvents[0]?.dayLabel ?? day,
      dayDate: dayEvents[0]?.dayDate,
      events: dayEvents,
    };
  });
}

function groupByCalendarDate(events: PrideEvent[]): FestivalDayGroup[] {
  const map = new Map<string, PrideEvent[]>();

  for (const event of events) {
    const key = event.dayDate ?? event.day;
    const bucket = map.get(key) ?? [];
    bucket.push(event);
    map.set(key, bucket);
  }

  return [...map.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, dayEvents]) => {
      const sortedEvents = [...dayEvents].sort(compareByEventTime);
      const first = sortedEvents[0];
      return {
        key,
        day: first.day,
        dayLabel: first.dayLabel,
        dayDate: first.dayDate,
        events: sortedEvents,
      };
    });
}

export function groupFestivalEvents(
  events: PrideEvent[],
  grouping: FestivalGrouping,
): FestivalDayGroup[] {
  if (grouping === 'calendar') {
    return groupByCalendarDate(events);
  }
  return groupByWeekday(events);
}

export type CityDayGroup = {
  cityKey: string;
  cityLabel: string;
  dayGroups: FestivalDayGroup[];
};

export function groupEventsByCityThenDate(events: PrideEvent[]): CityDayGroup[] {
  const byCity = new Map<string, PrideEvent[]>();
  for (const event of events) {
    const key = event.city ?? '';
    const bucket = byCity.get(key) ?? [];
    bucket.push(event);
    byCity.set(key, bucket);
  }

  const orderedKeys = [...byCity.keys()].sort(compareCityKeysByLabel);

  return orderedKeys.map((cityKey) => ({
    cityKey,
    cityLabel: cityKey ? cityDisplayLabel(cityKey) : 'Other',
    dayGroups: groupByCalendarDate(byCity.get(cityKey) ?? []),
  }));
}
