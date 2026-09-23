import React from 'react';
import { Search } from 'lucide-react';
import { User } from '../../types';
import { AdminPagination } from './AdminPagination';

export type UserFilterType = 'all' | 'active' | 'banned' | 'viewer' | 'campaigner';

interface AdminUsersTabProps {
  usersList: User[];
  userSearch: string;
  setUserSearch: (term: string) => void;
  userFilter?: UserFilterType;
  setUserFilter?: (filter: UserFilterType) => void;
  userPage: number;
  setUserPage: (page: number) => void;
  pageSize: number;
  onToggleUserBan: (user: User) => void;
  onResetUserDevice?: (user: User) => void;
  isMasterAdmin?: boolean;
}

export const AdminUsersTab: React.FC<AdminUsersTabProps> = ({
  usersList,
  userSearch,
  setUserSearch,
  userFilter = 'all',
  setUserFilter,
  userPage,
  setUserPage,
  pageSize,
  onToggleUserBan,
  onResetUserDevice,
  isMasterAdmin = true,
}) => {
  const [internalFilter, setInternalFilter] = React.useState<UserFilterType>('all');
  const activeFilter = setUserFilter ? userFilter : internalFilter;
  const handleFilterChange = (f: UserFilterType) => {
    if (setUserFilter) setUserFilter(f);
    else setInternalFilter(f);
    setUserPage(1);
  };

  const nonAdminUsers = React.useMemo(() => usersList.filter((u) => u.role !== 'admin'), [usersList]);

  const getFilteredByStatus = (u: User, filter: UserFilterType): boolean => {
    if (u.role === 'admin') return false;
    if (filter === 'all') return true;
    if (filter === 'active') return !u.status || u.status === 'active';
    if (filter === 'banned') return u.status === 'banned' || u.status === 'suspended';
    if (filter === 'viewer') return u.role === 'viewer';
    if (filter === 'campaigner') return u.role === 'campaigner';
    return true;
  };

  const filteredUsers = nonAdminUsers.filter((u) => {
    if (!getFilteredByStatus(u, activeFilter)) return false;
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q))
    );
  });

  const filterTabs: { id: UserFilterType; label: string }[] = [
    { id: 'all', label: 'ALL' },
    { id: 'banned', label: 'BANNED' },
    { id: 'viewer', label: 'VIEWERS' },
    { id: 'campaigner', label: 'CREATORS' },
  ];

  const pageSlice = filteredUsers.slice((userPage - 1) * pageSize, userPage * pageSize);

  return (
    <div className="glass-card" style={{ padding: '22px', borderRadius: 18 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 className="font-display" style={{ fontSize: 'clamp(1.1rem, 4vw, 1.35rem)', color: '#0f172a', margin: 0 }}>
            USER DIRECTORY ({nonAdminUsers.length})
          </h2>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>
            Manage registered viewers, creators, balances, and security status.
          </div>
        </div>

        {/* Sub-Filter Tabs & Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', width: '100%' }}>
          {/* Touch-Scrollable Sub-Filter Pills */}
          <div
            className="admin-filter-pills"
            style={{ display: 'flex', flexWrap: 'wrap', gap: 6, background: '#f1f5f9', padding: 4, borderRadius: 12, maxWidth: '100%', flex: 1 }}
          >
            {filterTabs.map((tab) => {
              const isSelected = activeFilter === tab.id;
              const count = nonAdminUsers.filter((u) => getFilteredByStatus(u, tab.id)).length;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleFilterChange(tab.id)}
                  style={{
                    padding: '6px 14px', fontSize: '0.8rem', fontWeight: 700, borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: isSelected ? '#ffffff' : 'transparent',
                    color: isSelected ? 'var(--primary-neon)' : '#64748b',
                    boxShadow: isSelected ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                    textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0, whiteSpace: 'nowrap',
                  }}
                >
                  <span>{tab.label}</span>
                  <span style={{ fontSize: '0.72rem', opacity: 0.75 }}>({count})</span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative', width: '100%', maxWidth: 280 }}>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={userSearch}
              onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }}
              className="input-field"
              style={{ padding: '7px 12px 7px 32px', fontSize: '0.82rem', borderRadius: 8, width: '100%', boxSizing: 'border-box' }}
            />
            <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: '#94a3b8' }} />
          </div>
        </div>
      </div>

      {!filteredUsers.length ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '0.92rem' }}>
          No {activeFilter !== 'all' ? activeFilter : ''} users found.
        </div>
      ) : (
        <>
          {/* ── DESKTOP TABLE ── */}
          <div className="desktop-only-table responsive-table-wrapper">
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
                {pageSlice.map((u) => {
                  const isBanned = u.status === 'banned' || u.status === 'suspended';
                  return (
                    <tr key={u.id || (u as any)._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{u.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{u.email}</div>
                        {u.activeMobileDeviceId && (
                          <div style={{ marginTop: 4 }}>
                            <span
                              className="badge-pill"
                              style={{
                                background: '#f0fdf4',
                                color: '#15803d',
                                border: '1px solid #bbf7d0',
                                fontSize: '0.68rem',
                                padding: '1px 6px',
                                fontWeight: 600,
                              }}
                              title={`Device ID: ${u.activeMobileDeviceId}`}
                            >
                              📱 {u.activeMobileDeviceModel || 'Mobile Device'}
                            </span>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span
                          className="badge-pill"
                          style={{
                            padding: '2px 8px', fontSize: '0.72rem', textTransform: 'uppercase',
                            background: u.role === 'campaigner' ? '#e0f2fe' : '#f0fdf4',
                            color: u.role === 'campaigner' ? '#0369a1' : '#15803d',
                            border: `1px solid ${u.role === 'campaigner' ? 'rgba(3, 105, 161, 0.25)' : 'rgba(21, 128, 61, 0.25)'}`,
                            fontWeight: 700,
                          }}
                        >
                          {u.role === 'campaigner' ? 'Creator' : 'Viewer'}
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
                          className="badge-pill"
                          style={{
                            padding: '2px 8px', fontSize: '0.72rem', textTransform: 'uppercase',
                            background: isBanned ? '#fef2f2' : '#ecfdf5',
                            color: isBanned ? '#ef4444' : '#059669',
                            border: `1px solid ${isBanned ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                            fontWeight: 700,
                          }}
                        >
                          {u.status || 'active'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                          {onResetUserDevice && isMasterAdmin && u.activeMobileDeviceId && (
                            <button
                              onClick={() => onResetUserDevice(u)}
                              className="btn btn-ghost"
                              title="Unlock mobile session so user can log in on another phone"
                              style={{
                                padding: '4px 8px', fontSize: '0.74rem', borderRadius: 6,
                                color: '#b45309',
                                background: '#fef3c7',
                                border: '1px solid #fde68a',
                                fontWeight: 600,
                              }}
                            >
                              🔓 Reset Device
                            </button>
                          )}
                          <button
                            onClick={() => onToggleUserBan(u)}
                            className="btn btn-ghost"
                            style={{
                              padding: '4px 10px', fontSize: '0.76rem', borderRadius: 6,
                              color: isBanned ? '#059669' : '#ef4444',
                              background: isBanned ? '#ecfdf5' : '#fef2f2',
                              border: `1px solid ${isBanned ? '#a7f3d0' : '#fecaca'}`,
                              fontWeight: 600,
                            }}
                          >
                            {isBanned ? 'Unban' : 'Ban'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── MOBILE CARD LIST ── */}
          <div className="mobile-card-list">
            {pageSlice.map((u) => {
              const isBanned = u.status === 'banned' || u.status === 'suspended';
              return (
                <div key={u.id || (u as any)._id} className="mobile-data-card">
                  {/* Row 1: Name + Role badge */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>{u.name}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{u.email}</div>
                      {u.activeMobileDeviceId && (
                        <div style={{ marginTop: 4 }}>
                          <span
                            className="badge-pill"
                            style={{
                              background: '#f0fdf4',
                              color: '#15803d',
                              border: '1px solid #bbf7d0',
                              fontSize: '0.68rem',
                              padding: '1px 6px',
                              fontWeight: 600,
                            }}
                          >
                            📱 {u.activeMobileDeviceModel || 'Mobile Device'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                      <span
                        className="badge-pill"
                        style={{
                          padding: '2px 8px', fontSize: '0.7rem', textTransform: 'uppercase',
                          background: u.role === 'campaigner' ? '#e0f2fe' : '#f0fdf4',
                          color: u.role === 'campaigner' ? '#0369a1' : '#15803d',
                          border: `1px solid ${u.role === 'campaigner' ? 'rgba(3,105,161,0.25)' : 'rgba(21,128,61,0.25)'}`,
                          fontWeight: 700,
                        }}
                      >
                        {u.role === 'campaigner' ? 'Creator' : 'Viewer'}
                      </span>
                      <span
                        className="badge-pill"
                        style={{
                          padding: '2px 8px', fontSize: '0.7rem', textTransform: 'uppercase',
                          background: isBanned ? '#fef2f2' : '#ecfdf5',
                          color: isBanned ? '#ef4444' : '#059669',
                          border: `1px solid ${isBanned ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`,
                          fontWeight: 700,
                        }}
                      >
                        {u.status || 'active'}
                      </span>
                    </div>
                  </div>

                  {/* Row 2: Balance + Earned */}
                  <div style={{ display: 'flex', gap: 16, fontSize: '0.82rem' }}>
                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.73rem' }}>Balance </span>
                      <span className="font-mono" style={{ fontWeight: 700, color: 'var(--primary-neon)' }}>${(u.balance || 0).toFixed(4)}</span>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.73rem' }}>Earned </span>
                      <span className="font-mono" style={{ fontWeight: 700, color: '#059669' }}>${(u.totalEarned || 0).toFixed(4)}</span>
                    </div>
                  </div>

                  {/* Row 3: Actions */}
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    {onResetUserDevice && isMasterAdmin && u.activeMobileDeviceId && (
                      <button
                        onClick={() => onResetUserDevice(u)}
                        className="btn btn-ghost"
                        style={{
                          flex: 1, padding: '7px', fontSize: '0.8rem', borderRadius: 8, textAlign: 'center',
                          color: '#b45309',
                          background: '#fef3c7',
                          border: '1px solid #fde68a',
                          fontWeight: 700,
                        }}
                      >
                        🔓 Reset Device
                      </button>
                    )}
                    <button
                      onClick={() => onToggleUserBan(u)}
                      className="btn btn-ghost"
                      style={{
                        flex: 1, padding: '7px', fontSize: '0.8rem', borderRadius: 8, textAlign: 'center',
                        color: isBanned ? '#059669' : '#ef4444',
                        background: isBanned ? '#ecfdf5' : '#fef2f2',
                        border: `1px solid ${isBanned ? '#a7f3d0' : '#fecaca'}`,
                        fontWeight: 700,
                      }}
                    >
                      {isBanned ? '✅ Unban User' : '🚫 Ban User'}
                    </button>
                  </div>
                </div>
              );
            })}
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
