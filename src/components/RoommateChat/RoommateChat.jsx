import { useState, useEffect, useRef } from 'react';
import { getCurrentUser } from '../../utils/auth';
import './RoommateChat.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const ROOMS = [
  { id: 'general', label: '💬 General', description: 'General roommate chat' },
  { id: 'dorms', label: '🏫 Dorms', description: 'Looking for a dorm roommate' },
  { id: 'leases', label: '🏠 Leases & Apartments', description: 'Looking for a roommate for a lease or apartment' },
];

function RoommateChat() {
  const [activeRoom, setActiveRoom] = useState('general');
  const [messages, setMessages] = useState({});
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const bottomRef = useRef(null);

  const [user, setUser] = useState(getCurrentUser);
  useEffect(() => {
    const handleAuthChange = (e) => setUser(e.detail);
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  // Load messages when room changes
  useEffect(() => {
    async function fetchMessages() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/chat/${activeRoom}`);
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const data = await res.json();
        setMessages(prev => ({ ...prev, [activeRoom]: data.messages }));
      } catch (err) {
        setError('Failed to load messages.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchMessages();
  }, [activeRoom]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeRoom]);

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || !user) return;
    setSending(true);
    try {
      const res = await fetch(`${API_URL}/chat/${activeRoom}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: input.trim(),
          author_name: user.name,
          author_email: user.email,
          author_picture: user.picture || null,
        }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const newMsg = await res.json();
      setMessages(prev => ({
        ...prev,
        [activeRoom]: [...(prev[activeRoom] || []), newMsg],
      }));
      setInput('');
    } catch (err) {
      setError('Failed to send message.');
      console.error(err);
    } finally {
      setSending(false);
    }
  }

  async function confirmDelete() {
    if (!deleteConfirm || !user) return;
    const { messageId } = deleteConfirm;
    try {
      const res = await fetch(
        `${API_URL}/chat/${activeRoom}/${messageId}?author_email=${encodeURIComponent(user.email)}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      setMessages(prev => ({
        ...prev,
        [activeRoom]: prev[activeRoom].filter(m => m.id !== messageId),
      }));
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
    setDeleteConfirm(null);
  }

  const roomMessages = messages[activeRoom] || [];

  return (
    <section className="chat-section">
      <div className="chat-content">
        <h2 className="chat-title">Roommate Finder</h2>
        <p className="chat-subtitle">
          Connect with others looking for roommates in dorms, leases, and apartments
        </p>

        <div className="chat-layout">
          {/* Room Tabs */}
          <div className="chat-rooms">
            {ROOMS.map(room => (
              <button
                key={room.id}
                className={`chat-room-btn${activeRoom === room.id ? ' active' : ''}`}
                onClick={() => setActiveRoom(room.id)}
              >
                <span className="room-label">{room.label}</span>
                <span className="room-desc">{room.description}</span>
              </button>
            ))}
          </div>

          {/* Message Area */}
          <div className="chat-window">
            <div className="chat-messages">
              {loading && <p className="chat-status">Loading messages…</p>}
              {error && <p className="chat-status chat-error">{error}</p>}
              {!loading && roomMessages.length === 0 && (
                <p className="chat-status chat-empty">
                  No messages yet — be the first to post in {ROOMS.find(r => r.id === activeRoom)?.label}!
                </p>
              )}
              {roomMessages.map(msg => (
                <div
                  key={msg.id}
                  className={`chat-message${user && msg.author_email === user.email ? ' own' : ''}`}
                >
                  <div className="chat-message-header">
                    {msg.author_picture && (
                      <img
                        src={msg.author_picture}
                        alt={msg.author_name}
                        className="chat-avatar"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <span className="chat-author">{msg.author_name}</span>
                    <span className="chat-author-email">{msg.author_email}</span>
                    <span className="chat-timestamp">
                      {new Date(msg.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="chat-message-body">{msg.text}</div>
                  {user && msg.author_email === user.email && (
                    deleteConfirm?.messageId === msg.id ? (
                      <div className="chat-delete-confirm">
                        <span>Delete this message?</span>
                        <button className="confirm-btn" onClick={confirmDelete}>Yes</button>
                        <button className="cancel-btn" onClick={() => setDeleteConfirm(null)}>No</button>
                      </div>
                    ) : (
                      <button
                        className="chat-delete-btn"
                        onClick={() => setDeleteConfirm({ messageId: msg.id })}
                        aria-label="Delete message"
                      >
                        🗑️
                      </button>
                    )
                  )}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            {user ? (
              <form className="chat-input-form" onSubmit={handleSend}>
                <input
                  className="chat-input"
                  type="text"
                  placeholder={`Message ${ROOMS.find(r => r.id === activeRoom)?.label}…`}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  disabled={sending}
                  maxLength={500}
                />
                <button className="chat-send-btn" type="submit" disabled={sending || !input.trim()}>
                  {sending ? '…' : 'Send'}
                </button>
              </form>
            ) : (
              <p className="chat-login-prompt">
                🔒 <strong>Sign in</strong> to send messages.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default RoommateChat;