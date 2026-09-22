import React, { useState } from 'react';
import { X, Check, Copy, AlertCircle, Zap, ExternalLink, ShieldCheck, ArrowRight, RefreshCw } from 'lucide-react';
import { DepositMethodConfig } from './campaignerTypes';
import { apiRequest } from '../../api';

interface CampaignerDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMethod: DepositMethodConfig;
  numDepositAmount: number;
  bdtRate: number;
  senderAccount: string;
  setSenderAccount: (val: string) => void;
  transactionHash: string;
  setTransactionHash: (val: string) => void;
  depositNotes: string;
  setDepositNotes: (val: string) => void;
  copiedReceiver: boolean;
  setCopiedReceiver: (val: boolean) => void;
  depositLoading: boolean;
  depositModalError: string | null;
  handleDepositSubmit: (e: React.FormEvent) => void;
  onRefreshUser?: () => void;
  onSuccessNotice?: (msg: string) => void;
}

export const CampaignerDepositModal: React.FC<CampaignerDepositModalProps> = ({
  isOpen,
  onClose,
  selectedMethod,
  numDepositAmount,
  bdtRate,
  senderAccount,
  setSenderAccount,
  transactionHash,
  setTransactionHash,
  depositNotes,
  setDepositNotes,
  copiedReceiver,
  setCopiedReceiver,
  depositLoading,
  depositModalError,
  handleDepositSubmit,
  onRefreshUser,
  onSuccessNotice,
}) => {
  const [faucetPayLoading, setFaucetPayLoading] = useState<boolean>(false);
  const [faucetPayOrder, setFaucetPayOrder] = useState<any>(null);
  const [checkingStatus, setCheckingStatus] = useState<boolean>(false);
  const [showManualFallback, setShowManualFallback] = useState<boolean>(false);

  if (!isOpen) return null;

  const isCryptoMethod = selectedMethod.id === 'crypto';

  const handleFaucetPayCheckout = async () => {
    setFaucetPayLoading(true);
    try {
      const res = await apiRequest<{
        transactionId: string;
        formParams: Record<string, any>;
        isConfigured: boolean;
      }>('/wallet/faucetpay-create-order', {
        method: 'POST',
        body: JSON.stringify({ amount: numDepositAmount }),
      });

      if (res.success && res.data) {
        setFaucetPayOrder(res.data);

        // Dynamically create and submit POST form to FaucetPay Merchant Checkout
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = res.data.formParams.action || 'https://faucetpay.io/merchant/webscr';
        form.target = '_blank';

        Object.entries(res.data.formParams).forEach(([key, val]) => {
          if (key !== 'action') {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = String(val);
            form.appendChild(input);
          }
        });

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
      } else {
        alert(res.error || 'Failed to initiate FaucetPay crypto checkout.');
      }
    } catch (err: any) {
      alert(err.message || 'Error communicating with server.');
    } finally {
      setFaucetPayLoading(false);
    }
  };

  const handleCheckCryptoPaymentStatus = async () => {
    if (!faucetPayOrder?.transactionId) return;
    setCheckingStatus(true);
    try {
      const res = await apiRequest<{
        status: string;
        amount: number;
        isCompleted: boolean;
      }>('/wallet/faucetpay-verify-order', {
        method: 'POST',
        body: JSON.stringify({ orderId: faucetPayOrder.transactionId }),
      });

      if (res.success && res.data) {
        if (res.data.isCompleted) {
          if (onRefreshUser) onRefreshUser();
          if (onSuccessNotice) {
            onSuccessNotice(`✓ Crypto deposit of $${numDepositAmount.toFixed(2)} USD successfully confirmed & credited!`);
          }
          onClose();
        } else {
          alert('Payment status: ' + res.data.status.toUpperCase() + '. Awaiting blockchain confirmation from FaucetPay.');
        }
      }
    } catch {
      // ignore
    } finally {
      setCheckingStatus(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        className="modal-card"
        style={{
          background: '#ffffff',
          borderRadius: 20,
          width: '100%',
          maxWidth: 520,
          padding: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          border: '1px solid #e2e8f0',
          maxHeight: '92vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 5,
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
              <h4 className="font-display" style={{ fontSize: '1.15rem', color: '#0f172a', margin: 0 }}>
                {isCryptoMethod ? 'Instant Crypto Deposit' : 'Complete Deposit Payment'}
              </h4>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Gateway: <strong>{selectedMethod.name}</strong> {isCryptoMethod && '• Automated via FaucetPay'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost"
            style={{ padding: '6px', borderRadius: '50%', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Amount to Pay Banner */}
        <div
          style={{
            background: isCryptoMethod ? '#f0fdf4' : '#f0f9ff',
            border: isCryptoMethod ? '1px solid #86efac' : '1px solid rgba(14, 165, 233, 0.3)',
            borderRadius: 14,
            padding: '12px 16px',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <span style={{ fontSize: '0.85rem', color: isCryptoMethod ? '#166534' : '#334155', fontWeight: 600 }}>
            {isCryptoMethod ? 'Total Crypto Deposit:' : 'Amount to Send:'}
          </span>
          <div style={{ textAlign: 'right' }}>
            <span className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: isCryptoMethod ? '#15803d' : 'var(--primary-neon)' }}>
              {selectedMethod.isBDT
                ? `৳${Math.round(numDepositAmount * bdtRate).toLocaleString()} BDT`
                : `$${numDepositAmount.toFixed(2)} USD`}
            </span>
            {selectedMethod.isBDT && (
              <span style={{ fontSize: '0.74rem', color: '#64748b', display: 'block' }}>
                (${numDepositAmount.toFixed(2)} USD ad budget)
              </span>
            )}
            {isCryptoMethod && (
              <span style={{ fontSize: '0.72rem', color: '#16a34a', display: 'block', fontWeight: 700 }}>
                ⚡ Automatic Instant Credit
              </span>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* AUTOMATED CRYPTO (FAUCETPAY) CHECKOUT VIEW                                 */}
        {/* ========================================================================= */}
        {isCryptoMethod && !showManualFallback ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* FaucetPay Explanatory Card */}
            <div
              style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #f0fdf4 100%)',
                border: '1.5px solid #bbf7d0',
                borderRadius: 16,
                padding: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    color: '#15803d',
                    background: '#dcfce7',
                    border: '1px solid #86efac',
                    padding: '3px 8px',
                    borderRadius: 6,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                  }}
                >
                  <Zap size={13} /> 100% AUTOMATIC DEPOSIT
                </span>
                <span style={{ fontSize: '0.74rem', color: '#0369a1', fontWeight: 700 }}>
                  Zero Extra Fees
                </span>
              </div>

              <h5 style={{ fontSize: '0.94rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
                Pay with Any Crypto via FaucetPay
              </h5>
              <p style={{ fontSize: '0.80rem', color: '#475569', lineHeight: 1.45, margin: 0 }}>
                Click below to launch secure crypto checkout. Pay seamlessly using <strong>Bitcoin (BTC), Ethereum (ETH), USDT (TRC-20, BEP-20, ERC-20), Litecoin (LTC), Tron (TRX), Dogecoin (DOGE), BNB</strong> and more.
              </p>

              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.74rem', color: '#166534', fontWeight: 600 }}>
                <ShieldCheck size={15} color="#16a34a" />
                <span>Your ad budget updates automatically as soon as payment completes!</span>
              </div>
            </div>

            {/* Launch Checkout Button */}
            {!faucetPayOrder ? (
              <button
                type="button"
                onClick={handleFaucetPayCheckout}
                disabled={faucetPayLoading}
                className="btn btn-neon glow-neon"
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: 14,
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  cursor: faucetPayLoading ? 'wait' : 'pointer',
                  border: 'none',
                  color: '#ffffff',
                  boxShadow: '0 8px 24px rgba(2, 132, 199, 0.28)',
                }}
              >
                {faucetPayLoading ? (
                  <span>Generating Secure Order...</span>
                ) : (
                  <>
                    <Zap size={18} />
                    <span>Pay ${numDepositAmount.toFixed(2)} USD via FaucetPay</span>
                    <ExternalLink size={16} />
                  </>
                )}
              </button>
            ) : (
              /* Already opened checkout - verification helper */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ padding: '12px 14px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1e40af', marginBottom: 4 }}>
                    Checkout Window Opened!
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#3b82f6', lineHeight: 1.4 }}>
                    Complete your payment on FaucetPay. Once done, click the button below to confirm your balance.
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    onClick={handleFaucetPayCheckout}
                    className="btn btn-ghost"
                    style={{ flex: 1, padding: '10px', borderRadius: 10, fontSize: '0.82rem', border: '1px solid #cbd5e1' }}
                  >
                    Re-open Checkout
                  </button>
                  <button
                    type="button"
                    onClick={handleCheckCryptoPaymentStatus}
                    disabled={checkingStatus}
                    className="btn btn-neon glow-neon"
                    style={{ flex: 1, padding: '10px', borderRadius: 10, fontSize: '0.82rem', fontWeight: 750, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    <RefreshCw size={14} className={checkingStatus ? 'animate-spin' : ''} />
                    <span>{checkingStatus ? 'Checking...' : 'Check Payment Status'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Switch to manual TrxID fallback */}
            <div style={{ textAlign: 'center', marginTop: 6 }}>
              <button
                type="button"
                onClick={() => setShowManualFallback(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '0.76rem',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Prefer to enter Transaction Hash manually instead?
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* STANDARD / MANUAL DEPOSIT SUBMISSION VIEW                                  */
          /* ========================================================================= */
          <>
            {/* Toggle back to automated checkout if crypto */}
            {isCryptoMethod && showManualFallback && (
              <div style={{ marginBottom: 12, textAlign: 'right' }}>
                <button
                  type="button"
                  onClick={() => setShowManualFallback(false)}
                  style={{
                    background: '#e0f2fe',
                    border: '1px solid rgba(14, 165, 233, 0.3)',
                    color: 'var(--primary-neon)',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    borderRadius: 8,
                    padding: '4px 10px',
                    cursor: 'pointer',
                  }}
                >
                  ⚡ Switch to Automatic FaucetPay Checkout
                </button>
              </div>
            )}

            {/* ADMIN OFFICIAL RECEIVER DETAILS */}
            <div
              style={{
                background: '#f8fafc',
                border: '1.5px dashed rgba(14, 165, 233, 0.4)',
                borderRadius: 12,
                padding: '14px 16px',
                marginBottom: 18,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span className="font-mono" style={{ fontSize: '0.76rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                  Send Money To:
                </span>
                <span className="badge-pill" style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '0.72rem', border: '1px solid rgba(14, 165, 233, 0.3)' }}>
                  {selectedMethod.accountType || 'Official Account'}
                </span>
              </div>

              {/* Account Number / Address with Copy Button */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: 10,
                  padding: '10px 12px',
                }}
              >
                <span
                  className="font-mono"
                  style={{
                    fontSize: '0.90rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    wordBreak: 'break-all',
                    userSelect: 'all',
                  }}
                >
                  {selectedMethod.accountNumber || 'Contact Admin'}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    if (selectedMethod.accountNumber) {
                      navigator.clipboard.writeText(selectedMethod.accountNumber);
                      setCopiedReceiver(true);
                      setTimeout(() => setCopiedReceiver(false), 2000);
                    }
                  }}
                  className="btn btn-ghost"
                  style={{
                    padding: '5px 10px',
                    fontSize: '0.78rem',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    background: copiedReceiver ? '#f0fdf4' : '#f8fafc',
                    color: copiedReceiver ? '#16a34a' : '#334155',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    flexShrink: 0,
                  }}
                >
                  {copiedReceiver ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
                  <span>{copiedReceiver ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              {/* Payment Instructions Note */}
              {selectedMethod.instructions && (
                <div style={{ marginTop: 8, fontSize: '0.78rem', color: '#475569', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>Note:</span>
                  <span>{selectedMethod.instructions}</span>
                </div>
              )}
            </div>

            {/* Error in modal if any */}
            {depositModalError && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  marginBottom: 14,
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: '#fef2f2',
                  border: '1px solid #fca5a5',
                  color: '#b91c1c',
                }}
              >
                <AlertCircle size={16} color="#dc2626" style={{ flexShrink: 0 }} />
                <span>{depositModalError}</span>
              </div>
            )}

            {/* USER PAYMENT VERIFICATION DETAILS FORM */}
            <form onSubmit={handleDepositSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Sender Account */}
              <div>
                <label className="font-mono" style={{ fontSize: '0.82rem', color: '#475569', display: 'block', marginBottom: 5, fontWeight: 600 }}>
                  Sender Account / Phone / Wallet Address <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder={
                    selectedMethod.isBDT
                      ? 'e.g. 017XXXXXXXX (Your bKash/Nagad number)'
                      : isCryptoMethod
                        ? 'e.g. Your sender wallet or FaucetPay email'
                        : 'e.g. Your sender email, phone or account number'
                  }
                  value={senderAccount}
                  onChange={(e) => setSenderAccount(e.target.value)}
                  className="input-field"
                  style={{ padding: '10px 12px', fontSize: '0.9rem' }}
                  required
                  autoFocus
                />
              </div>

              {/* Transaction ID */}
              <div>
                <label className="font-mono" style={{ fontSize: '0.82rem', color: '#475569', display: 'block', marginBottom: 5, fontWeight: 600 }}>
                  Transaction ID (TrxID) / TxHash <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. BL76AK9X9Z or 0x8a92f..."
                  value={transactionHash}
                  onChange={(e) => setTransactionHash(e.target.value)}
                  className="input-field font-mono"
                  style={{ padding: '10px 12px', fontSize: '0.9rem' }}
                  required
                />
                <span style={{ fontSize: '0.74rem', color: '#64748b', display: 'block', marginTop: 3 }}>
                  Exact transaction identifier from your SMS, FaucetPay receipt, or blockchain explorer.
                </span>
              </div>

              {/* Optional Note */}
              <div>
                <label className="font-mono" style={{ fontSize: '0.82rem', color: '#475569', display: 'block', marginBottom: 5, fontWeight: 600 }}>
                  Optional Note / Reference
                </label>
                <input
                  type="text"
                  placeholder="Any additional info for admin (optional)"
                  value={depositNotes}
                  onChange={(e) => setDepositNotes(e.target.value)}
                  className="input-field"
                  style={{ padding: '9px 12px', fontSize: '0.86rem' }}
                />
              </div>

              {/* Modal Action Buttons */}
              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-ghost"
                  style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1px solid #cbd5e1', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={depositLoading || !senderAccount.trim() || !transactionHash.trim()}
                  className="btn btn-neon glow-neon"
                  style={{
                    flex: 2,
                    padding: '11px',
                    borderRadius: 10,
                    fontWeight: 700,
                    opacity: (!senderAccount.trim() || !transactionHash.trim() || depositLoading) ? 0.6 : 1,
                    cursor: (!senderAccount.trim() || !transactionHash.trim() || depositLoading) ? 'not-allowed' : 'pointer',
                  }}
                >
                  {depositLoading ? 'Submitting...' : `Submit Deposit ($${numDepositAmount.toFixed(2)} USD)`}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
