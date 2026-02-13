/**
 * Filter listings based on filter criteria
 * @param {Array} listings - Raw listings array
 * @param {Object} filters - Filter state object
 * @returns {Array} Filtered listings
 */
export function filterListings(listings, filters) {
  if (!listings || listings.length === 0) return [];

  return listings.filter((listing) => {
    // Price filter
    if (filters.price.min !== null && listing.price !== null) {
      if (listing.price < filters.price.min) return false;
    }
    if (filters.price.max !== null && listing.price !== null) {
      if (listing.price > filters.price.max) return false;
    }

    // Bedrooms filter (handle studio as 0)
    if (filters.bedrooms.min !== null && listing.bedrooms !== null) {
      if (listing.bedrooms < filters.bedrooms.min) return false;
    }
    if (filters.bedrooms.max !== null && listing.bedrooms !== null) {
      if (listing.bedrooms > filters.bedrooms.max) return false;
    }

    // Bathrooms filter
    if (filters.bathrooms.min !== null && listing.bathrooms !== null) {
      if (listing.bathrooms < filters.bathrooms.min) return false;
    }

    // Category filter
    if (filters.categories.length > 0) {
      if (!filters.categories.includes(listing.category)) return false;
    }

    return true;
  });
}

/**
 * Extract unique categories from listings
 * @param {Array} listings
 * @returns {Array} Unique category strings
 */
export function getUniqueCategories(listings) {
  if (!listings) return [];
  return [...new Set(listings.map((l) => l.category).filter(Boolean))];
}

/**
 * Get price bounds from listings
 * @param {Array} listings
 * @returns {Object} { min, max }
 */
export function getPriceBounds(listings) {
  if (!listings || listings.length === 0) return { min: 0, max: 10000 };
  const prices = listings.map((l) => l.price).filter((p) => p !== null);
  if (prices.length === 0) return { min: 0, max: 10000 };
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
}
