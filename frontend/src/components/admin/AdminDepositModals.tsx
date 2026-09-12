import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Transaction } from '../../types';

interface AdminDepositModalsProps {
  approveModalDeposit: Transaction | null;
  setApproveModalDeposit: (d: Transaction | null) => void;
  approveDepositNotes: string;
  setApproveDepositNotes: (val: string) => void;
  approveDepositLoading: boolean;
  handleConfirmApproveDeposit: () => void;

  rejectModalDeposit: Transaction | null;
  setRejectModalDeposit: (d: Transaction | null) => void;
  rejectDepositReason: string;
  setRejectDepositReason: (val: string) => void;
  rejectDepositLoading: boolean;
  handleConfirmRejectDeposit: () => void;
}

export const AdminDepositModals: React.FC<AdminDepositModalsProps> = ({
  approveModalDeposit,
  setApproveModalDeposit,
  approveDepositNotes,
  setApproveDepositNotes,
  approveDepositLoading,
  handleConfirmApproveDeposit,
  rejectModalDeposit,
  setRejectModalDeposit,
  rejectDepositReason,
  setRejectDepositReason,
  rejectDepositLoading,
  handleConfirmRejectDeposit,
}) => {
  return (
    <>
      {/* =========================================================================
          MODAL: APPROVE DEPOSIT
          ========================================================================= */}
      {approveModalDeposit && (
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
              background: '#ffffff',
              padding: '28px',
              borderRadius: 20,
              maxWidth: 520,
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              border: '1.5px solid #86efac',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: '#f0fdf4',
                    color: '#15803d',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CheckCircle2 size={22} />
                </div>
                <h3 className="font-display" style={{ fontSize: '1.25rem', color: '#0f172a', margin: 0 }}>
                  Approve Deposit & Credit Budget
                </h3>
              </div>
              <button
                onClick={() => setApproveModalDeposit(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            {/* Deposit Info Card */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: '14px',
                marginBottom: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                fontSize: '0.84rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Advertiser:</span>
                <strong style={{ color: '#0f172a' }}>
                  {typeof approveModalDeposit.userId === 'object' ? (approveModalDeposit.userId as any).name : 'Campaigner'} (
                  {typeof approveModalDeposit.userId === 'object' ? (approveModalDeposit.userId as any).email : 'N/A'})
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Payment Gateway:</span>
                <strong style={{ color: '#0f172a', textTransform: 'capitalize' }}>{approveModalDeposit.gateway}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Sender Account:</span>
                <span className="font-mono" style={{ color: '#0f172a', fontWeight: 700 }}>
                  {approveModalDeposit.senderAccount || 'N/A'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>TrxID / TxHash:</span>
                <span className="font-mono" style={{ color: '#0284c7', fontWeight: 700 }}>
                  {approveModalDeposit.transactionHash || approveModalDeposit.referenceId || 'N/A'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 6, borderTop: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b', fontWeight: 700 }}>Budget To Credit:</span>
                <strong style={{ color: '#15803d', fontSize: '1.05rem' }}>${approveModalDeposit.amount.toFixed(2)} USD</strong>
              </div>
            </div>

            <p style={{ fontSize: '0.84rem', color: '#64748b', marginBottom: 14 }}>
              Clicking approve will immediately credit <strong>${approveModalDeposit.amount.toFixed(2)} USD</strong> to the user's creator ad balance.
            </p>

            <div style={{ marginBottom: 18 }}>
              <label className="font-mono" style={{ fontSize: '0.8rem', color: '#475569', display: 'block', marginBottom: 6, fontWeight: 700 }}>
                Admin Notes (Optional):
              </label>
              <input
                type="text"
                placeholder="e.g. Verified on bKash statement / TxHash confirmed"
                value={approveDepositNotes}
                onChange={(e) => setApproveDepositNotes(e.target.value)}
                className="input-field"
                style={{ padding: '10px 14px', fontSize: '0.88rem', borderRadius: 10, width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setApproveModalDeposit(null)}
                className="btn btn-ghost"
                style={{ padding: '10px 18px', borderRadius: 10 }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={approveDepositLoading}
                onClick={handleConfirmApproveDeposit}
                className="btn btn-neon glow-neon"
                style={{ padding: '10px 20px', borderRadius: 10, fontWeight: 700 }}
              >
                {approveDepositLoading ? 'Processing...' : 'Confirm & Credit Ad Budget'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: REJECT DEPOSIT
          ========================================================================= */}
      {rejectModalDeposit && (
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
              background: '#ffffff',
              padding: '28px',
              borderRadius: 20,
              maxWidth: 520,
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              border: '1.5px solid #fca5a5',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: '#fef2f2',
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <XCircle size={22} />
                </div>
                <h3 className="font-display" style={{ fontSize: '1.25rem', color: '#0f172a', margin: 0 }}>
                  Reject Deposit Request
                </h3>
              </div>
              <button
                onClick={() => setRejectModalDeposit(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            {/* Deposit Info Card */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: '14px',
                marginBottom: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                fontSize: '0.84rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Advertiser:</span>
                <strong style={{ color: '#0f172a' }}>
                  {typeof rejectModalDeposit.userId === 'object' ? (rejectModalDeposit.userId as any).name : 'Campaigner'} (
                  {typeof rejectModalDeposit.userId === 'object' ? (rejectModalDeposit.userId as any).email : 'N/A'})
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Payment Gateway:</span>
                <strong style={{ color: '#0f172a', textTransform: 'capitalize' }}>{rejectModalDeposit.gateway}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Amount:</span>
                <strong style={{ color: '#ef4444' }}>${rejectModalDeposit.amount.toFixed(2)} USD</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Submitted TrxID:</span>
                <span className="font-mono" style={{ color: '#475569' }}>
                  {rejectModalDeposit.transactionHash || rejectModalDeposit.referenceId || 'N/A'}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <label className="font-mono" style={{ fontSize: '0.8rem', color: '#475569', display: 'block', marginBottom: 6, fontWeight: 700 }}>
                Rejection Reason:
              </label>
              <textarea
                placeholder="e.g. Invalid TrxID, no payment received on our statement, or incorrect amount sent."
                value={rejectDepositReason}
                onChange={(e) => setRejectDepositReason(e.target.value)}
                className="input-field"
                style={{ padding: '10px 14px', fontSize: '0.88rem', borderRadius: 10, width: '100%', minHeight: 80, resize: 'vertical' }}
                required
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setRejectModalDeposit(null)}
                className="btn btn-ghost"
                style={{ padding: '10px 18px', borderRadius: 10 }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={rejectDepositLoading}
                onClick={handleConfirmRejectDeposit}
                className="btn btn-ghost"
                style={{ padding: '10px 20px', borderRadius: 10, background: '#ef4444', color: '#ffffff', border: 'none', fontWeight: 700 }}
              >
                {rejectDepositLoading ? 'Processing...' : 'Confirm Reject Deposit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
