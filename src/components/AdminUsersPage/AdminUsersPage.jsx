import { useState, useCallback } from 'react';
import './AdminUsersPage.css';

// Mock data — replace with API calls once the backend is implemented
const MOCK_USERS = [
  { id: 1, email: 'admin@ucsb.edu', role: 'admin', createdAt: '2026-01-10' },
  { id: 2, email: 'johndoe@ucsb.edu', role: 'user', createdAt: '2026-01-15' },
  { id: 3, email: 'alicebob@ucsb.edu', role: 'admin', createdAt: '2026-02-01' },
];

const AVAILABLE_ROLES = ['user', 'admin'];

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Hardcoded for now — will come from auth once backend exists
const isAdmin = true;

function AdminUsersPage() {
  const [users, setUsers] = useState(MOCK_USERS);
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

  const handleRoleChange = (userId, newRole) => {
    const user = users.find((u) => u.id === userId);
    if (newRole === user.role) {
      // Reset to original — no pending change
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
      // TODO: replace with real endpoint once backend is ready
      const response = await fetch(`${API_URL}/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      // Success — commit the new role into the users list
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
      // Error — revert dropdown to previous value
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

        {users.length === 0 ? (
          <p className="admin-empty">No users found.</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created Date</th>
                  {isAdmin && <th>Actions</th>}
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
                          disabled={!isAdmin || isSaving}
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
                      {isAdmin && (
                        <td>
                          <button
                            className="admin-save-btn"
                            disabled={!hasChange || isSaving}
                            onClick={() => handleSaveRole(user.id)}
                          >
                            {isSaving ? 'Saving…' : 'Save'}
                          </button>
                        </td>
                      )}
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
