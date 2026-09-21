import React from 'react';
import { RefreshCw, Download, Clock } from 'lucide-react';
import { ViewerPagination } from './ViewerPagination';
import { getGoogleRedirectUrl, formatRewardAmount } from './viewerTypes';
import { renderWatchReward, renderWatchStatusBadge } from './viewerCharts';

interface ViewerWatchTabProps {
  watchHistory: any[];
  watchHistoryLoading: boolean;
  watchPage: number;
  setWatchPage: (page: number) => void;
  fetchWatchHistory: () => void;
  onRefreshUser: () => void;
  todaysWatchCount: number;
}

export const ViewerWatchTab: React.FC<ViewerWatchTabProps> = ({
  watchHistory,
  watchHistoryLoading,
  watchPage,
  setWatchPage,
  fetchWatchHistory,
  onRefreshUser,
  todaysWatchCount,
}) => {
  const WATCH_PAGE_SIZE = 10;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 className="font-display" style={{ fontSize: '1.65rem', color: '#0f172a', margin: 0, letterSpacing: '0.01em' }}>
            WATCH & EARN
          </h3>
          <span style={{ fontSize: '0.86rem', color: '#64748b' }}>
            Watch YouTube videos exclusively on our Android App and earn cash automatically.
          </span>
        </div>
        <button
          onClick={() => {
            fetchWatchHistory();
            onRefreshUser();
          }}
          className="btn btn-ghost"
          style={{ padding: '6px 14px', fontSize: '0.84rem', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <RefreshCw size={14} className={watchHistoryLoading ? 'animate-spin' : ''} /> Refresh Ledger
        </button>
      </div>

      {/* 1. Mobile App Download Banner (Simple & Elegant like Profile Switch) */}
      <div
        className="apk-banner-container"
        style={{
          position: 'relative',
          borderRadius: 14,
          background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 45%, #0ea5e9 100%)',
          boxShadow: '0 6px 18px -3px rgba(2, 132, 199, 0.28)',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        {/* Left: Compact Icon & Headline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img
            src="/icons/phone-icon.png"
            alt="ytCash Mobile App"
            style={{
              width: 46,
              height: 46,
              borderRadius: '50%',
              objectFit: 'contain',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
            }}
          />

          <div>
            <div className="font-display apk-banner-title" style={{ fontSize: '1.25rem', color: '#ffffff', letterSpacing: '0.01em', margin: 0, lineHeight: 1.2 }}>
              WATCH & EARN ON THE <span style={{ color: '#bae6fd' }}>ytCash ANDROID APP</span>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.88)', marginTop: 2 }}>
              Video viewing is exclusive to the mobile app with smart floating countdown & auto rewards.
            </div>
          </div>
        </div>

        {/* Right: Download Buttons */}
        <div className="mobile-wrap" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <a
            href="/downloads/ytcash.apk"
            download="ytcash.apk"
            className="apk-download-btn"
            style={{
              padding: '10px 22px',
              fontSize: '0.88rem',
              fontWeight: 800,
              fontFamily: 'JetBrains Mono, monospace',
              letterSpacing: '0.03em',
              textTransform: 'uppercase',
              borderRadius: 10,
              border: 'none',
              background: '#ffffff',
              color: '#0369a1',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              boxShadow: '0 3px 12px rgba(0, 0, 0, 0.15)',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <Download size={16} /> Download APK
          </a>
        </div>
      </div>

      {/* 2. VIDEOS WATCH & EARN LEDGER */}
      <div className="glass-card" style={{ padding: '22px', borderRadius: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h3 className="font-display" style={{ fontSize: '1.35rem', color: '#0f172a', margin: 0 }}>
              VIDEOS WATCH & EARN LEDGER
            </h3>
            <span style={{ fontSize: '0.86rem', color: '#64748b' }}>
              Detailed log of your latest 20 YouTube views and watch rewards credited to your wallet via mobile.
            </span>
          </div>
        </div>

        {/* Summary Stats Row in Fluid Grid */}
        <div className="viewer-stats-grid">
          {/* 1. Today's Watch */}
          <div className="viewer-stats-card" style={{ background: '#f0fdf4', padding: '14px 18px', borderRadius: 14, border: '1.5px solid rgba(16, 185, 129, 0.35)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: '#059669', textTransform: 'uppercase', fontWeight: 700 }}>Today's Watch</span>
              <span className="badge-pill" style={{ fontSize: '0.64rem', padding: '1px 6px', background: '#dcfce7', color: '#15803d', fontWeight: 700 }}>TODAY</span>
            </div>
            <div className="font-mono kpi-number" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669', marginTop: 3 }}>
              {todaysWatchCount}
            </div>
          </div>

          {/* 2. Total Videos Watched */}
          <div className="viewer-stats-card" style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: 14, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Total Watched</div>
            <div className="font-mono kpi-number" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: 3 }}>
              {watchHistory.filter((t) => t.status === 'completed').length}
            </div>
          </div>

          {/* 3. Total Watch Rewards (Strictly verified completed earnings) */}
          <div className="viewer-stats-card viewer-stats-featured" style={{ background: '#f0fdf4', padding: '14px 18px', borderRadius: 14, border: '1px solid rgba(16, 185, 129, 0.25)' }}>
            <div style={{ fontSize: '0.78rem', color: '#059669', textTransform: 'uppercase', fontWeight: 700 }}>Total Watch Rewards</div>
            <div className="font-mono kpi-number" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669', marginTop: 3 }}>
              +${formatRewardAmount(watchHistory.filter((t) => t.status === 'completed').reduce((sum, t) => sum + (t.rewardAmount || 0.0035), 0))} USD
            </div>
          </div>

          {/* 4. Total Watch Seconds */}
          <div className="viewer-stats-card" style={{ background: '#f0f9ff', padding: '14px 18px', borderRadius: 14, border: '1px solid rgba(14, 165, 233, 0.25)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--primary-neon)', textTransform: 'uppercase', fontWeight: 700 }}>Total Watch Seconds</div>
            <div className="font-mono kpi-number" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-neon)', marginTop: 3 }}>
              {watchHistory.filter((t) => t.status === 'completed').reduce((sum, t) => sum + (t.actualDurationSec || t.requiredDurationSec || 0), 0)}s
            </div>
          </div>
        </div>

        {!watchHistory.length ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b', fontSize: '0.92rem' }}>
            <img
              src="/icons/phone-icon.png"
              alt="ytCash App"
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                margin: '0 auto 12px auto',
                display: 'block',
                boxShadow: '0 4px 14px rgba(14, 165, 233, 0.3)',
              }}
            />
            <strong style={{ fontSize: '1.05rem', color: '#0f172a', display: 'block' }}>
              No videos recorded in your watch ledger yet
            </strong>
            <p style={{ margin: '6px auto 18px auto', fontSize: '0.88rem', maxWidth: 460, color: '#64748b' }}>
              Download the ytCash Android App above and start watching videos. Your completed views and earnings will appear here instantly!
            </p>
            <a
              href="/downloads/ytcash.apk"
              download="ytcash.apk"
              className="btn btn-neon glow-neon"
              style={{ padding: '9px 20px', fontSize: '0.88rem', borderRadius: 10, display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none', fontWeight: 700 }}
            >
              <Download size={16} /> Download Android App
            </a>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="desktop-only-table responsive-table-wrapper">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                    <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.78rem', fontWeight: 700 }}>Video</th>
                    <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.78rem', fontWeight: 700 }}>Duration</th>
                    <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.78rem', fontWeight: 700 }}>Reward</th>
                    <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.78rem', fontWeight: 700 }}>Status</th>
                    <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.78rem', fontWeight: 700 }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {watchHistory
                    .slice((watchPage - 1) * WATCH_PAGE_SIZE, watchPage * WATCH_PAGE_SIZE)
                    .map((item) => (
                      <tr key={item._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <img
                              src={item.campaignId?.thumbnailUrl || `https://img.youtube.com/vi/${item.videoId}/default.jpg`}
                              alt="thumb"
                              style={{ width: 50, height: 34, borderRadius: 6, objectFit: 'cover', background: '#000' }}
                            />
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontWeight: 700, color: '#0f172a', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {item.campaignId?.title || `YouTube Video (${item.videoId})`}
                              </div>
                              <a
                                href={getGoogleRedirectUrl(item.videoId)}
                                target="_blank"
                                rel="noreferrer"
                                style={{ fontSize: '0.75rem', color: 'var(--primary-neon)', textDecoration: 'none' }}
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

            {/* Mobile Watch History Cards */}
            <div className="mobile-card-list">
              {watchHistory
                .slice((watchPage - 1) * WATCH_PAGE_SIZE, watchPage * WATCH_PAGE_SIZE)
                .map((item) => (
                  <div key={item._id} className="mobile-data-card">
                    {/* Top: Thumb + Title + YouTube Link */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                        <img
                          src={item.campaignId?.thumbnailUrl || `https://img.youtube.com/vi/${item.videoId}/default.jpg`}
                          alt="thumb"
                          style={{ width: 50, height: 34, borderRadius: 6, objectFit: 'cover', background: '#000', flexShrink: 0 }}
                        />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.campaignId?.title || `YouTube Video (${item.videoId})`}
                          </div>
                          <a
                            href={getGoogleRedirectUrl(item.videoId)}
                            target="_blank"
                            rel="noreferrer"
                            style={{ fontSize: '0.75rem', color: 'var(--primary-neon)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 3, marginTop: 2 }}
                          >
                            Watch on YouTube ↗
                          </a>
                        </div>
                      </div>
                      {renderWatchStatusBadge(item.status)}
                    </div>

                    {/* Bottom Row: Duration, Date, and Reward */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '8px 12px', borderRadius: 8, fontSize: '0.82rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b' }}>
                        <Clock size={13} color="var(--primary-neon)" />
                        <span>{item.actualDurationSec || item.requiredDurationSec}s</span>
                        <span>•</span>
                        <span>{new Date(item.completedAt || item.createdAt).toLocaleDateString()}</span>
                      </div>
                      {renderWatchReward(item, '0.96rem')}
                    </div>
                  </div>
                ))}
            </div>

            <ViewerPagination
              currentPage={watchPage}
              totalPages={Math.ceil(watchHistory.length / WATCH_PAGE_SIZE) || 1}
              totalItems={watchHistory.length}
              pageSize={WATCH_PAGE_SIZE}
              onPageChange={setWatchPage}
              itemName="videos watched"
            />
          </>
        )}
      </div>
    </div>
  );
};
