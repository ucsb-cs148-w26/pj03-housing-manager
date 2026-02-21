import { useState, useEffect, useCallback } from 'react';
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

  // Validation & feedback state
  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState(null);
  const [commentErrors, setCommentErrors] = useState({});
  const [commentSuccess, setCommentSuccess] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Auto-dismiss success messages
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
    // Clear error for this field on change
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: undefined });
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const newPost = { ...form, id: Date.now() };
    setPosts([newPost, ...posts]);
    setComments({ ...comments, [newPost.id]: [] });
    setForm({ title: '', location: '', rent: '', dates: '', description: '' });
    setFormErrors({});
    setShowForm(false);
    setSuccessMessage('Listing posted successfully!');
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
    // Clear comment error on typing
    if (commentErrors[postId]) {
      setCommentErrors({ ...commentErrors, [postId]: undefined });
    }
  }

  function handleCommentSubmit(e, postId) {
    e.preventDefault();
    const commentText = commentForms[postId]?.trim();

    if (!commentText) {
      setCommentErrors({ ...commentErrors, [postId]: 'Comment cannot be empty.' });
      return;
    }

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

    setCommentErrors({ ...commentErrors, [postId]: undefined });
    setCommentSuccess({ ...commentSuccess, [postId]: true });
  }

  function handleDeleteClick(postId, commentId) {
    setDeleteConfirm({ postId, commentId });
  }

  function confirmDelete() {
    if (!deleteConfirm) return;
    const { postId, commentId } = deleteConfirm;
    setComments({
      ...comments,
      [postId]: comments[postId].filter(c => c.id !== commentId)
    });
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

        <div className="sublease-button-wrapper">
          <button
            className="post-sublease-btn"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Close Form' : 'Post a Sublease'}
          </button>
        </div>

        {showForm && (
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
                      <div className="comment-input-wrapper">
                        <input
                          type="text"
                          className={`comment-input${commentErrors[post.id] ? ' input-error' : ''}`}
                          placeholder="Add a comment..."
                          value={commentForms[post.id] || ''}
                          onChange={(e) => handleCommentChange(post.id, e.target.value)}
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
