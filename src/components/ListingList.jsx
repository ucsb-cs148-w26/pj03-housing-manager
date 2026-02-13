import ListingCard from './ListingCard';
import './ListingList.css';

function ListingList({ listings, loading, error, hasFilters = false }) {
  if (loading) {
    return <div className="listing-status">Scraping listings... This may take a moment.</div>;
  }

  if (error) {
    return <div className="listing-error">Error: {error}</div>;
  }

  if (!listings || listings.length === 0) {
    if (hasFilters) {
      return <div className="listing-status">No listings match your filters. Try adjusting your criteria.</div>;
    }
    return <div className="listing-status">No listings found. Click "Scrape Listings" to fetch data.</div>;
  }

  return (
    <div className="listing-list">
      <div className="listing-count">{listings.length} listings found</div>
      <div className="listing-grid">
        {listings.map((listing, index) => (
          <ListingCard key={index} listing={listing} />
        ))}
      </div>
    </div>
  );
}

export default ListingList;
