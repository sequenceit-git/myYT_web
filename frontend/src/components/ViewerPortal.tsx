import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  Users,
  BarChart3,
  Globe,
  Activity,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  UserCheck,
  Copy,
  Share2,
  Gift,
  Lock,
} from 'lucide-react';
import { User, Task, Payout, Transaction, WithdrawMethod } from '../types';
import { UserAvatar } from './UserAvatar';
import { apiRequest } from '../api';
import { ProfileSwitchBanner } from './ProfileSwitchBanner';
import { ProfileSettingsSection } from './ProfileSettingsSection';
import { useExchangeRate } from '../context/ExchangeRateContext';

// Custom sleek Smartphone device icon with bezel, speaker, and home bar
const PhoneDeviceIcon: React.FC<{ size?: number; color?: string }> = ({ size = 24, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ flexShrink: 0 }}
  >
    <rect x="5" y="2" width="14" height="20" rx="3" stroke={color} strokeWidth="2" fill="none" />
    <line x1="10" y1="4.8" x2="14" y2="4.8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <rect x="7" y="6.8" width="10" height="11.5" rx="1" fill={color} fillOpacity="0.22" />
    <line x1="10.5" y1="20" x2="13.5" y2="20" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

interface ViewerPortalProps {
  user: User | null;
  onRefreshUser: () => void;
  onOpenAuth?: (mode: 'signin' | 'signup', role?: 'viewer' | 'campaigner') => void;
  onStartWatching?: () => void;
  onSwitchProfile?: (targetRole: 'viewer' | 'campaigner') => void;
}

type ViewerTab = 'overview' | 'watch' | 'withdraw' | 'transactions' | 'referrals' | 'profile';

type PayoutMethodType = 'bkash' | 'nagad' | 'rocket' | 'faucetpay' | 'crypto' | 'webmoney' | 'payeer';

interface PayoutMethodConfig {
  id: PayoutMethodType;
  name: string;
  logoBg: string;
  logoMark: string;
  logoUrl: string;
  inputLabel: string;
  placeholder: string;
  rateText: string;
  minLimitText: string;
  minWithdrawUsd: number;
  instructions?: string;
  enabled?: boolean;
  isBDT: boolean;
}

const getPayoutMethods = (usdToBdt: number, dynamicMethods?: WithdrawMethod[]): PayoutMethodConfig[] => {
  const getMin = (id: string, defaultMin = 5.0): number => {
    const found = dynamicMethods?.find((m) => m.id === id);
    return typeof found?.minWithdrawUsd === 'number' && found.minWithdrawUsd > 0 ? found.minWithdrawUsd : defaultMin;
  };
  const getEnabled = (id: string): boolean => {
    const found = dynamicMethods?.find((m) => m.id === id);
    return found?.enabled !== false;
  };
  const getInstr = (id: string): string | undefined => {
    const found = dynamicMethods?.find((m) => m.id === id);
    return found?.instructions;
  };
  const getName = (id: string, defName: string): string => {
    const found = dynamicMethods?.find((m) => m.id === id);
    return found?.name || defName;
  };

  const methods: PayoutMethodConfig[] = [
    {
      id: 'bkash',
      name: getName('bkash', 'bKash'),
      logoBg: '#ffffff',
      logoMark: 'bK',
      logoUrl: '/payment-methods/bkash.svg',
      inputLabel: 'bKash Account Number',
      placeholder: '01XXXXXXXXX',
      rateText: `1 USD = ${usdToBdt} BDT`,
      minLimitText: `Min: $${getMin('bkash').toFixed(2)} USD`,
      minWithdrawUsd: getMin('bkash'),
      instructions: getInstr('bkash'),
      enabled: getEnabled('bkash'),
      isBDT: true,
    },
    {
      id: 'nagad',
      name: getName('nagad', 'Nagad'),
      logoBg: '#ffffff',
      logoMark: 'Nagad',
      logoUrl: '/payment-methods/nagad.svg',
      inputLabel: 'Nagad Account Number',
      placeholder: '01XXXXXXXXX',
      rateText: `1 USD = ${usdToBdt} BDT`,
      minLimitText: `Min: $${getMin('nagad').toFixed(2)} USD`,
      minWithdrawUsd: getMin('nagad'),
      instructions: getInstr('nagad'),
      enabled: getEnabled('nagad'),
      isBDT: true,
    },
    {
      id: 'rocket',
      name: getName('rocket', 'Rocket'),
      logoBg: '#ffffff',
      logoMark: 'Rocket',
      logoUrl: '/payment-methods/rocket.svg',
      inputLabel: 'Rocket Account Number',
      placeholder: '01XXXXXXXXX',
      rateText: `1 USD = ${usdToBdt} BDT`,
      minLimitText: `Min: $${getMin('rocket').toFixed(2)} USD`,
      minWithdrawUsd: getMin('rocket'),
      instructions: getInstr('rocket'),
      enabled: getEnabled('rocket'),
      isBDT: true,
    },
    {
      id: 'faucetpay',
      name: getName('faucetpay', 'FaucetPay'),
      logoBg: '#ffffff',
      logoMark: 'FP',
      logoUrl: '/payment-methods/faucetpay.svg',
      inputLabel: 'FaucetPay Email',
      placeholder: 'your-email@example.com',
      rateText: 'Instant Automated • Zero Fee',
      minLimitText: `Min: $${getMin('faucetpay').toFixed(2)} USD`,
      minWithdrawUsd: getMin('faucetpay'),
      instructions: getInstr('faucetpay'),
      enabled: getEnabled('faucetpay'),
      isBDT: false,
    },
    {
      id: 'crypto',
      name: getName('crypto', 'USDT (BEP-20)'),
      logoBg: '#ffffff',
      logoMark: '₮',
      logoUrl: '/payment-methods/crypto.svg',
      inputLabel: 'USDT (BEP-20) Address',
      placeholder: '0x... (BNB Smart Chain BEP-20)',
      rateText: 'Only BEP-20 USDT Supported (BNB Smart Chain)',
      minLimitText: `Min: $${getMin('crypto').toFixed(2)} USD`,
      minWithdrawUsd: getMin('crypto'),
      instructions: getInstr('crypto'),
      enabled: getEnabled('crypto'),
      isBDT: false,
    },
    {
      id: 'webmoney',
      name: getName('webmoney', 'WebMoney'),
      logoBg: '#ffffff',
      logoMark: 'WM',
      logoUrl: '/payment-methods/webmoney.svg',
      inputLabel: 'WebMoney Purse ID',
      placeholder: 'Z123456789012',
      rateText: 'USD Purse (WMZ)',
      minLimitText: `Min: $${getMin('webmoney').toFixed(2)} USD`,
      minWithdrawUsd: getMin('webmoney'),
      instructions: getInstr('webmoney'),
      enabled: getEnabled('webmoney'),
      isBDT: false,
    },
    {
      id: 'payeer',
      name: getName('payeer', 'Payeer'),
      logoBg: '#ffffff',
      logoMark: 'PAYEER',
      logoUrl: '/payment-methods/payeer.png',
      inputLabel: 'Payeer Account (P...)',
      placeholder: 'P1000000000',
      rateText: 'USD Account Transfer',
      minLimitText: `Min: $${getMin('payeer').toFixed(2)} USD`,
      minWithdrawUsd: getMin('payeer'),
      instructions: getInstr('payeer'),
      enabled: getEnabled('payeer'),
      isBDT: false,
    },
  ];

  return methods.filter((m) => m.enabled !== false);
};

// Helper to render smooth SVG curve for platform withdrawal volume
const renderWithdrawalCurve = (data: number[], labels: string[]) => {
  if (!data || data.length < 2) return null;
  const width = 480;
  const height = 150;
  const paddingX = 35;
  const paddingY = 25;
  const highest = Math.max(...data, 0);
  const maxVal = highest > 0 ? highest * 1.25 : 10;
  const minVal = 0;

  const points = data.map((val, i) => {
    const x = paddingX + i * ((width - paddingX * 2) / (data.length - 1));
    const y = height - paddingY - ((val - minVal) / (maxVal - minVal)) * (height - paddingY * 2);
    return { x, y, val };
  });

  // Generate cubic bezier curve path
  let pathD = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const midX = (p0.x + p1.x) / 2;
    pathD += ` C ${midX},${p0.y} ${midX},${p1.y} ${p1.x},${p1.y}`;
  }

  const areaD = `${pathD} L ${points[points.length - 1].x},${height - 18} L ${points[0].x},${height - 18} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id="withdrawGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.01" />
        </linearGradient>
      </defs>
      {/* Horizontal guide lines */}
      <line x1="20" y1="35" x2={width - 20} y2="35" stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1" />
      <line x1="20" y1="75" x2={width - 20} y2="75" stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1" />
      <line x1="20" y1="115" x2={width - 20} y2="115" stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1" />

      {/* Area fill */}
      <path d={areaD} fill="url(#withdrawGrad)" />

      {/* Main line */}
      <path d={pathD} fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

      {/* Dots and Labels */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4.5" fill="#ffffff" stroke="#059669" strokeWidth="2.5" />
          <text x={p.x} y={p.y - 9} textAnchor="middle" fill="#0f172a" fontSize="10.5" fontWeight="700" fontFamily="monospace">
            ${p.val}
          </text>
          <text x={p.x} y={height - 4} textAnchor="middle" fill="#64748b" fontSize="10.5" fontWeight="600">
            {labels[i] || ''}
          </text>
        </g>
      ))}
    </svg>
  );
};

// Helper to render SVG bars for daily video watch views
const renderViewsBarChart = (data: number[], labels: string[]) => {
  if (!data || data.length < 2) return null;
  const width = 480;
  const height = 150;
  const paddingX = 25;
  const highest = Math.max(...data, 0);
  const maxVal = highest > 0 ? highest * 1.25 : 10;
  const barWidth = 32;
  const availableW = width - paddingX * 2;
  const step = availableW / data.length;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id="viewsBarGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
      </defs>
      {/* Horizontal guide lines */}
      <line x1="15" y1="35" x2={width - 15} y2="35" stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1" />
      <line x1="15" y1="75" x2={width - 15} y2="75" stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1" />
      <line x1="15" y1="115" x2={width - 15} y2="115" stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1" />

      {data.map((val, i) => {
        const barH = (val / maxVal) * 95;
        const x = paddingX + i * step + (step - barWidth) / 2;
        const y = height - 26 - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barWidth} height={barH} rx="5" fill="url(#viewsBarGrad)" />
            <text x={x + barWidth / 2} y={y - 6} textAnchor="middle" fill="#0284c7" fontSize="10" fontWeight="700" fontFamily="monospace">
              {val}
            </text>
            <text x={x + barWidth / 2} y={height - 6} textAnchor="middle" fill="#64748b" fontSize="10.5" fontWeight="600">
              {labels[i] || ''}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export const ViewerPortal: React.FC<ViewerPortalProps> = ({
  user,
  onRefreshUser,
  onOpenAuth,
  onSwitchProfile,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') as ViewerTab | null;
  const validTabs: ViewerTab[] = ['overview', 'watch', 'withdraw', 'transactions', 'referrals', 'profile'];
  const [internalTab, setInternalTab] = useState<ViewerTab>(() => {
    return (tabFromUrl && validTabs.includes(tabFromUrl))
      ? tabFromUrl
      : 'overview';
  });

  const activeTab = (tabFromUrl && validTabs.includes(tabFromUrl))
    ? tabFromUrl
    : internalTab;

  useEffect(() => {
    if (tabFromUrl && validTabs.includes(tabFromUrl)) {
      setInternalTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const setActiveTab = (tab: ViewerTab) => {
    setInternalTab(tab);
    setSearchParams({ tab });
  };

  // Referral Program State
  const [referralStats, setReferralStats] = useState<any>(null);
  const [referralLoading, setReferralLoading] = useState<boolean>(false);
  const [referralCopied, setReferralCopied] = useState<boolean>(false);

  const fetchReferralStats = async () => {
    setReferralLoading(true);
    try {
      const res = await apiRequest<any>('/auth/referrals');
      if (res.success && res.data) {
        setReferralStats(res.data);
      }
    } catch (e) {
      console.error('[Referral] Failed to fetch stats:', e);
    } finally {
      setReferralLoading(false);
    }
  };

  const handleCopyReferral = (text: string) => {
    navigator.clipboard.writeText(text);
    setReferralCopied(true);
    setTimeout(() => setReferralCopied(false), 2500);
  };

  useEffect(() => {
    if (user && activeTab === 'referrals') {
      fetchReferralStats();
    }
  }, [user, activeTab]);

  // Watch History & Pagination State (10 per page)
  const [watchHistory, setWatchHistory] = useState<any[]>([]);
  const [watchHistoryLoading, setWatchHistoryLoading] = useState<boolean>(false);
  const [watchPage, setWatchPage] = useState<number>(1);
  const WATCH_PAGE_SIZE = 10;

  // Personal Withdrawals (Payout Ledger) & Pagination State (10 per page)
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txLoading, setTxLoading] = useState<boolean>(false);
  const [txPage, setTxPage] = useState<number>(1);
  const TX_PAGE_SIZE = 10;

  // Withdraw State
  const [withdrawMethod, setWithdrawMethod] = useState<PayoutMethodType>('bkash');
  const [withdrawAmount, setWithdrawAmount] = useState<string | number>('');
  const [accountDetails, setAccountDetails] = useState<string>('');
  const [serverWithdrawMethods, setServerWithdrawMethods] = useState<WithdrawMethod[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Ledger Sub-Tab ('my_tx' vs 'platform')
  const [ledgerTab, setLedgerTab] = useState<'my_tx' | 'platform'>('my_tx');
  const [platformStats, setPlatformStats] = useState<any | null>(null);
  const [platformStatsLoading, setPlatformStatsLoading] = useState<boolean>(false);

  // Fetch Available Withdrawal Methods & Limits from Admin
  const fetchWithdrawMethods = async () => {
    try {
      const res = await apiRequest<WithdrawMethod[]>('/wallet/withdraw-methods');
      if (res.success && res.data && Array.isArray(res.data)) {
        setServerWithdrawMethods(res.data);
      }
    } catch {
      // fallback to defaults
    }
  };

  // Fetch Watch History (Videos Watch & Earn Ledger)
  const fetchWatchHistory = async () => {
    setWatchHistoryLoading(true);
    const res = await apiRequest<any[]>('/tasks/history');
    setWatchHistoryLoading(false);
    if (res.success && res.data) {
      setWatchHistory(res.data);
      setWatchPage(1);
    }
  };

  // Fetch Personal Withdrawals (Payout Ledger - withdrawal history only)
  const fetchTransactions = async () => {
    setTxLoading(true);
    const res = await apiRequest<Transaction[]>('/wallet/transactions?type=payout');
    setTxLoading(false);
    if (res.success && res.data) {
      const payoutTx = res.data.filter((tx) => tx.type === 'payout');
      setTransactions(payoutTx);
      setTxPage(1);
    }
  };

  // Fetch Platform-Wide Stats & Withdrawals
  const fetchPlatformStats = async () => {
    setPlatformStatsLoading(true);
    const res = await apiRequest<any>('/wallet/platform-stats');
    setPlatformStatsLoading(false);
    if (res.success && res.data) {
      setPlatformStats(res.data);
    }
  };

  // Reusable pagination toolbar
  const renderPagination = (
    currentPage: number,
    totalPages: number,
    totalItems: number,
    pageSize: number,
    onPageChange: (page: number) => void,
    itemName = 'records'
  ) => {
    if (totalItems === 0) return null;
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalItems);

    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const middleStart = Math.max(2, currentPage - 1);
      const middleEnd = Math.min(totalPages - 1, currentPage + 1);
      for (let i = middleStart; i <= middleEnd; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('...');
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }

    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          paddingTop: 14,
          marginTop: 14,
          borderTop: '1px solid #f1f5f9',
          fontSize: '0.84rem',
          color: '#64748b',
        }}
      >
        <div>
          Showing <strong style={{ color: '#0f172a' }}>{start}</strong> to{' '}
          <strong style={{ color: '#0f172a' }}>{end}</strong> of{' '}
          <strong style={{ color: '#0f172a' }}>{totalItems}</strong> {itemName}
        </div>

        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '6px 12px',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                background: currentPage === 1 ? '#f8fafc' : '#ffffff',
                color: currentPage === 1 ? '#94a3b8' : '#334155',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: '0.8rem',
                transition: 'all 0.15s ease',
              }}
            >
              <ChevronLeft size={14} /> Prev
            </button>

            {pages.map((p, idx) =>
              typeof p === 'number' ? (
                <button
                  key={idx}
                  onClick={() => onPageChange(p)}
                  style={{
                    minWidth: 32,
                    height: 32,
                    padding: '0 8px',
                    borderRadius: 8,
                    border: p === currentPage ? '1.5px solid var(--primary-neon)' : '1px solid #e2e8f0',
                    background: p === currentPage ? 'var(--primary-neon)' : '#ffffff',
                    color: p === currentPage ? '#ffffff' : '#334155',
                    fontWeight: p === currentPage ? 700 : 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {p}
                </button>
              ) : (
                <span key={idx} style={{ padding: '0 4px', color: '#94a3b8' }}>
                  …
                </span>
              )
            )}

            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '6px 12px',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                background: currentPage === totalPages ? '#f8fafc' : '#ffffff',
                color: currentPage === totalPages ? '#94a3b8' : '#334155',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: '0.8rem',
                transition: 'all 0.15s ease',
              }}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    fetchWithdrawMethods();
    if (user) {
      fetchWatchHistory();
      fetchTransactions();
      fetchPlatformStats();
    }
  }, [user]);

  // Auto-fill account details from saved verified payment methods
  useEffect(() => {
    if (user?.savedPaymentMethods) {
      const bound = user.savedPaymentMethods.find((p) => p.method === withdrawMethod);
      if (bound) {
        setAccountDetails(bound.accountNumber);
      } else {
        setAccountDetails('');
      }
    }
  }, [withdrawMethod, user?.savedPaymentMethods]);

  const { usdToBdt } = useExchangeRate();
  const bdtRate = usdToBdt;
  const payoutMethods = getPayoutMethods(usdToBdt, serverWithdrawMethods);
  const selectedConfig = payoutMethods.find((m) => m.id === withdrawMethod) || payoutMethods[0];
  const selectedMinWithdraw = selectedConfig?.minWithdrawUsd ?? 5.0;

  // Handle Withdrawal
  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    if (!user) {
      setMsg({ type: 'error', text: 'Please sign in to withdraw earnings.' });
      return;
    }

    const currentViewerBal = user.viewerBalance !== undefined ? user.viewerBalance : Math.max(0, (user.totalEarned || 0) - (user.totalWithdrawn || 0));
    const numWithdrawAmount = typeof withdrawAmount === 'string' ? (parseFloat(withdrawAmount) || 0) : (withdrawAmount || 0);

    if (numWithdrawAmount < selectedMinWithdraw) {
      const bdtPart = selectedConfig.isBDT ? ` (≈ ৳${Math.round(selectedMinWithdraw * bdtRate)} BDT)` : '';
      setMsg({ type: 'error', text: `Minimum withdrawal for ${selectedConfig.name} is $${selectedMinWithdraw.toFixed(2)} USD${bdtPart}.` });
      return;
    }

    if (currentViewerBal < numWithdrawAmount) {
      setMsg({ type: 'error', text: `Insufficient viewer balance ($${currentViewerBal.toFixed(4)} available).` });
      return;
    }

    const linkedMethod = user.savedPaymentMethods?.find((p) => p.method === withdrawMethod);
    if (!linkedMethod || !linkedMethod.accountNumber || !linkedMethod.accountNumber.trim()) {
      setMsg({
        type: 'error',
        text: `Please link and save your verified ${selectedConfig.name} account in Profile Settings before withdrawing.`,
      });
      return;
    }

    setLoading(true);
    const deviceInfo = navigator.userAgent.includes('Mobile') ? 'Mobile Web Browser' : 'Desktop Browser';
    const res = await apiRequest<any>('/wallet/withdraw', {
      method: 'POST',
      body: JSON.stringify({
        amount: Number(numWithdrawAmount),
        method: withdrawMethod,
        accountDetails: linkedMethod.accountNumber.trim(),
        deviceInfo,
      }),
    });
    setLoading(false);

    if (res.success) {
      setMsg({ type: 'success', text: '✓ Withdrawal submitted successfully! Payout will be disbursed shortly.' });
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
  const approxBDT = (viewerBal * bdtRate).toFixed(0);

  const numWithdrawAmount = (withdrawAmount !== '' && withdrawAmount !== null && withdrawAmount !== undefined && withdrawAmount.toString().trim() !== '')
    ? (parseFloat(withdrawAmount.toString()) || 0)
    : 0;
  const hasWithdrawInput = withdrawAmount !== '' && withdrawAmount !== null && withdrawAmount !== undefined && withdrawAmount.toString().trim() !== '';
  const isWithdrawBelowMin = hasWithdrawInput && numWithdrawAmount < selectedMinWithdraw;
  const isWithdrawExceedsBal = hasWithdrawInput && numWithdrawAmount > viewerBal;
  const isWithdrawValid = hasWithdrawInput && numWithdrawAmount >= selectedMinWithdraw && numWithdrawAmount <= viewerBal;

  // Daily Earning & Watch Count (strictly completed/verified watch tasks)
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const todaysCompletedTasks = watchHistory.filter((task) => {
    const isCompleted = task.status === 'completed';
    const d = task.completedAt ? new Date(task.completedAt) : (task.updatedAt ? new Date(task.updatedAt) : (task.createdAt ? new Date(task.createdAt) : null));
    return isCompleted && d && d >= startOfDay;
  });

  const todaysWatchCount = todaysCompletedTasks.length;

  const watchTodayEarned = todaysCompletedTasks.reduce((sum, task) => sum + (task.rewardAmount || task.rewardUsd || 0), 0);

  const dailyEarnings = user.dailyEarnings !== undefined
    ? user.dailyEarnings
    : watchTodayEarned;

  const approxDailyBDT = (dailyEarnings * bdtRate).toFixed(0);

  // Google redirect URL method to bypass Google Play Protect prompts
  const getGoogleRedirectUrl = (videoId: string) => {
    return `https://www.google.com/url?sa=t&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}`;
  };

  // Render Status Badge: Verified (Green) vs Interrupted (Orange-Red)
  const renderWatchStatusBadge = (status: string) => {
    const isCompleted = status === 'completed';
    if (isCompleted) {
      return (
        <span
          className="badge-pill"
          style={{
            padding: '3px 9px',
            fontSize: '0.72rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            background: '#ecfdf5',
            color: '#059669',
            border: '1px solid rgba(16, 185, 129, 0.3)',
          }}
        >
          <CheckCircle2 size={12} /> Verified
        </span>
      );
    }
    return (
      <span
        className="badge-pill"
        style={{
          padding: '3px 9px',
          fontSize: '0.72rem',
          fontWeight: 700,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          background: '#fff7ed',
          color: '#ea580c',
          border: '1px solid rgba(234, 88, 12, 0.35)',
        }}
      >
        <Clock size={12} /> Interrupted
      </span>
    );
  };

  // Render Reward: Verified has + in green, In-Progress has NO + and orange-red color
  const renderWatchReward = (item: any, fontSize = '0.94rem') => {
    const isCompleted = item.status === 'completed';
    const reward = item.rewardAmount || 0.0035;
    if (isCompleted) {
      return (
        <span className="font-mono" style={{ fontWeight: 800, fontSize, color: '#059669' }}>
          +${reward.toFixed(4)}
        </span>
      );
    }
    return (
      <span className="font-mono" style={{ fontWeight: 800, fontSize, color: '#ea580c' }}>
        ${reward.toFixed(4)}
      </span>
    );
  };

  const linkedPaymentMethod = user?.savedPaymentMethods?.find((p) => p.method === withdrawMethod);
  const isLinked = !!(linkedPaymentMethod && linkedPaymentMethod.accountNumber);

  return (
    <div className="responsive-container">
      <div className="dashboard-layout">

        {/* =========================================================================
            SIDEBAR (CLEAN ON MOBILE: ONLY TABS SHOWN, PROFILES ON TOP BAR)
            ========================================================================= */}
        <aside className="dashboard-sidebar">
          {/* User Header */}
          <div className="dashboard-sidebar-profile" style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 14, borderBottom: '1px solid #f1f5f9' }}>
            <UserAvatar
              user={user}
              size={46}
              borderColor="var(--primary-neon)"
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

            <button
              onClick={() => { setActiveTab('referrals'); setMsg(null); }}
              className={`dashboard-nav-item ${activeTab === 'referrals' ? 'active-neon' : ''}`}
            >
              <div className="nav-left">
                <Gift size={20} />
                <span>Referral (10%)</span>
              </div>
              <span className="dashboard-nav-badge badge-cyan" style={{ fontSize: '0.62rem', padding: '1px 6px' }}>10%</span>
            </button>

            <button
              onClick={() => { setActiveTab('profile'); setMsg(null); }}
              className={`dashboard-nav-item ${activeTab === 'profile' ? 'active-neon' : ''}`}
            >
              <div className="nav-left">
                <UserCheck size={20} />
                <span>Account Profile</span>
              </div>
            </button>
          </nav>

          {/* Profile Switch Button (Desktop Only) */}
          <div className="dashboard-switch-widget" style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
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
                <h1 className="font-display" style={{ fontSize: 'clamp(1.4rem, 5vw, 1.85rem)', color: '#0f172a', margin: 0, letterSpacing: '0.01em' }}>
                  VIEWER STUDIO
                </h1>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setActiveTab('watch')}
                    className="btn btn-neon glow-neon"
                    style={{ padding: '9px 18px', fontSize: '0.88rem', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 7 }}
                  >
                    <img src="/payment-methods/image.png" alt="" style={{ width: 17, height: 17, borderRadius: '50%' }} /> Watch & Earn (App)
                  </button>
                </div>
              </div>

              {/* 3 Metric Cards Grid (Responsive Grid with Featured Balance) */}
              <div className="responsive-kpi-grid">
                {/* 1. Cash Balance (Featured Full Width on Phones) */}
                <div className="glass-card responsive-kpi-card responsive-kpi-featured" style={{ padding: '20px', border: '1.5px solid rgba(14, 165, 233, 0.4)', borderRadius: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="font-mono" style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Available Earnings
                    </span>
                    <Wallet size={18} color="var(--primary-neon)" />
                  </div>
                  <div className="font-mono responsive-kpi-val" style={{ fontSize: '2.3rem', fontWeight: 800, color: 'var(--primary-neon)', marginTop: 6, lineHeight: 1 }}>
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

                {/* 2. Today's Earnings */}
                <div className="glass-card responsive-kpi-card" style={{ padding: '20px', borderRadius: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="font-mono" style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Today’s Earnings
                    </span>
                    <span className="badge-pill" style={{ fontSize: '0.68rem', padding: '2px 7px', background: '#dcfce7', color: '#15803d', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      <Sparkles size={12} color="#16a34a" /> TODAY
                    </span>
                  </div>
                  <div className="font-mono responsive-kpi-val" style={{ fontSize: '2.3rem', fontWeight: 800, color: '#059669', marginTop: 6, lineHeight: 1 }}>
                    ${dailyEarnings.toFixed(4)}
                  </div>
                  <div className="font-mono" style={{ fontSize: '0.84rem', color: '#059669', fontWeight: 600, marginTop: 4 }}>
                    ≈ ৳{approxDailyBDT} BDT
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 6 }}>
                    Watch rewards earned today
                  </div>
                </div>

                {/* 3. Total Withdrawn (Visible on mobile view side-by-side with Today's Earnings!) */}
                <div className="glass-card responsive-kpi-card" style={{ padding: '20px', borderRadius: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="font-mono" style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Total Withdrawn
                    </span>
                    <CreditCard size={18} color="#7c3aed" />
                  </div>
                  <div className="font-mono responsive-kpi-val" style={{ fontSize: '2.3rem', fontWeight: 800, color: '#7c3aed', marginTop: 6, lineHeight: 1 }}>
                    ${(user.totalWithdrawn || 0).toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 10 }}>
                    Disbursed to bKash/Nagad/Crypto
                  </div>
                </div>

                {/* 4. Total Watched (Hidden on mobile view, visible on desktop) */}
                <div className="glass-card responsive-kpi-card desktop-only-kpi" style={{ padding: '20px', borderRadius: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="font-mono" style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Total Watched
                    </span>
                    <Play size={18} color="#0284c7" />
                  </div>
                  <div className="font-mono responsive-kpi-val" style={{ fontSize: '2.3rem', fontWeight: 800, color: '#0284c7', marginTop: 6, lineHeight: 1 }}>
                    {watchHistory.filter((t) => t.status === 'completed').length}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 6 }}>
                    Completed video tasks
                  </div>
                </div>

                {/* 5. Total Earned (Hidden on mobile phones, visible on desktop) */}
                <div className="glass-card responsive-kpi-card desktop-only-kpi" style={{ padding: '20px', borderRadius: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="font-mono" style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Total Earned
                    </span>
                    <TrendingUp size={18} color="#0f172a" />
                  </div>
                  <div className="font-mono responsive-kpi-val" style={{ fontSize: '2.3rem', fontWeight: 800, color: '#0f172a', marginTop: 6, lineHeight: 1 }}>
                    ${(user.totalEarned || 0).toFixed(4)}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 10 }}>
                    Lifetime watch rewards
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
                  <img
                    src="/payment-methods/image.png"
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
                      style={{ background: 'none', border: 'none', color: 'var(--primary-neon)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Watch & earn cash on our Android App
                    </button>!
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
                                    <div style={{ fontWeight: 600, color: '#0f172a', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
                              <td style={{ padding: '10px 12px' }}>
                                {renderWatchReward(item)}
                              </td>
                              <td style={{ padding: '10px 12px' }}>
                                {renderWatchStatusBadge(item.status)}
                              </td>
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
                        <div key={item._id} className="mobile-data-card" style={{ padding: '12px', borderRadius: 12, border: '1px solid #f1f5f9', background: '#fafafa', marginBottom: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                              <img
                                src={item.campaignId?.thumbnailUrl || `https://img.youtube.com/vi/${item.videoId}/default.jpg`}
                                alt="thumb"
                                style={{ width: 44, height: 32, borderRadius: 6, objectFit: 'cover', background: '#000', flexShrink: 0 }}
                              />
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.86rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
                              <div style={{ marginBottom: 4 }}>
                                {renderWatchReward(item)}
                              </div>
                              <div>
                                {renderWatchStatusBadge(item.status)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
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
                    src="/payment-methods/image.png"
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
                      +${watchHistory.filter((t) => t.status === 'completed').reduce((sum, t) => sum + (t.rewardAmount || 0.0035), 0).toFixed(4)} USD
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
                      src="/payment-methods/image.png"
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
                                <td style={{ padding: '10px 12px' }}>
                                  {renderWatchReward(item)}
                                </td>
                                <td style={{ padding: '10px 12px' }}>
                                  {renderWatchStatusBadge(item.status)}
                                </td>
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

                    {renderPagination(
                      watchPage,
                      Math.ceil(watchHistory.length / WATCH_PAGE_SIZE) || 1,
                      watchHistory.length,
                      WATCH_PAGE_SIZE,
                      setWatchPage,
                      'videos watched'
                    )}
                  </>
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
                  Min Payout: ${selectedMinWithdraw.toFixed(2)} USD {selectedConfig.isBDT ? `(≈ ৳${Math.round(selectedMinWithdraw * bdtRate)} BDT)` : ''}
                </span>
              </div>

              {/* INDIVIDUAL METHOD CARDS - LOGO + NAME + MIN WITHDRAW AMOUNT ON CARD */}
              <div style={{ marginBottom: 18 }}>
                <label className="font-mono" style={{ fontSize: '0.84rem', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: 10, fontWeight: 700 }}>
                  Select Withdrawal Method:
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 125px), 1fr))', gap: 12 }}>
                  {payoutMethods.map((m) => {
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
                          padding: '14px 10px 12px',
                          cursor: 'pointer',
                          transition: 'all 0.18s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          minHeight: 142,
                          position: 'relative',
                          boxShadow: isSelected ? '0 4px 14px rgba(14, 165, 233, 0.2)' : '0 1px 3px rgba(0,0,0,0.02)',
                        }}
                      >
                        {/* Checkmark Indicator */}
                        {isSelected && (
                          <div
                            style={{
                              position: 'absolute',
                              top: 6,
                              right: 6,
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

                        {/* Top Section: Logo & Name */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: '100%' }}>
                          {/* Official Brand Logo */}
                          <div
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: 12,
                              background: '#ffffff',
                              border: isSelected ? '1.5px solid var(--primary-neon)' : '1px solid #e2e8f0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: 6,
                              boxShadow: isSelected ? '0 4px 14px rgba(14, 165, 233, 0.22)' : '0 2px 6px rgba(0,0,0,0.04)',
                              transition: 'all 0.18s ease',
                            }}
                          >
                            <img
                              src={m.logoUrl}
                              alt={m.name}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                display: 'block',
                              }}
                            />
                          </div>

                          {/* Brand Name */}
                          <span
                            style={{
                              fontSize: '0.88rem',
                              fontWeight: 800,
                              color: '#0f172a',
                              textAlign: 'center',
                              lineHeight: 1.2,
                              minHeight: 22,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {m.name}
                          </span>
                        </div>

                        {/* Min Limit Badge on Card */}
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            color: isSelected ? 'var(--primary-neon)' : '#64748b',
                            background: isSelected ? '#e0f2fe' : '#f1f5f9',
                            border: isSelected ? '1px solid rgba(14, 165, 233, 0.3)' : '1px solid #e2e8f0',
                            padding: '2px 8px',
                            borderRadius: 6,
                            textAlign: 'center',
                            whiteSpace: 'nowrap',
                            marginTop: 4,
                          }}
                        >
                          {m.minLimitText}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* WITHDRAWAL FORM */}
              <form onSubmit={handleWithdraw} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: 14, alignItems: 'start' }}>
                  {/* Amount Input */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: 24, marginBottom: 6 }}>
                      <label className="font-mono" style={{ fontSize: '0.84rem', color: '#475569', fontWeight: 700 }}>
                        Amount (USD):
                      </label>
                      <span className="font-mono" style={{ fontSize: '0.82rem', color: 'var(--primary-neon)', fontWeight: 700 }}>
                        Max: ${viewerBal.toFixed(4)}
                      </span>
                    </div>

                    <input
                      type="number"
                      step="any"
                      placeholder={`Enter amount (min $${selectedMinWithdraw.toFixed(2)})`}
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="input-field"
                      style={{
                        padding: '11px 14px',
                        fontSize: '0.98rem',
                        borderColor: (isWithdrawBelowMin || isWithdrawExceedsBal) ? '#ef4444' : undefined,
                        color: (isWithdrawBelowMin || isWithdrawExceedsBal) ? '#dc2626' : undefined,
                        background: (isWithdrawBelowMin || isWithdrawExceedsBal) ? '#fff1f2' : undefined,
                      }}
                      required
                    />

                    {/* Warning Messages */}
                    {isWithdrawBelowMin && (
                      <div style={{ color: '#ef4444', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5, marginTop: 6 }}>
                        <AlertCircle size={14} color="#ef4444" style={{ flexShrink: 0 }} />
                        <span>Minimum cashout for {selectedConfig.name} is ${selectedMinWithdraw.toFixed(2)} USD{selectedConfig.isBDT ? ` (≈ ৳${Math.round(selectedMinWithdraw * bdtRate)} BDT)` : ''}.</span>
                      </div>
                    )}
                    {!isWithdrawBelowMin && isWithdrawExceedsBal && (
                      <div style={{ color: '#ef4444', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5, marginTop: 6 }}>
                        <AlertCircle size={14} color="#ef4444" style={{ flexShrink: 0 }} />
                        <span>Amount exceeds available balance (${viewerBal.toFixed(4)} USD).</span>
                      </div>
                    )}

                    {/* Quick Amount Pills ($5 Minimum) */}
                    <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
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
                            background: hasWithdrawInput && numWithdrawAmount === preset ? '#e0f2fe' : '#ffffff',
                            color: hasWithdrawInput && numWithdrawAmount === preset ? 'var(--primary-neon)' : '#64748b',
                            borderColor: hasWithdrawInput && numWithdrawAmount === preset ? 'var(--primary-neon)' : undefined,
                            fontWeight: hasWithdrawInput && numWithdrawAmount === preset ? 700 : 500,
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: 24, marginBottom: 6, gap: 6 }}>
                      <label className="font-mono" style={{ fontSize: '0.84rem', color: '#475569', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={selectedConfig.inputLabel}>
                        {selectedConfig.inputLabel}:
                      </label>
                      {isLinked ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            color: '#059669',
                            background: '#ecfdf5',
                            border: '1px solid #a7f3d0',
                            padding: '2px 8px',
                            borderRadius: 6,
                            flexShrink: 0,
                          }}
                        >
                          <Lock size={11} /> Linked & Locked
                        </span>
                      ) : (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            color: '#b45309',
                            background: '#fef3c7',
                            border: '1px solid #fde68a',
                            padding: '2px 8px',
                            borderRadius: 6,
                            flexShrink: 0,
                          }}
                        >
                          <AlertCircle size={11} /> Not Linked
                        </span>
                      )}
                    </div>

                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        placeholder={isLinked ? selectedConfig.placeholder : `No linked ${selectedConfig.name} account found in profile`}
                        value={isLinked ? (linkedPaymentMethod?.accountNumber || accountDetails) : ''}
                        readOnly={true}
                        disabled={!isLinked}
                        className="input-field"
                        style={{
                          padding: isLinked ? '11px 38px 11px 14px' : '11px 14px',
                          fontSize: '0.98rem',
                          background: '#f8fafc',
                          borderColor: isLinked ? '#cbd5e1' : '#fde68a',
                          cursor: 'not-allowed',
                          color: isLinked ? '#0f172a' : '#94a3b8',
                          fontWeight: isLinked ? 600 : 400,
                        }}
                        required={isLinked}
                      />
                      {isLinked && (
                        <div
                          style={{
                            position: 'absolute',
                            right: 12,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#059669',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                          title="This payment method is bound to your account profile."
                        >
                          <Lock size={15} />
                        </div>
                      )}
                    </div>

                    {isLinked ? (
                      <span style={{ fontSize: '0.78rem', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 5, flexWrap: 'wrap', gap: 6 }}>
                        <span>✓ Pre-filled from your linked account.</span>
                        <button
                          type="button"
                          onClick={() => setActiveTab('profile')}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--primary-neon)',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            padding: 0,
                          }}
                        >
                          Edit in Profile Settings
                        </button>
                      </span>
                    ) : (
                      <div
                        style={{
                          marginTop: 8,
                          padding: '10px 14px',
                          background: '#fffbeb',
                          border: '1px solid #fde68a',
                          borderRadius: 10,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: 8,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: '#92400e', fontWeight: 600 }}>
                          <AlertCircle size={16} color="#d97706" style={{ flexShrink: 0 }} />
                          <span>You must link your verified {selectedConfig.name} account in Profile Settings before withdrawing.</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveTab('profile')}
                          className="btn btn-ghost"
                          style={{
                            padding: '4px 10px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            background: '#fef3c7',
                            borderColor: '#f59e0b',
                            color: '#b45309',
                          }}
                        >
                          Set Up in Profile Settings →
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Real-Time Conversion Box (Mobile Friendly Wrapping) */}
                <div
                  style={{
                    background: '#f0f9ff',
                    padding: '16px 20px',
                    borderRadius: 14,
                    border: '1px solid rgba(14, 165, 233, 0.25)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 14,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 6,
                        flexShrink: 0,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                      }}
                    >
                      <img
                        src={selectedConfig.logoUrl}
                        alt={selectedConfig.name}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.94rem', color: '#334155' }}>
                        Payout Method: <strong>{selectedConfig.name}</strong>
                      </span>
                      <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                        {selectedConfig.rateText}
                      </div>
                    </div>
                  </div>

                  <div style={{ minWidth: 140 }}>
                    <span style={{ fontSize: '0.82rem', color: '#64748b', display: 'block' }}>You Receive:</span>
                    <strong className="font-mono" style={{ fontSize: '1.5rem', color: (isWithdrawBelowMin || isWithdrawExceedsBal) ? '#ef4444' : '#059669' }}>
                      {hasWithdrawInput && numWithdrawAmount > 0
                        ? (selectedConfig.isBDT
                            ? `৳${(numWithdrawAmount * bdtRate).toFixed(0)} BDT`
                            : `$${numWithdrawAmount.toFixed(2)} USD`)
                        : (selectedConfig.isBDT ? '৳0 BDT' : '$0.00 USD')}
                    </strong>
                  </div>
                </div>

                {isLinked ? (
                  <button
                    type="submit"
                    disabled={loading || viewerBal < 5.0 || !isWithdrawValid}
                    className="btn btn-neon glow-neon"
                    style={{
                      padding: '13px',
                      fontSize: '0.96rem',
                      borderRadius: 12,
                      marginTop: 4,
                      opacity: (!isWithdrawValid || viewerBal < 5.0) ? 0.6 : 1,
                      cursor: (!isWithdrawValid || viewerBal < 5.0) ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {loading
                      ? 'Submitting Request...'
                      : !hasWithdrawInput
                      ? 'Enter Amount to Cashout'
                      : isWithdrawBelowMin
                      ? 'Minimum Cashout is $5.00 USD'
                      : isWithdrawExceedsBal
                      ? 'Insufficient Balance'
                      : `Withdraw $${numWithdrawAmount.toFixed(2)} USD via ${selectedConfig.name}`}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveTab('profile')}
                    className="btn btn-ghost"
                    style={{
                      padding: '13px',
                      fontSize: '0.96rem',
                      borderRadius: 12,
                      marginTop: 4,
                      borderColor: '#f59e0b',
                      background: '#fef3c7',
                      color: '#b45309',
                      fontWeight: 700,
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    <AlertCircle size={18} /> Link {selectedConfig.name} in Profile Settings to Withdraw
                  </button>
                )}
              </form>
            </div>
          )}

          {/* TAB 4: TRANSACTIONS & PLATFORM LEDGER (2 SUB-TABS) */}
          {activeTab === 'transactions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Header with Sub-tab Switcher */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <h3 className="font-display" style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', color: '#0f172a', margin: 0 }}>
                  PAYOUT LEDGER
                </h3>

                {/* Sub-Tab Selector */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 4,
                    background: '#f1f5f9',
                    padding: '3px',
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    width: '100%',
                    maxWidth: 420,
                  }}
                >
                  <button
                    onClick={() => setLedgerTab('my_tx')}
                    style={{
                      padding: '7px 8px',
                      fontSize: 'clamp(0.74rem, 2.4vw, 0.84rem)',
                      fontWeight: 700,
                      borderRadius: 10,
                      border: 'none',
                      cursor: 'pointer',
                      background: ledgerTab === 'my_tx' ? '#ffffff' : 'transparent',
                      color: ledgerTab === 'my_tx' ? 'var(--primary-neon)' : '#64748b',
                      boxShadow: ledgerTab === 'my_tx' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 5,
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <CreditCard size={14} style={{ flexShrink: 0 }} />
                    <span>My Payouts ({transactions.length})</span>
                  </button>

                  <button
                    onClick={() => { setLedgerTab('platform'); fetchPlatformStats(); }}
                    style={{
                      padding: '7px 8px',
                      fontSize: 'clamp(0.74rem, 2.4vw, 0.84rem)',
                      fontWeight: 700,
                      borderRadius: 10,
                      border: 'none',
                      cursor: 'pointer',
                      background: ledgerTab === 'platform' ? '#ffffff' : 'transparent',
                      color: ledgerTab === 'platform' ? '#059669' : '#64748b',
                      boxShadow: ledgerTab === 'platform' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 5,
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Globe size={14} style={{ flexShrink: 0 }} />
                    <span>Total Stats & Feed</span>
                  </button>
                </div>
              </div>

              {/* SUB-TAB 1: MY WITHDRAWALS */}
              {ledgerTab === 'my_tx' && (
                <div className="glass-card" style={{ padding: '22px', borderRadius: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <h4 className="font-display" style={{ fontSize: '1.15rem', color: '#0f172a', margin: 0 }}>
                      PAYOUT LEDGER
                    </h4>
                    <button
                      onClick={fetchTransactions}
                      className="btn btn-ghost"
                      style={{ padding: '5px 12px', fontSize: '0.82rem', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <RefreshCw size={14} className={txLoading ? 'animate-spin' : ''} /> Refresh
                    </button>
                  </div>

                  {!transactions.length ? (
                    <div style={{ textAlign: 'center', padding: '36px', color: '#64748b', fontSize: '0.9rem' }}>
                      No payout records found yet.
                    </div>
                  ) : (
                    <>
                      {/* Desktop Table View */}
                      <div className="desktop-only-table responsive-table-wrapper">
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
                            {transactions
                              .slice((txPage - 1) * TX_PAGE_SIZE, txPage * TX_PAGE_SIZE)
                              .map((tx) => (
                                <tr key={tx._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                  <td style={{ padding: '10px 12px' }}>
                                    <span className="badge-pill badge-cyan" style={{ padding: '2px 8px', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                                      {tx.gateway || tx.type}
                                    </span>
                                  </td>
                                  <td className="font-mono" style={{ padding: '10px 12px', fontWeight: 700, fontSize: '0.92rem', color: '#ef4444' }}>
                                    -${Math.abs(tx.amount).toFixed(2)}
                                  </td>
                                  <td className="font-mono" style={{ padding: '10px 12px', color: '#0f172a', fontSize: '0.92rem' }}>
                                    ${(tx.balanceAfter || 0).toFixed(4)}
                                  </td>
                                  <td style={{ padding: '10px 12px', color: tx.status === 'completed' ? '#059669' : tx.status === 'pending' ? '#d97706' : '#ef4444', fontWeight: 600 }}>
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

                      {/* Mobile Card List View */}
                      <div className="mobile-card-list">
                        {transactions
                          .slice((txPage - 1) * TX_PAGE_SIZE, txPage * TX_PAGE_SIZE)
                          .map((tx) => (
                            <div key={tx._id} className="mobile-data-card">
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                                <span className="badge-pill badge-cyan" style={{ padding: '2px 8px', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>
                                  {tx.gateway || tx.type}
                                </span>
                                <div className="font-mono" style={{ fontWeight: 800, fontSize: '1rem', color: '#ef4444' }}>
                                  -${Math.abs(tx.amount).toFixed(2)}
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', color: '#64748b' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span>Status:</span>
                                  <span style={{ color: tx.status === 'completed' ? '#059669' : tx.status === 'pending' ? '#d97706' : '#ef4444', fontWeight: 700, textTransform: 'capitalize' }}>
                                    {tx.status}
                                  </span>
                                  <span>•</span>
                                  <span>{new Date(tx.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="font-mono" style={{ color: '#0f172a', fontWeight: 600 }}>
                                  Bal: ${(tx.balanceAfter || 0).toFixed(4)}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>

                      {renderPagination(
                        txPage,
                        Math.ceil(transactions.length / TX_PAGE_SIZE) || 1,
                        transactions.length,
                        TX_PAGE_SIZE,
                        setTxPage,
                        'withdrawals'
                      )}
                    </>
                  )}
                </div>
              )}

              {/* SUB-TAB 2: TOTAL WITHDRAWALS & ALL WEBSITE DATA */}
              {ledgerTab === 'platform' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* 4 Real Data Metric Cards in Fluid Responsive Grid */}
                  <div className="responsive-kpi-grid">
                    {/* 1. Total Withdrawals Done */}
                    <div className="glass-card responsive-kpi-card" style={{ padding: '16px 14px', borderRadius: 16, border: '1.5px solid rgba(16, 185, 129, 0.3)', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                        <span className="font-mono" style={{ fontSize: '0.74rem', color: '#059669', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          Total Paid Out
                        </span>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <CreditCard size={15} color="#059669" />
                        </div>
                      </div>
                      <div className="font-mono responsive-kpi-val" style={{ fontSize: '1.65rem', fontWeight: 800, color: '#059669', marginTop: 8, lineHeight: 1 }}>
                        ${(platformStats?.totalWithdrawnUsd || 0).toFixed(2)}
                      </div>
                      <div className="font-mono" style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        ≈ ৳{Math.round((platformStats?.totalWithdrawnUsd || 0) * bdtRate).toLocaleString()} BDT
                      </div>
                    </div>

                    {/* 2. Total Times Watched */}
                    <div className="glass-card responsive-kpi-card" style={{ padding: '16px 14px', borderRadius: 16, border: '1.5px solid rgba(14, 165, 233, 0.3)', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                        <span className="font-mono" style={{ fontSize: '0.74rem', color: 'var(--primary-neon)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          Total Watched
                        </span>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <PlaySquare size={15} color="var(--primary-neon)" />
                        </div>
                      </div>
                      <div className="font-mono responsive-kpi-val" style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--primary-neon)', marginTop: 8, lineHeight: 1 }}>
                        {(platformStats?.totalTimesWatched || 0).toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Completed views
                      </div>
                    </div>

                    {/* 3. Active Community Earners */}
                    <div className="glass-card responsive-kpi-card" style={{ padding: '16px 14px', borderRadius: 16, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                        <span className="font-mono" style={{ fontSize: '0.74rem', color: '#7c3aed', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          Total Members
                        </span>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Users size={15} color="#7c3aed" />
                        </div>
                      </div>
                      <div className="font-mono responsive-kpi-val" style={{ fontSize: '1.65rem', fontWeight: 800, color: '#7c3aed', marginTop: 8, lineHeight: 1 }}>
                        {(platformStats?.activeEarnersCount || 0).toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Registered users
                      </div>
                    </div>

                    {/* 4. Average Payout Turnaround */}
                    <div className="glass-card responsive-kpi-card" style={{ padding: '16px 14px', borderRadius: 16, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                        <span className="font-mono" style={{ fontSize: '0.74rem', color: '#d97706', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          Avg Payout Time
                        </span>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Activity size={15} color="#d97706" />
                        </div>
                      </div>
                      <div className="font-mono responsive-kpi-val" style={{ fontSize: '1.65rem', fontWeight: 800, color: '#d97706', marginTop: 8, lineHeight: 1 }}>
                        &lt; 15 min
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Disbursement speed
                      </div>
                    </div>
                  </div>

                  {/* 2 Interactive Real Graphs Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))', gap: 14 }}>
                    {/* Graph 1: Daily Withdrawal Volume */}
                    <div className="glass-card" style={{ padding: '18px', borderRadius: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <BarChart3 size={16} color="#059669" />
                          <h4 className="font-display" style={{ fontSize: '1.05rem', color: '#0f172a', margin: 0 }}>
                            Daily Withdrawals ($ USD)
                          </h4>
                        </div>
                        <button
                          onClick={fetchPlatformStats}
                          className="btn btn-ghost"
                          style={{ padding: '4px 8px', fontSize: '0.78rem', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <RefreshCw size={12} className={platformStatsLoading ? 'animate-spin' : ''} />
                        </button>
                      </div>
                      {platformStats ? (
                        renderWithdrawalCurve(
                          platformStats.dailyWithdrawals || [0, 0, 0, 0, 0, 0, 0],
                          platformStats.chartLabels || ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                        )
                      ) : (
                        <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>Loading...</div>
                      )}
                    </div>

                    {/* Graph 2: Daily Videos Watched */}
                    <div className="glass-card" style={{ padding: '18px', borderRadius: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <PlaySquare size={16} color="var(--primary-neon)" />
                          <h4 className="font-display" style={{ fontSize: '1.05rem', color: '#0f172a', margin: 0 }}>
                            Daily Videos Watched
                          </h4>
                        </div>
                        <button
                          onClick={fetchPlatformStats}
                          className="btn btn-ghost"
                          style={{ padding: '4px 8px', fontSize: '0.78rem', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <RefreshCw size={12} className={platformStatsLoading ? 'animate-spin' : ''} />
                        </button>
                      </div>
                      {platformStats ? (
                        renderViewsBarChart(
                          platformStats.dailyViews || [0, 0, 0, 0, 0, 0, 0],
                          platformStats.chartLabels || ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                        )
                      ) : (
                        <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>Loading...</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              TAB 5: REFERRALS (10% COMMISSION)
              ========================================================================= */}
          {activeTab === 'referrals' && (
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
          )}

          {/* =========================================================================
              TAB 6: ACCOUNT PROFILE & PERSONAL SETTINGS
              ========================================================================= */}
          {activeTab === 'profile' && (
            <ProfileSettingsSection user={user} onRefreshUser={onRefreshUser} />
          )}
        </main>
      </div>
    </div>
  );
};
