import { useState, useRef, useCallback } from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header/Header'
import AboutSection from './components/AboutSection/AboutSection'
import SubleaseListings from './components/SubleaseListings/SubleaseListings'
import RoommateChat from './components/RoommateChat/RoommateChat'
import AllListingsSection from './components/AllListingsSection/AllListingsSection'
import Footer from './components/Footer/Footer'
import MapView from './components/MapView/MapView'
import AdminUsersPage from './components/AdminUsersPage/AdminUsersPage'
import './App.css'

function HomePage() {
  const [mapSelectedListing, setMapSelectedListing] = useState(null)
  const mapSectionRef = useRef(null)

  const handleCardClick = useCallback((listing) => {
    setMapSelectedListing({ ...listing })
    if (mapSectionRef.current) {
      mapSectionRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  return (
    <main className="main-content">
      <section id="about">
        <AboutSection />
      </section>

      <section id="map" ref={mapSectionRef}>
        <MapView externalSelectedListing={mapSelectedListing} />
      </section>

      <section id="all-listings">
        <AllListingsSection onCardClick={handleCardClick} />
      </section>

      <section id="sublease">
        <SubleaseListings />
      </section>

      <section id="roommates">
        <RoommateChat />
      </section>

      <section id="contact">
        <Footer />
      </section>
    </main>
  )
}

function App() {
  return (
    <div className="app">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
      </Routes>
    </div>
  )
}

export default App