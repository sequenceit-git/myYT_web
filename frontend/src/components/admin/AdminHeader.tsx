import React from 'react';
import {
  Shield,
  RefreshCw,
  LogOut,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  DollarSign,
  CreditCard,
  Video,
  Users,
  Sliders,
  Wallet,
  Smartphone,
  UserCheck,
} from 'lucide-react';
import { AdminTab } from './adminTypes';
import { User } from '../../types';

interface AdminHeaderProps {
  stats: any;
  dataLoading: boolean;
  actionNotice: { type: 'success' | 'error'; message: string } | null;
  setActionNotice: (val: { type: 'success' | 'error'; message: string } | null) => void;
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  pendingPayoutsCount: number;
  pendingDepositsCount: number;
  campaignsCount: number;
  usersCount: number;
  subAdminsCount?: number;
  phoneAppUsersCount?: number;
  currentUser?: User | null;
  onRefresh: () => void;
  onLogout: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  stats,
  dataLoading,
  actionNotice,
  setActionNotice,
  activeTab,
  setActiveTab,
  pendingPayoutsCount,
  pendingDepositsCount,
  campaignsCount,
  usersCount,
  subAdminsCount = 0,
  phoneAppUsersCount = 0,
  currentUser,
  onRefresh,
  onLogout,
}) => {
  const isMasterAdmin = !currentUser?.adminRole || currentUser.adminRole === 'master';
  const subAdminPermissions = currentUser?.adminPermissions || [];

  const masterTabs: {
    id: AdminTab;
    label: string;
    icon: React.ReactNode;
    badge?: React.ReactNode;
  }[] = [
    {
      id: 'overview',
      label: 'Overview & KPIs',
      icon: <BarChart3 size={15} />,
    },
    {
      id: 'payouts',
      label: 'Withdrawals',
      icon: <DollarSign size={15} />,
      badge: pendingPayoutsCount > 0 ? (
        <span
          style={{
            background: activeTab === 'payouts' ? '#ffffff' : '#d97706',
            color: activeTab === 'payouts' ? '#0284c7' : '#ffffff',
            padding: '1px 6px',
            borderRadius: 9999,
            fontSize: '0.68rem',
            fontWeight: 800,
          }}
        >
          {pendingPayoutsCount}
        </span>
      ) : null,
    },
    {
      id: 'deposits',
      label: 'Deposits',
      icon: <CreditCard size={15} />,
      badge: pendingDepositsCount > 0 ? (
        <span
          style={{
            background: activeTab === 'deposits' ? '#ffffff' : '#059669',
            color: activeTab === 'deposits' ? '#059669' : '#ffffff',
            padding: '1px 6px',
            borderRadius: 9999,
            fontSize: '0.68rem',
            fontWeight: 800,
          }}
        >
          {pendingDepositsCount}
        </span>
      ) : null,
    },
    {
      id: 'campaigns',
      label: `Campaigns (${campaignsCount})`,
      icon: <Video size={15} />,
    },
    {
      id: 'users',
      label: `Users (${usersCount})`,
      icon: <Users size={15} />,
    },
    {
      id: 'pricing',
      label: 'Pricing & Rules',
      icon: <Sliders size={15} />,
    },
    {
      id: 'gateways',
      label: 'Payment Gateways',
      icon: <Wallet size={15} />,
    },
    {
      id: 'subadmins',
      label: subAdminsCount > 0 ? `Sub Admins (${subAdminsCount})` : 'Sub Admins',
      icon: <UserCheck size={15} />,
    },
  ];

  // Sub-admins only see the modules they have been granted permissions for
  const tabs = isMasterAdmin
    ? masterTabs
    : masterTabs.filter((tab) => {
        if (tab.id === 'deposits') return subAdminPermissions.includes('deposits');
        if (tab.id === 'payouts') return subAdminPermissions.includes('withdrawals');
        if (tab.id === 'campaigns') return subAdminPermissions.includes('campaigns');
        return false;
      });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
      {/* Top Admin Header Bar */}
      <div
        className="glass-card"
        style={{
          padding: '18px 24px',
          borderRadius: 18,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 14,
          border: '1.5px solid rgba(14, 165, 233, 0.3)',
          background: '#ffffff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <img
              src="/image.png"
              alt="ytCash PRO"
              style={{
                height: 36,
                width: 'auto',
                display: 'block',
                objectFit: 'contain',
              }}
            />
            <span className="badge-pill badge-cyan" style={{ fontSize: '0.52rem', padding: '1px 5px' }}>
              PRO
            </span>
          </div>
          <div style={{ width: 1, height: 28, backgroundColor: '#e2e8f0' }} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 className="font-display" style={{ fontSize: 'clamp(1.1rem, 4vw, 1.45rem)', color: '#0f172a', margin: 0 }}>
                {isMasterAdmin ? 'ADMIN CONTROL DESK' : 'STAFF CONTROL DESK'}
              </h1>
              <span className={`badge-pill ${isMasterAdmin ? 'badge-cyan' : 'badge-green'}`} style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                {isMasterAdmin ? 'MASTER PANEL' : 'SUB-ADMIN'}
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 2 }}>
              {isMasterAdmin
                ? 'Payouts, deposits, campaigns, users & system configurations.'
                : `Operator: ${currentUser?.name || currentUser?.email || 'Staff'} — Delegated Operational Desks`}
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Phone App Real-Time Active Users Badge (Left of Refresh) */}
          <div
            id="admin-realtime-phone-users"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px',
              borderRadius: 10,
              background: phoneAppUsersCount > 0 ? '#f0fdf4' : '#f8fafc',
              border: phoneAppUsersCount > 0 ? '1.5px solid rgba(16, 185, 129, 0.45)' : '1px solid #e2e8f0',
              boxShadow: phoneAppUsersCount > 0 ? '0 2px 8px rgba(16, 185, 129, 0.15)' : 'none',
              transition: 'all 0.25s ease',
            }}
            title="Live active users currently using the mobile phone app (real-time telemetry)"
          >
            <span style={{ position: 'relative', display: 'flex', width: 8, height: 8, alignItems: 'center', justifyContent: 'center' }}>
              {phoneAppUsersCount > 0 && (
                <span
                  className="live-dot-ping"
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                  }}
                />
              )}
              <span
                style={{
                  position: 'relative',
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: phoneAppUsersCount > 0 ? '#10b981' : '#94a3b8',
                }}
              />
            </span>

            <Smartphone
              size={15}
              style={{
                color: phoneAppUsersCount > 0 ? '#059669' : '#64748b',
                flexShrink: 0,
              }}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: 5, lineHeight: 1 }}>
              <span
                className="font-mono"
                style={{
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  color: phoneAppUsersCount > 0 ? '#065f46' : '#1e293b',
                  letterSpacing: '-0.02em',
                }}
              >
                {phoneAppUsersCount}
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 650,
                  color: phoneAppUsersCount > 0 ? '#047857' : '#64748b',
                  whiteSpace: 'nowrap',
                }}
              >
                Phone App Online
              </span>
            </div>
          </div>

          <button
            onClick={onRefresh}
            className="btn btn-ghost"
            style={{ padding: '7px 14px', fontSize: '0.82rem', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshCw size={14} className={dataLoading ? 'animate-spin' : ''} /> Refresh
          </button>

          <button
            onClick={onLogout}
            className="btn btn-ghost"
            style={{ padding: '7px 14px', fontSize: '0.82rem', borderRadius: 10, color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.25)', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <LogOut size={14} /> Exit
          </button>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionNotice && (
        <div
          style={{
            position: 'sticky',
            top: 16,
            zIndex: 100,
            padding: '14px 20px',
            borderRadius: 14,
            background: actionNotice.type === 'success' ? '#f0fdf4' : '#fef2f2',
            border: actionNotice.type === 'success' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
            color: actionNotice.type === 'success' ? '#059669' : '#b91c1c',
            fontSize: '0.88rem',
            fontWeight: 700,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {actionNotice.type === 'success' ? <CheckCircle2 size={18} color="#059669" /> : <AlertCircle size={18} color="#ef4444" />}
            <span>{actionNotice.message}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 700, fontSize: '1rem', padding: '0 4px' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Unified Single-Interface Navigator Bar - 2x4 Grid */}
      <div
        className="glass-card admin-tab-nav-grid"
        style={{
          background: '#ffffff',
          borderRadius: 16,
          padding: '8px',
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
          display: 'grid',
          gridTemplateColumns: isMasterAdmin ? 'repeat(4, 1fr)' : 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 8,
          alignItems: 'stretch',
        }}
      >
        {tabs.map((tab) => {
          const isSelected = activeTab === tab.id || (tab.id === 'pricing' && activeTab === 'settings');
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'pricing' || tab.id === 'gateways') {
                  onRefresh();
                }
              }}
              className="btn"
              style={{
                padding: '11px 12px',
                borderRadius: 10,
                fontSize: '0.84rem',
                fontWeight: isSelected ? 800 : 650,
                background: isSelected
                  ? 'linear-gradient(135deg, var(--primary-neon) 0%, #0284c7 100%)'
                  : '#f8fafc',
                color: isSelected ? '#ffffff' : '#334155',
                border: isSelected ? 'none' : '1.5px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
                boxShadow: isSelected ? '0 4px 12px rgba(14, 165, 233, 0.3)' : 'none',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge}
            </button>
          );
        })}
      </div>
    </div>
  );
};
