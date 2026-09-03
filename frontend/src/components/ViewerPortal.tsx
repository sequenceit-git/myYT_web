import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Play,
  PlaySquare,
  ArrowUpRight,
  History,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  CreditCard,
  RefreshCw,
  LayoutDashboard,
  Rocket,
  Check,
  Smartphone,
  Download,
  ExternalLink,
} from 'lucide-react';
import { User, Task, Transaction } from '../types';
import { apiRequest } from '../api';
import { ProfileSwitchBanner } from './ProfileSwitchBanner';

interface ViewerPortalProps {
  user: User | null;
  onRefreshUser: () => void;
  onOpenAuth?: (mode: 'signin' | 'signup', role?: 'viewer' | 'campaigner') => void;
  onStartWatching?: () => void;
  onSwitchProfile?: (targetRole: 'viewer' | 'campaigner') => void;
}

type ViewerTab = 'overview' | 'watch' | 'withdraw' | 'transactions';

type PayoutMethodType = 'bkash' | 'nagad' | 'faucetpay' | 'crypto' | 'webmoney';

interface PayoutMethodConfig {
  id: PayoutMethodType;
  name: string;
  logoBg: string;
  logoMark: string;
  inputLabel: string;
  placeholder: string;
  rateText: string;
  isBDT: boolean;
}

const PAYOUT_METHODS: PayoutMethodConfig[] = [
  {
    id: 'bkash',
    name: 'bKash',
    logoBg: '#e2136e',
    logoMark: 'bK',
    inputLabel: 'bKash Personal Mobile Number',
    placeholder: '017XXXXXXXX or 019XXXXXXXX',
    rateText: '1 USD = 122 BDT',
    isBDT: true,
  },
  {
    id: 'nagad',
    name: 'Nagad',
    logoBg: '#f7941d',
    logoMark: 'Nagad',
    inputLabel: 'Nagad Personal Mobile Number',
    placeholder: '017XXXXXXXX or 018XXXXXXXX',
    rateText: '1 USD = 122 BDT',
    isBDT: true,
  },
  {
    id: 'faucetpay',
    name: 'FaucetPay',
    logoBg: '#0284c7',
    logoMark: 'FP',
    inputLabel: 'FaucetPay Registered Email',
    placeholder: 'your-email@example.com',
    rateText: 'Instant USDT / LTC • Zero Fee',
    isBDT: false,
  },
  {
    id: 'crypto',
    name: 'Crypto',
    logoBg: '#10b981',
    logoMark: '₮',
    inputLabel: 'Crypto Wallet Address (USDT TRC20 / LTC)',
    placeholder: 'T... or L... or 0x...',
    rateText: 'Direct Blockchain (TRC20 / BEP20)',
    isBDT: false,
  },
  {
    id: 'webmoney',
    name: 'WebMoney',
    logoBg: '#3b82f6',
    logoMark: 'WM',
    inputLabel: 'WebMoney WMZ Purse ID',
    placeholder: 'Z123456789012',
    rateText: 'USD Purse (WMZ)',
    isBDT: false,
  },
];

export const ViewerPortal: React.FC<ViewerPortalProps> = ({
  user,
  onRefreshUser,
  onOpenAuth,
  onSwitchProfile,
}) => {
  const [activeTab, setActiveTab] = useState<ViewerTab>('overview');

  // Watch History & Transactions State
  const [watchHistory, setWatchHistory] = useState<any[]>([]);
  const [watchHistoryLoading, setWatchHistoryLoading] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Withdraw State
  const [withdrawMethod, setWithdrawMethod] = useState<PayoutMethodType>('bkash');
  const [withdrawAmount, setWithdrawAmount] = useState<number>(5.0);
  const [accountDetails, setAccountDetails] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch Watch History (Videos Watch & Earn Ledger)
  const fetchWatchHistory = async () => {
    setWatchHistoryLoading(true);
    const res = await apiRequest<any[]>('/tasks/history');
    setWatchHistoryLoading(false);
    if (res.success && res.data) {
      setWatchHistory(res.data);
    }
  };

  // Fetch Transactions
  const fetchTransactions = async () => {
    const res = await apiRequest<Transaction[]>('/wallet/transactions');
    if (res.success && res.data) {
      setTransactions(res.data);
    }
  };

  useEffect(() => {
    if (user) {
      fetchWatchHistory();
      fetchTransactions();
    }
  }, [user]);

  // Handle Withdrawal
  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    if (!user) {
      setMsg({ type: 'error', text: 'Please sign in to withdraw earnings.' });
      return;
    }

    const currentViewerBal = user.viewerBalance !== undefined ? user.viewerBalance : Math.max(0, (user.totalEarned || 0) - (user.totalWithdrawn || 0));

    if (withdrawAmount < 5.0) {
      setMsg({ type: 'error', text: 'Minimum withdrawal is $5.00 USD (≈ ৳610 BDT).' });
      return;
    }

    if (currentViewerBal < withdrawAmount) {
      setMsg({ type: 'error', text: `Insufficient viewer balance ($${currentViewerBal.toFixed(4)} available).` });
      return;
    }

    if (!accountDetails.trim()) {
      setMsg({ type: 'error', text: 'Please enter recipient account / wallet details.' });
      return;
    }

    setLoading(true);
    const res = await apiRequest<any>('/wallet/withdraw', {
      method: 'POST',
      body: JSON.stringify({
        amount: Number(withdrawAmount),
        method: withdrawMethod,
        accountDetails,
      }),
    });
    setLoading(false);

    if (res.success) {
      setMsg({ type: 'success', text: '✓ Withdrawal submitted successfully! Payout will be disbursed shortly.' });
      setAccountDetails('');
      onRefreshUser();
      fetchTransactions();
    } else {
      setMsg({ type: 'error', text: res.error || 'Withdrawal failed' });
    }
  };

  if (!user) {
    return (
      <div className="responsive-container" style={{ margin: '40px auto', padding: 20, textAlign: 'center' }}>
        <h2 className="font-display" style={{ fontSize: '1.4rem', color: '#0f172a' }}>Please Sign In</h2>
        <button
          onClick={() => onOpenAuth && onOpenAuth('signin')}
          className="btn btn-neon glow-neon"
          style={{ marginTop: 12, padding: '8px 18px', fontSize: '0.78rem' }}
        >
          Sign In
        </button>
      </div>
    );
  }

  const viewerBal = user.viewerBalance !== undefined ? user.viewerBalance : Math.max(0, (user.totalEarned || 0) - (user.totalWithdrawn || 0));
  const bdtRate = 122;
  const approxBDT = (viewerBal * bdtRate).toFixed(0);
  const selectedConfig = PAYOUT_METHODS.find((m) => m.id === withdrawMethod) || PAYOUT_METHODS[0];

  return (
    <div className="responsive-container">
      <div className="dashboard-layout">

        {/* =========================================================================
            SIDEBAR (LARGER TEXT - 2 SIZES UP)
            ========================================================================= */}
        <aside className="dashboard-sidebar">
          {/* User Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 14, borderBottom: '1px solid #f1f5f9' }}>
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.email || 'user')}`}
              alt="avatar"
              style={{ width: 46, height: 46, borderRadius: '50%', border: '2px solid var(--primary-neon)', objectFit: 'cover' }}
            />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
              onClick={() => { setActiveTab('overview'); setMsg(null); }}
              className={`dashboard-nav-item ${activeTab === 'overview' ? 'active-neon' : ''}`}
            >
              <div className="nav-left">
                <LayoutDashboard size={20} />
                <span>Overview</span>
              </div>
            </button>

            <button
              onClick={() => { setActiveTab('watch'); setMsg(null); }}
              className={`dashboard-nav-item ${activeTab === 'watch' ? 'active-neon' : ''}`}
            >
              <div className="nav-left">
                <Smartphone size={20} />
                <span>Watch & Earn</span>
              </div>
              <span className="dashboard-nav-badge badge-hot">APP</span>
            </button>

            <button
              onClick={() => { setActiveTab('withdraw'); setMsg(null); }}
              className={`dashboard-nav-item ${activeTab === 'withdraw' ? 'active-neon' : ''}`}
            >
              <div className="nav-left">
                <ArrowUpRight size={20} />
                <span>Withdraw Cash</span>
              </div>
            </button>

            <button
              onClick={() => { setActiveTab('transactions'); setMsg(null); }}
              className={`dashboard-nav-item ${activeTab === 'transactions' ? 'active-neon' : ''}`}
            >
              <div className="nav-left">
                <History size={20} />
                <span>Payout Ledger</span>
              </div>
            </button>
          </nav>

          {/* Profile Switch Button */}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
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

          {/* Balance Display */}
          <div style={{ background: '#f0f9ff', padding: '14px 16px', borderRadius: 14, border: '1px solid rgba(14, 165, 233, 0.22)', marginTop: 'auto' }}>
            <div className="font-mono" style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
              Available Earnings
            </div>
            <div className="font-mono" style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--primary-neon)', marginTop: 2 }}>
              ${viewerBal.toFixed(4)} <span style={{ fontSize: '0.8rem', color: '#64748b' }}>USD</span>
            </div>
            <div className="font-mono" style={{ fontSize: '0.85rem', color: '#059669', fontWeight: 600, marginTop: 2 }}>
              ≈ ৳{approxBDT} BDT
            </div>
          </div>
        </aside>

        {/* =========================================================================
            MINIMAL MAIN CONTENT
            ========================================================================= */}
        <main className="dashboard-main">
          {/* Eye-Catching Compact Switch Banner */}
          <ProfileSwitchBanner
            currentRole="viewer"
            user={user}
            onSwitchProfile={onSwitchProfile || (() => { })}
          />

          {/* Alert Message */}
          {msg && (
            <div
              style={{
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                borderRadius: 10,
                borderLeft: msg.type === 'success' ? '3px solid var(--primary-neon)' : '3px solid #ef4444',
                background: msg.type === 'success' ? '#f0f9ff' : '#fef2f2',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: msg.type === 'success' ? '#0369a1' : '#b91c1c',
              }}
            >
              {msg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{msg.text}</span>
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Quick Actions Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <h1 className="font-display" style={{ fontSize: '1.85rem', color: '#0f172a', margin: 0, letterSpacing: '0.01em' }}>
                  VIEWER STUDIO
                </h1>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => setActiveTab('watch')}
                    className="btn btn-neon glow-neon"
                    style={{ padding: '9px 18px', fontSize: '0.88rem', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <Smartphone size={15} /> Watch & Earn (App)
                  </button>
                  <button
                    onClick={() => setActiveTab('withdraw')}
                    className="btn btn-cyan"
                    style={{ padding: '9px 18px', fontSize: '0.88rem', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <ArrowUpRight size={15} /> Withdraw Cash
                  </button>
                </div>
              </div>

              {/* 3 Metric Cards Grid (No Deposit) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 14 }}>
                {/* 1. Cash Balance */}
                <div className="glass-card" style={{ padding: '20px', border: '1.5px solid rgba(14, 165, 233, 0.4)', borderRadius: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="font-mono" style={{ fontSize: '0.84rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Available Earnings
                    </span>
                    <Wallet size={18} color="var(--primary-neon)" />
                  </div>
                  <div className="font-mono" style={{ fontSize: '2.3rem', fontWeight: 800, color: 'var(--primary-neon)', marginTop: 6, lineHeight: 1 }}>
                    ${viewerBal.toFixed(4)}
                  </div>
                  <div className="font-mono" style={{ fontSize: '0.84rem', color: '#059669', fontWeight: 600, marginTop: 4 }}>
                    ≈ ৳{approxBDT} BDT
                  </div>
                  <button
                    onClick={() => setActiveTab('withdraw')}
                    className="btn btn-ghost"
                    style={{ marginTop: 12, width: '100%', padding: '7px', fontSize: '0.82rem', borderRadius: 8, color: 'var(--primary-neon)' }}
                  >
                    <ArrowUpRight size={13} /> Withdraw Cash
                  </button>
                </div>

                {/* 2. Total Earned */}
                <div className="glass-card" style={{ padding: '20px', borderRadius: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="font-mono" style={{ fontSize: '0.84rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Total Earned
                    </span>
                    <TrendingUp size={18} color="#059669" />
                  </div>
                  <div className="font-mono" style={{ fontSize: '2.3rem', fontWeight: 800, color: '#059669', marginTop: 6, lineHeight: 1 }}>
                    ${(user.totalEarned || 0).toFixed(4)}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 10 }}>
                    Lifetime watch rewards
                  </div>
                </div>

                {/* 3. Total Withdrawn */}
                <div className="glass-card" style={{ padding: '20px', borderRadius: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="font-mono" style={{ fontSize: '0.84rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Total Withdrawn
                    </span>
                    <CreditCard size={18} color="#7c3aed" />
                  </div>
                  <div className="font-mono" style={{ fontSize: '2.3rem', fontWeight: 800, color: '#7c3aed', marginTop: 6, lineHeight: 1 }}>
                    ${(user.totalWithdrawn || 0).toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 10 }}>
                    Disbursed to bKash/Nagad/Crypto
                  </div>
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
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--primary-neon)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Smartphone size={24} />
                  </div>
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
                    href="/downloads/myyt.apk"
                    download="myyt.apk"
                    className="btn btn-neon glow-neon"
                    style={{ padding: '8px 16px', fontSize: '0.84rem', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none', fontWeight: 700 }}
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

              {/* Recent Transactions Table */}
              <div className="glass-card" style={{ padding: '20px', borderRadius: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h3 className="font-display" style={{ fontSize: '1.18rem', color: '#0f172a', margin: 0 }}>
                    RECENT TRANSACTIONS
                  </h3>
                  <button
                    onClick={() => setActiveTab('transactions')}
                    className="btn btn-ghost"
                    style={{ padding: '4px 10px', fontSize: '0.82rem', borderRadius: 8 }}
                  >
                    View All →
                  </button>
                </div>

                {!transactions.length ? (
                  <div style={{ textAlign: 'center', padding: '24px', color: '#64748b', fontSize: '0.92rem' }}>
                    No transactions yet. Click "Watch & Earn" to start!
                  </div>
                ) : (
                  <div className="responsive-table-wrapper">
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1.5px solid #e2e8f0', color: 'var(--on-surface-variant)', textAlign: 'left' }}>
                          <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.78rem', fontWeight: 700 }}>Type</th>
                          <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.78rem', fontWeight: 700 }}>Amount</th>
                          <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.78rem', fontWeight: 700 }}>Status</th>
                          <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.78rem', fontWeight: 700 }}>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.slice(0, 4).map((tx) => (
                          <tr key={tx._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '10px 12px' }}>
                              <span className="badge-pill badge-cyan" style={{ padding: '2px 8px', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                                {tx.type}
                              </span>
                            </td>
                            <td className="font-mono" style={{ padding: '10px 12px', fontWeight: 700, fontSize: '0.92rem', color: tx.amount > 0 ? 'var(--primary-neon)' : '#ef4444' }}>
                              {tx.amount > 0 ? `+$${tx.amount.toFixed(4)}` : `-$${Math.abs(tx.amount).toFixed(2)}`}
                            </td>
                            <td style={{ padding: '10px 12px', color: tx.status === 'completed' ? '#059669' : '#d97706', fontWeight: 600 }}>
                              {tx.status}
                            </td>
                            <td style={{ padding: '10px 12px', color: 'var(--on-surface-variant)' }}>
                              {new Date(tx.createdAt).toLocaleDateString()}
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

          {/* TAB 2: WATCH & EARN (MOBILE APP ENFORCEMENT & WATCH LEDGER) */}
          {activeTab === 'watch' && (
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
                  onClick={() => { fetchWatchHistory(); onRefreshUser(); }}
                  className="btn btn-ghost"
                  style={{ padding: '6px 14px', fontSize: '0.84rem', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <RefreshCw size={14} className={watchHistoryLoading ? 'animate-spin' : ''} /> Refresh Ledger
                </button>
              </div>

              {/* 1. Mobile App Enforcement Hero Card */}
              <div
                className="glass-card"
                style={{
                  padding: '24px',
                  borderRadius: 18,
                  border: '1.5px solid var(--primary-neon)',
                  background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.08) 0%, rgba(255, 255, 255, 0.98) 100%)',
                  boxShadow: '0 10px 30px rgba(14, 165, 233, 0.12)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                  <div style={{ flex: 1, minWidth: 280 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span className="badge-pill badge-hot" style={{ fontSize: '0.74rem', padding: '3px 10px' }}>
                        ⚡ MOBILE EXCLUSIVE
                      </span>
                      <span className="badge-pill badge-cyan" style={{ fontSize: '0.74rem', padding: '3px 10px' }}>
                        Android v1.0.0
                      </span>
                    </div>
                    <h2 className="font-display" style={{ fontSize: '1.65rem', color: '#0f172a', margin: '4px 0 10px 0' }}>
                      Watch Videos & Earn on the myYT Android App
                    </h2>
                    <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.55, margin: 0, maxWidth: 640 }}>
                      To prevent fraud and guarantee creator view verification, video watching is supported <strong>exclusively inside our official Android application</strong>. The app features a smart floating bubble overlay, automatic ad skip detection, and instant automated payout verification.
                    </p>
                  </div>

                  {/* Download CTA Box */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 220 }}>
                    <a
                      href="/downloads/myyt.apk"
                      download="myyt.apk"
                      className="btn btn-neon glow-neon"
                      style={{
                        padding: '12px 20px',
                        fontSize: '0.96rem',
                        borderRadius: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        textDecoration: 'none',
                        fontWeight: 700,
                      }}
                    >
                      <Download size={18} /> Download Android App (.APK)
                    </a>
                    <a
                      href="https://expo.dev/accounts/ovijitm/projects/myyt/builds"
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-ghost"
                      style={{
                        padding: '7px 12px',
                        fontSize: '0.78rem',
                        borderRadius: 8,
                        textAlign: 'center',
                        textDecoration: 'none',
                        color: '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 5,
                      }}
                    >
                      <ExternalLink size={12} /> EAS Builds & Mirror Links
                    </a>
                  </div>
                </div>

                {/* 3 Step Guide Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginTop: 22, paddingTop: 18, borderTop: '1px solid rgba(14, 165, 233, 0.18)' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: '#0284c7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.95rem', flexShrink: 0 }}>
                      1
                    </div>
                    <div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>1. Download & Install</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>Install the myYT APK on your Android device.</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: '#0284c7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.95rem', flexShrink: 0 }}>
                      2
                    </div>
                    <div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>2. Sign In to Your Account</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>Log in with {user?.email || 'your email'} to link your wallet.</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.95rem', flexShrink: 0 }}>
                      3
                    </div>
                    <div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>3. Watch & Auto-Earn</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>The floating countdown credits earnings automatically.</div>
                    </div>
                  </div>
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
                      Detailed log of all YouTube videos watched and watch rewards credited to your wallet via mobile.
                    </span>
                  </div>
                </div>

                {/* Summary Stats Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 18 }}>
                  <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: 14, border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Videos Watched</div>
                    <div className="font-mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: 3 }}>
                      {watchHistory.length}
                    </div>
                  </div>
                  <div style={{ background: '#f0fdf4', padding: '14px 18px', borderRadius: 14, border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                    <div style={{ fontSize: '0.78rem', color: '#059669', textTransform: 'uppercase', fontWeight: 700 }}>Total Watch Rewards</div>
                    <div className="font-mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669', marginTop: 3 }}>
                      +${watchHistory.reduce((sum, t) => sum + (t.rewardAmount || 0.0035), 0).toFixed(4)} USD
                    </div>
                  </div>
                  <div style={{ background: '#f0f9ff', padding: '14px 18px', borderRadius: 14, border: '1px solid rgba(14, 165, 233, 0.25)' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--primary-neon)', textTransform: 'uppercase', fontWeight: 700 }}>Total Watch Seconds</div>
                    <div className="font-mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-neon)', marginTop: 3 }}>
                      {watchHistory.reduce((sum, t) => sum + (t.actualDurationSec || t.requiredDurationSec || 0), 0)}s
                    </div>
                  </div>
                </div>

                {!watchHistory.length ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b', fontSize: '0.92rem' }}>
                    <Smartphone size={40} color="#94a3b8" style={{ margin: '0 auto 12px auto', display: 'block' }} />
                    <strong style={{ fontSize: '1.05rem', color: '#0f172a', display: 'block' }}>
                      No videos recorded in your watch ledger yet
                    </strong>
                    <p style={{ margin: '6px auto 18px auto', fontSize: '0.88rem', maxWidth: 460, color: '#64748b' }}>
                      Download the myYT Android App above and start watching videos. Your completed views and earnings will appear here instantly!
                    </p>
                    <a
                      href="/downloads/myyt.apk"
                      download="myyt.apk"
                      className="btn btn-neon glow-neon"
                      style={{ padding: '9px 20px', fontSize: '0.88rem', borderRadius: 10, display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none', fontWeight: 700 }}
                    >
                      <Download size={16} /> Download Android App
                    </a>
                  </div>
                ) : (
                  <div className="responsive-table-wrapper">
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1.5px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                          <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.78rem', fontWeight: 700 }}>Video</th>
                          <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.78rem', fontWeight: 700 }}>Watch Duration</th>
                          <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.78rem', fontWeight: 700 }}>Reward Earned</th>
                          <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.78rem', fontWeight: 700 }}>Status</th>
                          <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.78rem', fontWeight: 700 }}>Date & Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {watchHistory.map((item) => (
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
                                    href={`https://www.youtube.com/watch?v=${item.videoId}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ fontSize: '0.75rem', color: 'var(--primary-neon)', textDecoration: 'none' }}
                                  >
                                    Watch on YouTube ↗
                                  </a>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '10px 12px' }}>
                              <span className="font-mono" style={{ fontWeight: 600, color: '#334155' }}>
                                {item.actualDurationSec || item.requiredDurationSec}s
                              </span>
                              <span style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>
                                target {item.requiredDurationSec}s
                              </span>
                            </td>
                            <td className="font-mono" style={{ padding: '10px 12px', fontWeight: 700, fontSize: '0.94rem', color: '#059669' }}>
                              +${(item.rewardAmount || 0.0035).toFixed(4)} USD
                            </td>
                            <td style={{ padding: '10px 12px' }}>
                              <span className="badge-pill badge-active" style={{ padding: '3px 9px', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <CheckCircle2 size={12} /> {item.status === 'completed' ? 'Verified' : item.status}
                              </span>
                            </td>
                            <td style={{ padding: '10px 12px', color: '#64748b', fontSize: '0.84rem' }}>
                              {new Date(item.completedAt || item.createdAt).toLocaleString()}
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

          {/* =========================================================================
              TAB 3: WITHDRAW WITH INDIVIDUAL METHOD CARDS
              ========================================================================= */}
          {activeTab === 'withdraw' && (
            <div className="glass-card" style={{ padding: '24px', borderRadius: 18, border: '1.5px solid var(--primary-neon)' }}>

              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <h3 className="font-display" style={{ fontSize: '1.45rem', color: '#0f172a', margin: 0 }}>
                    WITHDRAW FUNDS
                  </h3>
                  <span style={{ fontSize: '0.88rem', color: '#64748b' }}>
                    Available: <strong className="font-mono" style={{ color: 'var(--primary-neon)' }}>${viewerBal.toFixed(4)} USD</strong> (≈ ৳{approxBDT} BDT)
                  </span>
                </div>
                <span className="badge-pill badge-cyan" style={{ fontSize: '0.74rem', padding: '4px 12px' }}>
                  Min Payout: $5.00 USD (≈ ৳610 BDT)
                </span>
              </div>

              {/* INDIVIDUAL METHOD CARDS - LOGO PLACEHOLDER + NAME ONLY */}
              <div style={{ marginBottom: 18 }}>
                <label className="font-mono" style={{ fontSize: '0.84rem', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: 10, fontWeight: 700 }}>
                  Select Withdrawal Method:
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
                  {PAYOUT_METHODS.map((m) => {
                    const isSelected = withdrawMethod === m.id;
                    return (
                      <div
                        key={m.id}
                        onClick={() => {
                          setWithdrawMethod(m.id);
                          setMsg(null);
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

              {/* WITHDRAWAL FORM */}
              <form onSubmit={handleWithdraw} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                  {/* Amount Input */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <label className="font-mono" style={{ fontSize: '0.84rem', color: '#475569', fontWeight: 700 }}>
                        Amount (USD):
                      </label>
                      <span className="font-mono" style={{ fontSize: '0.82rem', color: 'var(--primary-neon)', fontWeight: 700 }}>
                        Max: ${viewerBal.toFixed(4)}
                      </span>
                    </div>

                    <input
                      type="number"
                      step="0.01"
                      min="5.00"
                      max={viewerBal}
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(parseFloat(e.target.value) || 0)}
                      className="input-field"
                      style={{ padding: '11px 14px', fontSize: '0.98rem' }}
                      required
                    />

                    {/* Quick Amount Pills ($5 Minimum) */}
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      {[5, 10, 25, 50, 100].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setWithdrawAmount(preset)}
                          className="btn btn-ghost"
                          style={{
                            padding: '5px 12px',
                            fontSize: '0.84rem',
                            borderRadius: 8,
                            background: withdrawAmount === preset ? '#e0f2fe' : '#ffffff',
                            color: withdrawAmount === preset ? 'var(--primary-neon)' : '#64748b',
                            fontWeight: withdrawAmount === preset ? 700 : 500,
                          }}
                        >
                          ${preset}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setWithdrawAmount(parseFloat(viewerBal.toFixed(4)))}
                        className="btn btn-ghost"
                        style={{
                          padding: '5px 12px',
                          fontSize: '0.84rem',
                          borderRadius: 8,
                          color: '#059669',
                          fontWeight: 700,
                        }}
                      >
                        ALL
                      </button>
                    </div>
                  </div>

                  {/* Account Details */}
                  <div>
                    <label className="font-mono" style={{ fontSize: '0.84rem', color: '#475569', fontWeight: 700, display: 'block', marginBottom: 6 }}>
                      {selectedConfig.inputLabel}:
                    </label>
                    <input
                      type="text"
                      placeholder={selectedConfig.placeholder}
                      value={accountDetails}
                      onChange={(e) => setAccountDetails(e.target.value)}
                      className="input-field"
                      style={{ padding: '11px 14px', fontSize: '0.98rem' }}
                      required
                    />
                    <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginTop: 4 }}>
                      Ensure correct details for instant disbursement.
                    </span>
                  </div>
                </div>

                {/* Real-Time Conversion Box */}
                <div
                  style={{
                    background: '#f0f9ff',
                    padding: '16px 20px',
                    borderRadius: 14,
                    border: '1px solid rgba(14, 165, 233, 0.25)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.94rem', color: '#334155' }}>
                      Payout Method: <strong>{selectedConfig.name}</strong>
                    </span>
                    <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                      {selectedConfig.rateText}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.82rem', color: '#64748b', display: 'block' }}>You Receive:</span>
                    <strong className="font-mono" style={{ fontSize: '1.5rem', color: '#059669' }}>
                      {selectedConfig.isBDT
                        ? `৳${(withdrawAmount * bdtRate).toFixed(0)} BDT`
                        : `$${withdrawAmount.toFixed(2)} USD`}
                    </strong>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || viewerBal < 5.0}
                  className="btn btn-neon glow-neon"
                  style={{ padding: '13px', fontSize: '0.96rem', borderRadius: 12, marginTop: 4 }}
                >
                  {loading
                    ? 'Submitting Request...'
                    : `Withdraw $${withdrawAmount.toFixed(2)} USD via ${selectedConfig.name}`}
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: TRANSACTIONS */}
          {activeTab === 'transactions' && (
            <div className="glass-card" style={{ padding: '22px', borderRadius: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 className="font-display" style={{ fontSize: '1.35rem', color: '#0f172a', margin: 0 }}>
                  TRANSACTION LEDGER
                </h3>
                <button
                  onClick={fetchTransactions}
                  className="btn btn-ghost"
                  style={{ padding: '5px 12px', fontSize: '0.84rem', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <RefreshCw size={14} /> Refresh
                </button>
              </div>

              {!transactions.length ? (
                <div style={{ textAlign: 'center', padding: '28px', color: '#64748b', fontSize: '0.92rem' }}>
                  No transactions recorded yet. Click "Watch & Earn" to start!
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
                          <td className="font-mono" style={{ padding: '10px 12px', fontWeight: 700, fontSize: '0.92rem', color: tx.amount > 0 ? 'var(--primary-neon)' : '#ef4444' }}>
                            {tx.amount > 0 ? `+$${tx.amount.toFixed(4)}` : `-$${Math.abs(tx.amount).toFixed(2)}`}
                          </td>
                          <td className="font-mono" style={{ padding: '10px 12px', color: '#0f172a', fontSize: '0.92rem' }}>
                            ${(tx.balanceAfter || 0).toFixed(4)}
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
