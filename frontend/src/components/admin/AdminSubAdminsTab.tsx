import React, { useState } from 'react';
import {
  UserCheck,
  Shield,
  Plus,
  Trash2,
  Edit,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  DollarSign,
  Video,
  X,
  Lock,
  Mail,
  User as UserIcon,
} from 'lucide-react';
import { SubAdmin } from '../../types';

interface AdminSubAdminsTabProps {
  subAdminsList: SubAdmin[];
  onCreateSubAdmin: (data: {
    name: string;
    email: string;
    password: string;
    permissions: ('deposits' | 'withdrawals' | 'campaigns')[];
  }) => Promise<{ success: boolean; message?: string }>;
  onUpdateSubAdmin: (
    id: string,
    data: {
      name?: string;
      permissions?: ('deposits' | 'withdrawals' | 'campaigns')[];
      status?: 'active' | 'suspended';
      password?: string;
    }
  ) => Promise<{ success: boolean; message?: string }>;
  onDeleteSubAdmin: (id: string) => Promise<{ success: boolean; message?: string }>;
  actionNotice: { type: 'success' | 'error'; message: string } | null;
  setActionNotice: (val: { type: 'success' | 'error'; message: string } | null) => void;
}

export const AdminSubAdminsTab: React.FC<AdminSubAdminsTabProps> = ({
  subAdminsList,
  onCreateSubAdmin,
  onUpdateSubAdmin,
  onDeleteSubAdmin,
  setActionNotice,
}) => {
  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalSubAdmin, setEditModalSubAdmin] = useState<SubAdmin | null>(null);

  // Form states for creating sub-admin
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPermissions, setNewPermissions] = useState<('deposits' | 'withdrawals' | 'campaigns')[]>([
    'deposits',
    'withdrawals',
  ]);
  const [createLoading, setCreateLoading] = useState(false);

  // Form states for editing sub-admin
  const [editName, setEditName] = useState('');
  const [editPermissions, setEditPermissions] = useState<('deposits' | 'withdrawals' | 'campaigns')[]>([]);
  const [editNewPassword, setEditNewPassword] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // Action loading IDs
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const toggleCreatePermission = (perm: 'deposits' | 'withdrawals' | 'campaigns') => {
    setNewPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const toggleEditPermission = (perm: 'deposits' | 'withdrawals' | 'campaigns') => {
    setEditPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleOpenEdit = (subAdmin: SubAdmin) => {
    setEditModalSubAdmin(subAdmin);
    setEditName(subAdmin.name);
    setEditPermissions([...(subAdmin.adminPermissions || [])]);
    setEditNewPassword('');
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim() || !newPassword.trim()) {
      setActionNotice({ type: 'error', message: 'All fields (Name, Email, Password) are required.' });
      return;
    }
    if (newPermissions.length === 0) {
      setActionNotice({ type: 'error', message: 'Please select at least one module (Deposits, Withdrawals, or Campaigns).' });
      return;
    }

    setCreateLoading(true);
    const res = await onCreateSubAdmin({
      name: newName.trim(),
      email: newEmail.trim(),
      password: newPassword,
      permissions: newPermissions,
    });
    setCreateLoading(false);

    if (res.success) {
      setActionNotice({ type: 'success', message: res.message || 'Sub-admin created successfully!' });
      setCreateModalOpen(false);
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      setNewPermissions(['deposits', 'withdrawals']);
    } else {
      setActionNotice({ type: 'error', message: res.message || 'Failed to create sub-admin.' });
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalSubAdmin) return;
    if (editPermissions.length === 0) {
      setActionNotice({ type: 'error', message: 'Staff must be granted at least one module.' });
      return;
    }

    setEditLoading(true);
    const updatePayload: any = {
      name: editName.trim(),
      permissions: editPermissions,
    };
    if (editNewPassword.trim().length >= 6) {
      updatePayload.password = editNewPassword.trim();
    }

    const res = await onUpdateSubAdmin(editModalSubAdmin.id || (editModalSubAdmin as any)._id, updatePayload);
    setEditLoading(false);

    if (res.success) {
      setActionNotice({ type: 'success', message: res.message || 'Sub-admin permissions updated!' });
      setEditModalSubAdmin(null);
    } else {
      setActionNotice({ type: 'error', message: res.message || 'Failed to update sub-admin.' });
    }
  };

  const handleToggleStatus = async (subAdmin: SubAdmin) => {
    const id = subAdmin.id || (subAdmin as any)._id;
    const nextStatus = subAdmin.status === 'active' ? 'suspended' : 'active';
    const actionLabel = nextStatus === 'active' ? 'restore' : 'revoke';

    if (!window.confirm(`Are you sure you want to ${actionLabel} access for "${subAdmin.name}"?`)) {
      return;
    }

    setActionLoadingId(id);
    const res = await onUpdateSubAdmin(id, { status: nextStatus });
    setActionLoadingId(null);

    if (res.success) {
      setActionNotice({
        type: 'success',
        message: nextStatus === 'active'
          ? `Access restored for ${subAdmin.name}!`
          : `Access revoked for ${subAdmin.name}.`,
      });
    } else {
      setActionNotice({ type: 'error', message: res.message || 'Action failed.' });
    }
  };

  const handleDelete = async (subAdmin: SubAdmin) => {
    const id = subAdmin.id || (subAdmin as any)._id;
    if (!window.confirm(`Permanently remove sub-admin "${subAdmin.name}" (${subAdmin.email})? This action cannot be undone.`)) {
      return;
    }

    setActionLoadingId(id);
    const res = await onDeleteSubAdmin(id);
    setActionLoadingId(null);

    if (res.success) {
      setActionNotice({ type: 'success', message: res.message || `Sub-admin "${subAdmin.name}" deleted.` });
    } else {
      setActionNotice({ type: 'error', message: res.message || 'Failed to delete sub-admin.' });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Banner */}
      <div
        className="glass-card"
        style={{
          padding: '24px',
          borderRadius: 18,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
          border: '1.5px solid rgba(16, 185, 129, 0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
            }}
          >
            <UserCheck size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 className="font-display" style={{ fontSize: '1.25rem', color: '#0f172a', margin: 0 }}>
                SUB-ADMIN STAFF MANAGEMENT
              </h2>
              <span className="badge-pill badge-green" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                DELEGATED ACCESS
              </span>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 3 }}>
              Create operators with selective access to Deposits, Withdrawals, or Campaigns to manage workflows when Master Admin is offline.
            </div>
          </div>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="btn btn-neon glow-neon"
          style={{
            padding: '10px 18px',
            fontSize: '0.86rem',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontWeight: 700,
          }}
        >
          <Plus size={16} /> Create Sub-Admin
        </button>
      </div>

      {/* Sub-Admins Directory List */}
      <div className="glass-card" style={{ padding: '22px', borderRadius: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 className="font-display" style={{ fontSize: '1.05rem', color: '#0f172a', margin: 0 }}>
            DELEGATED OPERATORS ({subAdminsList.length})
          </h3>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
            Restricted staff accounts cannot view pricing rules, gateways, or user balances.
          </div>
        </div>

        {subAdminsList.length === 0 ? (
          <div
            style={{
              padding: '48px 20px',
              textAlign: 'center',
              color: '#64748b',
              background: '#f8fafc',
              borderRadius: 14,
              border: '1px dashed #cbd5e1',
            }}
          >
            <ShieldAlert size={36} style={{ color: '#94a3b8', margin: '0 auto 12px', display: 'block' }} />
            <div style={{ fontWeight: 700, fontSize: '1rem', color: '#334155' }}>No Sub-Admins Created Yet</div>
            <div style={{ fontSize: '0.84rem', marginTop: 4, maxWidth: 440, margin: '4px auto 16px' }}>
              Create a sub-admin account to delegate deposit verifications, payout approvals, or campaign moderation.
            </div>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="btn btn-outline"
              style={{ padding: '8px 16px', fontSize: '0.84rem', borderRadius: 10 }}
            >
              <Plus size={14} style={{ marginRight: 6 }} /> Add First Sub-Admin
            </button>
          </div>
        ) : (
          <div className="responsive-table-wrapper">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.74rem', fontWeight: 700 }}>Staff Member</th>
                  <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.74rem', fontWeight: 700 }}>Authorized Modules</th>
                  <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.74rem', fontWeight: 700 }}>Access Status</th>
                  <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.74rem', fontWeight: 700 }}>Created Date</th>
                  <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.74rem', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subAdminsList.map((subAdmin) => {
                  const id = subAdmin.id || (subAdmin as any)._id;
                  const isSuspended = subAdmin.status === 'suspended';
                  const perms = subAdmin.adminPermissions || [];

                  return (
                    <tr
                      key={id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        opacity: isSuspended ? 0.65 : 1,
                        transition: 'opacity 0.2s ease',
                      }}
                    >
                      {/* Staff Member */}
                      <td style={{ padding: '14px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <img
                            src={subAdmin.avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(subAdmin.email)}`}
                            alt={subAdmin.name}
                            style={{ width: 34, height: 34, borderRadius: '50%', background: '#f1f5f9' }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{subAdmin.name}</div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{subAdmin.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Authorized Modules */}
                      <td style={{ padding: '14px 12px' }}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {perms.includes('deposits') && (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                padding: '3px 8px',
                                borderRadius: 6,
                                background: '#ecfdf5',
                                color: '#047857',
                                fontSize: '0.74rem',
                                fontWeight: 700,
                                border: '1px solid #a7f3d0',
                              }}
                            >
                              <CreditCard size={12} /> Deposits
                            </span>
                          )}
                          {perms.includes('withdrawals') && (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                padding: '3px 8px',
                                borderRadius: 6,
                                background: '#f0f9ff',
                                color: '#0284c7',
                                fontSize: '0.74rem',
                                fontWeight: 700,
                                border: '1px solid #bae6fd',
                              }}
                            >
                              <DollarSign size={12} /> Withdrawals
                            </span>
                          )}
                          {perms.includes('campaigns') && (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                padding: '3px 8px',
                                borderRadius: 6,
                                background: '#faf5ff',
                                color: '#7c3aed',
                                fontSize: '0.74rem',
                                fontWeight: 700,
                                border: '1px solid #e9d5ff',
                              }}
                            >
                              <Video size={12} /> Campaigns
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 12px' }}>
                        {isSuspended ? (
                          <span
                            className="badge-pill"
                            style={{
                              background: '#fef2f2',
                              color: '#b91c1c',
                              border: '1px solid #fecaca',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                            }}
                          >
                            ACCESS REVOKED
                          </span>
                        ) : (
                          <span
                            className="badge-pill"
                            style={{
                              background: '#f0fdf4',
                              color: '#15803d',
                              border: '1px solid #bbf7d0',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                            }}
                          >
                            ACTIVE OPERATOR
                          </span>
                        )}
                      </td>

                      {/* Created Date */}
                      <td style={{ padding: '14px 12px', fontSize: '0.8rem', color: '#64748b' }}>
                        {subAdmin.createdAt ? new Date(subAdmin.createdAt).toLocaleDateString() : 'N/A'}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <button
                            onClick={() => handleOpenEdit(subAdmin)}
                            className="btn btn-ghost"
                            style={{ padding: '5px 10px', fontSize: '0.78rem', borderRadius: 8 }}
                            title="Edit assigned modules or change password"
                          >
                            <Edit size={14} style={{ marginRight: 4 }} /> Edit
                          </button>

                          <button
                            onClick={() => handleToggleStatus(subAdmin)}
                            disabled={actionLoadingId === id}
                            className="btn btn-ghost"
                            style={{
                              padding: '5px 10px',
                              fontSize: '0.78rem',
                              borderRadius: 8,
                              color: isSuspended ? '#059669' : '#d97706',
                              borderColor: isSuspended ? 'rgba(5, 150, 105, 0.3)' : 'rgba(217, 119, 6, 0.3)',
                            }}
                            title={isSuspended ? 'Restore operational access' : 'Temporarily revoke desk access'}
                          >
                            {isSuspended ? 'Restore' : 'Revoke'}
                          </button>

                          <button
                            onClick={() => handleDelete(subAdmin)}
                            disabled={actionLoadingId === id}
                            className="btn btn-ghost"
                            style={{
                              padding: '5px 8px',
                              fontSize: '0.78rem',
                              borderRadius: 8,
                              color: '#ef4444',
                              borderColor: 'rgba(239, 68, 68, 0.25)',
                            }}
                            title="Delete this sub-admin permanently"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE SUB-ADMIN MODAL */}
      {createModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 16,
          }}
        >
          <div
            className="glass-card"
            style={{
              maxWidth: 480,
              width: '100%',
              padding: '28px',
              borderRadius: 20,
              background: '#ffffff',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: '#ecfdf5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <UserCheck size={20} />
                </div>
                <div>
                  <h3 className="font-display" style={{ margin: 0, fontSize: '1.18rem', color: '#0f172a' }}>
                    Create Sub-Admin
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Assign staff credentials and operational modules.
                  </div>
                </div>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="btn btn-ghost"
                style={{ padding: 6, borderRadius: '50%' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="e.g. Sarah Support"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="input-field"
                    style={{ padding: '10px 14px 10px 36px', fontSize: '0.88rem', borderRadius: 10, width: '100%', boxSizing: 'border-box' }}
                    required
                  />
                  <UserIcon size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                  Staff Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    placeholder="e.g. sarah@ytcash.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="input-field"
                    style={{ padding: '10px 14px 10px 36px', fontSize: '0.88rem', borderRadius: 10, width: '100%', boxSizing: 'border-box' }}
                    required
                  />
                  <Mail size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                  Staff Password (min 6 characters)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    placeholder="Create a strong password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input-field"
                    style={{ padding: '10px 14px 10px 36px', fontSize: '0.88rem', borderRadius: 10, width: '100%', boxSizing: 'border-box' }}
                    required
                    minLength={6}
                  />
                  <Lock size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: 8 }}>
                  Delegated Modules Access
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {/* Deposits Checkbox */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 12px',
                      borderRadius: 10,
                      background: newPermissions.includes('deposits') ? '#f0fdf4' : '#f8fafc',
                      border: newPermissions.includes('deposits') ? '1.5px solid #86efac' : '1px solid #e2e8f0',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={newPermissions.includes('deposits')}
                      onChange={() => toggleCreatePermission('deposits')}
                      style={{ width: 16, height: 16, accentColor: '#10b981' }}
                    />
                    <div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>Deposits Desk</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Review, approve, and reject user ad budget deposits</div>
                    </div>
                  </label>

                  {/* Withdrawals Checkbox */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 12px',
                      borderRadius: 10,
                      background: newPermissions.includes('withdrawals') ? '#f0f9ff' : '#f8fafc',
                      border: newPermissions.includes('withdrawals') ? '1.5px solid #7dd3fc' : '1px solid #e2e8f0',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={newPermissions.includes('withdrawals')}
                      onChange={() => toggleCreatePermission('withdrawals')}
                      style={{ width: 16, height: 16, accentColor: '#0284c7' }}
                    />
                    <div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>Withdrawals Desk</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Inspect, approve, and disburse viewer & creator cashouts</div>
                    </div>
                  </label>

                  {/* Campaigns Checkbox */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 12px',
                      borderRadius: 10,
                      background: newPermissions.includes('campaigns') ? '#faf5ff' : '#f8fafc',
                      border: newPermissions.includes('campaigns') ? '1.5px solid #d8b4fe' : '1px solid #e2e8f0',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={newPermissions.includes('campaigns')}
                      onChange={() => toggleCreatePermission('campaigns')}
                      style={{ width: 16, height: 16, accentColor: '#9333ea' }}
                    />
                    <div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>Campaigns Desk</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Moderate video campaigns, pause, resume, cancel, or delete</div>
                    </div>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="btn btn-ghost"
                  style={{ flex: 1, padding: 10, borderRadius: 10 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="btn btn-neon glow-neon"
                  style={{ flex: 1, padding: 10, borderRadius: 10, fontWeight: 700 }}
                >
                  {createLoading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT SUB-ADMIN MODAL */}
      {editModalSubAdmin && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 16,
          }}
        >
          <div
            className="glass-card"
            style={{
              maxWidth: 480,
              width: '100%',
              padding: '28px',
              borderRadius: 20,
              background: '#ffffff',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: '#f0f9ff',
                    color: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Edit size={18} />
                </div>
                <div>
                  <h3 className="font-display" style={{ margin: 0, fontSize: '1.18rem', color: '#0f172a' }}>
                    Edit Sub-Admin
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    {editModalSubAdmin.email}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setEditModalSubAdmin(null)}
                className="btn btn-ghost"
                style={{ padding: 6, borderRadius: '50%' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="input-field"
                  style={{ padding: '10px 14px', fontSize: '0.88rem', borderRadius: 10, width: '100%', boxSizing: 'border-box' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                  Reset Password (Leave blank to keep current password)
                </label>
                <input
                  type="password"
                  placeholder="Enter new password (optional)"
                  value={editNewPassword}
                  onChange={(e) => setEditNewPassword(e.target.value)}
                  className="input-field"
                  style={{ padding: '10px 14px', fontSize: '0.88rem', borderRadius: 10, width: '100%', boxSizing: 'border-box' }}
                  minLength={6}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: 8 }}>
                  Delegated Modules Access
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 12px',
                      borderRadius: 10,
                      background: editPermissions.includes('deposits') ? '#f0fdf4' : '#f8fafc',
                      border: editPermissions.includes('deposits') ? '1.5px solid #86efac' : '1px solid #e2e8f0',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={editPermissions.includes('deposits')}
                      onChange={() => toggleEditPermission('deposits')}
                      style={{ width: 16, height: 16, accentColor: '#10b981' }}
                    />
                    <div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>Deposits Desk</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Review, approve, and reject user ad budget deposits</div>
                    </div>
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 12px',
                      borderRadius: 10,
                      background: editPermissions.includes('withdrawals') ? '#f0f9ff' : '#f8fafc',
                      border: editPermissions.includes('withdrawals') ? '1.5px solid #7dd3fc' : '1px solid #e2e8f0',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={editPermissions.includes('withdrawals')}
                      onChange={() => toggleEditPermission('withdrawals')}
                      style={{ width: 16, height: 16, accentColor: '#0284c7' }}
                    />
                    <div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>Withdrawals Desk</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Inspect, approve, and disburse viewer & creator cashouts</div>
                    </div>
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 12px',
                      borderRadius: 10,
                      background: editPermissions.includes('campaigns') ? '#faf5ff' : '#f8fafc',
                      border: editPermissions.includes('campaigns') ? '1.5px solid #d8b4fe' : '1px solid #e2e8f0',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={editPermissions.includes('campaigns')}
                      onChange={() => toggleEditPermission('campaigns')}
                      style={{ width: 16, height: 16, accentColor: '#9333ea' }}
                    />
                    <div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>Campaigns Desk</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Moderate video campaigns, pause, resume, cancel, or delete</div>
                    </div>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setEditModalSubAdmin(null)}
                  className="btn btn-ghost"
                  style={{ flex: 1, padding: 10, borderRadius: 10 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="btn btn-neon glow-neon"
                  style={{ flex: 1, padding: 10, borderRadius: 10, fontWeight: 700 }}
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
