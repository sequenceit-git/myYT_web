import React from 'react';
import {
  LayoutDashboard,
  Smartphone,
  ArrowUpRight,
  History,
  Gift,
  UserCheck,
  Rocket,
} from 'lucide-react';
import { User } from '../../types';
import { UserAvatar } from '../UserAvatar';
import { ViewerTab } from './viewerTypes';

interface ViewerSidebarProps {
  user: User;
  activeTab: ViewerTab;
  setActiveTab: (tab: ViewerTab) => void;
  onSwitchProfile?: (targetRole: 'viewer' | 'campaigner') => void;
  clearMsg: () => void;
}

export const ViewerSidebar: React.FC<ViewerSidebarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onSwitchProfile,
  clearMsg,
}) => {
  return (
    <aside className="dashboard-sidebar">
      {/* User Header */}
      <div
        className="dashboard-sidebar-profile"
        style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 14, borderBottom: '1px solid #f1f5f9' }}
      >
        <UserAvatar user={user} size={46} borderColor="var(--primary-neon)" />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              color: '#0f172a',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {user.name || user.email.split('@')[0]}
          </div>
          <div className="badge-pill badge-cyan" style={{ fontSize: '0.74rem', padding: '2px 8px', marginTop: 3 }}>
            Viewer Profile
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="dashboard-sidebar-nav" style={{ gap: 6 }}>
        <button
          onClick={() => {
            setActiveTab('overview');
            clearMsg();
          }}
          className={`dashboard-nav-item ${activeTab === 'overview' ? 'active-neon' : ''}`}
        >
          <div className="nav-left">
            <LayoutDashboard size={20} />
            <span>Overview</span>
          </div>
        </button>

        <button
          onClick={() => {
            setActiveTab('watch');
            clearMsg();
          }}
          className={`dashboard-nav-item ${activeTab === 'watch' ? 'active-neon' : ''}`}
        >
          <div className="nav-left">
            <Smartphone size={20} />
            <span>Watch & Earn</span>
          </div>
          <span className="dashboard-nav-badge badge-hot">APP</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('withdraw');
            clearMsg();
          }}
          className={`dashboard-nav-item ${activeTab === 'withdraw' ? 'active-neon' : ''}`}
        >
          <div className="nav-left">
            <ArrowUpRight size={20} />
            <span>Withdraw Cash</span>
          </div>
        </button>

        <button
          onClick={() => {
            setActiveTab('transactions');
            clearMsg();
          }}
          className={`dashboard-nav-item ${activeTab === 'transactions' ? 'active-neon' : ''}`}
        >
          <div className="nav-left">
            <History size={20} />
            <span>Payout Ledger</span>
          </div>
        </button>

        <button
          onClick={() => {
            setActiveTab('referrals');
            clearMsg();
          }}
          className={`dashboard-nav-item ${activeTab === 'referrals' ? 'active-neon' : ''}`}
        >
          <div className="nav-left">
            <Gift size={20} />
            <span>Referral (10%)</span>
          </div>
          <span className="dashboard-nav-badge badge-cyan" style={{ fontSize: '0.62rem', padding: '1px 6px' }}>
            10%
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('profile');
            clearMsg();
          }}
          className={`dashboard-nav-item ${activeTab === 'profile' ? 'active-neon' : ''}`}
        >
          <div className="nav-left">
            <UserCheck size={20} />
            <span>Account Profile</span>
          </div>
        </button>
      </nav>

      {/* Profile Switch Button (Desktop Only) */}
      <div className="dashboard-switch-widget" style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
        <button
          onClick={() => onSwitchProfile && onSwitchProfile('campaigner')}
          className="btn btn-ghost"
          style={{
            width: '100%',
            padding: '11px 14px',
            fontSize: '0.94rem',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            color: 'var(--primary-neon)',
            borderColor: 'rgba(14, 165, 233, 0.3)',
            fontWeight: 700,
          }}
        >
          <Rocket size={16} />
          <span>Switch to Creator</span>
        </button>
      </div>
    </aside>
  );
};
