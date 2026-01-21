import React, { useState } from 'react'
import ListingList from './components/ListingList'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const SCRAPERS = [
  { id: 'meridian', name: 'Meridian Group Real Estate', url: 'meridiangrouprem.com' },
  // Add more scrapers here as they're implemented
]

function App() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastScraped, setLastScraped] = useState(null)
  const [selectedScraper, setSelectedScraper] = useState(SCRAPERS[0].id)

  const handleScrape = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/scrape/${selectedScraper}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setListings(data.listings)
      setLastScraped(data.scraped_at)
    } catch (err) {
      setError(err.message || 'Failed to scrape listings')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Housing Manager</h1>
        <p className="description">
          Compare rental listings from local property management companies
        </p>
      </header>

      <main className="App-main">
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

        <ListingList listings={listings} loading={loading} error={error} />
      </main>
    </div>
  )
}

export default App
