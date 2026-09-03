import React, { useState, useEffect } from 'react';
import { Shield, Users, Video, DollarSign, CheckCircle2, XCircle, Activity, RefreshCw } from 'lucide-react';
import { User, Campaign, Payout } from '../types';
import { apiRequest } from '../api';

interface AdminPortalProps {
  user: User | null;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ user }) => {
  const [stats, setStats] = useState<any>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [campaignsList, setCampaignsList] = useState<Campaign[]>([]);
  const [payoutsList, setPayoutsList] = useState<Payout[]>([]);
  const [activeSection, setActiveSection] = useState<'payouts' | 'users' | 'campaigns'>('payouts');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const fetchAdminData = async () => {
    const [statsRes, usersRes, campRes, payRes] = await Promise.all([
      apiRequest<any>('/admin/stats'),
      apiRequest<User[]>('/admin/users'),
      apiRequest<Campaign[]>('/admin/campaigns'),
      apiRequest<Payout[]>('/admin/payouts'),
    ]);

    if (statsRes.success) setStats(statsRes.data);
    if (usersRes.success) setUsersList(usersRes.data || []);
    if (campRes.success) setCampaignsList(campRes.data || []);
    if (payRes.success) setPayoutsList(payRes.data || []);
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleApprovePayout = async (payoutId: string) => {
    const txnRef = prompt('Enter Bank / MFS / Crypto Transaction ID for disbursement confirmation:');
    if (!txnRef) return;

    const res = await apiRequest(`/admin/payouts/${payoutId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ transactionRef: txnRef }),
    });

    if (res.success) {
      setActionNotice(`Payout ${payoutId} approved and marked complete.`);
      fetchAdminData();
    }
  };

  const handleRejectPayout = async (payoutId: string) => {
    const reason = prompt('Enter reason for rejecting this payout (funds will be refunded to user):');
    if (!reason) return;

    const res = await apiRequest(`/admin/payouts/${payoutId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ adminNotes: reason }),
    });

    if (res.success) {
      setActionNotice(`Payout ${payoutId} rejected and balance refunded to user.`);
      fetchAdminData();
    }
  };

  const handleToggleUserBan = async (u: User) => {
    const newStatus = u.status === 'banned' ? 'active' : 'banned';
    const res = await apiRequest(`/admin/users/${u.id || (u as any)._id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.success) {
      setActionNotice(`User ${u.email} status changed to ${newStatus}.`);
      fetchAdminData();
    }
  };

  const handleToggleCampaign = async (c: Campaign) => {
    const newStatus = c.status === 'active' ? 'paused' : 'active';
    const res = await apiRequest(`/admin/campaigns/${c._id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.success) {
      setActionNotice(`Campaign ${c.title} status changed to ${newStatus}.`);
      fetchAdminData();
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div style={{ maxWidth: 800, margin: '60px auto', padding: 24, textAlign: 'center' }}>
        <Shield size={48} color="var(--primary-neon)" style={{ margin: '0 auto 16px' }} />
        <h2 className="font-display" style={{ fontSize: '2rem' }}>Admin Authentication Required</h2>
        <p style={{ color: 'var(--on-surface-variant)', marginTop: 8 }}>
          Please use the "Admin" button in the top right to switch to the admin demo account.
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1350, margin: '30px auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div className="badge-pill badge-cyan" style={{ marginBottom: 8 }}>
            ● Super Admin Control Surface
          </div>
          <h1 className="font-display" style={{ fontSize: '2.8rem', letterSpacing: '0.01em', color: '#ffffff' }}>
            OPERATIONS <span style={{ color: 'var(--secondary-cyan)' }}>CONTROL DESK</span>
          </h1>
          <p className="font-body" style={{ color: 'var(--on-surface-variant)', marginTop: 4 }}>
            System operations, 4,000–5,000 concurrent load monitor, withdrawal approval desk, and campaign moderation.
          </p>
        </div>

        <button onClick={fetchAdminData} className="btn btn-ghost" style={{ padding: '8px 18px', fontSize: '0.8rem' }}>
          <RefreshCw size={14} /> Refresh Telemetry
        </button>
      </div>

      {actionNotice && (
        <div className="glass-card" style={{ padding: '12px 18px', borderLeft: '4px solid var(--primary-neon)', background: 'rgba(195,244,0,0.1)', color: 'var(--primary-neon)' }}>
          {actionNotice}
        </div>
      )}

      {/* Real-Time Telemetry & Concurrency Row */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}>
          <div className="glass-card" style={{ padding: 22, border: '1px solid rgba(195,244,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--on-surface-variant)', fontSize: '0.8rem' }}>
              <span className="font-mono">Live Concurrency</span>
              <Activity size={18} color="var(--primary-neon)" />
            </div>
            <div className="font-mono" style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary-neon)', marginTop: 8 }}>
              {stats.simulatedConcurrency?.toLocaleString() || '4,280'}
            </div>
            <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginTop: 4 }}>
              Active Viewers in BullMQ Queue
            </div>
          </div>

          <div className="glass-card" style={{ padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--on-surface-variant)', fontSize: '0.8rem' }}>
              <span className="font-mono">Registered Users</span>
              <Users size={18} color="var(--secondary-cyan)" />
            </div>
            <div className="font-mono" style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', marginTop: 8 }}>
              {stats.totalUsers || 0}
            </div>
            <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginTop: 4 }}>
              Campaigners + Viewers
            </div>
          </div>

          <div className="glass-card" style={{ padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--on-surface-variant)', fontSize: '0.8rem' }}>
              <span className="font-mono">Delivered Views</span>
              <Video size={18} color="#b7f648" />
            </div>
            <div className="font-mono" style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', marginTop: 8 }}>
              {stats.totalViewsDelivered || 0}
            </div>
            <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginTop: 4 }}>
              Across {stats.activeCampaigns || 0} Active Campaigns
            </div>
          </div>

          <div className="glass-card" style={{ padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--on-surface-variant)', fontSize: '0.8rem' }}>
              <span className="font-mono">Pending Withdrawals</span>
              <DollarSign size={18} color="var(--accent-amber)" />
            </div>
            <div className="font-mono" style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-amber)', marginTop: 8 }}>
              {stats.pendingPayoutsCount || 0}
            </div>
            <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginTop: 4 }}>
              Requires Admin Disbursement
            </div>
          </div>
        </div>
      )}

      {/* Sub-Navigation */}
      <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid var(--glass-stroke)', paddingBottom: 12 }}>
        <button
          onClick={() => setActiveSection('payouts')}
          className="btn"
          style={{
            padding: '8px 20px',
            borderRadius: 9999,
            background: activeSection === 'payouts' ? 'var(--secondary-cyan)' : 'transparent',
            color: activeSection === 'payouts' ? '#003642' : 'var(--on-surface-variant)',
            border: activeSection === 'payouts' ? '1px solid var(--secondary-cyan)' : '1px solid transparent',
          }}
        >
          Withdrawal Desk ({payoutsList.filter((p) => p.status === 'pending').length} Pending)
        </button>

        <button
          onClick={() => setActiveSection('campaigns')}
          className="btn"
          style={{
            padding: '8px 20px',
            borderRadius: 9999,
            background: activeSection === 'campaigns' ? 'var(--secondary-cyan)' : 'transparent',
            color: activeSection === 'campaigns' ? '#003642' : 'var(--on-surface-variant)',
            border: activeSection === 'campaigns' ? '1px solid var(--secondary-cyan)' : '1px solid transparent',
          }}
        >
          Campaign Moderation ({campaignsList.length})
        </button>

        <button
          onClick={() => setActiveSection('users')}
          className="btn"
          style={{
            padding: '8px 20px',
            borderRadius: 9999,
            background: activeSection === 'users' ? 'var(--secondary-cyan)' : 'transparent',
            color: activeSection === 'users' ? '#003642' : 'var(--on-surface-variant)',
            border: activeSection === 'users' ? '1px solid var(--secondary-cyan)' : '1px solid transparent',
          }}
        >
          User Accounts ({usersList.length})
        </button>
      </div>

      {/* SECTION 1: WITHDRAWAL APPROVAL DESK */}
      {activeSection === 'payouts' && (
        <div className="glass-card" style={{ padding: 28 }}>
          <h2 className="font-display" style={{ fontSize: '1.6rem', marginBottom: 20, color: '#ffffff' }}>
            Manual Payout Requests (bKash / Nagad / Crypto / FaucetPay / WebMoney)
          </h2>
          {!payoutsList.length ? (
            <p style={{ color: 'var(--on-surface-variant)' }}>No payout requests currently queued.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--glass-stroke)', textAlign: 'left', color: 'var(--on-surface-variant)' }}>
                    <th className="font-mono" style={{ padding: '12px' }}>Viewer</th>
                    <th className="font-mono" style={{ padding: '12px' }}>Method</th>
                    <th className="font-mono" style={{ padding: '12px' }}>Amount</th>
                    <th className="font-mono" style={{ padding: '12px' }}>Recipient Details</th>
                    <th className="font-mono" style={{ padding: '12px' }}>Status</th>
                    <th className="font-mono" style={{ padding: '12px' }}>Requested</th>
                    <th className="font-mono" style={{ padding: '12px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payoutsList.map((p) => (
                    <tr key={p._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '14px', fontWeight: 600 }}>{p.viewerId?.email || 'Viewer'}</td>
                      <td style={{ padding: '14px' }}>
                        <span className="badge-pill badge-cyan">
                          {p.method}
                        </span>
                      </td>
                      <td className="font-mono" style={{ padding: '14px', fontWeight: 800, color: 'var(--primary-neon)' }}>
                        ${p.amount.toFixed(2)}
                      </td>
                      <td className="font-mono" style={{ padding: '14px', fontSize: '0.8rem' }}>
                        {p.accountDetails}
                      </td>
                      <td className="font-mono" style={{ padding: '14px' }}>
                        <span
                          style={{
                            fontWeight: 700,
                            color:
                              p.status === 'approved'
                                ? 'var(--primary-neon)'
                                : p.status === 'pending'
                                ? 'var(--accent-amber)'
                                : '#ef4444',
                          }}
                        >
                          {p.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="font-mono" style={{ padding: '14px', color: 'var(--on-surface-variant)', fontSize: '0.8rem' }}>
                        {new Date(p.requestedAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '14px' }}>
                        {p.status === 'pending' ? (
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              onClick={() => handleApprovePayout(p._id)}
                              className="btn btn-neon"
                              style={{ padding: '6px 14px', fontSize: '0.725rem' }}
                            >
                              <CheckCircle2 size={13} /> Approve
                            </button>
                            <button
                              onClick={() => handleRejectPayout(p._id)}
                              className="btn btn-ghost"
                              style={{ padding: '6px 14px', fontSize: '0.725rem', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}
                            >
                              <XCircle size={13} /> Reject & Refund
                            </button>
                          </div>
                        ) : (
                          <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>{p.transactionRef || 'Settled'}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: CAMPAIGNS MODERATION */}
      {activeSection === 'campaigns' && (
        <div className="glass-card" style={{ padding: 28 }}>
          <h2 className="font-display" style={{ fontSize: '1.6rem', marginBottom: 20, color: '#ffffff' }}>
            All Video Campaigns ({campaignsList.length})
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-stroke)', textAlign: 'left', color: 'var(--on-surface-variant)' }}>
                  <th className="font-mono" style={{ padding: '12px' }}>Video</th>
                  <th className="font-mono" style={{ padding: '12px' }}>Duration</th>
                  <th className="font-mono" style={{ padding: '12px' }}>Views Progress</th>
                  <th className="font-mono" style={{ padding: '12px' }}>Total Cost</th>
                  <th className="font-mono" style={{ padding: '12px' }}>Status</th>
                  <th className="font-mono" style={{ padding: '12px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {campaignsList.map((c) => (
                  <tr key={c._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img
                          src={c.thumbnailUrl || `https://img.youtube.com/vi/${c.videoId}/hqdefault.jpg`}
                          alt="thumb"
                          style={{ width: 64, height: 40, objectFit: 'cover', borderRadius: 8 }}
                        />
                        <div>
                          <div style={{ fontWeight: 600 }}>{c.title}</div>
                          <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>ID: {c.videoId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="font-mono" style={{ padding: '14px' }}>{c.watchDurationSec}s</td>
                    <td className="font-mono" style={{ padding: '14px', fontWeight: 600 }}>
                      {c.viewsDelivered} / {c.targetViews}
                    </td>
                    <td className="font-mono" style={{ padding: '14px' }}>${c.totalCost.toFixed(2)}</td>
                    <td style={{ padding: '14px' }}>
                      <span className="badge-pill" style={{ background: c.status === 'active' ? 'rgba(195,244,0,0.15)' : 'rgba(255,255,255,0.05)', color: c.status === 'active' ? 'var(--primary-neon)' : 'var(--on-surface-variant)' }}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <button
                        onClick={() => handleToggleCampaign(c)}
                        className="btn btn-ghost"
                        style={{ padding: '6px 14px', fontSize: '0.75rem' }}
                      >
                        {c.status === 'active' ? 'Force Pause' : 'Resume'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 3: USERS DESK */}
      {activeSection === 'users' && (
        <div className="glass-card" style={{ padding: 28 }}>
          <h2 className="font-display" style={{ fontSize: '1.6rem', marginBottom: 20, color: '#ffffff' }}>
            Registered Users ({usersList.length})
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-stroke)', textAlign: 'left', color: 'var(--on-surface-variant)' }}>
                  <th className="font-mono" style={{ padding: '12px' }}>User</th>
                  <th className="font-mono" style={{ padding: '12px' }}>Role</th>
                  <th className="font-mono" style={{ padding: '12px' }}>Balance</th>
                  <th className="font-mono" style={{ padding: '12px' }}>Status</th>
                  <th className="font-mono" style={{ padding: '12px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((u) => (
                  <tr key={u.id || (u as any)._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '14px' }}>
                      <div style={{ fontWeight: 600 }}>{u.name}</div>
                      <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>{u.email}</div>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <span className="badge-pill" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        {u.role}
                      </span>
                    </td>
                    <td className="font-mono" style={{ padding: '14px', fontWeight: 700, color: 'var(--primary-neon)' }}>
                      ${(u.balance || 0).toFixed(4)}
                    </td>
                    <td className="font-mono" style={{ padding: '14px' }}>
                      <span style={{ color: u.status === 'banned' ? '#ef4444' : 'var(--primary-neon)', fontWeight: 600 }}>
                        {u.status || 'active'}
                      </span>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <button
                        onClick={() => handleToggleUserBan(u)}
                        className="btn btn-ghost"
                        style={{
                          padding: '6px 14px',
                          fontSize: '0.75rem',
                          color: u.status === 'banned' ? 'var(--primary-neon)' : '#ef4444',
                        }}
                      >
                        {u.status === 'banned' ? 'Unban User' : 'Ban User'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
