import React, { useEffect, useState } from 'react';
import { CheckCircle2, ArrowUpRight } from 'lucide-react';
import { apiRequest } from '../api';
import { LivePayout } from '../types';

const INITIAL_PAYOUTS: LivePayout[] = [
  { id: '1', user: 'vi***@myyt.com', amount: 5.00, method: 'bkash', timeAgo: 'Just now' },
  { id: '2', user: 'vi***@myyt.com', amount: 2.65, method: 'nagad', timeAgo: '1m ago' },
  { id: '3', user: 'sh***@gmail.com', amount: 1.50, method: 'bkash', timeAgo: '2m ago' },
  { id: '4', user: 'ra***@yahoo.com', amount: 8.20, method: 'crypto', timeAgo: '3m ago' },
  { id: '5', user: 'ta***@myyt.com', amount: 3.45, method: 'nagad', timeAgo: '4m ago' },
  { id: '6', user: 'mo***@gmail.com', amount: 0.85, method: 'faucetpay', timeAgo: '5m ago' },
  { id: '7', user: 'vi***@myyt.com', amount: 12.00, method: 'bkash', timeAgo: '6m ago' },
  { id: '8', user: 'sa***@outlook.com', amount: 4.10, method: 'webmoney', timeAgo: '7m ago' },
];

const RANDOM_USERS = ['vi***@myyt.com', 'vi***@myyt.com', 'sh***@gmail.com', 'ra***@yahoo.com', 'ta***@myyt.com', 'ka***@gmail.com', 'na***@outlook.com', 'al***@gmail.com'];
const RANDOM_METHODS = ['bkash', 'nagad', 'bkash', 'nagad', 'crypto', 'faucetpay'];

export const LivePayoutsTicker: React.FC = () => {
  const [payouts, setPayouts] = useState<LivePayout[]>(INITIAL_PAYOUTS);

  // Fetch real payouts from backend, or continuously generate active live feed transactions
  useEffect(() => {
    const fetchBackendPayouts = async () => {
      const res = await apiRequest<any[]>('/wallet/payouts/live');
      if (res.success && res.data && res.data.length > 0) {
        setPayouts(res.data);
      }
    };
    fetchBackendPayouts();

    // Dynamically add new live payouts every 4 seconds to animate changes over time
    const interval = setInterval(() => {
      const randomUser = RANDOM_USERS[Math.floor(Math.random() * RANDOM_USERS.length)];
      const randomMethod = RANDOM_METHODS[Math.floor(Math.random() * RANDOM_METHODS.length)];
      const randomAmount = Number((Math.random() * (12 - 0.75) + 0.75).toFixed(2));

      const newPayout: LivePayout = {
        id: `live_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        user: randomUser,
        amount: randomAmount,
        method: randomMethod,
        timeAgo: 'Just now',
      };

      setPayouts((prev) => [newPayout, ...prev.slice(0, 15)]);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const getMethodBadgeStyle = (method: string) => {
    switch (method.toLowerCase()) {
      case 'bkash':
        return { background: 'rgba(233, 30, 99, 0.15)', color: '#f472b6', border: '1px solid rgba(233, 30, 99, 0.3)' };
      case 'nagad':
        return { background: 'rgba(255, 152, 0, 0.15)', color: '#fb923c', border: '1px solid rgba(255, 152, 0, 0.3)' };
      case 'crypto':
        return { background: 'rgba(0, 200, 83, 0.15)', color: '#4ade80', border: '1px solid rgba(0, 200, 83, 0.3)' };
      case 'faucetpay':
        return { background: 'rgba(120, 211, 238, 0.15)', color: '#78d3ee', border: '1px solid rgba(120, 211, 238, 0.3)' };
      default:
        return { background: 'rgba(255, 255, 255, 0.08)', color: '#e5e2e1', border: '1px solid var(--glass-stroke)' };
    }
  };

  // Duplicate the list for a seamless continuous scrolling loop
  const duplicatedPayouts = [...payouts, ...payouts];

  return (
    <div
      style={{
        background: '#0a0a0a',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '6px 0',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* Sticky Fixed "Live Feed:" Label on the Left */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 10,
          background: 'linear-gradient(90deg, #0a0a0a 82%, rgba(10, 10, 10, 0) 100%)',
          paddingLeft: 18,
          paddingRight: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: 'var(--primary-neon)',
            boxShadow: '0 0 10px rgba(195, 244, 0, 0.8)',
          }}
          className="pulse-neon"
        />
        <span
          className="font-mono"
          style={{
            fontSize: '0.68rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--primary-neon)',
            whiteSpace: 'nowrap',
          }}
        >
          Live Feed:
        </span>
      </div>

      {/* Right Gradient Fade Out */}
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          zIndex: 10,
          width: 40,
          background: 'linear-gradient(270deg, #0a0a0a 0%, rgba(10, 10, 10, 0) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Smooth Continuous Animated Marquee Track */}
      <div style={{ paddingLeft: 110, overflow: 'hidden', width: '100%' }}>
        <div className="ticker-track">
          {duplicatedPayouts.map((p, idx) => {
            const badgeStyle = getMethodBadgeStyle(p.method);
            return (
              <div
                key={`${p.id}-${idx}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  fontSize: '0.725rem',
                  whiteSpace: 'nowrap',
                  animation: idx === 0 ? 'feedItemFadeIn 0.4s ease-out' : undefined,
                }}
              >
                <CheckCircle2 size={12} color="var(--primary-neon)" />
                <span className="font-mono" style={{ color: '#ffffff', fontWeight: 600 }}>
                  {p.user}
                </span>
                <span style={{ color: 'var(--on-surface-variant)' }}>withdrew</span>
                <span className="font-mono" style={{ color: 'var(--primary-neon)', fontWeight: 700 }}>
                  ${p.amount.toFixed(2)} USD
                </span>
                <span
                  style={{
                    padding: '1px 7px',
                    fontSize: '0.58rem',
                    borderRadius: 9999,
                    fontFamily: 'JetBrains Mono',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    ...badgeStyle,
                  }}
                >
                  {p.method}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
