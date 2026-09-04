import React, { useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface TickerPayout {
  id: string;
  user: string;
  amount: number;
  method: string;
  timestamp: string;
}

const INITIAL_PAYOUTS: TickerPayout[] = [
  { id: '1', user: 'tanvir_09', amount: 4.50, method: 'bKash', timestamp: 'Just now' },
  { id: '2', user: 'fahim_yt', amount: 12.00, method: 'Nagad', timestamp: '1m ago' },
  { id: '3', user: 'crypto_earner', amount: 25.50, method: 'USDT', timestamp: '2m ago' },
  { id: '4', user: 'sarah_creator', amount: 2.20, method: 'FaucetPay', timestamp: '3m ago' },
  { id: '5', user: 'hasan_views', amount: 8.75, method: 'bKash', timestamp: '4m ago' },
  { id: '6', user: 'shakil_bd', amount: 15.00, method: 'Nagad', timestamp: '5m ago' },
  { id: '7', user: 'webmoney_user', amount: 6.40, method: 'WebMoney', timestamp: '6m ago' },
];

export const LivePayoutsTicker: React.FC = () => {
  const [payouts, setPayouts] = useState<TickerPayout[]>(INITIAL_PAYOUTS);

  // Periodically insert random simulated real-time payouts
  useEffect(() => {
    const userNames = ['rafiq_99', 'nahid_pro', 'alif_media', 'sumon_yt', 'kamrul_cash', 'mehedi_tube', 'akash_earn'];
    const methods = ['bKash', 'Nagad', 'USDT', 'FaucetPay', 'bKash'];

    const interval = setInterval(() => {
      const randomUser = userNames[Math.floor(Math.random() * userNames.length)];
      const randomMethod = methods[Math.floor(Math.random() * methods.length)];
      const randomAmount = Number((Math.random() * 15 + 1.5).toFixed(2));

      const newEntry: TickerPayout = {
        id: Date.now().toString(),
        user: randomUser,
        amount: randomAmount,
        method: randomMethod,
        timestamp: 'Just now',
      };

      setPayouts((prev) => [newEntry, ...prev.slice(0, 14)]);
    }, 9000);

    return () => clearInterval(interval);
  }, []);

  const getMethodBadgeStyle = (method: string) => {
    switch (method.toLowerCase()) {
      case 'bkash':
        return { background: 'rgba(233, 30, 99, 0.12)', color: '#db2777', border: '1px solid rgba(233, 30, 99, 0.3)' };
      case 'nagad':
        return { background: 'rgba(255, 152, 0, 0.12)', color: '#ea580c', border: '1px solid rgba(255, 152, 0, 0.3)' };
      case 'crypto':
      case 'usdt':
        return { background: 'rgba(5, 150, 105, 0.12)', color: '#059669', border: '1px solid rgba(5, 150, 105, 0.3)' };
      case 'faucetpay':
        return { background: '#e0f2fe', color: '#0284c7', border: '1px solid rgba(14, 165, 233, 0.35)' };
      case 'webmoney':
        return { background: '#e0f2fe', color: '#0369a1', border: '1px solid rgba(2, 132, 199, 0.3)' };
      default:
        return { background: '#f0f9ff', color: '#0284c7', border: '1px solid var(--glass-stroke)' };
    }
  };

  const getMethodLogo = (method: string) => {
    switch (method.toLowerCase()) {
      case 'bkash':
        return '/payment-methods/bkash.svg';
      case 'nagad':
        return '/payment-methods/nagad.svg';
      case 'crypto':
      case 'usdt':
        return '/payment-methods/crypto.svg';
      case 'faucetpay':
        return '/payment-methods/faucetpay.svg';
      case 'webmoney':
        return '/payment-methods/webmoney.svg';
      default:
        return null;
    }
  };

  // Duplicate the list for a seamless continuous scrolling loop
  const duplicatedPayouts = [...payouts, ...payouts];

  return (
    <div
      style={{
        background: '#f0f9ff',
        borderBottom: '1px solid rgba(14, 165, 233, 0.2)',
        padding: '6px 0',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* Sticky Fixed "Live Feed:" Label on the Left */}
      <div
        className="ticker-feed-label"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 10,
          background: 'linear-gradient(90deg, #f0f9ff 82%, rgba(240, 249, 255, 0) 100%)',
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
            boxShadow: '0 0 10px rgba(14, 165, 233, 0.8)',
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
          background: 'linear-gradient(270deg, #f0f9ff 0%, rgba(240, 249, 255, 0) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Smooth Continuous Animated Marquee Track */}
      <div className="ticker-content" style={{ overflow: 'hidden', width: '100%' }}>
        <div className="ticker-track">
          {duplicatedPayouts.map((p, idx) => {
            const badgeStyle = getMethodBadgeStyle(p.method);
            const logoUrl = getMethodLogo(p.method);
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
                <span className="font-mono" style={{ color: '#0f172a', fontWeight: 600 }}>
                  {p.user}
                </span>
                <span style={{ color: 'var(--on-surface-variant)' }}>withdrew</span>
                <span className="font-mono" style={{ color: 'var(--primary-neon)', fontWeight: 700 }}>
                  ${p.amount.toFixed(2)} USD
                </span>
                <span
                  style={{
                    padding: '2px 8px',
                    fontSize: '0.6rem',
                    borderRadius: 9999,
                    fontFamily: 'JetBrains Mono',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    ...badgeStyle,
                  }}
                >
                  {logoUrl && (
                    <img
                      src={logoUrl}
                      alt={p.method}
                      style={{
                        width: 12,
                        height: 12,
                        objectFit: 'contain',
                        borderRadius: 2,
                        background: '#ffffff',
                        padding: 1,
                      }}
                    />
                  )}
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
