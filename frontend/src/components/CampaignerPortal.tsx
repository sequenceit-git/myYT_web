import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  CheckCircle2,
  Eye,
  AlertCircle,
  PlusCircle,
  CreditCard,
  RefreshCw,
  BarChart3,
  History,
  ExternalLink,
  Megaphone,
  LayoutDashboard,
  PlaySquare,
  Check,
} from 'lucide-react';
import { Campaign, User, Transaction } from '../types';
import { apiRequest } from '../api';
import { ProfileSwitchBanner } from './ProfileSwitchBanner';

interface CampaignerPortalProps {
  user: User | null;
  onRefreshUser: () => void;
  onOpenAuth?: (mode: 'signin' | 'signup', role?: 'viewer' | 'campaigner') => void;
  onSwitchProfile?: (targetRole: 'viewer' | 'campaigner') => void;
}

type CreatorTab = 'overview' | 'campaigns' | 'deposit' | 'ledger';

interface DepositMethodConfig {
  id: string;
  name: string;
  logoBg: string;
  logoMark: string;
  rateText: string;
  isBDT?: boolean;
}

const DEPOSIT_METHODS: DepositMethodConfig[] = [
  {
    id: 'faucetpay',
    name: 'FaucetPay',
    logoBg: '#0284c7',
    logoMark: 'FP',
    rateText: 'Instant Automated • Zero Fee (USDT / LTC / BTC)',
  },
  {
    id: 'crypto',
    name: 'Crypto',
    logoBg: '#10b981',
    logoMark: '₮',
    rateText: 'Direct Blockchain (USDT TRC20 / BEP20)',
  },
  {
    id: 'bkash',
    name: 'bKash',
    logoBg: '#e2136e',
    logoMark: 'bK',
    rateText: '1 USD = 122 BDT (Personal / Merchant MFS)',
    isBDT: true,
  },
  {
    id: 'nagad',
    name: 'Nagad',
    logoBg: '#f7941d',
    logoMark: 'Nagad',
    rateText: '1 USD = 122 BDT (Personal / Merchant MFS)',
    isBDT: true,
  },
];

export const CampaignerPortal: React.FC<CampaignerPortalProps> = ({
  user,
  onRefreshUser,
  onOpenAuth,
  onSwitchProfile,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<CreatorTab>('overview');

  // Deposit State
  const [depositAmount, setDepositAmount] = useState<number>(5);
  const [depositGateway, setDepositGateway] = useState<string>('faucetpay');
  const [depositLoading, setDepositLoading] = useState<boolean>(false);

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

  // Handle Deposit
  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      if (onOpenAuth) onOpenAuth('signin');
      return;
    }

    if (depositAmount < 5) {
      setFeedback({ type: 'error', message: 'Minimum deposit is $5.00 USD (≈ ৳610 BDT).' });
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
      setFeedback({ type: 'success', message: `✓ Successfully deposited $${depositAmount.toFixed(2)} USD ad budget!` });
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

  const bdtRate = 122;
  const selectedMethod = DEPOSIT_METHODS.find((m) => m.id === depositGateway) || DEPOSIT_METHODS[0];

  return (
    <div className="responsive-container">
      <div className="dashboard-layout">
        
        {/* =========================================================================
            SIDEBAR (LARGER TEXT - 1 SIZE UP)
            ========================================================================= */}
        <aside className="dashboard-sidebar">
          {/* User Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 14, borderBottom: '1px solid #f1f5f9' }}>
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user?.email || 'creator')}`}
              alt="avatar"
              style={{ width: 46, height: 46, borderRadius: '50%', border: '2px solid var(--primary-neon)', objectFit: 'cover' }}
            />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
              onClick={() => { setActiveTab('overview'); setFeedback(null); }}
              className={`dashboard-nav-item ${activeTab === 'overview' ? 'active-neon' : ''}`}
            >
              <div className="nav-left">
                <LayoutDashboard size={20} />
                <span>Overview</span>
              </div>
            </button>

            <button
              onClick={() => { setActiveTab('campaigns'); setFeedback(null); }}
              className={`dashboard-nav-item ${activeTab === 'campaigns' ? 'active-neon' : ''}`}
            >
              <div className="nav-left">
                <Megaphone size={20} />
                <span>Campaigns</span>
              </div>
              <span className="dashboard-nav-badge badge-active">{campaigns.length}</span>
            </button>

            <button
              onClick={() => navigate('/buy-views')}
              className="dashboard-nav-item"
            >
              <div className="nav-left">
                <PlusCircle size={20} />
                <span>New Campaign</span>
              </div>
            </button>

            <button
              onClick={() => { setActiveTab('deposit'); setFeedback(null); }}
              className={`dashboard-nav-item ${activeTab === 'deposit' ? 'active-neon' : ''}`}
            >
              <div className="nav-left">
                <CreditCard size={20} />
                <span>Deposit Budget</span>
              </div>
            </button>

            <button
              onClick={() => { setActiveTab('ledger'); setFeedback(null); }}
              className={`dashboard-nav-item ${activeTab === 'ledger' ? 'active-neon' : ''}`}
            >
              <div className="nav-left">
                <History size={20} />
                <span>Spend Ledger</span>
              </div>
            </button>
          </nav>

          {/* Profile Switch Button */}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
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

          {/* Budget Display */}
          <div style={{ background: '#f0f9ff', padding: '14px 16px', borderRadius: 14, border: '1px solid rgba(14, 165, 233, 0.22)', marginTop: 'auto' }}>
            <div className="font-mono" style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
              Ad Budget
            </div>
            <div className="font-mono" style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--primary-neon)', marginTop: 2 }}>
              ${(user?.balance || 0).toFixed(2)} <span style={{ fontSize: '0.8rem', color: '#64748b' }}>USD</span>
            </div>
          </div>
        </aside>

        {/* =========================================================================
            MAIN CONTENT AREA
            ========================================================================= */}
        <main className="dashboard-main">
          {/* Eye-Catching Switch Banner */}
          <ProfileSwitchBanner
            currentRole="creator"
            user={user}
            onSwitchProfile={onSwitchProfile || (() => navigate('/viewer'))}
          />

          {/* Alert Notice */}
          {feedback && (
            <div
              style={{
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                borderRadius: 12,
                borderLeft: feedback.type === 'success' ? '4px solid var(--primary-neon)' : '4px solid #ef4444',
                background: feedback.type === 'success' ? '#f0f9ff' : '#fef2f2',
                fontSize: '0.92rem',
                fontWeight: 600,
                color: feedback.type === 'success' ? '#0369a1' : '#b91c1c',
              }}
            >
              {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              
              {/* Header Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <h1 className="font-display" style={{ fontSize: '1.85rem', color: '#0f172a', margin: 0, letterSpacing: '0.01em' }}>
                  CREATOR STUDIO
                </h1>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => navigate('/buy-views')}
                    className="btn btn-neon glow-neon"
                    style={{ padding: '9px 18px', fontSize: '0.88rem', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <PlusCircle size={15} /> New Campaign
                  </button>
                  <button
                    onClick={() => setActiveTab('deposit')}
                    className="btn btn-cyan"
                    style={{ padding: '9px 18px', fontSize: '0.88rem', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <CreditCard size={15} /> Deposit Budget
                  </button>
                </div>
              </div>

              {/* 4 Metric Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 14 }}>
                {/* 1. Campaign Balance */}
                <div className="glass-card" style={{ padding: '20px', border: '1.5px solid rgba(14, 165, 233, 0.4)', borderRadius: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="font-mono" style={{ fontSize: '0.84rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Ad Balance
                    </span>
                    <CreditCard size={18} color="var(--primary-neon)" />
                  </div>
                  <div className="font-mono" style={{ fontSize: '2.3rem', fontWeight: 800, color: 'var(--primary-neon)', marginTop: 6, lineHeight: 1 }}>
                    ${(user?.balance || 0).toFixed(2)}
                  </div>
                  <button
                    onClick={() => setActiveTab('deposit')}
                    className="btn btn-ghost"
                    style={{ marginTop: 12, width: '100%', padding: '7px', fontSize: '0.82rem', borderRadius: 8, color: 'var(--primary-neon)' }}
                  >
                    + Deposit Budget
                  </button>
                </div>

                {/* 2. Views Delivered */}
                <div className="glass-card" style={{ padding: '20px', borderRadius: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="font-mono" style={{ fontSize: '0.84rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Delivered
                    </span>
                    <Eye size={18} color="#059669" />
                  </div>
                  <div className="font-mono" style={{ fontSize: '2.3rem', fontWeight: 800, color: '#0f172a', marginTop: 6, lineHeight: 1 }}>
                    {totalViewsDelivered.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 10 }}>
                    of {totalViewsTargeted.toLocaleString()} targeted views
                  </div>
                </div>

                {/* 3. Total Invested */}
                <div className="glass-card" style={{ padding: '20px', borderRadius: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="font-mono" style={{ fontSize: '0.84rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Invested
                    </span>
                    <BarChart3 size={18} color="#7c3aed" />
                  </div>
                  <div className="font-mono" style={{ fontSize: '2.3rem', fontWeight: 800, color: '#7c3aed', marginTop: 6, lineHeight: 1 }}>
                    ${(user?.totalSpent || 0).toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 10 }}>
                    Total promotion spend
                  </div>
                </div>

                {/* 4. Active Campaigns */}
                <div className="glass-card" style={{ padding: '20px', borderRadius: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="font-mono" style={{ fontSize: '0.84rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Active
                    </span>
                    <Megaphone size={18} color="#d97706" />
                  </div>
                  <div className="font-mono" style={{ fontSize: '2.3rem', fontWeight: 800, color: '#d97706', marginTop: 6, lineHeight: 1 }}>
                    {activeCampaignsCount}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 10 }}>
                    Running in viewer queue
                  </div>
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
                      style={{ background: 'none', border: 'none', color: 'var(--primary-neon)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Launch a campaign
                    </button>!
                  </div>
                ) : (
                  <div className="responsive-table-wrapper">
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
                                <span style={{ fontWeight: 600, color: '#0f172a', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {camp.title || `Video ${camp.videoId}`}
                                </span>
                              </div>
                            </td>
                            <td className="font-mono" style={{ padding: '10px 12px', color: 'var(--primary-neon)', fontWeight: 700 }}>
                              {camp.viewsDelivered.toLocaleString()} / {camp.targetViews.toLocaleString()}
                            </td>
                            <td style={{ padding: '10px 12px' }}>
                              <span className="badge-pill" style={{ padding: '2px 8px', fontSize: '0.72rem', textTransform: 'uppercase', background: camp.status === 'active' ? '#e0f2fe' : '#f1f5f9', color: camp.status === 'active' ? 'var(--primary-neon)' : '#64748b' }}>
                                {camp.status}
                              </span>
                            </td>
                            <td style={{ padding: '10px 12px' }}>
                              <button
                                onClick={() => togglePause(camp)}
                                className="btn btn-ghost"
                                style={{ padding: '4px 10px', fontSize: '0.76rem', borderRadius: 6 }}
                              >
                                {camp.status === 'active' ? <Pause size={13} /> : <Play size={13} />}
                                <span>{camp.status === 'active' ? 'Pause' : 'Resume'}</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ALL CAMPAIGNS */}
          {activeTab === 'campaigns' && (
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
                <div className="responsive-table-wrapper">
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
                                <div style={{ fontWeight: 600, color: '#0f172a', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {camp.title || `Video ${camp.videoId}`}
                                </div>
                                <a
                                  href={`https://youtube.com/watch?v=${camp.videoId}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{ fontSize: '0.74rem', color: 'var(--primary-neon)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}
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
                            <span className="badge-pill" style={{ padding: '2px 8px', fontSize: '0.72rem', textTransform: 'uppercase', background: camp.status === 'active' ? '#e0f2fe' : '#f1f5f9', color: camp.status === 'active' ? 'var(--primary-neon)' : '#64748b' }}>
                              {camp.status}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <button
                              onClick={() => togglePause(camp)}
                              className="btn btn-ghost"
                              style={{ padding: '4px 10px', fontSize: '0.76rem', borderRadius: 6 }}
                            >
                              {camp.status === 'active' ? 'Pause' : 'Resume'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              TAB 3: DEPOSIT (INDIVIDUAL METHOD CARDS - PICK AMOUNT & DEPOSIT)
              ========================================================================= */}
          {activeTab === 'deposit' && (
            <div className="glass-card" style={{ padding: '24px', borderRadius: 18, border: '1.5px solid var(--primary-neon)' }}>
              
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <h3 className="font-display" style={{ fontSize: '1.45rem', color: '#0f172a', margin: 0 }}>
                    DEPOSIT AD BUDGET
                  </h3>
                  <span style={{ fontSize: '0.88rem', color: '#64748b' }}>
                    Current Balance: <strong className="font-mono" style={{ color: 'var(--primary-neon)' }}>${(user?.balance || 0).toFixed(2)} USD</strong>
                  </span>
                </div>
                <span className="badge-pill badge-neon" style={{ fontSize: '0.74rem', padding: '4px 12px' }}>
                  Min Deposit: $5.00 USD (≈ ৳610 BDT)
                </span>
              </div>

              {/* INDIVIDUAL DEPOSIT METHOD CARDS - LOGO PLACEHOLDER + NAME ONLY */}
              <div style={{ marginBottom: 18 }}>
                <label className="font-mono" style={{ fontSize: '0.82rem', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: 10, fontWeight: 700 }}>
                  Select Deposit Method:
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
                  {DEPOSIT_METHODS.map((m) => {
                    const isSelected = depositGateway === m.id;
                    return (
                      <div
                        key={m.id}
                        onClick={() => {
                          setDepositGateway(m.id);
                          setFeedback(null);
                        }}
                        style={{
                          background: isSelected ? '#f0f9ff' : '#ffffff',
                          border: isSelected ? '2px solid var(--primary-neon)' : '1px solid #e2e8f0',
                          borderRadius: 14,
                          padding: '16px 12px',
                          cursor: 'pointer',
                          transition: 'all 0.18s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 10,
                          position: 'relative',
                          boxShadow: isSelected ? '0 4px 14px rgba(14, 165, 233, 0.2)' : '0 1px 3px rgba(0,0,0,0.02)',
                        }}
                      >
                        {/* Checkmark Indicator */}
                        {isSelected && (
                          <div
                            style={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              width: 18,
                              height: 18,
                              borderRadius: '50%',
                              background: 'var(--primary-neon)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Check size={11} color="#ffffff" strokeWidth={3} />
                          </div>
                        )}

                        {/* Logo Placeholder */}
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 12,
                            background: m.logoBg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                            fontWeight: 800,
                            fontSize: m.logoMark.length > 2 ? '0.78rem' : '1.1rem',
                            letterSpacing: '0.02em',
                            boxShadow: `0 3px 10px ${m.logoBg}40`,
                          }}
                        >
                          {m.logoMark}
                        </div>

                        {/* Simple Text: Just Name Only */}
                        <span style={{ fontSize: '1.02rem', fontWeight: 800, color: '#0f172a', textAlign: 'center' }}>
                          {m.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* DEPOSIT FORM: PICK AMOUNT & SUBMIT */}
              <form onSubmit={handleDeposit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label className="font-mono" style={{ fontSize: '0.84rem', color: '#475569', display: 'block', marginBottom: 6, fontWeight: 600 }}>
                    Select or Enter Amount (USD):
                  </label>

                  {/* Preset Amount Pills ($5 Minimum) */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                    {[5, 10, 25, 50, 100, 250].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setDepositAmount(preset)}
                        className="btn btn-ghost"
                        style={{
                          padding: '6px 14px',
                          fontSize: '0.86rem',
                          borderRadius: 8,
                          background: depositAmount === preset ? '#e0f2fe' : '#ffffff',
                          color: depositAmount === preset ? 'var(--primary-neon)' : '#64748b',
                          borderColor: depositAmount === preset ? 'var(--primary-neon)' : 'rgba(14, 165, 233, 0.25)',
                          fontWeight: depositAmount === preset ? 800 : 500,
                        }}
                      >
                        ${preset}
                      </button>
                    ))}
                  </div>

                  <input
                    type="number"
                    min="5"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(parseFloat(e.target.value) || 5)}
                    className="input-field"
                    style={{ padding: '12px 14px', fontSize: '1rem' }}
                    required
                  />
                </div>

                {/* Real-Time Summary Box */}
                <div
                  style={{
                    background: '#f0f9ff',
                    padding: '14px 18px',
                    borderRadius: 12,
                    border: '1px solid rgba(14, 165, 233, 0.25)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.9rem', color: '#334155' }}>
                      Deposit Method: <strong>{selectedMethod.name}</strong>
                    </span>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      {selectedMethod.rateText}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.74rem', color: '#64748b', display: 'block' }}>Total To Pay:</span>
                    <strong className="font-mono" style={{ fontSize: '1.35rem', color: 'var(--primary-neon)' }}>
                      {selectedMethod.isBDT
                        ? `৳${(depositAmount * bdtRate).toLocaleString()} BDT`
                        : `$${depositAmount.toFixed(2)} USD`}
                    </strong>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={depositLoading || depositAmount < 5}
                  className="btn btn-neon glow-neon"
                  style={{ padding: '13px', fontSize: '0.96rem', borderRadius: 12, marginTop: 4 }}
                >
                  {depositLoading ? 'Processing...' : `Confirm & Deposit $${depositAmount.toFixed(2)} USD via ${selectedMethod.name}`}
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: LEDGER */}
          {activeTab === 'ledger' && (
            <div className="glass-card" style={{ padding: '22px', borderRadius: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 className="font-display" style={{ fontSize: '1.35rem', color: '#0f172a', margin: 0 }}>
                  SPEND LEDGER
                </h3>
                <button
                  onClick={fetchTransactions}
                  className="btn btn-ghost"
                  style={{ padding: '5px 12px', fontSize: '0.84rem', borderRadius: 8 }}
                >
                  <RefreshCw size={14} /> Refresh
                </button>
              </div>

              {!transactions.length ? (
                <div style={{ textAlign: 'center', padding: '28px', color: '#64748b', fontSize: '0.92rem' }}>
                  No transaction history recorded yet.
                </div>
              ) : (
                <div className="responsive-table-wrapper">
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1.5px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                        <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.78rem', fontWeight: 700 }}>Type</th>
                        <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.78rem', fontWeight: 700 }}>Amount</th>
                        <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.78rem', fontWeight: 700 }}>Balance</th>
                        <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.78rem', fontWeight: 700 }}>Status</th>
                        <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.78rem', fontWeight: 700 }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr key={tx._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px 12px' }}>
                            <span className="badge-pill badge-cyan" style={{ padding: '2px 8px', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                              {tx.type}
                            </span>
                          </td>
                          <td className="font-mono" style={{ padding: '10px 12px', fontWeight: 700, color: tx.amount > 0 ? 'var(--primary-neon)' : '#ef4444' }}>
                            {tx.amount > 0 ? `+$${tx.amount.toFixed(2)}` : `-$${Math.abs(tx.amount).toFixed(2)}`}
                          </td>
                          <td className="font-mono" style={{ padding: '10px 12px', color: '#0f172a' }}>
                            ${(tx.balanceAfter || 0).toFixed(2)}
                          </td>
                          <td style={{ padding: '10px 12px', color: tx.status === 'completed' ? '#059669' : '#d97706', fontWeight: 600 }}>
                            {tx.status}
                          </td>
                          <td style={{ padding: '10px 12px', color: '#64748b' }}>
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
