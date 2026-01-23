import './AboutSection.css';

function AboutSection() {
  return (
    <section className="about-section">
      <div className="about-content">
        <h2 className="about-title">About Housing Manager</h2>
        <p className="about-description">
          Housing Manager is a centralized platform designed to help students and community
          members find their perfect housing. Browse listings from multiple leasing companies,
          connect with potential roommates, and manage your housing search all in one place.
        </p>
        <div className="about-features">
          <div className="about-feature">
            <h3>Search & Filter</h3>
            <p>Find housing that fits your needs with powerful search and filtering options.</p>
          </div>
          <div className="about-feature">
            <h3>Connect</h3>
            <p>Chat with others about rooming together or subleasing opportunities.</p>
          </div>
          <div className="about-feature">
            <h3>Stay Organized</h3>
            <p>Save listings and manage your housing applications in one convenient location.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
