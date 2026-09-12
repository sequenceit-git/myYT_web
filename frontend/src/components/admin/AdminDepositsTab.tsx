import React from 'react';
import {
  CheckCircle2,
  XCircle,
  Copy,
  Check,
} from 'lucide-react';
import { Transaction } from '../../types';
import { getPaymentLogo } from './adminTypes';
import { AdminPagination } from './AdminPagination';

interface AdminDepositsTabProps {
  depositsList: Transaction[];
  depositFilter: 'pending' | 'approved' | 'rejected' | 'all';
  setDepositFilter: (filter: 'pending' | 'approved' | 'rejected' | 'all') => void;
  depositPage: number;
  setDepositPage: (page: number) => void;
  pageSize: number;
  usdToBdt: number;
  copiedId: string | null;
  setCopiedId: (id: string | null) => void;
  onOpenApproveModal: (deposit: Transaction) => void;
  onOpenRejectModal: (deposit: Transaction) => void;
}

export const AdminDepositsTab: React.FC<AdminDepositsTabProps> = ({
  depositsList,
  depositFilter,
  setDepositFilter,
  depositPage,
  setDepositPage,
  pageSize,
  usdToBdt,
  copiedId,
  setCopiedId,
  onOpenApproveModal,
  onOpenRejectModal,
}) => {
  const filteredDeposits = depositsList.filter((d) => {
    if (depositFilter === 'all') return true;
    if (depositFilter === 'approved') return d.status === 'completed';
    if (depositFilter === 'rejected') return d.status === 'failed';
    return d.status === depositFilter;
  });

  return (
    <div className="glass-card" style={{ padding: '22px', borderRadius: 18 }}>
      {/* Header with Sub-filter Pills */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 className="font-display" style={{ fontSize: '1.35rem', color: '#0f172a', margin: 0 }}>
            DEPOSITS DESK (MANUAL APPROVAL)
          </h2>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>
            Verify advertiser deposit payments (TrxID / TxHash / Sender Number) and approve to credit ad budget.
          </div>
        </div>

        {/* Sub-Filter Tabs */}
        <div
          className="mobile-scroll-x"
          style={{
            display: 'flex',
            gap: 6,
            background: '#f1f5f9',
            padding: 4,
            borderRadius: 12,
            maxWidth: '100%',
            overflowX: 'auto',
          }}
        >
          {(['pending', 'approved', 'rejected', 'all'] as const).map((filter) => {
            const isSelected = depositFilter === filter;
            const count = depositsList.filter((d) => {
              if (filter === 'all') return true;
              if (filter === 'approved') return d.status === 'completed';
              if (filter === 'rejected') return d.status === 'failed';
              return d.status === filter;
            }).length;

            return (
              <button
                key={filter}
                onClick={() => {
                  setDepositFilter(filter);
                  setDepositPage(1);
                }}
                style={{
                  padding: '6px 14px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  background: isSelected ? '#ffffff' : 'transparent',
                  color: isSelected ? 'var(--primary-neon)' : '#64748b',
                  boxShadow: isSelected ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                }}
              >
                <span>{filter === 'approved' ? 'Approved' : filter === 'rejected' ? 'Rejected' : filter}</span>
                <span style={{ fontSize: '0.72rem', opacity: 0.75 }}>({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {!filteredDeposits.length ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '0.92rem' }}>
          No {depositFilter !== 'all' ? depositFilter : ''} deposit records found.
        </div>
      ) : (
        <>
          <div className="responsive-table-wrapper">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.76rem', fontWeight: 700 }}>Gateway</th>
                  <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.76rem', fontWeight: 700 }}>Advertiser</th>
                  <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.76rem', fontWeight: 700 }}>Amount</th>
                  <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.76rem', fontWeight: 700 }}>Sender Account</th>
                  <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.76rem', fontWeight: 700 }}>TrxID / Hash</th>
                  <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.76rem', fontWeight: 700 }}>Admin Receiver</th>
                  <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.76rem', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.76rem', fontWeight: 700 }}>Date</th>
                  <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.76rem', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeposits
                  .slice((depositPage - 1) * pageSize, depositPage * pageSize)
                  .map((d) => {
                    const gatewayName = d.gateway || 'crypto';
                    const isBDT = gatewayName === 'bkash' || gatewayName === 'nagad' || gatewayName === 'rocket';
                    const logo = getPaymentLogo(gatewayName);
                    const userObj = typeof d.userId === 'object' ? d.userId : null;

                    return (
                      <tr key={d._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        {/* Gateway */}
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: 6,
                                background: '#ffffff',
                                border: '1px solid #e2e8f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 4,
                                flexShrink: 0,
                              }}
                            >
                              <img src={logo} alt={gatewayName} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                            </div>
                            <span style={{ fontWeight: 700, color: '#0f172a', textTransform: 'capitalize' }}>
                              {gatewayName}
                            </span>
                          </div>
                        </td>

                        {/* User details */}
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>
                            {userObj?.name || 'Campaigner'}
                          </div>
                          <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                            {userObj?.email || 'N/A'}
                          </div>
                        </td>

                        {/* Amount */}
                        <td style={{ padding: '10px 12px' }}>
                          <div className="font-mono" style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.94rem' }}>
                            ${d.amount.toFixed(2)} USD
                          </div>
                          {isBDT && (
                            <div style={{ fontSize: '0.74rem', color: '#0284c7', fontWeight: 600 }}>
                              ৳{(d.amount * usdToBdt).toLocaleString()} BDT
                            </div>
                          )}
                        </td>

                        {/* Sender Account */}
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span className="font-mono" style={{ fontWeight: 700, color: '#0f172a' }}>
                              {d.senderAccount || 'N/A'}
                            </span>
                            {d.senderAccount && (
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(d.senderAccount!);
                                  setCopiedId(`sender-${d._id}`);
                                  setTimeout(() => setCopiedId(null), 2000);
                                }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#64748b' }}
                                title="Copy Sender Account"
                              >
                                {copiedId === `sender-${d._id}` ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
                              </button>
                            )}
                          </div>
                        </td>

                        {/* TrxID / Hash */}
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span className="font-mono" style={{ fontSize: '0.8rem', color: '#334155', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {d.transactionHash || d.referenceId || 'N/A'}
                            </span>
                            {(d.transactionHash || d.referenceId) && (
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(d.transactionHash || d.referenceId || '');
                                  setCopiedId(`trx-${d._id}`);
                                  setTimeout(() => setCopiedId(null), 2000);
                                }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#64748b' }}
                                title="Copy Transaction Hash / TrxID"
                              >
                                {copiedId === `trx-${d._id}` ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Admin Receiver Account */}
                        <td style={{ padding: '10px 12px' }}>
                          <span className="font-mono" style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            {d.receiverAccount || 'Default Address'}
                          </span>
                        </td>

                        {/* Status */}
                        <td style={{ padding: '10px 12px' }}>
                          {d.status === 'pending' ? (
                            <span className="badge-pill" style={{ background: '#fef3c7', color: '#d97706', border: '1px solid #fde68a', fontWeight: 700, fontSize: '0.74rem' }}>
                              Pending Review
                            </span>
                          ) : d.status === 'completed' ? (
                            <span className="badge-pill" style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', fontWeight: 700, fontSize: '0.74rem' }}>
                              Approved
                            </span>
                          ) : (
                            <span className="badge-pill" style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', fontWeight: 700, fontSize: '0.74rem' }}>
                              Rejected
                            </span>
                          )}
                        </td>

                        {/* Date */}
                        <td style={{ padding: '10px 12px', fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                          {new Date(d.createdAt).toLocaleDateString()}{' '}
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{new Date(d.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '10px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          {d.status === 'pending' ? (
                            <div style={{ display: 'inline-flex', gap: 6 }}>
                              <button
                                onClick={() => onOpenApproveModal(d)}
                                className="btn btn-ghost"
                                style={{
                                  padding: '5px 10px',
                                  fontSize: '0.78rem',
                                  borderRadius: 6,
                                  background: '#f0fdf4',
                                  color: '#15803d',
                                  border: '1px solid #86efac',
                                  fontWeight: 700,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 4,
                                }}
                              >
                                <CheckCircle2 size={13} /> Approve
                              </button>
                              <button
                                onClick={() => onOpenRejectModal(d)}
                                className="btn btn-ghost"
                                style={{
                                  padding: '5px 10px',
                                  fontSize: '0.78rem',
                                  borderRadius: 6,
                                  background: '#fef2f2',
                                  color: '#b91c1c',
                                  border: '1px solid #fca5a5',
                                  fontWeight: 700,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 4,
                                }}
                              >
                                <XCircle size={13} /> Reject
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
                              {d.adminNotes || (d.status === 'completed' ? 'Approved' : 'Declined')}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          <AdminPagination
            currentPage={depositPage}
            totalPages={Math.ceil(filteredDeposits.length / pageSize) || 1}
            totalItems={filteredDeposits.length}
            pageSize={pageSize}
            onPageChange={setDepositPage}
            itemLabel="deposit requests"
          />
        </>
      )}
    </div>
  );
};
