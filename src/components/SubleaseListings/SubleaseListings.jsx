import { useState } from 'react';
import './SubleaseListings.css';

function SubleaseListings() {
  const [posts, setPosts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [expandedComments, setExpandedComments] = useState({});
  const [commentForms, setCommentForms] = useState({});
  const [comments, setComments] = useState({});

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
    const newPost = { ...form, id: Date.now() };
    setPosts([newPost, ...posts]);
    setComments({ ...comments, [newPost.id]: [] });
    setForm({ title: '', location: '', rent: '', dates: '', description: '' });
    setShowForm(false);
  }

  function toggleComments(postId) {
    setExpandedComments({
      ...expandedComments,
      [postId]: !expandedComments[postId]
    });
  }

  function handleCommentChange(postId, value) {
    setCommentForms({
      ...commentForms,
      [postId]: value
    });
  }

  function handleCommentSubmit(e, postId) {
    e.preventDefault();
    const commentText = commentForms[postId]?.trim();
    
    if (!commentText) return;

    const newComment = {
      id: Date.now(),
      text: commentText,
      author: 'SexyJesusFreak', // Current user
      timestamp: new Date().toLocaleString()
    };

    setComments({
      ...comments,
      [postId]: [...(comments[postId] || []), newComment]
    });

    setCommentForms({
      ...commentForms,
      [postId]: ''
    });
  }

  function deleteComment(postId, commentId) {
    setComments({
      ...comments,
      [postId]: comments[postId].filter(c => c.id !== commentId)
    });
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

              <div className="comments-section">
                <button 
                  className="comments-toggle-btn"
                  onClick={() => toggleComments(post.id)}
                  aria-expanded={expandedComments[post.id]}
                  data-testid={`toggle-comments-${post.id}`}
                >
                  💬 Comments ({(comments[post.id] || []).length})
                  <span className="toggle-icon">
                    {expandedComments[post.id] ? '▲' : '▼'}
                  </span>
                </button>

                {expandedComments[post.id] && (
                  <div className="comments-container" data-testid={`comments-container-${post.id}`}>
                    <form 
                      className="comment-form"
                      onSubmit={(e) => handleCommentSubmit(e, post.id)}
                    >
                      <input
                        type="text"
                        className="comment-input"
                        placeholder="Add a comment..."
                        value={commentForms[post.id] || ''}
                        onChange={(e) => handleCommentChange(post.id, e.target.value)}
                        data-testid={`comment-input-${post.id}`}
                      />
                      <button 
                        type="submit" 
                        className="comment-submit-btn"
                        data-testid={`comment-submit-${post.id}`}
                      >
                        Post
                      </button>
                    </form>

                    <div className="comments-list">
                      {(comments[post.id] || []).length === 0 ? (
                        <p className="no-comments">No comments yet. Be the first to comment!</p>
                      ) : (
                        (comments[post.id] || []).map(comment => (
                          <div key={comment.id} className="comment" data-testid={`comment-${comment.id}`}>
                            <div className="comment-header">
                              <span className="comment-author">{comment.author}</span>
                              <span className="comment-timestamp">{comment.timestamp}</span>
                            </div>
                            <div className="comment-text">{comment.text}</div>
                            {comment.author === 'SexyJesusFreak' && (
                              <button 
                                className="comment-delete-btn"
                                onClick={() => deleteComment(post.id, comment.id)}
                                data-testid={`delete-comment-${comment.id}`}
                                aria-label="Delete comment"
                              >
                                🗑️ Delete
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default SubleaseListings;