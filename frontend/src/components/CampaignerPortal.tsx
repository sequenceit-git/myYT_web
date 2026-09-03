import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, CheckCircle2, Eye, AlertCircle, PlusCircle, CreditCard, RefreshCw, BarChart3, History, ExternalLink, Megaphone, ArrowUpRight } from 'lucide-react';
import { Campaign, User, Transaction } from '../types';
import { apiRequest } from '../api';

interface CampaignerPortalProps {
  user: User | null;
  onRefreshUser: () => void;
  onOpenAuth?: (mode: 'signin' | 'signup', role?: 'viewer' | 'campaigner') => void;
}

export const CampaignerPortal: React.FC<CampaignerPortalProps> = ({ user, onRefreshUser, onOpenAuth }) => {
  const navigate = useNavigate();
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState(10);
  const [depositGateway, setDepositGateway] = useState<'faucetpay' | 'crypto'>('faucetpay');
  const [depositLoading, setDepositLoading] = useState(false);

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchCampaigns = async () => {
    const res = await apiRequest<Campaign[]>('/campaigns/mine');
    if (res.success && res.data) {
      setCampaigns(res.data);
    }
  };

  const fetchTransactions = async () => {
    const res = await apiRequest<Transaction[]>('/wallet/transactions');
    if (res.success && res.data) {
      setTransactions(res.data);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCampaigns();
      fetchTransactions();
    }
  }, [user]);

  // Handle Instant Deposit
  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      if (onOpenAuth) onOpenAuth('signin', 'campaigner');
      return;
    }
    setDepositLoading(true);
    setFeedback(null);

    const res = await apiRequest<any>('/wallet/deposit', {
      method: 'POST',
      body: JSON.stringify({
        amount: Number(depositAmount),
        gateway: depositGateway,
      }),
    });
    setDepositLoading(false);

    if (res.success) {
      setFeedback({ type: 'success', message: `✓ Successfully deposited $${depositAmount.toFixed(2)} USD!` });
      setShowDepositModal(false);
      onRefreshUser();
      fetchTransactions();
    } else {
      setFeedback({ type: 'error', message: res.error || 'Deposit failed' });
    }
  };

  const togglePause = async (camp: Campaign) => {
    const action = camp.status === 'active' ? 'pause' : 'resume';
    const res = await apiRequest<Campaign>(`/campaigns/${camp._id}/${action}`, { method: 'POST' });
    if (res.success) {
      fetchCampaigns();
    }
  };

  // Metrics
  const totalViewsDelivered = campaigns.reduce((acc, c) => acc + (c.viewsDelivered || 0), 0);
  const totalViewsTargeted = campaigns.reduce((acc, c) => acc + (c.targetViews || 0), 0);
  const activeCampaignsCount = campaigns.filter((c) => c.status === 'active').length;

  return (
    <div className="responsive-container" style={{ margin: '16px auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div className="badge-pill badge-cyan" style={{ marginBottom: 4, fontSize: '0.62rem', padding: '2px 8px' }}>
            ● Creator Studio Management
          </div>
          <h1 className="font-display hero-title" style={{ fontSize: 'clamp(1.5rem, 2.5vw, 1.9rem)', letterSpacing: '0.01em', color: '#ffffff', lineHeight: 1.1 }}>
            CREATOR <span style={{ color: 'var(--secondary-cyan)' }}>DASHBOARD</span>
          </h1>
          <p className="font-body" style={{ color: 'var(--on-surface-variant)', marginTop: 2, fontSize: '0.78rem' }}>
            Manage ad budget, track live view delivery, control campaigns, and view spend history.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              if (!user) {
                if (onOpenAuth) onOpenAuth('signin', 'campaigner');
              } else {
                setShowDepositModal(true);
              }
            }}
            className="btn btn-neon glow-neon"
            style={{ padding: '7px 14px', fontSize: '0.75rem', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 5 }}
          >
            <PlusCircle size={14} /> Deposit Funds
          </button>

          <button
            onClick={() => navigate('/buy-views')}
            className="btn btn-cyan"
            style={{ padding: '7px 14px', fontSize: '0.75rem', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 5 }}
          >
            <Megaphone size={14} /> Create Campaign
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className="glass-card"
          style={{
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            borderRadius: 10,
            borderLeft: feedback.type === 'success' ? '3px solid var(--primary-neon)' : '3px solid #ef4444',
            background: feedback.type === 'success' ? 'rgba(195,244,0,0.1)' : 'rgba(239,68,68,0.1)',
          }}
        >
          {feedback.type === 'success' ? <CheckCircle2 color="var(--primary-neon)" size={16} /> : <AlertCircle color="#ef4444" size={16} />}
          <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>{feedback.message}</span>
        </div>
      )}

      {/* 4 Metric Cards Responsive Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: 12 }}>
        
        {/* 1. Campaign Balance Card */}
        <div className="glass-card" style={{ padding: '14px 18px', border: '1px solid rgba(120, 211, 238, 0.35)', borderRadius: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>Campaign Balance</span>
            <CreditCard size={16} color="var(--secondary-cyan)" />
          </div>
          <div className="font-mono" style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--secondary-cyan)', marginTop: 4 }}>
            ${(user?.balance || 0).toFixed(4)} <span style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)' }}>USD</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--on-surface-variant)' }}>Available ad spend</span>
            <button
              onClick={() => setShowDepositModal(true)}
              className="btn btn-ghost"
              style={{ padding: '2px 8px', fontSize: '0.65rem', borderRadius: 6, color: 'var(--primary-neon)' }}
            >
              + Deposit
            </button>
          </div>
        </div>

        {/* 2. Views Delivered */}
        <div className="glass-card" style={{ padding: '14px 18px', borderRadius: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>Delivered Views</span>
            <Eye size={16} color="var(--primary-neon)" />
          </div>
          <div className="font-mono" style={{ fontSize: '1.55rem', fontWeight: 800, color: '#ffffff', marginTop: 4 }}>
            {totalViewsDelivered.toLocaleString()} <span style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)' }}>/ {totalViewsTargeted.toLocaleString()}</span>
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--on-surface-variant)', marginTop: 8 }}>
            Across all video campaigns
          </div>
        </div>

        {/* 3. Total Invested */}
        <div className="glass-card" style={{ padding: '14px 18px', borderRadius: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>Total Invested</span>
            <BarChart3 size={16} color="#fbbf24" />
          </div>
          <div className="font-mono" style={{ fontSize: '1.55rem', fontWeight: 800, color: '#fbbf24', marginTop: 4 }}>
            ${(user?.totalSpent || 0).toFixed(2)} <span style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)' }}>USD</span>
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--on-surface-variant)', marginTop: 8 }}>
            Total promotion investment
          </div>
        </div>

        {/* 4. Active Campaigns */}
        <div className="glass-card" style={{ padding: '14px 18px', borderRadius: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>Active Campaigns</span>
            <Megaphone size={16} color="var(--primary-neon)" />
          </div>
          <div className="font-mono" style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--primary-neon)', marginTop: 4 }}>
            {activeCampaignsCount} <span style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)' }}>Running</span>
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--on-surface-variant)', marginTop: 8 }}>
            Live in mobile viewer queue
          </div>
        </div>
      </div>

      {/* Campaigns Table Card */}
      <div className="glass-card mobile-p-small" style={{ padding: '18px 20px', borderRadius: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Eye size={17} color="var(--primary-neon)" />
            <h3 className="font-display" style={{ fontSize: '1.1rem', color: '#ffffff', letterSpacing: '0.02em' }}>
              PROMOTIONAL CAMPAIGN ORDERS
            </h3>
          </div>
          
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={fetchCampaigns}
              className="btn btn-ghost"
              style={{ padding: '3px 8px', fontSize: '0.68rem', borderRadius: 6 }}
            >
              <RefreshCw size={11} /> Refresh
            </button>
            <button
              onClick={() => navigate('/buy-views')}
              className="btn btn-neon glow-neon"
              style={{ padding: '4px 10px', fontSize: '0.68rem', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <PlusCircle size={11} /> New Campaign
            </button>
          </div>
        </div>

        {!campaigns.length ? (
          <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--on-surface-variant)', fontSize: '0.8rem' }}>
            No campaigns found. Launch your first YouTube campaign to begin delivering real verified views.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {campaigns.map((camp) => {
              const percent = Math.min(100, Math.round(((camp.viewsDelivered || 0) / camp.targetViews) * 100));
              return (
                <div
                  key={camp._id}
                  style={{
                    background: '#0e0e0e',
                    border: '1px solid var(--glass-stroke)',
                    borderRadius: 12,
                    padding: '12px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <h4 style={{ fontSize: '0.88rem', fontWeight: 600, color: '#ffffff' }}>
                        {camp.title || `Campaign #${camp.videoId}`}
                      </h4>
                      <a
                        href={camp.youtubeUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: '0.7rem', color: 'var(--secondary-cyan)', display: 'inline-flex', alignItems: 'center', gap: 3, marginTop: 2, textDecoration: 'none' }}
                      >
                        Watch on YouTube <ExternalLink size={10} />
                      </a>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>
                        {camp.watchDurationSec}s watch
                      </span>
                      <span
                        className={`badge-pill ${camp.status === 'active' ? 'badge-neon' : camp.status === 'completed' ? 'badge-cyan' : 'badge-neutral'}`}
                        style={{ fontSize: '0.62rem', textTransform: 'uppercase', padding: '2px 8px' }}
                      >
                        {camp.status}
                      </span>
                      {camp.status !== 'completed' && (
                        <button
                          type="button"
                          onClick={() => togglePause(camp)}
                          className="btn btn-ghost"
                          style={{ padding: '3px 8px', fontSize: '0.68rem', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          {camp.status === 'active' ? <Pause size={11} /> : <Play size={11} />}
                          {camp.status === 'active' ? 'Pause' : 'Resume'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Delivery Progress Bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: 4 }}>
                      <span style={{ color: 'var(--on-surface-variant)' }}>Delivery Progress:</span>
                      <strong className="font-mono" style={{ color: 'var(--primary-neon)' }}>
                        {(camp.viewsDelivered || 0).toLocaleString()} / {camp.targetViews.toLocaleString()} views ({percent}%)
                      </strong>
                    </div>
                    <div style={{ height: 6, background: '#1e1e1e', borderRadius: 3, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${percent}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, var(--primary-neon) 0%, var(--secondary-cyan) 100%)',
                          borderRadius: 3,
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Spend & Deposit Transaction Ledger */}
      <div className="glass-card mobile-p-small" style={{ padding: '18px 20px', borderRadius: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <History size={16} color="var(--secondary-cyan)" />
          <h3 className="font-display" style={{ fontSize: '1.05rem', color: '#ffffff', letterSpacing: '0.02em' }}>
            CREATOR DEPOSITS & SPEND LEDGER
          </h3>
        </div>

        <div className="responsive-table-wrapper">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', minWidth: 480 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-stroke)', textAlign: 'left', color: 'var(--on-surface-variant)' }}>
                <th style={{ padding: '8px 10px' }}>TYPE</th>
                <th style={{ padding: '8px 10px' }}>AMOUNT (USD)</th>
                <th style={{ padding: '8px 10px' }}>GATEWAY / DETAILS</th>
                <th style={{ padding: '8px 10px' }}>DATE</th>
                <th style={{ padding: '8px 10px' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {!transactions.length ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '20px 0', color: 'var(--on-surface-variant)' }}>
                    No financial transactions recorded yet.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '8px 10px', textTransform: 'uppercase', fontWeight: 600 }}>
                      <span className={`badge-pill ${tx.type === 'deposit' ? 'badge-neon' : 'badge-cyan'}`} style={{ fontSize: '0.6rem', padding: '1px 6px' }}>
                        {tx.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="font-mono" style={{ padding: '8px 10px', fontWeight: 700, color: tx.amount >= 0 ? 'var(--primary-neon)' : '#ef4444' }}>
                      {tx.amount >= 0 ? `+$${tx.amount.toFixed(4)}` : `-$${Math.abs(tx.amount).toFixed(4)}`}
                    </td>
                    <td style={{ padding: '8px 10px', color: 'var(--on-surface-variant)' }}>
                      {tx.notes || tx.gateway || 'Internal System'}
                    </td>
                    <td className="font-mono" style={{ padding: '8px 10px', color: 'var(--on-surface-variant)', fontSize: '0.72rem' }}>
                      {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: '8px 10px' }}>
                      <span style={{ color: 'var(--primary-neon)', fontSize: '0.72rem', fontWeight: 700 }}>
                        {tx.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: 440,
              padding: 24,
              borderRadius: 20,
              border: '1px solid var(--primary-neon)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CreditCard size={18} color="var(--primary-neon)" />
                <h3 className="font-display" style={{ fontSize: '1.25rem', color: '#ffffff' }}>DEPOSIT FUNDS</h3>
              </div>
              <button onClick={() => setShowDepositModal(false)} className="btn btn-ghost" style={{ padding: '4px 8px', borderRadius: 8 }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleDeposit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                  Deposit Amount (USD):
                </label>
                <input
                  type="number"
                  min={1}
                  step="any"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  required
                  className="input-field"
                  style={{ padding: '10px 14px' }}
                />
              </div>

              <div>
                <label className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                  Payment Method:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setDepositGateway('faucetpay')}
                    style={{
                      padding: 10,
                      borderRadius: 10,
                      background: depositGateway === 'faucetpay' ? 'rgba(195,244,0,0.15)' : '#121212',
                      border: depositGateway === 'faucetpay' ? '1px solid var(--primary-neon)' : '1px solid var(--glass-stroke)',
                      color: depositGateway === 'faucetpay' ? 'var(--primary-neon)' : 'var(--on-surface-variant)',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                    }}
                  >
                    FaucetPay
                  </button>

                  <button
                    type="button"
                    onClick={() => setDepositGateway('crypto')}
                    style={{
                      padding: 10,
                      borderRadius: 10,
                      background: depositGateway === 'crypto' ? 'rgba(120,211,238,0.15)' : '#121212',
                      border: depositGateway === 'crypto' ? '1px solid var(--secondary-cyan)' : '1px solid var(--glass-stroke)',
                      color: depositGateway === 'crypto' ? 'var(--secondary-cyan)' : 'var(--on-surface-variant)',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                    }}
                  >
                    Crypto (USDT)
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={depositLoading}
                className="btn btn-neon glow-neon"
                style={{ padding: 12, borderRadius: 12, marginTop: 6 }}
              >
                {depositLoading ? 'Processing...' : `Confirm $${depositAmount.toFixed(2)} USD Deposit`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
