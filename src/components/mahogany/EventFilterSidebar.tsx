import { FILTER_SECTIONS, type FilterKind, type FilterSectionDef } from '../../constants/filters';

type EventFilterSidebarProps = {
  activeFilterCount: number;
  isPillActive: (kind: FilterKind, value: string) => boolean;
  onTogglePill: (kind: FilterKind, value: string) => void;
  onClearAll: () => void;
  sections?: FilterSectionDef<FilterKind>[];
  showHeader?: boolean;
};

export function EventFilterSidebar({
  activeFilterCount,
  isPillActive,
  onTogglePill,
  onClearAll,
  sections = FILTER_SECTIONS,
  showHeader = true,
}: EventFilterSidebarProps) {
  return (
    <aside className="filter-sidebar" aria-label="Event filters">
      {showHeader ? (
        <div className="filter-sidebar-header">
          <h3 className="filter-sidebar-title">
            Filters
            {activeFilterCount > 0 ? (
              <span className="filter-sidebar-count">{activeFilterCount}</span>
            ) : null}
          </h3>
          {activeFilterCount > 0 ? (
            <button type="button" className="filter-sidebar-clear" onClick={onClearAll}>
              Clear all
            </button>
          ) : null}
        </div>
      ) : null}
      {sections.map(({ label, pills }) => (
        <div key={label} className="filter-section">
          <div className="filter-section-label">{label}</div>
          <div className="filter-pills">
            {pills.map((pill) => (
              <button
                key={`${pill.kind}-${pill.value}`}
                type="button"
                className={`filter-pill${pill.freePill ? ' free-pill' : ''}${
                  isPillActive(pill.kind, String(pill.value)) ? ' active' : ''
                }`}
                onClick={() => onTogglePill(pill.kind, String(pill.value))}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </aside>
  );
}
