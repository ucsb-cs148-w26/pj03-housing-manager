import { useState } from 'react';
import ListingCard from './ListingCard';
import './RecentListingsSection.css';

/**
 * Placeholder listings data.
 *
 * To replace with CSV data:
 * 1. Import your CSV parser (e.g., papaparse: `import Papa from 'papaparse'`)
 * 2. Load and parse your CSV file
 * 3. Pass the parsed data as the `listings` prop to this component
 *
 * Expected CSV columns: id, title, price, bedrooms, bathrooms, address
 */
const placeholderListings = [
  { id: 1, title: 'Listing Title', price: '1,500', bedrooms: 2, bathrooms: 1, address: '123 Main St' },
  { id: 2, title: 'Listing Title', price: '1,800', bedrooms: 3, bathrooms: 2, address: '456 Oak Ave' },
  { id: 3, title: 'Listing Title', price: '1,200', bedrooms: 1, bathrooms: 1, address: '789 Pine Rd' },
  { id: 4, title: 'Listing Title', price: '2,000', bedrooms: 2, bathrooms: 2, address: '321 Elm St' },
  { id: 5, title: 'Listing Title', price: '1,650', bedrooms: 2, bathrooms: 1, address: '555 Beach Blvd' },
  { id: 6, title: 'Listing Title', price: '2,200', bedrooms: 3, bathrooms: 2, address: '777 Campus Dr' },
];

function RecentListingsSection({ listings = placeholderListings }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const visibleCards = 3;
  const totalListings = listings.length;

  // Infinite scroll: wrap around when reaching the end
  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalListings - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === totalListings - 1 ? 0 : prev + 1));
  };

  // Get visible listings with wrap-around for infinite scroll
  const getVisibleListings = () => {
    const visible = [];
    for (let i = 0; i < visibleCards; i++) {
      const index = (currentIndex + i) % totalListings;
      visible.push({ ...listings[index], displayKey: `${currentIndex}-${i}` });
    }
    return visible;
  };

  return (
    <section className="listings-section">
      <div className="listings-content">
        <h2 className="listings-title">Recent Listings</h2>
        <p className="listings-subtitle">Browse available housing options</p>

        <div className="listings-carousel">
          <button
            className="carousel-btn carousel-btn-prev"
            onClick={goToPrevious}
            aria-label="Previous listings"
          >
            &#8249;
          </button>

          <div className="carousel-viewport">
            <div className="carousel-track">
              {getVisibleListings().map((listing) => (
                <div key={listing.displayKey} className="carousel-slide">
                  <ListingCard
                    title={listing.title}
                    price={listing.price}
                    bedrooms={listing.bedrooms}
                    bathrooms={listing.bathrooms}
                    address={listing.address}
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            className="carousel-btn carousel-btn-next"
            onClick={goToNext}
            aria-label="Next listings"
          >
            &#8250;
          </button>
        </div>

        <p className="listings-note">Login to save listings and contact landlords</p>
      </div>
    </section>
  );
}

export default RecentListingsSection;
