import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  ShieldCheck,
  Save,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  BadgeCheck,
  CreditCard,
  Trash2,
  Edit3,
  Smartphone,
  Plus,
  ShieldAlert,
  Wallet,
} from 'lucide-react';
import { User, SavedPaymentMethod } from '../types';
import { apiRequest } from '../api';

interface ProfileSettingsSectionProps {
  user: User | null;
  onRefreshUser?: () => void;
}

const PAYMENT_OPTIONS = [
  {
    id: 'bkash',
    name: 'bKash',
    logo: '/payment-methods/bkash.svg',
    category: 'MFS Personal Number',
    placeholder: '01XXXXXXXXX',
    formatHelper: '11-digit Bangladeshi mobile number',
    badgeColor: '#e11d48',
  },
  {
    id: 'nagad',
    name: 'Nagad',
    logo: '/payment-methods/nagad.svg',
    category: 'MFS Personal Number',
    placeholder: '01XXXXXXXXX',
    formatHelper: '11-digit Bangladeshi mobile number',
    badgeColor: '#ea580c',
  },
  {
    id: 'rocket',
    name: 'Rocket',
    logo: '/payment-methods/rocket.svg',
    category: 'DBBL Mobile Banking',
    placeholder: '01XXXXXXXXX or 12-digit',
    formatHelper: 'Dutch-Bangla Rocket mobile account',
    badgeColor: '#8b5cf6',
  },
  {
    id: 'crypto',
    name: 'Binance Pay / USDT',
    logo: '/payment-methods/crypto.svg',
    category: 'Binance Pay ID / USDT TRC20',
    placeholder: 'Binance Pay ID or USDT Address',
    formatHelper: 'Your Binance Pay ID or USDT TRC20/BEP20 address',
    badgeColor: '#059669',
  },
  {
    id: 'faucetpay',
    name: 'FaucetPay',
    logo: '/payment-methods/faucetpay.svg',
    category: 'Micropayment Email',
    placeholder: 'user@faucetpay.io or deposit address',
    formatHelper: 'Registered FaucetPay account email or crypto address',
    badgeColor: '#0284c7',
  },
  {
    id: 'webmoney',
    name: 'WebMoney',
    logo: '/payment-methods/webmoney.svg',
    category: 'Global WMZ Purse',
    placeholder: 'Z123456789012',
    formatHelper: 'WebMoney WMZ purse ID (starts with Z)',
    badgeColor: '#0369a1',
  },
];

export const ProfileSettingsSection: React.FC<ProfileSettingsSectionProps> = ({
  user,
  onRefreshUser,
}) => {
  // Personal Details State
  const [name, setName] = useState(user?.name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Payment Methods Binding State
  const [editingMethod, setEditingMethod] = useState<string | null>(null);
  const [inputAccountNumber, setInputAccountNumber] = useState('');
  const [inputAccountName, setInputAccountName] = useState('');
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [paymentMsg, setPaymentMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deletingMethod, setDeletingMethod] = useState<string | null>(null);

  // Copy ID feedback
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPayment, setCopiedPayment] = useState<string | null>(null);

  // Sync state if user prop changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhoneNumber(user.phoneNumber || '');
    }
  }, [user]);

  const handleCopyId = () => {
    if (!user?.id) return;
    navigator.clipboard.writeText(user.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyPayment = (text: string, methodId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPayment(methodId);
    setTimeout(() => setCopiedPayment(null), 2000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg(null);

    try {
      const res = await apiRequest<{ user: User }>('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name: name.trim(),
          phoneNumber: phoneNumber.trim(),
        }),
      });

      if (res.success) {
        setProfileMsg({ type: 'success', text: 'Personal details updated successfully!' });
        if (onRefreshUser) onRefreshUser();
      } else {
        setProfileMsg({ type: 'error', text: res.error || 'Failed to update personal details.' });
      }
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message || 'Error updating profile.' });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    setPasswordSaving(true);

    try {
      const res = await apiRequest<{ message: string }>('/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (res.success) {
        setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordMsg({ type: 'error', text: res.error || 'Failed to change password.' });
      }
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err.message || 'Error changing password.' });
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleStartEditPayment = (methodId: string, currentAccount?: string, currentName?: string) => {
    setEditingMethod(methodId);
    setInputAccountNumber(currentAccount || '');
    setInputAccountName(currentName || '');
    setPaymentMsg(null);
  };

  const handleSavePaymentMethod = async (methodId: string) => {
    if (!inputAccountNumber.trim()) {
      setPaymentMsg({ type: 'error', text: 'Please enter a valid account number / address.' });
      return;
    }

    setPaymentSaving(true);
    setPaymentMsg(null);

    try {
      const res = await apiRequest<{ message?: string; error?: string; data?: { savedPaymentMethods: SavedPaymentMethod[] } }>(
        '/auth/payment-methods',
        {
          method: 'POST',
          body: JSON.stringify({
            method: methodId,
            accountNumber: inputAccountNumber.trim(),
            accountName: inputAccountName.trim() || undefined,
          }),
        }
      );

      if (res.success) {
        setPaymentMsg({
          type: 'success',
          text: res.data?.message || `✓ ${methodId.toUpperCase()} account successfully bound to your profile!`,
        });
        setEditingMethod(null);
        setInputAccountNumber('');
        setInputAccountName('');
        if (onRefreshUser) onRefreshUser();
      } else {
        setPaymentMsg({
          type: 'error',
          text: res.error || 'Failed to bind payment method.',
        });
      }
    } catch (err: any) {
      setPaymentMsg({ type: 'error', text: err.message || 'Network error while saving payment method.' });
    } finally {
      setPaymentSaving(false);
    }
  };

  const handleDeletePaymentMethod = async (methodId: string) => {
    setDeletingMethod(methodId);
    setPaymentMsg(null);

    try {
      const res = await apiRequest<{ message?: string; error?: string }>(`/auth/payment-methods/${methodId}`, {
        method: 'DELETE',
      });

      if (res.success) {
        setPaymentMsg({
          type: 'success',
          text: `✓ ${methodId.toUpperCase()} account unlinked from your profile.`,
        });
        if (onRefreshUser) onRefreshUser();
      } else {
        setPaymentMsg({
          type: 'error',
          text: res.error || 'Failed to remove payment method.',
        });
      }
    } catch (err: any) {
      setPaymentMsg({ type: 'error', text: err.message || 'Error removing payment method.' });
    } finally {
      setDeletingMethod(null);
    }
  };

  if (!user) {
    return null;
  }

  const roleLabel = (user.role as string) === 'campaigner' || (user.role as string) === 'creator' ? 'Creator Studio' : 'Viewer Account';
  const roleBadgeClass = (user.role as string) === 'campaigner' || (user.role as string) === 'creator' ? 'badge-neon' : 'badge-cyan';
  const savedMethodsMap: Record<string, SavedPaymentMethod> = {};
  (user.savedPaymentMethods || []).forEach((m) => {
    savedMethodsMap[m.method] = m;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* =========================================================================
          1. TOP USER ID & ACCOUNT CARD (RESPONSIVE & MOBILE-OPTIMIZED)
          ========================================================================= */}
      <div
        className="glass-card"
        style={{
          padding: 'clamp(14px, 3.5vw, 24px)',
          borderRadius: 20,
          border: '1.5px solid rgba(14, 165, 233, 0.28)',
          background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
          boxShadow: '0 8px 30px rgba(14, 165, 233, 0.08)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 14,
          }}
        >
          {/* Avatar and Basic User Meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: '1 1 260px', minWidth: 0 }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <img
                src={
                  user.avatar ||
                  `https://api.dicebear.com/7.x/adventurer/png?seed=${encodeURIComponent(
                    user.email || user.name || 'user'
                  )}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`
                }
                alt={user.name}
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2.5px solid var(--primary-neon)',
                  boxShadow: '0 4px 14px rgba(14, 165, 233, 0.25)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 2,
                  right: 2,
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: '#10b981',
                  border: '2px solid #ffffff',
                }}
                title="Active Account"
              />
            </div>

            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <h2 className="font-display" style={{ fontSize: 'clamp(1.15rem, 4vw, 1.45rem)', color: '#0f172a', margin: 0, wordBreak: 'break-word' }}>
                  {user.name || 'User Profile'}
                </h2>
                <span className={`badge-pill ${roleBadgeClass}`} style={{ fontSize: '0.7rem', padding: '2px 7px' }}>
                  {roleLabel}
                </span>
                <span className="badge-pill" style={{ fontSize: '0.7rem', padding: '2px 7px', background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}>
                  <BadgeCheck size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />
                  Verified
                </span>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 3, wordBreak: 'break-all' }}>
                {user.email}
              </div>
            </div>
          </div>

          {/* User ID Highlight Card with 1-Click Copy */}
          <div
            style={{
              background: '#ffffff',
              border: '1.5px solid rgba(14, 165, 233, 0.25)',
              borderRadius: 14,
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              flex: '1 1 240px',
              minWidth: 0,
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="font-mono" style={{ fontSize: '0.66rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                Your Unique User ID
              </div>
              <div className="font-mono" style={{ fontSize: '0.88rem', color: '#0f172a', fontWeight: 800, marginTop: 2, wordBreak: 'break-all' }}>
                {user.id || 'N/A'}
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyId}
              className="btn btn-ghost"
              style={{
                padding: '7px 12px',
                fontSize: '0.78rem',
                borderRadius: 8,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: copiedId ? '#dcfce7' : '#f0f9ff',
                color: copiedId ? '#15803d' : 'var(--primary-neon)',
                borderColor: copiedId ? '#86efac' : 'rgba(14, 165, 233, 0.3)',
                fontWeight: 700,
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all 0.15s ease',
              }}
              title="Copy User ID"
            >
              {copiedId ? (
                <>
                  <Check size={14} color="#15803d" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy ID</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. SAVED PAYMENT METHODS SECTION (EXCLUSIVE 1-ACCOUNT BINDING)
          ========================================================================= */}
      <div
        className="glass-card"
        style={{
          padding: 'clamp(14px, 3.5vw, 24px)',
          borderRadius: 20,
          border: '1px solid #e2e8f0',
          background: '#ffffff',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: '#f0f9ff',
                border: '1px solid rgba(14, 165, 233, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary-neon)',
                flexShrink: 0,
              }}
            >
              <Wallet size={20} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h3 className="font-display" style={{ fontSize: 'clamp(1.05rem, 3.5vw, 1.25rem)', color: '#0f172a', margin: 0 }}>
                  SAVED WITHDRAWAL ACCOUNTS
                </h3>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: 999,
                    background: '#f0fdf4',
                    color: '#059669',
                    border: '1px solid #a7f3d0',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <ShieldCheck size={12} />
                  1-Account Unique Binding
                </span>
              </div>
              <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginTop: 2 }}>
                Bind your payout numbers/addresses. For multi-account fraud prevention, each number can only be linked to 1 account.
              </span>
            </div>
          </div>
        </div>

        {/* Payment Methods Feedback Message */}
        {paymentMsg && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 12,
              marginBottom: 16,
              fontSize: '0.84rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: paymentMsg.type === 'success' ? '#ecfdf5' : '#fef2f2',
              color: paymentMsg.type === 'success' ? '#047857' : '#b91c1c',
              border: paymentMsg.type === 'success' ? '1.5px solid #a7f3d0' : '1.5px solid #fecaca',
            }}
          >
            {paymentMsg.type === 'success' ? <CheckCircle2 size={16} style={{ flexShrink: 0 }} /> : <ShieldAlert size={16} style={{ flexShrink: 0 }} />}
            <span style={{ wordBreak: 'break-word' }}>{paymentMsg.text}</span>
          </div>
        )}

        {/* 6-Card Grid for Payment Gateways (Fully Responsive) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: 14,
          }}
        >
          {PAYMENT_OPTIONS.map((opt) => {
            const saved = savedMethodsMap[opt.id];
            const isEditing = editingMethod === opt.id;
            const isDeleting = deletingMethod === opt.id;

            return (
              <div
                key={opt.id}
                style={{
                  border: saved
                    ? '1.5px solid rgba(16, 185, 129, 0.35)'
                    : isEditing
                    ? '1.5px solid var(--primary-neon)'
                    : '1px solid #e2e8f0',
                  borderRadius: 16,
                  padding: 14,
                  background: saved ? 'linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%)' : '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 10,
                  transition: 'all 0.2s ease',
                  boxShadow: saved ? '0 4px 14px rgba(16, 185, 129, 0.06)' : 'none',
                  minWidth: 0,
                }}
              >
                {/* Header: Logo, Name & Category */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 4,
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={opt.logo}
                        alt={opt.name}
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.94rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {opt.name}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {opt.category}
                      </div>
                    </div>
                  </div>

                  {saved ? (
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '2px 7px',
                        borderRadius: 999,
                        background: '#dcfce7',
                        color: '#15803d',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3,
                        flexShrink: 0,
                      }}
                    >
                      <Check size={11} color="#15803d" />
                      Bound
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        padding: '2px 7px',
                        borderRadius: 999,
                        background: '#f1f5f9',
                        color: '#64748b',
                        flexShrink: 0,
                      }}
                    >
                      Not Linked
                    </span>
                  )}
                </div>

                {/* Body: Display Account or Edit Form */}
                {isEditing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
                    <div>
                      <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                        Account Number / Address:
                      </label>
                      <input
                        type="text"
                        autoFocus
                        value={inputAccountNumber}
                        onChange={(e) => setInputAccountNumber(e.target.value)}
                        placeholder={opt.placeholder}
                        className="input-field font-mono"
                        style={{ padding: '8px 12px', fontSize: '0.86rem', borderRadius: 10, width: '100%', boxSizing: 'border-box' }}
                      />
                      <span style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 3, display: 'block' }}>
                        {opt.formatHelper}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        disabled={paymentSaving}
                        onClick={() => handleSavePaymentMethod(opt.id)}
                        className="btn btn-neon glow-neon"
                        style={{ flex: 1, minWidth: 120, padding: '8px 12px', fontSize: '0.78rem', borderRadius: 8, fontWeight: 700, justifyContent: 'center' }}
                      >
                        <Save size={14} />
                        <span>{paymentSaving ? 'Binding...' : 'Save & Bind'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingMethod(null)}
                        className="btn btn-ghost"
                        style={{ padding: '8px 12px', fontSize: '0.78rem', borderRadius: 8 }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : saved ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                    <div
                      style={{
                        background: '#ffffff',
                        padding: '8px 10px',
                        borderRadius: 10,
                        border: '1px solid #d1fae5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 8,
                        minWidth: 0,
                      }}
                    >
                      <span
                        className="font-mono"
                        style={{
                          fontSize: '0.88rem',
                          fontWeight: 700,
                          color: '#0f172a',
                          wordBreak: 'break-all',
                          overflowWrap: 'anywhere',
                          minWidth: 0,
                          flex: 1,
                        }}
                      >
                        {saved.accountNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyPayment(saved.accountNumber, opt.id)}
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: 6,
                          cursor: 'pointer',
                          padding: '5px 8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                        title="Copy Account Number"
                      >
                        {copiedPayment === opt.id ? <Check size={14} color="#059669" /> : <Copy size={14} color="#64748b" />}
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => handleStartEditPayment(opt.id, saved.accountNumber, saved.accountName)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--primary-neon)',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '4px 0',
                        }}
                      >
                        <Edit3 size={13} />
                        <span>Change</span>
                      </button>

                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() => handleDeletePaymentMethod(opt.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#dc2626',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '4px 0',
                        }}
                      >
                        <Trash2 size={13} />
                        <span>{isDeleting ? 'Removing...' : 'Unlink'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ marginTop: 4 }}>
                    <p style={{ fontSize: '0.74rem', color: '#64748b', margin: '0 0 8px 0' }}>
                      No {opt.name} account linked. Click below to bind your payment number for 1-click cashouts.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleStartEditPayment(opt.id)}
                      className="btn btn-secondary"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        fontSize: '0.78rem',
                        borderRadius: 8,
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        border: '1px solid #cbd5e1',
                      }}
                    >
                      <Plus size={14} />
                      <span>Link {opt.name} Account</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          3. TWO-COLUMN GRID: PERSONAL DETAILS & SECURITY SETTINGS (RESPONSIVE)
          ========================================================================= */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
          gap: 16,
        }}
      >
        {/* LEFT CARD: PERSONAL DETAILS FORM */}
        <div
          className="glass-card"
          style={{
            padding: 'clamp(14px, 3.5vw, 24px)',
            borderRadius: 18,
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minWidth: 0,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: '#f0f9ff',
                  border: '1px solid rgba(14, 165, 233, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary-neon)',
                  flexShrink: 0,
                }}
              >
                <UserIcon size={18} />
              </div>
              <div style={{ minWidth: 0 }}>
                <h3 className="font-display" style={{ fontSize: 'clamp(1.05rem, 3.5vw, 1.25rem)', color: '#0f172a', margin: 0 }}>
                  PERSONAL DETAILS
                </h3>
                <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                  Update your contact info for payout & notifications
                </span>
              </div>
            </div>

            {/* Profile Feedback Alert */}
            {profileMsg && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  marginBottom: 16,
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: profileMsg.type === 'success' ? '#ecfdf5' : '#fef2f2',
                  color: profileMsg.type === 'success' ? '#047857' : '#b91c1c',
                  border: profileMsg.type === 'success' ? '1px solid #a7f3d0' : '1px solid #fecaca',
                }}
              >
                {profileMsg.type === 'success' ? <CheckCircle2 size={16} style={{ flexShrink: 0 }} /> : <AlertCircle size={16} style={{ flexShrink: 0 }} />}
                <span style={{ wordBreak: 'break-word' }}>{profileMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Full Name */}
              <div>
                <label
                  className="font-mono"
                  style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 700, display: 'block', marginBottom: 5 }}
                >
                  Full Name:
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="input-field"
                    style={{ padding: '10px 14px 10px 38px', fontSize: '0.9rem', borderRadius: 12, width: '100%', boxSizing: 'border-box' }}
                  />
                  <UserIcon
                    size={16}
                    color="#64748b"
                    style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label
                  className="font-mono"
                  style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 700, display: 'block', marginBottom: 5 }}
                >
                  Mobile / Phone Number:
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="input-field"
                    style={{ padding: '10px 14px 10px 38px', fontSize: '0.9rem', borderRadius: 12, width: '100%', boxSizing: 'border-box' }}
                  />
                  <Phone
                    size={16}
                    color="#64748b"
                    style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
                  />
                </div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginTop: 3 }}>
                  Used for bKash/Nagad verification and critical account security alerts.
                </span>
              </div>

              {/* Email (Read-Only) */}
              <div>
                <label
                  className="font-mono"
                  style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 700, display: 'block', marginBottom: 5 }}
                >
                  Registered Email Address (Permanent):
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="input-field"
                    style={{
                      padding: '10px 14px 10px 38px',
                      fontSize: '0.9rem',
                      borderRadius: 12,
                      background: '#f8fafc',
                      color: '#64748b',
                      cursor: 'not-allowed',
                      width: '100%',
                      boxSizing: 'border-box',
                    }}
                  />
                  <Mail
                    size={16}
                    color="#94a3b8"
                    style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={profileSaving}
                className="btn btn-neon glow-neon"
                style={{
                  width: '100%',
                  padding: '12px 18px',
                  borderRadius: 12,
                  fontSize: '0.88rem',
                  fontWeight: 750,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  marginTop: 4,
                }}
              >
                <Save size={16} />
                <span>{profileSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT CARD: PASSWORD & SECURITY FORM */}
        <div
          className="glass-card"
          style={{
            padding: 'clamp(14px, 3.5vw, 24px)',
            borderRadius: 18,
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minWidth: 0,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: '#f0fdf4',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#059669',
                  flexShrink: 0,
                }}
              >
                <KeyRound size={18} />
              </div>
              <div style={{ minWidth: 0 }}>
                <h3 className="font-display" style={{ fontSize: 'clamp(1.05rem, 3.5vw, 1.25rem)', color: '#0f172a', margin: 0 }}>
                  PASSWORD & SECURITY
                </h3>
                <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                  Update your dashboard login password
                </span>
              </div>
            </div>

            {/* Password Feedback Alert */}
            {passwordMsg && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  marginBottom: 16,
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: passwordMsg.type === 'success' ? '#ecfdf5' : '#fef2f2',
                  color: passwordMsg.type === 'success' ? '#047857' : '#b91c1c',
                  border: passwordMsg.type === 'success' ? '1px solid #a7f3d0' : '1px solid #fecaca',
                }}
              >
                {passwordMsg.type === 'success' ? <CheckCircle2 size={16} style={{ flexShrink: 0 }} /> : <AlertCircle size={16} style={{ flexShrink: 0 }} />}
                <span style={{ wordBreak: 'break-word' }}>{passwordMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Current Password */}
              <div>
                <label
                  className="font-mono"
                  style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 700, display: 'block', marginBottom: 5 }}
                >
                  Current Password:
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter existing password"
                    className="input-field"
                    style={{ padding: '10px 38px 10px 38px', fontSize: '0.9rem', borderRadius: 12, width: '100%', boxSizing: 'border-box' }}
                  />
                  <Lock
                    size={16}
                    color="#64748b"
                    style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#64748b',
                      padding: 4,
                    }}
                  >
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label
                  className="font-mono"
                  style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 700, display: 'block', marginBottom: 5 }}
                >
                  New Password:
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="input-field"
                    style={{ padding: '10px 38px 10px 38px', fontSize: '0.9rem', borderRadius: 12, width: '100%', boxSizing: 'border-box' }}
                  />
                  <Lock
                    size={16}
                    color="#64748b"
                    style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#64748b',
                      padding: 4,
                    }}
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label
                  className="font-mono"
                  style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 700, display: 'block', marginBottom: 5 }}
                >
                  Confirm New Password:
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="input-field"
                    style={{ padding: '10px 38px 10px 38px', fontSize: '0.9rem', borderRadius: 12, width: '100%', boxSizing: 'border-box' }}
                  />
                  <Lock
                    size={16}
                    color="#64748b"
                    style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#64748b',
                      padding: 4,
                    }}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {newPassword && confirmPassword && (
                  <span
                    style={{
                      fontSize: '0.72rem',
                      display: 'block',
                      marginTop: 3,
                      fontWeight: 600,
                      color: newPassword === confirmPassword ? '#059669' : '#dc2626',
                    }}
                  >
                    {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={passwordSaving}
                className="btn btn-ghost"
                style={{
                  width: '100%',
                  padding: '12px 18px',
                  borderRadius: 12,
                  fontSize: '0.88rem',
                  fontWeight: 750,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  marginTop: 4,
                  color: 'var(--primary-neon)',
                  borderColor: 'rgba(14, 165, 233, 0.35)',
                }}
              >
                <KeyRound size={16} />
                <span>{passwordSaving ? 'Updating Password...' : 'Update Password'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* =========================================================================
          4. ACCOUNT SECURITY & PROTECTION NOTE
          ========================================================================= */}
      <div
        style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ShieldCheck size={20} color="var(--primary-neon)" />
          <span style={{ fontSize: '0.82rem', color: '#475569' }}>
            All payment methods and credentials are encrypted with multi-account anti-sybil binding protection.
          </span>
        </div>
        <div className="font-mono" style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
          Protected by myYT Security Core
        </div>
      </div>
    </div>
  );
};
