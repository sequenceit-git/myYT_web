import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  CreditCard,
  Plus,
  ArrowUpRight,
  Flame,
  Eye,
  BarChart3,
  Megaphone,
  Lock,
  Pause,
  Play,
} from 'lucide-react';
import { Campaign, User } from '../../types';
import { CreatorTab } from './campaignerTypes';

interface CampaignerOverviewTabProps {
  user: User | null;
  creatorBal: number;
  dailySpend: number;
  totalViewsDelivered: number;
  totalViewsTargeted: number;
  activeCampaignsCount: number;
  campaigns: Campaign[];
  setActiveTab: (tab: CreatorTab) => void;
  togglePause: (camp: Campaign) => void;
}

export const CampaignerOverviewTab: React.FC<CampaignerOverviewTabProps> = ({
  user,
  creatorBal,
  dailySpend,
  totalViewsDelivered,
  totalViewsTargeted,
  activeCampaignsCount,
  campaigns,
  setActiveTab,
  togglePause,
}) => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <h1
          className="font-display"
          style={{ fontSize: 'clamp(1.4rem, 5vw, 1.85rem)', color: '#0f172a', margin: 0, letterSpacing: '0.01em' }}
        >
          CREATOR STUDIO
        </h1>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/buy-views')}
            className="btn btn-neon glow-neon"
            style={{ padding: '9px 18px', fontSize: '0.88rem', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <PlusCircle size={15} /> New Campaign
          </button>
        </div>
      </div>

      {/* 4 Metric Cards Grid (Responsive Grid with Featured Balance) */}
      <div className="responsive-kpi-grid">
        {/* 1. Campaign Balance (Featured on Phones) */}
        <div
          className="glass-card responsive-kpi-card responsive-kpi-featured"
          style={{ padding: '20px', border: '1.5px solid rgba(14, 165, 233, 0.4)', borderRadius: 16 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              className="font-mono"
              style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', fontWeight: 700 }}
            >
              Ad Balance
            </span>
            <CreditCard size={18} color="var(--primary-neon)" />
          </div>
          <div
            className="font-mono responsive-kpi-val"
            style={{ fontSize: '2.3rem', fontWeight: 800, color: 'var(--primary-neon)', marginTop: 6, lineHeight: 1 }}
          >
            ${creatorBal.toFixed(2)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
            <button
              onClick={() => setActiveTab('deposit')}
              className="btn btn-neon glow-neon"
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '0.84rem',
                fontWeight: 700,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                textTransform: 'none',
                letterSpacing: '0.01em',
              }}
            >
              <Plus size={15} strokeWidth={2.5} /> Deposit Budget
            </button>
            <button
              onClick={() => setActiveTab('withdraw')}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '0.84rem',
                fontWeight: 700,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                background: '#f8fafc',
                color: '#0f172a',
                border: '1.5px solid #cbd5e1',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                letterSpacing: '0.01em',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f0f9ff';
                e.currentTarget.style.borderColor = 'var(--primary-neon)';
                e.currentTarget.style.color = 'var(--primary-neon)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f8fafc';
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.color = '#0f172a';
              }}
            >
              <ArrowUpRight size={15} strokeWidth={2.5} /> Withdraw Budget
            </button>
          </div>
        </div>

        {/* 2. Today's Spending */}
        <div className="glass-card responsive-kpi-card" style={{ padding: '20px', borderRadius: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              className="font-mono"
              style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', fontWeight: 700 }}
            >
              Today’s Spending
            </span>
            <span
              className="badge-pill"
              style={{
                fontSize: '0.68rem',
                padding: '2px 7px',
                background: '#fef3c7',
                color: '#b45309',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
              }}
            >
              <Flame size={12} color="#f59e0b" /> TODAY
            </span>
          </div>
          <div
            className="font-mono responsive-kpi-val"
            style={{ fontSize: '2.3rem', fontWeight: 800, color: '#d97706', marginTop: 6, lineHeight: 1 }}
          >
            ${dailySpend.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 10 }}>Campaign ad spend today</div>
        </div>

        {/* 3. Views Delivered */}
        <div className="glass-card responsive-kpi-card" style={{ padding: '20px', borderRadius: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              className="font-mono"
              style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', fontWeight: 700 }}
            >
              Total Delivered
            </span>
            <Eye size={18} color="#059669" />
          </div>
          <div
            className="font-mono responsive-kpi-val"
            style={{ fontSize: '2.3rem', fontWeight: 800, color: '#0f172a', marginTop: 6, lineHeight: 1 }}
          >
            {totalViewsDelivered.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 10 }}>
            of {totalViewsTargeted.toLocaleString()} targeted views
          </div>
        </div>

        {/* 4. Total Invested */}
        <div className="glass-card responsive-kpi-card" style={{ padding: '20px', borderRadius: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              className="font-mono"
              style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', fontWeight: 700 }}
            >
              Total Invested
            </span>
            <BarChart3 size={18} color="#7c3aed" />
          </div>
          <div
            className="font-mono responsive-kpi-val"
            style={{ fontSize: '2.3rem', fontWeight: 800, color: '#7c3aed', marginTop: 6, lineHeight: 1 }}
          >
            ${(user?.totalSpent || 0).toFixed(2)}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 10 }}>Total promotion spend</div>
        </div>

        {/* 5. Active Campaigns */}
        <div className="glass-card responsive-kpi-card" style={{ padding: '20px', borderRadius: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              className="font-mono"
              style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', fontWeight: 700 }}
            >
              Active
            </span>
            <Megaphone size={18} color="#d97706" />
          </div>
          <div
            className="font-mono responsive-kpi-val"
            style={{ fontSize: '2.3rem', fontWeight: 800, color: '#d97706', marginTop: 6, lineHeight: 1 }}
          >
            {activeCampaignsCount}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 10 }}>Running in viewer queue</div>
        </div>
      </div>

      {/* Active Campaigns Table */}
      <div className="glass-card" style={{ padding: '20px', borderRadius: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 className="font-display" style={{ fontSize: '1.18rem', color: '#0f172a', margin: 0 }}>
            CAMPAIGNS
          </h3>
          <button
            onClick={() => setActiveTab('campaigns')}
            className="btn btn-ghost"
            style={{ padding: '4px 10px', fontSize: '0.82rem', borderRadius: 8 }}
          >
            View All ({campaigns.length}) →
          </button>
        </div>

        {!campaigns.length ? (
          <div style={{ textAlign: 'center', padding: '24px', color: '#64748b', fontSize: '0.92rem' }}>
            No campaigns yet.{' '}
            <button
              onClick={() => navigate('/buy-views')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary-neon)',
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Launch a campaign
            </button>
            !
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="desktop-only-table responsive-table-wrapper">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid #e2e8f0', color: 'var(--on-surface-variant)', textAlign: 'left' }}>
                    <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.78rem', fontWeight: 700 }}>Video</th>
                    <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.78rem', fontWeight: 700 }}>Delivered</th>
                    <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.78rem', fontWeight: 700 }}>Status</th>
                    <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.78rem', fontWeight: 700 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.slice(0, 4).map((camp) => (
                    <tr key={camp._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <img
                            src={camp.thumbnailUrl || `https://img.youtube.com/vi/${camp.videoId}/default.jpg`}
                            alt="thumbnail"
                            style={{ width: 44, height: 32, borderRadius: 6, objectFit: 'cover' }}
                          />
                          <span
                            style={{
                              fontWeight: 600,
                              color: '#0f172a',
                              maxWidth: 220,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {camp.title || `Video ${camp.videoId}`}
                          </span>
                        </div>
                      </td>
                      <td className="font-mono" style={{ padding: '10px 12px', color: 'var(--primary-neon)', fontWeight: 700 }}>
                        {camp.viewsDelivered.toLocaleString()} / {camp.targetViews.toLocaleString()}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span
                          className="badge-pill"
                          style={{
                            padding: '2px 8px',
                            fontSize: '0.72rem',
                            textTransform: 'uppercase',
                            background: camp.pausedByAdmin ? '#fef2f2' : camp.status === 'active' ? '#e0f2fe' : '#f1f5f9',
                            color: camp.pausedByAdmin ? '#ef4444' : camp.status === 'active' ? 'var(--primary-neon)' : '#64748b',
                            border: camp.pausedByAdmin ? '1px solid #fecaca' : undefined,
                            fontWeight: camp.pausedByAdmin ? 700 : 600,
                          }}
                        >
                          {camp.pausedByAdmin ? 'Admin Paused' : camp.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        {camp.pausedByAdmin ? (
                          <button
                            onClick={() => togglePause(camp)}
                            title="Contact to the admin to start the campaign again"
                            className="btn btn-ghost"
                            style={{
                              padding: '4px 10px',
                              fontSize: '0.76rem',
                              borderRadius: 6,
                              color: '#ef4444',
                              background: '#fef2f2',
                              border: '1px solid #fecaca',
                            }}
                          >
                            <Lock size={13} />
                            <span>Locked</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => togglePause(camp)}
                            className="btn btn-ghost"
                            style={{ padding: '4px 10px', fontSize: '0.76rem', borderRadius: 6 }}
                          >
                            {camp.status === 'active' ? <Pause size={13} /> : <Play size={13} />}
                            <span>{camp.status === 'active' ? 'Pause' : 'Resume'}</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="mobile-card-list">
              {campaigns.slice(0, 4).map((camp) => {
                const pct = Math.min(100, Math.round((camp.viewsDelivered / (camp.targetViews || 1)) * 100));
                return (
                  <div key={camp._id} className="mobile-data-card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                        <img
                          src={camp.thumbnailUrl || `https://img.youtube.com/vi/${camp.videoId}/default.jpg`}
                          alt="thumbnail"
                          style={{ width: 46, height: 32, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }}
                        />
                        <span
                          style={{
                            fontWeight: 600,
                            color: '#0f172a',
                            fontSize: '0.88rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {camp.title || `Video ${camp.videoId}`}
                        </span>
                      </div>
                      <span
                        className="badge-pill"
                        style={{
                          padding: '2px 8px',
                          fontSize: '0.72rem',
                          textTransform: 'uppercase',
                          flexShrink: 0,
                          background: camp.pausedByAdmin ? '#fef2f2' : camp.status === 'active' ? '#e0f2fe' : '#f1f5f9',
                          color: camp.pausedByAdmin ? '#ef4444' : camp.status === 'active' ? 'var(--primary-neon)' : '#64748b',
                          border: camp.pausedByAdmin ? '1px solid #fecaca' : undefined,
                          fontWeight: camp.pausedByAdmin ? 700 : 600,
                        }}
                      >
                        {camp.pausedByAdmin ? 'Admin Paused' : camp.status}
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.82rem',
                        color: '#64748b',
                      }}
                    >
                      <span>Views Delivered:</span>
                      <span className="font-mono" style={{ fontWeight: 700, color: 'var(--primary-neon)' }}>
                        {camp.viewsDelivered.toLocaleString()} / {camp.targetViews.toLocaleString()} ({pct}%)
                      </span>
                    </div>

                    {/* Mini Progress Bar */}
                    <div style={{ height: 5, background: '#f1f5f9', borderRadius: 9999, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          background: 'var(--primary-neon)',
                          borderRadius: 9999,
                          width: `${pct}%`,
                        }}
                      />
                    </div>

                    {camp.pausedByAdmin ? (
                      <button
                        onClick={() => togglePause(camp)}
                        title="Contact to the admin to start the campaign again"
                        className="btn btn-ghost mobile-btn-full"
                        style={{
                          padding: '7px 12px',
                          fontSize: '0.8rem',
                          borderRadius: 8,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          border: '1px solid #fecaca',
                          background: '#fef2f2',
                          color: '#ef4444',
                          fontWeight: 600,
                        }}
                      >
                        <Lock size={13} />
                        <span>Contact Admin to Resume</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => togglePause(camp)}
                        className="btn btn-ghost mobile-btn-full"
                        style={{
                          padding: '7px 12px',
                          fontSize: '0.8rem',
                          borderRadius: 8,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          border: '1px solid #e2e8f0',
                          background: '#f8fafc',
                        }}
                      >
                        {camp.status === 'active' ? <Pause size={13} /> : <Play size={13} />}
                        <span>{camp.status === 'active' ? 'Pause Campaign' : 'Resume Campaign'}</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
