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

  // Video Queue State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Watch Task State
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [timerRemaining, setTimerRemaining] = useState<number>(0);
  const [canClaim, setCanClaim] = useState<boolean>(false);
  const [taskSubmitting, setTaskSubmitting] = useState<boolean>(false);

  // Withdraw State
  const [withdrawMethod, setWithdrawMethod] = useState<PayoutMethodType>('bkash');
  const [withdrawAmount, setWithdrawAmount] = useState<number>(5.0);
  const [accountDetails, setAccountDetails] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch Available Tasks
  const fetchTasks = async () => {
    setTasksLoading(true);
    const res = await apiRequest<Task[]>('/tasks/available');
    setTasksLoading(false);
    if (res.success && res.data) {
      setTasks(res.data);
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
      fetchTasks();
      fetchTransactions();
    }
  }, [user]);

  // Handle Watch Flow Countdown
  useEffect(() => {
    let interval: any;
    if (activeTask && timerRemaining > 0) {
      interval = setInterval(() => {
        setTimerRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setCanClaim(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTask, timerRemaining]);

  const handleSelectTask = (task: Task) => {
    setActiveTask(task);
    setTimerRemaining(task.requiredDurationSec || 15);
    setCanClaim(false);
    setMsg(null);
  };

  const handleCompleteTask = async () => {
    if (!activeTask) return;
    setTaskSubmitting(true);
    setMsg(null);

    const res = await apiRequest<any>(`/tasks/${activeTask._id}/complete`, {
      method: 'POST',
      body: JSON.stringify({
        verificationToken: `token_${Date.now()}`,
      }),
    });

    setTaskSubmitting(false);

    if (res.success) {
      const rewardAmt = res.data?.rewardUsd || 0.0035;
      setMsg({
        type: 'success',
        text: `✓ Watch verified! +$${rewardAmt.toFixed(4)} USD added to your wallet.`,
      });
      setActiveTask(null);
      setCanClaim(false);
      onRefreshUser();
      fetchTasks();
      fetchTransactions();
    } else {
      setMsg({ type: 'error', text: res.error || 'Verification failed' });
    }
  };

  // Handle Withdrawal
  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    if (!user) {
      if (onOpenAuth) onOpenAuth('signin');
      return;
    }

    if (withdrawAmount < 5.0) {
      setMsg({ type: 'error', text: 'Minimum withdrawal is $5.00 USD (≈ ৳610 BDT).' });
      return;
    }

    if (user.balance < withdrawAmount) {
      setMsg({ type: 'error', text: `Insufficient balance ($${user.balance.toFixed(4)} available).` });
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

  const bdtRate = 122;
  const approxBDT = (user.balance * bdtRate).toFixed(0);
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
                <PlaySquare size={20} />
                <span>Watch & Earn</span>
              </div>
              <span className="dashboard-nav-badge badge-hot">HOT</span>
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
                <span>Ledger</span>
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
              Available Cash
            </div>
            <div className="font-mono" style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--primary-neon)', marginTop: 2 }}>
              ${user.balance.toFixed(4)} <span style={{ fontSize: '0.8rem', color: '#64748b' }}>USD</span>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Quick Actions Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <h1 className="font-display" style={{ fontSize: '1.4rem', color: '#0f172a', margin: 0 }}>
                  VIEWER OVERVIEW
                </h1>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setActiveTab('watch')}
                    className="btn btn-neon glow-neon"
                    style={{ padding: '7px 14px', fontSize: '0.75rem', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 5 }}
                  >
                    <Play size={13} fill="currentColor" /> Watch & Earn
                  </button>
                  <button
                    onClick={() => setActiveTab('withdraw')}
                    className="btn btn-cyan"
                    style={{ padding: '7px 14px', fontSize: '0.75rem', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 5 }}
                  >
                    <ArrowUpRight size={13} /> Withdraw Cash
                  </button>
                </div>
              </div>

              {/* 3 Metric Cards Grid (No Deposit) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 12 }}>
                {/* 1. Cash Balance */}
                <div className="glass-card" style={{ padding: '16px', border: '1.5px solid rgba(14, 165, 233, 0.35)', borderRadius: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', fontWeight: 600 }}>Available Cash</span>
                    <Wallet size={15} color="var(--primary-neon)" />
                  </div>
                  <div className="font-mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-neon)', marginTop: 4 }}>
                    ${user.balance.toFixed(4)}
                  </div>
                  <div className="font-mono" style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600, marginTop: 2 }}>
                    ≈ ৳{approxBDT} BDT
                  </div>
                  <button
                    onClick={() => setActiveTab('withdraw')}
                    className="btn btn-neon glow-neon"
                    style={{ width: '100%', padding: '6px', fontSize: '0.72rem', borderRadius: 6, marginTop: 10 }}
                  >
                    <ArrowUpRight size={12} /> Withdraw Cash
                  </button>
                </div>

                {/* 2. Total Earned */}
                <div className="glass-card" style={{ padding: '16px', borderRadius: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', fontWeight: 600 }}>Total Earned</span>
                    <TrendingUp size={15} color="#059669" />
                  </div>
                  <div className="font-mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669', marginTop: 4 }}>
                    ${(user.totalEarned || 0).toFixed(4)}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 8 }}>
                    Lifetime watch rewards
                  </div>
                </div>

                {/* 3. Total Withdrawn */}
                <div className="glass-card" style={{ padding: '16px', borderRadius: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', fontWeight: 600 }}>Total Withdrawn</span>
                    <CreditCard size={15} color="#7c3aed" />
                  </div>
                  <div className="font-mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#7c3aed', marginTop: 4 }}>
                    ${(user.totalWithdrawn || 0).toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 8 }}>
                    Disbursed to bKash/Nagad/Crypto
                  </div>
                </div>
              </div>

              {/* Recent Transactions Table */}
              <div className="glass-card" style={{ padding: '16px', borderRadius: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <h3 className="font-display" style={{ fontSize: '0.95rem', color: '#0f172a', margin: 0 }}>
                    RECENT TRANSACTIONS
                  </h3>
                  <button
                    onClick={() => setActiveTab('transactions')}
                    className="btn btn-ghost"
                    style={{ padding: '3px 8px', fontSize: '0.68rem', borderRadius: 6 }}
                  >
                    View All →
                  </button>
                </div>

                {!transactions.length ? (
                  <div style={{ textAlign: 'center', padding: '16px', color: '#64748b', fontSize: '0.78rem' }}>
                    No transactions yet. Click "Watch & Earn" to start!
                  </div>
                ) : (
                  <div className="responsive-table-wrapper">
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #e2e8f0', color: 'var(--on-surface-variant)', textAlign: 'left' }}>
                          <th style={{ padding: '6px 8px', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.64rem' }}>Type</th>
                          <th style={{ padding: '6px 8px', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.64rem' }}>Amount</th>
                          <th style={{ padding: '6px 8px', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.64rem' }}>Status</th>
                          <th style={{ padding: '6px 8px', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.64rem' }}>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.slice(0, 4).map((tx) => (
                          <tr key={tx._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '7px 8px' }}>
                              <span className="badge-pill badge-cyan" style={{ padding: '1px 6px', fontSize: '0.58rem', textTransform: 'uppercase' }}>
                                {tx.type}
                              </span>
                            </td>
                            <td className="font-mono" style={{ padding: '7px 8px', fontWeight: 700, color: tx.amount > 0 ? 'var(--primary-neon)' : '#ef4444' }}>
                              {tx.amount > 0 ? `+$${tx.amount.toFixed(4)}` : `-$${Math.abs(tx.amount).toFixed(2)}`}
                            </td>
                            <td style={{ padding: '7px 8px', color: tx.status === 'completed' ? '#059669' : '#d97706', fontWeight: 600 }}>
                              {tx.status}
                            </td>
                            <td style={{ padding: '7px 8px', color: 'var(--on-surface-variant)' }}>
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

          {/* TAB 2: WATCH & EARN */}
          {activeTab === 'watch' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="font-display" style={{ fontSize: '1.2rem', color: '#0f172a', margin: 0 }}>
                  WATCH & EARN
                </h3>
                <button
                  onClick={fetchTasks}
                  className="btn btn-ghost"
                  style={{ padding: '5px 10px', fontSize: '0.72rem', borderRadius: 6 }}
                >
                  <RefreshCw size={12} /> Refresh
                </button>
              </div>

              {activeTask ? (
                <div className="glass-card" style={{ padding: 16, borderRadius: 14, border: '1.5px solid var(--primary-neon)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>{activeTask.title}</span>
                    <span className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-neon)' }}>
                      ⏱ {timerRemaining}s
                    </span>
                  </div>

                  <div style={{ width: '100%', height: 320, borderRadius: 10, overflow: 'hidden', background: '#000', marginBottom: 12 }}>
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube-nocookie.com/embed/${activeTask.videoId}?autoplay=1&enablejsapi=1&rel=0`}
                      title={activeTask.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      onClick={() => setActiveTask(null)}
                      className="btn btn-ghost"
                      style={{ padding: '5px 10px', fontSize: '0.72rem', borderRadius: 6 }}
                    >
                      Cancel
                    </button>

                    <button
                      onClick={handleCompleteTask}
                      disabled={!canClaim || taskSubmitting}
                      className="btn btn-neon glow-neon"
                      style={{ padding: '9px 18px', fontSize: '0.8rem', borderRadius: 8, opacity: canClaim ? 1 : 0.5 }}
                    >
                      {taskSubmitting ? 'Verifying...' : canClaim ? `Claim +$${(activeTask.rewardUsd || 0.0035).toFixed(4)} USD` : `Wait ${timerRemaining}s`}
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 220px), 1fr))', gap: 12 }}>
                  {tasksLoading ? (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '24px', color: '#64748b' }}>Loading queue...</div>
                  ) : !tasks.length ? (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '24px', color: '#64748b' }}>No tasks currently available.</div>
                  ) : (
                    tasks.map((t) => (
                      <div key={t._id} className="glass-card" style={{ borderRadius: 12, overflow: 'hidden', padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ position: 'relative', width: '100%', height: 110, borderRadius: 8, overflow: 'hidden' }}>
                          <img
                            src={t.thumbnailUrl || `https://img.youtube.com/vi/${t.videoId}/hqdefault.jpg`}
                            alt={t.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <div style={{ position: 'absolute', bottom: 4, right: 4, background: 'rgba(0,0,0,0.8)', color: '#fff', padding: '1px 5px', borderRadius: 4, fontSize: '0.62rem' }}>
                            {t.requiredDurationSec || 15}s
                          </div>
                        </div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {t.title || `Video ${t.videoId}`}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="font-mono" style={{ fontWeight: 800, color: 'var(--primary-neon)', fontSize: '0.82rem' }}>
                            +${(t.rewardUsd || 0.0035).toFixed(4)}
                          </span>
                          <button
                            onClick={() => handleSelectTask(t)}
                            className="btn btn-neon glow-neon"
                            style={{ padding: '4px 10px', fontSize: '0.7rem', borderRadius: 6 }}
                          >
                            Watch
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              TAB 3: WITHDRAW WITH INDIVIDUAL METHOD CARDS
              ========================================================================= */}
          {activeTab === 'withdraw' && (
            <div className="glass-card" style={{ padding: '20px', borderRadius: 16, border: '1.5px solid var(--primary-neon)' }}>

              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <h3 className="font-display" style={{ fontSize: '1.45rem', color: '#0f172a', margin: 0 }}>
                    WITHDRAW FUNDS
                  </h3>
                  <span style={{ fontSize: '0.88rem', color: '#64748b' }}>
                    Available: <strong className="font-mono" style={{ color: 'var(--primary-neon)' }}>${user.balance.toFixed(4)} USD</strong> (≈ ৳{approxBDT} BDT)
                  </span>
                </div>
                <span className="badge-pill badge-cyan" style={{ fontSize: '0.74rem', padding: '4px 12px' }}>
                  Min Payout: $5.00 USD (≈ ৳610 BDT)
                </span>
              </div>

              {/* INDIVIDUAL METHOD CARDS - LOGO PLACEHOLDER + NAME ONLY */}
              <div style={{ marginBottom: 18 }}>
                <label className="font-mono" style={{ fontSize: '0.82rem', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: 10, fontWeight: 700 }}>
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
                      <label className="font-mono" style={{ fontSize: '0.84rem', color: '#475569', fontWeight: 600 }}>
                        Amount (USD):
                      </label>
                      <span className="font-mono" style={{ fontSize: '0.76rem', color: 'var(--primary-neon)' }}>
                        Max: ${user.balance.toFixed(4)}
                      </span>
                    </div>

                    <input
                      type="number"
                      step="0.01"
                      min="5.00"
                      max={user.balance}
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
                            padding: '4px 10px',
                            fontSize: '0.78rem',
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
                        onClick={() => setWithdrawAmount(parseFloat(user.balance.toFixed(4)))}
                        className="btn btn-ghost"
                        style={{
                          padding: '4px 10px',
                          fontSize: '0.78rem',
                          borderRadius: 8,
                          color: '#059669',
                          fontWeight: 700,
                        }}
                      >
                        ALL
                      </button>
                    </div>
                  </div>

                  {/* Recipient Account Details Input */}
                  <div>
                    <label className="font-mono" style={{ fontSize: '0.84rem', color: '#475569', fontWeight: 600, display: 'block', marginBottom: 6 }}>
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
                    <span style={{ fontSize: '0.74rem', color: '#64748b', display: 'block', marginTop: 4 }}>
                      Ensure correct details for instant disbursement.
                    </span>
                  </div>
                </div>

                {/* Real-Time Conversion Box */}
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
                      Payout Method: <strong>{selectedConfig.name}</strong>
                    </span>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      {selectedConfig.rateText}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.74rem', color: '#64748b', display: 'block' }}>You Receive:</span>
                    <strong className="font-mono" style={{ fontSize: '1.35rem', color: '#059669' }}>
                      {selectedConfig.isBDT
                        ? `৳${(withdrawAmount * bdtRate).toFixed(0)} BDT`
                        : `$${withdrawAmount.toFixed(2)} USD`}
                    </strong>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || user.balance < 5.0}
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
            <div className="glass-card" style={{ padding: '18px', borderRadius: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 className="font-display" style={{ fontSize: '1.05rem', color: '#0f172a', margin: 0 }}>
                  TRANSACTION LEDGER
                </h3>
                <button
                  onClick={fetchTransactions}
                  className="btn btn-ghost"
                  style={{ padding: '4px 10px', fontSize: '0.72rem', borderRadius: 6 }}
                >
                  <RefreshCw size={12} /> Refresh
                </button>
              </div>

              {!transactions.length ? (
                <div style={{ textAlign: 'center', padding: '24px', color: '#64748b', fontSize: '0.78rem' }}>
                  No transactions recorded yet.
                </div>
              ) : (
                <div className="responsive-table-wrapper">
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                        <th style={{ padding: '8px', textTransform: 'uppercase', fontSize: '0.64rem' }}>Type</th>
                        <th style={{ padding: '8px', textTransform: 'uppercase', fontSize: '0.64rem' }}>Amount</th>
                        <th style={{ padding: '8px', textTransform: 'uppercase', fontSize: '0.64rem' }}>Balance</th>
                        <th style={{ padding: '8px', textTransform: 'uppercase', fontSize: '0.64rem' }}>Status</th>
                        <th style={{ padding: '8px', textTransform: 'uppercase', fontSize: '0.64rem' }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr key={tx._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '8px' }}>
                            <span className="badge-pill badge-cyan" style={{ padding: '1px 6px', fontSize: '0.58rem', textTransform: 'uppercase' }}>
                              {tx.type}
                            </span>
                          </td>
                          <td className="font-mono" style={{ padding: '8px', fontWeight: 700, color: tx.amount > 0 ? 'var(--primary-neon)' : '#ef4444' }}>
                            {tx.amount > 0 ? `+$${tx.amount.toFixed(4)}` : `-$${Math.abs(tx.amount).toFixed(2)}`}
                          </td>
                          <td className="font-mono" style={{ padding: '8px', color: '#0f172a' }}>
                            ${(tx.balanceAfter || 0).toFixed(4)}
                          </td>
                          <td style={{ padding: '8px', color: tx.status === 'completed' ? '#059669' : '#d97706', fontWeight: 600 }}>
                            {tx.status}
                          </td>
                          <td style={{ padding: '8px', color: '#64748b' }}>
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
