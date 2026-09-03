import React, { useState } from 'react';
import {
  ArrowRight,
  Rocket,
  PlaySquare,
  RefreshCw,
} from 'lucide-react';
import { User } from '../types';

interface ProfileSwitchBannerProps {
  currentRole: 'viewer' | 'creator';
  user: User | null;
  onSwitchProfile: (targetRole: 'viewer' | 'campaigner') => void;
}

export const ProfileSwitchBanner: React.FC<ProfileSwitchBannerProps> = ({
  currentRole,
  onSwitchProfile,
}) => {
  const [switching, setSwitching] = useState(false);
  const isViewer = currentRole === 'viewer';
  const targetRole = isViewer ? 'campaigner' : 'viewer';

  const handleSwitch = async () => {
    setSwitching(true);
    try {
      await onSwitchProfile(targetRole);
    } finally {
      setSwitching(false);
    }
  };

  // Eye-catching gradient banner:
  // - Viewer Mode -> Prompts Creator: Deep Royal Indigo (#1e1b4b -> #4338ca)
  // - Creator Mode -> Prompts Viewer: Rich Emerald (#064e3b -> #059669)
  const bannerGradient = isViewer
    ? 'linear-gradient(135deg, #1e1b4b 0%, #312e81 45%, #4338ca 100%)'
    : 'linear-gradient(135deg, #064e3b 0%, #047857 45%, #059669 100%)';

  const headlineHighlightColor = isViewer ? '#38bdf8' : '#6ee7b7';
  const buttonTextColor = isViewer ? '#312e81' : '#064e3b';
  const bannerShadow = isViewer
    ? '0 6px 18px -3px rgba(49, 46, 129, 0.28)'
    : '0 6px 18px -3px rgba(4, 120, 87, 0.28)';

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 14,
        background: bannerGradient,
        boxShadow: bannerShadow,
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 10,
        border: '1px solid rgba(255, 255, 255, 0.16)',
      }}
    >
      {/* Left: Compact Icon & Headline */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {isViewer ? <Rocket size={20} color="#ffffff" /> : <PlaySquare size={20} color="#ffffff" />}
        </div>

        <div className="font-display" style={{ fontSize: '1.22rem', color: '#ffffff', letterSpacing: '0.01em', margin: 0 }}>
          {isViewer ? (
            <>
              PROMOTE YOUR VIDEOS WITH{' '}
              <span style={{ color: headlineHighlightColor }}>ONE CLICK</span>
            </>
          ) : (
            <>
              EARN MONEY WITH{' '}
              <span style={{ color: headlineHighlightColor }}>WATCHING VIDEOS</span>
            </>
          )}
        </div>
      </div>

      {/* Right: Minimal 1-Click Switch Button */}
      <button
        onClick={handleSwitch}
        disabled={switching}
        style={{
          padding: '10px 22px',
          fontSize: '0.88rem',
          fontWeight: 800,
          fontFamily: 'JetBrains Mono, monospace',
          letterSpacing: '0.03em',
          textTransform: 'uppercase',
          borderRadius: 10,
          border: 'none',
          background: '#ffffff',
          color: buttonTextColor,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          cursor: switching ? 'not-allowed' : 'pointer',
          boxShadow: '0 3px 12px rgba(0, 0, 0, 0.18)',
          transition: 'all 0.15s ease',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
      >
        {switching ? (
          <>
            <RefreshCw size={14} className="pulse-neon" />
            <span>Switching...</span>
          </>
        ) : isViewer ? (
          <>
            <span>Switch to Creator</span>
            <ArrowRight size={15} />
          </>
        ) : (
          <>
            <span>Switch to Viewer</span>
            <ArrowRight size={15} />
          </>
        )}
      </button>
    </div>
  );
};
