export interface SavedPaymentMethod {
  method: string;
  accountNumber: string;
  accountName?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'campaigner' | 'viewer' | 'admin';
  balance: number; // USD Cash Balance
  viewerBalance?: number; // In USD Watch Earnings available for cashout
  creatorBalance?: number; // In USD Ad Budget deposited for buying views
  credits?: number; // Watch Reward Credits
  totalCreditsEarned?: number;
  totalEarned?: number;
  totalSpent?: number;
  totalWithdrawn?: number;
  dailySpend?: number;
  dailyEarnings?: number;
  status?: string;
  avatar?: string;
  phoneNumber?: string;
  savedPaymentMethods?: SavedPaymentMethod[];
  referralCode?: string;
  referralEarnings?: number;
  referralCount?: number;
  referredBy?: string;
}

export interface Campaign {
  _id: string;
  title: string;
  youtubeUrl: string;
  videoId: string;
  targetViews: number;
  watchDurationSec: number;
  pricePerView: number;
  totalCost: number;
  viewsDelivered: number;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  pausedByAdmin?: boolean;
  thumbnailUrl?: string;
  createdAt: string;
}

export interface Task {
  _id: string;
  campaignId: string;
  viewerId: string;
  videoId: string;
  title?: string;
  thumbnailUrl?: string;
  rewardUsd?: number;
  requiredDurationSec: number;
  rewardAmount: number;
  status: 'assigned' | 'in_progress' | 'completed' | 'failed';
  startedAt?: string;
  completedAt?: string;
  actualDurationSec?: number;
}

export interface Payout {
  _id: string;
  viewerId?: {
    _id?: string;
    id?: string;
    name: string;
    email: string;
    balance?: number;
    viewerBalance?: number;
    totalEarned?: number;
    totalWithdrawn?: number;
    createdAt?: string;
  };
  amount: number;
  method: 'bkash' | 'nagad' | 'rocket' | 'crypto' | 'faucetpay' | 'webmoney' | 'payeer';
  accountDetails: string;
  status: 'pending' | 'processing' | 'approved' | 'rejected';
  transactionRef?: string;
  adminNotes?: string;
  rejectionReason?: string;
  ipAddress?: string;
  country?: string;
  browser?: string;
  platform?: string;
  deviceName?: string;
  userAgent?: string;
  deviceInfo?: string;
  clientPlatform?: string;
  requestedAt?: string;
  createdAt?: string;
  processedAt?: string;
}

export interface DepositMethod {
  id: string;
  name: string;
  type?: 'mobile_banking' | 'crypto' | 'micropayment' | 'e_wallet' | string;
  accountType?: string;
  accountNumber?: string;
  minDepositUsd?: number;
  instructions?: string;
  enabled?: boolean;
}

export interface WithdrawMethod {
  id: string;
  name: string;
  type?: 'mobile_banking' | 'crypto' | 'micropayment' | 'e_wallet' | string;
  accountType?: string;
  minWithdrawUsd: number;
  instructions?: string;
  enabled?: boolean;
}

export interface Transaction {
  _id: string;
  userId?: {
    _id?: string;
    id?: string;
    name: string;
    email: string;
    balance?: number;
    creatorBalance?: number;
  } | string;
  type: string;
  amount: number;
  balanceAfter: number;
  status: string;
  gateway?: string;
  senderAccount?: string;
  receiverAccount?: string;
  transactionHash?: string;
  referenceId?: string;
  proofImage?: string;
  adminNotes?: string;
  processedAt?: string;
  notes?: string;
  createdAt: string;
}

export interface LivePayout {
  id: string;
  user: string;
  amount: number;
  method: string;
  timeAgo: string;
}

