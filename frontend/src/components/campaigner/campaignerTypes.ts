import { DepositMethod, WithdrawMethod } from '../../types';

export type CreatorTab = 'overview' | 'campaigns' | 'deposit' | 'withdraw' | 'ledger' | 'profile';

export interface PayoutMethodConfig {
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

  return methods.filter((m) => m.enabled);
};

export interface DepositMethodConfig {
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

export const DEFAULT_METHODS_META: Record<
  string,
  {
    logoBg: string;
    logoMark: string;
    logoUrl: string;
    isBDT?: boolean;
    defaultRateText: string;
    defaultAccountType: string;
    defaultInstructions: string;
    defaultAccount: string;
  }
> = {
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

export const buildDepositMethods = (methodsList: DepositMethod[], usdToBdt: number): DepositMethodConfig[] => {
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
