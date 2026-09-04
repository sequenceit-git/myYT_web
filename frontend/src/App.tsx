import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate, Link } from 'react-router-dom';
import { Header } from './components/Header';
import { LivePayoutsTicker } from './components/LivePayoutsTicker';
import { LandingPage } from './components/LandingPage';
import { BuyViewsPage } from './components/BuyViewsPage';
import { CampaignerPortal } from './components/CampaignerPortal';
import { ViewerPortal } from './components/ViewerPortal';
import { MobileSimulator } from './components/MobileSimulator';
import { AdminPortal } from './components/AdminPortal';
import { AuthModal } from './components/AuthModal';
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

  // Check auth on load
  const fetchMe = async () => {
    const token = localStorage.getItem('myyt_token');
    if (!token) return;
    const res = await apiRequest<User>('/auth/me');
    if (res.success && res.data) {
      setUser(res.data);
    }
  };

  useEffect(() => {
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

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
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

      {/* Footer - Rendered on Landing Page */}
      {isLandingPage && (
        <footer style={{ borderTop: '1px solid var(--glass-stroke)', background: '#ffffff', padding: '50px 30px 30px', marginTop: 50 }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32, marginBottom: 36 }}>
            <div>
              <div className="font-display" style={{ fontSize: '1.5rem', color: '#0f172a', marginBottom: 8 }}>
                MY<span style={{ color: 'var(--primary-neon)' }}>YT</span>
              </div>
              <p className="font-body" style={{ color: 'var(--on-surface-variant)', fontSize: '0.8rem', lineHeight: 1.55, maxWidth: 260 }}>
                The high-velocity watch-to-earn & view exchange ecosystem for digital creators and active viewers.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span className="font-mono" style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#0f172a', letterSpacing: '0.05em', fontWeight: 700 }}>Platform</span>
              <Link to="/buy-views" style={{ color: 'var(--on-surface-variant)', fontSize: '0.78rem', textDecoration: 'none' }}>Buy YouTube Views</Link>
              <Link to="/simulator" style={{ color: 'var(--on-surface-variant)', fontSize: '0.78rem', textDecoration: 'none' }}>Watch & Earn App</Link>
              <Link to="/viewer" style={{ color: 'var(--on-surface-variant)', fontSize: '0.78rem', textDecoration: 'none' }}>Instant Wallet</Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span className="font-mono" style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#0f172a', letterSpacing: '0.05em', fontWeight: 700 }}>Payout & Deposit Rails</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '2px 0' }}>
                {[
                  { name: 'bKash', src: '/payment-methods/bkash.svg' },
                  { name: 'Nagad', src: '/payment-methods/nagad.svg' },
                  { name: 'FaucetPay', src: '/payment-methods/faucetpay.svg' },
                  { name: 'Crypto (USDT)', src: '/payment-methods/crypto.svg' },
                  { name: 'WebMoney', src: '/payment-methods/webmoney.svg' },
                ].map((pm) => (
                  <div
                    key={pm.name}
                    title={pm.name}
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 6,
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 3,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    }}
                  >
                    <img src={pm.src} alt={pm.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  </div>
                ))}
              </div>
              <span style={{ color: 'var(--on-surface-variant)', fontSize: '0.76rem' }}>bKash, Nagad, FaucetPay, USDT, WebMoney</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span className="font-mono" style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#0f172a', letterSpacing: '0.05em', fontWeight: 700 }}>Infrastructure</span>
              <span className="font-mono" style={{ color: 'var(--primary-neon)', fontSize: '0.75rem', fontWeight: 700 }}>4k–5k Concurrency Target</span>
              <span className="font-mono" style={{ color: 'var(--on-surface-variant)', fontSize: '0.75rem' }}>Server-Authoritative Timing</span>
              <span className="font-mono" style={{ color: 'var(--on-surface-variant)', fontSize: '0.75rem' }}>Redis BullMQ In-Memory</span>
            </div>
          </div>

          <div style={{ maxWidth: 1240, margin: '0 auto', borderTop: '1px solid var(--glass-stroke)', paddingTop: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <span className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--on-surface-variant)' }}>
              © 2026 MYYT. ALL RIGHTS RESERVED.
            </span>
            <span className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--primary-neon)', fontWeight: 700 }}>
              BUILT FOR HIGH CONCURRENCY & ZERO BANDWIDTH WASTE.
            </span>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;
