import { cityFilterOptions, type CityFilterOption } from '../constants/cities';

interface CityFilterProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  options?: CityFilterOption[];
  label?: string;
  showGuideMark?: boolean;
}

export function CityFilter({
  value,
  onChange,
  className,
  options = cityFilterOptions,
  label = 'City',
  showGuideMark = false,
}: CityFilterProps) {
  return (
    <div className={`city-filter${className ? ` ${className}` : ''}`}>
      <label
        htmlFor="city-filter-select"
        className={`city-filter-label${showGuideMark ? ' city-filter-label--guide' : ''}`}
      >
        {label}
        {showGuideMark ? (
          <svg
            className="city-filter-chevron"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#A82258"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M6 5l6 6 6-6M6 13l6 6 6-6" />
          </svg>
        ) : null}
      </label>
      <select
        id="city-filter-select"
        className="city-filter-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
