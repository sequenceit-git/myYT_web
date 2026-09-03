import React, { useState, useEffect } from 'react';
import { Wallet, ArrowDownRight, ArrowUpRight, CheckCircle2, AlertCircle, RefreshCw, History, CreditCard, Play, Coins, ArrowRightLeft } from 'lucide-react';
import { User, Transaction } from '../types';
import { apiRequest } from '../api';

interface ViewerPortalProps {
  user: User | null;
  onRefreshUser: () => void;
  onOpenAuth?: (mode: 'signin' | 'signup', role?: 'viewer' | 'campaigner') => void;
  onStartWatching?: () => void;
}

export const ViewerPortal: React.FC<ViewerPortalProps> = ({ user, onRefreshUser, onOpenAuth, onStartWatching }) => {
  const [activeAction, setActiveAction] = useState<'none' | 'convert' | 'withdraw' | 'deposit'>('none');
  
  // Credits to USD Conversion
  const [convertCredits, setConvertCredits] = useState<number>(user?.credits || 100);
  const [convertLoading, setConvertLoading] = useState(false);

  // Cashout / Withdrawal State
  const [withdrawAmount, setWithdrawAmount] = useState(0.5);
  const [withdrawMethod, setWithdrawMethod] = useState<'bkash' | 'nagad' | 'crypto' | 'faucetpay' | 'webmoney'>('bkash');
  const [accountDetails, setAccountDetails] = useState('');

  // Deposit State
  const [depositAmount, setDepositAmount] = useState(5);
  const [depositGateway, setDepositGateway] = useState<'faucetpay' | 'crypto'>('faucetpay');

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchTransactions = async () => {
    const res = await apiRequest<Transaction[]>('/wallet/transactions');
    if (res.success && res.data) {
      setTransactions(res.data);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTransactions();
      if (user.credits && user.credits > 0) {
        setConvertCredits(Math.min(user.credits, 1000));
      }
    }
  }, [user]);

  // Handle Convert Credits to USD Cash
  const handleConvertCredits = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (!user) {
      if (onOpenAuth) onOpenAuth('signin', 'viewer');
      return;
    }

    if (!convertCredits || convertCredits < 100) {
      setMsg({ type: 'error', text: 'Minimum conversion is 100 Credits ($0.10 USD)' });
      return;
    }

    if ((user.credits || 0) < convertCredits) {
      setMsg({ type: 'error', text: `Insufficient credits. You currently have ${(user.credits || 0).toLocaleString()} Credits.` });
      return;
    }

    setConvertLoading(true);
    const res = await apiRequest<any>('/wallet/convert-credits', {
      method: 'POST',
      body: JSON.stringify({ credits: convertCredits }),
    });
    setConvertLoading(false);

    if (res.success) {
      const usdEarned = (convertCredits * 0.001).toFixed(2);
      setMsg({ type: 'success', text: `✓ Converted ${convertCredits.toLocaleString()} Credits into $${usdEarned} USD cash funds!` });
      setActiveAction('none');
      onRefreshUser();
      fetchTransactions();
    } else {
      setMsg({ type: 'error', text: res.error || 'Conversion failed' });
    }
  };

  // Handle Cashout / Withdrawal
  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (!user) {
      if (onOpenAuth) onOpenAuth('signin', 'viewer');
      return;
    }
    if (!accountDetails.trim()) {
      setMsg({ type: 'error', text: 'Please enter your payment recipient phone number or address' });
      return;
    }

    if (user.balance < Number(withdrawAmount)) {
      setMsg({ type: 'error', text: `Insufficient cash balance ($${user.balance.toFixed(4)}). You requested $${Number(withdrawAmount).toFixed(2)}. Please convert credits first.` });
      return;
    }

    if (Number(withdrawAmount) < 0.50) {
      setMsg({ type: 'error', text: 'Minimum withdrawal amount is $0.50 USD' });
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
      setMsg({ type: 'success', text: '✓ Withdrawal request submitted! Disbursed to your account shortly.' });
      setActiveAction('none');
      setAccountDetails('');
      onRefreshUser();
      fetchTransactions();
    } else {
      setMsg({ type: 'error', text: res.error || 'Withdrawal request failed' });
    }
  };

  // Handle Deposit
  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (!user) {
      if (onOpenAuth) onOpenAuth('signin', 'viewer');
      return;
    }
    setLoading(true);
    const res = await apiRequest<any>('/wallet/deposit', {
      method: 'POST',
      body: JSON.stringify({
        amount: Number(depositAmount),
        gateway: depositGateway,
      }),
    });
    setLoading(false);

    if (res.success) {
      setMsg({ type: 'success', text: `Deposit of $${depositAmount.toFixed(2)} completed successfully!` });
      setActiveAction('none');
      onRefreshUser();
      fetchTransactions();
    } else {
      setMsg({ type: 'error', text: res.error || 'Deposit failed' });
    }
  };

  if (!user) {
    return (
      <div style={{ maxWidth: 600, margin: '40px auto', padding: 20, textAlign: 'center' }}>
        <h2 className="font-display" style={{ fontSize: '1.4rem', color: '#ffffff' }}>Please log in to view your Wallet</h2>
        <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.8rem', marginTop: 4 }}>Earn credits watching videos and convert them directly to cash.</p>
        <button
          onClick={() => onOpenAuth && onOpenAuth('signin', 'viewer')}
          className="btn btn-neon glow-neon"
          style={{ marginTop: 14, padding: '8px 18px', fontSize: '0.78rem' }}
        >
          Sign In as Viewer
        </button>
      </div>
    );
  }

  const estimatedUsd = (convertCredits * 0.001).toFixed(4);
  const estimatedBdt = ((convertCredits * 0.001) * 122).toFixed(1);

  return (
    <div style={{ maxWidth: 1180, margin: '16px auto', padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top Header (Compact) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div className="badge-pill badge-neon" style={{ marginBottom: 4, fontSize: '0.62rem', padding: '2px 8px' }}>
            ● Watch to Earn & Instant Cashout
          </div>
          <h1 className="font-display" style={{ fontSize: 'clamp(1.5rem, 2.5vw, 1.9rem)', letterSpacing: '0.01em', color: '#ffffff', lineHeight: 1.1 }}>
            VIEWER <span style={{ color: 'var(--primary-neon)' }}>WALLET & REWARDS</span>
          </h1>
          <p className="font-body" style={{ color: 'var(--on-surface-variant)', marginTop: 2, fontSize: '0.78rem' }}>
            Watch short videos to earn credits, convert credits to USD funds, and withdraw to bKash, Nagad, Crypto & WebMoney.
          </p>
        </div>

        {onStartWatching && (
          <button
            onClick={onStartWatching}
            className="btn btn-neon glow-neon"
            style={{ padding: '8px 16px', fontSize: '0.75rem', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Play size={14} fill="currentColor" /> Watch Videos to Earn
          </button>
        )}
      </div>

      {msg && (
        <div
          className="glass-card"
          style={{
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            borderRadius: 10,
            borderLeft: msg.type === 'success' ? '3px solid var(--primary-neon)' : '3px solid #ef4444',
            background: msg.type === 'success' ? 'rgba(195,244,0,0.1)' : 'rgba(239,68,68,0.1)',
          }}
        >
          {msg.type === 'success' ? <CheckCircle2 color="var(--primary-neon)" size={15} /> : <AlertCircle color="#ef4444" size={15} />}
          <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{msg.text}</span>
        </div>
      )}

      {/* Metrics Row: 1. Watch Credits | 2. Cash Balance | 3. Total Withdrawn */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
        {/* 1. Watch Credits (Earned from Watching) */}
        <div className="glass-card" style={{ padding: '14px 18px', border: '1.5px solid rgba(195,244,0,0.4)', borderRadius: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>Watch Credits</span>
            <Coins size={16} color="var(--primary-neon)" />
          </div>
          <div className="font-mono" style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--primary-neon)', marginTop: 4 }}>
            {(user.credits || 0).toLocaleString()} <span style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)' }}>Credits</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--on-surface-variant)' }}>
              1,000 Credits = $1.00 USD
            </span>
            <button
              onClick={() => setActiveAction(activeAction === 'convert' ? 'none' : 'convert')}
              className="btn btn-neon glow-neon"
              style={{ padding: '4px 10px', fontSize: '0.68rem', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <ArrowRightLeft size={11} /> Convert to USD
            </button>
          </div>
        </div>

        {/* 2. Available Cash Funds (Converted / Deposited) */}
        <div className="glass-card" style={{ padding: '14px 18px', border: '1px solid rgba(120, 211, 238, 0.35)', borderRadius: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>Available USD Cash</span>
            <Wallet size={16} color="var(--secondary-cyan)" />
          </div>
          <div className="font-mono" style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--secondary-cyan)', marginTop: 4 }}>
            ${user.balance.toFixed(4)} <span style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)' }}>USD</span>
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            <button
              onClick={() => setActiveAction(activeAction === 'withdraw' ? 'none' : 'withdraw')}
              className={`btn ${activeAction === 'withdraw' ? 'btn-cyan' : 'btn-ghost'}`}
              style={{ flex: 1, padding: '5px 8px', fontSize: '0.68rem', borderRadius: 8 }}
            >
              <ArrowUpRight size={12} /> Withdraw
            </button>
            <button
              onClick={() => setActiveAction(activeAction === 'deposit' ? 'none' : 'deposit')}
              className={`btn ${activeAction === 'deposit' ? 'btn-cyan' : 'btn-ghost'}`}
              style={{ flex: 1, padding: '5px 8px', fontSize: '0.68rem', borderRadius: 8 }}
            >
              <ArrowDownRight size={12} /> Deposit
            </button>
          </div>
        </div>

        {/* 3. Total Settled & Withdrawn */}
        <div className="glass-card" style={{ padding: '14px 18px', borderRadius: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>Total Withdrawn</span>
            <CreditCard size={16} color="#00c853" />
          </div>
          <div className="font-mono" style={{ fontSize: '1.55rem', fontWeight: 800, color: '#00c853', marginTop: 4 }}>
            ${(user.totalWithdrawn || 0).toFixed(2)} <span style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)' }}>USD</span>
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--on-surface-variant)', marginTop: 8 }}>
            Paid out via bKash / Nagad / Crypto
          </div>
        </div>
      </div>

      {/* 4. Interactive Converter Form: Watch Credits ➔ USD Cash Funds */}
      {activeAction === 'convert' && (
        <div className="glass-card" style={{ padding: '16px 20px', borderRadius: 14, border: '1.5px solid var(--primary-neon)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ArrowRightLeft size={16} color="var(--primary-neon)" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>Convert Watch Credits to Cash Funds</h3>
            </div>
            <button onClick={() => setActiveAction('none')} className="btn btn-ghost" style={{ padding: '2px 8px', fontSize: '0.65rem' }}>Close</button>
          </div>

          <form onSubmit={handleConvertCredits} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <label className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>
                  Credits to Convert (Min 100):
                </label>
                <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--primary-neon)' }}>
                  Available: {(user.credits || 0).toLocaleString()} Credits
                </span>
              </div>
              <input
                type="number"
                min="100"
                step="50"
                max={user.credits || 100}
                value={convertCredits}
                onChange={(e) => setConvertCredits(parseInt(e.target.value, 10) || 0)}
                className="input-field"
                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                required
              />
            </div>

            {/* Quick Presets */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[100, 250, 500, 1000, 2500, 5000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setConvertCredits(Math.min(amt, user.credits || amt))}
                  className="btn btn-ghost"
                  style={{
                    padding: '2px 8px',
                    fontSize: '0.65rem',
                    borderRadius: 9999,
                    background: convertCredits === amt ? 'rgba(195, 244, 0, 0.2)' : 'rgba(255,255,255,0.04)',
                    borderColor: convertCredits === amt ? 'var(--primary-neon)' : 'var(--glass-stroke)',
                    color: convertCredits === amt ? 'var(--primary-neon)' : 'var(--on-surface-variant)',
                  }}
                >
                  {amt.toLocaleString()}
                </button>
              ))}
              {user.credits && user.credits > 0 && (
                <button
                  type="button"
                  onClick={() => setConvertCredits(user.credits || 0)}
                  className="btn btn-neon"
                  style={{ padding: '2px 10px', fontSize: '0.65rem', borderRadius: 9999 }}
                >
                  Max ({user.credits.toLocaleString()})
                </button>
              )}
            </div>

            {/* Rate & Estimated Payout Preview */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#101010', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--glass-stroke)' }}>
              <div>
                <div className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--on-surface-variant)' }}>Conversion Rate</div>
                <div className="font-mono" style={{ fontSize: '0.78rem', color: '#ffffff' }}>1,000 Credits = $1.00 USD</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--on-surface-variant)' }}>You Receive</div>
                <div className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-neon)' }}>
                  +${estimatedUsd} USD <span style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)' }}>(≈ ৳{estimatedBdt} BDT)</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={convertLoading || (user.credits || 0) < 100}
              className="btn btn-neon glow-neon"
              style={{ padding: '10px', fontSize: '0.8rem', borderRadius: 10 }}
            >
              {convertLoading ? 'Converting Credits...' : `Convert ${convertCredits.toLocaleString()} Credits into Cash`}
            </button>
          </form>
        </div>
      )}

      {/* 5. Withdrawal Form */}
      {activeAction === 'withdraw' && (
        <div className="glass-card" style={{ padding: '16px 20px', borderRadius: 14, border: '1.5px solid var(--secondary-cyan)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>Withdraw Cash Earnings (Min $0.50)</h3>
            <button onClick={() => setActiveAction('none')} className="btn btn-ghost" style={{ padding: '2px 8px', fontSize: '0.65rem' }}>Close</button>
          </div>
          <form onSubmit={handleWithdraw} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 8 }}>
              <div>
                <label className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--on-surface-variant)', display: 'block', marginBottom: 4 }}>Payout Method:</label>
                <select
                  value={withdrawMethod}
                  onChange={(e) => setWithdrawMethod(e.target.value as any)}
                  className="input-field"
                  style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                >
                  <option value="bkash">bKash (MFS)</option>
                  <option value="nagad">Nagad (MFS)</option>
                  <option value="crypto">Crypto USDT TRC20</option>
                  <option value="faucetpay">FaucetPay</option>
                  <option value="webmoney">WebMoney</option>
                </select>
              </div>
              <div>
                <label className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--on-surface-variant)', display: 'block', marginBottom: 4 }}>Amount (USD):</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  max={user.balance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(parseFloat(e.target.value) || 0.5)}
                  className="input-field"
                  style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                />
              </div>
              <div>
                <label className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--on-surface-variant)', display: 'block', marginBottom: 4 }}>Account / Phone / Address:</label>
                <input
                  type="text"
                  value={accountDetails}
                  onChange={(e) => setAccountDetails(e.target.value)}
                  placeholder={withdrawMethod === 'bkash' ? '01712345678 (Personal)' : 'Recipient address...'}
                  required
                  className="input-field"
                  style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--secondary-cyan)' }}>
                Est: ৳{(withdrawAmount * 122).toFixed(0)} BDT
              </span>
              <button type="submit" disabled={loading} className="btn btn-cyan" style={{ padding: '8px 18px', fontSize: '0.78rem', borderRadius: 8 }}>
                {loading ? 'Submitting...' : `Submit Payout Request ($${withdrawAmount.toFixed(2)})`}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 6. Deposit Form */}
      {activeAction === 'deposit' && (
        <div className="glass-card" style={{ padding: '16px 20px', borderRadius: 14, border: '1px solid var(--primary-neon)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ffffff' }}>Deposit Instant Funds</h3>
            <button onClick={() => setActiveAction('none')} className="btn btn-ghost" style={{ padding: '2px 8px', fontSize: '0.65rem' }}>Close</button>
          </div>
          <form onSubmit={handleDeposit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--on-surface-variant)', display: 'block', marginBottom: 4 }}>Gateway:</label>
                <select
                  value={depositGateway}
                  onChange={(e) => setDepositGateway(e.target.value as any)}
                  className="input-field"
                  style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                >
                  <option value="faucetpay">FaucetPay (Instant Zero Fee)</option>
                  <option value="crypto">Crypto USDT / LTC</option>
                </select>
              </div>
              <div>
                <label className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--on-surface-variant)', display: 'block', marginBottom: 4 }}>Amount (USD):</label>
                <input
                  type="number"
                  min="1"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(parseFloat(e.target.value) || 1)}
                  className="input-field"
                  style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn btn-neon glow-neon" style={{ padding: '8px', fontSize: '0.78rem', borderRadius: 8 }}>
              {loading ? 'Processing...' : `Deposit $${depositAmount.toFixed(2)} USD`}
            </button>
          </form>
        </div>
      )}

      {/* 7. Transaction & Payout Ledger (Compact Table) */}
      <div className="glass-card" style={{ padding: '16px 18px', borderRadius: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <History size={16} color="var(--primary-neon)" />
            <h3 className="font-display" style={{ fontSize: '1.05rem', color: '#ffffff', letterSpacing: '0.02em' }}>
              TRANSACTION & REWARD LEDGER
            </h3>
          </div>
          <button
            onClick={fetchTransactions}
            className="btn btn-ghost"
            style={{ padding: '3px 8px', fontSize: '0.68rem', borderRadius: 6 }}
          >
            <RefreshCw size={11} /> Refresh
          </button>
        </div>

        {!transactions.length ? (
          <div style={{ textAlign: 'center', padding: '24px 10px', color: 'var(--on-surface-variant)', fontSize: '0.78rem' }}>
            No transactions found yet. Watch videos to earn credits and convert to cash.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: 'var(--on-surface-variant)', textAlign: 'left' }}>
                  <th style={{ padding: '6px 10px', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.66rem' }}>Type</th>
                  <th style={{ padding: '6px 10px', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.66rem' }}>Amount</th>
                  <th style={{ padding: '6px 10px', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.66rem' }}>Balance</th>
                  <th style={{ padding: '6px 10px', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.66rem' }}>Status</th>
                  <th style={{ padding: '6px 10px', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.66rem' }}>Details / Note</th>
                  <th style={{ padding: '6px 10px', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.66rem' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '8px 10px' }}>
                      <span className="badge-pill" style={{ padding: '1px 6px', fontSize: '0.58rem', textTransform: 'uppercase' }}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="font-mono" style={{ padding: '8px 10px', fontWeight: 700, color: tx.amount > 0 ? 'var(--primary-neon)' : tx.amount < 0 ? '#ef4444' : 'var(--on-surface-variant)' }}>
                      {tx.amount > 0 ? `+$${tx.amount.toFixed(4)}` : tx.amount < 0 ? `-$${Math.abs(tx.amount).toFixed(4)}` : 'Credits'}
                    </td>
                    <td className="font-mono" style={{ padding: '8px 10px', color: '#ffffff' }}>
                      ${(tx.balanceAfter || 0).toFixed(4)}
                    </td>
                    <td style={{ padding: '8px 10px' }}>
                      <span className="font-mono" style={{ color: tx.status === 'completed' ? 'var(--primary-neon)' : '#fbbf24', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' }}>
                        {tx.status}
                      </span>
                    </td>
                    <td style={{ padding: '8px 10px', color: 'var(--on-surface-variant)', fontSize: '0.72rem' }}>
                      {tx.notes || tx.gateway || 'System Action'}
                    </td>
                    <td style={{ padding: '8px 10px', color: 'var(--on-surface-variant)', fontSize: '0.7rem' }}>
                      {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
