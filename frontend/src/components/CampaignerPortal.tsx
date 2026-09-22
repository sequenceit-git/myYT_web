import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { Campaign, User, Transaction, DepositMethod, WithdrawMethod } from '../types';
import { apiRequest } from '../api';
import { ProfileSwitchBanner } from './ProfileSwitchBanner';
import { ProfileSettingsSection } from './ProfileSettingsSection';
import { useExchangeRate } from '../context/ExchangeRateContext';
import { getClientTelemetry } from '../utils/telemetry';

import {
  CreatorTab,
  getPayoutMethods,
  buildDepositMethods,
} from './campaigner/campaignerTypes';
import { CampaignerSidebar } from './campaigner/CampaignerSidebar';
import { CampaignerOverviewTab } from './campaigner/CampaignerOverviewTab';
import { CampaignerCampaignsTab } from './campaigner/CampaignerCampaignsTab';
import { CampaignerDepositTab } from './campaigner/CampaignerDepositTab';
import { CampaignerDepositModal } from './campaigner/CampaignerDepositModal';
import { CampaignerWithdrawTab } from './campaigner/CampaignerWithdrawTab';
import { CampaignerLedgerTab } from './campaigner/CampaignerLedgerTab';

export interface CampaignerPortalProps {
  user: User | null;
  onRefreshUser: () => void;
  onOpenAuth?: (mode: 'signin' | 'signup', role?: 'viewer' | 'campaigner') => void;
  onSwitchProfile?: (targetRole: 'viewer' | 'campaigner') => void;
}

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
  const [depositGateway, setDepositGateway] = useState<string>('crypto');
  const [depositLoading, setDepositLoading] = useState<boolean>(false);
  const [depositMethodsList, setDepositMethodsList] = useState<DepositMethod[]>([]);
  const [senderAccount, setSenderAccount] = useState<string>('');
  const [transactionHash, setTransactionHash] = useState<string>('');
  const [depositNotes, setDepositNotes] = useState<string>('');
  const [copiedReceiver, setCopiedReceiver] = useState<boolean>(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState<boolean>(false);
  const [depositModalError, setDepositModalError] = useState<string | null>(null);

  // Listen for FaucetPay automated checkout return redirects (?status=success or ?status=cancelled)
  useEffect(() => {
    const statusParam = searchParams.get('status');
    const orderIdParam = searchParams.get('orderId') || searchParams.get('txId');

    if (statusParam === 'success') {
      if (orderIdParam) {
        apiRequest<{ isCompleted: boolean; amount: number; balance: number }>('/wallet/faucetpay-verify-order', {
          method: 'POST',
          body: JSON.stringify({ orderId: orderIdParam }),
        }).then((res) => {
          onRefreshUser();
          fetchTransactions();
          if (res.success && res.data?.isCompleted) {
            setFeedback({
              type: 'success',
              message: `✓ Crypto deposit of $${Number(res.data.amount || 0).toFixed(2)} USD successfully credited to your Ad Budget!`,
            });
          } else {
            setFeedback({
              type: 'success',
              message: '✓ Crypto deposit submitted via FaucetPay! Your balance will update automatically upon blockchain confirmation.',
            });
          }
        }).catch(() => {
          onRefreshUser();
        });
      } else {
        setFeedback({
          type: 'success',
          message: '✓ Crypto deposit payment completed! Your ad budget balance is updated.',
        });
        onRefreshUser();
      }
      setSearchParams({ tab: 'deposit' }, { replace: true });
    } else if (statusParam === 'cancelled') {
      setFeedback({
        type: 'error',
        message: 'Crypto deposit was cancelled. No funds were deducted.',
      });
      setSearchParams({ tab: 'deposit' }, { replace: true });
    }
  }, [searchParams]);

  // Withdraw State
  const [withdrawMethod, setWithdrawMethod] = useState<string>('bkash');
  const [withdrawAmount, setWithdrawAmount] = useState<string | number>('');
  const [withdrawLoading, setWithdrawLoading] = useState<boolean>(false);
  const [serverWithdrawMethods, setServerWithdrawMethods] = useState<WithdrawMethod[]>([]);

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  // Transactions State (Spend Ledger - Deposits, Campaign Spends & Withdrawals)
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txLoading, setTxLoading] = useState<boolean>(false);
  const [txPage, setTxPage] = useState<number>(1);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Spend & Withdraw Ledger Sub-Tab & Filter state
  const [ledgerTab, setLedgerTab] = useState<'my_tx' | 'platform'>('my_tx');
  const [creatorTxFilter, setCreatorTxFilter] = useState<'all' | 'spend' | 'withdraw' | 'deposit'>('all');

  const fetchPlatformStats = async () => {
    await apiRequest<any>('/campaigns/platform-stats');
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

  // Fetch Creator Transactions (Deposits, Campaign Spends & Creator Withdrawals)
  const fetchTransactions = async () => {
    setTxLoading(true);
    const res = await apiRequest<Transaction[]>('/wallet/transactions?role=creator');
    setTxLoading(false);
    if (res.success && res.data) {
      const creatorTx = res.data.filter((tx) =>
        ['deposit', 'campaign_spend', 'payout', 'refund'].includes(tx.type) &&
        tx.role !== 'viewer'
      );
      setTransactions(creatorTx);
      setTxPage(1);
    }
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

    const hasInput = depositAmount !== '' && depositAmount !== null && depositAmount !== undefined && depositAmount.toString().trim() !== '';
    const numAmount = hasInput ? (parseFloat(depositAmount.toString()) || 0) : 0;
    const currentMethodObj = depositMethods.find((m) => m.id === depositGateway) || depositMethods[0];
    const minRequired = currentMethodObj?.minDepositUsd || 5.0;

    if (!hasInput || numAmount < minRequired) {
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

    const hasInput = depositAmount !== '' && depositAmount !== null && depositAmount !== undefined && depositAmount.toString().trim() !== '';
    const numAmount = hasInput ? (parseFloat(depositAmount.toString()) || 0) : 0;
    const currentMethodObj = depositMethods.find((m) => m.id === depositGateway) || depositMethods[0];
    const minRequired = currentMethodObj?.minDepositUsd || 5.0;

    if (!hasInput || numAmount < minRequired) {
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
        amount: Number(numAmount),
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
        message: `✓ Deposit request of $${numAmount.toFixed(2)} USD submitted! It is currently pending Admin verification and will be credited once approved.`,
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
        {/* SIDEBAR NAVIGATION */}
        <CampaignerSidebar
          user={user}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          campaignsCount={campaigns.length}
          onSwitchProfile={onSwitchProfile}
          clearFeedback={() => setFeedback(null)}
        />

        {/* MAIN CONTENT AREA */}
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
                borderRadius: 12,
                fontSize: '0.88rem',
                fontWeight: 600,
                background: feedback.type === 'success' ? '#f0fdf4' : '#fef2f2',
                border: feedback.type === 'success' ? '1px solid #86efac' : '1px solid #fca5a5',
                color: feedback.type === 'success' ? '#15803d' : '#b91c1c',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {feedback.type === 'success' ? (
                  <CheckCircle2 size={18} color="#16a34a" style={{ flexShrink: 0 }} />
                ) : (
                  <AlertCircle size={18} color="#dc2626" style={{ flexShrink: 0 }} />
                )}
                <span>{feedback.message}</span>
              </div>
              <button
                onClick={() => setFeedback(null)}
                style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 4 }}
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <CampaignerOverviewTab
              user={user}
              creatorBal={creatorBal}
              dailySpend={dailySpend}
              totalViewsDelivered={totalViewsDelivered}
              totalViewsTargeted={totalViewsTargeted}
              activeCampaignsCount={activeCampaignsCount}
              campaigns={campaigns}
              setActiveTab={setActiveTab}
              togglePause={togglePause}
            />
          )}

          {/* TAB 2: ALL CAMPAIGNS */}
          {activeTab === 'campaigns' && (
            <CampaignerCampaignsTab
              campaigns={campaigns}
              bdtRate={bdtRate}
              togglePause={togglePause}
            />
          )}

          {/* TAB 3: DEPOSIT */}
          {activeTab === 'deposit' && (
            <CampaignerDepositTab
              creatorBal={creatorBal}
              depositAmount={depositAmount}
              setDepositAmount={setDepositAmount}
              depositGateway={depositGateway}
              setDepositGateway={setDepositGateway}
              depositMethods={depositMethods}
              selectedMethod={selectedMethod}
              minRequiredUsd={minRequiredUsd}
              numDepositAmount={numDepositAmount}
              hasDepositInput={hasDepositInput}
              isDepositBelowMin={isDepositBelowMin}
              bdtRate={bdtRate}
              handleOpenDepositModal={handleOpenDepositModal}
              clearFeedback={() => setFeedback(null)}
            />
          )}

          {/* TAB 4: WITHDRAW */}
          {activeTab === 'withdraw' && (
            <CampaignerWithdrawTab
              creatorBal={creatorBal}
              usdToBdt={usdToBdt}
              payoutMethods={payoutMethods}
              withdrawMethod={withdrawMethod}
              setWithdrawMethod={setWithdrawMethod}
              selectedWithdrawConfig={selectedWithdrawConfig}
              selectedMinWithdraw={selectedMinWithdraw}
              withdrawAmount={withdrawAmount}
              setWithdrawAmount={setWithdrawAmount}
              isWithdrawBelowMin={isWithdrawBelowMin}
              isWithdrawExceedsBal={isWithdrawExceedsBal}
              hasWithdrawInput={hasWithdrawInput}
              numWithdrawAmount={numWithdrawAmount}
              isWithdrawLinked={isWithdrawLinked}
              linkedPaymentMethod={linkedPaymentMethod}
              withdrawLoading={withdrawLoading}
              handleWithdraw={handleWithdraw}
              setActiveTab={setActiveTab}
              clearFeedback={() => setFeedback(null)}
            />
          )}

          {/* TAB 5: SPEND & WITHDRAW LEDGER */}
          {activeTab === 'ledger' && (
            <CampaignerLedgerTab
              ledgerTab={ledgerTab}
              setLedgerTab={setLedgerTab}
              creatorTxFilter={creatorTxFilter}
              setCreatorTxFilter={setCreatorTxFilter}
              transactions={transactions}
              txLoading={txLoading}
              txPage={txPage}
              setTxPage={setTxPage}
              fetchTransactions={fetchTransactions}
              fetchPlatformStats={fetchPlatformStats}
            />
          )}

          {/* TAB 6: ACCOUNT PROFILE & PERSONAL SETTINGS */}
          {activeTab === 'profile' && (
            <ProfileSettingsSection user={user} onRefreshUser={onRefreshUser} />
          )}

          {/* DEPOSIT PAYMENT DETAILS POPUP MODAL */}
          <CampaignerDepositModal
            isOpen={isDepositModalOpen}
            onClose={() => setIsDepositModalOpen(false)}
            selectedMethod={selectedMethod}
            numDepositAmount={numDepositAmount}
            bdtRate={bdtRate}
            senderAccount={senderAccount}
            setSenderAccount={setSenderAccount}
            transactionHash={transactionHash}
            setTransactionHash={setTransactionHash}
            depositNotes={depositNotes}
            setDepositNotes={setDepositNotes}
            copiedReceiver={copiedReceiver}
            setCopiedReceiver={setCopiedReceiver}
            depositLoading={depositLoading}
            depositModalError={depositModalError}
            handleDepositSubmit={handleDepositSubmit}
            onRefreshUser={onRefreshUser}
            onSuccessNotice={(msg) => setFeedback({ type: 'success', message: msg })}
          />
        </main>
      </div>
    </div>
  );
};
