import { useState, useMemo } from 'react';
import ListingList from '../ListingList';
import FilterPanel from '../FilterPanel/FilterPanel';
import { filterListings } from '../../utils/filterListings';
import './ScraperSection.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const SCRAPERS = [
  { id: 'meridian', name: 'Meridian Group Real Estate', url: 'meridiangrouprem.com' },
  { id: 'playalife', name: 'PlayaLife IV', url: 'playalifeiv.com' },
  { id: 'koto', name: 'Koto Group', url: 'kotogroup.com' },
  { id: 'solis', name: 'Solis Isla Vista', url: 'solisislavista.com' },
  { id: 'wolfe', name: 'Wolfe & Associates (Isla Vista)', url: 'rlwa.com' },
  // Add more scrapers here as they're implemented
];

function ScraperSection() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastScraped, setLastScraped] = useState(null);
  const [selectedScraper, setSelectedScraper] = useState(SCRAPERS[0].id);
  const [filters, setFilters] = useState({
    price: { min: null, max: null },
    bedrooms: { min: null, max: null },
    bathrooms: { min: null, max: null },
    categories: [],
  });

  const filteredListings = useMemo(() => {
    return filterListings(listings, filters);
  }, [listings, filters]);

  const hasActiveFilters =
    filters.price.min !== null ||
    filters.price.max !== null ||
    filters.bedrooms.min !== null ||
    filters.bathrooms.min !== null ||
    filters.categories.length > 0;

  const handleScrape = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/scrape/${selectedScraper}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setListings(data.listings);
      setLastScraped(data.scraped_at);
    } catch (err) {
      setError(err.message || 'Failed to scrape listings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="scraper-section">
      <div className="scraper-content">
        <h2 className="scraper-title">Live Scraper</h2>
        <p className="scraper-subtitle">Fetch the latest listings from property management companies</p>

        <div className="scraper-controls">
          <select
            className="scraper-select"
            value={selectedScraper}
            onChange={(e) => setSelectedScraper(e.target.value)}
            disabled={loading}
          >
            {SCRAPERS.map((scraper) => (
              <option key={scraper.id} value={scraper.id}>
                {scraper.name}
              </option>
            ))}
          </select>
          <button
            className="scrape-button"
            onClick={handleScrape}
            disabled={loading}
          >
            {loading ? 'Scraping...' : 'Scrape Listings'}
          </button>
          {lastScraped && (
            <span className="last-scraped">
              Last updated: {new Date(lastScraped).toLocaleString()}
            </span>
          )}
        </div>

        {listings.length > 0 && (
          <FilterPanel
            filters={filters}
            onFilterChange={setFilters}
            listings={listings}
            filteredCount={filteredListings.length}
          />
        )}

        <ListingList listings={filteredListings} loading={loading} error={error} hasFilters={hasActiveFilters} />
      </div>
    </section>
  );
}

export default ScraperSection;