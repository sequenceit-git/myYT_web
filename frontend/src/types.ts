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
  status?: string;
  avatar?: string;
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
  };
  amount: number;
  method: 'bkash' | 'nagad' | 'crypto' | 'faucetpay' | 'webmoney';
  accountDetails: string;
  status: 'pending' | 'processing' | 'approved' | 'rejected';
  transactionRef?: string;
  adminNotes?: string;
  requestedAt?: string;
  createdAt?: string;
  processedAt?: string;
}

export interface Transaction {
  _id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  status: string;
  gateway?: string;
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
