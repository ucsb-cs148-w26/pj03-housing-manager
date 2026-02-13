import { getUniqueCategories } from '../../utils/filterListings';
import './FilterPanel.css';

const BEDROOM_OPTIONS = [
  { label: 'Any', value: null },
  { label: 'Studio', value: 0 },
  { label: '1+', value: 1 },
  { label: '2+', value: 2 },
  { label: '3+', value: 3 },
  { label: '4+', value: 4 },
];

const BATHROOM_OPTIONS = [
  { label: 'Any', value: null },
  { label: '1+', value: 1 },
  { label: '1.5+', value: 1.5 },
  { label: '2+', value: 2 },
  { label: '3+', value: 3 },
];

function FilterPanel({ filters, onFilterChange, listings, filteredCount }) {
  const categories = getUniqueCategories(listings);

  const handlePriceChange = (field, value) => {
    const numValue = value === '' ? null : parseInt(value, 10);
    onFilterChange({
      ...filters,
      price: {
        ...filters.price,
        [field]: isNaN(numValue) ? null : numValue,
      },
    });
  };

  const handleBedroomChange = (value) => {
    onFilterChange({
      ...filters,
      bedrooms: {
        min: value,
        max: null,
      },
    });
  };

  const handleBathroomChange = (value) => {
    onFilterChange({
      ...filters,
      bathrooms: {
        min: value,
        max: null,
      },
    });
  };

  const handleCategoryChange = (category) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    onFilterChange({
      ...filters,
      categories: newCategories,
    });
  };

  const handleClearAll = () => {
    onFilterChange({
      price: { min: null, max: null },
      bedrooms: { min: null, max: null },
      bathrooms: { min: null, max: null },
      categories: [],
    });
  };

  const hasActiveFilters =
    filters.price.min !== null ||
    filters.price.max !== null ||
    filters.bedrooms.min !== null ||
    filters.bathrooms.min !== null ||
    filters.categories.length > 0;

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h3>Filter Listings</h3>
        {hasActiveFilters && (
          <button className="clear-button" onClick={handleClearAll}>
            Clear All
          </button>
        )}
      </div>

      <div className="filter-groups">
        <div className="filter-group">
          <label>Price Range</label>
          <div className="price-inputs">
            <input
              type="number"
              placeholder="Min"
              value={filters.price.min ?? ''}
              onChange={(e) => handlePriceChange('min', e.target.value)}
            />
            <span>to</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.price.max ?? ''}
              onChange={(e) => handlePriceChange('max', e.target.value)}
            />
          </div>
        </div>

        <div className="filter-group">
          <label>Bedrooms</label>
          <div className="button-group">
            {BEDROOM_OPTIONS.map((option) => (
              <button
                key={option.label}
                className={filters.bedrooms.min === option.value ? 'active' : ''}
                onClick={() => handleBedroomChange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <label>Bathrooms</label>
          <div className="button-group">
            {BATHROOM_OPTIONS.map((option) => (
              <button
                key={option.label}
                className={filters.bathrooms.min === option.value ? 'active' : ''}
                onClick={() => handleBathroomChange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {categories.length > 0 && (
          <div className="filter-group">
            <label>Category</label>
            <div className="checkbox-group">
              {categories.map((category) => (
                <label key={category} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category)}
                    onChange={() => handleCategoryChange(category)}
                  />
                  {category}
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="filter-summary">
        Showing {filteredCount} of {listings.length} listings
      </div>
    </div>
  );
}

export default FilterPanel;
