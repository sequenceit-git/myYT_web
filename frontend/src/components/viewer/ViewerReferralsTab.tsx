import React from 'react';
import {
  Share2,
  Check,
  Copy,
  Gift,
  Users,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

interface ViewerReferralsTabProps {
  user: any;
  referralStats: any;
  referralLoading: boolean;
  referralCopied: boolean;
  bdtRate: number;
  handleCopyReferral: (text: string) => void;
  fetchReferralStats: () => void;
}

export const ViewerReferralsTab: React.FC<ViewerReferralsTabProps> = ({
  user,
  referralStats,
  referralLoading,
  referralCopied,
  bdtRate,
  handleCopyReferral,
  fetchReferralStats,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header & Description */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="font-display" style={{ fontSize: 'clamp(1.4rem, 5vw, 1.85rem)', color: '#0f172a', margin: 0, letterSpacing: '0.01em' }}>
            REFERRAL PROGRAM
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', color: '#64748b' }}>
            Earn <strong style={{ color: 'var(--primary-neon)' }}>10% lifetime cash commission</strong> from every video task reward completed by your friends.
          </p>
        </div>

        <button
          onClick={fetchReferralStats}
          className="btn btn-ghost"
          style={{ padding: '8px 14px', fontSize: '0.82rem', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <RefreshCw size={14} className={referralLoading ? 'animate-spin' : ''} /> Refresh Stats
        </button>
      </div>

      {/* Share Your Referral Link Banner */}
      <div
        className="glass-card mobile-p-small"
        style={{
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f8fafc 100%)',
          border: '1.5px solid rgba(14, 165, 233, 0.4)',
          borderRadius: 18,
          padding: '22px',
          position: 'relative',
          overflow: 'hidden',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary-neon)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Share2 size={18} />
          </div>
          <div style={{ minWidth: 0 }}>
            <h3 className="font-display" style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a' }}>
              YOUR UNIQUE INVITE LINK
            </h3>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>
              Share this link. Anyone who registers will be permanently linked to your account.
            </div>
          </div>
        </div>

        {/* Link Box with Copy Button & Code Badge */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12, width: '100%' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'stretch', width: '100%' }}>
            <div
              style={{
                flex: '1 1 200px',
                minWidth: 0,
                background: '#ffffff',
                border: '1.5px solid #cbd5e1',
                borderRadius: 12,
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden',
                boxSizing: 'border-box',
              }}
            >
              <span
                className="font-mono"
                style={{
                  fontSize: '0.85rem',
                  color: '#0f172a',
                  fontWeight: 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  width: '100%',
                }}
              >
                {`${window.location.origin}/?ref=${referralStats?.referralCode || user.referralCode || 'YTCASH'}`}
              </span>
            </div>

            <button
              onClick={() => handleCopyReferral(`${window.location.origin}/?ref=${referralStats?.referralCode || user.referralCode || 'YTCASH'}`)}
              className="btn btn-neon glow-neon btn-mobile-full"
              style={{
                padding: '10px 20px',
                fontSize: '0.88rem',
                borderRadius: 12,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
                fontWeight: 700,
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {referralCopied ? <Check size={16} /> : <Copy size={16} />}
              <span>{referralCopied ? 'Copied Link!' : 'Copy Link'}</span>
            </button>
          </div>

          {/* Referral Code Quick Copy */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={() => handleCopyReferral(referralStats?.referralCode || user.referralCode || 'YTCASH')}
              className="btn btn-ghost"
              style={{
                padding: '8px 14px',
                fontSize: '0.82rem',
                borderRadius: 10,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                cursor: 'pointer',
              }}
              title="Click to copy referral code"
            >
              <span style={{ color: '#64748b' }}>Referral Code:</span>
              <strong className="font-mono" style={{ color: 'var(--primary-neon)' }}>
                {referralStats?.referralCode || user.referralCode || 'YTCASH'}
              </strong>
              <Copy size={13} color="var(--primary-neon)" style={{ marginLeft: 2 }} />
            </button>
          </div>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="responsive-kpi-grid">
        {/* 1. Commission Rate */}
        <div className="glass-card responsive-kpi-card" style={{ padding: '20px', borderRadius: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="font-mono" style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', fontWeight: 700 }}>
              Commission Rate
            </span>
            <Gift size={18} color="var(--primary-neon)" />
          </div>
          <div className="font-mono responsive-kpi-val" style={{ fontSize: '2.3rem', fontWeight: 800, color: 'var(--primary-neon)', marginTop: 6, lineHeight: 1 }}>
            10%
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 8 }}>
            Lifetime rate on all video rewards
          </div>
        </div>

        {/* 2. Total Referrals */}
        <div className="glass-card responsive-kpi-card" style={{ padding: '20px', borderRadius: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="font-mono" style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', fontWeight: 700 }}>
              Friends Referred
            </span>
            <Users size={18} color="#059669" />
          </div>
          <div className="font-mono responsive-kpi-val" style={{ fontSize: '2.3rem', fontWeight: 800, color: '#059669', marginTop: 6, lineHeight: 1 }}>
            {(referralStats?.referralCount ?? user.referralCount ?? 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 8 }}>
            Registered users via your link
          </div>
        </div>

        {/* 3. Total Referral Earnings - Feature full width on mobile 2-col layout */}
        <div className="glass-card responsive-kpi-card responsive-kpi-featured" style={{ padding: '20px', borderRadius: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="font-mono" style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', fontWeight: 700 }}>
              Referral Earnings
            </span>
            <Sparkles size={18} color="#7c3aed" />
          </div>
          <div className="font-mono responsive-kpi-val" style={{ fontSize: '2.3rem', fontWeight: 800, color: '#7c3aed', marginTop: 6, lineHeight: 1 }}>
            ${(referralStats?.referralEarnings ?? user.referralEarnings ?? 0).toFixed(4)}
          </div>
          <div className="font-mono" style={{ fontSize: '0.84rem', color: '#059669', fontWeight: 600, marginTop: 4 }}>
            ≈ ৳{Math.round(((referralStats?.referralEarnings ?? user.referralEarnings ?? 0) * bdtRate)).toLocaleString()} BDT
          </div>
        </div>
      </div>

      {/* How It Works (3 Steps) */}
      <div className="glass-card" style={{ padding: '22px', borderRadius: 16 }}>
        <h3 className="font-display" style={{ margin: '0 0 16px 0', fontSize: '1.2rem', color: '#0f172a' }}>
          HOW 10% REFERRAL COMMISSION WORKS
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: 14, border: '1px solid #e2e8f0' }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--primary-neon)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', marginBottom: 10 }}>
              1
            </div>
            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.94rem' }}>Share Your Link</div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 4 }}>
              Invite friends, YouTubers, or communities using your custom link or code.
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: 14, border: '1px solid #e2e8f0' }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: '#059669', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', marginBottom: 10 }}>
              2
            </div>
            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.94rem' }}>They Watch Videos</div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 4 }}>
              Whenever they watch YouTube videos and earn cash rewards on the mobile app,
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: 14, border: '1px solid #e2e8f0' }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: '#7c3aed', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', marginBottom: 10 }}>
              3
            </div>
            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.94rem' }}>Instant 10% Cash</div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 4 }}>
              You receive 10% bonus instantly in your wallet balance, ready to withdraw anytime!
            </div>
          </div>
        </div>
      </div>

      {/* Commission Ledger Table */}
      <div className="glass-card" style={{ padding: '22px', borderRadius: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 className="font-display" style={{ fontSize: '1.2rem', color: '#0f172a', margin: 0 }}>
            COMMISSION HISTORY
          </h3>
          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
            {(referralStats?.recentCommissions || []).length} recorded payouts
          </span>
        </div>

        {(!referralStats?.recentCommissions || referralStats.recentCommissions.length === 0) ? (
          <div style={{ textAlign: 'center', padding: '36px 16px', color: '#64748b' }}>
            <Gift size={38} color="#94a3b8" style={{ margin: '0 auto 10px auto', display: 'block' }} />
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#334155' }}>No referral commissions earned yet</div>
            <div style={{ fontSize: '0.82rem', marginTop: 4, maxWidth: 360, margin: '4px auto 0 auto' }}>
              Copy your referral link above and share it with friends to start earning 10% passive commission automatically!
            </div>
          </div>
        ) : (
          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                  <th style={{ padding: '10px 12px' }}>Date</th>
                  <th style={{ padding: '10px 12px' }}>Type</th>
                  <th style={{ padding: '10px 12px' }}>Description</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Commission</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {referralStats.recentCommissions.map((comm: any) => (
                  <tr key={comm._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 12px', color: '#475569', whiteSpace: 'nowrap' }}>
                      {new Date(comm.createdAt).toLocaleDateString()} {new Date(comm.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                      <span className="badge-pill" style={{ fontSize: '0.7rem', padding: '2px 8px', background: '#f3e8ff', color: '#7c3aed', fontWeight: 700 }}>
                        10% Referral
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', color: '#334155' }}>
                      {comm.description || '10% Commission on referral task completion'}
                    </td>
                    <td className="font-mono" style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#059669', whiteSpace: 'nowrap' }}>
                      +${(comm.amount || 0).toFixed(4)} USD
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <span className="badge-pill" style={{ fontSize: '0.7rem', padding: '2px 8px', background: '#dcfce7', color: '#15803d', fontWeight: 700 }}>
                        Completed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
