import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  PlaySquare,
  LogOut,
  Megaphone,
  Smartphone,
  LogIn,
} from 'lucide-react';
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
        padding: '10px 12px',
        background: 'rgba(12, 12, 12, 0.96)',
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
          gap: 8,
        }}
      >
        {/* Brand Logo */}
        <Link
          to="/"
          style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', flexShrink: 0 }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #c3f400 0%, #a2cc00 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 12px rgba(195, 244, 0, 0.35)',
            }}
          >
            <PlaySquare size={16} color="#161e00" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span className="font-display" style={{ fontSize: '1.25rem', letterSpacing: '0.02em', color: '#ffffff' }}>
                MY<span style={{ color: 'var(--primary-neon)' }}>YT</span>
              </span>
            </div>
          </div>
        </Link>

        {/* Clean Core Navigation: Home | Buy Views | Watch App (Same on Mobile, Tablet & Desktop) */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            background: '#161616',
            padding: '2px 3px',
            borderRadius: 9999,
            border: '1px solid var(--glass-stroke)',
            overflowX: 'auto',
          }}
        >
          <Link
            to="/"
            className="btn"
            style={{
              padding: '5px 10px',
              fontSize: '0.72rem',
              borderRadius: 9999,
              background: currentPath === '/' ? 'var(--primary-neon)' : 'transparent',
              color: currentPath === '/' ? 'var(--on-primary)' : 'var(--on-surface-variant)',
              fontWeight: currentPath === '/' ? 700 : 500,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            Home
          </Link>

          <Link
            to="/buy-views"
            className="btn"
            style={{
              padding: '5px 10px',
              fontSize: '0.72rem',
              borderRadius: 9999,
              background: currentPath === '/buy-views' ? '#78d3ee' : 'transparent',
              color: currentPath === '/buy-views' ? '#003642' : 'var(--on-surface-variant)',
              fontWeight: currentPath === '/buy-views' ? 700 : 500,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              whiteSpace: 'nowrap',
            }}
          >
            <Megaphone size={12} /> Buy Views
          </Link>

          <Link
            to="/simulator"
            className="btn"
            style={{
              padding: '5px 10px',
              fontSize: '0.72rem',
              borderRadius: 9999,
              background: currentPath === '/simulator' || currentPath === '/watch' ? 'var(--primary-neon)' : 'transparent',
              color: currentPath === '/simulator' || currentPath === '/watch' ? 'var(--on-primary)' : 'var(--on-surface-variant)',
              fontWeight: currentPath === '/simulator' || currentPath === '/watch' ? 700 : 500,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              whiteSpace: 'nowrap',
            }}
          >
            <Smartphone size={12} /> Watch App
          </Link>
        </nav>

        {/* Right Actions (Auth / Avatar / Balance) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {/* Balance */}
              <div
                onClick={() => navigate(user.role === 'campaigner' ? '/creator' : '/viewer')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  background: '#181818',
                  padding: '3px 8px',
                  borderRadius: 8,
                  border: '1px solid rgba(195, 244, 0, 0.25)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--primary-neon)' }} className="pulse-neon" />
                <span className="font-mono" style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary-neon)' }}>
                  ${user.balance.toFixed(2)}
                </span>
              </div>

              {/* Avatar */}
              <div
                onClick={() => navigate(user.role === 'campaigner' ? '/creator' : '/viewer')}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: `1.5px solid ${user.role === 'campaigner' ? 'var(--secondary-cyan)' : 'var(--primary-neon)'}`,
                  background: '#1e1e1e',
                  cursor: 'pointer',
                }}
              >
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.email || user.name || 'user')}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`}
                  alt="avatar"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Logout */}
              <button
                onClick={onLogout}
                className="btn btn-ghost"
                style={{ padding: '5px 7px', fontSize: '0.65rem', borderRadius: 7 }}
                title="Logout"
              >
                <LogOut size={12} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <button
                onClick={() => onOpenAuth('signin')}
                className="btn btn-ghost"
                style={{ padding: '5px 9px', fontSize: '0.7rem', borderRadius: 7 }}
              >
                <LogIn size={12} /> <span className="mobile-hide-tiny">Sign In</span>
              </button>

              <button
                onClick={() => onOpenAuth('signup', 'viewer')}
                className="btn btn-neon glow-neon"
                style={{ padding: '5px 10px', fontSize: '0.7rem', borderRadius: 7 }}
              >
                <span>Join</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
