import { useState, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import './MapView.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const ISLA_VISTA_CENTER = { lat: 34.4133, lng: -119.8610 };

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  styles: [
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  ],
};

const formatPrice = (price) => {
  if (price === null || price === undefined) return 'Price N/A';
  return `$${price.toLocaleString()}/mo`;
};

function MapView({ externalSelectedListing = null }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [markerPos, setMarkerPos] = useState(null);
  const [geocoding, setGeocoding] = useState(false);
  const geocoderRef = useRef(null);
  const cacheRef = useRef({});
  const mapRef = useRef(null);

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
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  const geocodeAddress = (address) => {
    return new Promise((resolve, reject) => {
      if (cacheRef.current[address]) {
        resolve(cacheRef.current[address]);
        return;
      }

      if (!geocoderRef.current) {
        geocoderRef.current = new window.google.maps.Geocoder();
      }

      const query =
        address.toLowerCase().includes('isla vista') ||
        address.toLowerCase().includes('goleta') ||
        address.toLowerCase().includes('santa barbara')
          ? address
          : `${address}, Isla Vista, CA`;

      geocoderRef.current.geocode({ address: query }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const pos = {
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng(),
          };
          cacheRef.current[address] = pos;
          resolve(pos);
        } else {
          reject(new Error('Could not geocode address'));
        }
      });
    });
  };

  const handleListingClick = async (listing) => {
    setSelectedListing(listing);
    setGeocoding(true);
    setMarkerPos(null);

    try {
      const pos = await geocodeAddress(listing.address);
      setMarkerPos(pos);
      if (mapRef.current) {
        mapRef.current.panTo(pos);
        mapRef.current.setZoom(17);
      }
    } catch {
      setMarkerPos(null);
    } finally {
      setGeocoding(false);
    }
  };

  // React to listing selected from Browse All section
  useEffect(() => {
    if (externalSelectedListing) {
      handleListingClick(externalSelectedListing);
    }
  }, [externalSelectedListing]);

  const onMapLoad = (map) => {
    mapRef.current = map;
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
        Click a listing to see its location on the map.
      </p>
      {error && <div className="map-error">{error}</div>}
      <div className="map-layout">
        <div className="map-sidebar">
          {loading ? (
            <p className="map-sidebar-status">Loading listings...</p>
          ) : listings.length === 0 ? (
            <p className="map-sidebar-status">No listings available.</p>
          ) : (
            <ul className="map-sidebar-list">
              {listings.map((listing, idx) => {
                const id = `${listing.source}-${listing.address}-${idx}`;
                const isActive =
                  selectedListing &&
                  selectedListing.address === listing.address &&
                  selectedListing.source === listing.source;
                return (
                  <li
                    key={id}
                    className={`map-sidebar-item${isActive ? ' active' : ''}`}
                    onClick={() => handleListingClick(listing)}
                  >
                    <span className="sidebar-item-address">{listing.address}</span>
                    <span className="sidebar-item-price">{formatPrice(listing.price)}</span>
                    <span className="sidebar-item-details">
                      {listing.bedrooms != null ? `${listing.bedrooms} bed` : ''}
                      {listing.bathrooms != null ? ` / ${listing.bathrooms} bath` : ''}
                    </span>
                    <span className="sidebar-item-source">{listing.source}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="map-container">
          {geocoding && (
            <div className="map-geocoding-overlay">Locating address...</div>
          )}
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={ISLA_VISTA_CENTER}
            zoom={15}
            options={mapOptions}
            onLoad={onMapLoad}
          >
            {markerPos && selectedListing && (
              <>
                <Marker position={markerPos} />
                <InfoWindow
                  position={markerPos}
                  onCloseClick={() => {
                    setSelectedListing(null);
                    setMarkerPos(null);
                  }}
                >
                  <div className="map-info-window">
                    <h3 className="map-info-address">{selectedListing.address}</h3>
                    <p className="map-info-price">{formatPrice(selectedListing.price)}</p>
                    <p className="map-info-details">
                      {selectedListing.bedrooms != null ? `${selectedListing.bedrooms} bed` : ''}
                      {selectedListing.bathrooms != null ? ` | ${selectedListing.bathrooms} bath` : ''}
                    </p>
                    <p className="map-info-source">Source: {selectedListing.source}</p>
                    {selectedListing.listing_link && (
                      <a
                        href={selectedListing.listing_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="map-info-link"
                      >
                        View Listing
                      </a>
                    )}
                  </div>
                </InfoWindow>
              </>
            )}
          </GoogleMap>
        </div>
      </div>
    </div>
  );
}

export default MapView;
