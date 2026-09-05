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
} from 'lucide-react';
import { User } from '../types';
import { apiRequest } from '../api';

interface ProfileSettingsSectionProps {
  user: User | null;
  onRefreshUser?: () => void;
}

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

  // Copy ID feedback
  const [copiedId, setCopiedId] = useState(false);

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

  if (!user) {
    return null;
  }

  const roleLabel = (user.role as string) === 'campaigner' || (user.role as string) === 'creator' ? 'Creator Studio' : 'Viewer Account';
  const roleBadgeClass = (user.role as string) === 'campaigner' || (user.role as string) === 'creator' ? 'badge-neon' : 'badge-cyan';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* =========================================================================
          1. TOP USER ID & ACCOUNT CARD
          ========================================================================= */}
      <div
        className="glass-card"
        style={{
          padding: '24px',
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
            gap: 16,
          }}
        >
          {/* Avatar and Basic User Meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ position: 'relative' }}>
              <img
                src={
                  user.avatar ||
                  `https://api.dicebear.com/7.x/adventurer/png?seed=${encodeURIComponent(
                    user.email || user.name || 'user'
                  )}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`
                }
                alt={user.name}
                style={{
                  width: 64,
                  height: 64,
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
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: '#10b981',
                  border: '2px solid #ffffff',
                }}
                title="Active Account"
              />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h2 className="font-display" style={{ fontSize: '1.45rem', color: '#0f172a', margin: 0 }}>
                  {user.name || 'User Profile'}
                </h2>
                <span className={`badge-pill ${roleBadgeClass}`} style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                  {roleLabel}
                </span>
                <span className="badge-pill" style={{ fontSize: '0.72rem', padding: '2px 8px', background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}>
                  <BadgeCheck size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />
                  Verified
                </span>
              </div>
              <div style={{ fontSize: '0.86rem', color: '#64748b', marginTop: 3 }}>
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
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
            }}
          >
            <div>
              <div className="font-mono" style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                Your Unique User ID
              </div>
              <div className="font-mono" style={{ fontSize: '0.92rem', color: '#0f172a', fontWeight: 800, marginTop: 2 }}>
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
          2. TWO-COLUMN GRID: PERSONAL DETAILS & SECURITY SETTINGS
          ========================================================================= */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
          gap: 20,
        }}
      >
        {/* LEFT CARD: PERSONAL DETAILS FORM */}
        <div
          className="glass-card"
          style={{
            padding: '24px',
            borderRadius: 18,
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
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
                }}
              >
                <UserIcon size={18} />
              </div>
              <div>
                <h3 className="font-display" style={{ fontSize: '1.25rem', color: '#0f172a', margin: 0 }}>
                  PERSONAL DETAILS
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
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
                {profileMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{profileMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Full Name */}
              <div>
                <label
                  className="font-mono"
                  style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 700, display: 'block', marginBottom: 6 }}
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
                    style={{ padding: '11px 14px 11px 40px', fontSize: '0.92rem', borderRadius: 12 }}
                  />
                  <UserIcon
                    size={16}
                    color="#64748b"
                    style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label
                  className="font-mono"
                  style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 700, display: 'block', marginBottom: 6 }}
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
                    style={{ padding: '11px 14px 11px 40px', fontSize: '0.92rem', borderRadius: 12 }}
                  />
                  <Phone
                    size={16}
                    color="#64748b"
                    style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}
                  />
                </div>
                <span style={{ fontSize: '0.74rem', color: '#64748b', display: 'block', marginTop: 4 }}>
                  Used for bKash/Nagad verification and critical account security alerts.
                </span>
              </div>

              {/* Email (Read-Only) */}
              <div>
                <label
                  className="font-mono"
                  style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 700, display: 'block', marginBottom: 6 }}
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
                      padding: '11px 14px 11px 40px',
                      fontSize: '0.92rem',
                      borderRadius: 12,
                      background: '#f8fafc',
                      color: '#64748b',
                      cursor: 'not-allowed',
                    }}
                  />
                  <Mail
                    size={16}
                    color="#94a3b8"
                    style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={profileSaving}
                className="btn btn-neon glow-neon"
                style={{
                  padding: '12px 18px',
                  borderRadius: 12,
                  fontSize: '0.9rem',
                  fontWeight: 750,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  marginTop: 6,
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
            padding: '24px',
            borderRadius: 18,
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
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
                }}
              >
                <KeyRound size={18} />
              </div>
              <div>
                <h3 className="font-display" style={{ fontSize: '1.25rem', color: '#0f172a', margin: 0 }}>
                  PASSWORD & SECURITY
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
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
                {passwordMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Current Password */}
              <div>
                <label
                  className="font-mono"
                  style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 700, display: 'block', marginBottom: 6 }}
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
                    style={{ padding: '11px 40px 11px 40px', fontSize: '0.92rem', borderRadius: 12 }}
                  />
                  <Lock
                    size={16}
                    color="#64748b"
                    style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    style={{
                      position: 'absolute',
                      right: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#64748b',
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
                  style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 700, display: 'block', marginBottom: 6 }}
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
                    style={{ padding: '11px 40px 11px 40px', fontSize: '0.92rem', borderRadius: 12 }}
                  />
                  <Lock
                    size={16}
                    color="#64748b"
                    style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{
                      position: 'absolute',
                      right: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#64748b',
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
                  style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 700, display: 'block', marginBottom: 6 }}
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
                    style={{ padding: '11px 40px 11px 40px', fontSize: '0.92rem', borderRadius: 12 }}
                  />
                  <Lock
                    size={16}
                    color="#64748b"
                    style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#64748b',
                    }}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {newPassword && confirmPassword && (
                  <span
                    style={{
                      fontSize: '0.74rem',
                      display: 'block',
                      marginTop: 4,
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
                  padding: '12px 18px',
                  borderRadius: 12,
                  fontSize: '0.9rem',
                  fontWeight: 750,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  marginTop: 6,
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
          3. ACCOUNT SECURITY & PROTECTION NOTE
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
            All profile credentials are encrypted with 256-bit hashing and tamper-proof session signatures.
          </span>
        </div>
        <div className="font-mono" style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
          Protected by myYT Security Core
        </div>
      </div>
    </div>
  );
};
