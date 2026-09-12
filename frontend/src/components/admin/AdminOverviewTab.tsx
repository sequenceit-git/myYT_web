import React from 'react';
import {
  Clock,
  Eye,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Video,
  Users,
} from 'lucide-react';
import { AdminTab } from './adminTypes';

interface AdminOverviewTabProps {
  stats: any;
  pendingPayoutsCount: number;
  pendingDepositsCount: number;
  setActiveTab: (tab: AdminTab) => void;
  setPayoutFilter: (filter: 'pending' | 'approved' | 'rejected' | 'all') => void;
  setDepositFilter: (filter: 'pending' | 'approved' | 'rejected' | 'all') => void;
}

export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({
  stats,
  pendingPayoutsCount,
  pendingDepositsCount,
  setActiveTab,
  setPayoutFilter,
  setDepositFilter,
}) => {
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
          const barHeight = (val / maxVal) * (height - paddingY * 2);
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
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

        {/* 2. Views Delivered */}
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

        {/* 3. Creator Spend */}
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

        {/* 7. Pending Deposits */}
        <div
          className="glass-card responsive-kpi-card"
          style={{
            padding: '18px',
            borderRadius: 16,
            border: pendingDepositsCount > 0 ? '1.5px solid #059669' : '1px solid #e2e8f0',
            background: pendingDepositsCount > 0 ? '#f0fdf4' : '#ffffff',
            cursor: 'pointer',
          }}
          onClick={() => {
            setActiveTab('deposits');
            setDepositFilter('pending');
          }}
          title="Click to view pending deposit verification requests"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="font-mono" style={{ fontSize: '0.78rem', color: '#059669', textTransform: 'uppercase', fontWeight: 700 }}>
              Pending Deposits
            </span>
            <Clock size={16} color="#059669" />
          </div>
          <div className="font-mono responsive-kpi-val" style={{ fontSize: '1.9rem', fontWeight: 800, color: '#059669', marginTop: 6, lineHeight: 1 }}>
            ${(stats?.pendingDepositsUsd || 0).toFixed(2)}
          </div>
          <div style={{ fontSize: '0.76rem', color: '#15803d', marginTop: 4, fontWeight: 600 }}>
            {stats?.pendingDepositsCount || pendingDepositsCount || 0} manual deposits to verify →
          </div>
        </div>

        {/* 8. Active Campaigns */}
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

        {/* 9. Total Registered Users */}
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
  );
};
