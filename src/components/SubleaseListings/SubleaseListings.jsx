import './SubleaseListings.css';

function SubleaseListings() {
  return (
    <section className="sublease-section">
      <div className="sublease-content">
        <h2 className="sublease-title">Sublease Listings</h2>
        <p className="sublease-subtitle">
          Find short-term housing or post your own sublease
        </p>

        <div className="sublease-placeholder">
          <p>🏠 Sublease listings coming soon!</p>
          <p>Students will be able to post and browse short-term housing options here.</p>
        </div>

        <button className="post-sublease-btn">Post a Sublease</button>
      </div>
    </section>
  );
}

export default SubleaseListings;