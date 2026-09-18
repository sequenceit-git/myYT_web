import { DepositMethod, WithdrawMethod } from '../../types';

export interface PricingTierItem {
  duration: number;
  campaignerCost: number;
  viewerReward: number;
}

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

export type AdminTab = 'overview' | 'payouts' | 'deposits' | 'campaigns' | 'users' | 'pricing' | 'gateways' | 'settings';

export const DEFAULT_ADMIN_DEPOSIT_METHODS: DepositMethod[] = [
  {
    id: 'faucetpay',
    name: 'FaucetPay',
    type: 'faucetpay',
    accountType: 'Email / Account',
    accountNumber: 'admin@myyt.com',
    minDepositUsd: 5.0,
    instructions: 'Send payment via FaucetPay to this email/address and enter your FaucetPay TrxID.',
    enabled: true,
  },
  {
    id: 'crypto',
    name: 'USDT (BEP-20)',
    type: 'crypto',
    accountType: 'BEP-20 (BNB Smart Chain)',
    accountNumber: '0x0000000000000000000000000000000000000000',
    minDepositUsd: 5.0,
    instructions: 'Send USDT (BEP-20 network only) to this wallet address. Paste the transaction hash below.',
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
