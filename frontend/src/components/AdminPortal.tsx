import React, { useState, useEffect } from 'react';
import { User, Campaign, Payout, Transaction, DepositMethod, WithdrawMethod } from '../types';
import { apiRequest, setAuthToken, clearAuthToken } from '../api';
import { useExchangeRate } from '../context/ExchangeRateContext';

// Admin Subcomponents
import { AdminLogin } from './admin/AdminLogin';
import { AdminHeader } from './admin/AdminHeader';
import { AdminOverviewTab } from './admin/AdminOverviewTab';
import { AdminPayoutsTab } from './admin/AdminPayoutsTab';
import { AdminDepositsTab } from './admin/AdminDepositsTab';
import { AdminCampaignsTab } from './admin/AdminCampaignsTab';
import { AdminUsersTab } from './admin/AdminUsersTab';
import { AdminSettingsTab } from './admin/AdminSettingsTab';
import { AdminPaymentMethodsTab } from './admin/AdminPaymentMethodsTab';
import { AdminPayoutModals } from './admin/AdminPayoutModals';
import { AdminDepositModals } from './admin/AdminDepositModals';

// Types & Defaults
import {
  PricingTierItem,
  CooldownConfig,
  DailyLimitConfig,
  AdminTab,
  DEFAULT_ADMIN_DEPOSIT_METHODS,
  DEFAULT_ADMIN_WITHDRAW_METHODS,
} from './admin/adminTypes';

export type { PricingTierItem, CooldownConfig, DailyLimitConfig, AdminTab };

interface AdminPortalProps {
  user: User | null;
  onRefreshUser?: () => Promise<void> | void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ user, onRefreshUser }) => {
  // Authentication & Session
  const [passwordInput, setPasswordInput] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [payoutFilter, setPayoutFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [depositFilter, setDepositFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');

  // Pricing & Cooldown Engine States
  const [pricingTiers, setPricingTiers] = useState<PricingTierItem[]>([
    { duration: 8, campaignerCost: 0.0040, viewerReward: 0.0028 },
    { duration: 16, campaignerCost: 0.0055, viewerReward: 0.0039 },
    { duration: 45, campaignerCost: 0.0088, viewerReward: 0.0062 },
    { duration: 60, campaignerCost: 0.0100, viewerReward: 0.0072 },
    { duration: 120, campaignerCost: 0.0150, viewerReward: 0.0110 },
    { duration: 180, campaignerCost: 0.0210, viewerReward: 0.0155 },
    { duration: 300, campaignerCost: 0.0320, viewerReward: 0.0240 },
  ]);
  const [pricingSaving, setPricingSaving] = useState(false);

  const [cooldownConfig, setCooldownConfig] = useState<CooldownConfig>({
    enabled: true,
    durationSeconds: 3600,
  });
  const [cooldownSaving, setCooldownSaving] = useState(false);

  // Daily Video Limit Engine States
  const [dailyLimitConfig, setDailyLimitConfig] = useState<DailyLimitConfig>({
    enableDailyLimit: false,
    maxDailyVideos: 50,
  });
  const [dailyLimitSaving, setDailyLimitSaving] = useState(false);

  // Deposit Methods & Receiver Addresses State
  const [depositMethodsConfig, setDepositMethodsConfig] = useState<DepositMethod[]>(DEFAULT_ADMIN_DEPOSIT_METHODS);
  const [depositMethodsSaving, setDepositMethodsSaving] = useState(false);

  // Withdrawal Methods & Minimum Limits State
  const [withdrawMethodsConfig, setWithdrawMethodsConfig] = useState<WithdrawMethod[]>(DEFAULT_ADMIN_WITHDRAW_METHODS);
  const [withdrawMethodsSaving, setWithdrawMethodsSaving] = useState(false);

  // Telemetry & Data lists
  const [stats, setStats] = useState<any>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [campaignsList, setCampaignsList] = useState<Campaign[]>([]);
  const [payoutsList, setPayoutsList] = useState<Payout[]>([]);
  const [depositsList, setDepositsList] = useState<Transaction[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Search filters
  const [userSearch, setUserSearch] = useState('');
  const [campaignSearch, setCampaignSearch] = useState('');

  // Pagination states
  const [payoutPage, setPayoutPage] = useState(1);
  const [depositPage, setDepositPage] = useState(1);
  const [campPage, setCampPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const PAGE_SIZE = 10;

  // Manual Payout Modal States
  const [approveModalPayout, setApproveModalPayout] = useState<Payout | null>(null);
  const [approveTxnRef, setApproveTxnRef] = useState('');
  const [approveNotes, setApproveNotes] = useState('');
  const [approveLoading, setApproveLoading] = useState(false);

  const [rejectModalPayout, setRejectModalPayout] = useState<Payout | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);

  // Manual Deposit Modal States
  const [approveModalDeposit, setApproveModalDeposit] = useState<Transaction | null>(null);
  const [approveDepositNotes, setApproveDepositNotes] = useState('');
  const [approveDepositLoading, setApproveDepositLoading] = useState(false);

  const [rejectModalDeposit, setRejectModalDeposit] = useState<Transaction | null>(null);
  const [rejectDepositReason, setRejectDepositReason] = useState('');
  const [rejectDepositLoading, setRejectDepositLoading] = useState(false);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Dynamic Dollar Price / Exchange Rate Engine
  const { usdToBdt, updateRate, loading: rateUpdating } = useExchangeRate();
  const [dollarRateInput, setDollarRateInput] = useState<string>(String(usdToBdt));

  useEffect(() => {
    setDollarRateInput(String(usdToBdt));
  }, [usdToBdt]);

  const handleSaveDollarRate = async (customRate?: number) => {
    const val = customRate !== undefined ? customRate : parseFloat(dollarRateInput);
    if (!val || isNaN(val) || val <= 0) {
      setActionNotice({ type: 'error', message: 'Please enter a valid dollar exchange rate' });
      return;
    }
    const res = await updateRate(val);
    if (res.success) {
      setDollarRateInput(String(val));
      setActionNotice({ type: 'success', message: res.message || `Dollar price updated to 1 USD = ${val} BDT!` });
    } else {
      setActionNotice({ type: 'error', message: res.error || 'Failed to update dollar rate' });
    }
  };

  // Fetch admin data
  const fetchAdminData = async () => {
    setDataLoading(true);
    try {
      const [statsRes, usersRes, campRes, payRes, depRes, depMethodsRes, withdrawMethodsRes, settingsRes] = await Promise.all([
        apiRequest<any>('/admin/stats'),
        apiRequest<User[]>('/admin/users'),
        apiRequest<Campaign[]>('/admin/campaigns'),
        apiRequest<Payout[]>('/admin/payouts'),
        apiRequest<Transaction[]>('/admin/deposits'),
        apiRequest<DepositMethod[]>('/admin/settings/deposit-methods'),
        apiRequest<WithdrawMethod[]>('/admin/settings/withdraw-methods'),
        apiRequest<{
          usdToBdt: number;
          pricingTiers: any;
          pricingTiersList?: PricingTierItem[];
          cooldownSettings: any;
          dailyLimitSettings?: any;
        }>('/admin/settings'),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (usersRes.success) setUsersList(usersRes.data || []);
      if (campRes.success) setCampaignsList(campRes.data || []);
      if (payRes.success) setPayoutsList(payRes.data || []);
      if (depRes.success) setDepositsList(depRes.data || []);
      if (depMethodsRes.success && depMethodsRes.data && Array.isArray(depMethodsRes.data) && depMethodsRes.data.length > 0) {
        setDepositMethodsConfig(depMethodsRes.data);
      }
      if (withdrawMethodsRes.success && withdrawMethodsRes.data && Array.isArray(withdrawMethodsRes.data) && withdrawMethodsRes.data.length > 0) {
        setWithdrawMethodsConfig(withdrawMethodsRes.data);
      }
      if (settingsRes.success && settingsRes.data) {
        // 1. Pricing Tiers: handle array or object
        if (settingsRes.data.pricingTiersList && Array.isArray(settingsRes.data.pricingTiersList)) {
          setPricingTiers(settingsRes.data.pricingTiersList);
        } else if (settingsRes.data.pricingTiers) {
          if (Array.isArray(settingsRes.data.pricingTiers)) {
            setPricingTiers(settingsRes.data.pricingTiers);
          } else if (typeof settingsRes.data.pricingTiers === 'object') {
            const list: PricingTierItem[] = Object.entries(settingsRes.data.pricingTiers).map(([sec, t]: [string, any]) => ({
              duration: parseInt(sec, 10),
              campaignerCost: Number(t?.campaignerCost || 0),
              viewerReward: Number(t?.viewerReward || 0),
            })).filter((item) => !isNaN(item.duration) && item.duration > 0).sort((a, b) => a.duration - b.duration);
            if (list.length > 0) setPricingTiers(list);
          }
        }

        // 2. Cooldown Settings: normalize properties
        if (settingsRes.data.cooldownSettings) {
          const cd = settingsRes.data.cooldownSettings as any;
          setCooldownConfig({
            enabled: Boolean(cd.enabled ?? cd.enableCooldown),
            durationSeconds: Number(cd.durationSeconds ?? cd.videoCooldownSeconds ?? 3600),
          });
        }

        // 3. Daily Limit Settings: normalize properties
        if (settingsRes.data.dailyLimitSettings) {
          const dl = settingsRes.data.dailyLimitSettings as any;
          setDailyLimitConfig({
            enableDailyLimit: Boolean(dl.enableDailyLimit ?? dl.enabled),
            maxDailyVideos: Number(dl.maxDailyVideos ?? dl.limit ?? 50),
          });
        }

        // 4. USD to BDT Currency Rate
        if (settingsRes.data.usdToBdt) {
          setDollarRateInput(String(settingsRes.data.usdToBdt));
        }
      }
    } catch {
      // Ignore network errors
    } finally {
      setDataLoading(false);
    }
  };

  // Pricing Matrix Handlers
  const handleSavePricing = async () => {
    setPricingSaving(true);
    try {
      const res = await apiRequest<{ message?: string; pricingTiers: any; pricingTiersList?: PricingTierItem[] }>('/admin/settings/pricing', {
        method: 'POST',
        body: JSON.stringify({ pricingTiers }),
      });
      if (res.success) {
        setActionNotice({ type: 'success', message: (res as any).message || 'Pricing tiers per view saved successfully!' });
        if (res.data?.pricingTiersList && Array.isArray(res.data.pricingTiersList)) {
          setPricingTiers(res.data.pricingTiersList);
        } else if (res.data?.pricingTiers) {
          if (Array.isArray(res.data.pricingTiers)) {
            setPricingTiers(res.data.pricingTiers);
          } else if (typeof res.data.pricingTiers === 'object') {
            const list: PricingTierItem[] = Object.entries(res.data.pricingTiers).map(([sec, t]: [string, any]) => ({
              duration: parseInt(sec, 10),
              campaignerCost: Number(t?.campaignerCost || 0),
              viewerReward: Number(t?.viewerReward || 0),
            })).filter((item) => !isNaN(item.duration) && item.duration > 0).sort((a, b) => a.duration - b.duration);
            if (list.length > 0) setPricingTiers(list);
          }
        }
      } else {
        setActionNotice({ type: 'error', message: res.error || 'Failed to save pricing tiers' });
      }
    } catch (err: any) {
      setActionNotice({ type: 'error', message: err.message || 'Error saving pricing tiers' });
    } finally {
      setPricingSaving(false);
    }
  };

  const handleResetPricing = () => {
    const defaultTiers: PricingTierItem[] = [
      { duration: 8, campaignerCost: 0.0040, viewerReward: 0.0028 },
      { duration: 16, campaignerCost: 0.0055, viewerReward: 0.0039 },
      { duration: 45, campaignerCost: 0.0088, viewerReward: 0.0062 },
      { duration: 60, campaignerCost: 0.0100, viewerReward: 0.0072 },
      { duration: 120, campaignerCost: 0.0150, viewerReward: 0.0110 },
      { duration: 180, campaignerCost: 0.0210, viewerReward: 0.0155 },
      { duration: 300, campaignerCost: 0.0320, viewerReward: 0.0240 },
    ];
    setPricingTiers(defaultTiers);
    setActionNotice({ type: 'success', message: 'Reset to standard defaults. Click Save Pricing Rules to apply.' });
  };

  const handleUpdateTier = (index: number, field: 'campaignerCost' | 'viewerReward', value: number) => {
    setPricingTiers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: Math.max(0, value) };
      return updated;
    });
  };

  // Cooldown Settings Handlers
  const handleSaveCooldown = async () => {
    setCooldownSaving(true);
    try {
      const res = await apiRequest<{ message?: string; cooldownSettings: any }>('/admin/settings/cooldown', {
        method: 'POST',
        body: JSON.stringify({
          enabled: cooldownConfig.enabled,
          durationSeconds: cooldownConfig.durationSeconds,
          enableCooldown: cooldownConfig.enabled,
          videoCooldownSeconds: cooldownConfig.durationSeconds,
        }),
      });
      if (res.success) {
        setActionNotice({ type: 'success', message: (res as any).message || 'Anti-spam cooldown timer settings saved successfully!' });
        if (res.data?.cooldownSettings) {
          const cd = res.data.cooldownSettings as any;
          setCooldownConfig({
            enabled: Boolean(cd.enabled ?? cd.enableCooldown),
            durationSeconds: Number(cd.durationSeconds ?? cd.videoCooldownSeconds ?? 3600),
          });
        }
      } else {
        setActionNotice({ type: 'error', message: res.error || 'Failed to save cooldown settings' });
      }
    } catch (err: any) {
      setActionNotice({ type: 'error', message: err.message || 'Error saving cooldown settings' });
    } finally {
      setCooldownSaving(false);
    }
  };

  // Daily Limit Settings Handlers
  const handleSaveDailyLimit = async () => {
    setDailyLimitSaving(true);
    try {
      const res = await apiRequest<{ message?: string; dailyLimitSettings: any }>('/admin/settings/daily-limit', {
        method: 'POST',
        body: JSON.stringify({
          enableDailyLimit: dailyLimitConfig.enableDailyLimit,
          maxDailyVideos: dailyLimitConfig.maxDailyVideos,
          enabled: dailyLimitConfig.enableDailyLimit,
          limit: dailyLimitConfig.maxDailyVideos,
        }),
      });
      if (res.success) {
        setActionNotice({ type: 'success', message: (res as any).message || 'Daily watch limit saved successfully!' });
        if (res.data?.dailyLimitSettings) {
          const dl = res.data.dailyLimitSettings as any;
          setDailyLimitConfig({
            enableDailyLimit: Boolean(dl.enableDailyLimit ?? dl.enabled),
            maxDailyVideos: Number(dl.maxDailyVideos ?? dl.limit ?? 50),
          });
        }
      } else {
        setActionNotice({ type: 'error', message: res.error || 'Failed to save daily limit settings' });
      }
    } catch (err: any) {
      setActionNotice({ type: 'error', message: err.message || 'Error saving daily limit settings' });
    } finally {
      setDailyLimitSaving(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchAdminData();
    }
  }, [user]);

  // Handle password-only login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    try {
      const res = await apiRequest<{ user: User; token: string }>('/auth/admin-login', {
        method: 'POST',
        body: JSON.stringify({ password: passwordInput }),
      });

      if (res.success && res.data) {
        if (res.data.token) {
          setAuthToken(res.data.token);
        }
        if (onRefreshUser) {
          await onRefreshUser();
        }
        setPasswordInput('');
        fetchAdminData();
      } else {
        setLoginError(res.error || 'Invalid administrator password. Access denied.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Connection error. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Admin Logout
  const handleAdminLogout = () => {
    clearAuthToken();
    if (onRefreshUser) {
      onRefreshUser();
    }
    window.location.reload();
  };

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Submit manual payout approval
  const handleConfirmApprove = async () => {
    if (!approveModalPayout) return;
    setApproveLoading(true);

    try {
      const res = await apiRequest(`/admin/payouts/${approveModalPayout._id}/approve`, {
        method: 'POST',
        body: JSON.stringify({
          transactionRef: approveTxnRef || `MFS-${Date.now().toString().slice(-6)}`,
          adminNotes: approveNotes || 'Disbursed manually by Administrator',
        }),
      });

      if (res.success) {
        setActionNotice({
          type: 'success',
          message: `Payout of $${approveModalPayout.amount.toFixed(2)} to ${approveModalPayout.viewerId?.name || 'Viewer'} confirmed and approved!`,
        });
        setApproveModalPayout(null);
        setApproveTxnRef('');
        setApproveNotes('');
        fetchAdminData();
      } else {
        setActionNotice({ type: 'error', message: res.error || 'Failed to approve payout' });
      }
    } catch (err: any) {
      setActionNotice({ type: 'error', message: err.message || 'Request failed' });
    } finally {
      setApproveLoading(false);
    }
  };

  // Submit manual payout rejection & refund
  const handleConfirmReject = async () => {
    if (!rejectModalPayout) return;
    setRejectLoading(true);

    try {
      const res = await apiRequest(`/admin/payouts/${rejectModalPayout._id}/reject`, {
        method: 'POST',
        body: JSON.stringify({
          adminNotes: rejectReason || 'Declined by Administrator (Invalid account or policy issue)',
        }),
      });

      if (res.success) {
        setActionNotice({
          type: 'success',
          message: `Payout rejected. $${rejectModalPayout.amount.toFixed(2)} USD refunded to viewer wallet.`,
        });
        setRejectModalPayout(null);
        setRejectReason('');
        fetchAdminData();
      } else {
        setActionNotice({ type: 'error', message: res.error || 'Failed to reject payout' });
      }
    } catch (err: any) {
      setActionNotice({ type: 'error', message: err.message || 'Request failed' });
    } finally {
      setRejectLoading(false);
    }
  };

  // Submit manual deposit approval (credits user creator balance)
  const handleConfirmApproveDeposit = async () => {
    if (!approveModalDeposit) return;
    setApproveDepositLoading(true);

    try {
      const res = await apiRequest(`/admin/deposits/${approveModalDeposit._id}/approve`, {
        method: 'POST',
        body: JSON.stringify({
          adminNotes: approveDepositNotes || 'Approved manually by Administrator',
        }),
      });

      if (res.success) {
        setActionNotice({
          type: 'success',
          message: `Deposit of $${approveModalDeposit.amount.toFixed(2)} USD approved and credited to creator balance!`,
        });
        setApproveModalDeposit(null);
        setApproveDepositNotes('');
        fetchAdminData();
      } else {
        setActionNotice({ type: 'error', message: res.error || 'Failed to approve deposit' });
      }
    } catch (err: any) {
      setActionNotice({ type: 'error', message: err.message || 'Request failed' });
    } finally {
      setApproveDepositLoading(false);
    }
  };

  // Submit manual deposit rejection
  const handleConfirmRejectDeposit = async () => {
    if (!rejectModalDeposit) return;
    setRejectDepositLoading(true);

    try {
      const res = await apiRequest(`/admin/deposits/${rejectModalDeposit._id}/reject`, {
        method: 'POST',
        body: JSON.stringify({
          adminNotes: rejectDepositReason || 'Declined by Administrator (Invalid TrxID or unpaid)',
        }),
      });

      if (res.success) {
        setActionNotice({
          type: 'success',
          message: `Deposit of $${rejectModalDeposit.amount.toFixed(2)} USD marked as rejected.`,
        });
        setRejectModalDeposit(null);
        setRejectDepositReason('');
        fetchAdminData();
      } else {
        setActionNotice({ type: 'error', message: res.error || 'Failed to reject deposit' });
      }
    } catch (err: any) {
      setActionNotice({ type: 'error', message: err.message || 'Request failed' });
    } finally {
      setRejectDepositLoading(false);
    }
  };

  // Save Deposit Payment Methods Settings
  const handleSaveDepositMethods = async () => {
    setDepositMethodsSaving(true);
    try {
      const res = await apiRequest<{ message?: string; methods: DepositMethod[] }>('/admin/settings/deposit-methods', {
        method: 'POST',
        body: JSON.stringify({ methods: depositMethodsConfig }),
      });
      if (res.success) {
        setActionNotice({ type: 'success', message: (res as any).message || res.data?.message || 'Deposit payment methods and account numbers updated!' });
        if (res.data?.methods && Array.isArray(res.data.methods)) {
          setDepositMethodsConfig(res.data.methods);
        }
      } else {
        setActionNotice({ type: 'error', message: res.error || 'Failed to save deposit methods' });
      }
    } catch (err: any) {
      setActionNotice({ type: 'error', message: err.message || 'Request failed' });
    } finally {
      setDepositMethodsSaving(false);
    }
  };

  // Save Withdrawal Payment Methods & Minimum Limits Settings
  const handleSaveWithdrawMethods = async () => {
    setWithdrawMethodsSaving(true);
    try {
      const res = await apiRequest<{ message?: string; methods: WithdrawMethod[] }>('/admin/settings/withdraw-methods', {
        method: 'POST',
        body: JSON.stringify({ methods: withdrawMethodsConfig }),
      });
      if (res.success) {
        setActionNotice({ type: 'success', message: (res as any).message || res.data?.message || 'Withdrawal payment methods & minimum limits updated!' });
        if (res.data?.methods && Array.isArray(res.data.methods)) {
          setWithdrawMethodsConfig(res.data.methods);
        }
      } else {
        setActionNotice({ type: 'error', message: res.error || 'Failed to save withdrawal methods' });
      }
    } catch (err: any) {
      setActionNotice({ type: 'error', message: err.message || 'Request failed' });
    } finally {
      setWithdrawMethodsSaving(false);
    }
  };

  // Toggle Campaign status
  const handleToggleCampaign = async (c: Campaign) => {
    const newStatus = c.status === 'active' ? 'paused' : 'active';
    const res = await apiRequest(`/admin/campaigns/${c._id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.success) {
      setActionNotice({ type: 'success', message: `Campaign "${c.title}" is now ${newStatus}.` });
      fetchAdminData();
    }
  };

  // Toggle User Ban
  const handleToggleUserBan = async (u: User) => {
    const newStatus = u.status === 'banned' ? 'active' : 'banned';
    const res = await apiRequest(`/admin/users/${u.id || (u as any)._id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.success) {
      setActionNotice({ type: 'success', message: `User "${u.email}" is now ${newStatus}.` });
      fetchAdminData();
    }
  };

  // Check role authorization
  const isAdmin = user && user.role === 'admin';

  // Counts
  const pendingPayoutsCount = payoutsList.filter((p) => p.status === 'pending').length;
  const pendingDepositsCount = depositsList.filter((d) => d.status === 'pending').length;

  // 1. Password-only Login Screen Gate
  if (!isAdmin) {
    return (
      <AdminLogin
        passwordInput={passwordInput}
        setPasswordInput={setPasswordInput}
        loginLoading={loginLoading}
        loginError={loginError}
        onLogin={handleAdminLogin}
      />
    );
  }

  // 2. Full Admin Dashboard
  return (
    <div className="container" style={{ padding: '36px 20px', maxWidth: 1260, margin: '0 auto' }}>
      {/* Header, Stats Bar & Navigation */}
      <AdminHeader
        stats={stats}
        dataLoading={dataLoading}
        actionNotice={actionNotice}
        setActionNotice={setActionNotice}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingPayoutsCount={pendingPayoutsCount}
        pendingDepositsCount={pendingDepositsCount}
        campaignsCount={campaignsList.length}
        usersCount={usersList.length}
        onRefresh={fetchAdminData}
        onLogout={handleAdminLogout}
      />

      {/* TAB 1: SYSTEM OVERVIEW & TELEMETRY */}
      {activeTab === 'overview' && (
        <AdminOverviewTab
          stats={stats}
          pendingPayoutsCount={pendingPayoutsCount}
          pendingDepositsCount={pendingDepositsCount}
          setActiveTab={setActiveTab}
          setPayoutFilter={setPayoutFilter}
          setDepositFilter={setDepositFilter}
        />
      )}

      {/* TAB 2: MANUAL PAYOUTS & WITHDRAWAL DESK */}
      {activeTab === 'payouts' && (
        <AdminPayoutsTab
          payoutsList={payoutsList}
          payoutFilter={payoutFilter}
          setPayoutFilter={setPayoutFilter}
          payoutPage={payoutPage}
          setPayoutPage={setPayoutPage}
          pageSize={PAGE_SIZE}
          usdToBdt={usdToBdt}
          copiedId={copiedId}
          handleCopy={handleCopy}
          onOpenApproveModal={(p) => setApproveModalPayout(p)}
          onOpenRejectModal={(p) => setRejectModalPayout(p)}
        />
      )}

      {/* TAB 3: MANUAL DEPOSITS & AD BUDGET DESK */}
      {activeTab === 'deposits' && (
        <AdminDepositsTab
          depositsList={depositsList}
          depositFilter={depositFilter}
          setDepositFilter={setDepositFilter}
          depositPage={depositPage}
          setDepositPage={setDepositPage}
          pageSize={PAGE_SIZE}
          usdToBdt={usdToBdt}
          copiedId={copiedId}
          setCopiedId={setCopiedId}
          onOpenApproveModal={(d) => setApproveModalDeposit(d)}
          onOpenRejectModal={(d) => setRejectModalDeposit(d)}
        />
      )}

      {/* TAB 4: ADVERTISER CAMPAIGNS MODERATION */}
      {activeTab === 'campaigns' && (
        <AdminCampaignsTab
          campaignsList={campaignsList}
          campaignSearch={campaignSearch}
          setCampaignSearch={setCampaignSearch}
          campPage={campPage}
          setCampPage={setCampPage}
          pageSize={PAGE_SIZE}
          onToggleCampaign={handleToggleCampaign}
        />
      )}

      {/* TAB 5: USER DIRECTORY & WALLET BALANCES */}
      {activeTab === 'users' && (
        <AdminUsersTab
          usersList={usersList}
          userSearch={userSearch}
          setUserSearch={setUserSearch}
          userPage={userPage}
          setUserPage={setUserPage}
          pageSize={PAGE_SIZE}
          onToggleUserBan={handleToggleUserBan}
        />
      )}

      {/* TAB 6: PRICING MATRIX, ANTI-SPAM COOLDOWN, CURRENCY RATE & DAILY WATCH LIMIT */}
      {(activeTab === 'pricing' || activeTab === 'settings') && (
        <AdminSettingsTab
          pricingTiers={pricingTiers}
          pricingSaving={pricingSaving}
          handleResetPricing={handleResetPricing}
          handleSavePricing={handleSavePricing}
          handleUpdateTier={handleUpdateTier}
          cooldownConfig={cooldownConfig}
          setCooldownConfig={setCooldownConfig}
          cooldownSaving={cooldownSaving}
          handleSaveCooldown={handleSaveCooldown}
          dollarRateInput={dollarRateInput}
          setDollarRateInput={setDollarRateInput}
          rateUpdating={rateUpdating}
          handleSaveDollarRate={handleSaveDollarRate}
          usdToBdt={usdToBdt}
          dailyLimitConfig={dailyLimitConfig}
          setDailyLimitConfig={setDailyLimitConfig}
          dailyLimitSaving={dailyLimitSaving}
          handleSaveDailyLimit={handleSaveDailyLimit}
        />
      )}

      {/* TAB 7: PAYMENT GATEWAYS, MANUAL DEPOSIT NUMBERS & MINIMUM WITHDRAWAL LIMITS */}
      {activeTab === 'gateways' && (
        <AdminPaymentMethodsTab
          depositMethodsConfig={depositMethodsConfig}
          setDepositMethodsConfig={setDepositMethodsConfig}
          depositMethodsSaving={depositMethodsSaving}
          handleSaveDepositMethods={handleSaveDepositMethods}
          withdrawMethodsConfig={withdrawMethodsConfig}
          setWithdrawMethodsConfig={setWithdrawMethodsConfig}
          withdrawMethodsSaving={withdrawMethodsSaving}
          handleSaveWithdrawMethods={handleSaveWithdrawMethods}
        />
      )}

      {/* MODAL 1 & 2: WITHDRAWAL APPROVE & REJECT MODALS */}
      <AdminPayoutModals
        approveModalPayout={approveModalPayout}
        setApproveModalPayout={setApproveModalPayout}
        approveTxnRef={approveTxnRef}
        setApproveTxnRef={setApproveTxnRef}
        approveNotes={approveNotes}
        setApproveNotes={setApproveNotes}
        approveLoading={approveLoading}
        handleConfirmApprove={handleConfirmApprove}
        usdToBdt={usdToBdt}
        rejectModalPayout={rejectModalPayout}
        setRejectModalPayout={setRejectModalPayout}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
        rejectLoading={rejectLoading}
        handleConfirmReject={handleConfirmReject}
      />

      {/* MODAL 3 & 4: DEPOSIT APPROVE & REJECT MODALS */}
      <AdminDepositModals
        approveModalDeposit={approveModalDeposit}
        setApproveModalDeposit={setApproveModalDeposit}
        approveDepositNotes={approveDepositNotes}
        setApproveDepositNotes={setApproveDepositNotes}
        approveDepositLoading={approveDepositLoading}
        handleConfirmApproveDeposit={handleConfirmApproveDeposit}
        rejectModalDeposit={rejectModalDeposit}
        setRejectModalDeposit={setRejectModalDeposit}
        rejectDepositReason={rejectDepositReason}
        setRejectDepositReason={setRejectDepositReason}
        rejectDepositLoading={rejectDepositLoading}
        handleConfirmRejectDeposit={handleConfirmRejectDeposit}
      />
    </div>
  );
};
