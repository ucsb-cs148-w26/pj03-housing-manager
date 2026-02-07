import { Routes, Route } from 'react-router-dom'
import Header from './components/Header/Header'
import AboutSection from './components/AboutSection/AboutSection'
import RecentListingsSection from './components/RecentListings/RecentListingsSection'
import SubleaseListings from './components/SubleaseListings/SubleaseListings'
import ScraperSection from './components/ScraperSection/ScraperSection'
import Footer from './components/Footer/Footer'
import AdminUsersPage from './components/AdminUsersPage/AdminUsersPage'
import './App.css'

function HomePage() {
  return (
    <main className="main-content">
      <section id="about">
        <AboutSection />
      </section>

      <section id="listings">
        <RecentListingsSection />
      </section>

      <section id="sublease">
        <SubleaseListings />
      </section>

      <section id="scraper">
        <ScraperSection />
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
