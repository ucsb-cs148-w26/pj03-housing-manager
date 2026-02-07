import { useState } from 'react';
import './AdminUsersPage.css';

// Mock data — replace with API calls once the backend is implemented
const MOCK_USERS = [
  { id: 1, email: 'admin@ucsb.edu', role: 'admin', createdAt: '2026-01-10' },
  { id: 2, email: 'johndoe@ucsb.edu', role: 'user', createdAt: '2026-01-15' },
  { id: 3, email: 'alicebob@ucsb.edu', role: 'admin', createdAt: '2026-02-01' },
];

// Hardcoded for now — will come from auth once backend exists
const isAdmin = true;

function AdminUsersPage() {
  const [users] = useState(MOCK_USERS);

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
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.email}</td>
                    <td>
                      <span className={`admin-role-badge admin-role-${user.role}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

export default AdminUsersPage;
