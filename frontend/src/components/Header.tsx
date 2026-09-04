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
  Shield,
} from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  user: User | null;
  onOpenAuth: (mode: 'signin' | 'signup', role?: 'viewer' | 'campaigner') => void;
  onLogout: () => void;
  onSwitchProfile?: (targetRole: 'viewer' | 'campaigner') => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onOpenAuth,
  onLogout,
  onSwitchProfile,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMenu = () => setMobileMenuOpen(false);

  // Active Profile Mode:
  // Evaluated directly from user.role ('campaigner' vs 'viewer')
  // and synchronized with active route paths
  const userRoleStr = (user?.role || '') as string;
  const isCreatorMode = user
    ? (userRoleStr === 'campaigner' || userRoleStr === 'creator')
    : (currentPath === '/creator' || currentPath === '/buy-views');

  const isViewerMode = user
    ? (!isCreatorMode)
    : (currentPath === '/viewer' || currentPath === '/simulator' || currentPath === '/watch');

  // Strict Contextual Navigation Rules:
  // 1. Viewer Profile: 'Buy Views' is completely hidden
  // 2. Creator Profile: 'Watch App' is completely hidden
  // 3. Guest / Exploring Home: both visible for discovery
  const showBuyViews = user ? isCreatorMode : !isViewerMode;
  const showWatchApp = user ? isViewerMode : !isCreatorMode;

  // Contextual Profile Balance:
  // Viewer Profile -> show viewer earnings
  // Creator Profile -> show creator ad budget
  const viewerBal = user?.viewerBalance !== undefined
    ? user.viewerBalance
    : Math.max(0, (user?.totalEarned || 0) - (user?.totalWithdrawn || 0));
  const creatorBal = user?.creatorBalance !== undefined
    ? user.creatorBalance
    : (user?.balance || 0);

  const activeProfileBalance = isCreatorMode ? creatorBal : viewerBal;
  const activeProfileLabel = isCreatorMode ? 'Budget' : 'Earned';

  return (
    <header
      className="glass-card"
      style={{
        borderRadius: 0,
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        padding: '10px 16px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: '1px solid var(--glass-stroke)',
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
          style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(14, 165, 233, 0.35)',
            }}
          >
            <PlaySquare size={18} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span className="font-display" style={{ fontSize: '1.4rem', letterSpacing: '0.02em', color: '#0f172a' }}>
                MY<span style={{ color: 'var(--primary-neon)' }}>YT</span>
              </span>
              <span className="badge-pill badge-cyan" style={{ fontSize: '0.52rem', padding: '1px 5px' }}>
                PRO
              </span>
            </div>
          </div>
        </Link>

        {/* 3 Clean Navigation Options (Desktop) */}
        <nav
          className="desktop-only"
          style={{
            alignItems: 'center',
            gap: 4,
            background: '#f0f9ff',
            padding: '3px 6px',
            borderRadius: 9999,
            border: '1px solid rgba(14, 165, 233, 0.22)',
          }}
        >
          <Link
            to="/"
            className="btn"
            style={{
              padding: '6px 14px',
              fontSize: '0.74rem',
              borderRadius: 9999,
              background: currentPath === '/' ? 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)' : 'transparent',
              color: currentPath === '/' ? '#ffffff' : 'var(--on-surface-variant)',
              fontWeight: currentPath === '/' ? 700 : 500,
              textDecoration: 'none',
              boxShadow: currentPath === '/' ? '0 2px 8px rgba(14, 165, 233, 0.25)' : 'none',
            }}
          >
            Home
          </Link>

          {showBuyViews && (
            <Link
              to="/buy-views"
              className="btn"
              style={{
                padding: '6px 14px',
                fontSize: '0.74rem',
                borderRadius: 9999,
                background: currentPath === '/buy-views' || currentPath === '/creator' ? 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)' : 'transparent',
                color: currentPath === '/buy-views' || currentPath === '/creator' ? '#ffffff' : 'var(--on-surface-variant)',
                fontWeight: currentPath === '/buy-views' || currentPath === '/creator' ? 700 : 500,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                boxShadow: currentPath === '/buy-views' || currentPath === '/creator' ? '0 2px 8px rgba(14, 165, 233, 0.25)' : 'none',
              }}
            >
              <Megaphone size={13} /> Buy Views
            </Link>
          )}

          {showWatchApp && (
            <Link
              to="/simulator"
              className="btn"
              style={{
                padding: '6px 14px',
                fontSize: '0.74rem',
                borderRadius: 9999,
                background: currentPath === '/simulator' || currentPath === '/watch' ? 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)' : 'transparent',
                color: currentPath === '/simulator' || currentPath === '/watch' ? '#ffffff' : 'var(--on-surface-variant)',
                fontWeight: currentPath === '/simulator' || currentPath === '/watch' ? 700 : 500,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                boxShadow: currentPath === '/simulator' || currentPath === '/watch' ? '0 2px 8px rgba(14, 165, 233, 0.25)' : 'none',
              }}
            >
              <Smartphone size={13} /> Watch App
            </Link>
          )}
        </nav>

        {/* Right Actions (Desktop) */}
        <div className="desktop-only" style={{ alignItems: 'center', gap: 8 }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* If Admin: No Creator / Viewer profiles or balance */}
              {user?.role === 'admin' ? (
                <>
                  <button
                    type="button"
                    onClick={() => navigate('/admin')}
                    className="btn btn-neon glow-neon"
                    style={{ padding: '6px 14px', fontSize: '0.76rem', borderRadius: 9999, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    title="Open Admin Control Desk"
                  >
                    <Shield size={14} /> Admin Desk
                  </button>

                  <div
                    onClick={() => navigate('/admin')}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: `1.5px solid var(--primary-neon)`,
                      background: '#f0f9ff',
                      cursor: 'pointer',
                    }}
                    title="System Administrator"
                  >
                    <img
                      src={user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=myyt-admin&backgroundColor=b6e3f4`}
                      alt="admin avatar"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  <button
                    onClick={onLogout}
                    className="btn btn-ghost"
                    style={{ padding: '6px 10px', fontSize: '0.68rem', borderRadius: 8 }}
                    title="Logout"
                  >
                    <LogOut size={13} />
                  </button>
                </>
              ) : (
                <>
                  {/* Profile Mode Switcher Pill (Regular Users) */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: '#f0f9ff',
                      padding: 2,
                      borderRadius: 9999,
                      border: '1px solid rgba(14, 165, 233, 0.22)',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => onSwitchProfile ? onSwitchProfile('viewer') : navigate('/viewer')}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 9999,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        background: isViewerMode ? '#0284c7' : 'transparent',
                        color: isViewerMode ? '#ffffff' : 'var(--on-surface-variant)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        transition: 'all 0.2s',
                      }}
                      title="Switch to Viewer Profile"
                    >
                      <PlaySquare size={12} color={isViewerMode ? '#ffffff' : '#0284c7'} />
                      <span>Viewer</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onSwitchProfile ? onSwitchProfile('campaigner') : navigate('/creator')}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 9999,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        background: isCreatorMode ? '#0284c7' : 'transparent',
                        color: isCreatorMode ? '#ffffff' : 'var(--on-surface-variant)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        transition: 'all 0.2s',
                      }}
                      title="Switch to Creator Profile"
                    >
                      <Megaphone size={12} color={isCreatorMode ? '#ffffff' : '#0284c7'} />
                      <span>Creator</span>
                    </button>
                  </div>

                  {/* Balance */}
                  <div
                    onClick={() => navigate(isCreatorMode ? '/creator' : '/viewer')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      background: '#f0f9ff',
                      padding: '4px 10px',
                      borderRadius: 10,
                      border: '1px solid rgba(14, 165, 233, 0.28)',
                      cursor: 'pointer',
                    }}
                    title={`Active Profile: ${isCreatorMode ? 'Creator Ad Budget' : 'Viewer Earnings'}`}
                  >
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary-neon)' }} className="pulse-neon" />
                    <span className="font-mono" style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--primary-neon)' }}>
                      ${activeProfileBalance.toFixed(2)} <span style={{ fontSize: '0.65rem', color: 'var(--on-surface-variant)' }}>{activeProfileLabel}</span>
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
                      border: `1.5px solid var(--primary-neon)`,
                      background: '#f0f9ff',
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
                </>
              )}
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
                style={{ padding: '6px 12px', fontSize: '0.72rem', borderRadius: 8 }}
              >
                <span>Join Free</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile Header Right Controls: Balance / Admin + Hamburger Toggle */}
        <div className="mobile-only" style={{ alignItems: 'center', gap: 8 }}>
          {user && (
            user.role === 'admin' ? (
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="btn btn-neon glow-neon"
                style={{ padding: '4px 10px', fontSize: '0.72rem', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 4 }}
              >
                <Shield size={12} /> Admin
              </button>
            ) : (
              <div
                onClick={() => navigate(isCreatorMode ? '/creator' : '/viewer')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  background: '#f0f9ff',
                  padding: '4px 8px',
                  borderRadius: 8,
                  border: '1px solid rgba(14, 165, 233, 0.28)',
                }}
                title={`Active Profile: ${isCreatorMode ? 'Creator Ad Budget' : 'Viewer Earnings'}`}
              >
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--primary-neon)' }} className="pulse-neon" />
                <span className="font-mono" style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary-neon)' }}>
                  ${activeProfileBalance.toFixed(2)}
                </span>
              </div>
            )
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: '#f0f9ff',
              border: '1px solid var(--glass-stroke)',
              color: '#0284c7',
              borderRadius: 8,
              padding: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} color="var(--primary-neon)" /> : <Menu size={20} color="var(--primary-neon)" />}
          </button>
        </div>
      </div>

      {/* Responsive Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          className="mobile-only"
          style={{
            flexDirection: 'column',
            gap: 8,
            padding: '14px 0 6px 0',
            marginTop: 10,
            borderTop: '1px solid var(--glass-stroke)',
            background: '#ffffff',
          }}
        >
          {/* 1. Home */}
          <Link
            to="/"
            onClick={closeMenu}
            style={{
              padding: '12px 16px',
              borderRadius: 12,
              background: currentPath === '/' ? '#e0f2fe' : 'transparent',
              color: currentPath === '/' ? 'var(--primary-neon)' : '#0f172a',
              fontWeight: 700,
              fontSize: '0.9rem',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            Home
          </Link>

          {/* 2. Buy Views (hidden on viewer profile and admin) */}
          {showBuyViews && user?.role !== 'admin' && (
            <Link
              to="/buy-views"
              onClick={closeMenu}
              style={{
                padding: '12px 16px',
                borderRadius: 12,
                background: currentPath === '/buy-views' || currentPath === '/creator' ? '#e0f2fe' : 'transparent',
                color: currentPath === '/buy-views' || currentPath === '/creator' ? 'var(--primary-neon)' : '#0f172a',
                fontWeight: 700,
                fontSize: '0.9rem',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <Megaphone size={16} color="var(--primary-neon)" /> Buy Views
            </Link>
          )}

          {/* 3. Watch App (hidden on creator profile and admin) */}
          {showWatchApp && user?.role !== 'admin' && (
            <Link
              to="/simulator"
              onClick={closeMenu}
              style={{
                padding: '12px 16px',
                borderRadius: 12,
                background: currentPath === '/simulator' || currentPath === '/watch' ? '#e0f2fe' : 'transparent',
                color: currentPath === '/simulator' || currentPath === '/watch' ? 'var(--primary-neon)' : '#0f172a',
                fontWeight: 700,
                fontSize: '0.9rem',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <Smartphone size={16} color="var(--primary-neon)" /> Watch App
            </Link>
          )}

          {/* Auth / Profile Actions on Mobile */}
          <div style={{ borderTop: '1px solid rgba(14, 165, 233, 0.15)', paddingTop: 10, marginTop: 4 }}>
            {user ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {user.role === 'admin' ? (
                  <button
                    type="button"
                    onClick={() => {
                      navigate('/admin');
                      closeMenu();
                    }}
                    className="btn btn-neon glow-neon"
                    style={{ width: '100%', padding: '12px', borderRadius: 10, fontSize: '0.86rem', justifyContent: 'center', gap: 6 }}
                  >
                    <Shield size={16} /> Open Admin Panel
                  </button>
                ) : (
                  /* Mobile Profile Switcher Pill for Regular Users */
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, background: '#f0f9ff', padding: 4, borderRadius: 12, border: '1px solid var(--glass-stroke)' }}>
                    <button
                      type="button"
                      onClick={() => {
                        if (onSwitchProfile) onSwitchProfile('viewer');
                        else navigate('/viewer');
                        closeMenu();
                      }}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 10,
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        background: isViewerMode ? 'var(--primary-neon)' : 'transparent',
                        color: isViewerMode ? '#ffffff' : 'var(--on-surface-variant)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        boxShadow: isViewerMode ? '0 2px 8px rgba(14, 165, 233, 0.28)' : 'none',
                        transition: 'all 0.2s',
                      }}
                    >
                      <PlaySquare size={16} color={isViewerMode ? '#ffffff' : 'var(--primary-neon)'} />
                      <span>Viewer Profile</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (onSwitchProfile) onSwitchProfile('campaigner');
                        else navigate('/creator');
                        closeMenu();
                      }}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 10,
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        background: isCreatorMode ? 'var(--primary-neon)' : 'transparent',
                        color: isCreatorMode ? '#ffffff' : 'var(--on-surface-variant)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        boxShadow: isCreatorMode ? '0 2px 8px rgba(14, 165, 233, 0.28)' : 'none',
                        transition: 'all 0.2s',
                      }}
                    >
                      <Megaphone size={16} color={isCreatorMode ? '#ffffff' : 'var(--primary-neon)'} />
                      <span>Creator Profile</span>
                    </button>
                  </div>
                )}

                <button
                  onClick={() => {
                    onLogout();
                    closeMenu();
                  }}
                  className="btn btn-ghost"
                  style={{ width: '100%', padding: '10px', borderRadius: 10, fontSize: '0.78rem', justifyContent: 'center' }}
                >
                  <LogOut size={13} /> Logout ({user.email.split('@')[0]})
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => {
                    onOpenAuth('signin');
                    closeMenu();
                  }}
                  className="btn btn-ghost"
                  style={{ flex: 1, padding: '10px', borderRadius: 10, fontSize: '0.78rem' }}
                >
                  <LogIn size={13} /> Sign In
                </button>

                <button
                  onClick={() => {
                    onOpenAuth('signup', 'viewer');
                    closeMenu();
                  }}
                  className="btn btn-neon glow-neon"
                  style={{ flex: 1, padding: '10px', borderRadius: 10, fontSize: '0.78rem' }}
                >
                  Join Free
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
