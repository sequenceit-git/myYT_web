import React, { useState, useEffect } from 'react';
import { User as UserIcon, RefreshCw, CheckCircle2 } from 'lucide-react';
import { apiRequest } from '../api';

interface GatewayStat {
  id: string;
  name: string;
  color: string;
  amount: number;
  percentage: number;
}

interface PaymentHistoryItem {
  id: string;
  type: 'payout' | 'deposit';
  userId: string;
  userName: string;
  wallet: string;
  gateway: string;
  amount: number;
  date: string;
  status: string;
  rawStatus?: string;
}

interface TimeframeMetric {
  labels: string[];
  values: number[];
  payoutValues?: number[];
  depositValues?: number[];
}

interface BackendStatsResponse {
  totalWithdrawnUsd: number;
  totalPayoutsCount: number;
  totalDepositsUsd: number;
  totalDepositsCount: number;
  todayDateStr: string;
  todayDayStr: string;
  timeframeData: {
    week: TimeframeMetric;
    month: TimeframeMetric;
  };
  gatewayBreakdown: GatewayStat[];
  paymentHistory: PaymentHistoryItem[];
}

export const TotalStatsLogView: React.FC<{ type?: 'viewer' | 'creator' }> = () => {
  const [timeframe, setTimeframe] = useState<'week' | 'month'>('week');
  const [loading, setLoading] = useState(false);
  const [statsData, setStatsData] = useState<BackendStatsResponse | null>(null);
  const [hoveredBarIdx, setHoveredBarIdx] = useState<number | null>(null);

  const fetchRealStats = async () => {
    setLoading(true);
    try {
      const res = await apiRequest<BackendStatsResponse>('/wallet/platform-stats');
      if (res.success && res.data) {
        setStatsData(res.data);
      }
    } catch (e) {
      console.error('Error fetching platform stats:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealStats();
  }, []);

  // Compute active chart series (Disbursed Payouts ONLY)
  const activeTimeframeData = statsData?.timeframeData?.[timeframe];
  const defaultLabels =
    timeframe === 'month'
      ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      : ['13.09', '14.09', '15.09', '16.09', '17.09', '18.09', '19.09'];

  const chartLabels = activeTimeframeData?.labels || defaultLabels;
  const chartValues = activeTimeframeData?.payoutValues || activeTimeframeData?.values || Array(chartLabels.length).fill(0);

  const maxVal = Math.max(...chartValues, 50);
  const ceiling = Math.ceil(maxVal / 50) * 50 || 100;
  const ySteps = [ceiling, Math.round(ceiling * 0.75), Math.round(ceiling * 0.5), Math.round(ceiling * 0.25), 0];

  const formatYAxis = (num: number) => {
    if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
    if (num >= 1_000) return `$${(num / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
    return `$${num}`;
  };

  // Gateways enabled on this platform only
  const gatewayBreakdown: GatewayStat[] = (statsData?.gatewayBreakdown && statsData.gatewayBreakdown.length > 0)
    ? statsData.gatewayBreakdown
    : [
        { id: 'faucetpay', name: 'FaucetPay USDT', color: '#38bdf8', amount: 0, percentage: 0 },
        { id: 'crypto', name: 'USDT (BEP-20)', color: '#f87171', amount: 0, percentage: 0 },
        { id: 'bkash', name: 'bKash', color: '#db2777', amount: 0, percentage: 0 },
        { id: 'nagad', name: 'Nagad', color: '#ea580c', amount: 0, percentage: 0 },
        { id: 'rocket', name: 'Rocket', color: '#8b5cf6', amount: 0, percentage: 0 },
        { id: 'payeer', name: 'Payeer', color: '#0284c7', amount: 0, percentage: 0 },
        { id: 'webmoney', name: 'WebMoney', color: '#0369a1', amount: 0, percentage: 0 },
      ];

  const totalGatewayAmount = gatewayBreakdown.reduce((acc, curr) => acc + curr.amount, 0);

  // Helper for Gateway Icon / Logo
  const getGatewayIcon = (gateway: string) => {
    const g = gateway.toLowerCase();
    if (g.includes('bkash')) return '/payment-methods/bkash.svg';
    if (g.includes('nagad')) return '/payment-methods/nagad.svg';
    if (g.includes('rocket')) return '/payment-methods/rocket.svg';
    if (g.includes('faucet')) return '/payment-methods/faucetpay.svg';
    if (g.includes('usdt') || g.includes('crypto')) return '/payment-methods/crypto.svg';
    if (g.includes('payeer')) return '/payment-methods/payeer.png';
    if (g.includes('webmoney')) return '/payment-methods/webmoney.svg';
    return null;
  };

  const getGatewayDisplayName = (gateway: string) => {
    const g = gateway.toLowerCase();
    if (g.includes('faucet')) return 'FaucetPay USDT';
    if (g.includes('crypto') || g.includes('usdt')) return 'USDT (BEP-20)';
    if (g.includes('bkash')) return 'bKash';
    if (g.includes('nagad')) return 'Nagad';
    if (g.includes('rocket')) return 'Rocket';
    if (g.includes('payeer')) return 'Payeer';
    if (g.includes('webmoney')) return 'WebMoney';
    return gateway.toUpperCase();
  };

  // Filter payment history: strictly only paid payouts, latest 20 only
  const allHistory = (statsData?.paymentHistory || [])
    .filter((item) => {
      const isPayout = item.type === 'payout';
      const st = (item.status || '').toLowerCase();
      const isPaid = st === 'paid' || st === 'completed' || st === 'approved';
      return isPayout && isPaid;
    })
    .map((item) => ({
      ...item,
      status: 'Paid',
    }));

  const latestPayouts = allHistory.slice(0, 20);

  const now = new Date();
  const dateStr = statsData?.todayDateStr || `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
  const dayStr = statsData?.todayDayStr || ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
      {/* 1. AMOUNT OF PAYMENTS & DEPOSITS BY DAYS / MONTHS */}
      <div
        className="glass-card"
        style={{
          padding: 'clamp(14px, 3.5vw, 24px)',
          borderRadius: 18,
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 className="font-display" style={{ fontSize: 'clamp(1.1rem, 3.5vw, 1.25rem)', color: '#0f172a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.02em', fontWeight: 800 }}>
              AMOUNT OF PAYMENTS {timeframe === 'month' ? 'BY MONTHS' : 'BY DAYS'}
            </h3>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 3 }}>
              {timeframe === 'month'
                ? 'Live real-time monthly withdrawal disbursements (12-Month Overview).'
                : 'Live real-time daily withdrawal disbursements (7-Day Overview).'}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {/* Timeframe Switcher: [ Week | Month ] */}
            <div
              style={{
                display: 'flex',
                background: '#f1f5f9',
                padding: 3,
                borderRadius: 10,
                border: '1px solid #e2e8f0',
                gap: 3,
              }}
            >
              {(['week', 'month'] as const).map((t) => {
                const isSelected = timeframe === t;
                const label = t === 'week' ? 'Week' : 'Month';
                return (
                  <button
                    key={t}
                    onClick={() => setTimeframe(t)}
                    style={{
                      padding: '5px 14px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      borderRadius: 7,
                      border: 'none',
                      cursor: 'pointer',
                      background: isSelected ? '#ffffff' : 'transparent',
                      color: isSelected ? '#0f172a' : '#64748b',
                      boxShadow: isSelected ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <button
              onClick={fetchRealStats}
              className="btn btn-ghost"
              style={{ padding: '6px 10px', fontSize: '0.8rem', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 4 }}
              title="Refresh Real Stats"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Cyan Bar Chart with Y-Axis */}
        <div style={{ position: 'relative', height: 260, width: '100%', maxWidth: '100%', marginTop: 20 }}>
          {/* Y-Axis Labels and Gridlines */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none' }}>
            {ySteps.map((val) => (
              <div key={val} style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <span className="font-mono" style={{ width: 50, fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, textAlign: 'right', paddingRight: 6, flexShrink: 0 }}>
                  {formatYAxis(val)}
                </span>
                <div style={{ flex: 1, borderBottom: '1px dashed #f1f5f9' }} />
              </div>
            ))}
          </div>

          {/* Vertical Bars Container */}
          <div
            style={{
              position: 'absolute',
              left: 54,
              right: 8,
              bottom: 24,
              top: 10,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-around',
              gap: timeframe === 'week' ? 'clamp(4px, 1.8vw, 16px)' : timeframe === 'month' ? 'clamp(2px, 1vw, 10px)' : 6,
            }}
          >
            {chartValues.map((val, idx) => {
              const heightPercent = ceiling > 0 ? Math.min(100, Math.max(8, (val / ceiling) * 100)) : 8;
              const label = chartLabels[idx] || '';
              const isHovered = hoveredBarIdx === idx;

              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredBarIdx(idx)}
                  onMouseLeave={() => setHoveredBarIdx(null)}
                  onTouchStart={() => setHoveredBarIdx(idx)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%',
                    justifyContent: 'flex-end',
                    flex: 1,
                    maxWidth: timeframe === 'week' ? 48 : timeframe === 'month' ? 40 : 30,
                    position: 'relative',
                    cursor: 'pointer',
                  }}
                >
                  {/* Floating Hover Tooltip */}
                  {isHovered && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: `calc(${heightPercent}% + 10px)`,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 40,
                        background: '#0f172a',
                        color: '#ffffff',
                        padding: '6px 10px',
                        borderRadius: 8,
                        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.35)',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2,
                        animation: 'fadeIn 0.15s ease-out',
                      }}
                    >
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>
                        {label}
                      </div>
                      <div className="font-mono" style={{ color: '#38bdf8', fontSize: '0.86rem', fontWeight: 800 }}>
                        ${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                      </div>
                      {/* Tooltip Down Arrow */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: 0,
                          height: 0,
                          borderLeft: '5px solid transparent',
                          borderRight: '5px solid transparent',
                          borderTop: '5px solid #0f172a',
                        }}
                      />
                    </div>
                  )}

                  {/* Cyan Bar */}
                  <div
                    style={{
                      width: '100%',
                      height: `${heightPercent}%`,
                      background: isHovered
                        ? 'linear-gradient(180deg, #0284c7 0%, #38bdf8 100%)'
                        : 'linear-gradient(180deg, #38bdf8 0%, #7dd3fc 100%)',
                      borderRadius: '6px 6px 0 0',
                      transition: 'all 0.2s ease',
                      boxShadow: isHovered
                        ? '0 6px 18px rgba(2, 132, 199, 0.45)'
                        : '0 4px 12px rgba(56, 189, 248, 0.25)',
                      transform: isHovered ? 'scaleY(1.03)' : 'scaleY(1)',
                      transformOrigin: 'bottom',
                    }}
                  />

                  {/* Day Label */}
                  <span
                    className="font-mono"
                    style={{
                      fontSize: timeframe === 'month' ? '0.66rem' : '0.74rem',
                      color: isHovered ? '#0284c7' : '#64748b',
                      marginTop: 8,
                      fontWeight: isHovered ? 800 : 600,
                      whiteSpace: 'nowrap',
                      transition: 'color 0.15s ease',
                    }}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. GATEWAY DISTRIBUTION BREAKDOWN SECTION (DONUT & LIST) */}
      <div
        className="glass-card"
        style={{
          padding: 'clamp(14px, 3.5vw, 24px)',
          borderRadius: 18,
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 30, alignItems: 'center' }}>
          {/* Left: Date & Circular Ring Donut Chart */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', marginBottom: 18 }}>
              <div className="font-display" style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                {dateStr}
              </div>
              <div style={{ fontSize: '0.88rem', color: '#64748b', fontWeight: 500, marginTop: 2 }}>
                {dayStr}
              </div>
            </div>

            {/* SVG Donut Ring Chart */}
            <div style={{ position: 'relative', width: 190, height: 190 }}>
              <svg width="190" height="190" viewBox="0 0 190 190" style={{ transform: 'rotate(-90deg)' }}>
                {(() => {
                  const radius = 76;
                  const circumference = 2 * Math.PI * radius;
                  let accumulatedPercent = 0;

                  // If total is 0, show a clean subtle ring
                  if (totalGatewayAmount === 0) {
                    return (
                      <circle
                        cx="95"
                        cy="95"
                        r={radius}
                        fill="transparent"
                        stroke="#e2e8f0"
                        strokeWidth="16"
                      />
                    );
                  }

                  return gatewayBreakdown.map((item) => {
                    if (item.percentage <= 0) return null;
                    const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
                    const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
                    accumulatedPercent += item.percentage;

                    return (
                      <circle
                        key={item.id}
                        cx="95"
                        cy="95"
                        r={radius}
                        fill="transparent"
                        stroke={item.color}
                        strokeWidth="16"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-width 0.2s ease', cursor: 'pointer' }}
                        onMouseEnter={(e) => e.currentTarget.setAttribute('stroke-width', '20')}
                        onMouseLeave={(e) => e.currentTarget.setAttribute('stroke-width', '16')}
                      />
                    );
                  });
                })()}
              </svg>

              {/* Center Ring Total Badge */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                  Total Disbursed
                </span>
                <span className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  ${totalGatewayAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Available Gateways Breakdown List */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
              gap: '10px 28px',
            }}
          >
            {gatewayBreakdown.map((item) => {
              const logo = getGatewayIcon(item.id);
              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '9px 0',
                    borderBottom: '1px solid #f8fafc',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                    {logo && (
                      <div
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 6,
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 2,
                          flexShrink: 0,
                        }}
                      >
                        <img src={logo} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      </div>
                    )}
                    <span style={{ fontSize: '0.94rem', color: '#1e293b', fontWeight: 650 }}>
                      {item.name}
                    </span>
                  </div>

                  <div className="font-mono" style={{ fontSize: '0.94rem', fontWeight: 750, color: '#0f172a' }}>
                    ${item.amount.toFixed(2)}{' '}
                    <span style={{ color: '#64748b', fontWeight: 550, fontSize: '0.82rem' }}>
                      ({item.percentage}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. REAL-TIME PAYMENT HISTORY TABLE (ONLY PAID PAYOUTS) */}
      <div
        className="glass-card"
        style={{
          padding: 'clamp(14px, 3.5vw, 24px)',
          borderRadius: 18,
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 className="font-display" style={{ fontSize: 'clamp(1.1rem, 3.5vw, 1.25rem)', color: '#0f172a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.02em', fontWeight: 800 }}>
              PAYMENT HISTORY
            </h3>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 3 }}>
              Live real-time log of the latest 20 paid user withdrawal disbursements.
            </div>
          </div>

          <div>
            <button
              onClick={fetchRealStats}
              className="btn btn-ghost"
              style={{ padding: '6px 12px', fontSize: '0.82rem', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
        </div>

        {/* Table View (Desktop) & Mobile Cards View (Phones) */}
        {!latestPayouts.length ? (
          <div style={{ textAlign: 'center', padding: '36px', color: '#64748b', fontSize: '0.9rem' }}>
            No paid payout records found in database yet.
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="desktop-only-table responsive-table-wrapper" style={{ overflowX: 'auto', width: '100%' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                    <th style={{ padding: '12px 14px', textTransform: 'uppercase', fontSize: '0.78rem', fontWeight: 800 }}>USER ID</th>
                    <th style={{ padding: '12px 14px', textTransform: 'uppercase', fontSize: '0.78rem', fontWeight: 800 }}>PAYOUT METHOD</th>
                    <th style={{ padding: '12px 14px', textTransform: 'uppercase', fontSize: '0.78rem', fontWeight: 800 }}>WALLET / ACCOUNT</th>
                    <th style={{ padding: '12px 14px', textTransform: 'uppercase', fontSize: '0.78rem', fontWeight: 800 }}>AMOUNT</th>
                    <th style={{ padding: '12px 14px', textTransform: 'uppercase', fontSize: '0.78rem', fontWeight: 800 }}>DATE</th>
                    <th style={{ padding: '12px 14px', textTransform: 'uppercase', fontSize: '0.78rem', fontWeight: 800 }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {latestPayouts.map((item) => {
                    const logo = getGatewayIcon(item.gateway);
                    const displayName = getGatewayDisplayName(item.gateway);

                    return (
                      <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9', verticalAlign: 'middle' }}>
                        {/* User ID */}
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                              <UserIcon size={14} />
                            </div>
                            <div>
                              <span className="font-mono" style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.88rem', display: 'block' }}>
                                {item.userId}
                              </span>
                              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                {item.userName}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Payout Method */}
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {logo && (
                              <div style={{ width: 24, height: 24, borderRadius: 6, background: '#f8fafc', border: '1px solid #e2e8f0', padding: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <img src={logo} alt={item.gateway} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                              </div>
                            )}
                            <span style={{ fontSize: '0.86rem', color: '#1e293b', fontWeight: 650 }}>
                              {displayName}
                            </span>
                          </div>
                        </td>

                        {/* Masked Wallet / Account */}
                        <td style={{ padding: '12px 14px' }}>
                          <span
                            className="font-mono"
                            style={{
                              fontSize: '0.86rem',
                              fontWeight: 600,
                              color: '#475569',
                              wordBreak: 'break-all',
                              maxWidth: 240,
                              display: 'inline-block',
                            }}
                          >
                            {item.wallet}
                          </span>
                        </td>

                        {/* Amount */}
                        <td
                          className="font-mono"
                          style={{
                            padding: '12px 14px',
                            fontWeight: 750,
                            color: '#0f172a',
                            fontSize: '0.94rem',
                          }}
                        >
                          -${item.amount.toFixed(2)} USD
                        </td>

                        {/* Date */}
                        <td style={{ padding: '12px 14px', color: '#64748b', fontSize: '0.84rem' }}>
                          {item.date}
                        </td>

                        {/* Status Pill */}
                        <td style={{ padding: '12px 14px' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              border: '1px solid #22c55e',
                              color: '#16a34a',
                              background: '#f0fdf4',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              padding: '3px 10px',
                              borderRadius: 6,
                            }}
                          >
                            <CheckCircle2 size={12} />
                            Paid
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="mobile-card-list">
              {latestPayouts.map((item) => {
                const logo = getGatewayIcon(item.gateway);
                const displayName = getGatewayDisplayName(item.gateway);

                return (
                  <div key={item.id} className="mobile-data-card" style={{ width: '100%', boxSizing: 'border-box' }}>
                    {/* Row 1: User on Left, Amount on Right */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', flexShrink: 0 }}>
                          <UserIcon size={14} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <span className="font-mono" style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.86rem', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.userId}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.userName}
                          </span>
                        </div>
                      </div>

                      <div
                        className="font-mono"
                        style={{
                          fontWeight: 800,
                          fontSize: '0.94rem',
                          color: '#0f172a',
                          flexShrink: 0,
                          textAlign: 'right',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        -${item.amount.toFixed(2)}
                      </div>
                    </div>

                    {/* Row 2: Gateway/Account on Left, Badges on Right */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, width: '100%', fontSize: '0.76rem', color: '#64748b', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                        {logo && (
                          <div style={{ width: 22, height: 22, borderRadius: 5, background: '#f8fafc', border: '1px solid #e2e8f0', padding: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <img src={logo} alt={item.gateway} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          </div>
                        )}
                        <span style={{ fontSize: '0.78rem', fontWeight: 650, color: '#1e293b' }}>
                          {displayName}:
                        </span>
                        <span className="font-mono" style={{ fontSize: '0.76rem', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.wallet}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            border: '1px solid #22c55e',
                            color: '#16a34a',
                            background: '#f0fdf4',
                            fontSize: '0.70rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 6,
                          }}
                        >
                          <CheckCircle2 size={11} />
                          Paid
                        </span>
                      </div>
                    </div>

                    {/* Row 3: Date */}
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: -4 }}>
                      {item.date}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
