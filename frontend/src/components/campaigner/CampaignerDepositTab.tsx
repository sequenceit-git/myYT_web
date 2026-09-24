import React from 'react';
import { Check, AlertCircle, ArrowRight } from 'lucide-react';
import { DepositMethodConfig } from './campaignerTypes';

interface CampaignerDepositTabProps {
  creatorBal: number;
  depositAmount: string | number;
  setDepositAmount: (val: string | number) => void;
  depositGateway: string;
  setDepositGateway: (gw: string) => void;
  depositMethods: DepositMethodConfig[];
  selectedMethod: DepositMethodConfig;
  minRequiredUsd: number;
  numDepositAmount: number;
  hasDepositInput: boolean;
  isDepositBelowMin: boolean;
  bdtRate: number;
  handleOpenDepositModal: (e: React.FormEvent) => void;
  clearFeedback: () => void;
}

export const CampaignerDepositTab: React.FC<CampaignerDepositTabProps> = ({
  creatorBal,
  depositAmount,
  setDepositAmount,
  depositGateway,
  setDepositGateway,
  depositMethods,
  selectedMethod,
  minRequiredUsd,
  numDepositAmount,
  hasDepositInput,
  isDepositBelowMin,
  bdtRate,
  handleOpenDepositModal,
  clearFeedback,
}) => {
  return (
    <div className="glass-card" style={{ padding: '24px', borderRadius: 18, border: '1.5px solid var(--primary-neon)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h3 className="font-display" style={{ fontSize: '1.45rem', color: '#0f172a', margin: 0 }}>
            DEPOSIT AD BUDGET
          </h3>
          <span style={{ fontSize: '0.88rem', color: '#64748b' }}>
            Current Balance: <strong className="font-mono" style={{ color: 'var(--primary-neon)' }}>${creatorBal.toFixed(2)} USD</strong>
          </span>
        </div>
        {selectedMethod?.id === 'crypto' ? (
          <span className="badge-pill" style={{ fontSize: '0.74rem', padding: '4px 12px', background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', fontWeight: 800 }}>
            ⚡ Automatic Deposit • FaucetPay Instant Credit
          </span>
        ) : selectedMethod?.id === 'faucetpay' ? (
          <span className="badge-pill" style={{ fontSize: '0.74rem', padding: '4px 12px', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', fontWeight: 800 }}>
            Manual Deposit • FaucetPay Transfer
          </span>
        ) : (
          <span className="badge-pill badge-neon" style={{ fontSize: '0.74rem', padding: '4px 12px' }}>
            Manual Deposit • Admin Approved
          </span>
        )}
      </div>

      {(!depositMethods || depositMethods.length === 0 || !selectedMethod) ? (
        <div style={{ padding: '36px 20px', textAlign: 'center', background: '#f8fafc', borderRadius: 14, border: '1px dashed #cbd5e1', margin: '20px 0' }}>
          <AlertCircle size={28} color="#64748b" style={{ margin: '0 auto 10px', display: 'block' }} />
          <h4 style={{ margin: '0 0 6px', color: '#1e293b', fontSize: '1.05rem', fontWeight: 700 }}>Deposits Temporarily Paused</h4>
          <p style={{ margin: 0, fontSize: '0.86rem', color: '#64748b' }}>
            Deposit payment options are currently turned off by the platform administrator. Please check back shortly.
          </p>
        </div>
      ) : (
        <>
          {/* INDIVIDUAL DEPOSIT METHOD CARDS */}
          <div style={{ marginBottom: 20 }}>
        <label
          className="font-mono"
          style={{ fontSize: '0.82rem', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: 10, fontWeight: 700 }}
        >
          1. Select Payment Method:
        </label>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 125px), 1fr))', gap: 12 }}>
          {depositMethods.map((m) => {
            const isSelected = depositGateway === m.id;
            return (
              <div
                key={m.id}
                onClick={() => {
                  setDepositGateway(m.id);
                  clearFeedback();
                }}
                style={{
                  background: isSelected ? '#f0f9ff' : '#ffffff',
                  border: isSelected ? '2px solid var(--primary-neon)' : '1px solid #e2e8f0',
                  borderRadius: 14,
                  padding: '14px 10px 12px',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  minHeight: 142,
                  position: 'relative',
                  boxShadow: isSelected ? '0 4px 14px rgba(14, 165, 233, 0.2)' : '0 1px 3px rgba(0,0,0,0.02)',
                }}
              >
                {/* Checkmark Indicator */}
                {isSelected && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 6,
                      right: 6,
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      background: 'var(--primary-neon)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Check size={11} color="#ffffff" strokeWidth={3} />
                  </div>
                )}

                {/* Top Section: Logo & Name */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: '100%' }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: '#ffffff',
                      border: isSelected ? '1.5px solid var(--primary-neon)' : '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 6,
                      boxShadow: isSelected ? '0 4px 14px rgba(14, 165, 233, 0.22)' : '0 2px 6px rgba(0,0,0,0.04)',
                      transition: 'all 0.18s ease',
                    }}
                  >
                    <img
                      src={m.logoUrl}
                      alt={m.name}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/payment-methods/crypto.png';
                      }}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        display: 'block',
                      }}
                    />
                  </div>

                  <span
                    style={{
                      fontSize: '0.88rem',
                      fontWeight: 800,
                      color: '#0f172a',
                      textAlign: 'center',
                      lineHeight: 1.2,
                      minHeight: 22,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {m.name}
                  </span>
                </div>

                {/* Min Limit Badge on Card */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, marginTop: 4 }}>
                  {m.id === 'crypto' && (
                    <span
                      style={{
                        fontSize: '0.60rem',
                        fontWeight: 800,
                        color: '#059669',
                        background: '#dcfce7',
                        border: '1px solid #86efac',
                        padding: '1px 5px',
                        borderRadius: 4,
                        letterSpacing: '0.3px',
                      }}
                    >
                      ⚡ AUTO
                    </span>
                  )}
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: isSelected ? 'var(--primary-neon)' : '#64748b',
                      background: isSelected ? '#e0f2fe' : '#f1f5f9',
                      border: isSelected ? '1px solid rgba(14, 165, 233, 0.3)' : '1px solid #e2e8f0',
                      padding: '2px 8px',
                      borderRadius: 6,
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {m.minLimitText}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 2: ENTER AMOUNT & SUBMIT TO POPUP */}
      <form onSubmit={handleOpenDepositModal} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label className="font-mono" style={{ fontSize: '0.84rem', color: '#475569', display: 'block', marginBottom: 8, fontWeight: 600 }}>
            2. Select or Enter Amount (USD):
          </label>

          {/* Preset Amount Pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
            {[5, 10, 25, 50, 100, 250].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setDepositAmount(preset)}
                className="btn btn-ghost"
                style={{
                  padding: '7px 16px',
                  fontSize: '0.88rem',
                  borderRadius: 8,
                  background: hasDepositInput && numDepositAmount === preset ? '#e0f2fe' : '#ffffff',
                  color: hasDepositInput && numDepositAmount === preset ? 'var(--primary-neon)' : '#64748b',
                  borderColor: hasDepositInput && numDepositAmount === preset ? 'var(--primary-neon)' : 'rgba(14, 165, 233, 0.25)',
                  fontWeight: hasDepositInput && numDepositAmount === preset ? 800 : 500,
                }}
              >
                ${preset}
              </button>
            ))}
          </div>

          <input
            type="number"
            step="any"
            min="0.01"
            placeholder={minRequiredUsd > 0 ? `Enter amount in USD (min $${minRequiredUsd.toFixed(2)})` : 'Enter amount in USD'}
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            className="input-field"
            style={{
              padding: '13px 16px',
              fontSize: '1.05rem',
              borderColor: isDepositBelowMin ? '#ef4444' : undefined,
              color: isDepositBelowMin ? '#dc2626' : undefined,
              background: isDepositBelowMin ? '#fff1f2' : undefined,
            }}
            required
          />

          {isDepositBelowMin && (
            <div style={{ color: '#ef4444', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5, marginTop: 6 }}>
              <AlertCircle size={14} color="#ef4444" style={{ flexShrink: 0 }} />
              <span>Minimum deposit amount is ${minRequiredUsd.toFixed(2)} USD for {selectedMethod.name}.</span>
            </div>
          )}
        </div>

        {/* Real-Time Conversion & Method Summary */}
        <div
          style={{
            background: '#f8fafc',
            padding: '14px 18px',
            borderRadius: 12,
            border: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 14,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 6,
                flexShrink: 0,
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              }}
            >
              <img
                src={selectedMethod.logoUrl}
                alt={selectedMethod.name}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/payment-methods/crypto.png';
                }}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            <div>
              <span style={{ fontSize: '0.94rem', color: '#334155', fontWeight: 600 }}>
                Deposit Gateway: <strong>{selectedMethod.name}</strong>
              </span>
              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                {selectedMethod.rateText}
              </div>
            </div>
          </div>

          <div style={{ minWidth: 140 }}>
            <span style={{ fontSize: '0.74rem', color: '#64748b', display: 'block' }}>Total Deposit Amount:</span>
            <strong className="font-mono" style={{ fontSize: '1.35rem', color: isDepositBelowMin ? '#ef4444' : 'var(--primary-neon)' }}>
              {hasDepositInput && numDepositAmount > 0
                ? (selectedMethod.isBDT
                  ? `৳${Math.round(numDepositAmount * bdtRate).toLocaleString()} BDT`
                  : `$${numDepositAmount.toFixed(2)} USD`)
                : (selectedMethod.isBDT ? '৳0 BDT' : '$0.00 USD')}
            </strong>
            {selectedMethod.isBDT && hasDepositInput && numDepositAmount > 0 && (
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginTop: 2 }}>
                (${numDepositAmount.toFixed(2)} USD)
              </span>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={!hasDepositInput || numDepositAmount <= 0 || isDepositBelowMin}
          className="btn btn-neon glow-neon"
          style={{
            padding: '13px 20px',
            fontSize: '1rem',
            borderRadius: 12,
            marginTop: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            fontWeight: 700,
            opacity: (!hasDepositInput || numDepositAmount <= 0 || isDepositBelowMin) ? 0.6 : 1,
            cursor: (!hasDepositInput || numDepositAmount <= 0 || isDepositBelowMin) ? 'not-allowed' : 'pointer',
          }}
        >
          <span>
            {!hasDepositInput || numDepositAmount <= 0
              ? (minRequiredUsd > 0 ? `Enter Deposit Amount (Min $${minRequiredUsd.toFixed(2)})` : 'Enter Deposit Amount')
              : isDepositBelowMin
                ? `Minimum Deposit is $${minRequiredUsd.toFixed(2)} USD`
                : selectedMethod.id === 'crypto'
                  ? `Proceed to Instant Crypto Checkout ($${numDepositAmount.toFixed(2)} USD)`
                  : selectedMethod.id === 'faucetpay'
                    ? `Proceed to FaucetPay Manual Deposit ($${numDepositAmount.toFixed(2)} USD)`
                    : `Proceed to Payment (${selectedMethod.isBDT ? `৳${Math.round(numDepositAmount * bdtRate).toLocaleString()} BDT` : `$${numDepositAmount.toFixed(2)} USD`})`}
          </span>
          <ArrowRight size={18} />
        </button>
      </form>
      </>
      )}
    </div>
  );
};
