import React, { useState } from 'react';
import {
  Smartphone,
  ShieldCheck,
  Download,
  CheckCircle2,
  QrCode,
  Zap,
  AlertTriangle,
  ChevronRight,
  BatteryCharging,
  Sliders,
  ShieldAlert,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { User } from '../types';

interface MobileSimulatorProps {
  user: User | null;
  onRefreshUser?: () => void;
}

export const MobileSimulator: React.FC<MobileSimulatorProps> = () => {
  // App download URL (points to static downloadable APK)
  const downloadUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/downloads/ytcash.apk`
      : 'https://ytcash.pro/downloads/ytcash.apk';

  const [activeTab, setActiveTab] = useState<'standard' | 'android13' | 'playprotect'>('standard');

  return (
    <div
      className="responsive-container"
      style={{
        margin: '24px auto 60px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 28,
        maxWidth: 1140,
        width: '100%',
        padding: '0 16px',
        boxSizing: 'border-box',
      }}
    >
      {/* Top Header */}
      <div style={{ textAlign: 'center', maxWidth: 700 }}>
        <div
          className="badge-pill badge-cyan"
          style={{
            marginBottom: 10,
            fontSize: '0.68rem',
            padding: '4px 12px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Smartphone size={13} /> Official Android App (.APK)
        </div>
        <h1
          className="font-display hero-title"
          style={{
            fontSize: 'clamp(1.7rem, 3.2vw, 2.4rem)',
            color: '#0f172a',
            letterSpacing: '0.01em',
            lineHeight: 1.15,
            margin: '0 0 10px',
          }}
        >
          GET THE OFFICIAL <span style={{ color: 'var(--primary-neon)' }}>ytCash APP</span>
        </h1>
        <p
          className="font-body"
          style={{
            color: 'var(--on-surface-variant)',
            fontSize: '0.88rem',
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          Scan the QR code with your mobile camera or download the APK directly to your phone. Follow the simple permission steps on the right to start watching and earning.
        </p>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="simulator-layout-grid">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: QR CODE & DOWNLOAD                                          */}
        {/* ========================================================================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Main Download Card */}
          <div
            className="glass-card mobile-p-small"
            style={{
              width: '100%',
              padding: '28px 24px',
              borderRadius: 24,
              border: '1.5px solid rgba(14, 165, 233, 0.3)',
              boxShadow: '0 16px 40px rgba(14, 165, 233, 0.08)',
              background: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              boxSizing: 'border-box',
            }}
          >
            {/* App Icon / Logo */}
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <img
                src="/image.png"
                alt="ytCash App"
                style={{
                  height: 60,
                  width: 'auto',
                  display: 'block',
                  objectFit: 'contain',
                }}
              />
            </div>

            {/* QR Code Container */}
            <div style={{ margin: '4px 0 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  background: '#ffffff',
                  padding: 16,
                  borderRadius: 20,
                  border: '1.5px solid rgba(14, 165, 233, 0.28)',
                  boxShadow: '0 8px 28px rgba(14, 165, 233, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <QRCodeSVG
                  value={downloadUrl}
                  size={190}
                  level="H"
                  fgColor="#0284c7"
                  bgColor="#ffffff"
                />
              </div>
              <span
                className="font-mono"
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--on-surface-variant)',
                  marginTop: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <QrCode size={13} color="var(--primary-neon)" /> Point phone camera at QR code
              </span>
            </div>

            {/* Direct Download Button */}
            <a
              href={downloadUrl}
              download="ytcash.apk"
              target="_blank"
              rel="noreferrer"
              className="btn btn-neon glow-neon btn-mobile-full"
              style={{
                width: '100%',
                maxWidth: 360,
                padding: '13px 20px',
                fontSize: '0.90rem',
                fontWeight: 700,
                borderRadius: 14,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <Download size={18} /> Direct APK Download
            </a>

            {/* Security & Verification tag */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                marginTop: 12,
                fontSize: '0.72rem',
                color: '#059669',
                fontWeight: 600,
              }}
            >
              <ShieldCheck size={14} /> Verified Safe • Direct from ytCash
            </div>
          </div>

          {/* Quick 3-Step Overview */}
          <div
            className="glass-card mobile-p-small"
            style={{
              width: '100%',
              padding: '18px 20px',
              borderRadius: 18,
              border: '1px solid var(--glass-stroke)',
              background: '#ffffff',
              boxSizing: 'border-box',
            }}
          >
            <h4
              className="font-display"
              style={{ fontSize: '0.88rem', color: '#0f172a', marginBottom: 12 }}
            >
              3-Step Quick Install
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: '#f0f9ff', borderRadius: 10, border: '1px solid rgba(14,165,233,0.15)' }}>
                <span className="font-mono" style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--primary-neon)', background: '#e0f2fe', padding: '2px 6px', borderRadius: 6 }}>1</span>
                <div style={{ fontSize: '0.74rem', color: '#0f172a', fontWeight: 600 }}>Download & Install APK</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: '#f0f9ff', borderRadius: 10, border: '1px solid rgba(14,165,233,0.15)' }}>
                <span className="font-mono" style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--primary-neon)', background: '#e0f2fe', padding: '2px 6px', borderRadius: 6 }}>2</span>
                <div style={{ fontSize: '0.74rem', color: '#0f172a', fontWeight: 600 }}>Allow Unknown Sources in Settings</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: '#f0f9ff', borderRadius: 10, border: '1px solid rgba(14,165,233,0.15)' }}>
                <span className="font-mono" style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--primary-neon)', background: '#e0f2fe', padding: '2px 6px', borderRadius: 6 }}>3</span>
                <div style={{ fontSize: '0.74rem', color: '#0f172a', fontWeight: 600 }}>Grant Permissions on the Right ➔</div>
              </div>
            </div>

            {/* Play Protect Notice Callout */}
            <div
              style={{
                marginTop: 10,
                padding: '9px 11px',
                background: '#fffbeb',
                borderRadius: 10,
                border: '1px solid #fde68a',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onClick={() => setActiveTab('playprotect')}
              title="Click to view Play Protect instructions"
            >
              <ShieldAlert size={15} color="#d97706" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '0.71rem', color: '#92400e', lineHeight: 1.35 }}>
                Play Protect warning? Tap <strong>"More details" ➔ "Install anyway"</strong> or switch to the <span style={{ textDecoration: 'underline', fontWeight: 700 }}>Play Protect tab</span>.
              </div>
            </div>
          </div>

          {/* Key Mobile App Features */}
          <div
            className="glass-card mobile-p-small"
            style={{
              width: '100%',
              padding: '18px 20px',
              borderRadius: 18,
              border: '1px solid var(--glass-stroke)',
              background: '#f8fafc',
              boxSizing: 'border-box',
            }}
          >
            <h4
              className="font-display"
              style={{ fontSize: '0.88rem', color: '#0f172a', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Zap size={15} color="var(--primary-neon)" /> Key Features
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.76rem', color: 'var(--on-surface)' }}>
                <CheckCircle2 size={15} color="var(--primary-neon)" style={{ flexShrink: 0, marginTop: 2 }} />
                <span>Automatic return to app after YouTube view ends</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.76rem', color: 'var(--on-surface)' }}>
                <CheckCircle2 size={15} color="var(--primary-neon)" style={{ flexShrink: 0, marginTop: 2 }} />
                <span>Floating countdown bubble on native YouTube app</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.76rem', color: 'var(--on-surface)' }}>
                <CheckCircle2 size={15} color="var(--primary-neon)" style={{ flexShrink: 0, marginTop: 2 }} />
                <span>Instant reward sync with your web dashboard</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: AFTER INSTALLATION SETUP                                   */}
        {/* ========================================================================= */}
        <div
          className="glass-card mobile-p-small"
          style={{
            width: '100%',
            padding: '28px 26px',
            borderRadius: 24,
            border: '1.5px solid rgba(14, 165, 233, 0.28)',
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
            boxShadow: '0 12px 32px rgba(14, 165, 233, 0.07)',
            boxSizing: 'border-box',
          }}
        >
          {/* Section Title & Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
            <div>
              <div
                className="badge-pill badge-cyan"
                style={{ fontSize: '0.64rem', padding: '3px 9px', marginBottom: 6, display: 'inline-flex', alignItems: 'center', gap: 5 }}
              >
                <Sliders size={12} /> AFTER INSTALLATION SETUP
              </div>
              <h3
                className="font-display"
                style={{ fontSize: '1.15rem', color: '#0f172a', letterSpacing: '0.01em', margin: 0 }}
              >
                Required Android Permissions Guide
              </h3>
            </div>

            {/* Guide Switcher Tabs */}
            <div style={{ display: 'flex', background: '#e2e8f0', padding: 3, borderRadius: 10, gap: 2, flexWrap: 'wrap' }}>
              <button
                onClick={() => setActiveTab('standard')}
                style={{
                  border: 'none',
                  background: activeTab === 'standard' ? '#ffffff' : 'transparent',
                  color: activeTab === 'standard' ? 'var(--primary-neon)' : '#64748b',
                  fontWeight: activeTab === 'standard' ? 700 : 500,
                  fontSize: '0.72rem',
                  padding: '5px 12px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  boxShadow: activeTab === 'standard' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                Standard Setup
              </button>
              <button
                onClick={() => setActiveTab('android13')}
                style={{
                  border: 'none',
                  background: activeTab === 'android13' ? '#ffffff' : 'transparent',
                  color: activeTab === 'android13' ? '#d97706' : '#64748b',
                  fontWeight: activeTab === 'android13' ? 700 : 500,
                  fontSize: '0.72rem',
                  padding: '5px 12px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  boxShadow: activeTab === 'android13' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.15s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <AlertTriangle size={12} color="#d97706" /> Android 13/14+ Fix
              </button>
              <button
                onClick={() => setActiveTab('playprotect')}
                style={{
                  border: 'none',
                  background: activeTab === 'playprotect' ? '#ffffff' : 'transparent',
                  color: activeTab === 'playprotect' ? '#dc2626' : '#64748b',
                  fontWeight: activeTab === 'playprotect' ? 700 : 500,
                  fontSize: '0.72rem',
                  padding: '5px 12px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  boxShadow: activeTab === 'playprotect' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.15s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <ShieldAlert size={12} color="#dc2626" /> Play Protect Off
              </button>
            </div>
          </div>

          <p
            className="font-body"
            style={{ fontSize: '0.80rem', color: 'var(--on-surface-variant)', lineHeight: 1.5, marginBottom: 18 }}
          >
            To ensure automated watch verification and reward synchronization, Android requires these two permissions after launching the app for the first time:
          </p>

          {/* Tab 1: Standard 2-Step Permission Setup */}
          {activeTab === 'standard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Step 1: Display Over Other Apps */}
              <div
                style={{
                  padding: 16,
                  background: '#ffffff',
                  borderRadius: 16,
                  border: '1.5px solid #e0f2fe',
                  boxShadow: '0 4px 14px rgba(14, 165, 233, 0.05)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 10,
                      background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      flexShrink: 0,
                    }}
                  >
                    1
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                      <h4 style={{ fontSize: '0.90rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                        Display Over Other Apps
                      </h4>
                      <span
                        style={{
                          fontSize: '0.62rem',
                          fontWeight: 700,
                          color: '#0284c7',
                          background: '#e0f2fe',
                          padding: '2px 8px',
                          borderRadius: 6,
                        }}
                      >
                        FLOATING TIMER
                      </span>
                    </div>
                    <p style={{ fontSize: '0.76rem', color: '#475569', marginTop: 4, lineHeight: 1.45 }}>
                      Allows ytCash to render the floating countdown bubble & point counter on top of the native YouTube player.
                    </p>

                    {/* Navigation Steps */}
                    <div
                      style={{
                        marginTop: 10,
                        background: '#f8fafc',
                        padding: '10px 12px',
                        borderRadius: 10,
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <div style={{ fontSize: '0.66rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>
                        How to enable in phone Settings:
                      </div>
                      <div
                        className="font-mono"
                        style={{
                          fontSize: '0.72rem',
                          color: '#0f172a',
                          display: 'flex',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: 4,
                        }}
                      >
                        <span style={{ fontWeight: 600 }}>Settings</span>
                        <ChevronRight size={12} color="#94a3b8" />
                        <span>Apps</span>
                        <ChevronRight size={12} color="#94a3b8" />
                        <span>Special App Access / Appear on top</span>
                        <ChevronRight size={12} color="#94a3b8" />
                        <span style={{ color: 'var(--primary-neon)', fontWeight: 700 }}>ytCash</span>
                        <ChevronRight size={12} color="#94a3b8" />
                        <span style={{ color: '#059669', fontWeight: 700 }}>Toggle ON</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Accessibility Verification */}
              <div
                style={{
                  padding: 16,
                  background: '#ffffff',
                  borderRadius: 16,
                  border: '1.5px solid #e0f2fe',
                  boxShadow: '0 4px 14px rgba(14, 165, 233, 0.05)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 10,
                      background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      flexShrink: 0,
                    }}
                  >
                    2
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                      <h4 style={{ fontSize: '0.90rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                        Accessibility Verification
                      </h4>
                      <span
                        style={{
                          fontSize: '0.62rem',
                          fontWeight: 700,
                          color: '#059669',
                          background: '#dcfce7',
                          padding: '2px 8px',
                          borderRadius: 6,
                        }}
                      >
                        WATCH VERIFIER
                      </span>
                    </div>
                    <p style={{ fontSize: '0.76rem', color: '#475569', marginTop: 4, lineHeight: 1.45 }}>
                      Detects real YouTube playback seconds and brings ytCash automatically back to foreground to claim rewards when done.
                    </p>

                    {/* Navigation Steps */}
                    <div
                      style={{
                        marginTop: 10,
                        background: '#f8fafc',
                        padding: '10px 12px',
                        borderRadius: 10,
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <div style={{ fontSize: '0.66rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>
                        How to enable in phone Settings:
                      </div>
                      <div
                        className="font-mono"
                        style={{
                          fontSize: '0.72rem',
                          color: '#0f172a',
                          display: 'flex',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: 4,
                        }}
                      >
                        <span style={{ fontWeight: 600 }}>Settings</span>
                        <ChevronRight size={12} color="#94a3b8" />
                        <span>Accessibility</span>
                        <ChevronRight size={12} color="#94a3b8" />
                        <span>Downloaded Apps / Installed Services</span>
                        <ChevronRight size={12} color="#94a3b8" />
                        <span style={{ color: 'var(--primary-neon)', fontWeight: 700 }}>ytCash</span>
                        <ChevronRight size={12} color="#94a3b8" />
                        <span style={{ color: '#059669', fontWeight: 700 }}>Turn ON & Allow</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 (Optional): Battery Optimization */}
              <div
                style={{
                  padding: '12px 14px',
                  background: '#f0fdf4',
                  borderRadius: 14,
                  border: '1px solid #bbf7d0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <BatteryCharging size={18} color="#16a34a" style={{ flexShrink: 0 }} />
                <div style={{ fontSize: '0.74rem', color: '#166534', lineHeight: 1.4 }}>
                  <strong style={{ fontWeight: 700 }}>Pro-Tip for 24/7 Continuous Auto-Watch:</strong> Set ytCash Battery usage to{' '}
                  <span style={{ textDecoration: 'underline', fontWeight: 700 }}>"Unrestricted"</span> in App Info to prevent Android from pausing background tasks.
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Android 13 / 14 / 15 Restricted Settings Solution */}
          {activeTab === 'android13' && (
            <div
              style={{
                padding: 16,
                background: '#fffbeb',
                borderRadius: 16,
                border: '1.5px solid #fde68a',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <AlertTriangle size={18} color="#d97706" />
                <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#92400e', margin: 0 }}>
                  Fixing "Restricted setting: For your security..." on Android 13/14+
                </h4>
              </div>
              <p style={{ fontSize: '0.76rem', color: '#78350f', lineHeight: 1.45, marginBottom: 12 }}>
                When downloading APK files outside Google Play, modern Android temporarily disables accessibility toggles by default until you approve it once:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.76rem', color: '#78350f' }}>
                  <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#f59e0b', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 800, flexShrink: 0 }}>1</span>
                  <span>Open <strong>Settings</strong> ➔ <strong>Apps</strong> ➔ Select <strong>ytCash</strong> (or long press the app icon on home screen and tap <strong>App Info ⓘ</strong>).</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.76rem', color: '#78350f' }}>
                  <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#f59e0b', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 800, flexShrink: 0 }}>2</span>
                  <span>Tap the <strong>3 vertical dots (⋮)</strong> at the top-right corner of the App Info screen.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.76rem', color: '#78350f' }}>
                  <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#f59e0b', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 800, flexShrink: 0 }}>3</span>
                  <span>Select <strong>"Allow restricted settings"</strong> and verify with your PIN or fingerprint.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.76rem', color: '#78350f' }}>
                  <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#f59e0b', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 800, flexShrink: 0 }}>4</span>
                  <span>Now go back to <strong>Accessibility</strong> ➔ <strong>ytCash</strong> and switch it <strong>ON</strong>.</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Google Play Protect Turn Off & Bypass Guide */}
          {activeTab === 'playprotect' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Alert Header */}
              <div
                style={{
                  padding: 16,
                  background: '#fef2f2',
                  borderRadius: 16,
                  border: '1.5px solid #fecaca',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <ShieldAlert size={18} color="#dc2626" />
                  <h4 style={{ fontSize: '0.90rem', fontWeight: 800, color: '#991b1b', margin: 0 }}>
                    Google Play Protect Warning / Block Fix
                  </h4>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#7f1d1d', lineHeight: 1.5, margin: 0 }}>
                  Because ytCash is downloaded directly outside Google Play Store and uses an Accessibility Service to count YouTube watch seconds, Google Play Protect may show a <em>"Blocked by Play Protect"</em> or <em>"Unsafe app blocked"</em> warning. Follow either method below:
                </p>
              </div>

              {/* Method 1: Quick Install Anyway */}
              <div
                style={{
                  padding: 16,
                  background: '#ffffff',
                  borderRadius: 16,
                  border: '1.5px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#0284c7', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800 }}>A</span>
                    <h5 style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      Quick Bypass During Installation (Recommended)
                    </h5>
                  </div>
                  <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#0284c7', background: '#e0f2fe', padding: '2px 8px', borderRadius: 6 }}>
                    EASIEST
                  </span>
                </div>
                <p style={{ fontSize: '0.76rem', color: '#475569', lineHeight: 1.45, marginBottom: 10 }}>
                  When the Play Protect dialog pops up on your screen:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.76rem', color: '#334155' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ChevronRight size={13} color="#0284c7" />
                    <span>Tap <strong>"More details"</strong> (small dropdown link below the warning).</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ChevronRight size={13} color="#0284c7" />
                    <span>Tap <strong style={{ color: '#0284c7' }}>"Install anyway"</strong> to complete installation immediately.</span>
                  </div>
                </div>
              </div>

              {/* Method 2: Turn Off Play Protect in Play Store */}
              <div
                style={{
                  padding: 16,
                  background: '#ffffff',
                  borderRadius: 16,
                  border: '1.5px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#dc2626', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800 }}>B</span>
                    <h5 style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      How to Turn Off Play Protect (If Blocked or Deleted)
                    </h5>
                  </div>
                  <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#dc2626', background: '#fee2e2', padding: '2px 8px', borderRadius: 6 }}>
                    PLAY STORE SETTINGS
                  </span>
                </div>
                <p style={{ fontSize: '0.76rem', color: '#475569', lineHeight: 1.45, marginBottom: 10 }}>
                  If Android blocks the installation entirely, disable Play Protect scanning:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.76rem', color: '#334155' }}>
                    <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#f1f5f9', color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 800, flexShrink: 0 }}>1</span>
                    <span>Open the <strong>Google Play Store</strong> app on your Android phone.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.76rem', color: '#334155' }}>
                    <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#f1f5f9', color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 800, flexShrink: 0 }}>2</span>
                    <span>Tap your <strong>Profile picture / icon</strong> in the top-right corner.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.76rem', color: '#334155' }}>
                    <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#f1f5f9', color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 800, flexShrink: 0 }}>3</span>
                    <span>Select <strong>Play Protect</strong> from the menu.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.76rem', color: '#334155' }}>
                    <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#f1f5f9', color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 800, flexShrink: 0 }}>4</span>
                    <span>Tap the <strong>Settings (gear ⚙️) icon</strong> in the top-right corner.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.76rem', color: '#334155' }}>
                    <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#f1f5f9', color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 800, flexShrink: 0 }}>5</span>
                    <span>Toggle <strong>OFF</strong> <em>"Scan apps with Play Protect"</em> (and <em>"Improve harmful app detection"</em>).</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.76rem', color: '#334155' }}>
                    <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#f1f5f9', color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 800, flexShrink: 0 }}>6</span>
                    <span>Tap <strong>"Turn off"</strong> to confirm. Now tap <strong>ytcash.apk</strong> from Downloads and install smoothly!</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security & Privacy Reassurance footer */}
          <div
            style={{
              marginTop: 16,
              paddingTop: 12,
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: '#64748b' }}>
              <ShieldCheck size={14} color="#059669" />
              <span>Privacy Note: ytCash only monitors YouTube playback to count watch seconds.</span>
            </div>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0284c7' }}>
              100% Safe & Clean
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
