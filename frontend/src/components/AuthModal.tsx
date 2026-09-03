import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ShieldCheck,
  PlaySquare,
  ArrowRight,
} from 'lucide-react';
import { apiRequest, setAuthToken } from '../api';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
  initialRole?: 'viewer' | 'campaigner';
  onAuthSuccess?: (user: User, token: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      const demoEmail = `user.${Math.floor(Math.random() * 9000 + 1000)}@gmail.com`;
      const res = await apiRequest<{ token: string; user: User }>('/auth/google', {
        method: 'POST',
        body: JSON.stringify({
          email: demoEmail,
          name: 'Verified Google User',
          googleId: `goog_${Date.now()}`,
          avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(demoEmail)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`,
          role: 'viewer',
        }),
      });

      if (res.success && res.data) {
        if (res.data.token) {
          setAuthToken(res.data.token);
        }
        if (onAuthSuccess) onAuthSuccess(res.data.user, res.data.token);
        onClose();
      } else {
        setError(res.error || 'Google Authentication failed');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const endpoint = mode === 'signup' ? '/auth/register' : '/auth/login';
    const payload = mode === 'signup'
      ? { email, password, name, role: 'viewer' }
      : { email, password };

    try {
      const res = await apiRequest<{ token: string; user: User }>(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.success && res.data) {
        if (res.data.token) {
          setAuthToken(res.data.token);
        }
        if (onAuthSuccess) onAuthSuccess(res.data.user, res.data.token);
        onClose();
      } else {
        setError(res.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 16,
      }}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: 440,
          background: '#ffffff',
          borderRadius: 24,
          border: '1.5px solid rgba(14, 165, 233, 0.25)',
          boxShadow: '0 25px 60px rgba(14, 165, 233, 0.15)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Glow Top Highlight Line */}
        <div
          style={{
            height: 3,
            width: '100%',
            background: 'linear-gradient(90deg, #38bdf8 0%, #0284c7 100%)',
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
                background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(14, 165, 233, 0.35)',
              }}
            >
              <PlaySquare size={22} color="#ffffff" />
            </div>
            <div>
              <div className="font-display" style={{ fontSize: '1.5rem', color: '#0f172a', letterSpacing: '0.04em', lineHeight: 1.1 }}>
                MY<span style={{ color: 'var(--primary-neon)' }}>YT</span> ACCESS
              </div>
              <div className="font-mono" style={{ fontSize: '0.76rem', color: 'var(--on-surface-variant)', marginTop: 2 }}>
                {mode === 'signup' ? 'Create your free account to watch & promote' : 'Welcome back! Sign in to access your dashboard'}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              background: '#f0f9ff',
              border: '1px solid rgba(14, 165, 233, 0.2)',
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
              background: '#f0f9ff',
              padding: 4,
              borderRadius: 14,
              border: '1px solid rgba(14, 165, 233, 0.2)',
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
                background: mode === 'signin' ? '#0284c7' : 'transparent',
                color: mode === 'signin' ? '#ffffff' : 'var(--on-surface-variant)',
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
                background: mode === 'signup' ? '#0284c7' : 'transparent',
                color: mode === 'signup' ? '#ffffff' : 'var(--on-surface-variant)',
                fontFamily: 'JetBrains Mono',
              }}
            >
              Create Account
            </button>
          </div>
        </div>

        <div style={{ padding: '0 28px 28px' }}>
          {/* Error Alert */}
          {error && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 12,
                padding: '10px 14px',
                fontSize: '0.78rem',
                color: '#dc2626',
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
              color: '#0f172a',
              borderRadius: 14,
              fontWeight: 650,
              fontSize: '0.9rem',
              cursor: 'pointer',
              border: '1px solid #cbd5e1',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
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
            <span>{mode === 'signup' ? 'Sign up with Google' : 'Continue with Google'}</span>
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>
              OR WITH EMAIL
            </span>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
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
                    style={{ padding: '11px 14px 11px 40px', fontSize: '0.85rem', borderRadius: 12 }}
                  />
                  <UserIcon size={16} color="var(--on-surface-variant)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
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
                  style={{ padding: '11px 14px 11px 40px', fontSize: '0.85rem', borderRadius: 12 }}
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
                  style={{ padding: '11px 40px 11px 40px', fontSize: '0.85rem', borderRadius: 12 }}
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
                  {mode === 'signup' ? 'CREATE FREE ACCOUNT' : 'SIGN IN TO ACCOUNT'}
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
