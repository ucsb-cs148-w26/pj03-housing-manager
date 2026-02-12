import ListingCard from './ListingCard';
import './ListingList.css';

function ListingList({ listings, loading, error, emptyMessage }) {
  if (loading) {
    return <div className="listing-status">Scraping listings... This may take a moment.</div>;
  }

  if (error) {
    return <div className="listing-error">Error: {error}</div>;
  }

  if (!listings || listings.length === 0) {
    const message = emptyMessage ?? 'No listings found. Click "Scrape Listings" to fetch data.';
    return <div className="listing-status">{message}</div>;
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
