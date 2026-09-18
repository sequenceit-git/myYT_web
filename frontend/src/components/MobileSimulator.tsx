import React from 'react';
import { Smartphone, ShieldCheck, Download, CheckCircle2, QrCode, Zap, Check } from 'lucide-react';
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
      : 'https://ytcash.sequenceit.software/downloads/ytcash.apk';

  return (
    <div
      className="responsive-container"
      style={{
        margin: '24px auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 24,
        maxWidth: 680,
      }}
    >
      {/* Top Header */}
      <div style={{ textAlign: 'center', maxWidth: 600 }}>
        <div
          className="badge-pill badge-cyan"
          style={{ marginBottom: 10, fontSize: '0.68rem', padding: '3px 10px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <Smartphone size={13} /> Official Android App (.APK)
        </div>
        <h1
          className="font-display hero-title"
          style={{ fontSize: 'clamp(1.7rem, 3.2vw, 2.3rem)', color: '#0f172a', letterSpacing: '0.01em', lineHeight: 1.15 }}
        >
          GET THE OFFICIAL <span style={{ color: 'var(--primary-neon)' }}>ytCash APP</span>
        </h1>
        <p
          className="font-body"
          style={{ color: 'var(--on-surface-variant)', marginTop: 8, fontSize: '0.86rem', lineHeight: 1.5 }}
        >
          Scan the QR code with your mobile camera or tap below to download the official Android application directly to start watching and earning.
        </p>
      </div>

      {/* Main Download Card */}
      <div
        className="glass-card mobile-p-small"
        style={{
          width: '100%',
          padding: '32px 28px',
          borderRadius: 24,
          border: '1.5px solid rgba(14, 165, 233, 0.3)',
          boxShadow: '0 16px 40px rgba(14, 165, 233, 0.08)',
          background: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        {/* App Icon / Logo */}
        <div style={{ position: 'relative', marginBottom: 20 }}>
          <img
            src="/image.png"
            alt="ytCash App"
            style={{
              height: 64,
              width: 'auto',
              display: 'block',
              objectFit: 'contain',
            }}
          />
        </div>

        {/* QR Code Container */}
        <div style={{ margin: '10px 0 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div
            style={{
              background: '#ffffff',
              padding: 20,
              borderRadius: 22,
              border: '1.5px solid rgba(14, 165, 233, 0.28)',
              boxShadow: '0 8px 28px rgba(14, 165, 233, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <QRCodeSVG
              value={downloadUrl}
              size={220}
              level="H"
              fgColor="#0284c7"
              bgColor="#ffffff"
            />
          </div>
          <span
            className="font-mono"
            style={{ fontSize: '0.72rem', color: 'var(--on-surface-variant)', marginTop: 10, display: 'flex', alignItems: 'center', gap: 5 }}
          >
            <QrCode size={13} color="var(--primary-neon)" /> Point phone camera at QR code to download
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
            maxWidth: 420,
            padding: '14px 24px',
            fontSize: '0.92rem',
            fontWeight: 700,
            borderRadius: 14,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
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
            marginTop: 14,
            fontSize: '0.72rem',
            color: '#059669',
            fontWeight: 600,
          }}
        >
          <ShieldCheck size={14} /> Verified Safe • Direct from ytCash Secure Servers
        </div>
      </div>

      {/* Feature Highlights Card */}
      <div
        className="glass-card mobile-p-small"
        style={{
          width: '100%',
          padding: 22,
          borderRadius: 18,
          border: '1px solid var(--glass-stroke)',
          background: '#f8fafc',
        }}
      >
        <h4
          className="font-display"
          style={{ fontSize: '0.95rem', color: '#0f172a', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Zap size={16} color="var(--primary-neon)" /> Key Mobile App Features
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.8rem', color: 'var(--on-surface)' }}>
            <CheckCircle2 size={16} color="var(--primary-neon)" style={{ flexShrink: 0 }} />
            <span>Automatic foreground task return after video view ends.</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.8rem', color: 'var(--on-surface)' }}>
            <CheckCircle2 size={16} color="var(--primary-neon)" style={{ flexShrink: 0 }} />
            <span>Floating countdown bubble overlaid on official YouTube app.</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.8rem', color: 'var(--primary-neon)' }}>
            <CheckCircle2 size={16} color="var(--primary-neon)" style={{ flexShrink: 0 }} />
            <span>Instant cash balance synchronization with your web account.</span>
          </div>
        </div>
      </div>

      {/* 3 Simple Setup Steps */}
      <div
        className="glass-card mobile-p-small"
        style={{
          width: '100%',
          padding: 22,
          borderRadius: 18,
          border: '1px solid var(--glass-stroke)',
          background: '#ffffff',
        }}
      >
        <h4
          className="font-display"
          style={{ fontSize: '0.95rem', color: '#0f172a', marginBottom: 14 }}
        >
          Quick Installation Guide
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14 }}>
          <div style={{ padding: '12px 14px', background: '#f0f9ff', borderRadius: 12, border: '1px solid rgba(14,165,233,0.18)' }}>
            <span className="font-mono" style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--primary-neon)' }}>STEP 1</span>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a', marginTop: 4 }}>Download APK</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', marginTop: 2 }}>Tap Direct APK Download or scan QR code.</div>
          </div>
          <div style={{ padding: '12px 14px', background: '#f0f9ff', borderRadius: 12, border: '1px solid rgba(14,165,233,0.18)' }}>
            <span className="font-mono" style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--primary-neon)' }}>STEP 2</span>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a', marginTop: 4 }}>Allow Install</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', marginTop: 2 }}>Enable "Install unknown apps" in Android settings.</div>
          </div>
          <div style={{ padding: '12px 14px', background: '#f0f9ff', borderRadius: 12, border: '1px solid rgba(14,165,233,0.18)' }}>
            <span className="font-mono" style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--primary-neon)' }}>STEP 3</span>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a', marginTop: 4 }}>Sign In & Earn</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', marginTop: 2 }}>Sign in with Google to watch videos and earn cash.</div>
          </div>
        </div>
      </div>
    </div>
  );
};
