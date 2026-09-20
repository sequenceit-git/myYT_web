import React from 'react';
import { Shield, Lock, AlertCircle, Mail, UserCheck } from 'lucide-react';

interface AdminLoginProps {
  loginMode: 'master' | 'sub_admin';
  setLoginMode: (mode: 'master' | 'sub_admin') => void;
  emailInput: string;
  setEmailInput: (val: string) => void;
  passwordInput: string;
  setPasswordInput: (val: string) => void;
  loginLoading: boolean;
  loginError: string | null;
  onLogin: (e: React.FormEvent) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  loginMode,
  setLoginMode,
  emailInput,
  setEmailInput,
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
          maxWidth: 440,
          width: '100%',
          padding: '36px 30px',
          borderRadius: 20,
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
          border: '1.5px solid rgba(14, 165, 233, 0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, margin: '0 auto 16px' }}>
          <img
            src="/image.png"
            alt="ytCash PRO"
            style={{
              height: 42,
              width: 'auto',
              display: 'block',
              objectFit: 'contain',
            }}
          />
          <span className="badge-pill badge-cyan" style={{ fontSize: '0.52rem', padding: '1px 5px' }}>
            PRO
          </span>
        </div>

        {/* Segmented Mode Switcher */}
        <div
          style={{
            display: 'flex',
            background: '#f1f5f9',
            padding: 4,
            borderRadius: 12,
            marginBottom: 20,
            gap: 4,
          }}
        >
          <button
            type="button"
            onClick={() => setLoginMode('master')}
            style={{
              flex: 1,
              padding: '8px 12px',
              fontSize: '0.8rem',
              fontWeight: 700,
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              background: loginMode === 'master' ? '#ffffff' : 'transparent',
              color: loginMode === 'master' ? 'var(--primary-neon)' : '#64748b',
              boxShadow: loginMode === 'master' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <Shield size={14} /> Master Admin
          </button>

          <button
            type="button"
            onClick={() => setLoginMode('sub_admin')}
            style={{
              flex: 1,
              padding: '8px 12px',
              fontSize: '0.8rem',
              fontWeight: 700,
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              background: loginMode === 'sub_admin' ? '#ffffff' : 'transparent',
              color: loginMode === 'sub_admin' ? 'var(--primary-neon)' : '#64748b',
              boxShadow: loginMode === 'sub_admin' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <UserCheck size={14} /> Sub-Admin Staff
          </button>
        </div>

        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            background: loginMode === 'master'
              ? 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)'
              : 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
            color: loginMode === 'master' ? 'var(--primary-neon)' : '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px',
            border: loginMode === 'master'
              ? '1.5px solid rgba(14, 165, 233, 0.35)'
              : '1.5px solid rgba(16, 185, 129, 0.35)',
            boxShadow: loginMode === 'master'
              ? '0 8px 20px rgba(14, 165, 233, 0.2)'
              : '0 8px 20px rgba(16, 185, 129, 0.2)',
          }}
        >
          {loginMode === 'master' ? <Shield size={28} /> : <UserCheck size={28} />}
        </div>

        <h2 className="font-display" style={{ fontSize: '1.55rem', color: '#0f172a', margin: 0, letterSpacing: '0.02em' }}>
          {loginMode === 'master' ? 'MASTER ADMIN ACCESS' : 'SUB-ADMIN STAFF LOGIN'}
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.84rem', marginTop: 6, marginBottom: 20 }}>
          {loginMode === 'master'
            ? 'Enter Master Administrator security key to unlock complete control surface.'
            : 'Sign in with your assigned staff email & password to manage delegated modules.'}
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
          {loginMode === 'sub_admin' && (
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                placeholder="Staff Email Address"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="input-field"
                style={{
                  padding: '12px 16px 12px 38px',
                  fontSize: '0.92rem',
                  borderRadius: 12,
                  width: '100%',
                  boxSizing: 'border-box',
                }}
                required
                autoFocus
              />
              <Mail size={16} style={{ position: 'absolute', left: 14, top: 15, color: '#94a3b8' }} />
            </div>
          )}

          <div style={{ position: 'relative' }}>
            <input
              type="password"
              placeholder={loginMode === 'master' ? 'Enter Master Admin Password' : 'Staff Password'}
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="input-field"
              style={{
                padding: loginMode === 'master' ? '13px 16px' : '12px 16px 12px 38px',
                fontSize: '0.96rem',
                letterSpacing: loginMode === 'master' ? '0.05em' : 'normal',
                borderRadius: 12,
                textAlign: loginMode === 'master' ? 'center' : 'left',
                width: '100%',
                boxSizing: 'border-box',
              }}
              required
              autoFocus={loginMode === 'master'}
            />
            {loginMode === 'sub_admin' && (
              <Lock size={16} style={{ position: 'absolute', left: 14, top: 15, color: '#94a3b8' }} />
            )}
          </div>

          <button
            type="submit"
            disabled={loginLoading || !passwordInput || (loginMode === 'sub_admin' && !emailInput)}
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
              marginTop: 4,
            }}
          >
            <Lock size={16} />
            {loginLoading
              ? 'Authenticating...'
              : loginMode === 'master'
              ? 'Unlock Master Panel'
              : 'Sign In to Desk'}
          </button>
        </form>
      </div>
    </div>
  );
};
