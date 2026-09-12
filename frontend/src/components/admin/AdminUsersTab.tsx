import React from 'react';
import { Search } from 'lucide-react';
import { User } from '../../types';
import { AdminPagination } from './AdminPagination';

interface AdminUsersTabProps {
  usersList: User[];
  userSearch: string;
  setUserSearch: (term: string) => void;
  userPage: number;
  setUserPage: (page: number) => void;
  pageSize: number;
  onToggleUserBan: (user: User) => void;
}

export const AdminUsersTab: React.FC<AdminUsersTabProps> = ({
  usersList,
  userSearch,
  setUserSearch,
  userPage,
  setUserPage,
  pageSize,
  onToggleUserBan,
}) => {
  const filteredUsers = usersList.filter((u) => {
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q))
    );
  });

  return (
    <div className="glass-card" style={{ padding: '22px', borderRadius: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 className="font-display" style={{ fontSize: '1.35rem', color: '#0f172a', margin: 0 }}>
            USER DIRECTORY ({usersList.length})
          </h2>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>
            Manage registered viewers, campaigners, and balance standing.
          </div>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: 240 }}>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={userSearch}
            onChange={(e) => {
              setUserSearch(e.target.value);
              setUserPage(1);
            }}
            className="input-field"
            style={{ padding: '7px 12px 7px 32px', fontSize: '0.82rem', borderRadius: 8 }}
          />
          <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: '#94a3b8' }} />
        </div>
      </div>

      {!filteredUsers.length ? (
        <div style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>No users found.</div>
      ) : (
        <>
          <div className="responsive-table-wrapper">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.76rem', fontWeight: 700 }}>User</th>
                  <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.76rem', fontWeight: 700 }}>Role</th>
                  <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.76rem', fontWeight: 700 }}>Balance</th>
                  <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.76rem', fontWeight: 700 }}>Total Earned</th>
                  <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.76rem', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.76rem', fontWeight: 700, textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers
                  .slice((userPage - 1) * pageSize, userPage * pageSize)
                  .map((u) => (
                    <tr key={u.id || (u as any)._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{u.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{u.email}</div>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span className="badge-pill badge-cyan" style={{ padding: '2px 8px', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                          {u.role}
                        </span>
                      </td>
                      <td className="font-mono" style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--primary-neon)' }}>
                        ${(u.balance || 0).toFixed(4)}
                      </td>
                      <td className="font-mono" style={{ padding: '10px 12px', color: '#059669', fontWeight: 600 }}>
                        ${(u.totalEarned || 0).toFixed(4)}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span
                          style={{
                            color: u.status === 'banned' ? '#ef4444' : '#059669',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            textTransform: 'uppercase',
                          }}
                        >
                          {u.status || 'active'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                        <button
                          onClick={() => onToggleUserBan(u)}
                          className="btn btn-ghost"
                          style={{
                            padding: '4px 10px',
                            fontSize: '0.76rem',
                            borderRadius: 6,
                            color: u.status === 'banned' ? 'var(--primary-neon)' : '#ef4444',
                          }}
                        >
                          {u.status === 'banned' ? 'Unban' : 'Ban'}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <AdminPagination
            currentPage={userPage}
            totalPages={Math.ceil(filteredUsers.length / pageSize) || 1}
            totalItems={filteredUsers.length}
            pageSize={pageSize}
            onPageChange={setUserPage}
            itemLabel="users"
          />
        </>
      )}
    </div>
  );
};
