import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  Megaphone,
  CreditCard,
  ArrowDownLeft,
  History,
  UserCheck,
  PlaySquare,
} from 'lucide-react';
import { User } from '../../types';
import { UserAvatar } from '../UserAvatar';
import { CreatorTab } from './campaignerTypes';

interface CampaignerSidebarProps {
  user: User | null;
  activeTab: CreatorTab;
  setActiveTab: (tab: CreatorTab) => void;
  campaignsCount: number;
  onSwitchProfile?: (targetRole: 'viewer' | 'campaigner') => void;
  clearFeedback: () => void;
}

export const CampaignerSidebar: React.FC<CampaignerSidebarProps> = ({
  user,
  activeTab,
  setActiveTab,
  campaignsCount,
  onSwitchProfile,
  clearFeedback,
}) => {
  const navigate = useNavigate();

  return (
    <aside className="dashboard-sidebar">
      {/* User Header */}
      <div
        className="dashboard-sidebar-profile"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          paddingBottom: 14,
          borderBottom: '1px solid #f1f5f9',
        }}
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
            {user?.name || user?.email.split('@')[0] || 'Creator'}
          </div>
          <div className="badge-pill badge-neon" style={{ fontSize: '0.74rem', padding: '2px 8px', marginTop: 3 }}>
            Creator Studio
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="dashboard-sidebar-nav" style={{ gap: 6 }}>
        <button
          onClick={() => {
            setActiveTab('overview');
            clearFeedback();
          }}
          className={`dashboard-nav-item ${activeTab === 'overview' ? 'active-neon' : ''}`}
        >
          <div className="nav-left">
            <LayoutDashboard size={20} />
            <span>Overview</span>
          </div>
        </button>

        <button onClick={() => navigate('/buy-views')} className="dashboard-nav-item">
          <div className="nav-left">
            <PlusCircle size={20} />
            <span>New Campaign</span>
          </div>
        </button>

        <button
          onClick={() => {
            setActiveTab('campaigns');
            clearFeedback();
          }}
          className={`dashboard-nav-item ${activeTab === 'campaigns' ? 'active-neon' : ''}`}
        >
          <div className="nav-left">
            <Megaphone size={20} />
            <span>Campaigns</span>
          </div>
          <span className="dashboard-nav-badge badge-active">{campaignsCount}</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('deposit');
            clearFeedback();
          }}
          className={`dashboard-nav-item ${activeTab === 'deposit' ? 'active-neon' : ''}`}
        >
          <div className="nav-left">
            <CreditCard size={20} />
            <span>Deposit Budget</span>
          </div>
        </button>

        <button
          onClick={() => {
            setActiveTab('withdraw');
            clearFeedback();
          }}
          className={`dashboard-nav-item ${activeTab === 'withdraw' ? 'active-neon' : ''}`}
        >
          <div className="nav-left">
            <ArrowDownLeft size={20} />
            <span>Withdraw Budget</span>
          </div>
        </button>

        <button
          onClick={() => {
            setActiveTab('ledger');
            clearFeedback();
          }}
          className={`dashboard-nav-item ${activeTab === 'ledger' ? 'active-neon' : ''}`}
        >
          <div className="nav-left">
            <History size={20} />
            <span>Spend & Withdraw</span>
          </div>
        </button>

        <button
          onClick={() => {
            setActiveTab('profile');
            clearFeedback();
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
          onClick={() => onSwitchProfile && onSwitchProfile('viewer')}
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
          <PlaySquare size={16} />
          <span>Switch to Viewer</span>
        </button>
      </div>
    </aside>
  );
};
