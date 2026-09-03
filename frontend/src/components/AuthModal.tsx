import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, ShieldCheck, PlaySquare, ArrowRight, CheckCircle2, Megaphone, PlayCircle, Rocket } from 'lucide-react';
import { apiRequest, setAuthToken } from '../api';
import { User as UserType } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'signin' | 'signup';
  initialRole?: 'viewer' | 'campaigner';
  onClose: () => void;
  onAuthSuccess: (user: UserType, token: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'signin',
  initialRole = 'viewer',
  onClose,
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [role, setRole] = useState<'viewer' | 'campaigner'>(initialRole);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMode(initialMode);
    setRole(initialRole);
    setError(null);
  }, [initialMode, initialRole, isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Handle Google OAuth Sign In / Sign Up
  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);

    const googleEmail = email.trim().toLowerCase() || `${role}_user@gmail.com`;
    const googleName = name.trim() || (googleEmail.split('@')[0].replace(/[._]/g, ' '));
    const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(googleEmail)}`;

    try {
      const res = await apiRequest<{ user: UserType; token: string }>('/auth/google', {
        method: 'POST',
        body: JSON.stringify({
          email: googleEmail,
          name: googleName,
          avatar,
          googleId: `google_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
          role,
        }),
      });

      if (res.success && res.data) {
        setAuthToken(res.data.token);
        onAuthSuccess(res.data.user, res.data.token);
        onClose();
      } else {
        setError(res.error || 'Failed to authenticate with Google');
      }
    } catch (err: any) {
      setError(err.message || 'Google authentication connection failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle Traditional Email Password Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        if (!name.trim()) {
          setError('Please provide your full name');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }

        const res = await apiRequest<{ user: UserType; token: string }>('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ email: email.trim().toLowerCase(), name: name.trim(), password, role }),
        });

        if (res.success && res.data) {
          setAuthToken(res.data.token);
          onAuthSuccess(res.data.user, res.data.token);
          onClose();
        } else {
          setError(res.error || 'Registration failed');
        }
      } else {
        const res = await apiRequest<{ user: UserType; token: string }>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
        });

        if (res.success && res.data) {
          setAuthToken(res.data.token);
          // Auto-detect role from backend and route to the corresponding dashboard
          onAuthSuccess(res.data.user, res.data.token);
          onClose();
        } else {
          setError(res.error || 'Invalid email or password');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: 440,
          background: '#161616',
          borderRadius: 24,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Glow Top Highlight Line */}
        <div
          style={{
            height: 3,
            width: '100%',
            background: 'linear-gradient(90deg, #c3f400 0%, #78d3ee 100%)',
          }}
        />

        {/* Modal Header */}
        <div style={{ padding: '24px 28px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'var(--primary-neon)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 18px rgba(195, 244, 0, 0.35)',
              }}
            >
              <PlaySquare size={22} color="#161e00" />
            </div>
            <div>
              <div className="font-display" style={{ fontSize: '1.5rem', color: '#ffffff', letterSpacing: '0.04em', lineHeight: 1.1 }}>
                MY<span style={{ color: 'var(--primary-neon)' }}>YT</span> ACCESS
              </div>
              <div className="font-mono" style={{ fontSize: '0.76rem', color: 'var(--on-surface-variant)', marginTop: 2 }}>
                {mode === 'signup' ? 'Create your account & pick your role' : 'Welcome back! Auto-detects your dashboard'}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-ghost"
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              color: 'var(--on-surface-variant)',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Mode Switcher Tabs (Sign In vs Create Account) */}
        <div style={{ padding: '0 28px', marginBottom: 18 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              background: '#0e0e0e',
              padding: 4,
              borderRadius: 14,
              border: '1px solid var(--glass-stroke)',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError(null);
              }}
              style={{
                padding: '10px 0',
                borderRadius: 10,
                fontSize: '0.825rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: 'none',
                background: mode === 'signin' ? 'var(--primary-neon)' : 'transparent',
                color: mode === 'signin' ? '#161e00' : 'var(--on-surface-variant)',
                fontFamily: 'JetBrains Mono',
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
              style={{
                padding: '10px 0',
                borderRadius: 10,
                fontSize: '0.825rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: 'none',
                background: mode === 'signup' ? 'var(--primary-neon)' : 'transparent',
                color: mode === 'signup' ? '#161e00' : 'var(--on-surface-variant)',
                fontFamily: 'JetBrains Mono',
              }}
            >
              Create Account
            </button>
          </div>
        </div>

        <div style={{ padding: '0 28px 28px' }}>
          {/* Explicit 2-Role Selection (Shown during Account Creation) */}
          {mode === 'signup' && (
            <div style={{ marginBottom: 16 }}>
              <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                Choose Your Account Role:
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {/* Viewer Role Card */}
                <div
                  onClick={() => setRole('viewer')}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 12,
                    cursor: 'pointer',
                    border: `1.5px solid ${role === 'viewer' ? 'var(--primary-neon)' : 'var(--glass-stroke)'}`,
                    background: role === 'viewer' ? 'rgba(195, 244, 0, 0.12)' : '#101010',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <PlayCircle size={16} color="var(--primary-neon)" />
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: role === 'viewer' ? 'var(--primary-neon)' : '#ffffff' }}>
                        Viewer
                      </span>
                    </div>
                    {role === 'viewer' && <CheckCircle2 size={14} color="var(--primary-neon)" />}
                  </div>
                  <span style={{ fontSize: '0.66rem', color: 'var(--on-surface-variant)', lineHeight: 1.3 }}>
                    Watch videos & earn cash
                  </span>
                </div>

                {/* Creator Role Card */}
                <div
                  onClick={() => setRole('campaigner')}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 12,
                    cursor: 'pointer',
                    border: `1.5px solid ${role === 'campaigner' ? 'var(--secondary-cyan)' : 'var(--glass-stroke)'}`,
                    background: role === 'campaigner' ? 'rgba(120, 211, 238, 0.12)' : '#101010',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Rocket size={16} color="var(--secondary-cyan)" />
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: role === 'campaigner' ? 'var(--secondary-cyan)' : '#ffffff' }}>
                        Creator
                      </span>
                    </div>
                    {role === 'campaigner' && <CheckCircle2 size={14} color="var(--secondary-cyan)" />}
                  </div>
                  <span style={{ fontSize: '0.66rem', color: 'var(--on-surface-variant)', lineHeight: 1.3 }}>
                    Buy real views & promote
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: 12,
                padding: '10px 14px',
                fontSize: '0.78rem',
                color: '#fca5a5',
                marginBottom: 14,
              }}
            >
              {error}
            </div>
          )}

          {/* GOOGLE AUTH BUTTON */}
          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleAuth}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              padding: '13px 18px',
              background: '#ffffff',
              color: '#1f1f1f',
              borderRadius: 14,
              fontWeight: 650,
              fontSize: '0.9rem',
              cursor: 'pointer',
              border: 'none',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.25)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f4f4f4')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
          >
            {/* Google official multi-color SVG icon */}
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.02h3.87c2.26-2.09 3.675-5.17 3.675-9.12z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.02c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.28v3.12C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.27 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.61H1.28C.46 8.23 0 10.06 0 12s.46 3.77 1.28 5.39l3.99-3.12z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.28 6.61l3.99 3.12c.95-2.85 3.6-4.98 6.73-4.98z"
              />
            </svg>
            <span>{mode === 'signup' ? `Sign up as ${role === 'campaigner' ? 'Creator' : 'Viewer'} with Google` : 'Continue with Google'}</span>
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255, 255, 255, 0.08)' }} />
            <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>
              OR WITH EMAIL
            </span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255, 255, 255, 0.08)' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mode === 'signup' && (
              <div>
                <label className="font-mono" style={{ fontSize: '0.76rem', color: 'var(--on-surface-variant)', display: 'block', marginBottom: 6 }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="input-field"
                    style={{ padding: '11px 14px 11px 40px', fontSize: '0.85rem', borderRadius: 12, background: '#0e0e0e' }}
                  />
                  <User size={16} color="var(--on-surface-variant)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>
            )}

            <div>
              <label className="font-mono" style={{ fontSize: '0.76rem', color: 'var(--on-surface-variant)', display: 'block', marginBottom: 6 }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="input-field"
                  style={{ padding: '11px 14px 11px 40px', fontSize: '0.85rem', borderRadius: 12, background: '#0e0e0e' }}
                />
                <Mail size={16} color="var(--on-surface-variant)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div>
              <label className="font-mono" style={{ fontSize: '0.76rem', color: 'var(--on-surface-variant)', display: 'block', marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field"
                  style={{ padding: '11px 40px 11px 40px', fontSize: '0.85rem', borderRadius: 12, background: '#0e0e0e' }}
                />
                <Lock size={16} color="var(--on-surface-variant)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--on-surface-variant)',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-neon glow-neon"
              style={{
                width: '100%',
                padding: '13px',
                marginTop: 6,
                fontSize: '0.85rem',
                borderRadius: 14,
                fontWeight: 750,
                letterSpacing: '0.5px',
              }}
            >
              {loading ? (
                <span>Processing...</span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                  {mode === 'signup' ? `CREATE ${role === 'campaigner' ? 'CREATOR' : 'VIEWER'} ACCOUNT` : 'SIGN IN TO ACCOUNT'}
                  <ArrowRight size={16} />
                </span>
              )}
            </button>
          </form>

          {/* Footer Security */}
          <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <ShieldCheck size={14} color="var(--primary-neon)" />
            <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--on-surface-variant)' }}>
              256-Bit Encrypted & Anti-Fraud Protected
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
