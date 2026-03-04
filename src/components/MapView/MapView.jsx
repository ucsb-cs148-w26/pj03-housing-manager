import { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import './MapView.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const ISLA_VISTA_CENTER = { lat: 34.4133, lng: -119.8610 };

const mapContainerStyle = {
  width: '100%',
  height: '500px',
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
};

function MapView() {
  const [listings, setListings] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const geocoderRef = useRef(null);
  const cacheRef = useRef({});

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  // Fetch listings from backend
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await fetch(`${API_URL}/listings`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setListings(data.listings || []);
      } catch (err) {
        setError(err.message || 'Failed to load listings');
      }
    };
    fetchListings();
  }, []);

  // Geocode listings once the map API is loaded and listings are available
  const geocodeListings = useCallback(() => {
    if (!isLoaded || listings.length === 0) return;

    if (!geocoderRef.current) {
      geocoderRef.current = new window.google.maps.Geocoder();
    }

    const geocoder = geocoderRef.current;
    const newMarkers = [];
    let pending = listings.length;

    const done = () => {
      pending--;
      if (pending === 0) {
        setMarkers(newMarkers);
        setLoading(false);
      }
    };

    listings.forEach((listing) => {
      const address = listing.address;

      // Use cache if available
      if (cacheRef.current[address]) {
        newMarkers.push({ ...listing, position: cacheRef.current[address] });
        done();
        return;
      }

      // Append "Isla Vista, CA" for better geocoding accuracy
      const query = address.toLowerCase().includes('isla vista') || address.toLowerCase().includes('goleta') || address.toLowerCase().includes('santa barbara')
        ? address
        : `${address}, Isla Vista, CA`;

      geocoder.geocode({ address: query }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const pos = {
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng(),
          };
          cacheRef.current[address] = pos;
          newMarkers.push({ ...listing, position: pos });
        }
        done();
      });
    });
  }, [isLoaded, listings]);

  useEffect(() => {
    geocodeListings();
  }, [geocodeListings]);

  const formatPrice = (price) => {
    if (price === null || price === undefined) return 'Price N/A';
    return `$${price.toLocaleString()}/mo`;
  };

  if (loadError) {
    return <div className="map-error">Failed to load Google Maps</div>;
  }

  if (!isLoaded) {
    return <div className="map-loading">Loading map...</div>;
  }

  return (
    <div className="map-view">
      <h2 className="map-title">Map View</h2>
      <p className="map-subtitle">
        See all listings on the map. Click a pin for details.
      </p>
      {error && <div className="map-error">{error}</div>}
      {loading && listings.length > 0 && (
        <p className="map-geocoding-status">Geocoding addresses...</p>
      )}
      <div className="map-container">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={ISLA_VISTA_CENTER}
          zoom={15}
          options={mapOptions}
        >
          {markers.map((marker, idx) => (
            <Marker
              key={`${marker.address}-${marker.source}-${idx}`}
              position={marker.position}
              onClick={() => setSelectedMarker(marker)}
            />
          ))}
          {selectedMarker && (
            <InfoWindow
              position={selectedMarker.position}
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div className="map-info-window">
                <h3 className="map-info-address">{selectedMarker.address}</h3>
                <p className="map-info-price">{formatPrice(selectedMarker.price)}</p>
                <p className="map-info-details">
                  {selectedMarker.bedrooms != null ? `${selectedMarker.bedrooms} bed` : ''}
                  {selectedMarker.bathrooms != null ? ` | ${selectedMarker.bathrooms} bath` : ''}
                </p>
                <p className="map-info-source">Source: {selectedMarker.source}</p>
                {selectedMarker.listing_link && (
                  <a
                    href={selectedMarker.listing_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="map-info-link"
                  >
                    View Listing
                  </a>
                )}
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>
      <p className="map-marker-count">
        {markers.length} of {listings.length} listings mapped
      </p>
    </div>
  );
}

export default MapView;
