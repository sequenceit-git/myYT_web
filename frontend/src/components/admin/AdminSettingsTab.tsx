import React, { useState, useEffect } from 'react';
import {
  Sliders,
  RotateCcw,
  Save,
  CheckCircle2,
  Timer,
  DollarSign,
  Eye,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  PricingTierItem,
  CooldownConfig,
  DailyLimitConfig,
  HourlyLimitConfig,
  formatSecondsHuman,
  formatDurationBadge,
  formatDecimalString,
} from './adminTypes';

interface AdminSettingsTabProps {
  pricingTiers: PricingTierItem[];
  pricingSaving: boolean;
  handleResetPricing: () => void;
  handleSavePricing: () => void;
  handleUpdateTier: (index: number, field: 'campaignerCost' | 'viewerReward', value: number | string) => void;
  handleAddTier?: (duration: number, campaignerCost: number | string, viewerReward: number | string) => void;
  handleDeleteTier?: (index: number) => void;

  cooldownConfig: CooldownConfig;
  setCooldownConfig: React.Dispatch<React.SetStateAction<CooldownConfig>>;
  cooldownSaving: boolean;
  handleSaveCooldown: () => void;

  dollarRateInput: string;
  setDollarRateInput: (val: string) => void;
  rateUpdating: boolean;
  handleSaveDollarRate: (overrideRate?: number) => void;
  usdToBdt: number;

  dailyLimitConfig: DailyLimitConfig;
  setDailyLimitConfig: React.Dispatch<React.SetStateAction<DailyLimitConfig>>;
  dailyLimitSaving: boolean;
  handleSaveDailyLimit: () => void;

  hourlyLimitConfig: HourlyLimitConfig;
  setHourlyLimitConfig: React.Dispatch<React.SetStateAction<HourlyLimitConfig>>;
  hourlyLimitSaving: boolean;
  handleSaveHourlyLimit: () => void;
}

export const AdminSettingsTab: React.FC<AdminSettingsTabProps> = ({
  pricingTiers,
  pricingSaving,
  handleResetPricing,
  handleSavePricing,
  handleUpdateTier,
  handleAddTier,
  handleDeleteTier,
  cooldownConfig,
  setCooldownConfig,
  cooldownSaving,
  handleSaveCooldown,
  dollarRateInput,
  setDollarRateInput,
  rateUpdating,
  handleSaveDollarRate,
  usdToBdt,
  dailyLimitConfig,
  setDailyLimitConfig,
  dailyLimitSaving,
  handleSaveDailyLimit,
  hourlyLimitConfig,
  setHourlyLimitConfig,
  hourlyLimitSaving,
  handleSaveHourlyLimit,
}) => {
  const [newTierDuration, setNewTierDuration] = useState('');
  const [newTierCost, setNewTierCost] = useState('');
  const [newTierReward, setNewTierReward] = useState('');

  const [cooldownInput, setCooldownInput] = useState<string>(() =>
    cooldownConfig.durationSeconds !== undefined ? String(cooldownConfig.durationSeconds) : ''
  );

  useEffect(() => {
    setCooldownInput(cooldownConfig.durationSeconds !== undefined ? String(cooldownConfig.durationSeconds) : '');
  }, [cooldownConfig.durationSeconds]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* =========================================================================
          Card 1: Per-View Pricing Matrix
          ========================================================================= */}
      <div
        className="glass-card"
        style={{
          padding: '24px 28px',
          borderRadius: 20,
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 16,
            marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)',
              }}
            >
              <Sliders size={22} />
            </div>
            <div>
              <h2 className="font-display" style={{ fontSize: '1.25rem', color: '#0f172a', margin: 0 }}>
                Watch Duration Pricing Matrix
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.84rem', margin: '3px 0 0' }}>
                Control advertiser pricing ($/view) and viewer rewards ($/view) across all watch duration tiers.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              onClick={handleResetPricing}
              className="btn btn-ghost"
              style={{
                padding: '8px 14px',
                fontSize: '0.82rem',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <RotateCcw size={14} /> Reset Defaults
            </button>
            <button
              type="button"
              disabled={pricingSaving}
              onClick={handleSavePricing}
              className="btn btn-neon glow-neon"
              style={{
                padding: '9px 18px',
                fontSize: '0.86rem',
                fontWeight: 700,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 7,
              }}
            >
              <Save size={15} />
              {pricingSaving ? 'Saving...' : 'Save Pricing Rules'}
            </button>
          </div>
        </div>

        {/* Pricing Table */}
        <div style={{ overflowX: 'auto', borderRadius: 14, border: '1px solid #e2e8f0', background: '#ffffff' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 700 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '0.76rem', color: '#475569', letterSpacing: '0.04em' }}>
                <th style={{ padding: '14px 18px', fontWeight: 800 }}>WATCH DURATION</th>
                <th style={{ padding: '14px 18px', fontWeight: 800 }}>CAMPAIGNER COST ($ / VIEW)</th>
                <th style={{ padding: '14px 18px', fontWeight: 800 }}>VIEWER REWARD ($ / VIEW)</th>
                <th style={{ padding: '14px 18px', fontWeight: 800 }}>SYSTEM MARGIN (%)</th>
                <th style={{ padding: '14px 18px', fontWeight: 800 }}>1,000 VIEWS REVENUE</th>
                <th style={{ padding: '14px 18px', fontWeight: 800 }}>1,000 VIEWS PAYOUT</th>
                <th style={{ padding: '14px 18px', fontWeight: 800, textAlign: 'center' }}>ACTION</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: '0.88rem' }}>
              {pricingTiers.map((tier, idx) => {
                const costNum = parseFloat(String(tier.campaignerCost)) || 0;
                const rewardNum = parseFloat(String(tier.viewerReward)) || 0;
                const margin = costNum > 0
                  ? (((costNum - rewardNum) / costNum) * 100)
                  : 0;
                const marginColor = margin >= 30 ? '#059669' : margin >= 15 ? '#0284c7' : margin >= 0 ? '#d97706' : '#ef4444';
                const marginBg = margin >= 30 ? '#f0fdf4' : margin >= 15 ? '#f0f9ff' : margin >= 0 ? '#fffbeb' : '#fef2f2';

                return (
                  <tr
                    key={tier.duration}
                    style={{
                      borderBottom: idx < pricingTiers.length - 1 ? '1px solid #f1f5f9' : 'none',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    {/* Duration Badge */}
                    <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                      <span
                        className="badge-pill"
                        style={{
                          background: '#f1f5f9',
                          color: '#0f172a',
                          fontWeight: 800,
                          fontSize: '0.82rem',
                          padding: '5px 12px',
                          border: '1px solid #e2e8f0',
                          borderRadius: 8,
                          display: 'inline-block',
                        }}
                      >
                        {formatDurationBadge(tier.duration)}
                      </span>
                    </td>

                    {/* Campaigner Cost Input */}
                    <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          background: '#ffffff',
                          border: '1.5px solid #cbd5e1',
                          borderRadius: 10,
                          padding: '3px 8px',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                        }}
                      >
                        <span style={{ color: '#64748b', fontWeight: 700, fontSize: '0.88rem', marginRight: 4 }}>$</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={tier.campaignerCost !== undefined ? tier.campaignerCost : ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === '' || /^[0-9]*\.?[0-9]*$/.test(val)) {
                              handleUpdateTier(idx, 'campaignerCost', val);
                            }
                          }}
                          onBlur={() => {
                            const formatted = formatDecimalString(tier.campaignerCost, 10);
                            handleUpdateTier(idx, 'campaignerCost', formatted);
                          }}
                          style={{
                            width: 135,
                            padding: '4px 2px',
                            fontSize: '0.88rem',
                            fontWeight: 700,
                            border: 'none',
                            outline: 'none',
                            background: 'transparent',
                            color: '#0f172a',
                          }}
                        />
                      </div>
                    </td>

                    {/* Viewer Reward Input */}
                    <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          background: '#ffffff',
                          border: '1.5px solid #cbd5e1',
                          borderRadius: 10,
                          padding: '3px 8px',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                        }}
                      >
                        <span style={{ color: '#059669', fontWeight: 700, fontSize: '0.88rem', marginRight: 4 }}>$</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={tier.viewerReward !== undefined ? tier.viewerReward : ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === '' || /^[0-9]*\.?[0-9]*$/.test(val)) {
                              handleUpdateTier(idx, 'viewerReward', val);
                            }
                          }}
                          onBlur={() => {
                            const formatted = formatDecimalString(tier.viewerReward, 10);
                            handleUpdateTier(idx, 'viewerReward', formatted);
                          }}
                          style={{
                            width: 135,
                            padding: '4px 2px',
                            fontSize: '0.88rem',
                            fontWeight: 700,
                            border: 'none',
                            outline: 'none',
                            background: 'transparent',
                            color: '#059669',
                          }}
                        />
                      </div>
                    </td>

                    {/* System Margin % */}
                    <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                      <span
                        className="badge-pill"
                        style={{
                          background: marginBg,
                          color: marginColor,
                          fontWeight: 800,
                          fontSize: '0.8rem',
                          padding: '4px 10px',
                          borderRadius: 8,
                          border: `1px solid ${marginColor}33`,
                          display: 'inline-block',
                        }}
                      >
                        {margin.toFixed(1)}%
                      </span>
                    </td>

                    {/* 1,000 Views Campaign Revenue */}
                    <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                      <strong className="font-mono" style={{ color: '#0f172a', fontSize: '0.92rem' }}>
                        ${costNum * 1000 >= 0.01 ? (costNum * 1000).toFixed(2) : (costNum * 1000).toFixed(6).replace(/\.?0+$/, '')}
                      </strong>
                    </td>

                    {/* 1,000 Views Viewer Payout */}
                    <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                      <strong className="font-mono" style={{ color: '#059669', fontSize: '0.92rem' }}>
                        ${rewardNum * 1000 >= 0.01 ? (rewardNum * 1000).toFixed(2) : (rewardNum * 1000).toFixed(6).replace(/\.?0+$/, '')}
                      </strong>
                    </td>

                    {/* Action Column */}
                    <td style={{ padding: '14px 18px', verticalAlign: 'middle', textAlign: 'center' }}>
                      {handleDeleteTier && pricingTiers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteTier(idx)}
                          title={`Delete ${tier.duration}s tier`}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#94a3b8',
                            padding: '6px',
                            borderRadius: '6px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'color 0.15s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Add Tier Section */}
        {handleAddTier && (
          <div
            style={{
              marginTop: 16,
              padding: '14px 18px',
              borderRadius: 14,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>
              <Plus size={16} color="var(--primary-neon)" />
              <span>Add / Update Tier:</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Duration:</span>
                <input
                  type="number"
                  min="8"
                  placeholder="Seconds (e.g. 600)"
                  value={newTierDuration}
                  onChange={(e) => setNewTierDuration(e.target.value)}
                  style={{
                    width: 140,
                    padding: '6px 10px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Cost ($):</span>
                <input
                  type="text"
                  placeholder="0.0600"
                  value={newTierCost}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || /^[0-9]*\.?[0-9]*$/.test(val)) setNewTierCost(val);
                  }}
                  style={{
                    width: 125,
                    padding: '6px 10px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Reward ($):</span>
                <input
                  type="text"
                  placeholder="0.0450"
                  value={newTierReward}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || /^[0-9]*\.?[0-9]*$/.test(val)) setNewTierReward(val);
                  }}
                  style={{
                    width: 125,
                    padding: '6px 10px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                  }}
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  const d = parseInt(newTierDuration, 10);
                  const c = parseFloat(newTierCost) || 0;
                  const r = parseFloat(newTierReward) || 0;
                  if (d && d >= 8 && c >= 0 && r >= 0) {
                    handleAddTier(d, c, r);
                    setNewTierDuration('');
                    setNewTierCost('');
                    setNewTierReward('');
                  }
                }}
                className="btn btn-secondary"
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  fontSize: '0.80rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <Plus size={14} /> Add Tier
              </button>
            </div>
          </div>
        )}

        <div
          style={{
            marginTop: 16,
            padding: '12px 16px',
            borderRadius: 12,
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: '#64748b' }}>
            <CheckCircle2 size={16} color="#059669" />
            <span>Changes update order calculations on Buy Views and completion rewards for Viewers in real time.</span>
          </div>
          <button
            type="button"
            disabled={pricingSaving}
            onClick={handleSavePricing}
            className="btn btn-neon glow-neon"
            style={{
              padding: '7px 16px',
              fontSize: '0.82rem',
              fontWeight: 700,
              borderRadius: 8,
            }}
          >
            {pricingSaving ? 'Saving...' : 'Save Pricing Rules'}
          </button>
        </div>
      </div>

      {/* =========================================================================
          Card 2: Anti-Spam Video Cooldown Control
          ========================================================================= */}
      <div
        className="glass-card"
        style={{
          padding: '24px 28px',
          borderRadius: 20,
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 16,
            marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              }}
            >
              <Timer size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 className="font-display" style={{ fontSize: '1.25rem', color: '#0f172a', margin: 0 }}>
                  Anti-Spam Video Cooldown Controller
                </h2>
                <span
                  className="badge-pill"
                  style={{
                    background: cooldownConfig.enabled ? '#f0fdf4' : '#fef2f2',
                    color: cooldownConfig.enabled ? '#059669' : '#ef4444',
                    border: `1px solid ${cooldownConfig.enabled ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    fontWeight: 800,
                  }}
                >
                  {cooldownConfig.enabled ? 'PROTECTION ACTIVE' : 'DISABLED'}
                </span>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.84rem', margin: '3px 0 0' }}>
                Set how long viewers must wait before re-watching the same video campaign. Prevents repetitive view abuse.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={cooldownSaving}
            onClick={handleSaveCooldown}
            className="btn btn-neon glow-neon"
            style={{
              padding: '9px 18px',
              fontSize: '0.86rem',
              fontWeight: 700,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 7,
            }}
          >
            <Save size={15} />
            {cooldownSaving ? 'Saving...' : 'Save Cooldown Rules'}
          </button>
        </div>

        {/* Toggle & Cooldown Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Status Switcher */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              background: '#f8fafc',
              borderRadius: 14,
              border: '1px solid #e2e8f0',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div>
              <strong style={{ color: '#0f172a', fontSize: '0.94rem', display: 'block' }}>
                Anti-Spam Re-Watch Enforcement
              </strong>
              <span style={{ color: '#64748b', fontSize: '0.82rem' }}>
                When enabled, identical video tasks are placed on cooldown per viewer for the configured duration.
              </span>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={() => setCooldownConfig((prev) => ({ ...prev, enabled: true }))}
                className="btn"
                style={{
                  padding: '8px 16px',
                  borderRadius: 10,
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  background: cooldownConfig.enabled ? '#059669' : '#ffffff',
                  color: cooldownConfig.enabled ? '#ffffff' : '#64748b',
                  border: cooldownConfig.enabled ? 'none' : '1px solid #cbd5e1',
                }}
              >
                Enabled
              </button>
              <button
                type="button"
                onClick={() => setCooldownConfig((prev) => ({ ...prev, enabled: false }))}
                className="btn"
                style={{
                  padding: '8px 16px',
                  borderRadius: 10,
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  background: !cooldownConfig.enabled ? '#ef4444' : '#ffffff',
                  color: !cooldownConfig.enabled ? '#ffffff' : '#64748b',
                  border: !cooldownConfig.enabled ? 'none' : '1px solid #cbd5e1',
                }}
              >
                Disabled
              </button>
            </div>
          </div>

          {/* Cooldown Duration Input & Presets */}
          <div
            style={{
              padding: '20px',
              background: '#ffffff',
              borderRadius: 14,
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            <div>
              <label className="font-mono" style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 700, display: 'block', marginBottom: 6 }}>
                COOLDOWN DURATION (SECONDS):
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g. 3600"
                  value={cooldownInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || /^[0-9]+$/.test(val)) {
                      setCooldownInput(val);
                      const parsed = parseInt(val, 10);
                      setCooldownConfig((prev) => ({
                        ...prev,
                        durationSeconds: isNaN(parsed) ? 0 : Math.min(604800, parsed),
                      }));
                    }
                  }}
                  onBlur={() => {
                    if (cooldownInput.trim() === '') {
                      setCooldownInput('0');
                      setCooldownConfig((prev) => ({ ...prev, durationSeconds: 0 }));
                    }
                  }}
                  className="input-field font-mono"
                  style={{
                    width: 160,
                    padding: '10px 14px',
                    fontSize: '0.94rem',
                    fontWeight: 700,
                    borderRadius: 10,
                    color: '#0f172a',
                  }}
                />
                <div
                  style={{
                    padding: '8px 14px',
                    borderRadius: 10,
                    background: '#f0f9ff',
                    border: '1px solid rgba(14, 165, 233, 0.3)',
                    color: 'var(--primary-neon)',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                  }}
                >
                  Active Rule: {formatSecondsHuman(cooldownConfig.durationSeconds)}
                </div>
              </div>
            </div>

            {/* Quick Presets */}
            <div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, marginBottom: 8 }}>
                QUICK PRESETS:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {[
                  { label: '5 Min (300s)', sec: 300 },
                  { label: '15 Min (900s)', sec: 900 },
                  { label: '30 Min (1,800s)', sec: 1800 },
                  { label: '1 Hour (3,600s)', sec: 3600 },
                  { label: '2 Hours (7,200s)', sec: 7200 },
                  { label: '24 Hours (86,400s)', sec: 86400 },
                ].map((preset) => {
                  const isSelected = cooldownConfig.durationSeconds === preset.sec;
                  return (
                    <button
                      key={preset.sec}
                      type="button"
                      onClick={() => {
                        setCooldownConfig((prev) => ({
                          ...prev,
                          durationSeconds: preset.sec,
                          enabled: preset.sec > 0 ? true : prev.enabled,
                        }));
                        setCooldownInput(String(preset.sec));
                      }}
                      className="btn"
                      style={{
                        padding: '6px 12px',
                        borderRadius: 8,
                        fontSize: '0.78rem',
                        fontWeight: isSelected ? 700 : 500,
                        background: isSelected ? 'var(--primary-neon)' : '#f8fafc',
                        color: isSelected ? '#ffffff' : '#475569',
                        border: isSelected ? 'none' : '1px solid #e2e8f0',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          Card 3: Currency Exchange Rate Controller
          ========================================================================= */}
      <div
        className="glass-card"
        style={{
          padding: '24px 28px',
          borderRadius: 20,
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
            }}
          >
            <DollarSign size={22} />
          </div>
          <div>
            <h2 className="font-display" style={{ fontSize: '1.25rem', color: '#0f172a', margin: 0 }}>
              USD to BDT Currency Rate Engine
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.84rem', margin: '3px 0 0' }}>
              Current rate: 1 USD = ৳{usdToBdt} BDT. Used across bKash, Nagad, and local wallet conversions.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="font-mono" style={{ fontSize: '0.88rem', color: '#475569', fontWeight: 700 }}>1 USD = ৳</span>
            <input
              type="number"
              step="0.5"
              min="50"
              max="300"
              value={dollarRateInput}
              onChange={(e) => setDollarRateInput(e.target.value)}
              className="input-field"
              style={{ width: 110, padding: '8px 12px', fontSize: '0.94rem', fontWeight: 700, borderRadius: 10 }}
            />
            <span className="font-mono" style={{ fontSize: '0.88rem', color: '#475569', fontWeight: 700 }}>BDT</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Presets:</span>
            {[110, 115, 120, 122, 125].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setDollarRateInput(String(preset));
                  handleSaveDollarRate(preset);
                }}
                disabled={rateUpdating}
                className="btn btn-ghost"
                style={{
                  padding: '5px 10px',
                  fontSize: '0.76rem',
                  borderRadius: 8,
                  background: usdToBdt === preset ? '#e0f2fe' : '#ffffff',
                  borderColor: usdToBdt === preset ? 'var(--primary-neon)' : '#cbd5e1',
                  color: usdToBdt === preset ? 'var(--primary-neon)' : '#475569',
                  fontWeight: usdToBdt === preset ? 700 : 500,
                }}
              >
                ৳{preset}
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={rateUpdating || !dollarRateInput}
            onClick={() => handleSaveDollarRate()}
            className="btn btn-neon glow-neon"
            style={{ padding: '8px 18px', fontSize: '0.84rem', fontWeight: 700, borderRadius: 10 }}
          >
            {rateUpdating ? 'Updating...' : 'Update Exchange Rate'}
          </button>
        </div>
      </div>

      {/* =========================================================================
          Card 4: Daily Video Watch Limit per Viewer Controller
          ========================================================================= */}
      <div
        className="glass-card"
        style={{
          padding: '24px 28px',
          borderRadius: 20,
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 16,
            marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
              }}
            >
              <Eye size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h2 className="font-display" style={{ fontSize: '1.25rem', color: '#0f172a', margin: 0 }}>
                  Daily Video Watch Limit per Viewer
                </h2>
                <span
                  className="badge-pill"
                  style={{
                    background: dailyLimitConfig.enableDailyLimit ? '#f0fdf4' : '#f8fafc',
                    color: dailyLimitConfig.enableDailyLimit ? '#059669' : '#64748b',
                    border: `1px solid ${dailyLimitConfig.enableDailyLimit ? 'rgba(16, 185, 129, 0.3)' : '#cbd5e1'}`,
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    fontWeight: 800,
                  }}
                >
                  {dailyLimitConfig.enableDailyLimit
                    ? `ACTIVE (${dailyLimitConfig.maxDailyVideos} VIDEOS/DAY)`
                    : 'DISABLED (UNLIMITED)'}
                </span>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.84rem', margin: '3px 0 0' }}>
                Configure the maximum number of videos a viewer can watch per calendar day (resets at midnight).
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={dailyLimitSaving}
            onClick={handleSaveDailyLimit}
            className="btn btn-neon glow-neon"
            style={{
              padding: '9px 18px',
              fontSize: '0.86rem',
              fontWeight: 700,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 7,
            }}
          >
            <Save size={15} />
            {dailyLimitSaving ? 'Saving...' : 'Save Daily Limit Rule'}
          </button>
        </div>

        {/* Toggle & Limit Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Status Switcher */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 18px',
              background: '#f8fafc',
              borderRadius: 14,
              border: '1px solid #e2e8f0',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div>
              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>
                Daily Cap Protection Status
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                When enabled, viewers cannot watch more than the configured videos per day.
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6 }}>
              <button
                type="button"
                onClick={() => setDailyLimitConfig((prev) => ({ ...prev, enableDailyLimit: true }))}
                className="btn"
                style={{
                  padding: '7px 16px',
                  fontSize: '0.82rem',
                  borderRadius: 8,
                  fontWeight: 700,
                  background: dailyLimitConfig.enableDailyLimit ? '#059669' : '#ffffff',
                  color: dailyLimitConfig.enableDailyLimit ? '#ffffff' : '#64748b',
                  border: dailyLimitConfig.enableDailyLimit ? 'none' : '1px solid #cbd5e1',
                }}
              >
                Enable Daily Limit
              </button>
              <button
                type="button"
                onClick={() => setDailyLimitConfig((prev) => ({ ...prev, enableDailyLimit: false }))}
                className="btn"
                style={{
                  padding: '7px 16px',
                  fontSize: '0.82rem',
                  borderRadius: 8,
                  fontWeight: 700,
                  background: !dailyLimitConfig.enableDailyLimit ? '#64748b' : '#ffffff',
                  color: !dailyLimitConfig.enableDailyLimit ? '#ffffff' : '#64748b',
                  border: !dailyLimitConfig.enableDailyLimit ? 'none' : '1px solid #cbd5e1',
                }}
              >
                Unlimited (Disabled)
              </button>
            </div>
          </div>

          {/* Limit Input & Presets */}
          <div
            style={{
              padding: '16px 18px',
              background: '#ffffff',
              borderRadius: 14,
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="font-mono" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                  MAX VIDEOS PER DAY (PER VIEWER):
                </span>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={dailyLimitConfig.maxDailyVideos}
                  onChange={(e) =>
                    setDailyLimitConfig((prev) => ({
                      ...prev,
                      maxDailyVideos: Math.max(1, parseInt(e.target.value, 10) || 1),
                    }))
                  }
                  className="input-field"
                  style={{
                    width: 100,
                    padding: '8px 12px',
                    fontSize: '0.94rem',
                    fontWeight: 700,
                    borderRadius: 10,
                  }}
                />
                <span className="font-mono" style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  videos / day
                </span>
              </div>

              <span
                className="badge-pill"
                style={{
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  fontSize: '0.74rem',
                  padding: '3px 10px',
                  fontWeight: 700,
                }}
              >
                {dailyLimitConfig.enableDailyLimit
                  ? `Cap: ${dailyLimitConfig.maxDailyVideos} videos every 24 hours`
                  : 'Unlimited viewing allowed'}
              </span>
            </div>

            {/* Quick Presets */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>Quick Presets:</span>
              {[10, 25, 50, 100, 200, 500].map((preset) => {
                const isSelected = dailyLimitConfig.maxDailyVideos === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() =>
                      setDailyLimitConfig((prev) => ({
                        ...prev,
                        maxDailyVideos: preset,
                      }))
                    }
                    className="btn"
                    style={{
                      padding: '5px 12px',
                      borderRadius: 8,
                      fontSize: '0.78rem',
                      fontWeight: isSelected ? 700 : 500,
                      background: isSelected ? 'var(--primary-neon)' : '#f8fafc',
                      color: isSelected ? '#ffffff' : '#475569',
                      border: isSelected ? 'none' : '1px solid #e2e8f0',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {preset} videos
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          Card 5: Hourly Video Watch Limit (Anti-Bot Pacing per Hour)
          ========================================================================= */}
      <div
        className="glass-card"
        style={{
          padding: '24px 28px',
          borderRadius: 20,
          border: '1.5px solid rgba(14, 165, 233, 0.28)',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(14, 165, 233, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(14, 165, 233, 0.25)',
              }}
            >
              <Timer size={22} color="var(--primary-neon)" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h2 className="font-display" style={{ fontSize: '1.25rem', color: '#0f172a', margin: 0 }}>
                  Hourly Video Watch Limit per Viewer
                </h2>
                <span
                  className="badge-pill"
                  style={{
                    background: hourlyLimitConfig.enableHourlyLimit ? '#f0fdf4' : '#f8fafc',
                    color: hourlyLimitConfig.enableHourlyLimit ? '#059669' : '#64748b',
                    border: `1px solid ${hourlyLimitConfig.enableHourlyLimit ? 'rgba(16, 185, 129, 0.3)' : '#cbd5e1'}`,
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    fontWeight: 800,
                  }}
                >
                  {hourlyLimitConfig.enableHourlyLimit
                    ? `ACTIVE (${hourlyLimitConfig.maxHourlyVideos} VIDEOS/HOUR)`
                    : 'DISABLED (UNLIMITED)'}
                </span>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.84rem', margin: '3px 0 0' }}>
                Configure the maximum number of videos a viewer can watch in any 1-hour window (prevents bot scripts and enforces natural pacing).
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={hourlyLimitSaving}
            onClick={handleSaveHourlyLimit}
            className="btn btn-neon glow-neon"
            style={{
              padding: '9px 18px',
              fontSize: '0.86rem',
              fontWeight: 700,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 7,
            }}
          >
            <Save size={15} />
            {hourlyLimitSaving ? 'Saving...' : 'Save Hourly Limit Rule'}
          </button>
        </div>

        {/* Toggle & Limit Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Status Switcher */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 18px',
              background: '#f8fafc',
              borderRadius: 14,
              border: '1px solid #e2e8f0',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div>
              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>
                Hourly Rate-Limit Protection Status
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                When enabled, viewers cannot complete more than the specified video tasks within a 60-minute window.
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6 }}>
              <button
                type="button"
                onClick={() => setHourlyLimitConfig((prev) => ({ ...prev, enableHourlyLimit: true }))}
                className="btn"
                style={{
                  padding: '7px 16px',
                  fontSize: '0.82rem',
                  borderRadius: 8,
                  fontWeight: 700,
                  background: hourlyLimitConfig.enableHourlyLimit ? '#059669' : '#ffffff',
                  color: hourlyLimitConfig.enableHourlyLimit ? '#ffffff' : '#64748b',
                  border: hourlyLimitConfig.enableHourlyLimit ? 'none' : '1px solid #cbd5e1',
                }}
              >
                Enable Hourly Limit
              </button>
              <button
                type="button"
                onClick={() => setHourlyLimitConfig((prev) => ({ ...prev, enableHourlyLimit: false }))}
                className="btn"
                style={{
                  padding: '7px 16px',
                  fontSize: '0.82rem',
                  borderRadius: 8,
                  fontWeight: 700,
                  background: !hourlyLimitConfig.enableHourlyLimit ? '#64748b' : '#ffffff',
                  color: !hourlyLimitConfig.enableHourlyLimit ? '#ffffff' : '#64748b',
                  border: !hourlyLimitConfig.enableHourlyLimit ? 'none' : '1px solid #cbd5e1',
                }}
              >
                Unlimited (Disabled)
              </button>
            </div>
          </div>

          {/* Limit Input & Presets */}
          <div
            style={{
              padding: '16px 18px',
              background: '#ffffff',
              borderRadius: 14,
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="font-mono" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                  MAX VIDEOS PER HOUR (PER VIEWER):
                </span>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={hourlyLimitConfig.maxHourlyVideos}
                  onChange={(e) =>
                    setHourlyLimitConfig((prev) => ({
                      ...prev,
                      maxHourlyVideos: Math.max(1, parseInt(e.target.value, 10) || 1),
                    }))
                  }
                  className="input-field"
                  style={{
                    width: 100,
                    padding: '8px 12px',
                    fontSize: '0.94rem',
                    fontWeight: 700,
                    borderRadius: 10,
                  }}
                />
                <span className="font-mono" style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  videos / hour
                </span>
              </div>

              <span
                className="badge-pill"
                style={{
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  fontSize: '0.74rem',
                  padding: '3px 10px',
                  fontWeight: 700,
                }}
              >
                {hourlyLimitConfig.enableHourlyLimit
                  ? `Cap: ${hourlyLimitConfig.maxHourlyVideos} videos per 60 minutes`
                  : 'Unlimited viewing allowed'}
              </span>
            </div>

            {/* Quick Presets */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>Quick Presets:</span>
              {[5, 10, 15, 20, 30, 50].map((preset) => {
                const isSelected = hourlyLimitConfig.maxHourlyVideos === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() =>
                      setHourlyLimitConfig((prev) => ({
                        ...prev,
                        maxHourlyVideos: preset,
                      }))
                    }
                    className="btn"
                    style={{
                      padding: '5px 12px',
                      borderRadius: 8,
                      fontSize: '0.78rem',
                      fontWeight: isSelected ? 700 : 500,
                      background: isSelected ? 'var(--primary-neon)' : '#f8fafc',
                      color: isSelected ? '#ffffff' : '#475569',
                      border: isSelected ? 'none' : '1px solid #e2e8f0',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {preset} videos
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
