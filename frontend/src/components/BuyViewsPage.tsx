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
    <div style={{ maxWidth: 1180, margin: '24px auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Hero Header */}
      <div>
        <h1 className="font-display" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#ffffff', letterSpacing: '0.02em', lineHeight: 1.1 }}>
          BUY REAL <span style={{ color: 'var(--primary-neon)' }}>YOUTUBE VIEWS</span>
        </h1>
        <p className="font-body" style={{ color: 'var(--on-surface-variant)', marginTop: 8, fontSize: '0.95rem', maxWidth: 840, lineHeight: 1.5 }}>
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

      {/* 2-Column Order & Cost Simulator Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: 24, alignItems: 'start' }}>
        
        {/* Left Column: Cost Simulator & Campaign Order Builder */}
        <div className="glass-card" style={{ padding: 26, borderRadius: 20, border: '1px solid var(--glass-stroke)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={20} color="var(--primary-neon)" />
              <h2 className="font-display" style={{ fontSize: '1.4rem', color: '#ffffff', letterSpacing: '0.02em' }}>
                NEW CAMPAIGN ORDER
              </h2>
            </div>
            
            {user && (
              <div className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)' }}>
                Balance: <strong style={{ color: 'var(--secondary-cyan)' }}>${user.balance.toFixed(2)} USD</strong>
              </div>
            )}
          </div>

          <form onSubmit={handleCreateOrder} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            
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
              <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--glass-stroke)', background: '#0a0a0a', display: 'flex', gap: 14, padding: 10, alignItems: 'center' }}>
                <img
                  src={`https://img.youtube.com/vi/${previewVideoId}/hqdefault.jpg`}
                  alt="YouTube Preview"
                  style={{ width: 110, height: 65, objectFit: 'cover', borderRadius: 8 }}
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

            {/* 3. Watch Duration Selector */}
            <div>
              <label className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
                Required Watch Duration:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {[
                  { sec: 10, label: '10s', rate: '$5.00/1k' },
                  { sec: 30, label: '30s', rate: '$7.50/1k' },
                  { sec: 60, label: '1 Min', rate: '$10.00/1k' },
                  { sec: 120, label: '2 Min', rate: '$15.00/1k' },
                ].map((item) => {
                  const isSelected = duration === item.sec;
                  return (
                    <button
                      key={item.sec}
                      type="button"
                      onClick={() => setDuration(item.sec)}
                      style={{
                        padding: '12px 6px',
                        borderRadius: 12,
                        textAlign: 'center',
                        background: isSelected ? 'rgba(195, 244, 0, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                        border: isSelected ? '2px solid var(--primary-neon)' : '1px solid var(--glass-stroke)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div className="font-display" style={{ fontSize: '1.05rem', color: isSelected ? 'var(--primary-neon)' : '#ffffff' }}>
                        {item.label}
                      </div>
                      <div className="font-mono" style={{ fontSize: '0.62rem', color: isSelected ? 'var(--primary-neon)' : 'var(--on-surface-variant)', marginTop: 2 }}>
                        {item.rate}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Target Views Slider & Presets */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Target Views:
                </label>
                <span className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-neon)' }}>
                  {views.toLocaleString()} Views
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="50000"
                step="100"
                value={views}
                onChange={(e) => setViews(parseInt(e.target.value, 10) || 100)}
                style={{ width: '100%', accentColor: 'var(--primary-neon)', cursor: 'pointer', height: 6 }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
                {[100, 500, 1000, 2500, 5000, 10000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setViews(preset)}
                    className="btn btn-ghost"
                    style={{
                      padding: '3px 8px',
                      fontSize: '0.68rem',
                      borderRadius: 8,
                      background: views === preset ? 'rgba(195, 244, 0, 0.15)' : 'rgba(255,255,255,0.03)',
                      borderColor: views === preset ? 'var(--primary-neon)' : 'var(--glass-stroke)',
                      color: views === preset ? 'var(--primary-neon)' : 'var(--on-surface-variant)',
                    }}
                  >
                    {preset.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Summary & Price Banner */}
            <div style={{ background: '#0e0e0e', border: '1px solid var(--glass-stroke)', borderRadius: 14, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>Total Campaign Cost</div>
                <div className="font-mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginTop: 2 }}>
                  ${calculatedCost.toFixed(2)} <span style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>USD</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--on-surface-variant)' }}>Est. Watch Time: <strong style={{ color: 'var(--secondary-cyan)' }}>{totalWatchHours}h</strong></div>
                <div className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--on-surface-variant)', marginTop: 2 }}>${costPerView.toFixed(4)} / view</div>
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-neon glow-neon"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '0.95rem',
                fontWeight: 750,
                borderRadius: 14,
                letterSpacing: '0.03em',
              }}
            >
              {loading ? 'Processing Order...' : 'CREATE VIEW CAMPAIGN'}
            </button>
          </form>
        </div>

        {/* Right Column: Real-Time Campaign Simulation & Delivery Perks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* Live Cost & Delivery Simulation Card */}
          <div className="glass-card" style={{ padding: 22, borderRadius: 20, border: '1px solid var(--primary-neon)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <BarChart2 size={20} color="var(--primary-neon)" />
              <h3 className="font-display" style={{ fontSize: '1.2rem', color: '#ffffff' }}>
                CAMPAIGN SIMULATION BREAKDOWN
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#0e0e0e', borderRadius: 10 }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)' }}>Target Views</span>
                <span className="font-mono" style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>{views.toLocaleString()} Real Views</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#0e0e0e', borderRadius: 10 }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)' }}>Retention Time</span>
                <span className="font-mono" style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--primary-neon)' }}>{duration}s per video</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#0e0e0e', borderRadius: 10 }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)' }}>Total Retention Watch Time</span>
                <span className="font-mono" style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--secondary-cyan)' }}>{totalWatchHours} Hours</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#0e0e0e', borderRadius: 10 }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)' }}>Effective Rate</span>
                <span className="font-mono" style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>${costPerView.toFixed(4)} / view</span>
              </div>
            </div>
          </div>

          {/* Value Props */}
          <div className="glass-card" style={{ padding: 20, borderRadius: 18, border: '1px solid var(--glass-stroke)' }}>
            <span className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Why Advertise on myYT?
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <Users size={16} color="var(--primary-neon)" />
                <span style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)' }}>
                  <strong>100% Real Mobile Viewers:</strong> No headless browsers or bot scripts.
                </span>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <Clock size={16} color="var(--secondary-cyan)" />
                <span style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)' }}>
                  <strong>1-Hour Cooldown:</strong> Prevents spam and naturalizes view distribution.
                </span>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <ShieldCheck size={16} color="var(--primary-neon)" />
                <span style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)' }}>
                  <strong>Official YouTube Player:</strong> Full Play Integrity & watch time attribution.
                </span>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <Zap size={16} color="var(--secondary-cyan)" />
                <span style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)' }}>
                  <strong>High-Speed Delivery:</strong> BullMQ queue handles 5k+ concurrent tasks.
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
