import React from 'react';
import { Check, AlertCircle, Lock, RefreshCw, ArrowDownLeft } from 'lucide-react';
import { CreatorTab, PayoutMethodConfig } from './campaignerTypes';

interface CampaignerWithdrawTabProps {
  creatorBal: number;
  usdToBdt: number;
  payoutMethods: PayoutMethodConfig[];
  withdrawMethod: string;
  setWithdrawMethod: (val: string) => void;
  selectedWithdrawConfig: PayoutMethodConfig;
  selectedMinWithdraw: number;
  withdrawAmount: string | number;
  setWithdrawAmount: (val: string | number) => void;
  isWithdrawBelowMin: boolean;
  isWithdrawExceedsBal: boolean;
  hasWithdrawInput: boolean;
  numWithdrawAmount: number;
  isWithdrawLinked: boolean;
  linkedPaymentMethod: any;
  withdrawLoading: boolean;
  handleWithdraw: (e: React.FormEvent) => void;
  setActiveTab: (tab: CreatorTab) => void;
  clearFeedback: () => void;
}

export const CampaignerWithdrawTab: React.FC<CampaignerWithdrawTabProps> = ({
  creatorBal,
  usdToBdt,
  payoutMethods,
  withdrawMethod,
  setWithdrawMethod,
  selectedWithdrawConfig,
  selectedMinWithdraw,
  withdrawAmount,
  setWithdrawAmount,
  isWithdrawBelowMin,
  isWithdrawExceedsBal,
  hasWithdrawInput,
  numWithdrawAmount,
  isWithdrawLinked,
  linkedPaymentMethod,
  withdrawLoading,
  handleWithdraw,
  setActiveTab,
  clearFeedback,
}) => {
  return (
    <div className="glass-card" style={{ padding: '24px', borderRadius: 18, border: '1.5px solid var(--primary-neon)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h3 className="font-display" style={{ fontSize: '1.45rem', color: '#0f172a', margin: 0 }}>
            WITHDRAW AD BUDGET
          </h3>
          <span style={{ fontSize: '0.88rem', color: '#64748b' }}>
            Available Budget: <strong className="font-mono" style={{ color: 'var(--primary-neon)' }}>${creatorBal.toFixed(2)} USD</strong> (≈ ৳{Math.round(creatorBal * usdToBdt)} BDT)
          </span>
        </div>
        <span className="badge-pill badge-cyan" style={{ fontSize: '0.74rem', padding: '4px 12px' }}>
          Flexible Cashout • Up to ${creatorBal.toFixed(2)} USD
        </span>
      </div>

      {/* INDIVIDUAL METHOD CARDS - LOGO + NAME + MIN WITHDRAW AMOUNT ON CARD */}
      <div style={{ marginBottom: 18 }}>
        <label
          className="font-mono"
          style={{ fontSize: '0.84rem', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: 10, fontWeight: 700 }}
        >
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
                Max: ${creatorBal.toFixed(2)}
              </span>
            </div>

            <input
              type="number"
              step="any"
              min="0.01"
              placeholder="Enter amount (USD)"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="input-field"
              style={{
                padding: '11px 14px',
                fontSize: '0.98rem',
                borderColor: isWithdrawExceedsBal ? '#ef4444' : undefined,
                color: isWithdrawExceedsBal ? '#dc2626' : undefined,
                background: isWithdrawExceedsBal ? '#fff1f2' : undefined,
              }}
              required
            />

            {/* Warning Messages */}
            {isWithdrawExceedsBal && (
              <div style={{ color: '#ef4444', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5, marginTop: 6 }}>
                <AlertCircle size={14} color="#ef4444" style={{ flexShrink: 0 }} />
                <span>Amount exceeds available Ad Budget (${creatorBal.toFixed(2)} USD).</span>
              </div>
            )}

            {/* Quick Amount Pills */}
            <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              {[1, 2, 5, 10, 25, 50, 100].map((preset) => (
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
                onClick={() => setWithdrawAmount(parseFloat(creatorBal.toFixed(2)))}
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
              <label
                className="font-mono"
                style={{ fontSize: '0.84rem', color: '#475569', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                title={selectedWithdrawConfig?.inputLabel}
              >
                {selectedWithdrawConfig?.inputLabel}:
              </label>
              {isWithdrawLinked ? (
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
                placeholder={isWithdrawLinked ? selectedWithdrawConfig?.placeholder : `No linked ${selectedWithdrawConfig?.name} account found in profile`}
                value={isWithdrawLinked ? linkedPaymentMethod?.accountNumber : ''}
                readOnly={true}
                disabled={!isWithdrawLinked}
                className="input-field"
                style={{
                  padding: isWithdrawLinked ? '11px 38px 11px 14px' : '11px 14px',
                  fontSize: '0.98rem',
                  background: '#f8fafc',
                  borderColor: isWithdrawLinked ? '#cbd5e1' : '#fde68a',
                  cursor: 'not-allowed',
                  color: isWithdrawLinked ? '#0f172a' : '#94a3b8',
                  fontWeight: isWithdrawLinked ? 600 : 400,
                }}
                required={isWithdrawLinked}
              />
              {isWithdrawLinked && (
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

            {isWithdrawLinked ? (
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
              <span style={{ fontSize: '0.78rem', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 5, flexWrap: 'wrap', gap: 6 }}>
                <span>⚠️ You must link and save your {selectedWithdrawConfig?.name} number in Profile before withdrawing.</span>
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
                  Go to Profile Settings →
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Conversion Summary & Payout Instruction Box */}
        <div
          style={{
            background: '#f0f9ff',
            border: '1px solid rgba(14, 165, 233, 0.25)',
            borderRadius: 12,
            padding: '12px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>
              Payout Exchange Rate: <strong style={{ color: '#0f172a' }}>{selectedWithdrawConfig?.rateText}</strong>
            </span>
            {selectedWithdrawConfig?.isBDT && hasWithdrawInput && numWithdrawAmount > 0 && (
              <span className="font-mono" style={{ fontSize: '0.92rem', color: 'var(--primary-neon)', fontWeight: 800 }}>
                Estimated Payout: ≈ ৳{Math.round(numWithdrawAmount * usdToBdt).toLocaleString()} BDT
              </span>
            )}
          </div>
          {selectedWithdrawConfig?.instructions && (
            <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
              ℹ️ {selectedWithdrawConfig.instructions}
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={
            withdrawLoading ||
            !isWithdrawLinked ||
            !hasWithdrawInput ||
            numWithdrawAmount <= 0 ||
            isWithdrawExceedsBal
          }
          className="btn btn-neon glow-neon"
          style={{
            width: '100%',
            padding: '13px',
            fontSize: '0.94rem',
            fontWeight: 700,
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            opacity: (withdrawLoading || !isWithdrawLinked || !hasWithdrawInput || numWithdrawAmount <= 0 || isWithdrawExceedsBal) ? 0.6 : 1,
            cursor: (withdrawLoading || !isWithdrawLinked || !hasWithdrawInput || numWithdrawAmount <= 0 || isWithdrawExceedsBal) ? 'not-allowed' : 'pointer',
          }}
        >
          {withdrawLoading ? (
            <>
              <RefreshCw size={16} className="spin-fast" /> Processing Withdrawal...
            </>
          ) : (
            <>
              <ArrowDownLeft size={16} /> Request Withdrawal ({hasWithdrawInput && numWithdrawAmount > 0 ? `$${numWithdrawAmount.toFixed(2)} USD` : 'Enter Amount'})
            </>
          )}
        </button>
      </form>
    </div>
  );
};
