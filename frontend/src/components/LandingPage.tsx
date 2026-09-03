import React, { useState } from 'react';
import {
  Play,
  Wallet,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Zap,
  TrendingUp,
  Clock,
  Eye,
  DollarSign,
  Lock,
  Smartphone,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface LandingPageProps {
  onStartEarning: () => void;
  onBuyViews: () => void;
  onOpenAuth: (mode: 'signin' | 'signup', role?: 'viewer' | 'campaigner') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartEarning,
  onBuyViews,
  onOpenAuth,
}) => {
  // How it works tab
  const [howTab, setHowTab] = useState<'viewer' | 'creator'>('viewer');

  // Viewer Calculator State
  const [calcVideosPerDay, setCalcVideosPerDay] = useState(60);
  const [calcDuration, setCalcDuration] = useState<number>(30);

  // Campaigner Estimator State (index.txt logic)
  const [campaignViews, setCampaignViews] = useState(1000);
  const [campaignDuration, setCampaignDuration] = useState<number>(10);

  // FAQ Accordion Open State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Calculations for Viewer
  const viewerRewardPerVideo: Record<number, number> = {
    10: 0.0035,
    30: 0.0052,
    60: 0.0072,
    120: 0.0110,
  };
  const rewardPerVideo = viewerRewardPerVideo[calcDuration] || 0.0052;
  const dailyEarningsUSD = calcVideosPerDay * rewardPerVideo;
  const monthlyEarningsUSD = dailyEarningsUSD * 30;
  const usdToBdt = 122;
  const monthlyEarningsBDT = monthlyEarningsUSD * usdToBdt;

  // Calculations for Campaigner from index.txt
  // Base Price: 1000 Views, 10 Seconds = $5.00
  // Multipliers: 10s: 1.0, 30s: 1.5, 60s: 2.0, 120s: 3.0
  const basePrice = 5;
  const durationMultiplier: Record<number, number> = {
    10: 1.0,
    30: 1.5,
    60: 2.0,
    120: 3.0,
  };
  const currentMult = durationMultiplier[campaignDuration] || 1.0;
  const campaignTotalUSD = Number(((campaignViews / 1000) * basePrice * currentMult).toFixed(2));
  const campaignTotalBDT = campaignTotalUSD * usdToBdt;
  const costPerView = Number((campaignTotalUSD / campaignViews).toFixed(4));
  const totalWatchHours = ((campaignViews * campaignDuration) / 3600).toFixed(1);

  const faqs = [
    {
      q: 'How do I withdraw my earnings?',
      a: 'Withdrawals are supported directly to bKash and Nagad (Personal MFS accounts), FaucetPay, WebMoney, and Direct Crypto (USDT TRC20 / LTC). Once your balance reaches $0.50, you can request an instant cashout from your wallet.',
    },
    {
      q: 'Is signing in with Google safe and required?',
      a: 'Yes, 100% safe! We utilize official Google OAuth authentication. We never ask for or store your Google password. Signing in with Google gives you instant 1-click access to your wallet and task dashboard.',
    },
    {
      q: 'Will my YouTube channel or video get penalized or banned?',
      a: 'No, absolutely not. All views are played directly inside the official YouTube embedded player by real active users. There are no headless bots or artificial proxies. Every view registers as genuine high-retention engagement on YouTube Studio.',
    },
    {
      q: 'What is the 1-Hour Anti-Repeat Cooldown rule?',
      a: 'To guarantee organic audience diversity and protect channel metrics, our server assigns each YouTube video to a specific viewer only once per hour. This guarantees creators receive unique views across different users.',
    },
    {
      q: 'Can I use both my mobile phone and computer?',
      a: 'Yes! myYT is fully responsive. You can watch videos and earn rewards on Android smartphones, tablets, laptops, and desktop computers seamlessly using the same account.',
    },
    {
      q: 'How fast do YouTube views start after creating an order?',
      a: 'Orders are activated in real-time. As soon as your deposit is confirmed, your video is immediately placed into the active task queue of our 4,800+ online viewers.',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 56, overflow: 'hidden' }}>
      {/* =========================================================================
          HERO SECTION (CYBER-FINTECH NEON DARK THEME - COMPACT)
      ========================================================================= */}
      <section
        style={{
          position: 'relative',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          padding: '40px 24px 45px',
          overflow: 'hidden',
        }}
      >
        {/* Ambient Blurred Background Glows */}
        <div
          style={{
            position: 'absolute',
            top: '-15%',
            right: '-10%',
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'rgba(195, 244, 0, 0.12)',
            filter: 'blur(120px)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-10%',
            left: '-10%',
            width: 450,
            height: 450,
            borderRadius: '50%',
            background: 'rgba(120, 211, 238, 0.08)',
            filter: 'blur(100px)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            maxWidth: 1240,
            margin: '0 auto',
            width: '100%',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 40,
            alignItems: 'center',
            position: 'relative',
            zIndex: 10,
          }}
        >
          {/* Left: Headline & CTAs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Pill Badges */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <div
                className="badge-pill"
                style={{
                  background: 'rgba(53, 53, 52, 0.6)',
                  borderColor: 'var(--glass-stroke)',
                  backdropFilter: 'blur(10px)',
                  padding: '4px 10px',
                  fontSize: '0.68rem',
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: 'var(--primary-neon)',
                  }}
                  className="pulse-neon"
                />
                <span className="font-mono" style={{ letterSpacing: '0.06em', color: '#ffffff' }}>
                  OFFICIAL YOUTUBE PLAYER
                </span>
              </div>

              <div
                className="badge-pill badge-cyan"
                style={{ backdropFilter: 'blur(10px)', padding: '4px 10px', fontSize: '0.68rem' }}
              >
                <Sparkles size={11} />
                <span>INSTANT BKASH & NAGAD PAYOUTS</span>
              </div>
            </div>

            {/* Main Headline */}
            <div>
              <h1
                className="font-display"
                style={{
                  fontSize: 'clamp(2.1rem, 4.2vw, 3.3rem)',
                  lineHeight: 1.06,
                  letterSpacing: '0.01em',
                  color: '#ffffff',
                }}
              >
                WATCH VIDEOS<br />
                <span style={{ color: 'var(--primary-neon)' }}>EARN REAL CASH</span><br />
                <span style={{ fontSize: '0.8em', color: '#78d3ee' }}>SKYROCKET VIEWS</span>
              </h1>
              <p
                className="font-body"
                style={{
                  fontSize: '0.94rem',
                  color: 'var(--on-surface-variant)',
                  maxWidth: 480,
                  marginTop: 12,
                  lineHeight: 1.55,
                }}
              >
                The high-retention video engagement ecosystem. Viewers earn instant cash watching short YouTube clips. Creators get real, human watch time with server-verified analytics.
              </p>
            </div>

            {/* Action CTAs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {/* Primary Google Auth CTA */}
              <button
                onClick={() => onOpenAuth('signup', 'viewer')}
                className="btn btn-neon glow-neon"
                style={{
                  padding: '11px 22px',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24">
                  <path
                    fill="#161e00"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.02h3.87c2.26-2.09 3.675-5.17 3.675-9.12z"
                  />
                  <path
                    fill="#161e00"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.02c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.28v3.12C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#161e00"
                    d="M5.27 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.61H1.28C.46 8.23 0 10.06 0 12s.46 3.77 1.28 5.39l3.99-3.12z"
                  />
                  <path
                    fill="#161e00"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.28 6.61l3.99 3.12c.95-2.85 3.6-4.98 6.73-4.98z"
                  />
                </svg>
                <span>Sign Up with Google</span>
              </button>

              <button
                onClick={onStartEarning}
                className="btn btn-ghost"
                style={{ padding: '11px 20px', fontSize: '0.8rem' }}
              >
                <Play size={15} fill="currentColor" /> Watch & Earn
              </button>

              <button
                onClick={onBuyViews}
                className="btn btn-ghost"
                style={{ padding: '11px 20px', fontSize: '0.8rem', color: '#78d3ee', borderColor: 'rgba(120,211,238,0.3)' }}
              >
                Buy Views <ArrowRight size={14} />
              </button>
            </div>

            {/* Micro Trust Proof */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShieldCheck size={15} color="var(--primary-neon)" />
                <span style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>
                  Zero Bot Tolerance
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={15} color="var(--secondary-cyan)" />
                <span style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>
                  10s – 120s Retention
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Wallet size={15} color="#00c853" />
                <span style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>
                  Min Payout $0.50
                </span>
              </div>
            </div>
          </div>

          {/* Right: Floating 3D Simulated Player Card */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <div
              className="glass-card"
              style={{
                width: '100%',
                maxWidth: 410,
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                boxShadow: '0 20px 50px -10px rgba(0,0,0,0.8), 0 0 35px rgba(195,244,0,0.14)',
                background: 'linear-gradient(135deg, rgba(35, 35, 35, 0.85) 0%, rgba(14, 14, 14, 0.96) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
              }}
            >
              {/* Mockup Card Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: 12,
                  borderBottom: '1px solid var(--glass-stroke)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: 'rgba(195, 244, 0, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary-neon)',
                    }}
                  >
                    <Wallet size={18} />
                  </div>
                  <div>
                    <div className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--on-surface-variant)' }}>
                      Earner Live Balance
                    </div>
                    <div className="font-display" style={{ fontSize: '1.25rem', color: '#ffffff' }}>
                      $84.5204 <span style={{ fontSize: '0.7rem', color: 'var(--primary-neon)' }}>USD</span>
                    </div>
                  </div>
                </div>
                <span className="badge-pill badge-neon" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                  ● Active Task
                </span>
              </div>

              {/* Video Player Mockup Container */}
              <div
                style={{
                  background: '#191919',
                  borderRadius: 14,
                  border: '1px solid var(--glass-stroke)',
                  padding: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge-pill" style={{ background: 'rgba(0,0,0,0.7)', color: 'var(--primary-neon)', fontSize: '0.68rem', padding: '2px 8px' }}>
                    ⏱ 00:30 Sec Timer
                  </span>
                  <span className="badge-pill badge-neon" style={{ fontWeight: 700, fontSize: '0.68rem', padding: '2px 8px' }}>
                    +0.0052 USD
                  </span>
                </div>

                {/* Video Image Overlay with YouTube Play Button */}
                <div
                  style={{
                    width: '100%',
                    height: 140,
                    borderRadius: 10,
                    background: 'url(https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80) center/cover no-repeat',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', borderRadius: 10 }} />
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: 'var(--primary-neon)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--on-primary)',
                      zIndex: 5,
                      boxShadow: '0 0 20px rgba(195,244,0,0.5)',
                      cursor: 'pointer',
                    }}
                    onClick={onStartEarning}
                  >
                    <Play size={20} fill="currentColor" />
                  </div>
                </div>

                {/* Simulated Real-Time Progress Bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: 4 }}>
                    <span className="font-mono" style={{ color: 'var(--on-surface-variant)' }}>Watching Video...</span>
                    <span className="font-mono" style={{ color: 'var(--primary-neon)', fontWeight: 700 }}>24s / 30s</span>
                  </div>
                  <div style={{ width: '100%', height: 4, background: '#2c2c2c', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: '80%', height: '100%', background: 'linear-gradient(90deg, #78d3ee, #c3f400)' }} />
                  </div>
                </div>
              </div>

              {/* Verified Notification Card */}
              <div
                className="glass-card"
                style={{
                  padding: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: 'rgba(32, 31, 31, 0.8)',
                  borderColor: 'rgba(0, 200, 83, 0.3)',
                  borderRadius: 12,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'rgba(0, 200, 83, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CheckCircle2 size={18} color="#00c853" />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ffffff' }}>
                    Server Watch Verified!
                  </div>
                  <div className="font-mono" style={{ fontSize: '0.68rem', color: '#00c853' }}>
                    +$0.0052 credited to bKash/Nagad wallet
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          KEY PLATFORM METRICS
      ========================================================================= */}
      <section style={{ maxWidth: 1240, margin: '0 auto', width: '100%', padding: '0 24px' }}>
        <div
          className="glass-card"
          style={{
            padding: '24px 30px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 24,
            background: 'rgba(20, 20, 20, 0.8)',
            border: '1px solid var(--glass-stroke)',
            borderRadius: 16,
          }}
        >
          <div>
            <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>
              Total Paid Out
            </div>
            <div className="font-display" style={{ fontSize: '1.8rem', color: 'var(--primary-neon)', marginTop: 2 }}>
              $184,350+
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--on-surface-variant)', marginTop: 2 }}>
              bKash, Nagad & Crypto
            </div>
          </div>

          <div>
            <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>
              Active Real Watchers
            </div>
            <div className="font-display" style={{ fontSize: '1.8rem', color: '#ffffff', marginTop: 2 }}>
              4,850+
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--on-surface-variant)', marginTop: 2 }}>
              Concurrent viewers online
            </div>
          </div>

          <div>
            <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>
              Completed Video Tasks
            </div>
            <div className="font-display" style={{ fontSize: '1.8rem', color: 'var(--secondary-cyan)', marginTop: 2 }}>
              2.45M+
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--on-surface-variant)', marginTop: 2 }}>
              Verified YouTube views
            </div>
          </div>

          <div>
            <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>
              Average Retention
            </div>
            <div className="font-display" style={{ fontSize: '1.8rem', color: 'var(--success-green)', marginTop: 2 }}>
              98.6%
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--on-surface-variant)', marginTop: 2 }}>
              Server-authoritative timer
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          HOW IT WORKS
      ========================================================================= */}
      <section style={{ maxWidth: 1240, margin: '0 auto', width: '100%', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <span className="badge-pill badge-neon" style={{ marginBottom: 8, fontSize: '0.68rem', padding: '3px 10px' }}>
            SIMPLE WORKFLOW
          </span>
          <h2 className="font-display" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.3rem)', color: '#ffffff' }}>
            HOW <span style={{ color: 'var(--primary-neon)' }}>myYT</span> WORKS
          </h2>
          <p style={{ color: 'var(--on-surface-variant)', maxWidth: 520, margin: '8px auto 0', fontSize: '0.88rem' }}>
            Whether you want to earn real money online from your phone or boost your YouTube channel metrics, we have streamlined every step.
          </p>

          {/* Toggle Tab */}
          <div
            style={{
              display: 'inline-flex',
              background: '#181818',
              padding: 3,
              borderRadius: 9999,
              marginTop: 18,
              border: '1px solid var(--glass-stroke)',
            }}
          >
            <button
              onClick={() => setHowTab('viewer')}
              style={{
                padding: '8px 18px',
                borderRadius: 9999,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'JetBrains Mono',
                fontWeight: 700,
                fontSize: '0.76rem',
                background: howTab === 'viewer' ? 'var(--primary-neon)' : 'transparent',
                color: howTab === 'viewer' ? 'var(--on-primary)' : 'var(--on-surface-variant)',
                transition: 'all 0.2s',
              }}
            >
              For Viewers (Earn Money)
            </button>
            <button
              onClick={() => setHowTab('creator')}
              style={{
                padding: '8px 18px',
                borderRadius: 9999,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'JetBrains Mono',
                fontWeight: 700,
                fontSize: '0.76rem',
                background: howTab === 'creator' ? 'var(--secondary-cyan)' : 'transparent',
                color: howTab === 'creator' ? '#003642' : 'var(--on-surface-variant)',
                transition: 'all 0.2s',
              }}
            >
              For Creators (Buy Views)
            </button>
          </div>
        </div>

        {/* Steps Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 18 }}>
          {howTab === 'viewer' ? (
            <>
              <div className="glass-card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 10, borderRadius: 16 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: 'rgba(195, 244, 0, 0.15)',
                    color: 'var(--primary-neon)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    fontFamily: 'JetBrains Mono',
                  }}
                >
                  01
                </div>
                <h3 style={{ fontSize: '1.02rem', color: '#ffffff', fontWeight: 600 }}>1-Click Google Sign-In</h3>
                <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.82rem', lineHeight: 1.55 }}>
                  Connect instantly using your Google account. No tedious forms, instant starter bonus balance added to your wallet.
                </p>
              </div>

              <div className="glass-card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 10, borderRadius: 16 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: 'rgba(195, 244, 0, 0.15)',
                    color: 'var(--primary-neon)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    fontFamily: 'JetBrains Mono',
                  }}
                >
                  02
                </div>
                <h3 style={{ fontSize: '1.02rem', color: '#ffffff', fontWeight: 600 }}>Watch YouTube Videos</h3>
                <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.82rem', lineHeight: 1.55 }}>
                  Watch official short YouTube videos for 10s, 30s, 60s, or 120s directly on the official YouTube player without interruptions.
                </p>
              </div>

              <div className="glass-card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 10, borderRadius: 16 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: 'rgba(195, 244, 0, 0.15)',
                    color: 'var(--primary-neon)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    fontFamily: 'JetBrains Mono',
                  }}
                >
                  03
                </div>
                <h3 style={{ fontSize: '1.02rem', color: '#ffffff', fontWeight: 600 }}>Server Verifies Watch</h3>
                <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.82rem', lineHeight: 1.55 }}>
                  Our server-authoritative timer securely verifies your watch session and automatically credits your cash balance.
                </p>
              </div>

              <div className="glass-card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 10, borderRadius: 16 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: 'rgba(195, 244, 0, 0.15)',
                    color: 'var(--primary-neon)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    fontFamily: 'JetBrains Mono',
                  }}
                >
                  04
                </div>
                <h3 style={{ fontSize: '1.02rem', color: '#ffffff', fontWeight: 600 }}>Instant Cashout</h3>
                <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.82rem', lineHeight: 1.55 }}>
                  Withdraw your hard-earned cash directly to bKash, Nagad, FaucetPay, WebMoney, or USDT with minimal threshold of only $0.50.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="glass-card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 10, borderRadius: 16 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: 'rgba(120, 211, 238, 0.15)',
                    color: 'var(--secondary-cyan)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    fontFamily: 'JetBrains Mono',
                  }}
                >
                  01
                </div>
                <h3 style={{ fontSize: '1.02rem', color: '#ffffff', fontWeight: 600 }}>Paste Video Link</h3>
                <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.82rem', lineHeight: 1.55 }}>
                  Paste any YouTube public video link. Our system automatically grabs video metadata and thumbnail instantly.
                </p>
              </div>

              <div className="glass-card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 10, borderRadius: 16 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: 'rgba(120, 211, 238, 0.15)',
                    color: 'var(--secondary-cyan)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    fontFamily: 'JetBrains Mono',
                  }}
                >
                  02
                </div>
                <h3 style={{ fontSize: '1.02rem', color: '#ffffff', fontWeight: 600 }}>Choose Views & Duration</h3>
                <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.82rem', lineHeight: 1.55 }}>
                  Pick your required watch duration (10s, 30s, 1 Min, 2 Min) to guarantee maximum viewer retention and YouTube algorithm boost.
                </p>
              </div>

              <div className="glass-card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 10, borderRadius: 16 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: 'rgba(120, 211, 238, 0.15)',
                    color: 'var(--secondary-cyan)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    fontFamily: 'JetBrains Mono',
                  }}
                >
                  03
                </div>
                <h3 style={{ fontSize: '1.02rem', color: '#ffffff', fontWeight: 600 }}>Deposit Instant Balance</h3>
                <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.82rem', lineHeight: 1.55 }}>
                  Deposit easily using Crypto or FaucetPay with instant zero-confirmation crediting and live invoice tracking.
                </p>
              </div>

              <div className="glass-card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 10, borderRadius: 16 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: 'rgba(120, 211, 238, 0.15)',
                    color: 'var(--secondary-cyan)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    fontFamily: 'JetBrains Mono',
                  }}
                >
                  04
                </div>
                <h3 style={{ fontSize: '1.02rem', color: '#ffffff', fontWeight: 600 }}>Real-Time Tracking</h3>
                <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.82rem', lineHeight: 1.55 }}>
                  Watch real users complete views in real time. Track completed vs remaining views with pause & resume controls anytime.
                </p>
              </div>
            </>
          )}
        </div>
      </section>

      {/* =========================================================================
          INTERACTIVE CALCULATORS (VIEWER & CAMPAIGNER FROM index.txt LOGIC)
      ========================================================================= */}
      <section style={{ maxWidth: 1240, margin: '0 auto', width: '100%', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <span className="badge-pill badge-cyan" style={{ marginBottom: 8, fontSize: '0.68rem', padding: '3px 10px' }}>
            TRANSPARENT REWARDS & PRICING
          </span>
          <h2 className="font-display" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.3rem)', color: '#ffffff' }}>
            ESTIMATE YOUR <span style={{ color: 'var(--primary-neon)' }}>GROWTH & EARNINGS</span>
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          {/* Viewer Earnings Calculator */}
          <div
            className="glass-card"
            style={{
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
              borderRadius: 18,
              border: '1px solid rgba(195, 244, 0, 0.25)',
              background: 'linear-gradient(180deg, rgba(28, 28, 28, 0.8) 0%, rgba(16, 16, 16, 0.9) 100%)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span className="badge-pill badge-neon" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                  Viewer Earnings Calculator
                </span>
                <h3 style={{ fontSize: '1.18rem', color: '#ffffff', marginTop: 6 }}>
                  How Much Can You Earn?
                </h3>
              </div>
              <DollarSign size={24} color="var(--primary-neon)" />
            </div>

            {/* Slider: Videos Watched per day */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)' }}>
                  Videos Watched Per Day:
                </span>
                <span className="font-mono" style={{ fontSize: '0.95rem', color: 'var(--primary-neon)', fontWeight: 700 }}>
                  {calcVideosPerDay} Videos
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="250"
                step="5"
                value={calcVideosPerDay}
                onChange={(e) => setCalcVideosPerDay(parseInt(e.target.value, 10))}
                style={{ width: '100%', accentColor: 'var(--primary-neon)', cursor: 'pointer' }}
              />
            </div>

            {/* Duration Selector */}
            <div>
              <span className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)', display: 'block', marginBottom: 6 }}>
                Watch Duration Tiers:
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                {[
                  { sec: 10, label: '10s' },
                  { sec: 30, label: '30s' },
                  { sec: 60, label: '1 Min' },
                  { sec: 120, label: '2 Min' },
                ].map((item) => (
                  <button
                    key={item.sec}
                    type="button"
                    onClick={() => setCalcDuration(item.sec)}
                    className="btn"
                    style={{
                      padding: '8px 0',
                      fontSize: '0.72rem',
                      borderRadius: 8,
                      background: calcDuration === item.sec ? 'var(--primary-neon)' : '#222222',
                      color: calcDuration === item.sec ? 'var(--on-primary)' : 'var(--on-surface-variant)',
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Result Box */}
            <div
              style={{
                background: '#151515',
                borderRadius: 14,
                padding: 16,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
                border: '1px solid var(--glass-stroke)',
              }}
            >
              <div>
                <div className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)' }}>
                  Daily Income
                </div>
                <div className="font-mono" style={{ fontSize: '1.15rem', color: '#ffffff', fontWeight: 700, marginTop: 2 }}>
                  ${dailyEarningsUSD.toFixed(3)} USD
                </div>
                <div className="font-mono" style={{ fontSize: '0.74rem', color: 'var(--primary-neon)' }}>
                  ≈ {(dailyEarningsUSD * usdToBdt).toFixed(0)} BDT
                </div>
              </div>

              <div>
                <div className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)' }}>
                  Monthly Income (30 Days)
                </div>
                <div className="font-mono" style={{ fontSize: '1.15rem', color: 'var(--primary-neon)', fontWeight: 700, marginTop: 2 }}>
                  ${monthlyEarningsUSD.toFixed(2)} USD
                </div>
                <div className="font-mono" style={{ fontSize: '0.74rem', color: '#ffffff' }}>
                  ≈ ৳{monthlyEarningsBDT.toLocaleString('en-US', { maximumFractionDigits: 0 })} BDT
                </div>
              </div>
            </div>

            <button
              onClick={() => onOpenAuth('signup', 'viewer')}
              className="btn btn-neon"
              style={{ width: '100%', padding: '11px', fontSize: '0.8rem' }}
            >
              Start Earning This with Google <ArrowRight size={14} />
            </button>
          </div>

          {/* Campaigner Views Cost Calculator (index.txt logic) */}
          <div
            className="glass-card"
            style={{
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
              borderRadius: 18,
              border: '1px solid rgba(120, 211, 238, 0.25)',
              background: 'linear-gradient(180deg, rgba(28, 28, 28, 0.8) 0%, rgba(16, 16, 16, 0.9) 100%)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span className="badge-pill badge-cyan" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                  Creator Campaign Estimator
                </span>
                <h3 style={{ fontSize: '1.18rem', color: '#ffffff', marginTop: 6 }}>
                  Promote Your Video
                </h3>
              </div>
              <Eye size={24} color="var(--secondary-cyan)" />
            </div>

            {/* Slider: Desired Views (Min 100, Step 100) */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)' }}>
                  Target YouTube Views:
                </span>
                <span className="font-mono" style={{ fontSize: '0.95rem', color: 'var(--secondary-cyan)', fontWeight: 700 }}>
                  {campaignViews.toLocaleString()} Views
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="25000"
                step="100"
                value={campaignViews}
                onChange={(e) => setCampaignViews(parseInt(e.target.value, 10))}
                style={{ width: '100%', accentColor: 'var(--secondary-cyan)', cursor: 'pointer' }}
              />
            </div>

            {/* Duration Selector with index.txt Multipliers */}
            <div>
              <span className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)', display: 'block', marginBottom: 6 }}>
                Guaranteed Watch Duration:
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                {[
                  { sec: 10, label: '10s (1x)' },
                  { sec: 30, label: '30s (1.5x)' },
                  { sec: 60, label: '1 Min (2x)' },
                  { sec: 120, label: '2 Min (3x)' },
                ].map((item) => (
                  <button
                    key={item.sec}
                    type="button"
                    onClick={() => setCampaignDuration(item.sec)}
                    className="btn"
                    style={{
                      padding: '8px 0',
                      fontSize: '0.72rem',
                      borderRadius: 8,
                      background: campaignDuration === item.sec ? 'var(--secondary-cyan)' : '#222222',
                      color: campaignDuration === item.sec ? '#003642' : 'var(--on-surface-variant)',
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Result Box */}
            <div
              style={{
                background: '#151515',
                borderRadius: 14,
                padding: 16,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
                border: '1px solid var(--glass-stroke)',
              }}
            >
              <div>
                <div className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)' }}>
                  Total Campaign Cost
                </div>
                <div className="font-mono" style={{ fontSize: '1.15rem', color: 'var(--secondary-cyan)', fontWeight: 700, marginTop: 2 }}>
                  ${campaignTotalUSD.toFixed(2)} USD
                </div>
                <div className="font-mono" style={{ fontSize: '0.74rem', color: 'var(--on-surface-variant)' }}>
                  ≈ ৳{campaignTotalBDT.toLocaleString('en-US', { maximumFractionDigits: 0 })} BDT
                </div>
              </div>

              <div>
                <div className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)' }}>
                  Projected Watch Time
                </div>
                <div className="font-mono" style={{ fontSize: '1.15rem', color: '#ffffff', fontWeight: 700, marginTop: 2 }}>
                  {totalWatchHours} Hours
                </div>
                <div className="font-mono" style={{ fontSize: '0.74rem', color: 'var(--success-green)' }}>
                  ${costPerView.toFixed(4)} / view
                </div>
              </div>
            </div>

            <button
              onClick={onBuyViews}
              className="btn btn-ghost"
              style={{ width: '100%', padding: '11px', fontSize: '0.8rem', color: 'var(--secondary-cyan)', borderColor: 'rgba(120,211,238,0.4)' }}
            >
              Configure This Campaign <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECURITY & RELIABILITY PILLARS
      ========================================================================= */}
      <section style={{ maxWidth: 1240, margin: '0 auto', width: '100%', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <span className="badge-pill badge-neon" style={{ marginBottom: 8, fontSize: '0.68rem', padding: '3px 10px' }}>
            ZERO RISK ARCHITECTURE
          </span>
          <h2 className="font-display" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.3rem)', color: '#ffffff' }}>
            WHY <span style={{ color: 'var(--primary-neon)' }}>CREATORS & EARNERS</span> TRUST US
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          <div className="glass-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10, borderRadius: 16 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(195, 244, 0, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-neon)' }}>
              <ShieldCheck size={18} />
            </div>
            <h3 style={{ fontSize: '0.98rem', color: '#ffffff', fontWeight: 600 }}>Official YouTube Embedded Player</h3>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.8rem', lineHeight: 1.55 }}>
              Videos are played strictly through official YouTube iframe/app players. No headless scrapers, which guarantees 100% adherence to YouTube policies.
            </p>
          </div>

          <div className="glass-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10, borderRadius: 16 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(120, 211, 238, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary-cyan)' }}>
              <Clock size={18} />
            </div>
            <h3 style={{ fontSize: '0.98rem', color: '#ffffff', fontWeight: 600 }}>1-Hour Cooldown Protection</h3>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.8rem', lineHeight: 1.55 }}>
              The system strictly enforces an automated 1-hour cooldown per video per user, guaranteeing that creators get fresh, unique viewers.
            </p>
          </div>

          <div className="glass-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10, borderRadius: 16 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(0, 200, 83, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00c853' }}>
              <Lock size={18} />
            </div>
            <h3 style={{ fontSize: '0.98rem', color: '#ffffff', fontWeight: 600 }}>Server-Authoritative Validation</h3>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.8rem', lineHeight: 1.55 }}>
              View duration is strictly verified on the backend Redis queue. Fast-forwarding or client timer tampering is automatically rejected.
            </p>
          </div>

          <div className="glass-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10, borderRadius: 16 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255, 152, 0, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff9800' }}>
              <Zap size={18} />
            </div>
            <h3 style={{ fontSize: '0.98rem', color: '#ffffff', fontWeight: 600 }}>4,000–5,000 Concurrency Engine</h3>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.8rem', lineHeight: 1.55 }}>
              Engineered with distributed in-memory Redis queues and sub-millisecond task dispatching to handle thousands of concurrent watchers smoothly.
            </p>
          </div>

          <div className="glass-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10, borderRadius: 16 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(233, 30, 99, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e91e63' }}>
              <Wallet size={18} />
            </div>
            <h3 style={{ fontSize: '0.98rem', color: '#ffffff', fontWeight: 600 }}>Multi-Rail Instant Cashouts</h3>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.8rem', lineHeight: 1.55 }}>
              Supports domestic mobile financial services (bKash & Nagad) alongside international crypto (USDT, LTC) and micropayment rails (FaucetPay).
            </p>
          </div>

          <div className="glass-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10, borderRadius: 16 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(195, 244, 0, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-neon)' }}>
              <Smartphone size={18} />
            </div>
            <h3 style={{ fontSize: '0.98rem', color: '#ffffff', fontWeight: 600 }}>Dual Android App & Web System</h3>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.8rem', lineHeight: 1.55 }}>
              Use the mobile view-to-earn simulator or connect on your browser. Seamlessly synchronize wallet balance across all devices.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FAQ ACCORDION
      ========================================================================= */}
      <section style={{ maxWidth: 840, margin: '0 auto', width: '100%', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <span className="badge-pill badge-neon" style={{ marginBottom: 8, fontSize: '0.68rem', padding: '3px 10px' }}>
            QUESTIONS & ANSWERS
          </span>
          <h2 className="font-display" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: '#ffffff' }}>
            FREQUENTLY ASKED <span style={{ color: 'var(--primary-neon)' }}>QUESTIONS</span>
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="glass-card"
                style={{
                  borderRadius: 14,
                  overflow: 'hidden',
                  border: isOpen ? '1px solid var(--primary-neon)' : '1px solid var(--glass-stroke)',
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  style={{
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: isOpen ? 'var(--primary-neon)' : '#ffffff' }}>
                    {faq.q}
                  </span>
                  {isOpen ? <ChevronUp size={16} color="var(--primary-neon)" /> : <ChevronDown size={16} />}
                </div>

                {isOpen && (
                  <div
                    style={{
                      padding: '0 18px 14px',
                      color: 'var(--on-surface-variant)',
                      fontSize: '0.82rem',
                      lineHeight: 1.55,
                      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          FINAL HIGH-CONVERSION CTA BANNER
      ========================================================================= */}
      <section style={{ maxWidth: 1240, margin: '0 auto', width: '100%', padding: '0 24px 30px' }}>
        <div
          className="glass-card glow-neon"
          style={{
            padding: '40px 28px',
            borderRadius: 22,
            background: 'linear-gradient(135deg, rgba(35, 35, 35, 0.9) 0%, rgba(18, 24, 0, 0.95) 100%)',
            border: '1px solid var(--primary-neon)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 400,
              height: 220,
              background: 'rgba(195, 244, 0, 0.12)',
              filter: 'blur(90px)',
              pointerEvents: 'none',
            }}
          />

          <span className="badge-pill badge-neon" style={{ fontSize: '0.68rem', padding: '3px 10px' }}>
            JOIN 4,800+ ACTIVE USERS TODAY
          </span>

          <h2
            className="font-display"
            style={{ fontSize: 'clamp(1.8rem, 3.6vw, 2.6rem)', color: '#ffffff', maxWidth: 700, lineHeight: 1.1 }}
          >
            READY TO START EARNING OR SKYROCKET YOUR YOUTUBE VIEWS?
          </h2>

          <p style={{ color: 'var(--on-surface-variant)', maxWidth: 500, fontSize: '0.88rem', lineHeight: 1.55 }}>
            Create your account in seconds with Google. No complex setups. Instant access to tasks and campaigns.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => onOpenAuth('signup', 'viewer')}
              className="btn btn-neon glow-neon"
              style={{ padding: '12px 26px', fontSize: '0.825rem', display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24">
                <path
                  fill="#161e00"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.02h3.87c2.26-2.09 3.675-5.17 3.675-9.12z"
                />
                <path
                  fill="#161e00"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.02c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.28v3.12C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#161e00"
                  d="M5.27 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.61H1.28C.46 8.23 0 10.06 0 12s.46 3.77 1.28 5.39l3.99-3.12z"
                />
                <path
                  fill="#161e00"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.28 6.61l3.99 3.12c.95-2.85 3.6-4.98 6.73-4.98z"
                />
              </svg>
              <span>Sign In with Google</span>
            </button>

            <button
              onClick={onBuyViews}
              className="btn btn-ghost"
              style={{ padding: '12px 24px', fontSize: '0.825rem' }}
            >
              Order YouTube Views <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
