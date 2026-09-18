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
  { id: '1', user: 'Mehedi12', amount: 4.50, method: 'bKash', timestamp: 'Just now' },
  { id: '2', user: 'SojibCrypto', amount: 15.20, method: 'USDT', timestamp: '1m ago' },
  { id: '3', user: 'Salman100', amount: 8.75, method: 'Nagad', timestamp: '2m ago' },
  { id: '4', user: 'Tanvir99', amount: 3.20, method: 'FaucetPay', timestamp: '3m ago' },
  { id: '5', user: 'Fahim_BD', amount: 12.00, method: 'bKash', timestamp: '4m ago' },
  { id: '6', user: 'Akash_Pro', amount: 25.00, method: 'USDT', timestamp: '5m ago' },
  { id: '7', user: 'Rakib77', amount: 6.40, method: 'Nagad', timestamp: '6m ago' },
  { id: '8', user: 'Sabbir_Tube', amount: 18.50, method: 'Payeer', timestamp: '7m ago' },
  { id: '9', user: 'NaimurCrypto', amount: 32.10, method: 'USDT', timestamp: '8m ago' },
  { id: '10', user: 'Shakil_YT', amount: 5.00, method: 'bKash', timestamp: '9m ago' },
  { id: '11', user: 'Sumon_Cash', amount: 9.80, method: 'Nagad', timestamp: '10m ago' },
  { id: '12', user: 'Zubair10', amount: 2.50, method: 'FaucetPay', timestamp: '11m ago' },
  { id: '13', user: 'Rifat_Earn', amount: 14.30, method: 'bKash', timestamp: '12m ago' },
  { id: '14', user: 'Hasan88', amount: 7.20, method: 'Nagad', timestamp: '13m ago' },
  { id: '15', user: 'Nazmul_Dev', amount: 22.00, method: 'USDT', timestamp: '14m ago' },
  { id: '16', user: 'Maruf_BTC', amount: 45.60, method: 'USDT', timestamp: '15m ago' },
  { id: '17', user: 'Jahid_Boss', amount: 11.50, method: 'bKash', timestamp: '16m ago' },
  { id: '18', user: 'Arafat99', amount: 4.80, method: 'Nagad', timestamp: '17m ago' },
  { id: '19', user: 'Siam_Tracer', amount: 8.90, method: 'FaucetPay', timestamp: '18m ago' },
  { id: '20', user: 'Imran_USDT', amount: 50.00, method: 'USDT', timestamp: '19m ago' },
  { id: '21', user: 'AlAmin_Pay', amount: 13.40, method: 'bKash', timestamp: '20m ago' },
  { id: '22', user: 'Kawsar99', amount: 6.70, method: 'Nagad', timestamp: '21m ago' },
  { id: '23', user: 'Milon_Crypto', amount: 28.50, method: 'USDT', timestamp: '22m ago' },
  { id: '24', user: 'Shuvo_YT', amount: 3.50, method: 'FaucetPay', timestamp: '23m ago' },
  { id: '25', user: 'Rony_Cash', amount: 16.00, method: 'bKash', timestamp: '24m ago' },
  { id: '26', user: 'Saidul88', amount: 7.80, method: 'Nagad', timestamp: '25m ago' },
  { id: '27', user: 'Bappy_BD', amount: 10.20, method: 'Payeer', timestamp: '26m ago' },
  { id: '28', user: 'Joy_Earn', amount: 5.40, method: 'bKash', timestamp: '27m ago' },
  { id: '29', user: 'Tareq_Crypto', amount: 38.00, method: 'USDT', timestamp: '28m ago' },
  { id: '30', user: 'Anik_Tube', amount: 9.10, method: 'Nagad', timestamp: '29m ago' },
  { id: '31', user: 'Habib77', amount: 2.80, method: 'FaucetPay', timestamp: '30m ago' },
  { id: '32', user: 'Mahmud_Pay', amount: 19.50, method: 'bKash', timestamp: '31m ago' },
  { id: '33', user: 'Rasel_99', amount: 8.20, method: 'Nagad', timestamp: '32m ago' },
  { id: '34', user: 'Jewel_YT', amount: 12.50, method: 'USDT', timestamp: '33m ago' },
  { id: '35', user: 'Biplob_Crypto', amount: 60.00, method: 'USDT', timestamp: '34m ago' },
  { id: '36', user: 'Rubel88', amount: 6.90, method: 'bKash', timestamp: '35m ago' },
  { id: '37', user: 'Shahadat_BD', amount: 15.80, method: 'Nagad', timestamp: '36m ago' },
  { id: '38', user: 'Foysal_Pay', amount: 4.10, method: 'FaucetPay', timestamp: '37m ago' },
  { id: '39', user: 'Shimul_Tube', amount: 11.20, method: 'bKash', timestamp: '38m ago' },
  { id: '40', user: 'Raju_Earn', amount: 7.60, method: 'Nagad', timestamp: '39m ago' },
  { id: '41', user: 'Sohan_Crypto', amount: 34.20, method: 'USDT', timestamp: '40m ago' },
  { id: '42', user: 'Monir99', amount: 5.90, method: 'Payeer', timestamp: '41m ago' },
  { id: '43', user: 'Arif_YT', amount: 14.00, method: 'bKash', timestamp: '42m ago' },
  { id: '44', user: 'Palash_Cash', amount: 8.40, method: 'Nagad', timestamp: '43m ago' },
  { id: '45', user: 'Liton_BD', amount: 3.00, method: 'FaucetPay', timestamp: '44m ago' },
  { id: '46', user: 'Palash77', amount: 21.00, method: 'USDT', timestamp: '45m ago' },
  { id: '47', user: 'Nahid_Crypto', amount: 42.50, method: 'USDT', timestamp: '46m ago' },
  { id: '48', user: 'Asif_Earn', amount: 10.50, method: 'bKash', timestamp: '47m ago' },
  { id: '49', user: 'Dipu_YT', amount: 6.30, method: 'Nagad', timestamp: '48m ago' },
  { id: '50', user: 'Babu_Pay', amount: 17.80, method: 'bKash', timestamp: '50m ago' },
];

export const LivePayoutsTicker: React.FC = () => {
  const [payouts, setPayouts] = useState<TickerPayout[]>(INITIAL_PAYOUTS);

  // Periodically insert random simulated real-time payouts
  useEffect(() => {
    const userNames = [
      'Mehedi12', 'SojibCrypto', 'Salman100', 'Tanvir99', 'Fahim_BD',
      'Akash_Pro', 'Rakib77', 'Sabbir_Tube', 'NaimurCrypto', 'Shakil_YT',
      'Sumon_Cash', 'Zubair10', 'Rifat_Earn', 'Hasan88', 'Nazmul_Dev',
      'Maruf_BTC', 'Jahid_Boss', 'Arafat99', 'Siam_Tracer', 'Imran_USDT',
      'AlAmin_Pay', 'Kawsar99', 'Milon_Crypto', 'Shuvo_YT', 'Rony_Cash',
    ];
    const methods = ['bKash', 'Nagad', 'USDT', 'FaucetPay', 'Payeer', 'bKash', 'Nagad', 'USDT'];

    const interval = setInterval(() => {
      const randomUser = userNames[Math.floor(Math.random() * userNames.length)];
      const randomMethod = methods[Math.floor(Math.random() * methods.length)];
      const randomAmount = Number((Math.random() * 25 + 1.5).toFixed(2));

      const newEntry: TickerPayout = {
        id: Date.now().toString(),
        user: randomUser,
        amount: randomAmount,
        method: randomMethod,
        timestamp: 'Just now',
      };

      setPayouts((prev) => [newEntry, ...prev.slice(0, 49)]);
    }, 20000);

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
      case 'payeer':
        return { background: '#e0f2fe', color: '#0284c7', border: '1px solid rgba(14, 165, 233, 0.35)' };
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
      case 'payeer':
        return '/payment-methods/payeer.png';
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
