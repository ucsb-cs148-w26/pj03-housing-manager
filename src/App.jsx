import Header from './components/Header/Header'
import AboutSection from './components/AboutSection/AboutSection'
import RecentListingsSection from './components/RecentListings/RecentListingsSection'
import Footer from './components/Footer/Footer'
import './App.css'

function App() {
  return (
    <div className="app">
      <Header />

      <main className="main-content">
        <section id="about">
          <AboutSection />
        </section>

        <section id="listings">
          <RecentListingsSection />
        </section>

        <section id="contact">
          <Footer />
        </section>
      </main>
    </div>
  )
}

export default App
