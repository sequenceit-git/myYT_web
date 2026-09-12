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
} from 'lucide-react';
import { AdminTab } from './adminTypes';

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
  onRefresh,
  onLogout,
}) => {
  const tabs: {
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
  ];

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
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(14, 165, 233, 0.3)',
            }}
          >
            <Shield size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 className="font-display" style={{ fontSize: '1.55rem', color: '#0f172a', margin: 0 }}>
                ADMIN CONTROL DESK
              </h1>
              <span className="badge-pill badge-cyan" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                MASTER PANEL
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>
              Manual payouts desk, platform watch hours, ad spend, and system configurations.
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Simulated Concurrency Pill */}
          <div
            style={{
              background: '#f0fdf4',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              padding: '6px 12px',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} className="pulse-neon" />
            <span className="font-mono" style={{ fontSize: '0.76rem', fontWeight: 700, color: '#059669' }}>
              {stats?.simulatedConcurrency?.toLocaleString() || '4,250'} LIVE
            </span>
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

      {/* Unified Single-Interface Navigator Bar */}
      <div
        className="glass-card"
        style={{
          background: '#ffffff',
          borderRadius: 16,
          padding: '6px',
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))',
          gap: 6,
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
                padding: '9px 10px',
                borderRadius: 10,
                fontSize: '0.8rem',
                fontWeight: isSelected ? 800 : 600,
                background: isSelected
                  ? 'linear-gradient(135deg, var(--primary-neon) 0%, #0284c7 100%)'
                  : '#f8fafc',
                color: isSelected ? '#ffffff' : '#475569',
                border: isSelected ? 'none' : '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                boxShadow: isSelected ? '0 3px 10px rgba(14, 165, 233, 0.3)' : 'none',
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
