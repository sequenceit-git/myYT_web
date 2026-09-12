import React from 'react';
import {
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Globe,
  Smartphone,
} from 'lucide-react';
import { Payout } from '../../types';
import { getPaymentLogo } from './adminTypes';
import { AdminPagination } from './AdminPagination';

interface AdminPayoutsTabProps {
  payoutsList: Payout[];
  payoutFilter: 'pending' | 'approved' | 'rejected' | 'all';
  setPayoutFilter: (filter: 'pending' | 'approved' | 'rejected' | 'all') => void;
  payoutPage: number;
  setPayoutPage: (page: number) => void;
  pageSize: number;
  usdToBdt: number;
  copiedId: string | null;
  handleCopy: (text: string, id: string) => void;
  onOpenApproveModal: (payout: Payout) => void;
  onOpenRejectModal: (payout: Payout) => void;
}

export const AdminPayoutsTab: React.FC<AdminPayoutsTabProps> = ({
  payoutsList,
  payoutFilter,
  setPayoutFilter,
  payoutPage,
  setPayoutPage,
  pageSize,
  usdToBdt,
  copiedId,
  handleCopy,
  onOpenApproveModal,
  onOpenRejectModal,
}) => {
  const filteredPayouts = payoutsList.filter((p) => {
    if (payoutFilter === 'all') return true;
    return p.status === payoutFilter;
  });

  return (
    <div className="glass-card" style={{ padding: '22px', borderRadius: 18 }}>
      {/* Header with Sub-filter Pills */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 className="font-display" style={{ fontSize: '1.35rem', color: '#0f172a', margin: 0 }}>
            WITHDRAWAL DESK (MANUAL PAYOUTS)
          </h2>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>
            Review requested cashouts, disburse payment manually via MFS/Crypto, and confirm reference.
          </div>
        </div>

        {/* Sub-Filter Tabs (Touch-Scrollable on Mobile) */}
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
            const isSelected = payoutFilter === filter;
            const count = payoutsList.filter((p) => filter === 'all' || p.status === filter).length;
            return (
              <button
                key={filter}
                onClick={() => {
                  setPayoutFilter(filter);
                  setPayoutPage(1);
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
                <span>{filter}</span>
                <span style={{ fontSize: '0.72rem', opacity: 0.75 }}>({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {!filteredPayouts.length ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '0.92rem' }}>
          No {payoutFilter !== 'all' ? payoutFilter : ''} withdrawal records found.
        </div>
      ) : (
        <>
          <div className="responsive-table-wrapper">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.76rem', fontWeight: 700 }}>Method</th>
                  <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.76rem', fontWeight: 700 }}>User</th>
                  <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.76rem', fontWeight: 700 }}>Amount</th>
                  <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.76rem', fontWeight: 700 }}>Recipient Account</th>
                  <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.76rem', fontWeight: 700 }}>IP & Device Info</th>
                  <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.76rem', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.76rem', fontWeight: 700 }}>Date</th>
                  <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.76rem', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayouts
                  .slice((payoutPage - 1) * pageSize, payoutPage * pageSize)
                  .map((p) => {
                    const isBDT = p.method === 'bkash' || p.method === 'nagad' || p.method === 'rocket';
                    const logo = getPaymentLogo(p.method);

                    return (
                      <tr key={p._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        {/* Method with Official Brand Logo */}
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
                              <img src={logo} alt={p.method} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                            </div>
                            <span style={{ fontWeight: 700, color: '#0f172a', textTransform: 'capitalize' }}>
                              {p.method}
                            </span>
                          </div>
                        </td>

                        {/* User details */}
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>
                            {p.viewerId?.name || 'Viewer User'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {p.viewerId?.email}
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="font-mono" style={{ padding: '10px 12px' }}>
                          <div style={{ fontWeight: 700, color: '#ef4444', fontSize: '0.94rem' }}>
                            -${p.amount.toFixed(2)}
                          </div>
                          {isBDT && (
                            <div style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 600 }}>
                              ≈ ৳{(p.amount * usdToBdt).toLocaleString()} BDT
                            </div>
                          )}
                        </td>

                        {/* Recipient Account Details (Copyable) */}
                        <td style={{ padding: '10px 12px' }}>
                          <div
                            onClick={() => handleCopy(p.accountDetails, p._id)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              background: '#f8fafc',
                              padding: '4px 10px',
                              borderRadius: 8,
                              border: '1px solid #e2e8f0',
                              cursor: 'pointer',
                            }}
                            title="Click to copy recipient account"
                          >
                            <span className="font-mono" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>
                              {p.accountDetails}
                            </span>
                            {copiedId === p._id ? <Check size={12} color="#059669" /> : <Copy size={12} color="#64748b" />}
                          </div>
                        </td>

                        {/* IP & Device Telemetry */}
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <div
                              onClick={() => p.ipAddress && handleCopy(p.ipAddress, `ip-${p._id}`)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 5,
                                background: '#f1f5f9',
                                padding: '2px 8px',
                                borderRadius: 6,
                                fontSize: '0.74rem',
                                fontWeight: 700,
                                color: '#334155',
                                cursor: p.ipAddress ? 'pointer' : 'default',
                                width: 'fit-content',
                              }}
                              title="User IP Address (Click to copy)"
                            >
                              <Globe size={11} color="var(--primary-neon)" />
                              <span className="font-mono">{p.ipAddress || 'IP: Unknown'}</span>
                              {p.ipAddress && (copiedId === `ip-${p._id}` ? <Check size={10} color="#059669" /> : <Copy size={10} color="#94a3b8" />)}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Smartphone size={11} />
                              <span>{p.deviceInfo || p.clientPlatform || 'Web / Mobile'}</span>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td style={{ padding: '10px 12px' }}>
                          <span
                            className="badge-pill"
                            style={{
                              padding: '2px 8px',
                              fontSize: '0.72rem',
                              textTransform: 'uppercase',
                              background:
                                p.status === 'approved'
                                  ? '#ecfdf5'
                                  : p.status === 'pending'
                                  ? '#fffbeb'
                                  : '#fef2f2',
                              color:
                                p.status === 'approved'
                                  ? '#059669'
                                  : p.status === 'pending'
                                  ? '#d97706'
                                  : '#ef4444',
                              border:
                                p.status === 'approved'
                                  ? '1px solid rgba(16,185,129,0.3)'
                                  : p.status === 'pending'
                                  ? '1px solid rgba(217,119,6,0.3)'
                                  : '1px solid rgba(239,68,68,0.3)',
                            }}
                          >
                            {p.status}
                          </span>
                        </td>

                        {/* Date */}
                        <td style={{ padding: '10px 12px', color: '#64748b' }}>
                          {new Date(p.createdAt || p.requestedAt || Date.now()).toLocaleDateString()}
                        </td>

                        {/* Actions (Pay & Approve / Reject) */}
                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                          {p.status === 'pending' ? (
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                              <button
                                onClick={() => onOpenApproveModal(p)}
                                className="btn btn-neon glow-neon"
                                style={{ padding: '5px 12px', fontSize: '0.76rem', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 4 }}
                              >
                                <CheckCircle2 size={13} /> Pay & Approve
                              </button>

                              <button
                                onClick={() => onOpenRejectModal(p)}
                                className="btn btn-ghost"
                                style={{
                                  padding: '5px 10px',
                                  fontSize: '0.76rem',
                                  borderRadius: 8,
                                  color: '#ef4444',
                                  borderColor: 'rgba(239, 68, 68, 0.3)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 4,
                                }}
                              >
                                <XCircle size={13} /> Reject
                              </button>
                            </div>
                          ) : (
                            <span className="font-mono" style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              {p.transactionRef ? `Ref: ${p.transactionRef}` : p.adminNotes || 'Settled'}
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
            currentPage={payoutPage}
            totalPages={Math.ceil(filteredPayouts.length / pageSize) || 1}
            totalItems={filteredPayouts.length}
            pageSize={pageSize}
            onPageChange={setPayoutPage}
            itemLabel="payout requests"
          />
        </>
      )}
    </div>
  );
};
