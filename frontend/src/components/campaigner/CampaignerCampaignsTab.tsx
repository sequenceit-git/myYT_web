import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, ExternalLink, Lock, Pause, Play, Clock } from 'lucide-react';
import { Campaign } from '../../types';

interface CampaignerCampaignsTabProps {
  campaigns: Campaign[];
  bdtRate: number;
  togglePause: (camp: Campaign) => void;
}

export const CampaignerCampaignsTab: React.FC<CampaignerCampaignsTabProps> = ({
  campaigns,
  bdtRate,
  togglePause,
}) => {
  const navigate = useNavigate();

  return (
    <div className="glass-card" style={{ padding: '20px', borderRadius: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h3 className="font-display" style={{ fontSize: '1.35rem', color: '#0f172a', margin: 0 }}>
          ALL CAMPAIGNS
        </h3>
        <button
          onClick={() => navigate('/buy-views')}
          className="btn btn-neon glow-neon"
          style={{ padding: '8px 16px', fontSize: '0.84rem', borderRadius: 8 }}
        >
          <PlusCircle size={14} /> New Campaign
        </button>
      </div>

      {!campaigns.length ? (
        <div style={{ textAlign: 'center', padding: '28px', color: '#64748b', fontSize: '0.92rem' }}>
          No campaigns yet.
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
                  <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.78rem', fontWeight: 700 }}>Progress</th>
                  <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.78rem', fontWeight: 700 }}>Cost</th>
                  <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.78rem', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.78rem', fontWeight: 700 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((camp) => (
                  <tr key={camp._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img
                          src={camp.thumbnailUrl || `https://img.youtube.com/vi/${camp.videoId}/default.jpg`}
                          alt="thumbnail"
                          style={{ width: 48, height: 34, borderRadius: 6, objectFit: 'cover' }}
                        />
                        <div>
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
                            {camp.title || `Video ${camp.videoId}`}
                          </div>
                          <a
                            href={`https://youtube.com/watch?v=${camp.videoId}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              fontSize: '0.74rem',
                              color: 'var(--primary-neon)',
                              textDecoration: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 3,
                              marginTop: 2,
                            }}
                          >
                            YouTube <ExternalLink size={10} />
                          </a>
                        </div>
                      </div>
                    </td>
                    <td className="font-mono" style={{ padding: '10px 12px', color: '#0f172a' }}>
                      {camp.watchDurationSec}s
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <div className="font-mono" style={{ fontWeight: 700, color: 'var(--primary-neon)' }}>
                        {camp.viewsDelivered.toLocaleString()} / {camp.targetViews.toLocaleString()}
                      </div>
                    </td>
                    <td className="font-mono" style={{ padding: '10px 12px', color: '#0f172a', fontWeight: 700 }}>
                      ${camp.totalCost.toFixed(2)}
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
            {campaigns.map((camp) => {
              const percent = Math.min(100, Math.round((camp.viewsDelivered / (camp.targetViews || 1)) * 100));
              return (
                <div key={camp._id} className="mobile-data-card">
                  {/* Top: Thumb + Title + Status */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                      <img
                        src={camp.thumbnailUrl || `https://img.youtube.com/vi/${camp.videoId}/default.jpg`}
                        alt="thumbnail"
                        style={{ width: 54, height: 38, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 700,
                            color: '#0f172a',
                            fontSize: '0.88rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {camp.title || `Video ${camp.videoId}`}
                        </div>
                        <a
                          href={`https://youtube.com/watch?v=${camp.videoId}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            fontSize: '0.74rem',
                            color: 'var(--primary-neon)',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 3,
                            marginTop: 2,
                          }}
                        >
                          YouTube <ExternalLink size={10} />
                        </a>
                      </div>
                    </div>
                    <span
                      className="badge-pill"
                      style={{
                        padding: '2px 8px',
                        fontSize: '0.72rem',
                        textTransform: 'uppercase',
                        flexShrink: 0,
                        background: camp.status === 'active' ? '#e0f2fe' : '#f1f5f9',
                        color: camp.status === 'active' ? 'var(--primary-neon)' : '#64748b',
                      }}
                    >
                      {camp.status}
                    </span>
                  </div>

                  {/* Badges: Duration & Cost */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#f8fafc',
                      padding: '8px 12px',
                      borderRadius: 8,
                      fontSize: '0.82rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#475569' }}>
                      <Clock size={13} color="var(--primary-neon)" />
                      <span>
                        Duration: <strong style={{ color: '#0f172a' }}>{camp.watchDurationSec}s</strong>
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        color: '#059669',
                        fontWeight: 700,
                        fontFamily: 'monospace',
                      }}
                    >
                      <span>${camp.totalCost.toFixed(2)}</span>
                      <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 500 }}>
                        (≈ ৳{Math.round(camp.totalCost * bdtRate)})
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar & Count */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                      <span style={{ color: '#64748b' }}>Views Delivered</span>
                      <span className="font-mono" style={{ fontWeight: 700, color: 'var(--primary-neon)' }}>
                        {camp.viewsDelivered.toLocaleString()} / {camp.targetViews.toLocaleString()} ({percent}%)
                      </span>
                    </div>
                    <div style={{ height: 6, background: '#f1f5f9', borderRadius: 9999, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          background: 'linear-gradient(90deg, #0ea5e9, #0284c7)',
                          borderRadius: 9999,
                          width: `${percent}%`,
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                  </div>

                  {/* Touch-Friendly Action Button */}
                  {camp.pausedByAdmin ? (
                    <button
                      onClick={() => togglePause(camp)}
                      title="Contact to the admin to start the campaign again"
                      className="btn btn-ghost mobile-btn-full"
                      style={{
                        padding: '8px 14px',
                        fontSize: '0.82rem',
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
                      <Lock size={14} />
                      <span>Contact Admin to Resume</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => togglePause(camp)}
                      className="btn btn-ghost mobile-btn-full"
                      style={{
                        padding: '8px 14px',
                        fontSize: '0.82rem',
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        border: '1px solid #e2e8f0',
                        background: '#ffffff',
                        fontWeight: 600,
                      }}
                    >
                      {camp.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
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
  );
};
