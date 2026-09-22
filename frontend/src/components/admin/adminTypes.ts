import { DepositMethod, WithdrawMethod } from '../../types';

export interface PricingTierItem {
  duration: number;
  campaignerCost: number | string;
  viewerReward: number | string;
}

export const formatDurationBadge = (sec: number): string => {
  if (sec === 600) return '600s (10 MIN)';
  if (sec === 900) return '900s (15 MIN)';
  if (sec === 1800) return '1800s (30 MIN)';
  if (sec === 3600) return '3600s (1 HOUR)';
  if (sec === 7200) return '7200s (2 HOURS)';
  if (sec < 60) return `${sec} SECONDS`;
  if (sec < 3600) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return s > 0 ? `${sec}s (${m}m ${s}s)` : `${sec}s (${m} MIN)`;
  }
  const h = (sec / 3600);
  return `${sec}s (${h % 1 === 0 ? h : h.toFixed(1)} ${h > 1 ? 'HOURS' : 'HOUR'})`;
};

export const formatDurationLabel = (sec: number): string => {
  if (sec === 8) return '8s';
  if (sec === 16) return '16s';
  if (sec === 45) return '45s';
  if (sec === 60) return '60s';
  if (sec === 120) return '120s';
  if (sec === 180) return '180s';
  if (sec === 300) return '300s';
  if (sec === 600) return '10 min';
  if (sec === 900) return '15 min';
  if (sec === 1800) return '30 min';
  if (sec === 3600) return '1 hour';
  if (sec === 7200) return '2 hour';
  if (sec < 60) return `${sec}s`;
  if (sec < 3600) return `${Math.round(sec / 60)} min`;
  const h = sec / 3600;
  return `${h % 1 === 0 ? h : h.toFixed(1)} hour${h > 1 ? 's' : ''}`;
};

export const formatDecimalString = (val: number | string, maxDecimals = 10): string => {
  if (val === '' || val === null || val === undefined) return '';
  if (typeof val === 'string') {
    if (/^[0-9]*\.?[0-9]*$/.test(val)) return val;
  }
  const num = typeof val === 'number' ? val : parseFloat(String(val));
  if (isNaN(num)) return '0';
  const fixed = num.toFixed(maxDecimals);
  return fixed.includes('.') ? fixed.replace(/\.?0+$/, '') : fixed;
};

export interface CooldownConfig {
  enabled: boolean;
  durationSeconds: number;
}

export interface DailyLimitConfig {
  enableDailyLimit: boolean;
  maxDailyVideos: number;
}

export interface HourlyLimitConfig {
  enableHourlyLimit: boolean;
  maxHourlyVideos: number;
}

export type AdminTab = 'overview' | 'payouts' | 'deposits' | 'campaigns' | 'users' | 'pricing' | 'gateways' | 'settings' | 'subadmins';

export const DEFAULT_ADMIN_DEPOSIT_METHODS: DepositMethod[] = [
  {
    id: 'crypto',
    name: 'Crypto',
    type: 'crypto',
    accountType: 'Automated Gateway (FaucetPay)',
    accountNumber: 'Automated FaucetPay Merchant',
    minDepositUsd: 5.0,
    instructions: 'Automated crypto checkout powered by FaucetPay. Accepts Bitcoin (BTC), Ethereum (ETH), USDT, Litecoin (LTC), Tron (TRX), Dogecoin (DOGE) and more with instant balance credit.',
    enabled: true,
  },
  {
    id: 'faucetpay',
    name: 'FaucetPay',
    type: 'faucetpay',
    accountType: 'Email / Account',
    accountNumber: 'admin@ytcash.pro',
    minDepositUsd: 5.0,
    instructions: 'Send payment via FaucetPay to this email/account and enter your FaucetPay Transaction ID below.',
    enabled: true,
  },
  {
    id: 'bkash',
    name: 'bKash',
    type: 'bkash',
    accountType: 'Personal',
    accountNumber: '01XXXXXXXXX',
    minDepositUsd: 5.0,
    instructions: 'Send Money (Personal) to this bKash number. Copy the TrxID and enter below.',
    enabled: true,
  },
  {
    id: 'nagad',
    name: 'Nagad',
    type: 'nagad',
    accountType: 'Personal',
    accountNumber: '01XXXXXXXXX',
    minDepositUsd: 5.0,
    instructions: 'Send Money (Personal) to this Nagad number. Copy the TrxID and enter below.',
    enabled: true,
  },
  {
    id: 'webmoney',
    name: 'WebMoney',
    type: 'webmoney',
    accountType: 'WMZ Purse',
    accountNumber: 'Z000000000000',
    minDepositUsd: 5.0,
    instructions: 'Transfer WMZ to this purse and enter the transaction number below.',
    enabled: true,
  },
  {
    id: 'payeer',
    name: 'Payeer',
    type: 'payeer',
    accountType: 'USD Account',
    accountNumber: 'P1000000000',
    minDepositUsd: 5.0,
    instructions: 'Transfer USD to this Payeer account (e.g. P1000000000) and enter your Payeer Transaction / Batch ID.',
    enabled: true,
  },
];

export const DEFAULT_ADMIN_WITHDRAW_METHODS: WithdrawMethod[] = [
  {
    id: 'bkash',
    name: 'bKash',
    type: 'bkash',
    accountType: 'Personal / Agent',
    minWithdrawUsd: 5.0,
    instructions: 'Withdrawals will be sent to your verified personal bKash account.',
    enabled: true,
  },
  {
    id: 'nagad',
    name: 'Nagad',
    type: 'nagad',
    accountType: 'Personal',
    minWithdrawUsd: 5.0,
    instructions: 'Withdrawals will be sent to your verified personal Nagad account.',
    enabled: true,
  },
  {
    id: 'rocket',
    name: 'Rocket',
    type: 'rocket',
    accountType: 'Personal',
    minWithdrawUsd: 5.0,
    instructions: 'Withdrawals will be sent to your verified personal Rocket account.',
    enabled: true,
  },
  {
    id: 'crypto',
    name: 'USDT (BEP-20)',
    type: 'crypto',
    accountType: 'BEP-20 (BNB Smart Chain)',
    minWithdrawUsd: 5.0,
    instructions: 'Withdrawals will be disbursed to your linked USDT (BEP-20) wallet address.',
    enabled: true,
  },
  {
    id: 'faucetpay',
    name: 'FaucetPay',
    type: 'faucetpay',
    accountType: 'Email / Account',
    minWithdrawUsd: 5.0,
    instructions: 'Withdrawals will be sent directly to your linked FaucetPay email/account.',
    enabled: true,
  },
  {
    id: 'webmoney',
    name: 'WebMoney (WMZ)',
    type: 'webmoney',
    accountType: 'WMZ Purse',
    minWithdrawUsd: 5.0,
    instructions: 'Withdrawals will be transferred to your linked WebMoney WMZ purse.',
    enabled: true,
  },
  {
    id: 'payeer',
    name: 'Payeer',
    type: 'payeer',
    accountType: 'USD Account',
    minWithdrawUsd: 5.0,
    instructions: 'Withdrawals will be transferred to your linked Payeer account (P...).',
    enabled: true,
  },
];

// Map payment methods to official brand logos
export const getPaymentLogo = (method: string): string => {
  switch (method?.toLowerCase()) {
    case 'bkash':
      return '/payment-methods/bkash.svg';
    case 'nagad':
      return '/payment-methods/nagad.svg';
    case 'rocket':
      return '/payment-methods/rocket.svg';
    case 'faucetpay':
      return '/payment-methods/faucetpay.svg';
    case 'crypto':
    case 'usdt':
      return '/payment-methods/crypto.svg';
    case 'webmoney':
      return '/payment-methods/webmoney.svg';
    case 'payeer':
      return '/payment-methods/payeer.png';
    default:
      return '/payment-methods/crypto.svg';
  }
};export const formatSecondsHuman = (sec: number): string => {
  if (sec === 0) return '0s (Immediate / No Cooldown)';
  if (sec < 60) return `${sec} Seconds`;
  if (sec < 3600) return `${Math.floor(sec / 60)} Minutes`;
  if (sec < 86400) return `${(sec / 3600).toFixed(1).replace('.0', '')} Hours`;
  return `${(sec / 86400).toFixed(1).replace('.0', '')} Days`;
};
