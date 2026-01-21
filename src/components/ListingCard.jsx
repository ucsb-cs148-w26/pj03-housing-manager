import './ListingCard.css';

function ListingCard({ listing }) {
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

  return (
    <div className="listing-card">
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
    </div>
  );
}

export default ListingCard;
