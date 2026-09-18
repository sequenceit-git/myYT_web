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
  X,
  ArrowRight,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import { Campaign, User, Transaction, DepositMethod, WithdrawMethod } from '../types';
import { UserAvatar } from './UserAvatar';
import { apiRequest } from '../api';
import { ProfileSwitchBanner } from './ProfileSwitchBanner';
import { ProfileSettingsSection } from './ProfileSettingsSection';
import { TotalStatsLogView } from './TotalStatsLogView';
import { useExchangeRate } from '../context/ExchangeRateContext';
import { getClientTelemetry } from '../utils/telemetry';

interface CampaignerPortalProps {
  user: User | null;
  onRefreshUser: () => void;
  onOpenAuth?: (mode: 'signin' | 'signup', role?: 'viewer' | 'campaigner') => void;
  onSwitchProfile?: (targetRole: 'viewer' | 'campaigner') => void;
}

type CreatorTab = 'overview' | 'campaigns' | 'deposit' | 'withdraw' | 'ledger' | 'profile';

interface PayoutMethodConfig {
  id: string;
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

  return methods.filter((m) => m.enabled);
};

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
  payeer: {
    logoBg: '#ffffff',
    logoMark: 'PAYEER',
    logoUrl: '/payment-methods/payeer.png',
    defaultRateText: 'USD Account (Manual Transfer)',
    defaultAccountType: 'USD Account',
    defaultInstructions: 'Transfer USD to this Payeer account (e.g. P1000000000) and enter your Payeer Transaction / Batch ID.',
    defaultAccount: 'P1000000000',
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
    {
      id: 'payeer',
      name: 'Payeer',
      accountType: 'USD Account',
      accountNumber: 'P1000000000',
      instructions: 'Transfer USD to this Payeer account (e.g. P1000000000) and enter your Payeer Transaction / Batch ID.',
      logoBg: '#ffffff',
      logoMark: 'PAYEER',
      logoUrl: '/payment-methods/payeer.png',
      rateText: 'USD Account • Manual Deposit',
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
    return (tabFromUrl && ['overview', 'campaigns', 'deposit', 'withdraw', 'ledger', 'profile'].includes(tabFromUrl))
      ? tabFromUrl
      : 'overview';
  });

  const activeTab = (tabFromUrl && ['overview', 'campaigns', 'deposit', 'withdraw', 'ledger', 'profile'].includes(tabFromUrl))
    ? tabFromUrl
    : internalTab;

  useEffect(() => {
    if (tabFromUrl && ['overview', 'campaigns', 'deposit', 'withdraw', 'ledger', 'profile'].includes(tabFromUrl)) {
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
  const [isDepositModalOpen, setIsDepositModalOpen] = useState<boolean>(false);
  const [depositModalError, setDepositModalError] = useState<string | null>(null);

  // Withdraw State
  const [withdrawMethod, setWithdrawMethod] = useState<string>('bkash');
  const [withdrawAmount, setWithdrawAmount] = useState<string | number>('');
  const [withdrawLoading, setWithdrawLoading] = useState<boolean>(false);
  const [serverWithdrawMethods, setServerWithdrawMethods] = useState<WithdrawMethod[]>([]);

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  // Transactions State (Spend Ledger - Deposits, Campaign Spends & Withdrawals) & Pagination State (10 per page)
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txLoading, setTxLoading] = useState<boolean>(false);
  const [txPage, setTxPage] = useState<number>(1);
  const TX_PAGE_SIZE = 10;

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Spend & Withdraw Ledger Sub-Tab & Filter state
  const [ledgerTab, setLedgerTab] = useState<'my_tx' | 'platform'>('my_tx');
  const [creatorTxFilter, setCreatorTxFilter] = useState<'all' | 'spend' | 'withdraw' | 'deposit'>('all');
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

  const fetchWithdrawMethods = async () => {
    const res = await apiRequest<WithdrawMethod[]>('/wallet/withdraw-methods');
    if (res.success && res.data) {
      setServerWithdrawMethods(res.data);
    }
  };

  // Fetch Creator Transactions (Deposits, Campaign Spends & Payouts)
  const fetchTransactions = async () => {
    setTxLoading(true);
    const res = await apiRequest<Transaction[]>('/wallet/transactions?role=creator');
    setTxLoading(false);
    if (res.success && res.data) {
      const creatorTx = res.data.filter((tx) =>
        ['deposit', 'campaign_spend', 'payout'].includes(tx.type)
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
      fetchWithdrawMethods();
    }
  }, [user]);

  // Step 1: Open Deposit Details Modal after entering amount
  const handleOpenDepositModal = (e: React.FormEvent) => {
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

    setFeedback(null);
    setDepositModalError(null);
    setIsDepositModalOpen(true);
  };

  // Step 2: Handle Final Deposit Submission from Modal
  const handleDepositSubmit = async (e: React.FormEvent) => {
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
      setDepositModalError(`Minimum deposit for ${currentMethodObj.name} is $${minRequired.toFixed(2)} USD.`);
      return;
    }

    if (!senderAccount.trim()) {
      setDepositModalError('Please enter your sender account number, wallet address, or phone number.');
      return;
    }

    if (!transactionHash.trim()) {
      setDepositModalError('Please enter the transaction ID (TrxID) or TxHash.');
      return;
    }

    setDepositLoading(true);
    setDepositModalError(null);

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
      setIsDepositModalOpen(false);
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
      setDepositModalError(res.error || 'Deposit submission failed. Please try again.');
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

  // Creator Withdraw calculations & handler
  const payoutMethods = getPayoutMethods(usdToBdt, serverWithdrawMethods);
  const selectedWithdrawConfig = payoutMethods.find((m) => m.id === withdrawMethod) || payoutMethods[0];
  const selectedMinWithdraw = selectedWithdrawConfig?.minWithdrawUsd ?? 5.0;
  const linkedPaymentMethod = user?.savedPaymentMethods?.find((p) => p.method === withdrawMethod);
  const isWithdrawLinked = Boolean(linkedPaymentMethod && linkedPaymentMethod.accountNumber && linkedPaymentMethod.accountNumber.trim());
  const hasWithdrawInput = withdrawAmount !== '' && withdrawAmount !== null && withdrawAmount !== undefined && withdrawAmount.toString().trim() !== '';
  const numWithdrawAmount = hasWithdrawInput ? (parseFloat(withdrawAmount.toString()) || 0) : 0;
  const isWithdrawBelowMin = hasWithdrawInput && numWithdrawAmount > 0 && numWithdrawAmount < selectedMinWithdraw;
  const isWithdrawExceedsBal = hasWithdrawInput && numWithdrawAmount > creatorBal;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      if (onOpenAuth) onOpenAuth('signin');
      return;
    }

    if (!hasWithdrawInput || numWithdrawAmount <= 0) {
      setFeedback({ type: 'error', message: 'Please enter a valid withdrawal amount.' });
      return;
    }

    if (numWithdrawAmount < selectedMinWithdraw) {
      const bdtPart = selectedWithdrawConfig?.isBDT ? ` (≈ ৳${Math.round(selectedMinWithdraw * usdToBdt)} BDT)` : '';
      setFeedback({ type: 'error', message: `Minimum withdrawal for ${selectedWithdrawConfig?.name} is $${selectedMinWithdraw.toFixed(2)} USD${bdtPart}.` });
      return;
    }

    if (numWithdrawAmount > creatorBal) {
      setFeedback({ type: 'error', message: `Requested amount ($${numWithdrawAmount.toFixed(2)}) exceeds available Ad Budget ($${creatorBal.toFixed(2)}).` });
      return;
    }

    if (!isWithdrawLinked || !linkedPaymentMethod?.accountNumber) {
      setFeedback({ type: 'error', message: `Please link your ${selectedWithdrawConfig?.name} account in Account Profile settings before requesting a withdrawal.` });
      return;
    }

    setWithdrawLoading(true);
    const telemetry = getClientTelemetry();
    const res = await apiRequest<{ newBalance: number; message: string }>('/wallet/withdraw', {
      method: 'POST',
      body: JSON.stringify({
        amount: numWithdrawAmount,
        method: withdrawMethod,
        accountDetails: linkedPaymentMethod.accountNumber,
        sourceBalance: 'creator',
        country: telemetry.country,
        browser: telemetry.browser,
        platform: telemetry.platform,
        deviceName: telemetry.deviceName,
        timezone: telemetry.timezone,
        deviceInfo: telemetry.deviceInfo,
      }),
    });
    setWithdrawLoading(false);

    if (res.success) {
      setFeedback({
        type: 'success',
        message: res.data?.message || `✓ Withdrawal request of $${numWithdrawAmount.toFixed(2)} USD submitted! Admin will review and disburse your payment.`,
      });
      setWithdrawAmount('');
      onRefreshUser();
      fetchTransactions();
    } else {
      setFeedback({ type: 'error', message: res.error || 'Failed to submit withdrawal request.' });
    }
  };

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
            <UserAvatar
              user={user}
              size={46}
              borderColor="var(--primary-neon)"
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
              onClick={() => { setActiveTab('withdraw'); setFeedback(null); }}
              className={`dashboard-nav-item ${activeTab === 'withdraw' ? 'active-neon' : ''}`}
            >
              <div className="nav-left">
                <ArrowDownLeft size={20} />
                <span>Withdraw Budget</span>
              </div>
            </button>

            <button
              onClick={() => { setActiveTab('ledger'); setFeedback(null); }}
              className={`dashboard-nav-item ${activeTab === 'ledger' ? 'active-neon' : ''}`}
            >
              <div className="nav-left">
                <History size={20} />
                <span>Spend & Withdraw</span>
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
                justifyContent: 'space-between',
                gap: 10,
                borderRadius: 12,
                borderLeft: feedback.type === 'success' ? '4px solid var(--primary-neon)' : '4px solid #ef4444',
                background: feedback.type === 'success' ? '#f0f9ff' : '#fef2f2',
                fontSize: '0.92rem',
                fontWeight: 600,
                color: feedback.type === 'success' ? '#0369a1' : '#b91c1c',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                <span>{feedback.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setFeedback(null)}
                className="btn btn-ghost"
                style={{ padding: 4, borderRadius: '50%', color: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Dismiss"
              >
                <X size={16} />
              </button>
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
                    <button
                      onClick={() => setActiveTab('deposit')}
                      className="btn btn-neon glow-neon"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        borderRadius: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        textTransform: 'none',
                        letterSpacing: '0.01em',
                      }}
                    >
                      <Plus size={15} strokeWidth={2.5} /> Deposit Budget
                    </button>
                    <button
                      onClick={() => setActiveTab('withdraw')}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        borderRadius: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        background: '#f8fafc',
                        color: '#0f172a',
                        border: '1.5px solid #cbd5e1',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        letterSpacing: '0.01em',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f0f9ff';
                        e.currentTarget.style.borderColor = 'var(--primary-neon)';
                        e.currentTarget.style.color = 'var(--primary-neon)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#f8fafc';
                        e.currentTarget.style.borderColor = '#cbd5e1';
                        e.currentTarget.style.color = '#0f172a';
                      }}
                    >
                      <ArrowUpRight size={15} strokeWidth={2.5} /> Withdraw Budget
                    </button>
                  </div>
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

              {/* INDIVIDUAL DEPOSIT METHOD CARDS */}
              <div style={{ marginBottom: 20 }}>
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

              {/* STEP 2: ENTER AMOUNT & SUBMIT TO POPUP */}
              <form onSubmit={handleOpenDepositModal} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label className="font-mono" style={{ fontSize: '0.84rem', color: '#475569', display: 'block', marginBottom: 8, fontWeight: 600 }}>
                    2. Select or Enter Amount (USD):
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
                          padding: '7px 16px',
                          fontSize: '0.88rem',
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
                    placeholder={`Enter amount in USD (min $${minRequiredUsd.toFixed(2)})`}
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="input-field"
                    style={{
                      padding: '13px 16px',
                      fontSize: '1.05rem',
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

                {/* Real-Time Conversion & Method Summary */}
                <div
                  style={{
                    background: '#f8fafc',
                    padding: '14px 18px',
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
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
                      <span style={{ fontSize: '0.94rem', color: '#334155', fontWeight: 600 }}>
                        Deposit Gateway: <strong>{selectedMethod.name}</strong>
                      </span>
                      <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                        {selectedMethod.rateText}
                      </div>
                    </div>
                  </div>

                  <div style={{ minWidth: 140 }}>
                    <span style={{ fontSize: '0.74rem', color: '#64748b', display: 'block' }}>Total Deposit Amount:</span>
                    <strong className="font-mono" style={{ fontSize: '1.35rem', color: isDepositBelowMin ? '#ef4444' : 'var(--primary-neon)' }}>
                      {hasDepositInput && numDepositAmount > 0
                        ? (selectedMethod.isBDT
                            ? `৳${Math.round(numDepositAmount * bdtRate).toLocaleString()} BDT`
                            : `$${numDepositAmount.toFixed(2)} USD`)
                        : (selectedMethod.isBDT ? '৳0 BDT' : '$0.00 USD')}
                    </strong>
                    {selectedMethod.isBDT && hasDepositInput && numDepositAmount > 0 && (
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginTop: 2 }}>
                        (${numDepositAmount.toFixed(2)} USD)
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!hasDepositInput || isDepositBelowMin}
                  className="btn btn-neon glow-neon"
                  style={{
                    padding: '13px 20px',
                    fontSize: '1rem',
                    borderRadius: 12,
                    marginTop: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    fontWeight: 700,
                    opacity: (!hasDepositInput || isDepositBelowMin) ? 0.6 : 1,
                    cursor: (!hasDepositInput || isDepositBelowMin) ? 'not-allowed' : 'pointer',
                  }}
                >
                  <span>
                    {!hasDepositInput
                      ? 'Enter Deposit Amount'
                      : isDepositBelowMin
                      ? `Minimum Deposit is $${minRequiredUsd.toFixed(2)} USD`
                      : `Proceed to Payment (${selectedMethod.isBDT ? `৳${Math.round(numDepositAmount * bdtRate).toLocaleString()} BDT` : `$${numDepositAmount.toFixed(2)} USD`})`}
                  </span>
                  <ArrowRight size={18} />
                </button>
              </form>
            </div>
          )}

          {/* =========================================================================
              DEPOSIT PAYMENT DETAILS POPUP MODAL
              ========================================================================= */}
          {isDepositModalOpen && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.75)',
                backdropFilter: 'blur(8px)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                animation: 'fadeIn 0.2s ease-out',
              }}
              onClick={() => setIsDepositModalOpen(false)}
            >
              <div
                className="modal-card"
                style={{
                  background: '#ffffff',
                  borderRadius: 20,
                  width: '100%',
                  maxWidth: 520,
                  padding: '24px',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  position: 'relative',
                  border: '1px solid #e2e8f0',
                  maxHeight: '92vh',
                  overflowY: 'auto',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 5,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                      }}
                    >
                      <img src={selectedMethod.logoUrl} alt={selectedMethod.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <div>
                      <h4 className="font-display" style={{ fontSize: '1.15rem', color: '#0f172a', margin: 0 }}>
                        Complete Deposit Payment
                      </h4>
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        Method: <strong>{selectedMethod.name}</strong>
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsDepositModalOpen(false)}
                    className="btn btn-ghost"
                    style={{ padding: '6px', borderRadius: '50%', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Amount to Pay Banner */}
                <div
                  style={{
                    background: '#f0f9ff',
                    border: '1px solid rgba(14, 165, 233, 0.3)',
                    borderRadius: 12,
                    padding: '12px 16px',
                    marginBottom: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 600 }}>
                    Amount to Send:
                  </span>
                  <div style={{ textAlign: 'right' }}>
                    <span className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-neon)' }}>
                      {selectedMethod.isBDT
                        ? `৳${Math.round(numDepositAmount * bdtRate).toLocaleString()} BDT`
                        : `$${numDepositAmount.toFixed(2)} USD`}
                    </span>
                    {selectedMethod.isBDT && (
                      <span style={{ fontSize: '0.74rem', color: '#64748b', display: 'block' }}>
                        (${numDepositAmount.toFixed(2)} USD ad budget)
                      </span>
                    )}
                  </div>
                </div>

                {/* ADMIN OFFICIAL RECEIVER DETAILS */}
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1.5px dashed rgba(14, 165, 233, 0.4)',
                    borderRadius: 12,
                    padding: '14px 16px',
                    marginBottom: 18,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span className="font-mono" style={{ fontSize: '0.76rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                      Send Money To:
                    </span>
                    <span className="badge-pill" style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '0.72rem', border: '1px solid rgba(14, 165, 233, 0.3)' }}>
                      {selectedMethod.accountType || 'Official Account'}
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
                      padding: '10px 12px',
                    }}
                  >
                    <span
                      className="font-mono"
                      style={{
                        fontSize: '0.92rem',
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
                        padding: '5px 10px',
                        fontSize: '0.78rem',
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
                      {copiedReceiver ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
                      <span>{copiedReceiver ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* Payment Instructions Note */}
                  {selectedMethod.instructions && (
                    <div style={{ marginTop: 8, fontSize: '0.78rem', color: '#475569', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>Note:</span>
                      <span>{selectedMethod.instructions}</span>
                    </div>
                  )}
                </div>

                {/* Error in modal if any */}
                {depositModalError && (
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: 10,
                      marginBottom: 14,
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      background: '#fef2f2',
                      border: '1px solid #fca5a5',
                      color: '#b91c1c',
                    }}
                  >
                    <AlertCircle size={16} color="#dc2626" style={{ flexShrink: 0 }} />
                    <span>{depositModalError}</span>
                  </div>
                )}

                {/* USER PAYMENT VERIFICATION DETAILS FORM */}
                <form onSubmit={handleDepositSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Sender Account */}
                  <div>
                    <label className="font-mono" style={{ fontSize: '0.82rem', color: '#475569', display: 'block', marginBottom: 5, fontWeight: 600 }}>
                      Sender Account / Phone / Wallet Address <span style={{ color: '#ef4444' }}>*</span>
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
                      style={{ padding: '10px 12px', fontSize: '0.9rem' }}
                      required
                      autoFocus
                    />
                  </div>

                  {/* Transaction ID */}
                  <div>
                    <label className="font-mono" style={{ fontSize: '0.82rem', color: '#475569', display: 'block', marginBottom: 5, fontWeight: 600 }}>
                      Transaction ID (TrxID) / TxHash <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. BL76AK9X9Z or 0x8a92f..."
                      value={transactionHash}
                      onChange={(e) => setTransactionHash(e.target.value)}
                      className="input-field font-mono"
                      style={{ padding: '10px 12px', fontSize: '0.9rem' }}
                      required
                    />
                    <span style={{ fontSize: '0.74rem', color: '#64748b', display: 'block', marginTop: 3 }}>
                      Exact transaction identifier from your SMS or receipt.
                    </span>
                  </div>

                  {/* Optional Note */}
                  <div>
                    <label className="font-mono" style={{ fontSize: '0.82rem', color: '#475569', display: 'block', marginBottom: 5, fontWeight: 600 }}>
                      Optional Note / Reference
                    </label>
                    <input
                      type="text"
                      placeholder="Any additional info for admin (optional)"
                      value={depositNotes}
                      onChange={(e) => setDepositNotes(e.target.value)}
                      className="input-field"
                      style={{ padding: '9px 12px', fontSize: '0.86rem' }}
                    />
                  </div>

                  {/* Modal Action Buttons */}
                  <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                    <button
                      type="button"
                      onClick={() => setIsDepositModalOpen(false)}
                      className="btn btn-ghost"
                      style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1px solid #cbd5e1', fontWeight: 600 }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={depositLoading || !senderAccount.trim() || !transactionHash.trim()}
                      className="btn btn-neon glow-neon"
                      style={{
                        flex: 2,
                        padding: '11px',
                        borderRadius: 10,
                        fontWeight: 700,
                        opacity: (!senderAccount.trim() || !transactionHash.trim() || depositLoading) ? 0.6 : 1,
                        cursor: (!senderAccount.trim() || !transactionHash.trim() || depositLoading) ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {depositLoading ? 'Submitting...' : `Submit Deposit ($${numDepositAmount.toFixed(2)} USD)`}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 4: WITHDRAW AD BUDGET (CREATOR WITHDRAWAL)
              ========================================================================= */}
          {activeTab === 'withdraw' && (
            <div className="glass-card" style={{ padding: '24px', borderRadius: 18, border: '1.5px solid var(--primary-neon)' }}>

              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <h3 className="font-display" style={{ fontSize: '1.45rem', color: '#0f172a', margin: 0 }}>
                    WITHDRAW AD BUDGET
                  </h3>
                  <span style={{ fontSize: '0.88rem', color: '#64748b' }}>
                    Available Budget: <strong className="font-mono" style={{ color: 'var(--primary-neon)' }}>${creatorBal.toFixed(2)} USD</strong> (≈ ৳{Math.round(creatorBal * usdToBdt)} BDT)
                  </span>
                </div>
                <span className="badge-pill badge-cyan" style={{ fontSize: '0.74rem', padding: '4px 12px' }}>
                  Min Payout: ${selectedMinWithdraw.toFixed(2)} USD {selectedWithdrawConfig?.isBDT ? `(≈ ৳${Math.round(selectedMinWithdraw * usdToBdt)} BDT)` : ''}
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
                        Max: ${creatorBal.toFixed(2)}
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
                        <span>Minimum withdrawal for {selectedWithdrawConfig?.name} is ${selectedMinWithdraw.toFixed(2)} USD{selectedWithdrawConfig?.isBDT ? ` (≈ ৳${Math.round(selectedMinWithdraw * usdToBdt)} BDT)` : ''}.</span>
                      </div>
                    )}
                    {!isWithdrawBelowMin && isWithdrawExceedsBal && (
                      <div style={{ color: '#ef4444', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5, marginTop: 6 }}>
                        <AlertCircle size={14} color="#ef4444" style={{ flexShrink: 0 }} />
                        <span>Amount exceeds available Ad Budget (${creatorBal.toFixed(2)} USD).</span>
                      </div>
                    )}

                    {/* Quick Amount Pills */}
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
                        onClick={() => setWithdrawAmount(parseFloat(creatorBal.toFixed(2)))}
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
                      <label className="font-mono" style={{ fontSize: '0.84rem', color: '#475569', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={selectedWithdrawConfig?.inputLabel}>
                        {selectedWithdrawConfig?.inputLabel}:
                      </label>
                      {isWithdrawLinked ? (
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
                        placeholder={isWithdrawLinked ? selectedWithdrawConfig?.placeholder : `No linked ${selectedWithdrawConfig?.name} account found in profile`}
                        value={isWithdrawLinked ? linkedPaymentMethod?.accountNumber : ''}
                        readOnly={true}
                        disabled={!isWithdrawLinked}
                        className="input-field"
                        style={{
                          padding: isWithdrawLinked ? '11px 38px 11px 14px' : '11px 14px',
                          fontSize: '0.98rem',
                          background: '#f8fafc',
                          borderColor: isWithdrawLinked ? '#cbd5e1' : '#fde68a',
                          cursor: 'not-allowed',
                          color: isWithdrawLinked ? '#0f172a' : '#94a3b8',
                          fontWeight: isWithdrawLinked ? 600 : 400,
                        }}
                        required={isWithdrawLinked}
                      />
                      {isWithdrawLinked && (
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

                    {isWithdrawLinked ? (
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
                      <span style={{ fontSize: '0.78rem', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 5, flexWrap: 'wrap', gap: 6 }}>
                        <span>⚠️ You must link and save your {selectedWithdrawConfig?.name} number in Profile before withdrawing.</span>
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
                          Go to Profile Settings →
                        </button>
                      </span>
                    )}
                  </div>
                </div>

                {/* Conversion Summary & Payout Instruction Box */}
                <div
                  style={{
                    background: '#f0f9ff',
                    border: '1px solid rgba(14, 165, 233, 0.25)',
                    borderRadius: 12,
                    padding: '12px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <span style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>
                      Payout Exchange Rate: <strong style={{ color: '#0f172a' }}>{selectedWithdrawConfig?.rateText}</strong>
                    </span>
                    {selectedWithdrawConfig?.isBDT && hasWithdrawInput && numWithdrawAmount > 0 && (
                      <span className="font-mono" style={{ fontSize: '0.92rem', color: 'var(--primary-neon)', fontWeight: 800 }}>
                        Estimated Payout: ≈ ৳{Math.round(numWithdrawAmount * usdToBdt).toLocaleString()} BDT
                      </span>
                    )}
                  </div>
                  {selectedWithdrawConfig?.instructions && (
                    <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                      ℹ️ {selectedWithdrawConfig.instructions}
                    </span>
                  )}
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={
                    withdrawLoading ||
                    !isWithdrawLinked ||
                    !hasWithdrawInput ||
                    isWithdrawBelowMin ||
                    isWithdrawExceedsBal
                  }
                  className="btn btn-neon glow-neon"
                  style={{
                    width: '100%',
                    padding: '13px',
                    fontSize: '0.94rem',
                    fontWeight: 700,
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    opacity: (withdrawLoading || !isWithdrawLinked || !hasWithdrawInput || isWithdrawBelowMin || isWithdrawExceedsBal) ? 0.6 : 1,
                    cursor: (withdrawLoading || !isWithdrawLinked || !hasWithdrawInput || isWithdrawBelowMin || isWithdrawExceedsBal) ? 'not-allowed' : 'pointer',
                  }}
                >
                  {withdrawLoading ? (
                    <>
                      <RefreshCw size={16} className="spin-fast" /> Processing Withdrawal...
                    </>
                  ) : (
                    <>
                      <ArrowDownLeft size={16} /> Request Withdrawal ({hasWithdrawInput && numWithdrawAmount > 0 ? `$${numWithdrawAmount.toFixed(2)} USD` : 'Enter Amount'})
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: SPEND & WITHDRAW LEDGER (2 SUB-TABS) */}
          {activeTab === 'ledger' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Header with Sub-tab Switcher */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <h3 className="font-display" style={{ fontSize: '1.5rem', color: '#0f172a', margin: 0 }}>
                  SPEND & WITHDRAW LEDGER
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
                    maxWidth: 440,
                  }}
                >
                  <button
                    onClick={() => setLedgerTab('my_tx')}
                    style={{
                      padding: '7px 6px',
                      fontSize: 'clamp(0.72rem, 2.6vw, 0.82rem)',
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
                      gap: 4,
                      whiteSpace: 'nowrap',
                      minWidth: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Wallet size={13} style={{ flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>My Logs ({transactions.length})</span>
                  </button>

                  <button
                    onClick={() => { setLedgerTab('platform'); fetchPlatformStats(); }}
                    style={{
                      padding: '7px 6px',
                      fontSize: 'clamp(0.72rem, 2.6vw, 0.82rem)',
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
                      gap: 4,
                      whiteSpace: 'nowrap',
                      minWidth: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Globe size={13} style={{ flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>Total Stats & Feed</span>
                  </button>
                </div>
              </div>

              {/* SUB-TAB 1: MY TRANSACTIONS */}
              {ledgerTab === 'my_tx' && (() => {
                const filteredCreatorTransactions = transactions.filter((tx) => {
                  if (creatorTxFilter === 'all') return true;
                  if (creatorTxFilter === 'spend') return tx.type === 'campaign_spend';
                  if (creatorTxFilter === 'withdraw') return tx.type === 'payout' || tx.type === 'refund';
                  if (creatorTxFilter === 'deposit') return tx.type === 'deposit';
                  return true;
                });

                const spendCount = transactions.filter((t) => t.type === 'campaign_spend').length;
                const withdrawCount = transactions.filter((t) => t.type === 'payout' || t.type === 'refund').length;
                const depositCount = transactions.filter((t) => t.type === 'deposit').length;

                return (
                  <div className="glass-card" style={{ padding: 'clamp(14px, 3.5vw, 22px)', borderRadius: 16 }}>
                    {/* Filter Pills and Refresh Button Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                      <div>
                        <h4 className="font-display" style={{ fontSize: '1.15rem', color: '#0f172a', margin: 0 }}>
                          SPEND & WITHDRAW LOGS
                        </h4>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 2 }}>
                          Track campaign budget spends, withdrawals, and top-up deposits.
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', width: '100%', justifyContent: 'space-between' }}>
                        {/* Sub-Filter Pills */}
                        <div
                          className="mobile-scroll-x"
                          style={{
                            display: 'flex',
                            gap: 4,
                            background: '#f1f5f9',
                            padding: 3,
                            borderRadius: 10,
                            overflowX: 'auto',
                            maxWidth: '100%',
                            flex: 1,
                            minWidth: 0,
                          }}
                        >
                          {[
                            { id: 'all' as const, label: 'All', count: transactions.length },
                            { id: 'spend' as const, label: 'Spends', count: spendCount },
                            { id: 'withdraw' as const, label: 'Withdrawals', count: withdrawCount },
                            { id: 'deposit' as const, label: 'Deposits', count: depositCount },
                          ].map((f) => {
                            const isSelected = creatorTxFilter === f.id;
                            return (
                              <button
                                key={f.id}
                                onClick={() => {
                                  setCreatorTxFilter(f.id);
                                  setTxPage(1);
                                }}
                                style={{
                                  padding: '5px 9px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  borderRadius: 7,
                                  border: 'none',
                                  cursor: 'pointer',
                                  background: isSelected ? '#ffffff' : 'transparent',
                                  color: isSelected ? 'var(--primary-neon)' : '#64748b',
                                  boxShadow: isSelected ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                                  textTransform: 'uppercase',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 3,
                                  whiteSpace: 'nowrap',
                                  flexShrink: 0,
                                  transition: 'all 0.15s ease',
                                }}
                              >
                                <span>{f.label}</span>
                                <span style={{ fontSize: '0.68rem', opacity: 0.75 }}>({f.count})</span>
                              </button>
                            );
                          })}
                        </div>

                        <button
                          onClick={fetchTransactions}
                          className="btn btn-ghost"
                          style={{ padding: '6px 10px', fontSize: '0.78rem', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}
                        >
                          <RefreshCw size={13} className={txLoading ? 'animate-spin' : ''} /> Refresh
                        </button>
                      </div>
                    </div>

                    {!filteredCreatorTransactions.length ? (
                      <div style={{ textAlign: 'center', padding: '36px', color: '#64748b', fontSize: '0.9rem' }}>
                        {creatorTxFilter === 'all'
                          ? 'No spend, withdrawal, or deposit logs recorded yet.'
                          : `No ${creatorTxFilter} logs found.`}
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
                              {filteredCreatorTransactions
                                .slice((txPage - 1) * TX_PAGE_SIZE, txPage * TX_PAGE_SIZE)
                                .map((tx) => {
                                  const isDeposit = tx.type === 'deposit';
                                  const isPayout = tx.type === 'payout';
                                  const isRefund = tx.type === 'refund';
                                  const isSpend = tx.type === 'campaign_spend';

                                  return (
                                    <tr key={tx._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                      <td style={{ padding: '10px 12px' }}>
                                        {isDeposit && (
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
                                        )}
                                        {isRefund && (
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
                                            Withdrawal Refund
                                          </span>
                                        )}
                                        {isPayout && (
                                          <span
                                            className="badge-pill"
                                            style={{
                                              padding: '2px 8px',
                                              fontSize: '0.72rem',
                                              fontWeight: 700,
                                              background: '#faf5ff',
                                              color: '#7c3aed',
                                              border: '1px solid rgba(124, 58, 237, 0.3)',
                                              textTransform: 'uppercase',
                                            }}
                                          >
                                            Withdrawal {tx.gateway ? `(${tx.gateway.toUpperCase()})` : ''}
                                          </span>
                                        )}
                                        {isSpend && (
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
                                        {!isDeposit && !isRefund && !isPayout && !isSpend && (
                                          <span
                                            className="badge-pill"
                                            style={{
                                              padding: '2px 8px',
                                              fontSize: '0.72rem',
                                              fontWeight: 700,
                                              background: '#f1f5f9',
                                              color: '#475569',
                                              border: '1px solid #cbd5e1',
                                              textTransform: 'uppercase',
                                            }}
                                          >
                                            {tx.type}
                                          </span>
                                        )}
                                      </td>
                                      <td
                                        className="font-mono"
                                        style={{
                                          padding: '10px 12px',
                                          fontWeight: 700,
                                          color: isDeposit || isRefund || tx.amount > 0 ? '#059669' : isPayout ? '#7c3aed' : '#ef4444',
                                        }}
                                      >
                                        {isDeposit || isRefund || tx.amount > 0
                                          ? `+$${tx.amount.toFixed(2)}`
                                          : `-$${Math.abs(tx.amount).toFixed(2)}`}
                                      </td>
                                      <td className="font-mono" style={{ padding: '10px 12px', color: '#0f172a' }}>
                                        ${(tx.balanceAfter || 0).toFixed(2)}
                                      </td>
                                      <td style={{ padding: '10px 12px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                          <span style={{ color: tx.status === 'completed' ? '#059669' : tx.status === 'pending' ? '#d97706' : '#ef4444', fontWeight: 600, textTransform: 'capitalize' }}>
                                            {tx.status === 'failed' ? 'Rejected' : tx.status === 'pending' ? 'Pending Review' : tx.status}
                                          </span>
                                          {tx.status === 'failed' && tx.notes && (
                                            <div style={{ fontSize: '0.73rem', color: '#b91c1c', background: '#fef2f2', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '3px 6px', borderRadius: 4, maxWidth: 220, lineHeight: 1.3 }}>
                                              <strong>Reason:</strong> {tx.notes.replace(/^Rejected:\s*/i, '')}
                                            </div>
                                          )}
                                        </div>
                                      </td>
                                      <td style={{ padding: '10px 12px', color: '#64748b' }}>
                                        {new Date(tx.createdAt).toLocaleDateString()}
                                      </td>
                                    </tr>
                                  );
                                })}
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile Card List View */}
                        <div className="mobile-card-list">
                          {filteredCreatorTransactions
                            .slice((txPage - 1) * TX_PAGE_SIZE, txPage * TX_PAGE_SIZE)
                            .map((tx) => {
                              const isDeposit = tx.type === 'deposit';
                              const isPayout = tx.type === 'payout';
                              const isRefund = tx.type === 'refund';
                              const isSpend = tx.type === 'campaign_spend';

                              return (
                                <div key={tx._id} className="mobile-data-card" style={{ width: '100%', boxSizing: 'border-box' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, width: '100%' }}>
                                    <div style={{ minWidth: 0, flexShrink: 1 }}>
                                      {isDeposit && (
                                        <span
                                          className="badge-pill"
                                          style={{
                                            padding: '2px 7px',
                                            fontSize: '0.7rem',
                                            fontWeight: 700,
                                            background: '#ecfdf5',
                                            color: '#059669',
                                            border: '1px solid rgba(16, 185, 129, 0.3)',
                                            textTransform: 'uppercase',
                                          }}
                                        >
                                          Deposit {tx.gateway ? `(${tx.gateway.toUpperCase()})` : ''}
                                        </span>
                                      )}
                                      {isRefund && (
                                        <span
                                          className="badge-pill"
                                          style={{
                                            padding: '2px 7px',
                                            fontSize: '0.7rem',
                                            fontWeight: 700,
                                            background: '#ecfdf5',
                                            color: '#059669',
                                            border: '1px solid rgba(16, 185, 129, 0.3)',
                                            textTransform: 'uppercase',
                                          }}
                                        >
                                          Withdrawal Refund
                                        </span>
                                      )}
                                      {isPayout && (
                                        <span
                                          className="badge-pill"
                                          style={{
                                            padding: '2px 7px',
                                            fontSize: '0.7rem',
                                            fontWeight: 700,
                                            background: '#faf5ff',
                                            color: '#7c3aed',
                                            border: '1px solid rgba(124, 58, 237, 0.3)',
                                            textTransform: 'uppercase',
                                          }}
                                        >
                                          Withdrawal {tx.gateway ? `(${tx.gateway.toUpperCase()})` : ''}
                                        </span>
                                      )}
                                      {isSpend && (
                                        <span
                                          className="badge-pill"
                                          style={{
                                            padding: '2px 7px',
                                            fontSize: '0.7rem',
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
                                      {!isDeposit && !isRefund && !isPayout && !isSpend && (
                                        <span
                                          className="badge-pill"
                                          style={{
                                            padding: '2px 7px',
                                            fontSize: '0.7rem',
                                            fontWeight: 700,
                                            background: '#f1f5f9',
                                            color: '#475569',
                                            border: '1px solid #cbd5e1',
                                            textTransform: 'uppercase',
                                          }}
                                        >
                                          {tx.type}
                                        </span>
                                      )}
                                    </div>

                                    <div
                                      className="font-mono"
                                      style={{
                                        fontWeight: 800,
                                        fontSize: '0.96rem',
                                        color: isDeposit || isRefund || tx.amount > 0 ? '#059669' : isPayout ? '#7c3aed' : '#ef4444',
                                        flexShrink: 0,
                                        textAlign: 'right',
                                      }}
                                    >
                                      {isDeposit || isRefund || tx.amount > 0
                                        ? `+$${tx.amount.toFixed(2)}`
                                        : `-$${Math.abs(tx.amount).toFixed(2)}`}
                                    </div>
                                  </div>

                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.76rem', color: '#64748b', gap: 6, width: '100%' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0, flexWrap: 'wrap' }}>
                                      <span>Status:</span>
                                      <span style={{ color: tx.status === 'completed' ? '#059669' : tx.status === 'pending' ? '#d97706' : '#ef4444', fontWeight: 700, textTransform: 'capitalize' }}>
                                        {tx.status === 'failed' ? 'Rejected' : tx.status === 'pending' ? 'Pending Review' : tx.status}
                                      </span>
                                      <span>•</span>
                                      <span>{new Date(tx.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="font-mono" style={{ color: '#0f172a', fontWeight: 600, flexShrink: 0, textAlign: 'right' }}>
                                      Bal: ${(tx.balanceAfter || 0).toFixed(2)}
                                    </div>
                                  </div>

                                  {tx.status === 'failed' && tx.notes && (
                                    <div style={{ fontSize: '0.72rem', color: '#b91c1c', background: '#fef2f2', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '4px 8px', borderRadius: 6, marginTop: 2 }}>
                                      <strong>Rejection Reason:</strong> {tx.notes.replace(/^Rejected:\s*/i, '')}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                        </div>

                        {renderPagination(
                          txPage,
                          Math.ceil(filteredCreatorTransactions.length / TX_PAGE_SIZE) || 1,
                          filteredCreatorTransactions.length,
                          TX_PAGE_SIZE,
                          setTxPage,
                          'transactions'
                        )}
                      </>
                    )}
                  </div>
                );
              })()}

              {/* SUB-TAB 2: TOTAL SPEND & CAMPAIGN STATS */}
              {ledgerTab === 'platform' && (
                <TotalStatsLogView type="creator" />
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
