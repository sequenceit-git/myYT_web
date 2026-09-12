import React from 'react';
import { Search, ExternalLink } from 'lucide-react';
import { Campaign } from '../../types';
import { AdminPagination } from './AdminPagination';

interface AdminCampaignsTabProps {
  campaignsList: Campaign[];
  campaignSearch: string;
  setCampaignSearch: (term: string) => void;
  campPage: number;
  setCampPage: (page: number) => void;
  pageSize: number;
  onToggleCampaign: (campaign: Campaign) => void;
}

export const AdminCampaignsTab: React.FC<AdminCampaignsTabProps> = ({
  campaignsList,
  campaignSearch,
  setCampaignSearch,
  campPage,
  setCampPage,
  pageSize,
  onToggleCampaign,
}) => {
  const filteredCampaigns = campaignsList.filter((c) => {
    if (!campaignSearch.trim()) return true;
    const q = campaignSearch.toLowerCase();
    return (
      (c.title && c.title.toLowerCase().includes(q)) ||
      (c.videoId && c.videoId.toLowerCase().includes(q))
    );
  });

  return (
    <div className="glass-card" style={{ padding: '22px', borderRadius: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 className="font-display" style={{ fontSize: '1.35rem', color: '#0f172a', margin: 0 }}>
            ALL VIDEO CAMPAIGNS ({campaignsList.length})
          </h2>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>
            Monitor active promotions, video watch retention, and pause problematic links.
          </div>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: 240 }}>
          <input
            type="text"
            placeholder="Search campaigns..."
            value={campaignSearch}
            onChange={(e) => {
              setCampaignSearch(e.target.value);
              setCampPage(1);
            }}
            className="input-field"
            style={{ padding: '7px 12px 7px 32px', fontSize: '0.82rem', borderRadius: 8 }}
          />
          <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: '#94a3b8' }} />
        </div>
      </div>

      {!filteredCampaigns.length ? (
        <div style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>No campaigns found.</div>
      ) : (
        <>
          <div className="responsive-table-wrapper">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.76rem', fontWeight: 700 }}>Video</th>
                  <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.76rem', fontWeight: 700 }}>Duration</th>
                  <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.76rem', fontWeight: 700 }}>Progress</th>
                  <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.76rem', fontWeight: 700 }}>Cost</th>
                  <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.76rem', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.76rem', fontWeight: 700, textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCampaigns
                  .slice((campPage - 1) * pageSize, campPage * pageSize)
                  .map((c) => (
                    <tr key={c._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <img
                            src={c.thumbnailUrl || `https://img.youtube.com/vi/${c.videoId}/default.jpg`}
                            alt="thumb"
                            style={{ width: 50, height: 34, borderRadius: 6, objectFit: 'cover', background: '#000' }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, color: '#0f172a', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {c.title || `Video ${c.videoId}`}
                            </div>
                            <a
                              href={`https://youtube.com/watch?v=${c.videoId}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ fontSize: '0.74rem', color: 'var(--primary-neon)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 3 }}
                            >
                              Watch on YouTube <ExternalLink size={10} />
                            </a>
                          </div>
                        </div>
                      </td>
                      <td className="font-mono" style={{ padding: '10px 12px', color: '#0f172a' }}>{c.watchDurationSec}s</td>
                      <td className="font-mono" style={{ padding: '10px 12px', color: 'var(--primary-neon)', fontWeight: 700 }}>
                        {c.viewsDelivered?.toLocaleString() || 0} / {c.targetViews?.toLocaleString() || 0}
                      </td>
                      <td className="font-mono" style={{ padding: '10px 12px', color: '#0f172a' }}>${c.totalCost.toFixed(2)}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span
                          className="badge-pill"
                          style={{
                            padding: '2px 8px',
                            fontSize: '0.72rem',
                            textTransform: 'uppercase',
                            background: c.pausedByAdmin ? '#fef2f2' : c.status === 'active' ? '#ecfdf5' : '#f1f5f9',
                            color: c.pausedByAdmin ? '#ef4444' : c.status === 'active' ? '#059669' : '#64748b',
                            border: c.pausedByAdmin ? '1px solid #fecaca' : undefined,
                            fontWeight: c.pausedByAdmin ? 700 : 600,
                          }}
                        >
                          {c.pausedByAdmin ? 'Admin Paused' : c.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                        <button
                          onClick={() => onToggleCampaign(c)}
                          className="btn btn-ghost"
                          style={{
                            padding: '4px 10px',
                            fontSize: '0.76rem',
                            borderRadius: 6,
                            color: c.status === 'active' ? '#ef4444' : '#059669',
                            background: c.status === 'active' ? '#fef2f2' : '#ecfdf5',
                            border: c.status === 'active' ? '1px solid #fecaca' : '1px solid #a7f3d0',
                            fontWeight: 600,
                          }}
                        >
                          {c.status === 'active' ? 'Force Pause' : 'Force Resume'}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <AdminPagination
            currentPage={campPage}
            totalPages={Math.ceil(filteredCampaigns.length / pageSize) || 1}
            totalItems={filteredCampaigns.length}
            pageSize={pageSize}
            onPageChange={setCampPage}
            itemLabel="campaigns"
          />
        </>
      )}
    </div>
  );
};
