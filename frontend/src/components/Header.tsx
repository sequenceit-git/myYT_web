import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  PlaySquare,
  LogOut,
  Megaphone,
  Smartphone,
  LogIn,
  Menu,
  X,
  Home,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header
      className="glass-card"
      style={{
        borderRadius: 0,
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        padding: '10px 16px',
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
          gap: 12,
        }}
      >
        {/* Brand Logo */}
        <Link
          to="/"
          onClick={closeMenu}
          style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}
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
              <span className="font-display" style={{ fontSize: '1.35rem', letterSpacing: '0.02em', color: '#ffffff' }}>
                MY<span style={{ color: 'var(--primary-neon)' }}>YT</span>
              </span>
              <span className="badge-pill badge-neon" style={{ fontSize: '0.52rem', padding: '1px 5px' }}>
                PRO
              </span>
            </div>
          </div>
        </Link>

        {/* Desktop Navigation (Inline Pills - Hidden on Mobile/Tablet) */}
        <nav className="nav-desktop-pills">
          <Link
            to="/"
            className="btn"
            style={{
              padding: '5px 14px',
              fontSize: '0.74rem',
              borderRadius: 9999,
              background: currentPath === '/' ? 'var(--primary-neon)' : 'transparent',
              color: currentPath === '/' ? 'var(--on-primary)' : 'var(--on-surface-variant)',
              fontWeight: currentPath === '/' ? 700 : 500,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <Home size={13} /> Home
          </Link>

          <Link
            to="/buy-views"
            className="btn"
            style={{
              padding: '5px 14px',
              fontSize: '0.74rem',
              borderRadius: 9999,
              background: currentPath === '/buy-views' ? '#78d3ee' : 'transparent',
              color: currentPath === '/buy-views' ? '#003642' : 'var(--on-surface-variant)',
              fontWeight: currentPath === '/buy-views' ? 700 : 500,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <Megaphone size={13} /> Buy Views
          </Link>

          <Link
            to="/simulator"
            className="btn"
            style={{
              padding: '5px 14px',
              fontSize: '0.74rem',
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
            <Smartphone size={13} /> Watch App
          </Link>
        </nav>

        {/* Desktop Right Actions (Auth / Avatar / Balance - Hidden on Mobile/Tablet) */}
        <div className="nav-desktop-actions">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Balance */}
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
                }}
              >
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary-neon)' }} className="pulse-neon" />
                <span className="font-mono" style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--primary-neon)' }}>
                  ${user.balance.toFixed(2)} <span style={{ fontSize: '0.65rem', color: 'var(--on-surface-variant)' }}>USD</span>
                </span>
              </div>

              {/* Avatar */}
              <div
                onClick={() => navigate(user.role === 'campaigner' ? '/creator' : '/viewer')}
                style={{
                  width: 32,
                  height: 32,
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
                style={{ padding: '6px 12px', fontSize: '0.74rem', borderRadius: 8 }}
              >
                <LogIn size={13} /> Sign In
              </button>

              <button
                onClick={() => onOpenAuth('signup', 'viewer')}
                className="btn btn-neon glow-neon"
                style={{ padding: '6px 14px', fontSize: '0.74rem', borderRadius: 8 }}
              >
                <span>Join Now</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile Header Controls: 3-Bar (☰) Hamburger Menu Button */}
        <div className="nav-mobile-toggle">
          {user && (
            <div
              onClick={() => navigate(user.role === 'campaigner' ? '/creator' : '/viewer')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                background: '#181818',
                padding: '4px 8px',
                borderRadius: 8,
                border: '1px solid rgba(195, 244, 0, 0.25)',
              }}
            >
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--primary-neon)' }} className="pulse-neon" />
              <span className="font-mono" style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary-neon)' }}>
                ${user.balance.toFixed(2)}
              </span>
            </div>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: '#181818',
              border: '1px solid var(--glass-stroke)',
              color: '#ffffff',
              borderRadius: 8,
              padding: '8px 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            aria-label="Toggle 3-bar menu"
          >
            {mobileMenuOpen ? <X size={20} color="var(--primary-neon)" /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* 3-Bar Mobile Dropdown Menu (Home, Buy Views, Watch App) */}
      {mobileMenuOpen && (
        <div
          className="nav-mobile-dropdown"
          style={{
            gap: 8,
            padding: '14px 0 6px 0',
            marginTop: 10,
            borderTop: '1px solid var(--glass-stroke)',
          }}
        >
          {/* 1. Home */}
          <Link
            to="/"
            onClick={closeMenu}
            style={{
              padding: '11px 14px',
              borderRadius: 10,
              background: currentPath === '/' ? '#1f1f1f' : 'transparent',
              color: currentPath === '/' ? 'var(--primary-neon)' : '#ffffff',
              fontWeight: 700,
              fontSize: '0.88rem',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <Home size={16} color={currentPath === '/' ? 'var(--primary-neon)' : 'var(--on-surface-variant)'} /> Home
          </Link>

          {/* 2. Buy Views */}
          <Link
            to="/buy-views"
            onClick={closeMenu}
            style={{
              padding: '11px 14px',
              borderRadius: 10,
              background: currentPath === '/buy-views' ? '#1f1f1f' : 'transparent',
              color: currentPath === '/buy-views' ? '#78d3ee' : '#ffffff',
              fontWeight: 700,
              fontSize: '0.88rem',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <Megaphone size={16} color="#78d3ee" /> Buy Views
          </Link>

          {/* 3. Watch App */}
          <Link
            to="/simulator"
            onClick={closeMenu}
            style={{
              padding: '11px 14px',
              borderRadius: 10,
              background: currentPath === '/simulator' || currentPath === '/watch' ? '#1f1f1f' : 'transparent',
              color: currentPath === '/simulator' || currentPath === '/watch' ? 'var(--primary-neon)' : '#ffffff',
              fontWeight: 700,
              fontSize: '0.88rem',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <Smartphone size={16} color="var(--primary-neon)" /> Watch App
          </Link>

          {/* Auth Action Buttons if not logged in */}
          {!user ? (
            <div style={{ display: 'flex', gap: 8, marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button
                onClick={() => {
                  onOpenAuth('signin');
                  closeMenu();
                }}
                className="btn btn-ghost"
                style={{ flex: 1, padding: '10px', borderRadius: 10, fontSize: '0.8rem' }}
              >
                <LogIn size={14} /> Sign In
              </button>

              <button
                onClick={() => {
                  onOpenAuth('signup', 'viewer');
                  closeMenu();
                }}
                className="btn btn-neon glow-neon"
                style={{ flex: 1, padding: '10px', borderRadius: 10, fontSize: '0.8rem' }}
              >
                Join Free
              </button>
            </div>
          ) : (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button
                onClick={() => {
                  onLogout();
                  closeMenu();
                }}
                className="btn btn-ghost"
                style={{ width: '100%', padding: '10px', borderRadius: 10, fontSize: '0.8rem', color: '#ef4444' }}
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
