import React from 'react';
import { Shield, Lock, AlertCircle } from 'lucide-react';

interface AdminLoginProps {
  passwordInput: string;
  setPasswordInput: (val: string) => void;
  loginLoading: boolean;
  loginError: string | null;
  onLogin: (e: React.FormEvent) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  passwordInput,
  setPasswordInput,
  loginLoading,
  loginError,
  onLogin,
}) => {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div
        className="glass-card"
        style={{
          maxWidth: 420,
          width: '100%',
          padding: '36px 30px',
          borderRadius: 20,
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
          border: '1.5px solid rgba(14, 165, 233, 0.25)',
        }}
      >
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: 18,
            background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
            color: 'var(--primary-neon)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 18px',
            border: '1.5px solid rgba(14, 165, 233, 0.35)',
            boxShadow: '0 8px 20px rgba(14, 165, 233, 0.2)',
          }}
        >
          <Shield size={32} />
        </div>

        <h2 className="font-display" style={{ fontSize: '1.75rem', color: '#0f172a', margin: 0, letterSpacing: '0.02em' }}>
          ADMIN ACCESS
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.86rem', marginTop: 6, marginBottom: 22 }}>
          Enter administrator security password to unlock control surface.
        </p>

        {loginError && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 10,
              padding: '10px 14px',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: '#b91c1c',
              fontSize: '0.84rem',
              textAlign: 'left',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{loginError}</span>
          </div>
        )}

        <form onSubmit={onLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ position: 'relative' }}>
            <input
              type="password"
              placeholder="Enter Admin Password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="input-field"
              style={{
                padding: '13px 16px',
                fontSize: '0.98rem',
                letterSpacing: '0.05em',
                borderRadius: 12,
                textAlign: 'center',
              }}
              required
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loginLoading || !passwordInput}
            className="btn btn-neon glow-neon"
            style={{
              padding: '13px',
              fontSize: '0.96rem',
              borderRadius: 12,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Lock size={16} />
            {loginLoading ? 'Authenticating...' : 'Unlock Admin Panel'}
          </button>
        </form>
      </div>
    </div>
  );
};
