import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  Copy,
  Wallet,
  Globe,
  Users,
  Activity,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  UserCheck,
  Lock,
} from 'lucide-react';
import { Campaign, User, Transaction, DepositMethod } from '../types';
import { apiRequest } from '../api';
import { ProfileSwitchBanner } from './ProfileSwitchBanner';
import { ProfileSettingsSection } from './ProfileSettingsSection';
import { useExchangeRate } from '../context/ExchangeRateContext';

interface CampaignerPortalProps {
  user: User | null;
  onRefreshUser: () => void;
  onOpenAuth?: (mode: 'signin' | 'signup', role?: 'viewer' | 'campaigner') => void;
  onSwitchProfile?: (targetRole: 'viewer' | 'campaigner') => void;
}

type CreatorTab = 'overview' | 'campaigns' | 'deposit' | 'ledger' | 'profile';

interface DepositMethodConfig {
  id: string;
  name: string;
  type?: string;
  accountType?: string;
  accountNumber?: string;
  instructions?: string;
  logoBg: string;
  logoMark: string;
  logoUrl: string;
  rateText: string;
  minLimitText: string;
  minDepositUsd?: number;
  isBDT?: boolean;
  enabled?: boolean;
}

const DEFAULT_METHODS_META: Record<string, { logoBg: string; logoMark: string; logoUrl: string; isBDT?: boolean; defaultRateText: string; defaultAccountType: string; defaultInstructions: string; defaultAccount: string }> = {
  bkash: {
    logoBg: '#ffffff',
    logoMark: 'bK',
    logoUrl: '/payment-methods/bkash.svg',
    isBDT: true,
    defaultRateText: 'Send Money (Personal MFS)',
    defaultAccountType: 'Personal',
    defaultInstructions: 'Send Money (Personal) to this bKash number. Copy the TrxID and enter below.',
    defaultAccount: '01XXXXXXXXX',
  },
  nagad: {
    logoBg: '#ffffff',
    logoMark: 'Nagad',
    logoUrl: '/payment-methods/nagad.svg',
    isBDT: true,
    defaultRateText: 'Send Money (Personal MFS)',
    defaultAccountType: 'Personal',
    defaultInstructions: 'Send Money (Personal) to this Nagad number. Copy the TrxID and enter below.',
    defaultAccount: '01XXXXXXXXX',
  },
  rocket: {
    logoBg: '#ffffff',
    logoMark: 'Rocket',
    logoUrl: '/payment-methods/rocket.svg',
    isBDT: true,
    defaultRateText: 'Send Money (Personal MFS)',
    defaultAccountType: 'Personal',
    defaultInstructions: 'Send Money to this Rocket number. Copy the TrxID and enter below.',
    defaultAccount: '01XXXXXXXXX',
  },
  crypto: {
    logoBg: '#ffffff',
    logoMark: '₮',
    logoUrl: '/payment-methods/crypto.svg',
    defaultRateText: 'USDT (BEP-20 / BNB Chain)',
    defaultAccountType: 'BEP-20 (BNB Smart Chain)',
    defaultInstructions: 'Send USDT (BEP-20 network only) to this wallet address. Paste the transaction hash below.',
    defaultAccount: '0x0000000000000000000000000000000000000000',
  },
  faucetpay: {
    logoBg: '#ffffff',
    logoMark: 'FP',
    logoUrl: '/payment-methods/faucetpay.svg',
    defaultRateText: 'Micropayment USD / Crypto',
    defaultAccountType: 'Email / Account',
    defaultInstructions: 'Send payment via FaucetPay to this email/address and enter your FaucetPay TrxID.',
    defaultAccount: 'admin@myyt.com',
  },
  webmoney: {
    logoBg: '#ffffff',
    logoMark: 'WM',
    logoUrl: '/payment-methods/webmoney.svg',
    defaultRateText: 'USD Purse (WMZ)',
    defaultAccountType: 'WMZ Purse',
    defaultInstructions: 'Transfer WMZ to this purse and enter the transaction number below.',
    defaultAccount: 'Z000000000000',
  },
};

const buildDepositMethods = (methodsList: DepositMethod[], usdToBdt: number): DepositMethodConfig[] => {
  if (methodsList && methodsList.length > 0) {
    return methodsList
      .filter((m) => m.enabled !== false)
      .map((m) => {
        const meta = DEFAULT_METHODS_META[m.id] || {
          logoBg: '#ffffff',
          logoMark: m.name.slice(0, 2),
          logoUrl: '/payment-methods/crypto.svg',
          isBDT: false,
          defaultRateText: m.accountType || 'Payment Gateway',
          defaultAccountType: m.accountType || 'Account',
          defaultInstructions: 'Send funds to the account details below and submit your TrxID.',
          defaultAccount: '',
        };

        const isBDT = meta.isBDT || m.id === 'bkash' || m.id === 'nagad' || m.id === 'rocket';
        const minUsd = m.minDepositUsd || 5.0;

        return {
          id: m.id,
          name: m.name,
          type: m.type,
          accountType: m.accountType || meta.defaultAccountType,
          accountNumber: m.accountNumber || meta.defaultAccount,
          instructions: m.instructions || meta.defaultInstructions,
          logoBg: meta.logoBg,
          logoMark: meta.logoMark,
          logoUrl: meta.logoUrl,
          rateText: isBDT
            ? `1 USD = ${usdToBdt} BDT (${m.accountType || meta.defaultAccountType})`
            : `${m.accountType || meta.defaultAccountType}`,
          minLimitText: `Min: $${minUsd.toFixed(2)} USD`,
          minDepositUsd: minUsd,
          isBDT,
          enabled: m.enabled !== false,
        };
      });
  }

  // Fallback defaults
  return [
    {
      id: 'faucetpay',
      name: 'FaucetPay',
      accountType: 'Email / Account',
      accountNumber: 'admin@myyt.com',
      instructions: 'Send payment via FaucetPay to this email/address and enter your FaucetPay TrxID.',
      logoBg: '#ffffff',
      logoMark: 'FP',
      logoUrl: '/payment-methods/faucetpay.svg',
      rateText: 'Micropayment USD / Crypto',
      minLimitText: 'Min: $5.00 USD',
      minDepositUsd: 5.0,
    },
    {
      id: 'crypto',
      name: 'USDT (BEP-20)',
      accountType: 'BEP-20 (BNB Smart Chain)',
      accountNumber: '0x0000000000000000000000000000000000000000',
      instructions: 'Send USDT (BEP-20 network only) to this wallet address. Paste the transaction hash below.',
      logoBg: '#ffffff',
      logoMark: '₮',
      logoUrl: '/payment-methods/crypto.svg',
      rateText: 'Only BEP-20 USDT Supported (BNB Smart Chain)',
      minLimitText: 'Min: $5.00 USD',
      minDepositUsd: 5.0,
    },
    {
      id: 'bkash',
      name: 'bKash',
      accountType: 'Personal',
      accountNumber: '01XXXXXXXXX',
      instructions: 'Send Money (Personal) to this bKash number. Copy the TrxID and enter below.',
      logoBg: '#ffffff',
      logoMark: 'bK',
      logoUrl: '/payment-methods/bkash.svg',
      rateText: `1 USD = ${usdToBdt} BDT (Personal MFS)`,
      minLimitText: 'Min: $5.00 USD',
      minDepositUsd: 5.0,
      isBDT: true,
    },
    {
      id: 'nagad',
      name: 'Nagad',
      accountType: 'Personal',
      accountNumber: '01XXXXXXXXX',
      instructions: 'Send Money (Personal) to this Nagad number. Copy the TrxID and enter below.',
      logoBg: '#ffffff',
      logoMark: 'Nagad',
      logoUrl: '/payment-methods/nagad.svg',
      rateText: `1 USD = ${usdToBdt} BDT (Personal MFS)`,
      minLimitText: 'Min: $5.00 USD',
      minDepositUsd: 5.0,
      isBDT: true,
    },
    {
      id: 'rocket',
      name: 'Rocket',
      accountType: 'Personal',
      accountNumber: '01XXXXXXXXX',
      instructions: 'Send Money to this Rocket number. Copy the TrxID and enter below.',
      logoBg: '#ffffff',
      logoMark: 'Rocket',
      logoUrl: '/payment-methods/rocket.svg',
      rateText: `1 USD = ${usdToBdt} BDT (Personal MFS)`,
      minLimitText: 'Min: $5.00 USD',
      minDepositUsd: 5.0,
      isBDT: true,
    },
    {
      id: 'webmoney',
      name: 'WebMoney',
      accountType: 'WMZ Purse',
      accountNumber: 'Z000000000000',
      instructions: 'Transfer WMZ to this purse and enter the transaction number below.',
      logoBg: '#ffffff',
      logoMark: 'WM',
      logoUrl: '/payment-methods/webmoney.svg',
      rateText: 'USD Purse (WMZ) • Manual Deposit',
      minLimitText: 'Min: $5.00 USD',
      minDepositUsd: 5.0,
    },
  ];
};

// Helper to render smooth SVG curve for creator spend volume
const renderSpendCurve = (data: number[], labels: string[]) => {
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
        <linearGradient id="creatorSpendGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <line x1="20" y1="35" x2={width - 20} y2="35" stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1" />
      <line x1="20" y1="75" x2={width - 20} y2="75" stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1" />
      <line x1="20" y1="115" x2={width - 20} y2="115" stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1" />
      <path d={areaD} fill="url(#creatorSpendGrad)" />
      <path d={pathD} fill="none" stroke="var(--primary-neon)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4.5" fill="#ffffff" stroke="var(--primary-neon)" strokeWidth="2.5" />
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

// Helper to render SVG bars for daily video views delivered
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
        <linearGradient id="creatorViewsBarGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
      </defs>
      <line x1="15" y1="35" x2={width - 15} y2="35" stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1" />
      <line x1="15" y1="75" x2={width - 15} y2="75" stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1" />
      <line x1="15" y1="115" x2={width - 15} y2="115" stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1" />
      {data.map((val, i) => {
        const barH = (val / maxVal) * 95;
        const x = paddingX + i * step + (step - barWidth) / 2;
        const y = height - 26 - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barWidth} height={barH} rx="5" fill="url(#creatorViewsBarGrad)" />
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

export const CampaignerPortal: React.FC<CampaignerPortalProps> = ({
  user,
  onRefreshUser,
  onOpenAuth,
  onSwitchProfile,
}) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') as CreatorTab | null;
  const [internalTab, setInternalTab] = useState<CreatorTab>(() => {
    return (tabFromUrl && ['overview', 'campaigns', 'deposit', 'ledger', 'profile'].includes(tabFromUrl))
      ? tabFromUrl
      : 'overview';
  });

  const activeTab = (tabFromUrl && ['overview', 'campaigns', 'deposit', 'ledger', 'profile'].includes(tabFromUrl))
    ? tabFromUrl
    : internalTab;

  useEffect(() => {
    if (tabFromUrl && ['overview', 'campaigns', 'deposit', 'ledger', 'profile'].includes(tabFromUrl)) {
      setInternalTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const setActiveTab = (tab: CreatorTab) => {
    setInternalTab(tab);
    setSearchParams({ tab });
  };

  // Creator Profile Balance (Ad Budget)
  const creatorBal = user?.creatorBalance !== undefined ? user.creatorBalance : (user?.balance || 0);

  // Deposit State
  const [depositAmount, setDepositAmount] = useState<string | number>('');
  const [depositGateway, setDepositGateway] = useState<string>('faucetpay');
  const [depositLoading, setDepositLoading] = useState<boolean>(false);
  const [depositMethodsList, setDepositMethodsList] = useState<DepositMethod[]>([]);
  const [senderAccount, setSenderAccount] = useState<string>('');
  const [transactionHash, setTransactionHash] = useState<string>('');
  const [depositNotes, setDepositNotes] = useState<string>('');
  const [copiedReceiver, setCopiedReceiver] = useState<boolean>(false);

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  // Transactions State (Spend Ledger - Deposits & Campaign Spends) & Pagination State (10 per page)
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txLoading, setTxLoading] = useState<boolean>(false);
  const [txPage, setTxPage] = useState<number>(1);
  const TX_PAGE_SIZE = 10;

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Spend Ledger Sub-Tab state
  const [ledgerTab, setLedgerTab] = useState<'my_tx' | 'platform'>('my_tx');
  const [platformStats, setPlatformStats] = useState<{
    totalViewsDelivered: number;
    activeCampaigns: number;
    totalCampaigns: number;
    totalSpendUsd: number;
    chartLabels: string[];
    dailySpend: number[];
    dailyViews: number[];
  } | null>(null);
  const [platformStatsLoading, setPlatformStatsLoading] = useState<boolean>(false);

  const fetchPlatformStats = async () => {
    setPlatformStatsLoading(true);
    const res = await apiRequest<any>('/campaigns/platform-stats');
    if (res.success && res.data) {
      setPlatformStats(res.data);
    }
    setPlatformStatsLoading(false);
  };

  const fetchCampaigns = async () => {
    const res = await apiRequest<Campaign[]>('/campaigns/mine');
    if (res.success && res.data) {
      setCampaigns(res.data);
    }
  };

  const fetchDepositMethods = async () => {
    const res = await apiRequest<DepositMethod[]>('/wallet/deposit-methods');
    if (res.success && res.data) {
      setDepositMethodsList(res.data);
    }
  };

  // Fetch Creator Transactions (Deposits & Campaign Spends only)
  const fetchTransactions = async () => {
    setTxLoading(true);
    const res = await apiRequest<Transaction[]>('/wallet/transactions?role=creator');
    setTxLoading(false);
    if (res.success && res.data) {
      const creatorTx = res.data.filter((tx) =>
        ['deposit', 'campaign_spend'].includes(tx.type)
      );
      setTransactions(creatorTx);
      setTxPage(1);
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
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }

    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          padding: '12px 16px',
          background: '#ffffff',
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          marginTop: 14,
        }}
      >
        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
          Showing <strong style={{ color: '#0f172a' }}>{start}-{end}</strong> of <strong style={{ color: '#0f172a' }}>{totalItems}</strong> {itemName}
        </span>

        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '6px 10px',
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

            {pages.map((p, idx) => (
              <button
                key={idx}
                onClick={() => typeof p === 'number' && onPageChange(p)}
                disabled={typeof p !== 'number'}
                style={{
                  minWidth: 32,
                  height: 32,
                  padding: '0 8px',
                  borderRadius: 8,
                  border: p === currentPage ? '1px solid var(--primary-neon)' : '1px solid #e2e8f0',
                  background: p === currentPage ? 'var(--primary-neon)' : typeof p === 'number' ? '#ffffff' : 'transparent',
                  color: p === currentPage ? '#ffffff' : '#334155',
                  cursor: typeof p === 'number' ? 'pointer' : 'default',
                  fontWeight: p === currentPage ? 800 : 600,
                  fontSize: '0.82rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease',
                }}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '6px 10px',
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
    if (user) {
      fetchCampaigns();
      fetchTransactions();
      fetchDepositMethods();
    }
  }, [user]);

  // Handle Deposit (Manual Deposit Submission for Admin Manual Approval)
  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      if (onOpenAuth) onOpenAuth('signin');
      return;
    }

    const hasDepositInput = depositAmount !== '' && depositAmount !== null && depositAmount !== undefined && depositAmount.toString().trim() !== '';
    const numDepositAmount = hasDepositInput ? (parseFloat(depositAmount.toString()) || 0) : 0;
    const currentMethodObj = depositMethods.find((m) => m.id === depositGateway) || depositMethods[0];
    const minRequired = currentMethodObj?.minDepositUsd || 5.0;

    if (!hasDepositInput || numDepositAmount < minRequired) {
      setFeedback({ type: 'error', message: `Minimum deposit for ${currentMethodObj.name} is $${minRequired.toFixed(2)} USD.` });
      return;
    }

    if (!senderAccount.trim()) {
      setFeedback({ type: 'error', message: 'Please enter your sender account number, wallet address, or phone number.' });
      return;
    }

    if (!transactionHash.trim()) {
      setFeedback({ type: 'error', message: 'Please enter the transaction ID (TrxID) or TxHash.' });
      return;
    }

    setDepositLoading(true);
    setFeedback(null);

    const res = await apiRequest<any>('/wallet/deposit', {
      method: 'POST',
      body: JSON.stringify({
        amount: Number(numDepositAmount),
        gateway: depositGateway,
        senderAccount: senderAccount.trim(),
        transactionHash: transactionHash.trim(),
        notes: depositNotes.trim() || undefined,
      }),
    });
    setDepositLoading(false);

    if (res.success) {
      setFeedback({
        type: 'success',
        message: `✓ Deposit request of $${numDepositAmount.toFixed(2)} USD submitted! It is currently pending Admin verification and will be credited once approved.`,
      });
      setDepositAmount('');
      setSenderAccount('');
      setTransactionHash('');
      setDepositNotes('');
      onRefreshUser();
      fetchTransactions();
    } else {
      setFeedback({ type: 'error', message: res.error || 'Deposit submission failed. Please try again.' });
    }
  };

  const togglePause = async (camp: Campaign) => {
    if (camp.pausedByAdmin) {
      setFeedback({
        type: 'error',
        message: 'This campaign was paused by an administrator. Contact to the admin to start the campaign again.',
      });
      return;
    }
    const action = camp.status === 'active' ? 'pause' : 'resume';
    const res = await apiRequest<Campaign>(`/campaigns/${camp._id}/${action}`, { method: 'POST' });
    if (res.success) {
      fetchCampaigns();
    } else {
      setFeedback({
        type: 'error',
        message: res.error || 'Failed to update campaign status.',
      });
    }
  };

  // Metrics
  const totalViewsDelivered = campaigns.reduce((acc, c) => acc + (c.viewsDelivered || 0), 0);
  const totalViewsTargeted = campaigns.reduce((acc, c) => acc + (c.targetViews || 0), 0);
  const activeCampaignsCount = campaigns.filter((c) => c.status === 'active').length;

  // Daily Spend (today's campaign ad spend)
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const txTodaySpend = (transactions || [])
    .filter((tx) => (tx.type === 'campaign_spend' || tx.type === 'campaign_creation') && tx.createdAt && new Date(tx.createdAt).getTime() >= startOfDay.getTime())
    .reduce((sum, tx) => sum + Math.abs(Number(tx.amount) || 0), 0);

  const campaignTodaySpend = (campaigns || [])
    .filter((c) => c.createdAt && new Date(c.createdAt).getTime() >= startOfDay.getTime())
    .reduce((sum, c) => sum + (Number(c.totalCost) || 0), 0);

  const dailySpend = Math.max(
    Number(user?.dailySpend || 0),
    txTodaySpend,
    campaignTodaySpend
  );

  const { usdToBdt } = useExchangeRate();
  const bdtRate = usdToBdt;
  const depositMethods = buildDepositMethods(depositMethodsList, usdToBdt);
  const selectedMethod = depositMethods.find((m) => m.id === depositGateway) || depositMethods[0];

  const minRequiredUsd = selectedMethod?.minDepositUsd || 5.0;
  const numDepositAmount = (depositAmount !== '' && depositAmount !== null && depositAmount !== undefined && depositAmount.toString().trim() !== '')
    ? (parseFloat(depositAmount.toString()) || 0)
    : 0;
  const hasDepositInput = depositAmount !== '' && depositAmount !== null && depositAmount !== undefined && depositAmount.toString().trim() !== '';
  const isDepositBelowMin = hasDepositInput && numDepositAmount < minRequiredUsd;
  const isDepositValid = hasDepositInput && numDepositAmount >= minRequiredUsd && senderAccount.trim() !== '' && transactionHash.trim() !== '';

  return (
    <div className="responsive-container">
      <div className="dashboard-layout">
        
        {/* =========================================================================
        {/* =========================================================================
            SIDEBAR (CLEAN ON MOBILE: ONLY TABS SHOWN, PROFILES ON TOP BAR)
            ========================================================================= */}
        <aside className="dashboard-sidebar">
          {/* User Header */}
          <div className="dashboard-sidebar-profile" style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 14, borderBottom: '1px solid #f1f5f9' }}>
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
              onClick={() => navigate('/buy-views')}
              className="dashboard-nav-item"
            >
              <div className="nav-left">
                <PlusCircle size={20} />
                <span>New Campaign</span>
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

            <button
              onClick={() => { setActiveTab('profile'); setFeedback(null); }}
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
                <h1 className="font-display" style={{ fontSize: 'clamp(1.4rem, 5vw, 1.85rem)', color: '#0f172a', margin: 0, letterSpacing: '0.01em' }}>
                  CREATOR STUDIO
                </h1>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => navigate('/buy-views')}
                    className="btn btn-neon glow-neon"
                    style={{ padding: '9px 18px', fontSize: '0.88rem', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <PlusCircle size={15} /> New Campaign
                  </button>
                </div>
              </div>

              {/* 4 Metric Cards Grid (Responsive Grid with Featured Balance) */}
              <div className="responsive-kpi-grid">
                {/* 1. Campaign Balance (Featured on Phones) */}
                <div className="glass-card responsive-kpi-card responsive-kpi-featured" style={{ padding: '20px', border: '1.5px solid rgba(14, 165, 233, 0.4)', borderRadius: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="font-mono" style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Ad Balance
                    </span>
                    <CreditCard size={18} color="var(--primary-neon)" />
                  </div>
                  <div className="font-mono responsive-kpi-val" style={{ fontSize: '2.3rem', fontWeight: 800, color: 'var(--primary-neon)', marginTop: 6, lineHeight: 1 }}>
                    ${creatorBal.toFixed(2)}
                  </div>
                  <button
                    onClick={() => setActiveTab('deposit')}
                    className="btn btn-ghost"
                    style={{ marginTop: 12, width: '100%', padding: '7px', fontSize: '0.82rem', borderRadius: 8, color: 'var(--primary-neon)' }}
                  >
                    + Deposit Budget
                  </button>
                </div>

                {/* 2. Today's Spending */}
                <div className="glass-card responsive-kpi-card" style={{ padding: '20px', borderRadius: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="font-mono" style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Today’s Spending
                    </span>
                    <span className="badge-pill" style={{ fontSize: '0.68rem', padding: '2px 7px', background: '#fef3c7', color: '#b45309', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      <Flame size={12} color="#f59e0b" /> TODAY
                    </span>
                  </div>
                  <div className="font-mono responsive-kpi-val" style={{ fontSize: '2.3rem', fontWeight: 800, color: '#d97706', marginTop: 6, lineHeight: 1 }}>
                    ${dailySpend.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 10 }}>
                    Campaign ad spend today
                  </div>
                </div>

                {/* 3. Views Delivered */}
                <div className="glass-card responsive-kpi-card" style={{ padding: '20px', borderRadius: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="font-mono" style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Total Delivered
                    </span>
                    <Eye size={18} color="#059669" />
                  </div>
                  <div className="font-mono responsive-kpi-val" style={{ fontSize: '2.3rem', fontWeight: 800, color: '#0f172a', marginTop: 6, lineHeight: 1 }}>
                    {totalViewsDelivered.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 10 }}>
                    of {totalViewsTargeted.toLocaleString()} targeted views
                  </div>
                </div>

                {/* 4. Total Invested */}
                <div className="glass-card responsive-kpi-card" style={{ padding: '20px', borderRadius: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="font-mono" style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Total Invested
                    </span>
                    <BarChart3 size={18} color="#7c3aed" />
                  </div>
                  <div className="font-mono responsive-kpi-val" style={{ fontSize: '2.3rem', fontWeight: 800, color: '#7c3aed', marginTop: 6, lineHeight: 1 }}>
                    ${(user?.totalSpent || 0).toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 10 }}>
                    Total promotion spend
                  </div>
                </div>

                {/* 4. Active Campaigns */}
                <div className="glass-card responsive-kpi-card" style={{ padding: '20px', borderRadius: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="font-mono" style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Active
                    </span>
                    <Megaphone size={18} color="#d97706" />
                  </div>
                  <div className="font-mono responsive-kpi-val" style={{ fontSize: '2.3rem', fontWeight: 800, color: '#d97706', marginTop: 6, lineHeight: 1 }}>
                    {activeCampaignsCount}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 10 }}>
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
                  <>
                    {/* Desktop Table View */}
                    <div className="desktop-only-table responsive-table-wrapper">
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
                                    style={{ padding: '4px 10px', fontSize: '0.76rem', borderRadius: 6, color: '#ef4444', background: '#fef2f2', border: '1px solid #fecaca' }}
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
                      {campaigns.slice(0, 4).map((camp) => {
                        const pct = Math.min(100, Math.round((camp.viewsDelivered / (camp.targetViews || 1)) * 100));
                        return (
                          <div key={camp._id} className="mobile-data-card">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                                <img
                                  src={camp.thumbnailUrl || `https://img.youtube.com/vi/${camp.videoId}/default.jpg`}
                                  alt="thumbnail"
                                  style={{ width: 46, height: 32, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }}
                                />
                                <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {camp.title || `Video ${camp.videoId}`}
                                </span>
                              </div>
                              <span
                                className="badge-pill"
                                style={{
                                  padding: '2px 8px',
                                  fontSize: '0.72rem',
                                  textTransform: 'uppercase',
                                  flexShrink: 0,
                                  background: camp.pausedByAdmin ? '#fef2f2' : camp.status === 'active' ? '#e0f2fe' : '#f1f5f9',
                                  color: camp.pausedByAdmin ? '#ef4444' : camp.status === 'active' ? 'var(--primary-neon)' : '#64748b',
                                  border: camp.pausedByAdmin ? '1px solid #fecaca' : undefined,
                                  fontWeight: camp.pausedByAdmin ? 700 : 600,
                                }}
                              >
                                {camp.pausedByAdmin ? 'Admin Paused' : camp.status}
                              </span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: '#64748b' }}>
                              <span>Views Delivered:</span>
                              <span className="font-mono" style={{ fontWeight: 700, color: 'var(--primary-neon)' }}>
                                {camp.viewsDelivered.toLocaleString()} / {camp.targetViews.toLocaleString()} ({pct}%)
                              </span>
                            </div>

                            {/* Mini Progress Bar */}
                            <div style={{ height: 5, background: '#f1f5f9', borderRadius: 9999, overflow: 'hidden' }}>
                              <div
                                style={{
                                  height: '100%',
                                  background: 'var(--primary-neon)',
                                  borderRadius: 9999,
                                  width: `${pct}%`,
                                }}
                              />
                            </div>

                            {camp.pausedByAdmin ? (
                              <button
                                onClick={() => togglePause(camp)}
                                title="Contact to the admin to start the campaign again"
                                className="btn btn-ghost mobile-btn-full"
                                style={{ padding: '7px 12px', fontSize: '0.8rem', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, border: '1px solid #fecaca', background: '#fef2f2', color: '#ef4444', fontWeight: 600 }}
                              >
                                <Lock size={13} />
                                <span>Contact Admin to Resume</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => togglePause(camp)}
                                className="btn btn-ghost mobile-btn-full"
                                style={{ padding: '7px 12px', fontSize: '0.8rem', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #e2e8f0', background: '#f8fafc' }}
                              >
                                {camp.status === 'active' ? <Pause size={13} /> : <Play size={13} />}
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
                                  style={{ padding: '4px 10px', fontSize: '0.76rem', borderRadius: 6, color: '#ef4444', background: '#fef2f2', border: '1px solid #fecaca' }}
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
                                  {camp.status === 'active' ? 'Pause' : 'Resume'}
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
                                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {camp.title || `Video ${camp.videoId}`}
                                </div>
                                <a
                                  href={`https://youtube.com/watch?v=${camp.videoId}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{ fontSize: '0.74rem', color: 'var(--primary-neon)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 3, marginTop: 2 }}
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
                                color: camp.status === 'active' ? 'var(--primary-neon)' : '#64748b'
                              }}
                            >
                              {camp.status}
                            </span>
                          </div>

                          {/* Badges: Duration & Cost */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '8px 12px', borderRadius: 8, fontSize: '0.82rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#475569' }}>
                              <Clock size={13} color="var(--primary-neon)" />
                              <span>Duration: <strong style={{ color: '#0f172a' }}>{camp.watchDurationSec}s</strong></span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#059669', fontWeight: 700, fontFamily: 'monospace' }}>
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
                                  transition: 'width 0.3s ease'
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
                              style={{ padding: '8px 14px', fontSize: '0.82rem', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, border: '1px solid #fecaca', background: '#fef2f2', color: '#ef4444', fontWeight: 600 }}
                            >
                              <Lock size={14} />
                              <span>Contact Admin to Resume</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => togglePause(camp)}
                              className="btn btn-ghost mobile-btn-full"
                              style={{ padding: '8px 14px', fontSize: '0.82rem', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #e2e8f0', background: '#ffffff', fontWeight: 600 }}
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
          )}

          {/* =========================================================================
              TAB 3: DEPOSIT (MANUAL DEPOSIT WITH ADMIN APPROVAL)
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
                    Current Balance: <strong className="font-mono" style={{ color: 'var(--primary-neon)' }}>${creatorBal.toFixed(2)} USD</strong>
                  </span>
                </div>
                <span className="badge-pill badge-neon" style={{ fontSize: '0.74rem', padding: '4px 12px' }}>
                  Manual Deposit • Admin Approved
                </span>
              </div>

              {/* Feedback Alert */}
              {feedback && (
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: 12,
                    marginBottom: 16,
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    background: feedback.type === 'success' ? '#f0fdf4' : '#fef2f2',
                    border: feedback.type === 'success' ? '1px solid #86efac' : '1px solid #fca5a5',
                    color: feedback.type === 'success' ? '#15803d' : '#b91c1c',
                  }}
                >
                  {feedback.type === 'success' ? <CheckCircle2 size={18} color="#16a34a" /> : <AlertCircle size={18} color="#dc2626" />}
                  <span>{feedback.message}</span>
                </div>
              )}

              {/* INDIVIDUAL DEPOSIT METHOD CARDS */}
              <div style={{ marginBottom: 18 }}>
                <label className="font-mono" style={{ fontSize: '0.82rem', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: 10, fontWeight: 700 }}>
                  1. Select Payment Method:
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 125px), 1fr))', gap: 12 }}>
                  {depositMethods.map((m) => {
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

              {/* ADMIN RECEIVER ACCOUNT DETAILS CARD */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1.5px dashed rgba(14, 165, 233, 0.4)',
                  borderRadius: 14,
                  padding: '16px 18px',
                  marginBottom: 20,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 4,
                      }}
                    >
                      <img src={selectedMethod.logoUrl} alt={selectedMethod.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <div>
                      <span className="font-mono" style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                        2. Send Money / Payment To ({selectedMethod.name}):
                      </span>
                      <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>
                        Account Type: <span style={{ color: 'var(--primary-neon)' }}>{selectedMethod.accountType || 'Official Account'}</span>
                      </div>
                    </div>
                  </div>

                  <span className="badge-pill" style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '0.74rem', border: '1px solid rgba(14, 165, 233, 0.3)' }}>
                    {selectedMethod.rateText}
                  </span>
                </div>

                {/* Account Number / Address with Copy Button */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: 10,
                    padding: '10px 14px',
                  }}
                >
                  <span
                    className="font-mono"
                    style={{
                      fontSize: '0.96rem',
                      fontWeight: 700,
                      color: '#0f172a',
                      wordBreak: 'break-all',
                      userSelect: 'all',
                    }}
                  >
                    {selectedMethod.accountNumber || 'Contact Admin'}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      if (selectedMethod.accountNumber) {
                        navigator.clipboard.writeText(selectedMethod.accountNumber);
                        setCopiedReceiver(true);
                        setTimeout(() => setCopiedReceiver(false), 2000);
                      }
                    }}
                    className="btn btn-ghost"
                    style={{
                      padding: '6px 12px',
                      fontSize: '0.8rem',
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                      background: copiedReceiver ? '#f0fdf4' : '#f8fafc',
                      color: copiedReceiver ? '#16a34a' : '#334155',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      flexShrink: 0,
                    }}
                  >
                    {copiedReceiver ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                    <span>{copiedReceiver ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>

                {/* Payment Instructions Note */}
                {selectedMethod.instructions && (
                  <div style={{ marginTop: 10, fontSize: '0.82rem', color: '#475569', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>Note:</span>
                    <span>{selectedMethod.instructions}</span>
                  </div>
                )}
              </div>

              {/* DEPOSIT FORM: PICK AMOUNT, SENDER DETAILS & SUBMIT */}
              <form onSubmit={handleDeposit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label className="font-mono" style={{ fontSize: '0.84rem', color: '#475569', display: 'block', marginBottom: 6, fontWeight: 600 }}>
                    3. Select or Enter Amount (USD):
                  </label>

                  {/* Preset Amount Pills */}
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
                          background: hasDepositInput && numDepositAmount === preset ? '#e0f2fe' : '#ffffff',
                          color: hasDepositInput && numDepositAmount === preset ? 'var(--primary-neon)' : '#64748b',
                          borderColor: hasDepositInput && numDepositAmount === preset ? 'var(--primary-neon)' : 'rgba(14, 165, 233, 0.25)',
                          fontWeight: hasDepositInput && numDepositAmount === preset ? 800 : 500,
                        }}
                      >
                        ${preset}
                      </button>
                    ))}
                  </div>

                  <input
                    type="number"
                    step="any"
                    placeholder={`Enter amount (min $${minRequiredUsd.toFixed(2)})`}
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="input-field"
                    style={{
                      padding: '12px 14px',
                      fontSize: '1rem',
                      borderColor: isDepositBelowMin ? '#ef4444' : undefined,
                      color: isDepositBelowMin ? '#dc2626' : undefined,
                      background: isDepositBelowMin ? '#fff1f2' : undefined,
                    }}
                    required
                  />

                  {/* Warning Message */}
                  {isDepositBelowMin && (
                    <div style={{ color: '#ef4444', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5, marginTop: 6 }}>
                      <AlertCircle size={14} color="#ef4444" style={{ flexShrink: 0 }} />
                      <span>Minimum deposit is ${minRequiredUsd.toFixed(2)} USD for {selectedMethod.name}.</span>
                    </div>
                  )}
                </div>

                {/* Sender Account / Number / Address Input */}
                <div>
                  <label className="font-mono" style={{ fontSize: '0.84rem', color: '#475569', display: 'block', marginBottom: 6, fontWeight: 600 }}>
                    4. Your Sender Account / Phone / Wallet Address <span style={{ color: '#ef4444' }}>*</span>:
                  </label>
                  <input
                    type="text"
                    placeholder={
                      selectedMethod.isBDT
                        ? 'e.g. 017XXXXXXXX (Your bKash/Nagad number)'
                        : selectedMethod.id === 'crypto'
                        ? 'e.g. 0x... (Your BEP-20 sender wallet)'
                        : 'e.g. Your sender email, phone or account number'
                    }
                    value={senderAccount}
                    onChange={(e) => setSenderAccount(e.target.value)}
                    className="input-field"
                    style={{ padding: '12px 14px', fontSize: '0.94rem' }}
                    required
                  />
                  <span style={{ fontSize: '0.76rem', color: '#64748b', display: 'block', marginTop: 4 }}>
                    Admin will verify this account number against incoming funds.
                  </span>
                </div>

                {/* Transaction ID / TrxID / Hash Input */}
                <div>
                  <label className="font-mono" style={{ fontSize: '0.84rem', color: '#475569', display: 'block', marginBottom: 6, fontWeight: 600 }}>
                    5. Transaction ID (TrxID) / TxHash <span style={{ color: '#ef4444' }}>*</span>:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BL76AK9X9Z or 0x8a92f..."
                    value={transactionHash}
                    onChange={(e) => setTransactionHash(e.target.value)}
                    className="input-field font-mono"
                    style={{ padding: '12px 14px', fontSize: '0.94rem' }}
                    required
                  />
                  <span style={{ fontSize: '0.76rem', color: '#64748b', display: 'block', marginTop: 4 }}>
                    Enter the exact transaction ID from your payment SMS, app, or blockchain explorer.
                  </span>
                </div>

                {/* Optional Notes */}
                <div>
                  <label className="font-mono" style={{ fontSize: '0.84rem', color: '#475569', display: 'block', marginBottom: 6, fontWeight: 600 }}>
                    Optional Note / Reference:
                  </label>
                  <input
                    type="text"
                    placeholder="Any extra info for Admin (optional)"
                    value={depositNotes}
                    onChange={(e) => setDepositNotes(e.target.value)}
                    className="input-field"
                    style={{ padding: '10px 14px', fontSize: '0.88rem' }}
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
                        src={selectedMethod.logoUrl}
                        alt={selectedMethod.name}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.94rem', color: '#334155' }}>
                        Deposit Gateway: <strong>{selectedMethod.name}</strong>
                      </span>
                      <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                        {selectedMethod.rateText}
                      </div>
                    </div>
                  </div>

                  <div style={{ minWidth: 140 }}>
                    <span style={{ fontSize: '0.74rem', color: '#64748b', display: 'block' }}>Total Paid:</span>
                    <strong className="font-mono" style={{ fontSize: '1.35rem', color: isDepositBelowMin ? '#ef4444' : 'var(--primary-neon)' }}>
                      {hasDepositInput && numDepositAmount > 0
                        ? (selectedMethod.isBDT
                            ? `৳${(numDepositAmount * bdtRate).toLocaleString()} BDT`
                            : `$${numDepositAmount.toFixed(2)} USD`)
                        : (selectedMethod.isBDT ? '৳0 BDT' : '$0.00 USD')}
                    </strong>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={depositLoading || !isDepositValid}
                  className="btn btn-neon glow-neon"
                  style={{
                    padding: '13px',
                    fontSize: '0.96rem',
                    borderRadius: 12,
                    marginTop: 4,
                    opacity: !isDepositValid ? 0.6 : 1,
                    cursor: !isDepositValid ? 'not-allowed' : 'pointer',
                  }}
                >
                  {depositLoading
                    ? 'Submitting...'
                    : !hasDepositInput
                    ? 'Enter Deposit Amount'
                    : isDepositBelowMin
                    ? `Minimum Deposit is $${minRequiredUsd.toFixed(2)} USD`
                    : !senderAccount.trim()
                    ? 'Enter Your Sender Account / Phone'
                    : !transactionHash.trim()
                    ? 'Enter Transaction ID (TrxID)'
                    : `Submit Deposit Request ($${numDepositAmount.toFixed(2)} USD)`}
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: SPEND LEDGER (2 SUB-TABS) */}
          {activeTab === 'ledger' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Header with Sub-tab Switcher */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <h3 className="font-display" style={{ fontSize: '1.5rem', color: '#0f172a', margin: 0 }}>
                  SPEND LEDGER
                </h3>

                {/* Sub-Tab Selector (Responsive 2-column on mobile) */}
                <div
                  className="mobile-ledger-tabs"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 6,
                    background: '#f1f5f9',
                    padding: '4px',
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
                    <Wallet size={14} style={{ flexShrink: 0 }} />
                    <span>My Transactions ({transactions.length})</span>
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
                      color: ledgerTab === 'platform' ? '#0284c7' : '#64748b',
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
                    <span>Total Spend & Stats</span>
                  </button>
                </div>
              </div>

              {/* SUB-TAB 1: MY TRANSACTIONS */}
              {ledgerTab === 'my_tx' && (
                <div className="glass-card" style={{ padding: '22px', borderRadius: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <h4 className="font-display" style={{ fontSize: '1.15rem', color: '#0f172a', margin: 0 }}>
                      SPEND LEDGER
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
                      No deposit or spend history recorded yet.
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
                                    <span
                                      className="badge-pill"
                                      style={{
                                        padding: '2px 8px',
                                        fontSize: '0.72rem',
                                        fontWeight: 700,
                                        background: tx.type === 'deposit' ? '#ecfdf5' : '#f0f9ff',
                                        color: tx.type === 'deposit' ? '#059669' : '#0284c7',
                                        border: `1px solid ${tx.type === 'deposit' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(14, 165, 233, 0.3)'}`,
                                        textTransform: 'uppercase',
                                      }}
                                    >
                                      {tx.type === 'deposit' ? `Deposit (${(tx.gateway || 'ssl').toUpperCase()})` : 'Campaign Spend'}
                                    </span>
                                  </td>
                                  <td
                                    className="font-mono"
                                    style={{
                                      padding: '10px 12px',
                                      fontWeight: 700,
                                      color: tx.type === 'deposit' || tx.amount > 0 ? '#059669' : '#ef4444',
                                    }}
                                  >
                                    {tx.type === 'deposit' || tx.amount > 0
                                      ? `+$${tx.amount.toFixed(2)}`
                                      : `-$${Math.abs(tx.amount).toFixed(2)}`}
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

                      {/* Mobile Card List View */}
                      <div className="mobile-card-list">
                        {transactions
                          .slice((txPage - 1) * TX_PAGE_SIZE, txPage * TX_PAGE_SIZE)
                          .map((tx) => (
                            <div key={tx._id} className="mobile-data-card">
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                                {tx.type === 'deposit' ? (
                                  <span
                                    className="badge-pill"
                                    style={{
                                      padding: '2px 8px',
                                      fontSize: '0.72rem',
                                      fontWeight: 700,
                                      background: '#ecfdf5',
                                      color: '#059669',
                                      border: '1px solid rgba(16, 185, 129, 0.3)',
                                      textTransform: 'uppercase',
                                    }}
                                  >
                                    Deposit {tx.gateway ? `(${tx.gateway.toUpperCase()})` : ''}
                                  </span>
                                ) : (
                                  <span
                                    className="badge-pill"
                                    style={{
                                      padding: '2px 8px',
                                      fontSize: '0.72rem',
                                      fontWeight: 700,
                                      background: '#f0f9ff',
                                      color: '#0284c7',
                                      border: '1px solid rgba(14, 165, 233, 0.3)',
                                      textTransform: 'uppercase',
                                    }}
                                  >
                                    Campaign Spend
                                  </span>
                                )}

                                <div
                                  className="font-mono"
                                  style={{
                                    fontWeight: 800,
                                    fontSize: '1rem',
                                    color: tx.type === 'deposit' || tx.amount > 0 ? '#059669' : '#ef4444',
                                  }}
                                >
                                  {tx.type === 'deposit' || tx.amount > 0
                                    ? `+$${tx.amount.toFixed(2)}`
                                    : `-$${Math.abs(tx.amount).toFixed(2)}`}
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', color: '#64748b' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span>Status:</span>
                                  <span style={{ color: tx.status === 'completed' ? '#059669' : '#d97706', fontWeight: 700, textTransform: 'capitalize' }}>
                                    {tx.status}
                                  </span>
                                  <span>•</span>
                                  <span>{new Date(tx.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="font-mono" style={{ color: '#0f172a', fontWeight: 600 }}>
                                  Bal: ${(tx.balanceAfter || 0).toFixed(2)}
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
                        'transactions'
                      )}
                    </>
                  )}
                </div>
              )}

              {/* SUB-TAB 2: TOTAL SPEND & CAMPAIGN STATS */}
              {ledgerTab === 'platform' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* 4 Real Data Metric Cards in Responsive Fluid Grid */}
                  <div className="responsive-kpi-grid">
                    {/* 1. Total Views Delivered */}
                    <div className="glass-card responsive-kpi-card" style={{ padding: '16px 14px', borderRadius: 16, border: '1.5px solid rgba(14, 165, 233, 0.3)', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                        <span className="font-mono" style={{ fontSize: '0.74rem', color: 'var(--primary-neon)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          Views Delivered
                        </span>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <PlaySquare size={15} color="var(--primary-neon)" />
                        </div>
                      </div>
                      <div className="font-mono responsive-kpi-val" style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--primary-neon)', marginTop: 8, lineHeight: 1 }}>
                        {(platformStats?.totalViewsDelivered || 0).toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Total real YouTube views
                      </div>
                    </div>

                    {/* 2. Total Ad Spend */}
                    <div className="glass-card responsive-kpi-card" style={{ padding: '16px 14px', borderRadius: 16, border: '1.5px solid rgba(16, 185, 129, 0.3)', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                        <span className="font-mono" style={{ fontSize: '0.74rem', color: '#059669', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          Total Ad Spend
                        </span>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <CreditCard size={15} color="#059669" />
                        </div>
                      </div>
                      <div className="font-mono responsive-kpi-val" style={{ fontSize: '1.65rem', fontWeight: 800, color: '#059669', marginTop: 8, lineHeight: 1 }}>
                        ${(platformStats?.totalSpendUsd || 0).toFixed(2)}
                      </div>
                      <div className="font-mono" style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        ≈ ৳{Math.round((platformStats?.totalSpendUsd || 0) * bdtRate).toLocaleString()} BDT
                      </div>
                    </div>

                    {/* 3. Active Campaigns */}
                    <div className="glass-card responsive-kpi-card" style={{ padding: '16px 14px', borderRadius: 16, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                        <span className="font-mono" style={{ fontSize: '0.74rem', color: '#7c3aed', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          Active Campaigns
                        </span>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Activity size={15} color="#7c3aed" />
                        </div>
                      </div>
                      <div className="font-mono responsive-kpi-val" style={{ fontSize: '1.65rem', fontWeight: 800, color: '#7c3aed', marginTop: 8, lineHeight: 1 }}>
                        {(platformStats?.activeCampaigns || 0).toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Promotions running now
                      </div>
                    </div>

                    {/* 4. Total Campaigns Created */}
                    <div className="glass-card responsive-kpi-card" style={{ padding: '16px 14px', borderRadius: 16, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                        <span className="font-mono" style={{ fontSize: '0.74rem', color: '#d97706', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          Total Campaigns
                        </span>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Megaphone size={15} color="#d97706" />
                        </div>
                      </div>
                      <div className="font-mono responsive-kpi-val" style={{ fontSize: '1.65rem', fontWeight: 800, color: '#d97706', marginTop: 8, lineHeight: 1 }}>
                        {(platformStats?.totalCampaigns || 0).toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Platform promotions
                      </div>
                    </div>
                  </div>

                  {/* 2 Interactive Real Graphs Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))', gap: 14 }}>
                    {/* Graph 1: Daily Creator Spend Volume */}
                    <div className="glass-card" style={{ padding: '18px', borderRadius: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <BarChart3 size={16} color="var(--primary-neon)" />
                          <h4 className="font-display" style={{ fontSize: '1.05rem', color: '#0f172a', margin: 0 }}>
                            Daily Ad Spend ($ USD)
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
                        renderSpendCurve(
                          platformStats.dailySpend || [0, 0, 0, 0, 0, 0, 0],
                          platformStats.chartLabels || ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                        )
                      ) : (
                        <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>Loading...</div>
                      )}
                    </div>

                    {/* Graph 2: Daily YouTube Views Delivered */}
                    <div className="glass-card" style={{ padding: '18px', borderRadius: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <PlaySquare size={16} color="#0284c7" />
                          <h4 className="font-display" style={{ fontSize: '1.05rem', color: '#0f172a', margin: 0 }}>
                            Daily Views Delivered
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
              TAB 5: ACCOUNT PROFILE & PERSONAL SETTINGS
              ========================================================================= */}
          {activeTab === 'profile' && (
            <ProfileSettingsSection user={user} onRefreshUser={onRefreshUser} />
          )}
        </main>
      </div>
    </div>
  );
};
