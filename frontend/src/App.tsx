import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate, Link } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, Lock } from 'lucide-react';
import { Header } from './components/Header';
import { LivePayoutsTicker } from './components/LivePayoutsTicker';
import { LandingPage } from './components/LandingPage';
import { BuyViewsPage } from './components/BuyViewsPage';
import { CampaignerPortal } from './components/CampaignerPortal';
import { ViewerPortal } from './components/ViewerPortal';
import { MobileSimulator } from './components/MobileSimulator';
import { AdminPortal } from './components/AdminPortal';
import { NotFoundPage } from './components/NotFoundPage';
import { DownloadPage } from './components/DownloadPage';
import { AuthModal } from './components/AuthModal';
import { TelegramSupportWidget } from './components/TelegramSupportWidget';
import { TermsPage } from './components/TermsPage';
import { User } from './types';
import { apiRequest, clearAuthToken, setAuthToken } from './api';

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Auth modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authRole, setAuthRole] = useState<'viewer' | 'campaigner'>('viewer');

  // Mobile App OAuth Bridge
  const [mobileAuthUrl, setMobileAuthUrl] = useState<string | null>(null);

  // Check auth on load
  const fetchMe = async () => {
    const token = localStorage.getItem('ytcash_token') || localStorage.getItem('myyt_token');
    if (!token) return;
    const res = await apiRequest<User>('/auth/me');
    if (res.success && res.data) {
      setUser(res.data);
    }
  };

  useEffect(() => {
    // Check if this is a mobile OAuth return callback
    try {
      const hash = window.location.hash ? window.location.hash.substring(1) : '';
      const search = window.location.search ? window.location.search.substring(1) : '';
      const fullQuery = hash || search;
      if (fullQuery) {
        const params = new URLSearchParams(fullQuery);
        const state = params.get('state');
        const hasToken = fullQuery.indexOf('access_token=') !== -1;
        if (state === 'mobile_auth' || (hasToken && (state === 'mobile_auth' || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)))) {
          const deepLink = `ytcash://oauth#${fullQuery}`;
          setMobileAuthUrl(deepLink);
          window.location.replace(deepLink);
          return;
        }
      }
    } catch {}

    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode) {
      localStorage.setItem('ytcash_ref', refCode.trim().toUpperCase());
      localStorage.setItem('myyt_ref', refCode.trim().toUpperCase());
    }
    fetchMe();
  }, []);

  const handleOpenAuth = (mode: 'signin' | 'signup' = 'signin', role: 'viewer' | 'campaigner' = 'viewer') => {
    // If user is already logged in, seamlessly redirect to their dashboard without opening auth modal
    if (user) {
      navigate(user.role === 'campaigner' ? '/creator' : '/viewer');
      return;
    }
    setAuthMode(mode);
    setAuthRole(role);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (authenticatedUser: User, token: string) => {
    if (token) {
      setAuthToken(token);
    }
    setUser(authenticatedUser);
    setAuthModalOpen(false);
    if (authenticatedUser.role === 'campaigner') {
      navigate('/creator');
    } else if (authenticatedUser.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/viewer');
    }
  };

  const handleSwitchProfile = async (targetRole: 'viewer' | 'campaigner') => {
    if (!user) {
      handleOpenAuth('signin');
      return;
    }

    const normalizedRole = targetRole === 'campaigner' ? 'campaigner' : 'viewer';
    const nextRoute = normalizedRole === 'campaigner' ? '/creator' : '/viewer';

    // 1. Instantly update React user state in-place so there is zero logout or flicker
    setUser((prev) => (prev ? { ...prev, role: normalizedRole } : prev));
    navigate(nextRoute);

    // 2. Persist role change on backend
    try {
      const res = await apiRequest<{ user: User; token: string }>('/auth/switch-profile', {
        method: 'POST',
        body: JSON.stringify({ targetRole: normalizedRole }),
      });

      if (res.success && res.data) {
        if (res.data.token) {
          setAuthToken(res.data.token);
        }
        if (res.data.user) {
          setUser(res.data.user);
        }
      }
    } catch {
      // Keep optimistic user state; NEVER clear user or log out
    }
  };

  const handleLogout = () => {
    clearAuthToken();
    setUser(null);
    navigate('/');
  };

  const isLandingPage = location.pathname === '/';
  const showFooter =
    isLandingPage ||
    location.pathname === '/terms' ||
    location.pathname === '/terms-and-conditions' ||
    location.pathname === '/terms-of-service';

  if (mobileAuthUrl) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#090d16', color: '#f8fafc', padding: 24, textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(2, 132, 199, 0.15)', border: '1px solid rgba(2, 132, 199, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <div style={{ width: 28, height: 28, border: '3px solid #38bdf8', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8, fontFamily: 'Outfit, sans-serif' }}>Returning to ytCash Mobile App...</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: 360, marginBottom: 24, lineHeight: 1.5 }}>
          Google sign-in completed! Returning back to your mobile app to finish logging you in.
        </p>
        <a
          href={mobileAuthUrl}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '14px 28px',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            color: '#ffffff',
            fontWeight: 600,
            borderRadius: 12,
            textDecoration: 'none',
            boxShadow: '0 8px 24px rgba(239, 68, 68, 0.35)',
            fontSize: '1rem',
          }}
        >
          Open ytCash Mobile App
        </a>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--surface-container-lowest)' }}>
      {/* Top Header */}
      <Header
        user={user}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        onSwitchProfile={handleSwitchProfile}
      />

      {/* Live Payouts Ticker - Rendered only on public Landing Page */}
      {isLandingPage && <LivePayoutsTicker />}

      {/* Main Routed Content Body */}
      <main style={{ flex: 1 }}>
        <Routes>
          {/* Public Landing Page */}
          <Route
            path="/"
            element={
              <LandingPage
                user={user}
                onStartEarning={() => {
                  if (user) {
                    navigate(user.role === 'campaigner' ? '/creator' : '/viewer');
                  } else {
                    handleOpenAuth('signup');
                  }
                }}
                onBuyViews={() => {
                  navigate('/buy-views');
                }}
                onOpenAuth={handleOpenAuth}
              />
            }
          />

          {/* Buy Real YouTube Views / Cost Simulator */}
          <Route
            path="/buy-views"
            element={<BuyViewsPage user={user} onRefreshUser={fetchMe} onOpenAuth={handleOpenAuth} />}
          />

          {/* Creator Studio & Campaign Dashboard */}
          <Route
            path="/creator"
            element={
              <CampaignerPortal
                user={user}
                onRefreshUser={fetchMe}
                onOpenAuth={handleOpenAuth}
                onSwitchProfile={handleSwitchProfile}
              />
            }
          />

          {/* Viewer Rewards & Wallet Portal */}
          <Route
            path="/viewer"
            element={
              <ViewerPortal
                user={user}
                onRefreshUser={fetchMe}
                onOpenAuth={handleOpenAuth}
                onStartWatching={() => navigate('/simulator')}
                onSwitchProfile={handleSwitchProfile}
              />
            }
          />
          <Route
            path="/wallet"
            element={
              <ViewerPortal
                user={user}
                onRefreshUser={fetchMe}
                onOpenAuth={handleOpenAuth}
                onStartWatching={() => navigate('/simulator')}
                onSwitchProfile={handleSwitchProfile}
              />
            }
          />

          {/* Mobile Watch App Simulator & QR Download */}
          <Route
            path="/simulator"
            element={<MobileSimulator user={user} onRefreshUser={fetchMe} />}
          />
          <Route
            path="/watch"
            element={<MobileSimulator user={user} onRefreshUser={fetchMe} />}
          />
          <Route
            path="/app"
            element={<MobileSimulator user={user} onRefreshUser={fetchMe} />}
          />

          {/* Admin Backoffice Portal */}
          <Route
            path="/admin"
            element={<AdminPortal user={user} onRefreshUser={fetchMe} />}
          />

          {/* Dedicated Direct Download & Landing Routes */}
          <Route path="/download" element={<DownloadPage />} />
          <Route path="/downloads" element={<DownloadPage />} />
          <Route path="/download/*" element={<DownloadPage />} />
          <Route path="/downloads/*" element={<DownloadPage />} />

          {/* Terms, Conditions & Platform Awareness */}
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/terms-and-conditions" element={<TermsPage />} />
          <Route path="/terms-of-service" element={<TermsPage />} />

          {/* Catch-all 404 Not Found fallback */}
          <Route path="*" element={<NotFoundPage user={user} />} />
        </Routes>
      </main>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        initialRole={authRole}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Footer - Rendered on Landing Page & Legal Pages */}
      {showFooter && (
        <footer
          style={{
            borderTop: '1px solid #e2e8f0',
            background: '#ffffff',
            padding: '56px 24px 32px',
            marginTop: 64,
            position: 'relative',
          }}
        >
          {/* Subtle Top Gradient Accent Line */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '5%',
              right: '5%',
              height: 2,
              background: 'linear-gradient(90deg, transparent 0%, rgba(14, 165, 233, 0.4) 50%, transparent 100%)',
            }}
          />

          <div
            style={{
              maxWidth: 1240,
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 36,
              marginBottom: 44,
            }}
          >
            {/* Column 1: Brand & Identity */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
                <img
                  src="/image.png"
                  alt="ytCash PRO"
                  style={{
                    height: 40,
                    width: 'auto',
                    display: 'block',
                    objectFit: 'contain',
                  }}
                />
                <span className="badge-pill badge-cyan" style={{ fontSize: '0.52rem', padding: '1px 5px' }}>
                  PRO
                </span>
              </Link>

              <p className="font-body" style={{ color: '#64748b', fontSize: '0.82rem', lineHeight: 1.6, maxWidth: 280, margin: 0 }}>
                The high-velocity YouTube view exchange & watch-to-earn ecosystem for digital creators and active viewers worldwide.
              </p>

              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: '0.72rem',
                    color: '#059669',
                    background: 'rgba(16, 185, 129, 0.08)',
                    padding: '4px 10px',
                    borderRadius: 9999,
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    fontWeight: 600,
                  }}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: '#10b981',
                      boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)',
                      display: 'inline-block',
                    }}
                  />
                  Network Online • Instant Payouts
                </span>
              </div>
            </div>

            {/* Column 2: Platform Solutions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span
                className="font-mono"
                style={{
                  fontSize: '0.72rem',
                  textTransform: 'uppercase',
                  color: '#0f172a',
                  letterSpacing: '0.06em',
                  fontWeight: 800,
                  marginBottom: 4,
                }}
              >
                Platform
              </span>
              <Link to="/buy-views" style={{ color: '#475569', fontSize: '0.82rem', textDecoration: 'none' }}>
                Buy YouTube Views
              </Link>
              <Link to="/simulator" style={{ color: '#475569', fontSize: '0.82rem', textDecoration: 'none' }}>
                Watch & Earn App
              </Link>
              <Link to="/download" style={{ color: '#475569', fontSize: '0.82rem', textDecoration: 'none' }}>
                Download Android APK
              </Link>
              <Link to="/creator" style={{ color: '#475569', fontSize: '0.82rem', textDecoration: 'none' }}>
                Creator Studio
              </Link>
              <Link to="/viewer" style={{ color: '#475569', fontSize: '0.82rem', textDecoration: 'none' }}>
                Instant Wallet & Cashout
              </Link>
              <Link to="/terms" style={{ color: '#475569', fontSize: '0.82rem', textDecoration: 'none' }}>
                Terms & Conditions
              </Link>
            </div>

            {/* Column 3: Payout & Deposit Rails */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span
                className="font-mono"
                style={{
                  fontSize: '0.72rem',
                  textTransform: 'uppercase',
                  color: '#0f172a',
                  letterSpacing: '0.06em',
                  fontWeight: 800,
                  marginBottom: 4,
                }}
              >
                Payout & Deposit Rails
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', margin: '2px 0' }}>
                {[
                  { name: 'bKash', src: '/payment-methods/bkash.svg' },
                  { name: 'Nagad', src: '/payment-methods/nagad.svg' },
                  { name: 'Payeer', src: '/payment-methods/payeer.svg' },
                  { name: 'FaucetPay', src: '/payment-methods/faucetpay.svg' },
                  { name: 'Crypto (USDT)', src: '/payment-methods/crypto.svg' },
                  { name: 'WebMoney', src: '/payment-methods/webmoney.svg' },
                ].map((pm) => (
                  <div
                    key={pm.name}
                    title={pm.name}
                    style={{
                      width: 50,
                      height: 38,
                      borderRadius: 9,
                      background: '#ffffff',
                      border: '1.5px solid #cbd5e1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '4px 6px',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                    }}
                  >
                    <img src={pm.src} alt={pm.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  </div>
                ))}
              </div>

              <span style={{ color: '#64748b', fontSize: '0.78rem', lineHeight: 1.5, maxWidth: 260 }}>
                Instant automated withdrawals from $0.20 threshold via bKash, Nagad, Payeer, FaucetPay, USDT, and WebMoney.
              </span>
            </div>

            {/* Column 4: Infrastructure & Security */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span
                className="font-mono"
                style={{
                  fontSize: '0.72rem',
                  textTransform: 'uppercase',
                  color: '#0f172a',
                  letterSpacing: '0.06em',
                  fontWeight: 800,
                  marginBottom: 4,
                }}
              >
                Infrastructure & Trust
              </span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span className="font-mono" style={{ color: '#475569', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={13} color="#10b981" /> 100% Real Human Views
                </span>
                <span className="font-mono" style={{ color: '#475569', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ShieldCheck size={13} color="#0284c7" /> Server-Authoritative Anti-Cheat
                </span>
                <span className="font-mono" style={{ color: '#475569', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Lock size={13} color="#64748b" /> 256-Bit SSL Encrypted Endpoints
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Copyright and Status Bar */}
          <div
            style={{
              maxWidth: 1240,
              margin: '0 auto',
              borderTop: '1px solid #e2e8f0',
              paddingTop: 20,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span className="font-mono" style={{ fontSize: '0.72rem', color: '#64748b' }}>
                © 2026 <strong style={{ color: '#0f172a' }}>ytCash</strong>. All rights reserved. • High-Retention YouTube View Exchange Network.
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <Link to="/terms" style={{ fontSize: '0.72rem', color: '#0284c7', textDecoration: 'none', fontWeight: 700 }}>
                  Terms & Conditions
                </Link>
                <span style={{ color: '#cbd5e1', fontSize: '0.7rem' }}>•</span>
                <Link to="/terms#awareness" style={{ fontSize: '0.72rem', color: '#64748b', textDecoration: 'none' }}>
                  Platform Awareness & Rules
                </Link>
                <span style={{ color: '#cbd5e1', fontSize: '0.7rem' }}>•</span>
                <Link to="/terms#security" style={{ fontSize: '0.72rem', color: '#64748b', textDecoration: 'none' }}>
                  Anti-Fraud Policy
                </Link>
                <span style={{ color: '#cbd5e1', fontSize: '0.7rem' }}>•</span>
                <Link to="/terms#disclaimer" style={{ fontSize: '0.72rem', color: '#64748b', textDecoration: 'none' }}>
                  YouTube Disclaimer
                </Link>
              </div>
            </div>

            <span className="font-mono" style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 700 }}>
              BUILT FOR HIGH CONCURRENCY & ZERO BANDWIDTH WASTE.
            </span>
          </div>
        </footer>
      )}

      {/* Floating Telegram Support Popup & Quick Inquiry Widget */}
      <TelegramSupportWidget />
    </div>
  );
}

export default App;
