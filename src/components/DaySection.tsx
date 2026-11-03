import type { DayId, PrideEvent } from '../types/event';
import { formatDayDateParts } from '../lib/formatDayDate';
import { EventCard } from './EventCard';

interface DaySectionProps {
  day: DayId;
  dayLabel: string;
  dayDate?: string;
  events: PrideEvent[];
  isEventVisible: (e: PrideEvent) => boolean;
  isGoing?: (e: PrideEvent) => boolean;
  onToggleGoing?: (e: PrideEvent) => void;
  cardVariant?: 'classic' | 'guide';
}

export function DaySection({
  day,
  dayLabel,
  dayDate,
  events,
  isEventVisible,
  isGoing,
  onToggleGoing,
  cardVariant = 'classic',
}: DaySectionProps) {
  const visibleCount = events.filter(isEventVisible).length;
  const hidden = visibleCount === 0;
  const dayDateParts = dayDate ? formatDayDateParts(dayDate) : null;

  return (
    <section className={`day-section${hidden ? ' hidden' : ''}`} data-day={day}>
      <div className="day-header">
        <div className="day-title">
          <span className="day-title-name">{dayLabel}</span>
          {dayDateParts ? (
            <>
              <span className="day-title-sep"> · </span>
              <span className="day-title-date">
                <span className="day-title-month">{dayDateParts.month}</span>
                <span className="day-title-day">{dayDateParts.day}</span>
              </span>
            </>
          ) : null}
        </div>
        <div className="day-count">
          {visibleCount} event{visibleCount === 1 ? '' : 's'}
        </div>
      </div>
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          visible={isEventVisible(event)}
          going={isGoing?.(event)}
          onToggleGoing={onToggleGoing ? () => onToggleGoing(event) : undefined}
          variant={cardVariant}
        />
      ))}
    </section>
  );
}
