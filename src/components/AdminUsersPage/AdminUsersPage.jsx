import { useState, useEffect, useCallback } from 'react';
import { getCurrentUser, getCredential } from '../../utils/auth';
import './AdminUsersPage.css';

const AVAILABLE_ROLES = ['user', 'admin'];

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function AdminUsersPage() {
  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.role === 'admin';

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  // Tracks the selected (uncommitted) role per user: { [userId]: role }
  const [pendingRoles, setPendingRoles] = useState({});
  // Tracks which user IDs are currently saving
  const [savingIds, setSavingIds] = useState(new Set());
  // Feedback message: { type: 'success' | 'error', text: string } | null
  const [feedback, setFeedback] = useState(null);

  const showFeedback = useCallback((type, text) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 3000);
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    const credential = getCredential();
    fetch(`${API_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${credential}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status}`);
        return res.json();
      })
      .then((data) => setUsers(data))
      .catch(() => showFeedback('error', 'Failed to load users.'))
      .finally(() => setLoading(false));
  }, [isAdmin, showFeedback]);

  const handleRoleChange = (userId, newRole) => {
    const user = users.find((u) => u.id === userId);
    if (newRole === user.role) {
      setPendingRoles((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    } else {
      setPendingRoles((prev) => ({ ...prev, [userId]: newRole }));
    }
  };

  const handleSaveRole = async (userId) => {
    const newRole = pendingRoles[userId];
    if (!newRole) return;

    const previousRole = users.find((u) => u.id === userId).role;

    setSavingIds((prev) => new Set(prev).add(userId));

    try {
      const credential = getCredential();
      const response = await fetch(`${API_URL}/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${credential}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      setPendingRoles((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
      showFeedback('success', `Role updated to "${newRole}" for user ${userId}.`);
    } catch {
      setPendingRoles((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
      showFeedback('error', `Failed to update role. Reverted to "${previousRole}".`);
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  if (!isAdmin) {
    return (
      <main className="admin-page">
        <div className="admin-container">
          <h1 className="admin-title">Access Denied</h1>
          <p className="admin-empty">You do not have permission to view this page.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <div className="admin-container">
        <h1 className="admin-title">User Management</h1>

        {feedback && (
          <div className={`admin-feedback admin-feedback-${feedback.type}`}>
            {feedback.text}
          </div>
        )}

        {loading ? (
          <p className="admin-empty">Loading users…</p>
        ) : users.length === 0 ? (
          <p className="admin-empty">No users found.</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const displayedRole = pendingRoles[user.id] ?? user.role;
                  const hasChange = user.id in pendingRoles;
                  const isSaving = savingIds.has(user.id);

                  return (
                    <tr key={user.id}>
                      <td>{user.email}</td>
                      <td>
                        <select
                          className={`admin-role-select admin-role-${displayedRole}`}
                          value={displayedRole}
                          disabled={isSaving}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        >
                          {AVAILABLE_ROLES.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="admin-save-btn"
                          disabled={!hasChange || isSaving}
                          onClick={() => handleSaveRole(user.id)}
                        >
                          {isSaving ? 'Saving…' : 'Save'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

export default AdminUsersPage;
