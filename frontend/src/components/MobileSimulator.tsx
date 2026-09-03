import React, { useState, useEffect } from 'react';
import { Play, Smartphone, ShieldCheck, Award, Sparkles, Download, QrCode, RefreshCw, CheckCircle2, ArrowRight } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { User } from '../types';

interface MobileSimulatorProps {
  user: User | null;
  onRefreshUser?: () => void;
}

const SAMPLE_DEMO_VIDEOS = [
  {
    videoId: 'M7lc1UVf-VE',
    title: 'YouTube Developer Platform Demo',
    durationSec: 10,
    rewardCredits: 10,
    thumbnailUrl: 'https://img.youtube.com/vi/M7lc1UVf-VE/hqdefault.jpg',
  },
  {
    videoId: 'dQw4w9WgXcQ',
    title: 'Music Video Promotion Sample',
    durationSec: 10,
    rewardCredits: 10,
    thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
  },
];

export const MobileSimulator: React.FC<MobileSimulatorProps> = ({ user }) => {
  const [appState, setAppState] = useState<'home' | 'watching' | 'overlay' | 'success'>('home');
  const [selectedVideo, setSelectedVideo] = useState(SAMPLE_DEMO_VIDEOS[0]);
  const [remainingSec, setRemainingSec] = useState<number>(10);
  const [overlaySec, setOverlaySec] = useState<number>(3);
  const [demoCredits, setDemoCredits] = useState<number>(user?.credits || 50);

  // App download URL
  const downloadUrl = 'https://myyt.com/download/myyt-app-v1.2.0.apk';

  // Watch timer countdown
  useEffect(() => {
    let interval: any;
    if (appState === 'watching' && remainingSec > 0) {
      interval = setInterval(() => {
        setRemainingSec((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setAppState('overlay');
            setOverlaySec(3);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [appState, remainingSec]);

  // Human overlay confirmation countdown
  useEffect(() => {
    let interval: any;
    if (appState === 'overlay' && overlaySec > 0) {
      interval = setInterval(() => {
        setOverlaySec((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [appState, overlaySec]);

  const handleStartDemoWatch = () => {
    const randomVideo = SAMPLE_DEMO_VIDEOS[Math.floor(Math.random() * SAMPLE_DEMO_VIDEOS.length)];
    setSelectedVideo(randomVideo);
    setRemainingSec(randomVideo.durationSec);
    setAppState('watching');
  };

  const handleConfirmHumanPresence = () => {
    setDemoCredits((prev) => prev + selectedVideo.rewardCredits);
    setAppState('success');
  };

  return (
    <div className="responsive-container" style={{ margin: '20px auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      {/* Top Header */}
      <div style={{ textAlign: 'center', maxWidth: 680 }}>
        <div className="badge-pill badge-neon" style={{ marginBottom: 6, fontSize: '0.65rem', padding: '2px 8px' }}>
          <Smartphone size={12} /> Interactive Mobile App Demo & QR Download
        </div>
        <h1 className="font-display hero-title" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: '#ffffff', letterSpacing: '0.01em', lineHeight: 1.1 }}>
          MOBILE APP <span style={{ color: 'var(--primary-neon)' }}>SIMULATOR & DOWNLOAD</span>
        </h1>
        <p className="font-body" style={{ color: 'var(--on-surface-variant)', marginTop: 4, fontSize: '0.8rem' }}>
          Test the interactive demo below to experience how mobile viewers watch videos and earn credits. Scan the QR code to install the official Android App!
        </p>
      </div>

      {/* Main 2-Column Responsive Section: Left Phone Mockup | Right QR Code Download Card */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 24, width: '100%', maxWidth: 960, alignItems: 'center' }}>
        
        {/* Left: Interactive Phone Mockup */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              width: 'min(330px, 92vw)',
              height: 'min(640px, 85vh)',
              background: '#0d0d0d',
              borderRadius: 36,
              border: '6px solid #242424',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 30px rgba(195, 244, 0, 0.12)',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Phone Status Bar */}
            <div style={{ height: 26, background: '#0d0d0d', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px', fontSize: '0.62rem', color: '#888888', zIndex: 10 }}>
              <span className="font-mono">9:41 AM</span>
              <div style={{ width: 60, height: 12, background: '#000000', borderRadius: '0 0 8px 8px', margin: '0 auto' }} />
              <div className="font-mono" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <span>5G</span>
                <span>100%</span>
              </div>
            </div>

            {/* In-App App Bar */}
            <div style={{ padding: '8px 14px', background: '#141414', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-stroke)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--primary-neon)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Play size={11} color="#161e00" fill="#161e00" />
                </div>
                <span className="font-display" style={{ fontSize: '1rem', color: '#ffffff' }}>myYT Watch</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.65rem', color: 'var(--primary-neon)', fontWeight: 700 }}>
                <ShieldCheck size={12} /> Demo Mode
              </div>
            </div>

            {/* Screen Content */}
            <div style={{ flex: 1, padding: 14, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', background: '#0d0d0d' }}>
              
              {/* STATE 1: HOME */}
              {appState === 'home' && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {/* Demo Balance Card */}
                    <div style={{ background: '#161616', border: '1px solid var(--glass-stroke)', borderRadius: 14, padding: 14, textAlign: 'center' }}>
                      <div className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>Demo Watch Credits</div>
                      <div className="font-mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary-neon)', marginTop: 2 }}>
                        {demoCredits.toLocaleString()} <span style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)' }}>Pts</span>
                      </div>
                      <div className="font-mono" style={{ fontSize: '0.62rem', color: 'var(--secondary-cyan)', marginTop: 2 }}>
                        Rate: 1,000 Credits = $1.00 USD
                      </div>
                    </div>

                    <div style={{ background: 'rgba(120,211,238,0.06)', border: '1px solid rgba(120,211,238,0.18)', borderRadius: 10, padding: 8, fontSize: '0.68rem', color: 'var(--secondary-cyan)', display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span>⚡ Official YouTube stream with server-timed watchdog verification.</span>
                    </div>
                  </div>

                  {/* Big Neon "Start Watching" Button */}
                  <div style={{ textAlign: 'center', margin: '14px 0' }}>
                    <button
                      onClick={handleStartDemoWatch}
                      className="btn btn-neon glow-neon"
                      style={{
                        width: '100%',
                        padding: '14px',
                        fontSize: '0.85rem',
                        fontWeight: 750,
                        letterSpacing: '0.04em',
                        borderRadius: 14,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                      }}
                    >
                      <Play size={16} fill="#161e00" color="#161e00" /> Start Demo Simulation
                    </button>
                    <span className="font-mono" style={{ fontSize: '0.62rem', color: 'var(--on-surface-variant)', display: 'block', marginTop: 6 }}>
                      Tap to test live 10-second video flow
                    </span>
                  </div>
                </>
              )}

              {/* STATE 2: WATCHING STATE */}
              {appState === 'watching' && (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--glass-stroke)', position: 'relative' }}>
                      <img
                        src={selectedVideo.thumbnailUrl}
                        alt="video"
                        style={{ width: '100%', height: 140, objectFit: 'cover' }}
                      />
                      <div style={{ position: 'absolute', top: 8, left: 8 }}>
                        <span className="badge-pill badge-neon" style={{ fontSize: '0.58rem', padding: '1px 5px' }}>
                          ● YouTube Stream Running
                        </span>
                      </div>
                    </div>

                    <h4 style={{ fontSize: '0.82rem', fontWeight: 600, color: '#ffffff', marginTop: 10, lineHeight: 1.3 }}>
                      {selectedVideo.title}
                    </h4>
                  </div>

                  {/* Circular Countdown Watchdog */}
                  <div style={{ textAlign: 'center', margin: 'auto 0' }}>
                    <div
                      style={{
                        width: 86,
                        height: 86,
                        borderRadius: '50%',
                        border: '3px solid var(--primary-neon)',
                        background: 'rgba(195, 244, 0, 0.08)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto',
                        boxShadow: '0 0 20px rgba(195, 244, 0, 0.25)',
                      }}
                    >
                      <span className="font-mono" style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--primary-neon)' }}>
                        {remainingSec}s
                      </span>
                      <span className="font-mono" style={{ fontSize: '0.55rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>
                        Required
                      </span>
                    </div>

                    <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--on-surface-variant)', display: 'block', marginTop: 10 }}>
                      Foreground watchdog active
                    </span>
                  </div>

                  <div style={{ background: '#141414', borderRadius: 10, padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--on-surface-variant)' }}>Pending Reward:</span>
                    <strong className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--primary-neon)' }}>+{selectedVideo.rewardCredits} Credits</strong>
                  </div>
                </div>
              )}

              {/* STATE 3: HUMAN OVERLAY CLAIM */}
              {appState === 'overlay' && (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: 12 }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(195, 244, 0, 0.15)', border: '2px solid var(--primary-neon)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="pulse-neon">
                    <Sparkles size={32} color="var(--primary-neon)" />
                  </div>

                  <h3 className="font-display" style={{ fontSize: '1.2rem', color: '#ffffff' }}>
                    HUMAN CONFIRMATION
                  </h3>
                  <p style={{ fontSize: '0.72rem', color: 'var(--on-surface-variant)', lineHeight: 1.4 }}>
                    Watch time verified! Tap below to confirm presence and claim your +{selectedVideo.rewardCredits} Credits.
                  </p>

                  <button
                    onClick={handleConfirmHumanPresence}
                    disabled={overlaySec > 0}
                    className="btn btn-neon glow-neon"
                    style={{
                      width: '100%',
                      padding: 12,
                      fontSize: '0.8rem',
                      borderRadius: 12,
                      opacity: overlaySec > 0 ? 0.6 : 1,
                      cursor: overlaySec > 0 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {overlaySec > 0 ? `Wait (${overlaySec}s)...` : `Claim +${selectedVideo.rewardCredits} Credits`}
                  </button>
                </div>
              )}

              {/* STATE 4: SUCCESS */}
              {appState === 'success' && (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: 12 }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(0, 200, 83, 0.15)', border: '2px solid #00c853', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Award size={34} color="#00c853" />
                  </div>

                  <h3 className="font-display" style={{ fontSize: '1.2rem', color: '#00c853' }}>
                    TASK VERIFIED!
                  </h3>
                  <div className="font-mono" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-neon)' }}>
                    +{selectedVideo.rewardCredits} CREDITS
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--on-surface-variant)', lineHeight: 1.4 }}>
                    Credits added to your wallet! Convert them to USD cash funds anytime.
                  </p>

                  <button
                    onClick={() => setAppState('home')}
                    className="btn btn-neon glow-neon"
                    style={{ width: '100%', padding: 12, fontSize: '0.8rem', borderRadius: 12 }}
                  >
                    Return to Simulator Home
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Right: Real Android App QR Code & APK Download Card */}
        <div className="glass-card mobile-p-small" style={{ padding: 26, borderRadius: 20, border: '1px solid rgba(195, 244, 0, 0.35)', display: 'flex', flexDirection: 'column', gap: 18 }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--primary-neon)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <QrCode size={22} color="#161e00" />
            </div>
            <div>
              <h3 className="font-display" style={{ fontSize: '1.25rem', color: '#ffffff', letterSpacing: '0.01em' }}>
                SCAN TO INSTALL APP
              </h3>
              <span style={{ fontSize: '0.72rem', color: 'var(--secondary-cyan)' }}>Official myYT Android APK v1.2.0</span>
            </div>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', lineHeight: 1.5 }}>
            Scan the QR code with your phone camera or tap the direct download button to install the official myYT mobile app on your Android device.
          </p>

          {/* High-Contrast QR Code */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
            <div
              style={{
                background: '#ffffff',
                padding: 14,
                borderRadius: 16,
                boxShadow: '0 0 25px rgba(195, 244, 0, 0.3)',
                display: 'inline-block',
              }}
            >
              <QRCodeSVG
                value={downloadUrl}
                size={160}
                level="H"
                includeMargin={false}
              />
            </div>
          </div>

          {/* Download Button */}
          <a
            href={downloadUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn-neon glow-neon"
            style={{
              padding: '12px 18px',
              fontSize: '0.85rem',
              borderRadius: 12,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Download size={16} /> Direct APK Download (.apk)
          </a>

          {/* Feature Highlights */}
          <div style={{ borderTop: '1px solid var(--glass-stroke)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={13} color="var(--primary-neon)" /> Fast in-app YouTube video streaming
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={13} color="var(--primary-neon)" /> Direct credit-to-USD conversion
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={13} color="var(--primary-neon)" /> Instant bKash, Nagad & Crypto cashouts
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
