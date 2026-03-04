import './ListingCard.css';

function ListingCard({ listing }) {
  const listingUrl = listing.listing_link || listing.url || null;

  const formatPrice = (price) => {
    if (price === null || price === undefined) return 'Price N/A';
    return `$${price.toLocaleString()}/mo`;
  };

  const formatBedrooms = (beds) => {
    if (beds === null || beds === undefined) return 'N/A';
    if (beds === 0) return 'Studio';
    return `${beds} bed`;
  };

  const formatBathrooms = (baths) => {
    if (baths === null || baths === undefined) return 'N/A';
    return `${baths} bath`;
  };

  const cardContent = (
    <>
      {listing.image_url && (
        <div className="listing-image-container">
          <img src={listing.image_url} alt={listing.address} className="listing-image" />
        </div>
      )}
      <div className="listing-card-header">
        <span className="listing-category">{listing.category}</span>
        <span className="listing-price">{formatPrice(listing.price)}</span>
      </div>
      <h3 className="listing-address">{listing.address}</h3>
      <div className="listing-details">
        <span>{formatBedrooms(listing.bedrooms)}</span>
        <span className="separator">|</span>
        <span>{formatBathrooms(listing.bathrooms)}</span>
      </div>
      <div className="listing-source">Source: {listing.source}</div>
    </>
  );

  if (listingUrl) {
    return (
      <a href={listingUrl} target="_blank" rel="noopener noreferrer" className="listing-card listing-link">
        {cardContent}
      </a>
    );
  }

  return <div className="listing-card">{cardContent}</div>;
}

export default ListingCard;
