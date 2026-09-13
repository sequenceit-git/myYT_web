import React, { useEffect, useState } from 'react';
import { Download, CheckCircle2, Smartphone, ShieldCheck, ArrowRight, Sparkles, RefreshCw } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export const DownloadPage: React.FC = () => {
  const [downloadStarted, setDownloadStarted] = useState(false);
  const apkUrl = '/downloads/ytcash.apk';

  const triggerDownload = () => {
    setDownloadStarted(true);
    const link = document.createElement('a');
    link.href = apkUrl;
    link.setAttribute('download', 'ytcash.apk');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    // Auto-initiate download after 800ms
    const timer = setTimeout(() => {
      triggerDownload();
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const fullUrl = typeof window !== 'undefined' ? window.location.href : 'https://ytcash.sequenceit.software/download';

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 120px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px 16px',
        position: 'relative',
      }}
    >
      {/* Background ambient orbs */}
      <div
        style={{
          position: 'absolute',
          width: 380,
          height: 380,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, rgba(255,255,255,0) 70%)',
          top: '10%',
          left: '15%',
          pointerEvents: 'none',
        }}
      />

      <div
        className="glass-card"
        style={{
          maxWidth: 540,
          width: '100%',
          padding: '36px 24px',
          borderRadius: 24,
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
          border: '1.5px solid rgba(14, 165, 233, 0.3)',
          boxShadow: '0 20px 50px rgba(15, 23, 42, 0.08)',
          background: 'rgba(255, 255, 255, 0.95)',
        }}
      >
        {/* App Icon */}
        <div style={{ display: 'inline-block', position: 'relative', marginBottom: 16 }}>
          <img
            src="/payment-methods/image.png"
            alt="ytCash"
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              boxShadow: '0 8px 24px rgba(14, 165, 233, 0.35)',
              border: '2px solid #ffffff',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: -4,
              right: -4,
              background: '#10b981',
              color: '#ffffff',
              borderRadius: '50%',
              width: 24,
              height: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #ffffff',
            }}
          >
            <ShieldCheck size={14} />
          </div>
        </div>

        <div className="badge-pill badge-cyan" style={{ display: 'inline-flex', marginBottom: 12, fontSize: '0.72rem' }}>
          <Sparkles size={12} style={{ marginRight: 4 }} /> OFFICIAL ANDROID RELEASE
        </div>

        <h2 className="font-display" style={{ fontSize: '1.65rem', color: '#0f172a', margin: '0 0 6px 0' }}>
          ytCash <span style={{ color: 'var(--primary-neon)' }}>Android App</span>
        </h2>

        <p className="font-body" style={{ color: '#64748b', fontSize: '0.88rem', margin: '0 auto 24px auto', maxWidth: 420 }}>
          {downloadStarted
            ? 'Your APK download has started automatically! If it did not start, tap the button below.'
            : 'Starting your download in a moment...'}
        </p>

        {/* Big Download Button */}
        <a
          href={apkUrl}
          download="ytcash.apk"
          onClick={triggerDownload}
          className="btn btn-neon glow-neon"
          style={{
            width: '100%',
            padding: '14px 20px',
            fontSize: '0.98rem',
            borderRadius: 14,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            fontWeight: 800,
            fontFamily: 'Outfit, sans-serif',
            boxShadow: '0 6px 20px rgba(14, 165, 233, 0.4)',
          }}
        >
          <Download size={20} />
          Download APK Direct (.apk)
        </a>

        {/* 3 Simple Install Steps */}
        <div
          style={{
            marginTop: 26,
            padding: '18px 16px',
            borderRadius: 16,
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            textAlign: 'left',
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', marginBottom: 12, letterSpacing: '0.05em' }}>
            Quick 3-Step Installation:
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#e0f2fe', color: '#0284c7', fontWeight: 800, fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                1
              </div>
              <span style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.4 }}>
                If prompted by your browser, tap <strong>"Download anyway"</strong>.
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#e0f2fe', color: '#0284c7', fontWeight: 800, fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                2
              </div>
              <span style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.4 }}>
                Open the downloaded <strong>ytcash.apk</strong> from your notification bar or Downloads folder.
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#e0f2fe', color: '#0284c7', fontWeight: 800, fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                3
              </div>
              <span style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.4 }}>
                Tap <strong>"Install"</strong>, log in with your email or Google account, and start earning!
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
