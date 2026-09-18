import React from 'react';
import {
  Wallet,
  ArrowUpRight,
  Sparkles,
  CreditCard,
  Play,
  TrendingUp,
  Download,
} from 'lucide-react';
import { User } from '../../types';
import { ViewerTab, getGoogleRedirectUrl } from './viewerTypes';
import { renderWatchReward, renderWatchStatusBadge } from './viewerCharts';

interface ViewerOverviewTabProps {
  user: User;
  viewerBal: number;
  approxBDT: string;
  dailyEarnings: number;
  approxDailyBDT: string;
  watchHistory: any[];
  setActiveTab: (tab: ViewerTab) => void;
}

export const ViewerOverviewTab: React.FC<ViewerOverviewTabProps> = ({
  user,
  viewerBal,
  approxBDT,
  dailyEarnings,
  approxDailyBDT,
  watchHistory,
  setActiveTab,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Quick Actions Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <h1
          className="font-display"
          style={{ fontSize: 'clamp(1.4rem, 5vw, 1.85rem)', color: '#0f172a', margin: 0, letterSpacing: '0.01em' }}
        >
          VIEWER STUDIO
        </h1>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('watch')}
            className="btn btn-neon glow-neon"
            style={{ padding: '9px 18px', fontSize: '0.88rem', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 7 }}
          >
            <img src="/icons/phone-icon.png" alt="" style={{ width: 17, height: 17, borderRadius: '50%' }} /> Watch & Earn (App)
          </button>
        </div>
      </div>

      {/* 3 Metric Cards Grid (Responsive Grid with Featured Balance) */}
      <div className="responsive-kpi-grid">
        {/* 1. Cash Balance (Featured Full Width on Phones) */}
        <div
          className="glass-card responsive-kpi-card responsive-kpi-featured"
          style={{ padding: '20px', border: '1.5px solid rgba(14, 165, 233, 0.4)', borderRadius: 16 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              className="font-mono"
              style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', fontWeight: 700 }}
            >
              Available Earnings
            </span>
            <Wallet size={18} color="var(--primary-neon)" />
          </div>
          <div
            className="font-mono responsive-kpi-val"
            style={{ fontSize: '2.3rem', fontWeight: 800, color: 'var(--primary-neon)', marginTop: 6, lineHeight: 1 }}
          >
            ${viewerBal.toFixed(4)}
          </div>
          <div className="font-mono" style={{ fontSize: '0.84rem', color: '#059669', fontWeight: 600, marginTop: 4 }}>
            ≈ ৳{approxBDT} BDT
          </div>
          <button
            onClick={() => setActiveTab('withdraw')}
            className="btn btn-ghost"
            style={{
              marginTop: 14,
              width: '100%',
              padding: '9px 12px',
              fontSize: '0.84rem',
              fontWeight: 700,
              borderRadius: 10,
              color: 'var(--primary-neon)',
              borderColor: 'rgba(14, 165, 233, 0.4)',
              background: '#f0f9ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              textTransform: 'none',
            }}
          >
            <ArrowUpRight size={15} strokeWidth={2.5} /> Withdraw Cash
          </button>
        </div>

        {/* 2. Today's Earnings */}
        <div className="glass-card responsive-kpi-card" style={{ padding: '20px', borderRadius: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              className="font-mono"
              style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', fontWeight: 700 }}
            >
              Today’s Earnings
            </span>
            <span
              className="badge-pill"
              style={{
                fontSize: '0.68rem',
                padding: '2px 7px',
                background: '#dcfce7',
                color: '#15803d',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
              }}
            >
              <Sparkles size={12} color="#16a34a" /> TODAY
            </span>
          </div>
          <div
            className="font-mono responsive-kpi-val"
            style={{ fontSize: '2.3rem', fontWeight: 800, color: '#059669', marginTop: 6, lineHeight: 1 }}
          >
            ${dailyEarnings.toFixed(4)}
          </div>
          <div className="font-mono" style={{ fontSize: '0.84rem', color: '#059669', fontWeight: 600, marginTop: 4 }}>
            ≈ ৳{approxDailyBDT} BDT
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 6 }}>Watch rewards earned today</div>
        </div>

        {/* 3. Total Withdrawn (Visible on mobile view side-by-side with Today's Earnings!) */}
        <div className="glass-card responsive-kpi-card" style={{ padding: '20px', borderRadius: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              className="font-mono"
              style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', fontWeight: 700 }}
            >
              Total Withdrawn
            </span>
            <CreditCard size={18} color="#7c3aed" />
          </div>
          <div
            className="font-mono responsive-kpi-val"
            style={{ fontSize: '2.3rem', fontWeight: 800, color: '#7c3aed', marginTop: 6, lineHeight: 1 }}
          >
            ${(user.totalWithdrawn || 0).toFixed(2)}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 10 }}>Disbursed to bKash/Nagad/Crypto</div>
        </div>

        {/* 4. Total Watched (Hidden on mobile view, visible on desktop) */}
        <div className="glass-card responsive-kpi-card desktop-only-kpi" style={{ padding: '20px', borderRadius: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              className="font-mono"
              style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', fontWeight: 700 }}
            >
              Total Watched
            </span>
            <Play size={18} color="#0284c7" />
          </div>
          <div
            className="font-mono responsive-kpi-val"
            style={{ fontSize: '2.3rem', fontWeight: 800, color: '#0284c7', marginTop: 6, lineHeight: 1 }}
          >
            {watchHistory.filter((t) => t.status === 'completed').length}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 6 }}>Completed video tasks</div>
        </div>

        {/* 5. Total Earned (Hidden on mobile phones, visible on desktop) */}
        <div className="glass-card responsive-kpi-card desktop-only-kpi" style={{ padding: '20px', borderRadius: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              className="font-mono"
              style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', fontWeight: 700 }}
            >
              Total Earned
            </span>
            <TrendingUp size={18} color="#0f172a" />
          </div>
          <div
            className="font-mono responsive-kpi-val"
            style={{ fontSize: '2.3rem', fontWeight: 800, color: '#0f172a', marginTop: 6, lineHeight: 1 }}
          >
            ${(user.totalEarned || 0).toFixed(4)}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 10 }}>Lifetime watch rewards</div>
        </div>
      </div>

      {/* Mobile App Exclusive Notice Banner */}
      <div
        style={{
          background: 'linear-gradient(90deg, #f0f9ff 0%, #e0f2fe 100%)',
          border: '1.5px solid rgba(14, 165, 233, 0.35)',
          borderRadius: 16,
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <img
            src="/icons/phone-icon.png"
            alt="ytCash Mobile App"
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              objectFit: 'contain',
              flexShrink: 0,
              boxShadow: '0 4px 14px rgba(14, 165, 233, 0.35)',
            }}
          />
          <div>
            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.02rem' }}>
              Watch YouTube Videos & Earn Real Cash on Android App
            </div>
            <div style={{ fontSize: '0.84rem', color: '#475569', marginTop: 2 }}>
              Video viewing is exclusive to our Android App with smart floating countdown & automatic payout sync.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <a
            href="/downloads/ytcash.apk"
            download="ytcash.apk"
            className="btn btn-neon glow-neon"
            style={{
              padding: '8px 16px',
              fontSize: '0.84rem',
              borderRadius: 8,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              textDecoration: 'none',
              fontWeight: 700,
            }}
          >
            <Download size={14} /> Download App (.APK)
          </a>
          <button
            onClick={() => setActiveTab('watch')}
            className="btn btn-ghost"
            style={{ padding: '8px 14px', fontSize: '0.84rem', borderRadius: 8 }}
          >
            View Watch Ledger →
          </button>
        </div>
      </div>

      {/* Videos Watch History Table */}
      <div className="glass-card" style={{ padding: '20px', borderRadius: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 className="font-display" style={{ fontSize: '1.18rem', color: '#0f172a', margin: 0 }}>
            VIDEOS WATCH HISTORY
          </h3>
          <button
            onClick={() => setActiveTab('watch')}
            className="btn btn-ghost"
            style={{ padding: '4px 10px', fontSize: '0.82rem', borderRadius: 8 }}
          >
            View Log ({watchHistory.length}) →
          </button>
        </div>

        {!watchHistory.length ? (
          <div style={{ textAlign: 'center', padding: '24px', color: '#64748b', fontSize: '0.92rem' }}>
            No videos watched yet.{' '}
            <button
              onClick={() => setActiveTab('watch')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary-neon)',
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Watch & earn cash on our Android App
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
                    <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.78rem', fontWeight: 700 }}>Duration</th>
                    <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.78rem', fontWeight: 700 }}>Reward</th>
                    <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.78rem', fontWeight: 700 }}>Status</th>
                    <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.78rem', fontWeight: 700 }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {watchHistory.slice(0, 5).map((item) => (
                    <tr key={item._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <img
                            src={item.campaignId?.thumbnailUrl || `https://img.youtube.com/vi/${item.videoId}/default.jpg`}
                            alt="thumb"
                            style={{ width: 44, height: 32, borderRadius: 6, objectFit: 'cover', background: '#000', flexShrink: 0 }}
                          />
                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                fontWeight: 600,
                                color: '#0f172a',
                                maxWidth: 220,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {item.campaignId?.title || `YouTube Video (${item.videoId})`}
                            </div>
                            <a
                              href={getGoogleRedirectUrl(item.videoId)}
                              target="_blank"
                              rel="noreferrer"
                              style={{ fontSize: '0.72rem', color: 'var(--primary-neon)', textDecoration: 'none' }}
                            >
                              Watch on YouTube ↗
                            </a>
                          </div>
                        </div>
                      </td>
                      <td className="font-mono" style={{ padding: '10px 12px', fontWeight: 600, color: '#334155' }}>
                        {item.actualDurationSec || item.requiredDurationSec}s
                      </td>
                      <td style={{ padding: '10px 12px' }}>{renderWatchReward(item)}</td>
                      <td style={{ padding: '10px 12px' }}>{renderWatchStatusBadge(item.status)}</td>
                      <td style={{ padding: '10px 12px', color: '#64748b', fontSize: '0.84rem' }}>
                        {new Date(item.completedAt || item.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <div className="mobile-card-list">
              {watchHistory.slice(0, 5).map((item) => (
                <div
                  key={item._id}
                  className="mobile-data-card"
                  style={{ padding: '12px', borderRadius: 12, border: '1px solid #f1f5f9', background: '#fafafa', marginBottom: 8 }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                      <img
                        src={item.campaignId?.thumbnailUrl || `https://img.youtube.com/vi/${item.videoId}/default.jpg`}
                        alt="thumb"
                        style={{ width: 44, height: 32, borderRadius: 6, objectFit: 'cover', background: '#000', flexShrink: 0 }}
                      />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            fontWeight: 700,
                            color: '#0f172a',
                            fontSize: '0.86rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.campaignId?.title || `YouTube Video (${item.videoId})`}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>
                          <span>{item.actualDurationSec || item.requiredDurationSec}s</span>
                          <span>•</span>
                          <span>{new Date(item.completedAt || item.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ flexShrink: 0, textAlign: 'right' }}>
                      <div style={{ marginBottom: 4 }}>{renderWatchReward(item)}</div>
                      <div>{renderWatchStatusBadge(item.status)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
