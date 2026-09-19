import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Payout } from '../../types';
import { getCountryFlag } from '../../utils/telemetry';

interface AdminPayoutModalsProps {
  approveModalPayout: Payout | null;
  setApproveModalPayout: (p: Payout | null) => void;
  approveTxnRef: string;
  setApproveTxnRef: (val: string) => void;
  approveNotes: string;
  setApproveNotes: (val: string) => void;
  approveLoading: boolean;
  handleConfirmApprove: () => void;
  usdToBdt: number;

  rejectModalPayout: Payout | null;
  setRejectModalPayout: (p: Payout | null) => void;
  rejectReason: string;
  setRejectReason: (val: string) => void;
  rejectLoading: boolean;
  handleConfirmReject: () => void;
}

export const AdminPayoutModals: React.FC<AdminPayoutModalsProps> = ({
  approveModalPayout,
  setApproveModalPayout,
  approveTxnRef,
  setApproveTxnRef,
  approveNotes,
  setApproveNotes,
  approveLoading,
  handleConfirmApprove,
  usdToBdt,
  rejectModalPayout,
  setRejectModalPayout,
  rejectReason,
  setRejectReason,
  rejectLoading,
  handleConfirmReject,
}) => {
  return (
    <>
      {/* =========================================================================
          MODAL 1: PAY & APPROVE WITHDRAWAL
          ========================================================================= */}
      {approveModalPayout && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: 20,
          }}
        >
          <div
            className="glass-card modal-card"
            style={{
              maxWidth: 480,
              width: '100%',
              padding: 28,
              borderRadius: 20,
              boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
              background: '#ffffff',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: '#ecfdf5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CheckCircle2 size={20} />
                </div>
                <h3 className="font-display" style={{ fontSize: '1.25rem', color: '#0f172a', margin: 0 }}>
                  Confirm & Disburse Payout
                </h3>
              </div>
              <button
                onClick={() => setApproveModalPayout(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            {/* Payout Details Summary */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: '14px 16px',
                marginBottom: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 6, fontSize: '0.86rem' }}>
                <span style={{ color: '#64748b' }}>Recipient User:</span>
                <strong style={{ color: '#0f172a', wordBreak: 'break-all', textAlign: 'right' }}>
                  {approveModalPayout.viewerId?.name} ({approveModalPayout.viewerId?.email})
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6, fontSize: '0.86rem' }}>
                <span style={{ color: '#64748b' }}>Payment Method:</span>
                <strong style={{ color: '#0f172a', textTransform: 'uppercase' }}>{approveModalPayout.method}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6, fontSize: '0.86rem' }}>
                <span style={{ color: '#64748b' }}>Account Details:</span>
                <strong className="font-mono" style={{ color: 'var(--primary-neon)', wordBreak: 'break-all' }}>
                  {approveModalPayout.accountDetails}
                </strong>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 10px', background: '#f1f5f9', borderRadius: 8, fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                  <span style={{ color: '#64748b', fontWeight: 600 }}>IP & Location:</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <span className="font-mono" style={{ background: '#ffffff', color: '#0f172a', padding: '1px 6px', borderRadius: 4, fontWeight: 700, border: '1px solid #cbd5e1' }}>
                      {approveModalPayout.ipAddress === '::1' ? '127.0.0.1' : (approveModalPayout.ipAddress || '127.0.0.1')}
                    </span>
                    <span style={{ color: '#059669', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <span>{getCountryFlag(approveModalPayout.country, approveModalPayout.countryCode)}</span>
                      <span>{approveModalPayout.country || 'Bangladesh'}</span>
                    </span>
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                  <span style={{ color: '#64748b', fontWeight: 600 }}>Browser & Platform:</span>
                  <span style={{ color: '#334155', fontWeight: 600 }}>
                    🌐 {approveModalPayout.browser || 'Web Browser'} • 💻 {approveModalPayout.platform || approveModalPayout.clientPlatform || 'Web'}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                  <span style={{ color: '#64748b', fontWeight: 600 }}>Device Model:</span>
                  <strong style={{ color: '#0f172a' }}>
                    📱 {approveModalPayout.deviceName || approveModalPayout.deviceInfo || 'Desktop PC'}
                  </strong>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6, paddingTop: 6, borderTop: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b', fontSize: '0.86rem' }}>Payout Amount:</span>
                <strong className="font-mono" style={{ fontSize: '1.3rem', color: '#059669' }}>
                  ${approveModalPayout.amount.toFixed(2)} USD
                  {(approveModalPayout.method === 'bkash' || approveModalPayout.method === 'nagad') && (
                    <span style={{ fontSize: '0.86rem', color: '#64748b', marginLeft: 6 }}>
                      (৳{(approveModalPayout.amount * usdToBdt).toLocaleString()} BDT)
                    </span>
                  )}
                </strong>
              </div>
            </div>

            {/* Transaction Ref Input */}
            <div style={{ marginBottom: 14 }}>
              <label className="font-mono" style={{ fontSize: '0.8rem', color: '#475569', display: 'block', marginBottom: 6, fontWeight: 700 }}>
                Transaction ID / TrxID / Hash:
              </label>
              <input
                type="text"
                placeholder="e.g. 9K2L8M or 0xabc... or FaucetPay batch ID"
                value={approveTxnRef}
                onChange={(e) => setApproveTxnRef(e.target.value)}
                className="input-field"
                style={{ padding: '10px 14px', fontSize: '0.9rem', borderRadius: 10 }}
                autoFocus
              />
            </div>

            {/* Optional Admin Note */}
            <div style={{ marginBottom: 18 }}>
              <label className="font-mono" style={{ fontSize: '0.8rem', color: '#475569', display: 'block', marginBottom: 6, fontWeight: 700 }}>
                Disbursement Note (Optional):
              </label>
              <input
                type="text"
                placeholder="e.g. Sent via bKash personal send money"
                value={approveNotes}
                onChange={(e) => setApproveNotes(e.target.value)}
                className="input-field"
                style={{ padding: '10px 14px', fontSize: '0.9rem', borderRadius: 10 }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setApproveModalPayout(null)}
                className="btn btn-ghost"
                style={{ padding: '10px 18px', borderRadius: 10 }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={approveLoading}
                onClick={handleConfirmApprove}
                className="btn btn-neon glow-neon"
                style={{ padding: '10px 20px', borderRadius: 10, fontWeight: 700 }}
              >
                {approveLoading ? 'Processing...' : 'Confirm Paid & Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: REJECT & REFUND WITHDRAWAL
          ========================================================================= */}
      {rejectModalPayout && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: 20,
          }}
        >
          <div
            className="glass-card modal-card"
            style={{
              maxWidth: 480,
              width: '100%',
              padding: 28,
              borderRadius: 20,
              boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
              background: '#ffffff',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: '#fef2f2',
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <XCircle size={20} />
                </div>
                <h3 className="font-display" style={{ fontSize: '1.25rem', color: '#0f172a', margin: 0 }}>
                  Reject & Refund Withdrawal
                </h3>
              </div>
              <button
                onClick={() => setRejectModalPayout(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            {/* Reject summary info */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: '12px 14px',
                marginBottom: 14,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                fontSize: '0.84rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>User:</span>
                <strong style={{ color: '#0f172a' }}>
                  {rejectModalPayout.viewerId?.name} ({rejectModalPayout.viewerId?.email})
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Method & Account:</span>
                <span className="font-mono" style={{ color: '#0f172a' }}>
                  <strong style={{ textTransform: 'uppercase' }}>{rejectModalPayout.method}</strong> • {rejectModalPayout.accountDetails}
                </span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '6px 8px', background: '#f1f5f9', borderRadius: 6, fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>IP & Country:</span>
                  <span className="font-mono" style={{ color: '#0f172a', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <span>{rejectModalPayout.ipAddress === '::1' ? '127.0.0.1' : (rejectModalPayout.ipAddress || '127.0.0.1')}</span>
                    <span>({getCountryFlag(rejectModalPayout.country, rejectModalPayout.countryCode)} {rejectModalPayout.country || 'Bangladesh'})</span>
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Browser & Platform:</span>
                  <span style={{ color: '#334155' }}>
                    {rejectModalPayout.browser || 'Browser'} • {rejectModalPayout.platform || rejectModalPayout.clientPlatform || 'Web'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Device Model:</span>
                  <span style={{ color: '#0f172a', fontWeight: 600 }}>
                    {rejectModalPayout.deviceName || rejectModalPayout.deviceInfo || 'Desktop PC'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 4, borderTop: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b' }}>Refund Amount:</span>
                <strong style={{ color: '#ef4444' }}>${rejectModalPayout.amount.toFixed(2)} USD</strong>
              </div>
            </div>

            <p style={{ fontSize: '0.84rem', color: '#64748b', marginBottom: 14 }}>
              The payout amount of <strong>${rejectModalPayout.amount.toFixed(2)} USD</strong> will be automatically credited back to the user's wallet balance.
            </p>

            <div style={{ marginBottom: 18 }}>
              <label className="font-mono" style={{ fontSize: '0.8rem', color: '#475569', display: 'block', marginBottom: 6, fontWeight: 700 }}>
                Rejection Reason:
              </label>
              <textarea
                placeholder="e.g. Invalid account number, duplicate account detected, or account not receiving funds."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="input-field"
                style={{ padding: '10px 14px', fontSize: '0.88rem', borderRadius: 10, width: '100%', minHeight: 80, resize: 'vertical' }}
                required
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setRejectModalPayout(null)}
                className="btn btn-ghost"
                style={{ padding: '10px 18px', borderRadius: 10 }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={rejectLoading}
                onClick={handleConfirmReject}
                className="btn btn-ghost"
                style={{ padding: '10px 20px', borderRadius: 10, background: '#ef4444', color: '#ffffff', border: 'none', fontWeight: 700 }}
              >
                {rejectLoading ? 'Processing...' : 'Confirm Reject & Refund'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
