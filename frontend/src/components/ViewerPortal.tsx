import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { User, Transaction, WithdrawMethod } from '../types';
import { apiRequest } from '../api';
import { ProfileSwitchBanner } from './ProfileSwitchBanner';
import { ProfileSettingsSection } from './ProfileSettingsSection';
import { useExchangeRate } from '../context/ExchangeRateContext';
import { getClientTelemetry } from '../utils/telemetry';

// Subcomponents & utilities extracted from monolithic ViewerPortal
import { ViewerTab, PayoutMethodType, getPayoutMethods } from './viewer/viewerTypes';
import { ViewerSidebar } from './viewer/ViewerSidebar';
import { ViewerOverviewTab } from './viewer/ViewerOverviewTab';
import { ViewerWatchTab } from './viewer/ViewerWatchTab';
import { ViewerWithdrawTab } from './viewer/ViewerWithdrawTab';
import { ViewerTransactionsTab } from './viewer/ViewerTransactionsTab';
import { ViewerReferralsTab } from './viewer/ViewerReferralsTab';

interface ViewerPortalProps {
  user: User | null;
  onRefreshUser: () => void;
  onOpenAuth?: (mode: 'signin' | 'signup', role?: 'viewer' | 'campaigner') => void;
  onStartWatching?: () => void;
  onSwitchProfile?: (targetRole: 'viewer' | 'campaigner') => void;
}

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

  // Personal Withdrawals (Payout Ledger) & Pagination State (10 per page)
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txLoading, setTxLoading] = useState<boolean>(false);
  const [txPage, setTxPage] = useState<number>(1);

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
  const selectedMinWithdraw = Number(selectedConfig?.minWithdrawUsd) || 0;

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

    if (!numWithdrawAmount || numWithdrawAmount <= 0) {
      setMsg({ type: 'error', text: 'Please enter a valid withdrawal amount greater than 0.' });
      return;
    }

    if (selectedMinWithdraw > 0 && numWithdrawAmount < selectedMinWithdraw) {
      setMsg({ type: 'error', text: `Minimum withdrawal amount for ${selectedConfig.name} is $${selectedMinWithdraw.toFixed(2)} USD.` });
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
    const telemetry = getClientTelemetry();
    const res = await apiRequest<any>('/wallet/withdraw', {
      method: 'POST',
      body: JSON.stringify({
        amount: Number(numWithdrawAmount),
        method: withdrawMethod,
        accountDetails: linkedMethod.accountNumber.trim(),
        country: telemetry.country,
        browser: telemetry.browser,
        platform: telemetry.platform,
        deviceName: telemetry.deviceName,
        timezone: telemetry.timezone,
        deviceInfo: telemetry.deviceInfo,
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
  const isWithdrawBelowMin = selectedMinWithdraw > 0 && hasWithdrawInput && numWithdrawAmount < selectedMinWithdraw;
  const isWithdrawExceedsBal = hasWithdrawInput && numWithdrawAmount > viewerBal;
  const isWithdrawValid = hasWithdrawInput && numWithdrawAmount > 0 && numWithdrawAmount <= viewerBal && !isWithdrawBelowMin;

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

  const linkedPaymentMethod = user?.savedPaymentMethods?.find((p) => p.method === withdrawMethod);
  const isLinked = !!(linkedPaymentMethod && linkedPaymentMethod.accountNumber);

  return (
    <div className="responsive-container">
      <div className="dashboard-layout">
        {/* =========================================================================
            SIDEBAR (CLEAN ON MOBILE: ONLY TABS SHOWN, PROFILES ON TOP BAR)
            ========================================================================= */}
        <ViewerSidebar
          user={user}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onSwitchProfile={onSwitchProfile}
          clearMsg={() => setMsg(null)}
        />

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
            <ViewerOverviewTab
              user={user}
              viewerBal={viewerBal}
              approxBDT={approxBDT}
              dailyEarnings={dailyEarnings}
              approxDailyBDT={approxDailyBDT}
              watchHistory={watchHistory}
              setActiveTab={setActiveTab}
            />
          )}

          {/* TAB 2: WATCH & EARN */}
          {activeTab === 'watch' && (
            <ViewerWatchTab
              watchHistory={watchHistory}
              watchHistoryLoading={watchHistoryLoading}
              watchPage={watchPage}
              setWatchPage={setWatchPage}
              fetchWatchHistory={fetchWatchHistory}
              onRefreshUser={onRefreshUser}
              todaysWatchCount={todaysWatchCount}
            />
          )}

          {/* TAB 3: WITHDRAW CASH */}
          {activeTab === 'withdraw' && (
            <ViewerWithdrawTab
              viewerBal={viewerBal}
              approxBDT={approxBDT}
              bdtRate={bdtRate}
              payoutMethods={payoutMethods}
              withdrawMethod={withdrawMethod}
              setWithdrawMethod={setWithdrawMethod}
              selectedConfig={selectedConfig}
              selectedMinWithdraw={selectedMinWithdraw}
              withdrawAmount={withdrawAmount}
              setWithdrawAmount={setWithdrawAmount}
              accountDetails={accountDetails}
              isLinked={isLinked}
              linkedPaymentMethod={linkedPaymentMethod}
              isWithdrawBelowMin={isWithdrawBelowMin}
              isWithdrawExceedsBal={isWithdrawExceedsBal}
              isWithdrawValid={isWithdrawValid}
              hasWithdrawInput={hasWithdrawInput}
              numWithdrawAmount={numWithdrawAmount}
              loading={loading}
              handleWithdraw={handleWithdraw}
              setActiveTab={setActiveTab}
              clearMsg={() => setMsg(null)}
            />
          )}

          {/* TAB 4: PAYOUT LEDGER */}
          {activeTab === 'transactions' && (
            <ViewerTransactionsTab
              ledgerTab={ledgerTab}
              setLedgerTab={setLedgerTab}
              transactions={transactions}
              txLoading={txLoading}
              txPage={txPage}
              setTxPage={setTxPage}
              fetchTransactions={fetchTransactions}
              fetchPlatformStats={fetchPlatformStats}
            />
          )}

          {/* TAB 5: REFERRALS (10% COMMISSION) */}
          {activeTab === 'referrals' && (
            <ViewerReferralsTab
              user={user}
              referralStats={referralStats}
              referralLoading={referralLoading}
              referralCopied={referralCopied}
              bdtRate={bdtRate}
              handleCopyReferral={handleCopyReferral}
              fetchReferralStats={fetchReferralStats}
            />
          )}

          {/* TAB 6: ACCOUNT PROFILE & PERSONAL SETTINGS */}
          {activeTab === 'profile' && (
            <ProfileSettingsSection user={user} onRefreshUser={onRefreshUser} />
          )}
        </main>
      </div>
    </div>
  );
};
