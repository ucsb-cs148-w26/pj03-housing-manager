import './ListingCard.css';

function ListingCard({ title, price, bedrooms, bathrooms, address }) {
  return (
    <div className="listing-card">
      <div className="listing-card-image">
        <span className="listing-card-image-placeholder">No Image</span>
      </div>
      <div className="listing-card-content">
        <h3 className="listing-card-title">{title}</h3>
        <p className="listing-card-price">${price}/mo</p>
        <p className="listing-card-details">
          {bedrooms} bed, {bathrooms} bath
        </p>
        <p className="listing-card-address">{address}</p>
      </div>
    </div>
  );
}

export default ListingCard;
