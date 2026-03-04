import { useState, useEffect, useMemo } from 'react';
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
  const [selectMode, setSelectMode] = useState(false);
  const [selectedListingIds, setSelectedListingIds] = useState([]);
  const [selectedListingsMap, setSelectedListingsMap] = useState({});
  const [shareMessage, setShareMessage] = useState('');

  // Filters
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [bedrooms, setBedrooms] = useState('any');
  const [bathrooms, setBathrooms] = useState('any');
  const [sqftMin, setSqftMin] = useState('');
  const [sqftMax, setSqftMax] = useState('');
  const [sources, setSources] = useState([]); // empty = all

  const loadListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/listings`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setAllListings(data.listings || []);
      setLastScraped(data.last_updated);
    } catch (err) {
      setError(err.message || 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/listings/refresh`, { method: 'POST' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      await loadListings();
    } catch (err) {
      setError(err.message || 'Failed to refresh listings');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, []);

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

  const getListingId = (listing) =>
    `${(listing.source || '').toLowerCase()}::${listing.address || ''}`;

  const handleToggleSelectMode = () => {
    setSelectMode((prev) => {
      const next = !prev;
      if (!next) {
        setSelectedListingIds([]);
        setSelectedListingsMap({});
      }
      return next;
    });
    setShareMessage('');
  };

  const handleToggleListingSelect = (listingId, listing) => {
    setSelectedListingIds((prev) =>
      prev.includes(listingId) ? prev.filter((id) => id !== listingId) : [...prev, listingId]
    );
    setSelectedListingsMap((prev) => {
      if (prev[listingId]) {
        const next = { ...prev };
        delete next[listingId];
        return next;
      }
      return { ...prev, [listingId]: listing };
    });
    setShareMessage('');
  };

  const handleCopySelectedLinks = async () => {
    const selectedListings = selectedListingIds
      .map((id) => selectedListingsMap[id])
      .filter(Boolean);

    const lines = selectedListings
      .map((listing) => {
        const link = listing?.listing_link || listing?.url;
        if (!link) return null;
        return `${listing.address}: ${link}`;
      })
      .filter(Boolean);

    if (lines.length === 0) {
      setShareMessage('No linked listings selected to copy.');
      return;
    }

    const text = `Shared listings:\n${lines.join('\n')}`;
    try {
      await navigator.clipboard.writeText(text);
      setShareMessage('Selected listings links copied to clipboard!');
    } catch (err) {
      setShareMessage('Failed to copy links. Please try again.');
    }
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
            onClick={loadListings}
            disabled={loading}
          >
            {loading ? 'Loading…' : 'Reload listings'}
          </button>
          <button
            className="all-listings-scrape-btn"
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? 'Scraping…' : 'Re-scrape all sources'}
          </button>
          {lastScraped && (
            <span className="all-listings-meta">
              Last updated: {new Date(lastScraped).toLocaleString()}
            </span>
          )}
        </div>

        {allListings.length > 0 && (
          <div className="all-listings-share-actions">
            <button
              type="button"
              className="all-listings-share-btn"
              onClick={handleToggleSelectMode}
              disabled={loading}
            >
              {selectMode ? 'Exit selection mode' : 'Select listings'}
            </button>

            {selectMode && (
              <>
                <span className="all-listings-selected-count">
                  {selectedListingIds.length} selected
                </span>
                <button
                  type="button"
                  className="all-listings-copy-btn"
                  onClick={handleCopySelectedLinks}
                  disabled={selectedListingIds.length === 0}
                >
                  Copy selected links
                </button>
              </>
            )}
          </div>
        )}

        {shareMessage && (
          <div className="all-listings-share-message">{shareMessage}</div>
        )}

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
          hasFilters={hasActiveFilters}
          selectable={selectMode}
          selectedListingIds={selectedListingIds}
          getListingId={getListingId}
          onToggleSelect={handleToggleListingSelect}
          emptyMessage={
            allListings.length === 0
              ? 'No listings yet. Click "Refresh listings" to scrape from every company.'
              : 'No listings match your filters. Try adjusting or clear filters.'
          }
        />
      </div>
    </section>
  );
}

export default AllListingsSection;
