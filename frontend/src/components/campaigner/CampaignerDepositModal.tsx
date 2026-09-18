import React from 'react';
import { X, Check, Copy, AlertCircle } from 'lucide-react';
import { DepositMethodConfig } from './campaignerTypes';

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
}) => {
  if (!isOpen) return null;

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
                width: 38,
                height: 38,
                borderRadius: 10,
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 5,
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              }}
            >
              <img src={selectedMethod.logoUrl} alt={selectedMethod.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div>
              <h4 className="font-display" style={{ fontSize: '1.15rem', color: '#0f172a', margin: 0 }}>
                Complete Deposit Payment
              </h4>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Method: <strong>{selectedMethod.name}</strong>
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
            background: '#f0f9ff',
            border: '1px solid rgba(14, 165, 233, 0.3)',
            borderRadius: 12,
            padding: '12px 16px',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <span style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 600 }}>
            Amount to Send:
          </span>
          <div style={{ textAlign: 'right' }}>
            <span className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-neon)' }}>
              {selectedMethod.isBDT
                ? `৳${Math.round(numDepositAmount * bdtRate).toLocaleString()} BDT`
                : `$${numDepositAmount.toFixed(2)} USD`}
            </span>
            {selectedMethod.isBDT && (
              <span style={{ fontSize: '0.74rem', color: '#64748b', display: 'block' }}>
                (${numDepositAmount.toFixed(2)} USD ad budget)
              </span>
            )}
          </div>
        </div>

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
                fontSize: '0.92rem',
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
                  : selectedMethod.id === 'crypto'
                    ? 'e.g. 0x... (Your BEP-20 sender wallet)'
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
              Exact transaction identifier from your SMS or receipt.
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
      </div>
    </div>
  );
};
