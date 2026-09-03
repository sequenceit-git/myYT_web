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
    <div style={{ maxWidth: 1180, margin: '20px auto', padding: '0 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      {/* Top Header */}
      <div style={{ textAlign: 'center', maxWidth: 680 }}>
        <div className="badge-pill badge-neon" style={{ marginBottom: 6, fontSize: '0.65rem', padding: '2px 8px' }}>
          <Smartphone size={12} /> Interactive Mobile App Demo & QR Download
        </div>
        <h1 className="font-display" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: '#ffffff', letterSpacing: '0.01em', lineHeight: 1.1 }}>
          MOBILE APP <span style={{ color: 'var(--primary-neon)' }}>SIMULATOR & DOWNLOAD</span>
        </h1>
        <p className="font-body" style={{ color: 'var(--on-surface-variant)', marginTop: 4, fontSize: '0.8rem' }}>
          Test the interactive demo below to experience how mobile viewers watch videos and earn credits. Scan the QR code to install the official Android App!
        </p>
      </div>

      {/* Main 2-Column Section: Left Phone Mockup | Right QR Code Download Card */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24, width: '100%', maxWidth: 960, alignItems: 'center' }}>
        
        {/* Left: Interactive Phone Mockup */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              width: 330,
              height: 640,
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

                    <div style={{ marginTop: 10 }}>
                      <h4 style={{ fontSize: '0.82rem', color: '#ffffff', fontWeight: 600 }}>{selectedVideo.title}</h4>
                      <div className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--on-surface-variant)', marginTop: 1 }}>
                        Anti-Cheat Watchdog: ACTIVE
                      </div>
                    </div>
                  </div>

                  {/* Circular Countdown Timer */}
                  <div style={{ textAlign: 'center', margin: '10px 0' }}>
                    <div
                      style={{
                        width: 90,
                        height: 90,
                        borderRadius: '50%',
                        border: '3px solid var(--primary-neon)',
                        margin: '0 auto',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(195,244,0,0.06)',
                      }}
                      className="pulse-neon"
                    >
                      <span className="font-mono" style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--primary-neon)' }}>
                        {remainingSec}s
                      </span>
                      <span className="font-mono" style={{ fontSize: '0.55rem', color: 'var(--on-surface-variant)' }}>
                        Remaining
                      </span>
                    </div>
                    <p style={{ fontSize: '0.66rem', color: 'var(--on-surface-variant)', marginTop: 8 }}>
                      Server timer is monitoring active video playback.
                    </p>
                  </div>

                  <div style={{ fontSize: '0.65rem', color: '#9ca3af', textAlign: 'center', background: '#141414', padding: '6px', borderRadius: 8 }}>
                    Reward: <strong style={{ color: 'var(--primary-neon)' }}>+{selectedVideo.rewardCredits} Credits</strong> upon completion
                  </div>
                </div>
              )}

              {/* STATE 3: HUMAN OVERLAY CHECK */}
              {appState === 'overlay' && (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: 14 }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(195,244,0,0.15)', border: '2px solid var(--primary-neon)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="pulse-neon">
                    <Sparkles size={28} color="var(--primary-neon)" />
                  </div>

                  <div>
                    <h3 className="font-display" style={{ fontSize: '1.25rem', color: '#ffffff' }}>Human Confirmation</h3>
                    <p className="font-body" style={{ fontSize: '0.72rem', color: 'var(--on-surface-variant)', marginTop: 4, padding: '0 6px' }}>
                      Watch duration complete! Tap below to confirm presence and claim credits.
                    </p>
                  </div>

                  <button
                    onClick={handleConfirmHumanPresence}
                    disabled={overlaySec > 0}
                    className="btn btn-neon glow-neon"
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '0.78rem',
                      borderRadius: 10,
                      opacity: overlaySec > 0 ? 0.6 : 1,
                    }}
                  >
                    {overlaySec > 0 ? `Wait (${overlaySec}s)...` : 'Claim +10 Reward Credits'}
                  </button>
                </div>
              )}

              {/* STATE 4: SUCCESS IN PHONE */}
              {appState === 'success' && (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: 14 }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(0,200,83,0.15)', border: '2px solid var(--success-green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Award size={30} color="var(--success-green)" />
                  </div>

                  <div>
                    <h3 className="font-display" style={{ fontSize: '1.3rem', color: 'var(--success-green)' }}>Simulation Complete!</h3>
                    <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-neon)', marginTop: 4 }}>
                      +{selectedVideo.rewardCredits} Credits Added
                    </div>
                    <p style={{ fontSize: '0.68rem', color: 'var(--on-surface-variant)', marginTop: 4 }}>
                      Scan the QR code on the right to install the app and earn real cash on your phone!
                    </p>
                  </div>

                  <button
                    onClick={handleStartDemoWatch}
                    className="btn btn-neon glow-neon"
                    style={{ width: '100%', padding: '10px', fontSize: '0.75rem', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                  >
                    <RefreshCw size={12} /> Run Simulation Again
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: QR Code & Mobile App Download Portal Card */}
        <div className="glass-card" style={{ padding: '22px 24px', borderRadius: 20, border: '1.5px solid var(--primary-neon)', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <QrCode size={20} color="var(--primary-neon)" />
            <h2 className="font-display" style={{ fontSize: '1.25rem', color: '#ffffff', letterSpacing: '0.02em' }}>
              INSTALL OFFICIAL MOBILE APP
            </h2>
          </div>

          <p style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)', lineHeight: 1.5 }}>
            Ready to earn real money on autopilot? Scan the QR code below using your Android phone camera or download the APK directly.
          </p>

          {/* QR Code Container */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, background: '#0e0e0e', padding: '16px', borderRadius: 16, border: '1px solid var(--glass-stroke)' }}>
            <div style={{ background: '#ffffff', padding: '12px', borderRadius: 12, boxShadow: '0 0 20px rgba(195, 244, 0, 0.25)' }}>
              <QRCodeSVG
                value={downloadUrl}
                size={160}
                bgColor="#ffffff"
                fgColor="#000000"
                level="Q"
              />
            </div>
            <span className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--primary-neon)', fontWeight: 700, letterSpacing: '0.04em' }}>
              SCAN WITH PHONE CAMERA TO DOWNLOAD
            </span>
          </div>

          {/* Direct APK Download Button */}
          <a
            href={downloadUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn-neon glow-neon"
            style={{
              width: '100%',
              padding: '11px 16px',
              fontSize: '0.82rem',
              borderRadius: 12,
              fontWeight: 750,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              textDecoration: 'none',
            }}
          >
            <Download size={16} /> Download Android APK (v1.2.0)
          </a>

          {/* How to Install Steps */}
          <div style={{ background: '#141414', padding: '12px 14px', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span className="font-mono" style={{ fontSize: '0.68rem', color: '#ffffff', textTransform: 'uppercase', fontWeight: 700 }}>
              Quick 3-Step Setup:
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: 'var(--on-surface-variant)' }}>
              <CheckCircle2 size={13} color="var(--primary-neon)" />
              <span>1. Scan QR Code or tap direct APK download</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: 'var(--on-surface-variant)' }}>
              <CheckCircle2 size={13} color="var(--primary-neon)" />
              <span>2. Install `myYT-v1.2.0.apk` on your Android device</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: 'var(--on-surface-variant)' }}>
              <CheckCircle2 size={13} color="var(--primary-neon)" />
              <span>3. Log in & start earning real cashout rewards!</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
