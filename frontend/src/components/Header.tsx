import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { PlaySquare, LogOut, Megaphone, Smartphone, LogIn, LayoutDashboard, Wallet } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  user: User | null;
  onOpenAuth: (mode: 'signin' | 'signup', role?: 'viewer' | 'campaigner') => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onOpenAuth,
  onLogout,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <header
      className="glass-card"
      style={{
        borderRadius: 0,
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        padding: '10px 20px',
        background: 'rgba(12, 12, 12, 0.94)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        {/* Brand Logo with Link */}
        <Link
          to="/"
          style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              background: 'linear-gradient(135deg, #c3f400 0%, #a2cc00 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 14px rgba(195, 244, 0, 0.35)',
            }}
          >
            <PlaySquare size={17} color="#161e00" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span className="font-display" style={{ fontSize: '1.4rem', letterSpacing: '0.02em', color: '#ffffff' }}>
                MY<span style={{ color: 'var(--primary-neon)' }}>YT</span>
              </span>
              <span className="badge-pill badge-neon" style={{ fontSize: '0.55rem', padding: '1px 5px' }}>
                PRO
              </span>
            </div>
          </div>
        </Link>

        {/* Dynamic Role-Aware Navigation Bar */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: '#161616',
            padding: '2px 4px',
            borderRadius: 9999,
            border: '1px solid var(--glass-stroke)',
          }}
        >
          {user ? (
            user.role === 'campaigner' ? (
              // Creator Navigation - Dedicated Creator Dashboard Only
              <Link
                to="/creator"
                className="btn"
                style={{
                  padding: '5px 14px',
                  fontSize: '0.72rem',
                  borderRadius: 9999,
                  background: currentPath === '/creator' || currentPath === '/buy-views' ? '#78d3ee' : 'transparent',
                  color: currentPath === '/creator' || currentPath === '/buy-views' ? '#003642' : 'var(--on-surface-variant)',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  textDecoration: 'none',
                }}
              >
                <LayoutDashboard size={13} /> Creator Dashboard
              </Link>
            ) : (
              // Viewer Navigation
              <>
                <Link
                  to="/viewer"
                  className="btn"
                  style={{
                    padding: '5px 12px',
                    fontSize: '0.72rem',
                    borderRadius: 9999,
                    background: currentPath === '/viewer' || currentPath === '/wallet' ? 'var(--primary-neon)' : 'transparent',
                    color: currentPath === '/viewer' || currentPath === '/wallet' ? 'var(--on-primary)' : 'var(--on-surface-variant)',
                    fontWeight: currentPath === '/viewer' || currentPath === '/wallet' ? 700 : 500,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                  }}
                >
                  <Wallet size={13} /> Viewer Dashboard
                </Link>

                <Link
                  to="/simulator"
                  className="btn"
                  style={{
                    padding: '5px 12px',
                    fontSize: '0.72rem',
                    borderRadius: 9999,
                    background: currentPath === '/simulator' || currentPath === '/watch' ? 'var(--primary-neon)' : 'transparent',
                    color: currentPath === '/simulator' || currentPath === '/watch' ? 'var(--on-primary)' : 'var(--on-surface-variant)',
                    fontWeight: currentPath === '/simulator' || currentPath === '/watch' ? 700 : 500,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                  }}
                >
                  <Smartphone size={13} /> Watch Tasks
                </Link>
              </>
            )
          ) : (
            // Logged Out / Visitor Navigation
            <>
              <Link
                to="/"
                className="btn"
                style={{
                  padding: '5px 12px',
                  fontSize: '0.72rem',
                  borderRadius: 9999,
                  background: currentPath === '/' ? 'var(--primary-neon)' : 'transparent',
                  color: currentPath === '/' ? 'var(--on-primary)' : 'var(--on-surface-variant)',
                  fontWeight: currentPath === '/' ? 700 : 500,
                  textDecoration: 'none',
                }}
              >
                Home
              </Link>

              <Link
                to="/buy-views"
                className="btn"
                style={{
                  padding: '5px 12px',
                  fontSize: '0.72rem',
                  borderRadius: 9999,
                  background: currentPath === '/buy-views' || currentPath === '/creator' ? '#78d3ee' : 'transparent',
                  color: currentPath === '/buy-views' || currentPath === '/creator' ? '#003642' : 'var(--on-surface-variant)',
                  fontWeight: currentPath === '/buy-views' || currentPath === '/creator' ? 700 : 500,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <Megaphone size={12} /> Buy Views
              </Link>

              <Link
                to="/simulator"
                className="btn"
                style={{
                  padding: '5px 12px',
                  fontSize: '0.72rem',
                  borderRadius: 9999,
                  background: currentPath === '/simulator' || currentPath === '/watch' ? 'var(--primary-neon)' : 'transparent',
                  color: currentPath === '/simulator' || currentPath === '/watch' ? 'var(--on-primary)' : 'var(--on-surface-variant)',
                  fontWeight: currentPath === '/simulator' || currentPath === '/watch' ? 700 : 500,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <Smartphone size={12} /> Watch App
              </Link>
            </>
          )}
        </nav>

        {/* User Account / Auth Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* User Balance Badge - Clickable to open user's dashboard */}
              <div
                onClick={() => navigate(user.role === 'campaigner' ? '/creator' : '/viewer')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: '#181818',
                  padding: '4px 10px',
                  borderRadius: 10,
                  border: '1px solid rgba(195, 244, 0, 0.25)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                title="Click to view dashboard balance"
              >
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary-neon)' }} className="pulse-neon" />
                <span className="font-mono" style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--primary-neon)' }}>
                  ${user.balance.toFixed(4)} <span style={{ fontSize: '0.65rem', color: 'var(--on-surface-variant)' }}>USD</span>
                </span>
              </div>

              {/* User Profile Info with Random Avatar and Role Badge */}
              <div
                onClick={() => navigate(user.role === 'campaigner' ? '/creator' : '/viewer')}
                style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                title="Click to go to your dashboard"
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: `1.5px solid ${user.role === 'campaigner' ? 'var(--secondary-cyan)' : 'var(--primary-neon)'}`,
                    boxShadow: `0 0 10px ${user.role === 'campaigner' ? 'rgba(120, 211, 238, 0.35)' : 'rgba(195, 244, 0, 0.35)'}`,
                    background: '#1e1e1e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.email || user.name || 'user')}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`}
                    alt="avatar"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.email)}`;
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ffffff', maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name || user.email.split('@')[0]}
                  </div>
                  <span
                    className={`badge-pill ${user.role === 'campaigner' ? 'badge-cyan' : 'badge-neon'}`}
                    style={{ fontSize: '0.52rem', padding: '0px 4px', width: 'fit-content' }}
                  >
                    {user.role === 'campaigner' ? 'CREATOR' : 'VIEWER'}
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="btn btn-ghost"
                style={{ padding: '6px 9px', fontSize: '0.68rem', borderRadius: 8 }}
                title="Logout"
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                onClick={() => onOpenAuth('signin')}
                className="btn btn-ghost"
                style={{ padding: '6px 12px', fontSize: '0.72rem', borderRadius: 8 }}
              >
                <LogIn size={13} /> Sign In
              </button>

              <button
                onClick={() => onOpenAuth('signup', 'viewer')}
                className="btn btn-neon glow-neon"
                style={{ padding: '6px 12px', fontSize: '0.72rem', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 5 }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24">
                  <path fill="#161e00" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.02h3.87c2.26-2.09 3.675-5.17 3.675-9.12z" />
                  <path fill="#161e00" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.02c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.28v3.12C3.26 21.36 7.33 24 12 24z" />
                  <path fill="#FBBC05" d="M5.27 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.61H1.28C.46 8.23 0 10.06 0 12s.46 3.77 1.28 5.39l3.99-3.12z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.28 6.61l3.99 3.12c.95-2.85 3.6-4.98 6.73-4.98z" />
                </svg>
                <span>Join with Google</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
