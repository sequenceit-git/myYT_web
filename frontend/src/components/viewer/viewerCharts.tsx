import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';

// Helper to render smooth SVG curve for platform withdrawal volume
export const renderWithdrawalCurve = (data: number[], labels: string[]) => {
  if (!data || data.length < 2) return null;
  const width = 480;
  const height = 150;
  const paddingX = 35;
  const paddingY = 25;
  const highest = Math.max(...data, 0);
  const maxVal = highest > 0 ? highest * 1.25 : 10;
  const minVal = 0;

  const points = data.map((val, i) => {
    const x = paddingX + i * ((width - paddingX * 2) / (data.length - 1));
    const y = height - paddingY - ((val - minVal) / (maxVal - minVal)) * (height - paddingY * 2);
    return { x, y, val };
  });

  // Generate cubic bezier curve path
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
        <linearGradient id="withdrawGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.01" />
        </linearGradient>
      </defs>
      {/* Horizontal guide lines */}
      <line x1="20" y1="35" x2={width - 20} y2="35" stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1" />
      <line x1="20" y1="75" x2={width - 20} y2="75" stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1" />
      <line x1="20" y1="115" x2={width - 20} y2="115" stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1" />

      {/* Area fill */}
      <path d={areaD} fill="url(#withdrawGrad)" />

      {/* Main line */}
      <path d={pathD} fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

      {/* Dots and Labels */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4.5" fill="#ffffff" stroke="#059669" strokeWidth="2.5" />
          <text x={p.x} y={p.y - 9} textAnchor="middle" fill="#0f172a" fontSize="10.5" fontWeight="700" fontFamily="monospace">
            ${p.val}
          </text>
          <text x={p.x} y={height - 4} textAnchor="middle" fill="#64748b" fontSize="10.5" fontWeight="600">
            {labels[i] || ''}
          </text>
        </g>
      ))}
    </svg>
  );
};

// Helper to render SVG bars for daily video watch views
export const renderViewsBarChart = (data: number[], labels: string[]) => {
  if (!data || data.length < 2) return null;
  const width = 480;
  const height = 150;
  const paddingX = 25;
  const highest = Math.max(...data, 0);
  const maxVal = highest > 0 ? highest * 1.25 : 10;
  const barWidth = 32;
  const availableW = width - paddingX * 2;
  const step = availableW / data.length;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id="viewsBarGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
      </defs>
      {/* Horizontal guide lines */}
      <line x1="15" y1="35" x2={width - 15} y2="35" stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1" />
      <line x1="15" y1="75" x2={width - 15} y2="75" stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1" />
      <line x1="15" y1="115" x2={width - 15} y2="115" stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1" />

      {data.map((val, i) => {
        const barH = (val / maxVal) * 95;
        const x = paddingX + i * step + (step - barWidth) / 2;
        const y = height - 26 - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barWidth} height={barH} rx="5" fill="url(#viewsBarGrad)" />
            <text x={x + barWidth / 2} y={y - 6} textAnchor="middle" fill="#0284c7" fontSize="10" fontWeight="700" fontFamily="monospace">
              {val}
            </text>
            <text x={x + barWidth / 2} y={height - 6} textAnchor="middle" fill="#64748b" fontSize="10.5" fontWeight="600">
              {labels[i] || ''}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// Render Status Badge: Verified (Green) vs Interrupted (Orange-Red)
export const renderWatchStatusBadge = (status: string) => {
  const isCompleted = status === 'completed';
  if (isCompleted) {
    return (
      <span
        className="badge-pill"
        style={{
          padding: '3px 9px',
          fontSize: '0.72rem',
          fontWeight: 700,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          background: '#ecfdf5',
          color: '#059669',
          border: '1px solid rgba(16, 185, 129, 0.3)',
        }}
      >
        <CheckCircle2 size={12} /> Verified
      </span>
    );
  }
  return (
    <span
      className="badge-pill"
      style={{
        padding: '3px 9px',
        fontSize: '0.72rem',
        fontWeight: 700,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        background: '#fff7ed',
        color: '#ea580c',
        border: '1px solid rgba(234, 88, 12, 0.35)',
      }}
    >
      <Clock size={12} /> Interrupted
    </span>
  );
};

// Render Reward: Verified has + in green, In-Progress has NO + and orange-red color
export const renderWatchReward = (item: any, fontSize = '0.94rem') => {
  const isCompleted = item.status === 'completed';
  const reward = item.rewardAmount || 0.0035;
  if (isCompleted) {
    return (
      <span className="font-mono" style={{ fontWeight: 800, fontSize, color: '#059669' }}>
        +${reward.toFixed(4)}
      </span>
    );
  }
  return (
    <span className="font-mono" style={{ fontWeight: 800, fontSize, color: '#ea580c' }}>
      ${reward.toFixed(4)}
    </span>
  );
};
