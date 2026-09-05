import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, CheckCircle2, AlertCircle, ShieldCheck, Zap, Clock, Minus, Plus } from 'lucide-react';
import { User, Campaign } from '../types';
import { apiRequest } from '../api';

interface BuyViewsPageProps {
  user: User | null;
  onRefreshUser?: () => void;
  onOpenAuth: (mode: 'signin' | 'signup', role?: 'viewer' | 'campaigner') => void;
}

const DEFAULT_PRESET_DURATIONS = [
  { sec: 10, ratePerView: 0.0035 },
  { sec: 15, ratePerView: 0.0050 },
  { sec: 30, ratePerView: 0.0080 },
  { sec: 45, ratePerView: 0.0120 },
  { sec: 60, ratePerView: 0.0160 },
  { sec: 90, ratePerView: 0.0240 },
  { sec: 120, ratePerView: 0.0320 },
];

export const BuyViewsPage: React.FC<BuyViewsPageProps> = ({ user, onRefreshUser, onOpenAuth }) => {
  const navigate = useNavigate();

  // Campaign Form / Simulation State
  const [presets, setPresets] = useState(DEFAULT_PRESET_DURATIONS);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [duration, setDuration] = useState<number>(10);
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [customSec, setCustomSec] = useState<number>(180);
  const [views, setViews] = useState<number>(1000);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch dynamic admin-configured pricing tiers
  useEffect(() => {
    apiRequest<any[]>('/campaigns/pricing-tiers')
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const mapped = res.data.map((t: any) => ({
            sec: t.duration,
            ratePerView: t.campaignerCost,
          }));
          setPresets(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const activeDuration = isCustom ? Math.max(10, Math.min(600, customSec || 10)) : duration;

  const costPerView = isCustom
    ? Number((0.0050 + (activeDuration - 10) * 0.000091).toFixed(4))
    : (presets.find((p) => p.sec === duration)?.ratePerView || 0.0050);

  const calculatedCost = Number((views * costPerView).toFixed(2));
  const totalWatchHours = ((views * activeDuration) / 3600).toFixed(1);

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

    if (!views || views < 1000) {
      setFeedback({ type: 'error', message: 'Minimum order is 1,000 views.' });
      return;
    }

    const creatorBal = user.creatorBalance !== undefined ? user.creatorBalance : user.balance;
    if (creatorBal < calculatedCost) {
      setFeedback({
        type: 'error',
        message: `Insufficient Creator Budget ($${creatorBal.toFixed(2)}). Total cost is $${calculatedCost.toFixed(2)}. Go to your Creator Dashboard to deposit funds.`,
      });
      return;
    }

    setLoading(true);
    const res = await apiRequest<{ campaign: Campaign; newBalance: number }>('/campaigns', {
      method: 'POST',
      body: JSON.stringify({
        youtubeUrl,
        targetViews: views,
        watchDurationSec: activeDuration,
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
        <h1 className="font-display hero-title" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#0f172a', letterSpacing: '0.02em', lineHeight: 1.1 }}>
          BUY REAL <span style={{ color: 'var(--primary-neon)' }}>YOUTUBE VIEWS</span>
        </h1>
        <p className="font-body" style={{ color: 'var(--on-surface-variant)', marginTop: 8, fontSize: '0.92rem', maxWidth: 840, lineHeight: 1.5 }}>
          Promote your YouTube video directly to hundreds of thousands of active mobile viewers. Guaranteed official player watch time with anti-spam cooldowns.
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
            background: feedback.type === 'success' ? '#f0f9ff' : 'rgba(239,68,68,0.08)',
          }}
        >
          {feedback.type === 'success' ? <CheckCircle2 color="var(--primary-neon)" size={18} /> : <AlertCircle color="#ef4444" size={18} />}
          <span style={{ fontSize: '0.88rem', fontWeight: 500, color: feedback.type === 'success' ? '#0369a1' : '#b91c1c' }}>{feedback.message}</span>
        </div>
      )}

      {/* 2-Column Responsive Order & Cost Simulator Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: 20, alignItems: 'start' }}>
        
        {/* Left Column: Cost Simulator & Campaign Order Builder */}
        <div className="glass-card mobile-p-small" style={{ padding: 24, borderRadius: 18, border: '1px solid var(--glass-stroke)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={18} color="var(--primary-neon)" />
              <h2 className="font-display" style={{ fontSize: '1.3rem', color: '#0f172a', letterSpacing: '0.02em' }}>
                NEW CAMPAIGN ORDER
              </h2>
            </div>
            
            {user && (
              <div className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)' }}>
                Ad Budget: <strong style={{ color: 'var(--primary-neon)' }}>${(user.creatorBalance !== undefined ? user.creatorBalance : user.balance).toFixed(2)} USD</strong>
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
                <span className="badge-pill badge-cyan" style={{ fontSize: '0.62rem', padding: '1px 6px' }}>REQUIRED</span>
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
              <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--glass-stroke)', background: '#f0f9ff', display: 'flex', gap: 12, padding: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <img
                  src={`https://img.youtube.com/vi/${previewVideoId}/hqdefault.jpg`}
                  alt="YouTube Preview"
                  style={{ width: 100, height: 60, objectFit: 'cover', borderRadius: 8 }}
                />
                <div>
                  <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--primary-neon)', fontWeight: 700 }}>✓ Valid Video Detected</div>
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

            {/* 3. Duration Selector (7 Preset Cards + 1 Custom = 8 Cards) */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Viewer Watch Duration:
                </label>
                <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--primary-neon)', fontWeight: 700 }}>
                  {activeDuration}s Selected (${costPerView.toFixed(4)}/view)
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {presets.map((p) => {
                  const isSelected = !isCustom && duration === p.sec;
                  return (
                    <button
                      key={p.sec}
                      type="button"
                      onClick={() => {
                        setIsCustom(false);
                        setDuration(p.sec);
                      }}
                      style={{
                        padding: '10px 6px',
                        borderRadius: 12,
                        background: isSelected ? 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)' : '#ffffff',
                        color: isSelected ? '#ffffff' : 'var(--on-surface-variant)',
                        border: isSelected ? '1.5px solid var(--primary-neon)' : '1px solid #cbd5e1',
                        fontFamily: 'JetBrains Mono, monospace',
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 3px 10px rgba(14, 165, 233, 0.35)' : 'none',
                        textAlign: 'center',
                      }}
                    >
                      {p.sec}s
                      <div style={{ fontSize: '0.64rem', opacity: 0.92, marginTop: 2, fontWeight: 500 }}>
                        ${p.ratePerView.toFixed(4)}/view
                      </div>
                    </button>
                  );
                })}

                {/* 8th Card: Custom Duration */}
                <button
                  type="button"
                  onClick={() => {
                    setIsCustom(true);
                    setDuration(Math.max(10, Math.min(600, customSec || 10)));
                  }}
                  style={{
                    padding: '10px 6px',
                    borderRadius: 12,
                    background: isCustom ? 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)' : '#ffffff',
                    color: isCustom ? '#ffffff' : 'var(--on-surface-variant)',
                    border: isCustom ? '1.5px solid var(--primary-neon)' : '1px solid #cbd5e1',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isCustom ? '0 3px 10px rgba(14, 165, 233, 0.35)' : 'none',
                    textAlign: 'center',
                  }}
                >
                  Custom
                  <div style={{ fontSize: '0.64rem', opacity: 0.92, marginTop: 2, fontWeight: 500 }}>
                    {isCustom ? `$${costPerView.toFixed(4)}/view` : 'Variable'}
                  </div>
                </button>
              </div>

              {/* Custom Duration Input Field */}
              {isCustom && (
                <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 12, background: '#f0f9ff', border: '1.5px solid rgba(14, 165, 233, 0.35)', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <Clock size={16} color="var(--primary-neon)" />
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                    Custom Seconds:
                  </span>
                  <input
                    type="number"
                    min={10}
                    max={600}
                    value={customSec || ''}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setCustomSec(isNaN(val) ? 0 : val);
                      if (val >= 10) setDuration(Math.min(600, val));
                    }}
                    onBlur={() => {
                      if (!customSec || customSec < 10) {
                        setCustomSec(10);
                        setDuration(10);
                      } else if (customSec > 600) {
                        setCustomSec(600);
                        setDuration(600);
                      }
                    }}
                    className="input-field font-mono"
                    style={{ width: 85, padding: '6px 10px', fontSize: '0.9rem', textAlign: 'center', fontWeight: 700, borderRadius: 8 }}
                    placeholder="180"
                  />
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>(10s – 600s)</span>
                  <span className="font-mono" style={{ marginLeft: 'auto', fontSize: '0.82rem', fontWeight: 800, color: 'var(--primary-neon)' }}>
                    ${costPerView.toFixed(4)} USD / View
                  </span>
                </div>
              )}
            </div>

            {/* 4. Target Views: Manual Number Input & +/- 100 Stepper Buttons */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Target Views (Min 1,000):
                </label>
                <div className="font-mono" style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--primary-neon)' }}>
                  {views.toLocaleString()} Views
                </div>
              </div>

              {/* Stepper with - / + buttons and manual number input */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setViews((prev) => Math.max(1000, (prev || 1000) - 100))}
                  disabled={views <= 1000}
                  className="stepper-btn"
                  title="Decrease by 100"
                  aria-label="Decrease by 100"
                >
                  <Minus size={20} strokeWidth={2.8} />
                </button>

                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    type="number"
                    min={1000}
                    step={100}
                    value={views || ''}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setViews(isNaN(val) ? 0 : val);
                    }}
                    onBlur={() => {
                      if (!views || views < 1000) {
                        setViews(1000);
                      }
                    }}
                    className="input-field font-mono"
                    style={{
                      height: 44,
                      fontSize: '1.15rem',
                      fontWeight: 800,
                      textAlign: 'center',
                      color: '#0f172a',
                      padding: '8px 45px 8px 14px',
                      borderRadius: 12,
                    }}
                    placeholder="1000"
                  />
                  <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: '0.78rem', color: '#64748b', fontWeight: 600, pointerEvents: 'none' }}>
                    views
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setViews((prev) => Math.max(1000, (prev || 0) + 100))}
                  className="stepper-btn"
                  title="Increase by 100"
                  aria-label="Increase by 100"
                >
                  <Plus size={20} strokeWidth={2.8} />
                </button>
              </div>

              {/* Quick Preset Buttons */}
              <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                {[1000, 2000, 5000, 10000, 25000, 50000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setViews(preset)}
                    className="badge-pill"
                    style={{
                      border: views === preset ? '1.5px solid var(--primary-neon)' : '1px solid #e2e8f0',
                      background: views === preset ? '#e0f2fe' : '#ffffff',
                      color: views === preset ? '#0369a1' : '#64748b',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      padding: '4px 10px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {preset >= 1000 ? `${preset / 1000}k` : preset}
                  </button>
                ))}
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
          <div className="glass-card mobile-p-small" style={{ padding: 22, borderRadius: 18, border: '1px solid rgba(14, 165, 233, 0.35)' }}>
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
                <strong className="font-mono" style={{ color: '#0f172a' }}>${costPerView.toFixed(4)} USD</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--on-surface-variant)' }}>Duration Per View:</span>
                <strong className="font-mono" style={{ color: '#0f172a' }}>{activeDuration} seconds</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--on-surface-variant)' }}>Total Watch Hours Delivered:</span>
                <strong className="font-mono" style={{ color: 'var(--primary-neon)' }}>≈ {totalWatchHours} Hours</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--on-surface-variant)' }}>Estimated Start Time:</span>
                <strong className="font-mono" style={{ color: 'var(--primary-neon)' }}>Instant (&lt; 2 Minutes)</strong>
              </div>
            </div>
          </div>

          {/* Guaranteed Features List */}
          <div className="glass-card mobile-p-small" style={{ padding: 20, borderRadius: 18, border: '1px solid var(--glass-stroke)' }}>
            <h3 className="font-display" style={{ fontSize: '1.1rem', color: '#0f172a', letterSpacing: '0.02em', marginBottom: 12 }}>
              GUARANTEED DELIVERY PERKS
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.82rem', color: 'var(--on-surface)' }}>
                <ShieldCheck size={16} color="var(--primary-neon)" style={{ flexShrink: 0 }} />
                <span><strong>100% Real Viewers:</strong> Views streamed inside official YouTube app player.</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.82rem', color: 'var(--on-surface)' }}>
                <Clock size={16} color="var(--primary-neon)" style={{ flexShrink: 0 }} />
                <span><strong>Anti-Spam:</strong> Unique viewer IP distribution prevents invalid YouTube duplicate detection.</span>
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
