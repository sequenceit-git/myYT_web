import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, CheckCircle2, AlertCircle, ShieldCheck, Zap, BarChart2, Clock, Users } from 'lucide-react';
import { User, Campaign } from '../types';
import { apiRequest } from '../api';

interface BuyViewsPageProps {
  user: User | null;
  onRefreshUser?: () => void;
  onOpenAuth: (mode: 'signin' | 'signup', role?: 'viewer' | 'campaigner') => void;
}

export const BuyViewsPage: React.FC<BuyViewsPageProps> = ({ user, onRefreshUser, onOpenAuth }) => {
  const navigate = useNavigate();

  // Campaign Form / Simulation State
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [duration, setDuration] = useState<number>(10);
  const [views, setViews] = useState<number>(1000);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  /* Pricing Multipliers:
     10s: 1.0 ($5.00 / 1k)
     30s: 1.5 ($7.50 / 1k)
     60s: 2.0 ($10.00 / 1k)
     120s: 3.0 ($15.00 / 1k)
  */
  const basePrice = 5;
  const durationMultiplier: Record<number, number> = {
    10: 1.0,
    30: 1.5,
    60: 2.0,
    120: 3.0,
  };

  const currentMultiplier = durationMultiplier[duration] || 1.0;
  const calculatedCost = Number(((views / 1000) * basePrice * currentMultiplier).toFixed(2));
  const costPerView = Number((calculatedCost / views).toFixed(4));
  const totalWatchHours = ((views * duration) / 3600).toFixed(1);

  const extractVideoId = (url: string) => {
    const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const previewVideoId = extractVideoId(youtubeUrl);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!user) {
      onOpenAuth('signin', 'campaigner');
      return;
    }

    if (!youtubeUrl.includes('youtube.com') && !youtubeUrl.includes('youtu.be')) {
      setFeedback({ type: 'error', message: 'Please enter a valid YouTube URL.' });
      return;
    }

    if (!views || views < 100) {
      setFeedback({ type: 'error', message: 'Minimum order is 100 views.' });
      return;
    }

    if (user.balance < calculatedCost) {
      setFeedback({
        type: 'error',
        message: `Insufficient balance ($${user.balance.toFixed(2)}). Total cost is $${calculatedCost.toFixed(2)}. Go to your Creator Dashboard to deposit funds.`,
      });
      return;
    }

    setLoading(true);
    const res = await apiRequest<{ campaign: Campaign; newBalance: number }>('/campaigns', {
      method: 'POST',
      body: JSON.stringify({
        youtubeUrl,
        targetViews: views,
        watchDurationSec: duration,
        title: title || undefined,
      }),
    });
    setLoading(false);

    if (res.success) {
      setFeedback({ type: 'success', message: '✓ Your campaign has been created! Redirecting to Creator Dashboard...' });
      if (onRefreshUser) onRefreshUser();
      setTimeout(() => {
        navigate('/creator');
      }, 1200);
    } else {
      setFeedback({ type: 'error', message: res.error || 'Failed to place order' });
    }
  };

  return (
    <div className="responsive-container" style={{ margin: '20px auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      
      {/* Hero Header */}
      <div>
        <h1 className="font-display hero-title" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#ffffff', letterSpacing: '0.02em', lineHeight: 1.1 }}>
          BUY REAL <span style={{ color: 'var(--primary-neon)' }}>YOUTUBE VIEWS</span>
        </h1>
        <p className="font-body" style={{ color: 'var(--on-surface-variant)', marginTop: 8, fontSize: '0.92rem', maxWidth: 840, lineHeight: 1.5 }}>
          Promote your YouTube video directly to hundreds of thousands of active mobile viewers. Guaranteed official player watch time with 1-hour anti-spam cooldowns.
        </p>
      </div>

      {feedback && (
        <div
          className="glass-card"
          style={{
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            borderRadius: 12,
            borderLeft: feedback.type === 'success' ? '4px solid var(--primary-neon)' : '4px solid #ef4444',
            background: feedback.type === 'success' ? 'rgba(195,244,0,0.1)' : 'rgba(239,68,68,0.1)',
          }}
        >
          {feedback.type === 'success' ? <CheckCircle2 color="var(--primary-neon)" size={18} /> : <AlertCircle color="#ef4444" size={18} />}
          <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>{feedback.message}</span>
        </div>
      )}

      {/* 2-Column Responsive Order & Cost Simulator Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: 20, alignItems: 'start' }}>
        
        {/* Left Column: Cost Simulator & Campaign Order Builder */}
        <div className="glass-card mobile-p-small" style={{ padding: 24, borderRadius: 18, border: '1px solid var(--glass-stroke)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={18} color="var(--primary-neon)" />
              <h2 className="font-display" style={{ fontSize: '1.3rem', color: '#ffffff', letterSpacing: '0.02em' }}>
                NEW CAMPAIGN ORDER
              </h2>
            </div>
            
            {user && (
              <div className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)' }}>
                Balance: <strong style={{ color: 'var(--secondary-cyan)' }}>${user.balance.toFixed(2)} USD</strong>
              </div>
            )}
          </div>

          <form onSubmit={handleCreateOrder} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            
            {/* 1. YouTube Video URL */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  YouTube Video URL:
                </label>
                <span className="badge-pill badge-neutral" style={{ fontSize: '0.62rem', padding: '1px 6px' }}>REQUIRED</span>
              </div>
              <input
                type="text"
                placeholder="https://youtu.be/_Ma6023klqk"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                required
                className="input-field"
                style={{ padding: '12px 14px', fontSize: '0.9rem' }}
              />
            </div>

            {/* Live Detected Thumbnail */}
            {previewVideoId && (
              <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--glass-stroke)', background: '#0a0a0a', display: 'flex', gap: 12, padding: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <img
                  src={`https://img.youtube.com/vi/${previewVideoId}/hqdefault.jpg`}
                  alt="YouTube Preview"
                  style={{ width: 100, height: 60, objectFit: 'cover', borderRadius: 8 }}
                />
                <div>
                  <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--primary-neon)' }}>✓ Valid Video Detected</div>
                  <div className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--on-surface-variant)', marginTop: 2 }}>ID: {previewVideoId}</div>
                </div>
              </div>
            )}

            {/* 2. Campaign Title (Optional) */}
            <div>
              <label className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
                Campaign Title (Optional):
              </label>
              <input
                type="text"
                placeholder="e.g. My New Official Music Video"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field"
                style={{ padding: '10px 14px', fontSize: '0.88rem' }}
              />
            </div>

            {/* 3. Duration Selector (Pills) */}
            <div>
              <label className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
                Viewer Watch Duration:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {[10, 30, 60, 120].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuration(d)}
                    style={{
                      padding: '10px 6px',
                      borderRadius: 12,
                      background: duration === d ? 'var(--primary-neon)' : '#161616',
                      color: duration === d ? 'var(--on-primary)' : 'var(--on-surface-variant)',
                      border: duration === d ? '1px solid var(--primary-neon)' : '1px solid var(--glass-stroke)',
                      fontFamily: 'JetBrains Mono, monospace',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {d}s
                    <div style={{ fontSize: '0.65rem', opacity: 0.8, marginTop: 2 }}>
                      ${(basePrice * (durationMultiplier[d] || 1)).toFixed(2)}/k
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Target Views Slider & Number Input */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Target Views:
                </label>
                <div className="font-mono" style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary-neon)' }}>
                  {views.toLocaleString()} Views
                </div>
              </div>
              <input
                type="range"
                min={100}
                max={50000}
                step={100}
                value={views}
                onChange={(e) => setViews(Number(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: 'var(--primary-neon)',
                  cursor: 'pointer',
                  height: 6,
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--on-surface-variant)', marginTop: 4 }}>
                <span>100 min</span>
                <span>10,000</span>
                <span>25,000</span>
                <span>50,000 max</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-neon glow-neon btn-mobile-full"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '0.92rem',
                borderRadius: 14,
                marginTop: 8,
              }}
            >
              {loading ? 'Creating Campaign...' : user ? `LAUNCH CAMPAIGN ($${calculatedCost.toFixed(2)} USD)` : 'SIGN IN & LAUNCH CAMPAIGN'}
            </button>
          </form>
        </div>

        {/* Right Column: Live Order Summary & Delivery Estimates */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* Order Summary Card */}
          <div className="glass-card mobile-p-small" style={{ padding: 22, borderRadius: 18, border: '1px solid rgba(195, 244, 0, 0.35)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>
                Estimated Total Cost
              </span>
              <span className="badge-pill badge-neon" style={{ fontSize: '0.62rem' }}>BEST VALUE</span>
            </div>

            <div className="font-mono" style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--primary-neon)', lineHeight: 1 }}>
              ${calculatedCost.toFixed(2)}{' '}
              <span style={{ fontSize: '0.9rem', color: 'var(--on-surface-variant)', fontWeight: 500 }}>USD</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--glass-stroke)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--on-surface-variant)' }}>Cost Per View:</span>
                <strong className="font-mono" style={{ color: '#ffffff' }}>${costPerView.toFixed(4)} USD</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--on-surface-variant)' }}>Duration Per View:</span>
                <strong className="font-mono" style={{ color: '#ffffff' }}>{duration} seconds</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--on-surface-variant)' }}>Total Watch Hours Delivered:</span>
                <strong className="font-mono" style={{ color: 'var(--secondary-cyan)' }}>≈ {totalWatchHours} Hours</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--on-surface-variant)' }}>Estimated Start Time:</span>
                <strong className="font-mono" style={{ color: 'var(--primary-neon)' }}>Instant (&lt; 2 Minutes)</strong>
              </div>
            </div>
          </div>

          {/* Guaranteed Features List */}
          <div className="glass-card mobile-p-small" style={{ padding: 20, borderRadius: 18, border: '1px solid var(--glass-stroke)' }}>
            <h3 className="font-display" style={{ fontSize: '1.1rem', color: '#ffffff', letterSpacing: '0.02em', marginBottom: 12 }}>
              GUARANTEED DELIVERY PERKS
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.82rem', color: 'var(--on-surface)' }}>
                <ShieldCheck size={16} color="var(--primary-neon)" style={{ flexShrink: 0 }} />
                <span><strong>100% Real Viewers:</strong> Views streamed inside official YouTube app player.</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.82rem', color: 'var(--on-surface)' }}>
                <Clock size={16} color="var(--secondary-cyan)" style={{ flexShrink: 0 }} />
                <span><strong>1-Hour Anti-Spam:</strong> Unique viewer IP distribution prevents invalid YouTube duplicate detection.</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.82rem', color: 'var(--on-surface)' }}>
                <Zap size={16} color="var(--primary-neon)" style={{ flexShrink: 0 }} />
                <span><strong>Real-Time Analytics:</strong> Live delivery graph and pause/resume controls in your Creator Dashboard.</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
