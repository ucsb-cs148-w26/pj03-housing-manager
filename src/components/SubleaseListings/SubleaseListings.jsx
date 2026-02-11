import { useState } from 'react';
import './SubleaseListings.css';

function SubleaseListings() {
  const [posts, setPosts] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    title: '',
    location: '',
    rent: '',
    dates: '',
    description: '',
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setPosts([{ ...form, id: Date.now() }, ...posts]);
    setForm({ title: '', location: '', rent: '', dates: '', description: '' });
    setShowForm(false);
  }

  return (
    <section className="sublease-section">
      <div className="sublease-content">
        <h2 className="sublease-title">Sublease Listings</h2>
        <p className="sublease-subtitle">
          Find short-term housing or post your own sublease
        </p>

        <div className="sublease-button-wrapper">
          <button
            className="post-sublease-btn"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Close Form' : 'Post a Sublease'}
          </button>
        </div>


        {showForm && (
          <form className="sublease-form" onSubmit={handleSubmit}>
            <input
              name="title"
              placeholder="Title (Ex: Room near campus)"
              value={form.title}
              onChange={handleChange}
              required
            />

            <input
              name="location"
              placeholder="Location"
              value={form.location}
              onChange={handleChange}
              required
            />

            <input
              name="rent"
              placeholder="Monthly Rent ($)"
              value={form.rent}
              onChange={handleChange}
              required
            />

            <input
              name="dates"
              placeholder="Available dates"
              value={form.dates}
              onChange={handleChange}
              required
            />

            <textarea
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              required
            />

            <button type="submit">Post Listing</button>
          </form>
        )}

        <div className="sublease-grid">
          {posts.length === 0 && (
            <div className="sublease-placeholder">
              <p>🏠 No subleases yet — be the first to post!</p>
            </div>
          )}

          {posts.map(post => (
            <div className="sublease-card" key={post.id}>
              <div className="sublease-card-header">
                <span className="sublease-tag">Sublease</span>
                <span className="sublease-price">${post.rent}/mo</span>
              </div>

              <div className="sublease-location">{post.location}</div>
              <div className="sublease-dates">{post.dates}</div>

              <div className="sublease-description">
                {post.description}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default SubleaseListings;
