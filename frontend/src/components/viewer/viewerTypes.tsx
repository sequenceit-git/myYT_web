import React from 'react';
import { WithdrawMethod } from '../../types';

export type ViewerTab = 'overview' | 'watch' | 'withdraw' | 'transactions' | 'referrals' | 'profile';

export type PayoutMethodType = 'bkash' | 'nagad' | 'rocket' | 'faucetpay' | 'crypto' | 'webmoney' | 'payeer';

export interface PayoutMethodConfig {
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

export const getPayoutMethods = (usdToBdt: number, dynamicMethods?: WithdrawMethod[]): PayoutMethodConfig[] => {
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

// Custom sleek Smartphone device icon with bezel, speaker, and home bar
export const PhoneDeviceIcon: React.FC<{ size?: number; color?: string }> = ({ size = 24, color = 'currentColor' }) => (
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

// Google redirect URL method to bypass Google Play Protect prompts and ensure playback begins at 0s
export const getGoogleRedirectUrl = (videoId: string) => {
  return `https://www.google.com/url?sa=t&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}&t=0s`)}`;
};
