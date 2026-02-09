import { useState, useMemo } from 'react';
import ListingList from '../ListingList';
import './AllListingsSection.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const SOURCE_LABELS = {
  meridian: 'Meridian Group',
  playalife: 'PlayaLife IV',
  koto: 'Koto Group',
  solis: 'Solis Isla Vista',
  wolfe: 'Wolfe & Associates',
};

function AllListingsSection() {
  const [allListings, setAllListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastScraped, setLastScraped] = useState(null);

  // Filters
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [bedrooms, setBedrooms] = useState('any');
  const [bathrooms, setBathrooms] = useState('any');
  const [sqftMin, setSqftMin] = useState('');
  const [sqftMax, setSqftMax] = useState('');
  const [sources, setSources] = useState([]); // empty = all

  const handleLoadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/scrape/all`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setAllListings(data.listings || []);
      setLastScraped(data.scraped_at);
    } catch (err) {
      setError(err.message || 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  const filteredListings = useMemo(() => {
    return allListings.filter((listing) => {
      const price = listing.price;
      if (price != null) {
        if (priceMin !== '' && price < Number(priceMin)) return false;
        if (priceMax !== '' && price > Number(priceMax)) return false;
      }

      const beds = listing.bedrooms;
      if (bedrooms !== 'any') {
        if (bedrooms === 'studio') {
          if (beds !== 0) return false;
        } else if (bedrooms === '4+') {
          if (beds == null || beds < 4) return false;
        } else {
          const n = Number(bedrooms);
          if (beds != n) return false;
        }
      }

      const baths = listing.bathrooms;
      if (bathrooms !== 'any') {
        const b = Number(bathrooms);
        if (baths == null) return false;
        if (b === 3 && baths < 3) return false;
        if (b !== 3 && baths !== b) return false;
      }

      const sqft = listing.square_feet;
      if (sqft != null) {
        if (sqftMin !== '' && sqft < Number(sqftMin)) return false;
        if (sqftMax !== '' && sqft > Number(sqftMax)) return false;
      } else if (sqftMin !== '' || sqftMax !== '') {
        // Listing has no sq ft; exclude when user set a sq ft filter
        return false;
      }

      const src = (listing.source || '').toLowerCase();
      if (sources.length > 0 && !sources.some((s) => src === s.toLowerCase())) return false;

      return true;
    });
  }, [allListings, priceMin, priceMax, bedrooms, bathrooms, sqftMin, sqftMax, sources]);

  const toggleSource = (id) => {
    setSources((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const clearFilters = () => {
    setPriceMin('');
    setPriceMax('');
    setBedrooms('any');
    setBathrooms('any');
    setSqftMin('');
    setSqftMax('');
    setSources([]);
  };

  const hasActiveFilters =
    priceMin !== '' ||
    priceMax !== '' ||
    bedrooms !== 'any' ||
    bathrooms !== 'any' ||
    sqftMin !== '' ||
    sqftMax !== '' ||
    sources.length > 0;

  return (
    <section className="all-listings-section" id="all-listings">
      <div className="all-listings-content">
        <h2 className="all-listings-title">Browse All Listings</h2>
        <p className="all-listings-subtitle">
          Load listings from every company, then filter by price, beds, baths, and sq ft.
        </p>

        <div className="all-listings-actions">
          <button
            className="all-listings-load-btn"
            onClick={handleLoadAll}
            disabled={loading}
          >
            {loading ? 'Loading all listings…' : 'Load all listings'}
          </button>
          {lastScraped && (
            <span className="all-listings-meta">
              Loaded: {new Date(lastScraped).toLocaleString()}
            </span>
          )}
        </div>

        {error && <div className="all-listings-error">{error}</div>}

        {allListings.length > 0 && (
          <div className="all-listings-filters">
            <div className="filters-row">
              <label className="filter-group">
                <span className="filter-label">Price min</span>
                <input
                  type="number"
                  placeholder="Min"
                  min={0}
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  className="filter-input filter-number"
                />
              </label>
              <label className="filter-group">
                <span className="filter-label">Price max</span>
                <input
                  type="number"
                  placeholder="Max"
                  min={0}
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="filter-input filter-number"
                />
              </label>
              <label className="filter-group">
                <span className="filter-label">Bedrooms</span>
                <select
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="filter-input filter-select"
                >
                  <option value="any">Any</option>
                  <option value="studio">Studio</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4+">4+</option>
                </select>
              </label>
              <label className="filter-group">
                <span className="filter-label">Bathrooms</span>
                <select
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  className="filter-input filter-select"
                >
                  <option value="any">Any</option>
                  <option value="1">1</option>
                  <option value="1.5">1.5</option>
                  <option value="2">2</option>
                  <option value="2.5">2.5</option>
                  <option value="3">3+</option>
                </select>
              </label>
              <label className="filter-group">
                <span className="filter-label">Sq ft min</span>
                <input
                  type="number"
                  placeholder="Min"
                  min={0}
                  value={sqftMin}
                  onChange={(e) => setSqftMin(e.target.value)}
                  className="filter-input filter-number"
                />
              </label>
              <label className="filter-group">
                <span className="filter-label">Sq ft max</span>
                <input
                  type="number"
                  placeholder="Max"
                  min={0}
                  value={sqftMax}
                  onChange={(e) => setSqftMax(e.target.value)}
                  className="filter-input filter-number"
                />
              </label>
            </div>
            <div className="filters-row filters-sources">
              <span className="filter-label">Source</span>
              <div className="source-chips">
                {Object.entries(SOURCE_LABELS).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    className={`source-chip ${sources.includes(id) ? 'active' : ''}`}
                    onClick={() => toggleSource(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <span className="filter-hint">Click to filter; none selected = all</span>
            </div>
            {hasActiveFilters && (
              <button type="button" className="clear-filters-btn" onClick={clearFilters}>
                Clear filters
              </button>
            )}
          </div>
        )}

        {allListings.length > 0 && (
          <p className="all-listings-count-summary">
            Showing {filteredListings.length} of {allListings.length} listings
          </p>
        )}

        <ListingList
          listings={filteredListings}
          loading={loading}
          error={null}
          emptyMessage={
            allListings.length === 0
              ? 'Click "Load all listings" to fetch from every company.'
              : 'No listings match your filters. Try adjusting or clear filters.'
          }
        />
      </div>
    </section>
  );
}

export default AllListingsSection;
