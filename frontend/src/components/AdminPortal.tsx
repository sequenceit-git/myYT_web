import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Video,
  DollarSign,
  CheckCircle2,
  XCircle,
  Activity,
  RefreshCw,
  Clock,
  TrendingUp,
  Lock,
  LogOut,
  AlertCircle,
  PlaySquare,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  ExternalLink,
  Copy,
  Check,
  Search,
  Eye,
} from 'lucide-react';
import { User, Campaign, Payout } from '../types';
import { apiRequest, setAuthToken, clearAuthToken } from '../api';
import { useExchangeRate } from '../context/ExchangeRateContext';

interface AdminPortalProps {
  user: User | null;
  onRefreshUser?: () => Promise<void> | void;
}

// Map payment methods to official brand logos
const getPaymentLogo = (method: string): string => {
  switch (method?.toLowerCase()) {
    case 'bkash':
      return '/payment-methods/bkash.svg';
    case 'nagad':
      return '/payment-methods/nagad.svg';
    case 'faucetpay':
      return '/payment-methods/faucetpay.svg';
    case 'crypto':
    case 'usdt':
      return '/payment-methods/crypto.svg';
    case 'webmoney':
      return '/payment-methods/webmoney.svg';
    default:
      return '/payment-methods/crypto.svg';
  }
};

export const AdminPortal: React.FC<AdminPortalProps> = ({ user, onRefreshUser }) => {
  // Authentication & Session
  const [passwordInput, setPasswordInput] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'payouts' | 'campaigns' | 'users'>('overview');
  const [payoutFilter, setPayoutFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');

  // Telemetry & Data lists
  const [stats, setStats] = useState<any>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [campaignsList, setCampaignsList] = useState<Campaign[]>([]);
  const [payoutsList, setPayoutsList] = useState<Payout[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Search filters
  const [userSearch, setUserSearch] = useState('');
  const [campaignSearch, setCampaignSearch] = useState('');

  // Pagination states
  const [payoutPage, setPayoutPage] = useState(1);
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
      const [statsRes, usersRes, campRes, payRes] = await Promise.all([
        apiRequest<any>('/admin/stats'),
        apiRequest<User[]>('/admin/users'),
        apiRequest<Campaign[]>('/admin/campaigns'),
        apiRequest<Payout[]>('/admin/payouts'),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (usersRes.success) setUsersList(usersRes.data || []);
      if (campRes.success) setCampaignsList(campRes.data || []);
      if (payRes.success) setPayoutsList(payRes.data || []);
    } catch {
      // Ignore network errors
    } finally {
      setDataLoading(false);
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

  // Pagination component
  const renderPagination = (
    currentPage: number,
    totalPages: number,
    totalItems: number,
    pageSize: number,
    onPageChange: (page: number) => void,
    itemLabel: string
  ) => {
    if (totalItems <= pageSize) return null;
    const startIdx = (currentPage - 1) * pageSize + 1;
    const endIdx = Math.min(currentPage * pageSize, totalItems);

    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          paddingTop: 16,
          marginTop: 10,
          borderTop: '1px solid #f1f5f9',
          fontSize: '0.82rem',
          color: '#64748b',
        }}
      >
        <div>
          Showing <strong>{startIdx}</strong> to <strong>{endIdx}</strong> of <strong>{totalItems}</strong> {itemLabel}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="btn btn-ghost"
            style={{
              padding: '4px 10px',
              fontSize: '0.78rem',
              borderRadius: 8,
              opacity: currentPage <= 1 ? 0.4 : 1,
              cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <ChevronLeft size={14} /> Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
            .map((pageNum, idx, arr) => {
              const prev = arr[idx - 1];
              const showEllipsis = prev && pageNum - prev > 1;
              return (
                <React.Fragment key={pageNum}>
                  {showEllipsis && <span style={{ padding: '0 4px', color: '#94a3b8' }}>...</span>}
                  <button
                    type="button"
                    onClick={() => onPageChange(pageNum)}
                    className="btn btn-ghost"
                    style={{
                      padding: '4px 10px',
                      fontSize: '0.8rem',
                      borderRadius: 8,
                      fontWeight: pageNum === currentPage ? 700 : 500,
                      background: pageNum === currentPage ? '#e0f2fe' : 'transparent',
                      color: pageNum === currentPage ? 'var(--primary-neon)' : '#64748b',
                      border: pageNum === currentPage ? '1px solid rgba(14, 165, 233, 0.4)' : '1px solid transparent',
                    }}
                  >
                    {pageNum}
                  </button>
                </React.Fragment>
              );
            })}

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="btn btn-ghost"
            style={{
              padding: '4px 10px',
              fontSize: '0.78rem',
              borderRadius: 8,
              opacity: currentPage >= totalPages ? 0.4 : 1,
              cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>
    );
  };

  // SVG Curve for Watch Hours
  const renderWatchHoursCurve = (data: number[], labels: string[]) => {
    if (!data || data.length < 2) return null;
    const width = 520;
    const height = 160;
    const paddingX = 40;
    const paddingY = 25;
    const highest = Math.max(...data, 0);
    const maxVal = highest > 0 ? highest * 1.3 : 10;
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
          <linearGradient id="adminWatchGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary-neon)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--primary-neon)" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        <line x1={paddingX} y1={height - 20} x2={width - paddingX} y2={height - 20} stroke="#e2e8f0" strokeWidth="1" />
        <path d={areaD} fill="url(#adminWatchGrad)" />
        <path d={pathD} fill="none" stroke="var(--primary-neon)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {points.map((pt, i) => (
          <g key={i}>
            <circle cx={pt.x} cy={pt.y} r={4} fill="#ffffff" stroke="var(--primary-neon)" strokeWidth="2.5" />
            <text x={pt.x} y={height - 5} textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="JetBrains Mono, monospace">
              {labels[i] || `D${i + 1}`}
            </text>
            <text x={pt.x} y={pt.y - 8} textAnchor="middle" fill="#0f172a" fontSize="10" fontWeight="700" fontFamily="JetBrains Mono, monospace">
              {pt.val}h
            </text>
          </g>
        ))}
      </svg>
    );
  };

  // SVG Bar Chart for Daily Ad Spend
  const renderSpendBarChart = (data: number[], labels: string[]) => {
    if (!data || data.length < 2) return null;
    const width = 520;
    const height = 160;
    const paddingX = 40;
    const paddingY = 25;
    const highest = Math.max(...data, 0);
    const maxVal = highest > 0 ? highest * 1.3 : 10;
    const barWidth = 28;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        <line x1={paddingX} y1={height - 20} x2={width - paddingX} y2={height - 20} stroke="#e2e8f0" strokeWidth="1" />
        {data.map((val, i) => {
          const x = paddingX + i * ((width - paddingX * 2) / (data.length - 1)) - barWidth / 2;
          const barHeight = ((val) / maxVal) * (height - paddingY * 2);
          const y = height - 20 - barHeight;

          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, 4)}
                rx={6}
                fill="url(#adminSpendGrad)"
              />
              <text x={x + barWidth / 2} y={height - 5} textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="JetBrains Mono, monospace">
                {labels[i] || `D${i + 1}`}
              </text>
              <text x={x + barWidth / 2} y={y - 6} textAnchor="middle" fill="#059669" fontSize="10" fontWeight="700" fontFamily="JetBrains Mono, monospace">
                ${val}
              </text>
            </g>
          );
        })}
        <defs>
          <linearGradient id="adminSpendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
      </svg>
    );
  };

  // =========================================================================
  // 1. PASSWORD-ONLY SECURITY GATE (WHEN NOT AUTHENTICATED AS ADMIN)
  // =========================================================================
  if (!user || user.role !== 'admin') {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div
          className="glass-card"
          style={{
            maxWidth: 420,
            width: '100%',
            padding: '36px 30px',
            borderRadius: 20,
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
            border: '1.5px solid rgba(14, 165, 233, 0.25)',
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 18,
              background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
              color: 'var(--primary-neon)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px',
              border: '1.5px solid rgba(14, 165, 233, 0.35)',
              boxShadow: '0 8px 20px rgba(14, 165, 233, 0.2)',
            }}
          >
            <Shield size={32} />
          </div>

          <h2 className="font-display" style={{ fontSize: '1.75rem', color: '#0f172a', margin: 0, letterSpacing: '0.02em' }}>
            ADMIN ACCESS
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.86rem', marginTop: 6, marginBottom: 22 }}>
            Enter administrator security password to unlock control surface.
          </p>

          {loginError && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 10,
                padding: '10px 14px',
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: '#b91c1c',
                fontSize: '0.84rem',
                textAlign: 'left',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                placeholder="Enter Admin Password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="input-field"
                style={{
                  padding: '13px 16px',
                  fontSize: '0.98rem',
                  letterSpacing: '0.05em',
                  borderRadius: 12,
                  textAlign: 'center',
                }}
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading || !passwordInput}
              className="btn btn-neon glow-neon"
              style={{
                padding: '13px',
                fontSize: '0.96rem',
                borderRadius: 12,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <Lock size={16} />
              {loginLoading ? 'Authenticating...' : 'Unlock Admin Panel'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Filter payouts based on sub-filter
  const filteredPayouts = payoutsList.filter((p) => {
    if (payoutFilter === 'all') return true;
    return p.status === payoutFilter;
  });

  const pendingPayoutsCount = payoutsList.filter((p) => p.status === 'pending').length;

  // Filter campaigns based on search
  const filteredCampaigns = campaignsList.filter((c) => {
    if (!campaignSearch) return true;
    const q = campaignSearch.toLowerCase();
    return c.title?.toLowerCase().includes(q) || c.videoId?.toLowerCase().includes(q);
  });

  // Filter users based on search
  const filteredUsers = usersList.filter((u) => {
    if (!userSearch) return true;
    const q = userSearch.toLowerCase();
    return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
  });

  // =========================================================================
  // 2. UNLOCKED ADMIN CONTROL DESK (SIMPLE, MINIMAL, LESS TEXT)
  // =========================================================================
  return (
    <div style={{ maxWidth: 1350, margin: '24px auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Admin Header Bar */}
      <div
        className="glass-card"
        style={{
          padding: '18px 24px',
          borderRadius: 18,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 14,
          border: '1.5px solid rgba(14, 165, 233, 0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(14, 165, 233, 0.3)',
            }}
          >
            <Shield size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 className="font-display" style={{ fontSize: '1.6rem', color: '#0f172a', margin: 0 }}>
                ADMIN CONTROL DESK
              </h1>
              <span className="badge-pill badge-cyan" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                MASTER PANEL
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>
              Manual payouts desk, platform watch hours, ad spend, and user control.
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Simulated Concurrency Pill */}
          <div
            style={{
              background: '#f0fdf4',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              padding: '6px 12px',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} className="pulse-neon" />
            <span className="font-mono" style={{ fontSize: '0.76rem', fontWeight: 700, color: '#059669' }}>
              {stats?.simulatedConcurrency?.toLocaleString() || '4,250'} LIVE
            </span>
          </div>

          <button
            onClick={fetchAdminData}
            className="btn btn-ghost"
            style={{ padding: '7px 14px', fontSize: '0.82rem', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshCw size={14} className={dataLoading ? 'animate-spin' : ''} /> Refresh
          </button>

          <button
            onClick={handleAdminLogout}
            className="btn btn-ghost"
            style={{ padding: '7px 14px', fontSize: '0.82rem', borderRadius: 10, color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.25)', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <LogOut size={14} /> Exit
          </button>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionNotice && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: 12,
            background: actionNotice.type === 'success' ? '#f0fdf4' : '#fef2f2',
            border: actionNotice.type === 'success' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
            color: actionNotice.type === 'success' ? '#059669' : '#b91c1c',
            fontSize: '0.88rem',
            fontWeight: 600,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>{actionNotice.message}</span>
          <button
            onClick={() => setActionNotice(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Sub-Tabs Selector (Mobile & Tablet touch-scrollable) */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          borderBottom: '1.5px solid #e2e8f0',
          paddingBottom: 10,
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
        }}
      >
        <button
          onClick={() => setActiveTab('overview')}
          className="btn"
          style={{
            padding: '8px 16px',
            borderRadius: 10,
            fontSize: '0.84rem',
            fontWeight: 700,
            background: activeTab === 'overview' ? 'var(--primary-neon)' : 'transparent',
            color: activeTab === 'overview' ? '#ffffff' : '#64748b',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          <BarChart3 size={15} /> Overview & Graphs
        </button>

        <button
          onClick={() => setActiveTab('payouts')}
          className="btn"
          style={{
            padding: '8px 16px',
            borderRadius: 10,
            fontSize: '0.84rem',
            fontWeight: 700,
            background: activeTab === 'payouts' ? 'var(--primary-neon)' : 'transparent',
            color: activeTab === 'payouts' ? '#ffffff' : '#64748b',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          <DollarSign size={15} /> Withdrawal Desk
          {pendingPayoutsCount > 0 && (
            <span
              style={{
                background: activeTab === 'payouts' ? '#ffffff' : '#d97706',
                color: activeTab === 'payouts' ? '#0284c7' : '#ffffff',
                padding: '1px 6px',
                borderRadius: 9999,
                fontSize: '0.7rem',
                fontWeight: 800,
              }}
            >
              {pendingPayoutsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('campaigns')}
          className="btn"
          style={{
            padding: '8px 16px',
            borderRadius: 10,
            fontSize: '0.84rem',
            fontWeight: 700,
            background: activeTab === 'campaigns' ? 'var(--primary-neon)' : 'transparent',
            color: activeTab === 'campaigns' ? '#ffffff' : '#64748b',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          <Video size={15} /> Campaigns ({campaignsList.length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className="btn"
          style={{
            padding: '8px 16px',
            borderRadius: 10,
            fontSize: '0.84rem',
            fontWeight: 700,
            background: activeTab === 'users' ? 'var(--primary-neon)' : 'transparent',
            color: activeTab === 'users' ? '#ffffff' : '#64748b',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          <Users size={15} /> User Accounts ({usersList.length})
        </button>
      </div>

      {/* =========================================================================
          TAB 1: OVERVIEW & REAL SVG GRAPHS (WATCH HOURS & CREATOR SPEND)
          ========================================================================= */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Dynamic Dollar Exchange Rate Controller */}
          <div
            className="glass-card"
            style={{
              padding: '16px 20px',
              borderRadius: 16,
              border: '1.5px solid rgba(14, 165, 233, 0.35)',
              background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 14,
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span className="badge-pill badge-neon" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                  Live Dollar Pricing Engine
                </span>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Changes update pricing across all viewer cashouts & creator deposit calculators
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                  1 USD = <span style={{ color: 'var(--primary-neon)' }}>৳{usdToBdt} BDT</span>
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>(Platform Exchange Rate)</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Presets:</span>
                {[110, 115, 120, 122, 125].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setDollarRateInput(String(preset));
                      handleSaveDollarRate(preset);
                    }}
                    disabled={rateUpdating}
                    className="btn btn-ghost"
                    style={{
                      padding: '4px 8px',
                      fontSize: '0.74rem',
                      borderRadius: 8,
                      background: usdToBdt === preset ? '#e0f2fe' : '#ffffff',
                      borderColor: usdToBdt === preset ? 'var(--primary-neon)' : '#cbd5e1',
                      color: usdToBdt === preset ? 'var(--primary-neon)' : '#475569',
                      fontWeight: usdToBdt === preset ? 700 : 500,
                    }}
                  >
                    ৳{preset}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <input
                  type="number"
                  value={dollarRateInput}
                  onChange={(e) => setDollarRateInput(e.target.value)}
                  placeholder="e.g. 120"
                  style={{
                    width: 80,
                    padding: '6px 10px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    fontFamily: 'JetBrains Mono, monospace',
                    textAlign: 'center',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleSaveDollarRate()}
                  disabled={rateUpdating || !dollarRateInput}
                  className="btn btn-neon glow-neon"
                  style={{ padding: '6px 14px', fontSize: '0.76rem', borderRadius: 8 }}
                >
                  {rateUpdating ? 'Saving...' : 'Set Dollar Price'}
                </button>
              </div>
            </div>
          </div>

          {/* 8 Primary KPI Metric Cards (Responsive Grid) */}
          <div className="responsive-kpi-grid">
            {/* 1. Watch Hours */}
            <div className="glass-card responsive-kpi-card" style={{ padding: '18px', borderRadius: 16, border: '1.5px solid rgba(14, 165, 233, 0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--primary-neon)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Total Watch Time
                </span>
                <Clock size={16} color="var(--primary-neon)" />
              </div>
              <div className="font-mono responsive-kpi-val" style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--primary-neon)', marginTop: 6, lineHeight: 1 }}>
                {stats?.totalWatchHours || 0} <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>hrs</span>
              </div>
              <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: 4 }}>
                Real viewer engagement
              </div>
            </div>

            {/* 2. Total Views */}
            <div className="glass-card responsive-kpi-card" style={{ padding: '18px', borderRadius: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="font-mono" style={{ fontSize: '0.78rem', color: '#059669', textTransform: 'uppercase', fontWeight: 700 }}>
                  Views Delivered
                </span>
                <Eye size={16} color="#059669" />
              </div>
              <div className="font-mono responsive-kpi-val" style={{ fontSize: '1.9rem', fontWeight: 800, color: '#059669', marginTop: 6, lineHeight: 1 }}>
                {(stats?.totalViewsDelivered || 0).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: 4 }}>
                Official embedded player views
              </div>
            </div>

            {/* 3. Total Spend */}
            <div className="glass-card responsive-kpi-card" style={{ padding: '18px', borderRadius: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="font-mono" style={{ fontSize: '0.78rem', color: '#7c3aed', textTransform: 'uppercase', fontWeight: 700 }}>
                  Creator Spend
                </span>
                <DollarSign size={16} color="#7c3aed" />
              </div>
              <div className="font-mono responsive-kpi-val" style={{ fontSize: '1.9rem', fontWeight: 800, color: '#7c3aed', marginTop: 6, lineHeight: 1 }}>
                ${(stats?.totalSpentUsd || 0).toFixed(2)}
              </div>
              <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: 4 }}>
                Campaign budget consumed
              </div>
            </div>

            {/* 4. Total Deposits */}
            <div className="glass-card responsive-kpi-card" style={{ padding: '18px', borderRadius: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="font-mono" style={{ fontSize: '0.78rem', color: '#0284c7', textTransform: 'uppercase', fontWeight: 700 }}>
                  Total Deposits
                </span>
                <TrendingUp size={16} color="#0284c7" />
              </div>
              <div className="font-mono responsive-kpi-val" style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0284c7', marginTop: 6, lineHeight: 1 }}>
                ${(stats?.totalDepositsUsd || 0).toFixed(2)}
              </div>
              <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: 4 }}>
                Deposited via MFS & Crypto
              </div>
            </div>

            {/* 5. Total Paid Out */}
            <div className="glass-card responsive-kpi-card" style={{ padding: '18px', borderRadius: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="font-mono" style={{ fontSize: '0.78rem', color: '#7c3aed', textTransform: 'uppercase', fontWeight: 700 }}>
                  Total Paid Out
                </span>
                <CheckCircle2 size={16} color="#7c3aed" />
              </div>
              <div className="font-mono responsive-kpi-val" style={{ fontSize: '1.9rem', fontWeight: 800, color: '#7c3aed', marginTop: 6, lineHeight: 1 }}>
                ${(stats?.totalPayoutsUsd || 0).toFixed(2)}
              </div>
              <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: 4 }}>
                Disbursed to viewers
              </div>
            </div>

            {/* 6. Pending Withdrawals */}
            <div
              className="glass-card responsive-kpi-card"
              style={{
                padding: '18px',
                borderRadius: 16,
                border: pendingPayoutsCount > 0 ? '1.5px solid #d97706' : '1px solid #e2e8f0',
                background: pendingPayoutsCount > 0 ? '#fffbeb' : '#ffffff',
                cursor: 'pointer',
              }}
              onClick={() => {
                setActiveTab('payouts');
                setPayoutFilter('pending');
              }}
              title="Click to view pending requests"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="font-mono" style={{ fontSize: '0.78rem', color: '#d97706', textTransform: 'uppercase', fontWeight: 700 }}>
                  Pending Payouts
                </span>
                <AlertCircle size={16} color="#d97706" />
              </div>
              <div className="font-mono responsive-kpi-val" style={{ fontSize: '1.9rem', fontWeight: 800, color: '#d97706', marginTop: 6, lineHeight: 1 }}>
                ${(stats?.pendingPayoutsUsd || 0).toFixed(2)}
              </div>
              <div style={{ fontSize: '0.76rem', color: '#b45309', marginTop: 4, fontWeight: 600 }}>
                {stats?.pendingPayoutsCount || 0} queued requests →
              </div>
            </div>

            {/* 7. Active Campaigns */}
            <div className="glass-card responsive-kpi-card" style={{ padding: '18px', borderRadius: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="font-mono" style={{ fontSize: '0.78rem', color: '#0f172a', textTransform: 'uppercase', fontWeight: 700 }}>
                  Active Campaigns
                </span>
                <Video size={16} color="var(--primary-neon)" />
              </div>
              <div className="font-mono responsive-kpi-val" style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a', marginTop: 6, lineHeight: 1 }}>
                {stats?.activeCampaigns || 0}
              </div>
              <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: 4 }}>
                Of {stats?.totalCampaigns || 0} total campaigns
              </div>
            </div>

            {/* 8. Total Registered Users */}
            <div className="glass-card responsive-kpi-card" style={{ padding: '18px', borderRadius: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="font-mono" style={{ fontSize: '0.78rem', color: '#0f172a', textTransform: 'uppercase', fontWeight: 700 }}>
                  Total Users
                </span>
                <Users size={16} color="var(--primary-neon)" />
              </div>
              <div className="font-mono responsive-kpi-val" style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a', marginTop: 6, lineHeight: 1 }}>
                {stats?.totalUsers || 0}
              </div>
              <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: 4 }}>
                Watchers & Digital Creators
              </div>
            </div>
          </div>

          {/* 2 Visual Graphs Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: 16 }}>
            {/* Graph 1: Daily Watch Hours (Last 7 Days) */}
            <div className="glass-card" style={{ padding: '20px', borderRadius: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Clock size={18} color="var(--primary-neon)" />
                  <h3 className="font-display" style={{ fontSize: '1.15rem', color: '#0f172a', margin: 0 }}>
                    Daily Watch Hours Trend
                  </h3>
                </div>
                <span className="badge-pill badge-cyan" style={{ fontSize: '0.7rem' }}>Last 7 Days</span>
              </div>
              {stats?.dailyWatchHours ? (
                renderWatchHoursCurve(
                  stats.dailyWatchHours || [0, 0, 0, 0, 0, 0, 0],
                  stats.dayLabels || ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                )
              ) : (
                <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>Loading graph...</div>
              )}
            </div>

            {/* Graph 2: Daily Creator Spend ($ USD) */}
            <div className="glass-card" style={{ padding: '20px', borderRadius: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <TrendingUp size={18} color="#059669" />
                  <h3 className="font-display" style={{ fontSize: '1.15rem', color: '#0f172a', margin: 0 }}>
                    Daily Creator Ad Spend ($ USD)
                  </h3>
                </div>
                <span className="badge-pill" style={{ background: '#ecfdf5', color: '#059669', fontSize: '0.7rem' }}>Last 7 Days</span>
              </div>
              {stats?.dailySpend ? (
                renderSpendBarChart(
                  stats.dailySpend || [0, 0, 0, 0, 0, 0, 0],
                  stats.dayLabels || ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                )
              ) : (
                <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>Loading graph...</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: MANUAL WITHDRAWAL DESK (PAY & APPROVE / REJECT)
          ========================================================================= */}
      {activeTab === 'payouts' && (
        <div className="glass-card" style={{ padding: '22px', borderRadius: 18 }}>
          {/* Header with Sub-filter Pills */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 className="font-display" style={{ fontSize: '1.35rem', color: '#0f172a', margin: 0 }}>
                WITHDRAWAL DESK (MANUAL PAYOUTS)
              </h2>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>
                Review requested cashouts, disburse payment manually via MFS/Crypto, and confirm reference.
              </div>
            </div>

            {/* Sub-Filter Tabs (Touch-Scrollable on Mobile) */}
            <div
              className="mobile-scroll-x"
              style={{
                display: 'flex',
                gap: 6,
                background: '#f1f5f9',
                padding: 4,
                borderRadius: 12,
                maxWidth: '100%',
                overflowX: 'auto',
              }}
            >
              {(['pending', 'approved', 'rejected', 'all'] as const).map((filter) => {
                const isSelected = payoutFilter === filter;
                const count = payoutsList.filter((p) => filter === 'all' || p.status === filter).length;
                return (
                  <button
                    key={filter}
                    onClick={() => {
                      setPayoutFilter(filter);
                      setPayoutPage(1);
                    }}
                    style={{
                      padding: '6px 14px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      borderRadius: 8,
                      border: 'none',
                      cursor: 'pointer',
                      background: isSelected ? '#ffffff' : 'transparent',
                      color: isSelected ? 'var(--primary-neon)' : '#64748b',
                      boxShadow: isSelected ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                      textTransform: 'uppercase',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      flexShrink: 0,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span>{filter}</span>
                    <span style={{ fontSize: '0.72rem', opacity: 0.75 }}>({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {!filteredPayouts.length ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '0.92rem' }}>
              No {payoutFilter !== 'all' ? payoutFilter : ''} withdrawal records found.
            </div>
          ) : (
            <>
              <div className="responsive-table-wrapper">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1.5px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                      <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.76rem', fontWeight: 700 }}>Method</th>
                      <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.76rem', fontWeight: 700 }}>User</th>
                      <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.76rem', fontWeight: 700 }}>Amount</th>
                      <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.76rem', fontWeight: 700 }}>Recipient Account</th>
                      <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.76rem', fontWeight: 700 }}>Status</th>
                      <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.76rem', fontWeight: 700 }}>Date</th>
                      <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.76rem', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayouts
                      .slice((payoutPage - 1) * PAGE_SIZE, payoutPage * PAGE_SIZE)
                      .map((p) => {
                        const isBDT = p.method === 'bkash' || p.method === 'nagad';
                        const logo = getPaymentLogo(p.method);

                        return (
                          <tr key={p._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            {/* Method with Official Brand Logo */}
                            <td style={{ padding: '10px 12px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div
                                  style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: 6,
                                    background: '#ffffff',
                                    border: '1px solid #e2e8f0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: 4,
                                    flexShrink: 0,
                                  }}
                                >
                                  <img src={logo} alt={p.method} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                </div>
                                <span style={{ fontWeight: 700, color: '#0f172a', textTransform: 'capitalize' }}>
                                  {p.method}
                                </span>
                              </div>
                            </td>

                            {/* User details */}
                            <td style={{ padding: '10px 12px' }}>
                              <div style={{ fontWeight: 600, color: '#0f172a' }}>
                                {p.viewerId?.name || 'Viewer User'}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                {p.viewerId?.email}
                              </div>
                            </td>

                            {/* Amount */}
                            <td className="font-mono" style={{ padding: '10px 12px' }}>
                              <div style={{ fontWeight: 700, color: '#ef4444', fontSize: '0.94rem' }}>
                                -${p.amount.toFixed(2)}
                              </div>
                              {isBDT && (
                                <div style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 600 }}>
                                  ≈ ৳{(p.amount * usdToBdt).toLocaleString()} BDT
                                </div>
                              )}
                            </td>

                            {/* Recipient Account Details (Copyable) */}
                            <td style={{ padding: '10px 12px' }}>
                              <div
                                onClick={() => handleCopy(p.accountDetails, p._id)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  background: '#f8fafc',
                                  padding: '4px 10px',
                                  borderRadius: 8,
                                  border: '1px solid #e2e8f0',
                                  cursor: 'pointer',
                                }}
                                title="Click to copy recipient account"
                              >
                                <span className="font-mono" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>
                                  {p.accountDetails}
                                </span>
                                {copiedId === p._id ? <Check size={12} color="#059669" /> : <Copy size={12} color="#64748b" />}
                              </div>
                            </td>

                            {/* Status */}
                            <td style={{ padding: '10px 12px' }}>
                              <span
                                className="badge-pill"
                                style={{
                                  padding: '2px 8px',
                                  fontSize: '0.72rem',
                                  textTransform: 'uppercase',
                                  background:
                                    p.status === 'approved'
                                      ? '#ecfdf5'
                                      : p.status === 'pending'
                                      ? '#fffbeb'
                                      : '#fef2f2',
                                  color:
                                    p.status === 'approved'
                                      ? '#059669'
                                      : p.status === 'pending'
                                      ? '#d97706'
                                      : '#ef4444',
                                  border:
                                    p.status === 'approved'
                                      ? '1px solid rgba(16,185,129,0.3)'
                                      : p.status === 'pending'
                                      ? '1px solid rgba(217,119,6,0.3)'
                                      : '1px solid rgba(239,68,68,0.3)',
                                }}
                              >
                                {p.status}
                              </span>
                            </td>

                            {/* Date */}
                            <td style={{ padding: '10px 12px', color: '#64748b' }}>
                              {new Date(p.createdAt || p.requestedAt || Date.now()).toLocaleDateString()}
                            </td>

                            {/* Actions (Pay & Approve / Reject) */}
                            <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                              {p.status === 'pending' ? (
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                                  <button
                                    onClick={() => {
                                      setApproveModalPayout(p);
                                      setApproveTxnRef('');
                                      setApproveNotes('');
                                    }}
                                    className="btn btn-neon glow-neon"
                                    style={{ padding: '5px 12px', fontSize: '0.76rem', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 4 }}
                                  >
                                    <CheckCircle2 size={13} /> Pay & Approve
                                  </button>

                                  <button
                                    onClick={() => {
                                      setRejectModalPayout(p);
                                      setRejectReason('');
                                    }}
                                    className="btn btn-ghost"
                                    style={{
                                      padding: '5px 10px',
                                      fontSize: '0.76rem',
                                      borderRadius: 8,
                                      color: '#ef4444',
                                      borderColor: 'rgba(239, 68, 68, 0.3)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 4,
                                    }}
                                  >
                                    <XCircle size={13} /> Reject
                                  </button>
                                </div>
                              ) : (
                                <span className="font-mono" style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                  {p.transactionRef ? `Ref: ${p.transactionRef}` : p.adminNotes || 'Settled'}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              {renderPagination(
                payoutPage,
                Math.ceil(filteredPayouts.length / PAGE_SIZE) || 1,
                filteredPayouts.length,
                PAGE_SIZE,
                setPayoutPage,
                'payout requests'
              )}
            </>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: CAMPAIGNS MODERATION
          ========================================================================= */}
      {activeTab === 'campaigns' && (
        <div className="glass-card" style={{ padding: '22px', borderRadius: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 className="font-display" style={{ fontSize: '1.35rem', color: '#0f172a', margin: 0 }}>
                ALL VIDEO CAMPAIGNS ({campaignsList.length})
              </h2>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>
                Monitor active promotions, video watch retention, and pause problematic links.
              </div>
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', width: 240 }}>
              <input
                type="text"
                placeholder="Search campaigns..."
                value={campaignSearch}
                onChange={(e) => { setCampaignSearch(e.target.value); setCampPage(1); }}
                className="input-field"
                style={{ padding: '7px 12px 7px 32px', fontSize: '0.82rem', borderRadius: 8 }}
              />
              <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: '#94a3b8' }} />
            </div>
          </div>

          {!filteredCampaigns.length ? (
            <div style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>No campaigns found.</div>
          ) : (
            <>
              <div className="responsive-table-wrapper">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1.5px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                      <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.76rem', fontWeight: 700 }}>Video</th>
                      <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.76rem', fontWeight: 700 }}>Duration</th>
                      <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.76rem', fontWeight: 700 }}>Progress</th>
                      <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.76rem', fontWeight: 700 }}>Cost</th>
                      <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.76rem', fontWeight: 700 }}>Status</th>
                      <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.76rem', fontWeight: 700, textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCampaigns
                      .slice((campPage - 1) * PAGE_SIZE, campPage * PAGE_SIZE)
                      .map((c) => (
                        <tr key={c._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px 12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <img
                                src={c.thumbnailUrl || `https://img.youtube.com/vi/${c.videoId}/default.jpg`}
                                alt="thumb"
                                style={{ width: 50, height: 34, borderRadius: 6, objectFit: 'cover', background: '#000' }}
                              />
                              <div>
                                <div style={{ fontWeight: 600, color: '#0f172a', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {c.title || `Video ${c.videoId}`}
                                </div>
                                <a
                                  href={`https://youtube.com/watch?v=${c.videoId}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{ fontSize: '0.74rem', color: 'var(--primary-neon)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 3 }}
                                >
                                  Watch on YouTube <ExternalLink size={10} />
                                </a>
                              </div>
                            </div>
                          </td>
                          <td className="font-mono" style={{ padding: '10px 12px', color: '#0f172a' }}>{c.watchDurationSec}s</td>
                          <td className="font-mono" style={{ padding: '10px 12px', color: 'var(--primary-neon)', fontWeight: 700 }}>
                            {c.viewsDelivered?.toLocaleString() || 0} / {c.targetViews?.toLocaleString() || 0}
                          </td>
                          <td className="font-mono" style={{ padding: '10px 12px', color: '#0f172a' }}>${c.totalCost.toFixed(2)}</td>
                          <td style={{ padding: '10px 12px' }}>
                            <span
                              className="badge-pill"
                              style={{
                                padding: '2px 8px',
                                fontSize: '0.72rem',
                                textTransform: 'uppercase',
                                background: c.status === 'active' ? '#ecfdf5' : '#f1f5f9',
                                color: c.status === 'active' ? '#059669' : '#64748b',
                              }}
                            >
                              {c.status}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                            <button
                              onClick={() => handleToggleCampaign(c)}
                              className="btn btn-ghost"
                              style={{ padding: '4px 10px', fontSize: '0.76rem', borderRadius: 6 }}
                            >
                              {c.status === 'active' ? 'Force Pause' : 'Resume'}
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {renderPagination(
                campPage,
                Math.ceil(filteredCampaigns.length / PAGE_SIZE) || 1,
                filteredCampaigns.length,
                PAGE_SIZE,
                setCampPage,
                'campaigns'
              )}
            </>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 4: USER ACCOUNTS
          ========================================================================= */}
      {activeTab === 'users' && (
        <div className="glass-card" style={{ padding: '22px', borderRadius: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 className="font-display" style={{ fontSize: '1.35rem', color: '#0f172a', margin: 0 }}>
                USER DIRECTORY ({usersList.length})
              </h2>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>
                Manage registered viewers, campaigners, and balance standing.
              </div>
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', width: 240 }}>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={userSearch}
                onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }}
                className="input-field"
                style={{ padding: '7px 12px 7px 32px', fontSize: '0.82rem', borderRadius: 8 }}
              />
              <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: '#94a3b8' }} />
            </div>
          </div>

          {!filteredUsers.length ? (
            <div style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>No users found.</div>
          ) : (
            <>
              <div className="responsive-table-wrapper">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1.5px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                      <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.76rem', fontWeight: 700 }}>User</th>
                      <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.76rem', fontWeight: 700 }}>Role</th>
                      <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.76rem', fontWeight: 700 }}>Balance</th>
                      <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.76rem', fontWeight: 700 }}>Total Earned</th>
                      <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.76rem', fontWeight: 700 }}>Status</th>
                      <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.76rem', fontWeight: 700, textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers
                      .slice((userPage - 1) * PAGE_SIZE, userPage * PAGE_SIZE)
                      .map((u) => (
                        <tr key={u.id || (u as any)._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px 12px' }}>
                            <div style={{ fontWeight: 600, color: '#0f172a' }}>{u.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{u.email}</div>
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <span className="badge-pill badge-cyan" style={{ padding: '2px 8px', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                              {u.role}
                            </span>
                          </td>
                          <td className="font-mono" style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--primary-neon)' }}>
                            ${(u.balance || 0).toFixed(4)}
                          </td>
                          <td className="font-mono" style={{ padding: '10px 12px', color: '#059669', fontWeight: 600 }}>
                            ${(u.totalEarned || 0).toFixed(4)}
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <span
                              style={{
                                color: u.status === 'banned' ? '#ef4444' : '#059669',
                                fontWeight: 700,
                                fontSize: '0.8rem',
                                textTransform: 'uppercase',
                              }}
                            >
                              {u.status || 'active'}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                            <button
                              onClick={() => handleToggleUserBan(u)}
                              className="btn btn-ghost"
                              style={{
                                padding: '4px 10px',
                                fontSize: '0.76rem',
                                borderRadius: 6,
                                color: u.status === 'banned' ? 'var(--primary-neon)' : '#ef4444',
                              }}
                            >
                              {u.status === 'banned' ? 'Unban' : 'Ban'}
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {renderPagination(
                userPage,
                Math.ceil(filteredUsers.length / PAGE_SIZE) || 1,
                filteredUsers.length,
                PAGE_SIZE,
                setUserPage,
                'users'
              )}
            </>
          )}
        </div>
      )}

      {/* =========================================================================
          MODAL 1: PAY & APPROVE WITHDRAWAL
          ========================================================================= */}
      {approveModalPayout && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: 20,
          }}
        >
          <div
            className="glass-card modal-card"
            style={{
              maxWidth: 480,
              width: '100%',
              padding: 28,
              borderRadius: 20,
              boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
              background: '#ffffff',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: '#ecfdf5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CheckCircle2 size={20} />
                </div>
                <h3 className="font-display" style={{ fontSize: '1.25rem', color: '#0f172a', margin: 0 }}>
                  Confirm & Disburse Payout
                </h3>
              </div>
              <button
                onClick={() => setApproveModalPayout(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            {/* Payout Details Summary */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: '14px 16px',
                marginBottom: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 6, fontSize: '0.86rem' }}>
                <span style={{ color: '#64748b' }}>Recipient User:</span>
                <strong style={{ color: '#0f172a', wordBreak: 'break-all', textAlign: 'right' }}>{approveModalPayout.viewerId?.name} ({approveModalPayout.viewerId?.email})</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6, fontSize: '0.86rem' }}>
                <span style={{ color: '#64748b' }}>Payment Method:</span>
                <strong style={{ color: '#0f172a', textTransform: 'uppercase' }}>{approveModalPayout.method}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6, fontSize: '0.86rem' }}>
                <span style={{ color: '#64748b' }}>Account Details:</span>
                <strong className="font-mono" style={{ color: 'var(--primary-neon)', wordBreak: 'break-all' }}>{approveModalPayout.accountDetails}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6, paddingTop: 6, borderTop: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b', fontSize: '0.86rem' }}>Payout Amount:</span>
                <strong className="font-mono" style={{ fontSize: '1.3rem', color: '#059669' }}>
                  ${approveModalPayout.amount.toFixed(2)} USD
                  {(approveModalPayout.method === 'bkash' || approveModalPayout.method === 'nagad') && (
                    <span style={{ fontSize: '0.86rem', color: '#64748b', marginLeft: 6 }}>
                      (৳{(approveModalPayout.amount * usdToBdt).toLocaleString()} BDT)
                    </span>
                  )}
                </strong>
              </div>
            </div>

            {/* Transaction Ref Input */}
            <div style={{ marginBottom: 14 }}>
              <label className="font-mono" style={{ fontSize: '0.8rem', color: '#475569', display: 'block', marginBottom: 6, fontWeight: 700 }}>
                Transaction ID / TrxID / Hash:
              </label>
              <input
                type="text"
                placeholder="e.g. 9K2L8M or 0xabc... or FaucetPay batch ID"
                value={approveTxnRef}
                onChange={(e) => setApproveTxnRef(e.target.value)}
                className="input-field"
                style={{ padding: '10px 14px', fontSize: '0.9rem', borderRadius: 10 }}
                autoFocus
              />
            </div>

            {/* Optional Admin Note */}
            <div style={{ marginBottom: 18 }}>
              <label className="font-mono" style={{ fontSize: '0.8rem', color: '#475569', display: 'block', marginBottom: 6, fontWeight: 700 }}>
                Disbursement Note (Optional):
              </label>
              <input
                type="text"
                placeholder="e.g. Sent via bKash personal send money"
                value={approveNotes}
                onChange={(e) => setApproveNotes(e.target.value)}
                className="input-field"
                style={{ padding: '10px 14px', fontSize: '0.9rem', borderRadius: 10 }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setApproveModalPayout(null)}
                className="btn btn-ghost"
                style={{ padding: '10px 18px', borderRadius: 10 }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={approveLoading}
                onClick={handleConfirmApprove}
                className="btn btn-neon glow-neon"
                style={{ padding: '10px 20px', borderRadius: 10, fontWeight: 700 }}
              >
                {approveLoading ? 'Processing...' : 'Confirm Paid & Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: REJECT & REFUND WITHDRAWAL
          ========================================================================= */}
      {rejectModalPayout && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: 20,
          }}
        >
          <div
            className="glass-card modal-card"
            style={{
              maxWidth: 460,
              width: '100%',
              padding: 28,
              borderRadius: 20,
              boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
              background: '#ffffff',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: '#fef2f2',
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <XCircle size={20} />
                </div>
                <h3 className="font-display" style={{ fontSize: '1.25rem', color: '#0f172a', margin: 0 }}>
                  Reject & Refund Withdrawal
                </h3>
              </div>
              <button
                onClick={() => setRejectModalPayout(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.86rem', color: '#64748b', marginBottom: 16 }}>
              The payout amount of <strong>${rejectModalPayout.amount.toFixed(2)} USD</strong> will be automatically credited back to the viewer's balance.
            </p>

            <div style={{ marginBottom: 18 }}>
              <label className="font-mono" style={{ fontSize: '0.8rem', color: '#475569', display: 'block', marginBottom: 6, fontWeight: 700 }}>
                Rejection Reason:
              </label>
              <textarea
                placeholder="e.g. Invalid account number, account not receiving funds, or policy infraction."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="input-field"
                style={{ padding: '10px 14px', fontSize: '0.88rem', borderRadius: 10, width: '100%', minHeight: 80, resize: 'vertical' }}
                required
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setRejectModalPayout(null)}
                className="btn btn-ghost"
                style={{ padding: '10px 18px', borderRadius: 10 }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={rejectLoading}
                onClick={handleConfirmReject}
                className="btn btn-ghost"
                style={{ padding: '10px 20px', borderRadius: 10, background: '#ef4444', color: '#ffffff', border: 'none', fontWeight: 700 }}
              >
                {rejectLoading ? 'Processing...' : 'Confirm Reject & Refund'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
