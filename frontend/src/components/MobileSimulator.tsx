import React, { useState, useEffect } from 'react';
import { Play, Smartphone, ShieldCheck, Award, Sparkles, Download, CheckCircle2, ArrowRight } from 'lucide-react';
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
    rewardUsd: 0.0035,
    thumbnailUrl: 'https://img.youtube.com/vi/M7lc1UVf-VE/hqdefault.jpg',
  },
  {
    videoId: 'dQw4w9WgXcQ',
    title: 'Music Video Promotion Sample',
    durationSec: 10,
    rewardUsd: 0.0035,
    thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
  },
];

export const MobileSimulator: React.FC<MobileSimulatorProps> = ({ user }) => {
  const [appState, setAppState] = useState<'home' | 'watching' | 'overlay' | 'success'>('home');
  const [selectedVideo, setSelectedVideo] = useState(SAMPLE_DEMO_VIDEOS[0]);
  const [remainingSec, setRemainingSec] = useState<number>(10);
  const [overlaySec, setOverlaySec] = useState<number>(3);
  const [demoBalance, setDemoBalance] = useState<number>(user?.balance || 1.0);

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
    setDemoBalance((prev) => prev + selectedVideo.rewardUsd);
    setAppState('success');
  };

  return (
    <div className="responsive-container" style={{ margin: '20px auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      {/* Top Header */}
      <div style={{ textAlign: 'center', maxWidth: 680 }}>
        <div className="badge-pill badge-cyan" style={{ marginBottom: 6, fontSize: '0.65rem', padding: '2px 8px' }}>
          <Smartphone size={12} /> Interactive Mobile App Demo & QR Download
        </div>
        <h1 className="font-display hero-title" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: '#0f172a', letterSpacing: '0.01em', lineHeight: 1.1 }}>
          MOBILE APP <span style={{ color: 'var(--primary-neon)' }}>SIMULATOR & DOWNLOAD</span>
        </h1>
        <p className="font-body" style={{ color: 'var(--on-surface-variant)', marginTop: 4, fontSize: '0.8rem' }}>
          Test the interactive demo below to experience how mobile viewers watch videos and earn direct cash balance. Scan the QR code to install the official Android App!
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
              background: '#ffffff',
              borderRadius: 36,
              border: '6px solid #e2e8f0',
              boxShadow: '0 25px 60px rgba(14, 165, 233, 0.15), 0 0 30px rgba(14, 165, 233, 0.12)',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Phone Status Bar */}
            <div style={{ height: 26, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px', fontSize: '0.62rem', color: '#64748b', zIndex: 10, borderBottom: '1px solid #e2e8f0' }}>
              <span className="font-mono">9:41 AM</span>
              <div style={{ width: 60, height: 12, background: '#cbd5e1', borderRadius: '0 0 8px 8px', margin: '0 auto' }} />
              <div className="font-mono" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <span>5G</span>
                <span>100%</span>
              </div>
            </div>

            {/* In-App App Bar */}
            <div style={{ padding: '8px 14px', background: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Play size={10} fill="#ffffff" color="#ffffff" />
                </div>
                <span className="font-display" style={{ fontSize: '1rem', color: '#0f172a' }}>myYT Watch</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.65rem', color: 'var(--primary-neon)', fontWeight: 700 }}>
                <ShieldCheck size={12} /> Demo Mode
              </div>
            </div>

            {/* Screen Content */}
            <div style={{ flex: 1, padding: 14, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', background: '#f8fafc' }}>
              
              {/* STATE 1: HOME */}
              {appState === 'home' && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {/* Demo Balance Card */}
                    <div style={{ background: '#ffffff', border: '1.5px solid rgba(14, 165, 233, 0.25)', borderRadius: 14, padding: 14, textAlign: 'center', boxShadow: '0 4px 12px rgba(14, 165, 233, 0.06)' }}>
                      <div className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>Demo Cash Wallet Balance</div>
                      <div className="font-mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary-neon)', marginTop: 2 }}>
                        ${demoBalance.toFixed(4)} <span style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)' }}>USD</span>
                      </div>
                      <div className="font-mono" style={{ fontSize: '0.62rem', color: '#0284c7', marginTop: 2 }}>
                        Direct Cash Earnings • Instant Payouts
                      </div>
                    </div>

                    <div style={{ background: '#e0f2fe', border: '1px solid rgba(14, 165, 233, 0.25)', borderRadius: 10, padding: 8, fontSize: '0.68rem', color: '#0284c7', display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span>⚡ Official YouTube stream with server-timed watchdog verification.</span>
                    </div>
                  </div>

                  {/* Big Sky Blue "Start Watching" Button */}
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
                      <Play size={16} fill="#ffffff" color="#ffffff" /> Start Demo Simulation
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
                        <span className="badge-pill badge-cyan" style={{ fontSize: '0.58rem', padding: '1px 6px' }}>
                          ● YouTube Stream Running
                        </span>
                      </div>
                    </div>

                    <h4 style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a', marginTop: 10, lineHeight: 1.3 }}>
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
                        background: '#e0f2fe',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto',
                        boxShadow: '0 0 20px rgba(14, 165, 233, 0.25)',
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

                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--on-surface-variant)' }}>Direct Cash Reward:</span>
                    <strong className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--primary-neon)' }}>+${selectedVideo.rewardUsd.toFixed(4)} USD</strong>
                  </div>
                </div>
              )}

              {/* STATE 3: HUMAN OVERLAY CLAIM */}
              {appState === 'overlay' && (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: 12 }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#e0f2fe', border: '2px solid var(--primary-neon)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="pulse-neon">
                    <Sparkles size={32} color="var(--primary-neon)" />
                  </div>

                  <h3 className="font-display" style={{ fontSize: '1.2rem', color: '#0f172a' }}>
                    HUMAN CONFIRMATION
                  </h3>
                  <p style={{ fontSize: '0.72rem', color: 'var(--on-surface-variant)', lineHeight: 1.4 }}>
                    Watch time verified! Tap below to claim your +${selectedVideo.rewardUsd.toFixed(4)} USD direct cash reward.
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
                    {overlaySec > 0 ? `Wait (${overlaySec}s)...` : `Claim +$${selectedVideo.rewardUsd.toFixed(4)} USD`}
                  </button>
                </div>
              )}

              {/* STATE 4: SUCCESS */}
              {appState === 'success' && (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: 12 }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(5, 150, 105, 0.12)', border: '2px solid #059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Award size={34} color="#059669" />
                  </div>

                  <h3 className="font-display" style={{ fontSize: '1.2rem', color: '#059669' }}>
                    TASK VERIFIED!
                  </h3>
                  <div className="font-mono" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-neon)' }}>
                    +${selectedVideo.rewardUsd.toFixed(4)} USD
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--on-surface-variant)', lineHeight: 1.4 }}>
                    Direct cash reward added to your wallet! Instant cashout available.
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

        {/* Right: Download Card & QR Code */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          <div className="glass-card mobile-p-small" style={{ padding: 24, borderRadius: 20, border: '1.5px solid rgba(14, 165, 233, 0.3)' }}>
            <div className="badge-pill badge-cyan" style={{ marginBottom: 10, fontSize: '0.65rem' }}>
              OFFICIAL ANDROID APP (.APK)
            </div>

            <h3 className="font-display" style={{ fontSize: '1.25rem', color: '#0f172a', letterSpacing: '0.01em' }}>
              INSTALL <span style={{ color: 'var(--primary-neon)' }}>myYT APP</span> ON YOUR PHONE
            </h3>
            
            <p className="font-body" style={{ color: 'var(--on-surface-variant)', fontSize: '0.82rem', marginTop: 6, lineHeight: 1.5 }}>
              Scan the QR code with your mobile camera or download the APK directly to watch videos seamlessly in the background and earn cash on the go.
            </p>

            {/* QR Code Frame - Spacious & Centered (Unwanted Text Removed) */}
            <div style={{ margin: '22px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div
                style={{
                  background: '#ffffff',
                  padding: 20,
                  borderRadius: 22,
                  border: '1.5px solid rgba(14, 165, 233, 0.28)',
                  boxShadow: '0 8px 26px rgba(14, 165, 233, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <QRCodeSVG
                  value={downloadUrl}
                  size={210}
                  level="H"
                  fgColor="#0284c7"
                  bgColor="#ffffff"
                />
              </div>
            </div>

            <a
              href={downloadUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-neon glow-neon btn-mobile-full"
              style={{
                width: '100%',
                padding: '12px 18px',
                fontSize: '0.82rem',
                borderRadius: 12,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <Download size={16} /> Direct APK Download
            </a>
          </div>

          {/* Features Highlight */}
          <div className="glass-card mobile-p-small" style={{ padding: 18, borderRadius: 16, border: '1px solid var(--glass-stroke)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: 'var(--on-surface)' }}>
                <CheckCircle2 size={15} color="var(--primary-neon)" style={{ flexShrink: 0 }} />
                <span>Automatic foreground task return after video view ends.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: 'var(--on-surface)' }}>
                <CheckCircle2 size={15} color="var(--primary-neon)" style={{ flexShrink: 0 }} />
                <span>Floating countdown bubble overlaid on official YouTube app.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: 'var(--primary-neon)' }}>
                <CheckCircle2 size={15} color="var(--primary-neon)" style={{ flexShrink: 0 }} />
                <span>Instant cash balance synchronization with your web account.</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
