import React from 'react';
import { Check, AlertCircle, Lock } from 'lucide-react';
import { PayoutMethodConfig, PayoutMethodType, ViewerTab } from './viewerTypes';

interface ViewerWithdrawTabProps {
  viewerBal: number;
  approxBDT: string;
  bdtRate: number;
  payoutMethods: PayoutMethodConfig[];
  withdrawMethod: PayoutMethodType;
  setWithdrawMethod: (val: PayoutMethodType) => void;
  selectedConfig: PayoutMethodConfig;
  selectedMinWithdraw: number;
  withdrawAmount: string | number;
  setWithdrawAmount: (val: string | number) => void;
  accountDetails: string;
  isLinked: boolean;
  linkedPaymentMethod: any;
  isWithdrawBelowMin: boolean;
  isWithdrawExceedsBal: boolean;
  isWithdrawValid: boolean;
  hasWithdrawInput: boolean;
  numWithdrawAmount: number;
  loading: boolean;
  handleWithdraw: (e: React.FormEvent) => void;
  setActiveTab: (tab: ViewerTab) => void;
  clearMsg: () => void;
}

export const ViewerWithdrawTab: React.FC<ViewerWithdrawTabProps> = ({
  viewerBal,
  approxBDT,
  bdtRate,
  payoutMethods,
  withdrawMethod,
  setWithdrawMethod,
  selectedConfig,
  selectedMinWithdraw,
  withdrawAmount,
  setWithdrawAmount,
  accountDetails,
  isLinked,
  linkedPaymentMethod,
  isWithdrawBelowMin,
  isWithdrawExceedsBal,
  isWithdrawValid,
  hasWithdrawInput,
  numWithdrawAmount,
  loading,
  handleWithdraw,
  setActiveTab,
  clearMsg,
}) => {
  return (
    <div className="glass-card" style={{ padding: '24px', borderRadius: 18, border: '1.5px solid var(--primary-neon)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h3 className="font-display" style={{ fontSize: '1.45rem', color: '#0f172a', margin: 0 }}>
            WITHDRAW FUNDS
          </h3>
          <span style={{ fontSize: '0.88rem', color: '#64748b' }}>
            Available: <strong className="font-mono" style={{ color: 'var(--primary-neon)' }}>${viewerBal.toFixed(4)} USD</strong> (≈ ৳{approxBDT} BDT)
          </span>
        </div>
        <span className="badge-pill badge-cyan" style={{ fontSize: '0.74rem', padding: '4px 12px' }}>
          Min Payout: ${selectedMinWithdraw.toFixed(2)} USD {selectedConfig.isBDT ? `(≈ ৳${Math.round(selectedMinWithdraw * bdtRate)} BDT)` : ''}
        </span>
      </div>

      {/* INDIVIDUAL METHOD CARDS - LOGO + NAME + MIN WITHDRAW AMOUNT ON CARD */}
      <div style={{ marginBottom: 18 }}>
        <label className="font-mono" style={{ fontSize: '0.84rem', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: 10, fontWeight: 700 }}>
          Select Withdrawal Method:
        </label>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 125px), 1fr))', gap: 12 }}>
          {payoutMethods.map((m) => {
            const isSelected = withdrawMethod === m.id;
            return (
              <div
                key={m.id}
                onClick={() => {
                  setWithdrawMethod(m.id);
                  clearMsg();
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
                  {/* Official Brand Logo */}
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
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        display: 'block',
                      }}
                    />
                  </div>

                  {/* Brand Name */}
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
                    marginTop: 4,
                  }}
                >
                  {m.minLimitText}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* WITHDRAWAL FORM */}
      <form onSubmit={handleWithdraw} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: 14, alignItems: 'start' }}>
          {/* Amount Input */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: 24, marginBottom: 6 }}>
              <label className="font-mono" style={{ fontSize: '0.84rem', color: '#475569', fontWeight: 700 }}>
                Amount (USD):
              </label>
              <span className="font-mono" style={{ fontSize: '0.82rem', color: 'var(--primary-neon)', fontWeight: 700 }}>
                Max: ${viewerBal.toFixed(4)}
              </span>
            </div>

            <input
              type="number"
              step="any"
              placeholder={`Enter amount (min $${selectedMinWithdraw.toFixed(2)})`}
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="input-field"
              style={{
                padding: '11px 14px',
                fontSize: '0.98rem',
                borderColor: (isWithdrawBelowMin || isWithdrawExceedsBal) ? '#ef4444' : undefined,
                color: (isWithdrawBelowMin || isWithdrawExceedsBal) ? '#dc2626' : undefined,
                background: (isWithdrawBelowMin || isWithdrawExceedsBal) ? '#fff1f2' : undefined,
              }}
              required
            />

            {/* Warning Messages */}
            {isWithdrawBelowMin && (
              <div style={{ color: '#ef4444', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5, marginTop: 6 }}>
                <AlertCircle size={14} color="#ef4444" style={{ flexShrink: 0 }} />
                <span>Minimum cashout for {selectedConfig.name} is ${selectedMinWithdraw.toFixed(2)} USD{selectedConfig.isBDT ? ` (≈ ৳${Math.round(selectedMinWithdraw * bdtRate)} BDT)` : ''}.</span>
              </div>
            )}
            {!isWithdrawBelowMin && isWithdrawExceedsBal && (
              <div style={{ color: '#ef4444', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5, marginTop: 6 }}>
                <AlertCircle size={14} color="#ef4444" style={{ flexShrink: 0 }} />
                <span>Amount exceeds available balance (${viewerBal.toFixed(4)} USD).</span>
              </div>
            )}

            {/* Quick Amount Pills ($5 Minimum) */}
            <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              {[5, 10, 25, 50, 100].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setWithdrawAmount(preset)}
                  className="btn btn-ghost"
                  style={{
                    padding: '5px 12px',
                    fontSize: '0.84rem',
                    borderRadius: 8,
                    background: hasWithdrawInput && numWithdrawAmount === preset ? '#e0f2fe' : '#ffffff',
                    color: hasWithdrawInput && numWithdrawAmount === preset ? 'var(--primary-neon)' : '#64748b',
                    borderColor: hasWithdrawInput && numWithdrawAmount === preset ? 'var(--primary-neon)' : undefined,
                    fontWeight: hasWithdrawInput && numWithdrawAmount === preset ? 700 : 500,
                  }}
                >
                  ${preset}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setWithdrawAmount(parseFloat(viewerBal.toFixed(4)))}
                className="btn btn-ghost"
                style={{
                  padding: '5px 12px',
                  fontSize: '0.84rem',
                  borderRadius: 8,
                  color: '#059669',
                  fontWeight: 700,
                }}
              >
                ALL
              </button>
            </div>
          </div>

          {/* Account Details */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: 24, marginBottom: 6, gap: 6 }}>
              <label className="font-mono" style={{ fontSize: '0.84rem', color: '#475569', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={selectedConfig.inputLabel}>
                {selectedConfig.inputLabel}:
              </label>
              {isLinked ? (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#059669',
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    padding: '2px 8px',
                    borderRadius: 6,
                    flexShrink: 0,
                  }}
                >
                  <Lock size={11} /> Linked & Locked
                </span>
              ) : (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#b45309',
                    background: '#fef3c7',
                    border: '1px solid #fde68a',
                    padding: '2px 8px',
                    borderRadius: 6,
                    flexShrink: 0,
                  }}
                >
                  <AlertCircle size={11} /> Not Linked
                </span>
              )}
            </div>

            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder={isLinked ? selectedConfig.placeholder : `No linked ${selectedConfig.name} account found in profile`}
                value={isLinked ? (linkedPaymentMethod?.accountNumber || accountDetails) : ''}
                readOnly={true}
                disabled={!isLinked}
                className="input-field"
                style={{
                  padding: isLinked ? '11px 38px 11px 14px' : '11px 14px',
                  fontSize: '0.98rem',
                  background: '#f8fafc',
                  borderColor: isLinked ? '#cbd5e1' : '#fde68a',
                  cursor: 'not-allowed',
                  color: isLinked ? '#0f172a' : '#94a3b8',
                  fontWeight: isLinked ? 600 : 400,
                }}
                required={isLinked}
              />
              {isLinked && (
                <div
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="This payment method is bound to your account profile."
                >
                  <Lock size={15} />
                </div>
              )}
            </div>

            {isLinked ? (
              <span style={{ fontSize: '0.78rem', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 5, flexWrap: 'wrap', gap: 6 }}>
                <span>✓ Pre-filled from your linked account.</span>
                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary-neon)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: 0,
                  }}
                >
                  Edit in Profile Settings
                </button>
              </span>
            ) : (
              <div
                style={{
                  marginTop: 8,
                  padding: '10px 14px',
                  background: '#fffbeb',
                  border: '1px solid #fde68a',
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: '#92400e', fontWeight: 600 }}>
                  <AlertCircle size={16} color="#d97706" style={{ flexShrink: 0 }} />
                  <span>You must link your verified {selectedConfig.name} account in Profile Settings before withdrawing.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className="btn btn-ghost"
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    background: '#fef3c7',
                    borderColor: '#f59e0b',
                    color: '#b45309',
                  }}
                >
                  Set Up in Profile Settings →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Real-Time Conversion Box (Mobile Friendly Wrapping) */}
        <div
          style={{
            background: '#f0f9ff',
            padding: '16px 20px',
            borderRadius: 14,
            border: '1px solid rgba(14, 165, 233, 0.25)',
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
                src={selectedConfig.logoUrl}
                alt={selectedConfig.name}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            <div>
              <span style={{ fontSize: '0.94rem', color: '#334155' }}>
                Payout Method: <strong>{selectedConfig.name}</strong>
              </span>
              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                {selectedConfig.rateText}
              </div>
            </div>
          </div>

          <div style={{ minWidth: 140 }}>
            <span style={{ fontSize: '0.82rem', color: '#64748b', display: 'block' }}>You Receive:</span>
            <strong className="font-mono" style={{ fontSize: '1.5rem', color: (isWithdrawBelowMin || isWithdrawExceedsBal) ? '#ef4444' : '#059669' }}>
              {hasWithdrawInput && numWithdrawAmount > 0
                ? (selectedConfig.isBDT
                  ? `৳${(numWithdrawAmount * bdtRate).toFixed(0)} BDT`
                  : `$${numWithdrawAmount.toFixed(2)} USD`)
                : (selectedConfig.isBDT ? '৳0 BDT' : '$0.00 USD')}
            </strong>
          </div>
        </div>

        {isLinked ? (
          <button
            type="submit"
            disabled={loading || viewerBal < 5.0 || !isWithdrawValid}
            className="btn btn-neon glow-neon"
            style={{
              padding: '13px',
              fontSize: '0.96rem',
              borderRadius: 12,
              marginTop: 4,
              opacity: (!isWithdrawValid || viewerBal < 5.0) ? 0.6 : 1,
              cursor: (!isWithdrawValid || viewerBal < 5.0) ? 'not-allowed' : 'pointer',
            }}
          >
            {loading
              ? 'Submitting Request...'
              : !hasWithdrawInput
                ? 'Enter Amount to Cashout'
                : isWithdrawBelowMin
                  ? 'Minimum Cashout is $5.00 USD'
                  : isWithdrawExceedsBal
                    ? 'Insufficient Balance'
                    : `Withdraw $${numWithdrawAmount.toFixed(2)} USD via ${selectedConfig.name}`}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className="btn btn-ghost"
            style={{
              padding: '13px',
              fontSize: '0.96rem',
              borderRadius: 12,
              marginTop: 4,
              borderColor: '#f59e0b',
              background: '#fef3c7',
              color: '#b45309',
              fontWeight: 700,
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <AlertCircle size={18} /> Link {selectedConfig.name} in Profile Settings to Withdraw
          </button>
        )}
      </form>
    </div>
  );
};
