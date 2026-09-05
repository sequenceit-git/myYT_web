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
  LayoutDashboard,
  ArrowUpRight,
  History,
  PlusCircle,
  CreditCard,
  Rocket,
  UserCheck,
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
  const currentTab = new URLSearchParams(location.search).get('tab') || 'overview';
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
      style={{
        borderRadius: 0,
        padding: '10px 16px',
        background: '#ffffff',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        borderBottom: '1px solid var(--glass-stroke)',
        boxShadow: '0 2px 12px rgba(14, 165, 233, 0.07)',
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
          <img
            src="/favicon.svg"
            alt="myYT"
            style={{
              width: 34,
              height: 34,
              display: 'block',
              borderRadius: 10,
              boxShadow: '0 3px 12px rgba(230, 0, 38, 0.28)',
            }}
          />
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
                    onClick={() => navigate(isCreatorMode ? '/creator?tab=profile' : '/viewer?tab=profile')}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: `1.5px solid var(--primary-neon)`,
                      background: '#f0f9ff',
                      cursor: 'pointer',
                    }}
                    title="View Account Profile"
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

      {/* Backdrop overlay (dims page below the navbar) */}
      {mobileMenuOpen && (
        <div
          onClick={closeMenu}
          className="mobile-only"
          style={{
            position: 'fixed',
            top: 54,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(3px)',
            WebkitBackdropFilter: 'blur(3px)',
            zIndex: 998,
          }}
        />
      )}

      {/* Floating Overlay Menu (cleanly attached to bottom of nav bar) */}
      {mobileMenuOpen && (
        <div
          className="mobile-only"
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            left: 0,
            maxWidth: 420,
            marginLeft: 'auto',
            marginRight: 'auto',
            flexDirection: 'column',
            gap: 10,
            padding: '14px 16px 18px 16px',
            background: '#ffffff',
            borderRadius: '0 0 20px 20px',
            border: '1.5px solid rgba(14, 165, 233, 0.28)',
            borderTop: '1px solid #f1f5f9',
            boxShadow: '0 24px 50px -4px rgba(14, 165, 233, 0.22), 0 12px 30px -4px rgba(0, 0, 0, 0.15)',
            zIndex: 1001,
            maxHeight: 'calc(85vh - 65px)',
            overflowY: 'auto',
          }}
        >
          {user ? (
            <>
              {/* 1. Mobile User Profile Card */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                  border: '1px solid rgba(14, 165, 233, 0.25)',
                }}
              >
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.email || user.name || 'user')}`}
                  alt="avatar"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    border: '2px solid var(--primary-neon)',
                    objectFit: 'cover',
                    background: '#ffffff',
                    flexShrink: 0,
                  }}
                />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontSize: '0.94rem',
                      fontWeight: 800,
                      color: '#0f172a',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {user.name || user.email.split('@')[0]}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2, flexWrap: 'wrap' }}>
                    <span
                      className="badge-pill"
                      style={{
                        fontSize: '0.62rem',
                        padding: '1px 7px',
                        fontWeight: 800,
                        background: isCreatorMode ? '#0284c7' : '#0ea5e9',
                        color: '#ffffff',
                      }}
                    >
                      {user.role === 'admin' ? 'ADMIN' : (isCreatorMode ? 'CREATOR STUDIO' : 'VIEWER PROFILE')}
                    </span>
                    <span className="font-mono" style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-neon)' }}>
                      ${activeProfileBalance.toFixed(2)}{' '}
                      <span style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 600 }}>
                        {isCreatorMode ? 'Budget' : 'Earned'}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. 2-Tab Profile Switcher (Segmented Tabs) */}
              {user.role !== 'admin' && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 4,
                    background: '#f0f9ff',
                    padding: 3,
                    borderRadius: 10,
                    border: '1px solid rgba(14, 165, 233, 0.22)',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (onSwitchProfile) onSwitchProfile('viewer');
                      else navigate('/viewer');
                      closeMenu();
                    }}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 8,
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      background: isViewerMode ? 'var(--primary-neon)' : 'transparent',
                      color: isViewerMode ? '#ffffff' : 'var(--on-surface-variant)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      boxShadow: isViewerMode ? '0 2px 8px rgba(14, 165, 233, 0.28)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <PlaySquare size={14} color={isViewerMode ? '#ffffff' : 'var(--primary-neon)'} />
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
                      padding: '8px 10px',
                      borderRadius: 8,
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      background: isCreatorMode ? 'var(--primary-neon)' : 'transparent',
                      color: isCreatorMode ? '#ffffff' : 'var(--on-surface-variant)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      boxShadow: isCreatorMode ? '0 2px 8px rgba(14, 165, 233, 0.28)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Megaphone size={14} color={isCreatorMode ? '#ffffff' : 'var(--primary-neon)'} />
                    <span>Creator Profile</span>
                  </button>
                </div>
              )}

              {/* 3. All Sections (for Viewer or Creator) */}
              {user.role !== 'admin' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <div
                    className="font-mono"
                    style={{
                      fontSize: '0.7rem',
                      color: '#64748b',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      padding: '2px 4px 0 4px',
                    }}
                  >
                    {isCreatorMode ? 'Creator Studio Sections' : 'Viewer Studio Sections'}
                  </div>

                  {isViewerMode && (
                    <>
                      {/* Overview */}
                      <button
                        type="button"
                        onClick={() => {
                          navigate('/viewer?tab=overview');
                          closeMenu();
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '9px 12px',
                          borderRadius: 10,
                          border: currentPath === '/viewer' && currentTab === 'overview' ? '1.5px solid var(--primary-neon)' : '1px solid #f1f5f9',
                          background: currentPath === '/viewer' && currentTab === 'overview' ? '#e0f2fe' : '#ffffff',
                          color: currentPath === '/viewer' && currentTab === 'overview' ? '#0284c7' : '#334155',
                          fontWeight: currentPath === '/viewer' && currentTab === 'overview' ? 700 : 600,
                          fontSize: '0.84rem',
                          cursor: 'pointer',
                          width: '100%',
                          textAlign: 'left',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <LayoutDashboard size={16} color="var(--primary-neon)" />
                          <span>Overview</span>
                        </div>
                      </button>

                      {/* Watch & Earn (APP) */}
                      <button
                        type="button"
                        onClick={() => {
                          navigate('/viewer?tab=watch');
                          closeMenu();
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '9px 12px',
                          borderRadius: 10,
                          border: currentPath === '/viewer' && currentTab === 'watch' ? '1.5px solid var(--primary-neon)' : '1px solid #f1f5f9',
                          background: currentPath === '/viewer' && currentTab === 'watch' ? '#e0f2fe' : '#ffffff',
                          color: currentPath === '/viewer' && currentTab === 'watch' ? '#0284c7' : '#334155',
                          fontWeight: currentPath === '/viewer' && currentTab === 'watch' ? 700 : 600,
                          fontSize: '0.84rem',
                          cursor: 'pointer',
                          width: '100%',
                          textAlign: 'left',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Smartphone size={16} color="var(--primary-neon)" />
                          <span>Watch & Earn</span>
                        </div>
                        <span className="badge-pill badge-hot" style={{ fontSize: '0.6rem', padding: '1px 5px' }}>
                          APP
                        </span>
                      </button>

                      {/* Withdraw Cash */}
                      <button
                        type="button"
                        onClick={() => {
                          navigate('/viewer?tab=withdraw');
                          closeMenu();
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '9px 12px',
                          borderRadius: 10,
                          border: currentPath === '/viewer' && currentTab === 'withdraw' ? '1.5px solid var(--primary-neon)' : '1px solid #f1f5f9',
                          background: currentPath === '/viewer' && currentTab === 'withdraw' ? '#e0f2fe' : '#ffffff',
                          color: currentPath === '/viewer' && currentTab === 'withdraw' ? '#0284c7' : '#334155',
                          fontWeight: currentPath === '/viewer' && currentTab === 'withdraw' ? 700 : 600,
                          fontSize: '0.84rem',
                          cursor: 'pointer',
                          width: '100%',
                          textAlign: 'left',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <ArrowUpRight size={16} color="var(--primary-neon)" />
                          <span>Withdraw Cash</span>
                        </div>
                      </button>

                      {/* Payout Ledger */}
                      <button
                        type="button"
                        onClick={() => {
                          navigate('/viewer?tab=transactions');
                          closeMenu();
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '9px 12px',
                          borderRadius: 10,
                          border: currentPath === '/viewer' && currentTab === 'transactions' ? '1.5px solid var(--primary-neon)' : '1px solid #f1f5f9',
                          background: currentPath === '/viewer' && currentTab === 'transactions' ? '#e0f2fe' : '#ffffff',
                          color: currentPath === '/viewer' && currentTab === 'transactions' ? '#0284c7' : '#334155',
                          fontWeight: currentPath === '/viewer' && currentTab === 'transactions' ? 700 : 600,
                          fontSize: '0.84rem',
                          cursor: 'pointer',
                          width: '100%',
                          textAlign: 'left',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <History size={16} color="var(--primary-neon)" />
                          <span>Payout Ledger</span>
                        </div>
                      </button>

                      {/* Account Profile */}
                      <button
                        type="button"
                        onClick={() => {
                          navigate('/viewer?tab=profile');
                          closeMenu();
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '9px 12px',
                          borderRadius: 10,
                          border: currentPath === '/viewer' && currentTab === 'profile' ? '1.5px solid var(--primary-neon)' : '1px solid #f1f5f9',
                          background: currentPath === '/viewer' && currentTab === 'profile' ? '#e0f2fe' : '#ffffff',
                          color: currentPath === '/viewer' && currentTab === 'profile' ? '#0284c7' : '#334155',
                          fontWeight: currentPath === '/viewer' && currentTab === 'profile' ? 700 : 600,
                          fontSize: '0.84rem',
                          cursor: 'pointer',
                          width: '100%',
                          textAlign: 'left',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <UserCheck size={16} color="var(--primary-neon)" />
                          <span>Account Profile</span>
                        </div>
                      </button>
                    </>
                  )}

                  {isCreatorMode && (
                    <>
                      {/* Overview */}
                      <button
                        type="button"
                        onClick={() => {
                          navigate('/creator?tab=overview');
                          closeMenu();
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '9px 12px',
                          borderRadius: 10,
                          border: currentPath === '/creator' && currentTab === 'overview' ? '1.5px solid var(--primary-neon)' : '1px solid #f1f5f9',
                          background: currentPath === '/creator' && currentTab === 'overview' ? '#e0f2fe' : '#ffffff',
                          color: currentPath === '/creator' && currentTab === 'overview' ? '#0284c7' : '#334155',
                          fontWeight: currentPath === '/creator' && currentTab === 'overview' ? 700 : 600,
                          fontSize: '0.84rem',
                          cursor: 'pointer',
                          width: '100%',
                          textAlign: 'left',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <LayoutDashboard size={16} color="var(--primary-neon)" />
                          <span>Overview</span>
                        </div>
                      </button>

                      {/* New Campaign */}
                      <button
                        type="button"
                        onClick={() => {
                          navigate('/buy-views');
                          closeMenu();
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '9px 12px',
                          borderRadius: 10,
                          border: currentPath === '/buy-views' ? '1.5px solid var(--primary-neon)' : '1px solid #f1f5f9',
                          background: currentPath === '/buy-views' ? '#e0f2fe' : '#ffffff',
                          color: currentPath === '/buy-views' ? '#0284c7' : '#334155',
                          fontWeight: currentPath === '/buy-views' ? 700 : 600,
                          fontSize: '0.84rem',
                          cursor: 'pointer',
                          width: '100%',
                          textAlign: 'left',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <PlusCircle size={16} color="var(--primary-neon)" />
                          <span>New Campaign</span>
                        </div>
                        <span className="badge-pill badge-cyan" style={{ fontSize: '0.6rem', padding: '1px 5px' }}>
                          ORDER
                        </span>
                      </button>

                      {/* Campaigns */}
                      <button
                        type="button"
                        onClick={() => {
                          navigate('/creator?tab=campaigns');
                          closeMenu();
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '9px 12px',
                          borderRadius: 10,
                          border: currentPath === '/creator' && currentTab === 'campaigns' ? '1.5px solid var(--primary-neon)' : '1px solid #f1f5f9',
                          background: currentPath === '/creator' && currentTab === 'campaigns' ? '#e0f2fe' : '#ffffff',
                          color: currentPath === '/creator' && currentTab === 'campaigns' ? '#0284c7' : '#334155',
                          fontWeight: currentPath === '/creator' && currentTab === 'campaigns' ? 700 : 600,
                          fontSize: '0.84rem',
                          cursor: 'pointer',
                          width: '100%',
                          textAlign: 'left',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Megaphone size={16} color="var(--primary-neon)" />
                          <span>Campaigns</span>
                        </div>
                      </button>

                      {/* Deposit Budget */}
                      <button
                        type="button"
                        onClick={() => {
                          navigate('/creator?tab=deposit');
                          closeMenu();
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '9px 12px',
                          borderRadius: 10,
                          border: currentPath === '/creator' && currentTab === 'deposit' ? '1.5px solid var(--primary-neon)' : '1px solid #f1f5f9',
                          background: currentPath === '/creator' && currentTab === 'deposit' ? '#e0f2fe' : '#ffffff',
                          color: currentPath === '/creator' && currentTab === 'deposit' ? '#0284c7' : '#334155',
                          fontWeight: currentPath === '/creator' && currentTab === 'deposit' ? 700 : 600,
                          fontSize: '0.84rem',
                          cursor: 'pointer',
                          width: '100%',
                          textAlign: 'left',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <CreditCard size={16} color="var(--primary-neon)" />
                          <span>Deposit Budget</span>
                        </div>
                      </button>

                      {/* Spend Ledger */}
                      <button
                        type="button"
                        onClick={() => {
                          navigate('/creator?tab=ledger');
                          closeMenu();
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '9px 12px',
                          borderRadius: 10,
                          border: currentPath === '/creator' && currentTab === 'ledger' ? '1.5px solid var(--primary-neon)' : '1px solid #f1f5f9',
                          background: currentPath === '/creator' && currentTab === 'ledger' ? '#e0f2fe' : '#ffffff',
                          color: currentPath === '/creator' && currentTab === 'ledger' ? '#0284c7' : '#334155',
                          fontWeight: currentPath === '/creator' && currentTab === 'ledger' ? 700 : 600,
                          fontSize: '0.84rem',
                          cursor: 'pointer',
                          width: '100%',
                          textAlign: 'left',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <History size={16} color="var(--primary-neon)" />
                          <span>Spend Ledger</span>
                        </div>
                      </button>

                      {/* Account Profile */}
                      <button
                        type="button"
                        onClick={() => {
                          navigate('/creator?tab=profile');
                          closeMenu();
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '9px 12px',
                          borderRadius: 10,
                          border: currentPath === '/creator' && currentTab === 'profile' ? '1.5px solid var(--primary-neon)' : '1px solid #f1f5f9',
                          background: currentPath === '/creator' && currentTab === 'profile' ? '#e0f2fe' : '#ffffff',
                          color: currentPath === '/creator' && currentTab === 'profile' ? '#0284c7' : '#334155',
                          fontWeight: currentPath === '/creator' && currentTab === 'profile' ? 700 : 600,
                          fontSize: '0.84rem',
                          cursor: 'pointer',
                          width: '100%',
                          textAlign: 'left',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <UserCheck size={16} color="var(--primary-neon)" />
                          <span>Account Profile</span>
                        </div>
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Admin Panel link for admin role */}
              {user.role === 'admin' && (
                <button
                  type="button"
                  onClick={() => {
                    navigate('/admin');
                    closeMenu();
                  }}
                  className="btn btn-neon glow-neon"
                  style={{ width: '100%', padding: '10px', borderRadius: 10, fontSize: '0.84rem', justifyContent: 'center', gap: 6 }}
                >
                  <Shield size={15} /> Open Admin Panel
                </button>
              )}

              {/* 4. Home Link & Logout */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Link
                  to="/"
                  onClick={closeMenu}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 8,
                    color: '#64748b',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  Home
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    onLogout();
                    closeMenu();
                  }}
                  className="btn btn-ghost"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 8,
                    fontSize: '0.76rem',
                    justifyContent: 'center',
                    color: '#ef4444',
                    borderColor: 'rgba(239, 68, 68, 0.25)',
                  }}
                >
                  <LogOut size={13} /> Logout ({user.name || user.email.split('@')[0]})
                </button>
              </div>
            </>
          ) : (
            /* Guest Visitors */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Link
                to="/"
                onClick={closeMenu}
                style={{
                  padding: '9px 12px',
                  borderRadius: 8,
                  background: currentPath === '/' ? '#e0f2fe' : 'transparent',
                  color: currentPath === '/' ? 'var(--primary-neon)' : '#0f172a',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  textDecoration: 'none',
                }}
              >
                Home
              </Link>
              <Link
                to="/buy-views"
                onClick={closeMenu}
                style={{
                  padding: '9px 12px',
                  borderRadius: 8,
                  color: '#0f172a',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Megaphone size={15} color="var(--primary-neon)" /> Buy Views
              </Link>
              <Link
                to="/simulator"
                onClick={closeMenu}
                style={{
                  padding: '9px 12px',
                  borderRadius: 8,
                  color: '#0f172a',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Smartphone size={15} color="var(--primary-neon)" /> Watch App
              </Link>
              <div style={{ display: 'flex', gap: 6, marginTop: 4, paddingTop: 8, borderTop: '1px solid var(--glass-stroke)' }}>
                <button
                  onClick={() => {
                    onOpenAuth('signin');
                    closeMenu();
                  }}
                  className="btn btn-ghost"
                  style={{ flex: 1, padding: '8px', borderRadius: 8, fontSize: '0.76rem' }}
                >
                  <LogIn size={12} /> Sign In
                </button>
                <button
                  onClick={() => {
                    onOpenAuth('signup', 'viewer');
                    closeMenu();
                  }}
                  className="btn btn-neon glow-neon"
                  style={{ flex: 1, padding: '8px', borderRadius: 8, fontSize: '0.76rem' }}
                >
                  Join Free
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
