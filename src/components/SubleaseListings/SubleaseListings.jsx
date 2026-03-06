import { useState, useEffect, useCallback } from 'react';
import { getCurrentUser } from '../../utils/auth';
import './SubleaseListings.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function SubleaseListings() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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

  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState(null);
  const [commentErrors, setCommentErrors] = useState({});
  const [commentSuccess, setCommentSuccess] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Track the logged-in user
  const [user, setUser] = useState(getCurrentUser);
  useEffect(() => {
    const handleAuthChange = (e) => setUser(e.detail);
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  // Load posts from backend on mount
  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/subleases`);
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const data = await res.json();
        setPosts(data.posts || []);
      } catch (err) {
        setError('Failed to load sublease listings. Is the backend running?');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  // Lazy-load comments when a post's comment section is expanded
  useEffect(() => {
    const openPostIds = Object.keys(expandedComments).filter(id => expandedComments[id]);
    openPostIds.forEach(async (postId) => {
      if (comments[postId] !== undefined) return; // already loaded
      try {
        const res = await fetch(`${API_URL}/subleases/${postId}/comments`);
        if (!res.ok) return;
        const data = await res.json();
        setComments(prev => ({ ...prev, [postId]: data.comments }));
      } catch (err) {
        console.error('Failed to load comments:', err);
      }
    });
  }, [expandedComments]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const clearCommentSuccess = useCallback((postId) => {
    setCommentSuccess(prev => {
      const next = { ...prev };
      delete next[postId];
      return next;
    });
  }, []);

  useEffect(() => {
    const timers = Object.keys(commentSuccess).map(postId => {
      return setTimeout(() => clearCommentSuccess(postId), 3000);
    });
    return () => timers.forEach(t => clearTimeout(t));
  }, [commentSuccess, clearCommentSuccess]);

  function validateForm() {
    const errors = {};
    if (!form.title.trim()) errors.title = 'Title is required.';
    if (!form.location.trim()) errors.location = 'Location is required.';
    if (!form.rent.trim()) {
      errors.rent = 'Rent is required.';
    } else if (isNaN(form.rent) || Number(form.rent) <= 0) {
      errors.rent = 'Rent must be a positive number.';
    }
    if (!form.dates.trim()) errors.dates = 'Available dates are required.';
    if (!form.description.trim()) errors.description = 'Description is required.';
    return errors;
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: undefined });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/subleases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          author_email: user.email,
          author_name: user.name,
        }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const newPost = await res.json();
      setPosts(prev => [newPost, ...prev]);
      setForm({ title: '', location: '', rent: '', dates: '', description: '' });
      setFormErrors({});
      setShowForm(false);
      setSuccessMessage('Listing posted successfully!');
    } catch (err) {
      setError('Failed to post sublease. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeletePost(postId) {
    if (!user) return;
    try {
      const res = await fetch(
        `${API_URL}/subleases/${postId}?author_email=${encodeURIComponent(user.email)}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (err) {
      setError('Failed to delete post. Please try again.');
      console.error(err);
    }
  }

  function toggleComments(postId) {
    setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  }

  function handleCommentChange(postId, value) {
    setCommentForms({ ...commentForms, [postId]: value });
    if (commentErrors[postId]) {
      setCommentErrors({ ...commentErrors, [postId]: undefined });
    }
  }

  async function handleCommentSubmit(e, postId) {
    e.preventDefault();
    const commentText = commentForms[postId]?.trim();
    if (!commentText) {
      setCommentErrors({ ...commentErrors, [postId]: 'Comment cannot be empty.' });
      return;
    }
    if (!user) {
      setCommentErrors({ ...commentErrors, [postId]: 'You must be signed in to comment.' });
      return;
    }
    try {
      const res = await fetch(`${API_URL}/subleases/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: commentText,
          author_name: user.name,
          author_email: user.email,
        }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const newComment = await res.json();
      setComments(prev => ({ ...prev, [postId]: [...(prev[postId] || []), newComment] }));
      setCommentForms({ ...commentForms, [postId]: '' });
      setCommentErrors({ ...commentErrors, [postId]: undefined });
      setCommentSuccess({ ...commentSuccess, [postId]: true });
    } catch (err) {
      setCommentErrors({ ...commentErrors, [postId]: 'Failed to post comment. Try again.' });
      console.error(err);
    }
  }

  function handleDeleteClick(postId, commentId) {
    setDeleteConfirm({ postId, commentId });
  }

  async function confirmDelete() {
    if (!deleteConfirm) return;
    const { postId, commentId } = deleteConfirm;
    try {
      const res = await fetch(
        `${API_URL}/subleases/${postId}/comments/${commentId}?author_email=${encodeURIComponent(user.email)}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      setComments(prev => ({
        ...prev,
        [postId]: prev[postId].filter(c => c.id !== commentId),
      }));
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
    setDeleteConfirm(null);
  }

  function cancelDelete() {
    setDeleteConfirm(null);
  }

  return (
    <section className="sublease-section">
      <div className="sublease-content">
        <h2 className="sublease-title">Sublease Listings</h2>
        <p className="sublease-subtitle">
          Find short-term housing or post your own sublease
        </p>

        {successMessage && (
          <div className="sublease-success" role="status">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="sublease-error" role="alert">
            {error}
          </div>
        )}

        <div className="sublease-button-wrapper">
          {user ? (
            <button
              className="post-sublease-btn"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? 'Close Form' : 'Post a Sublease'}
            </button>
          ) : (
            <p className="sublease-login-prompt">
              🔒 You must be <strong>signed in</strong> to post a sublease.
            </p>
          )}
        </div>

        {user && showForm && (
          <form className="sublease-form" onSubmit={handleSubmit} noValidate>
            <div className="form-field">
              <input
                name="title"
                placeholder="Title (Ex: Room near campus)"
                value={form.title}
                onChange={handleChange}
                className={formErrors.title ? 'input-error' : ''}
              />
              {formErrors.title && <span className="field-error">{formErrors.title}</span>}
            </div>

            <div className="form-field">
              <input
                name="location"
                placeholder="Location"
                value={form.location}
                onChange={handleChange}
                className={formErrors.location ? 'input-error' : ''}
              />
              {formErrors.location && <span className="field-error">{formErrors.location}</span>}
            </div>

            <div className="form-field">
              <input
                name="rent"
                placeholder="Monthly Rent ($)"
                value={form.rent}
                onChange={handleChange}
                className={formErrors.rent ? 'input-error' : ''}
              />
              {formErrors.rent && <span className="field-error">{formErrors.rent}</span>}
            </div>

            <div className="form-field">
              <input
                name="dates"
                placeholder="Available dates"
                value={form.dates}
                onChange={handleChange}
                className={formErrors.dates ? 'input-error' : ''}
              />
              {formErrors.dates && <span className="field-error">{formErrors.dates}</span>}
            </div>

            <div className="form-field">
              <textarea
                name="description"
                placeholder="Description"
                value={form.description}
                onChange={handleChange}
                className={formErrors.description ? 'input-error' : ''}
              />
              {formErrors.description && <span className="field-error">{formErrors.description}</span>}
            </div>

            <button type="submit" disabled={submitting}>
              {submitting ? 'Posting…' : 'Post Listing'}
            </button>
          </form>
        )}

        <div className="sublease-grid">
          {loading && (
            <div className="sublease-placeholder">
              <p>Loading sublease listings…</p>
            </div>
          )}
          {!loading && posts.length === 0 && (
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
              <div className="sublease-card-title">{post.title}</div>
              <div className="sublease-location">{post.location}</div>
              <div className="sublease-dates">{post.dates}</div>
              <div className="sublease-description">{post.description}</div>
              <div className="sublease-author">
                Posted by {post.author_name} · {new Date(post.created_at).toLocaleDateString()}
              </div>

              {user && user.email === post.author_email && (
                <button
                  className="post-delete-btn"
                  onClick={() => handleDeletePost(post.id)}
                >
                  🗑️ Delete Post
                </button>
              )}

              <div className="comments-section">
                <button
                  className="comments-toggle-btn"
                  onClick={() => toggleComments(post.id)}
                  aria-expanded={!!expandedComments[post.id]}
                  data-testid={`toggle-comments-${post.id}`}
                >
                  💬 Comments ({(comments[post.id] || []).length})
                  <span className="toggle-icon">
                    {expandedComments[post.id] ? '▲' : '▼'}
                  </span>
                </button>

                {expandedComments[post.id] && (
                  <div className="comments-container" data-testid={`comments-container-${post.id}`}>
                    <form className="comment-form" onSubmit={(e) => handleCommentSubmit(e, post.id)}>
                      <div className="comment-input-wrapper">
                        <input
                          type="text"
                          className={`comment-input${commentErrors[post.id] ? ' input-error' : ''}`}
                          placeholder={user ? 'Add a comment...' : 'Sign in to comment'}
                          value={commentForms[post.id] || ''}
                          onChange={(e) => handleCommentChange(post.id, e.target.value)}
                          disabled={!user}
                          data-testid={`comment-input-${post.id}`}
                        />
                        {commentErrors[post.id] && (
                          <span className="comment-error">{commentErrors[post.id]}</span>
                        )}
                        {commentSuccess[post.id] && (
                          <span className="comment-success" role="status">Comment posted!</span>
                        )}
                      </div>
                      <button
                        type="submit"
                        className="comment-submit-btn"
                        disabled={!user}
                        data-testid={`comment-submit-${post.id}`}
                      >
                        Post
                      </button>
                    </form>

                    <div className="comments-list">
                      {!comments[post.id] ? (
                        <p className="no-comments">Loading comments…</p>
                      ) : (comments[post.id] || []).length === 0 ? (
                        <p className="no-comments">No comments yet. Be the first to comment!</p>
                      ) : (
                        (comments[post.id] || []).map(comment => (
                          <div key={comment.id} className="comment" data-testid={`comment-${comment.id}`}>
                            <div className="comment-header">
                              <span className="comment-author">{comment.author_name}</span>
                              <span className="comment-timestamp">
                                {new Date(comment.created_at).toLocaleString()}
                              </span>
                            </div>
                            <div className="comment-text">{comment.text}</div>
                            {user && comment.author_email === user.email && (
                              deleteConfirm?.commentId === comment.id ? (
                                <div className="delete-confirm">
                                  <span>Are you sure?</span>
                                  <button
                                    className="delete-confirm-btn"
                                    onClick={confirmDelete}
                                    data-testid={`confirm-delete-${comment.id}`}
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    className="delete-cancel-btn"
                                    onClick={cancelDelete}
                                    data-testid={`cancel-delete-${comment.id}`}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  className="comment-delete-btn"
                                  onClick={() => handleDeleteClick(post.id, comment.id)}
                                  data-testid={`delete-comment-${comment.id}`}
                                  aria-label="Delete comment"
                                >
                                  🗑️ Delete
                                </button>
                              )
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