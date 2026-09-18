import React from 'react';
import { Wallet, Globe, RefreshCw } from 'lucide-react';
import { Transaction } from '../../types';
import { CampaignerPagination } from './CampaignerPagination';
import { TotalStatsLogView } from '../TotalStatsLogView';

interface CampaignerLedgerTabProps {
  ledgerTab: 'my_tx' | 'platform';
  setLedgerTab: (val: 'my_tx' | 'platform') => void;
  creatorTxFilter: 'all' | 'spend' | 'withdraw' | 'deposit';
  setCreatorTxFilter: (val: 'all' | 'spend' | 'withdraw' | 'deposit') => void;
  transactions: Transaction[];
  txLoading: boolean;
  txPage: number;
  setTxPage: (val: number) => void;
  fetchTransactions: () => void;
  fetchPlatformStats: () => void;
}

export const CampaignerLedgerTab: React.FC<CampaignerLedgerTabProps> = ({
  ledgerTab,
  setLedgerTab,
  creatorTxFilter,
  setCreatorTxFilter,
  transactions,
  txLoading,
  txPage,
  setTxPage,
  fetchTransactions,
  fetchPlatformStats,
}) => {
  const TX_PAGE_SIZE = 10;

  const filteredCreatorTransactions = transactions.filter((tx) => {
    if (creatorTxFilter === 'all') return true;
    if (creatorTxFilter === 'spend') return tx.type === 'campaign_spend';
    if (creatorTxFilter === 'withdraw') return tx.type === 'payout' || tx.type === 'refund';
    if (creatorTxFilter === 'deposit') return tx.type === 'deposit';
    return true;
  });

  const spendCount = transactions.filter((t) => t.type === 'campaign_spend').length;
  const withdrawCount = transactions.filter((t) => t.type === 'payout' || t.type === 'refund').length;
  const depositCount = transactions.filter((t) => t.type === 'deposit').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header with Sub-tab Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <h3 className="font-display" style={{ fontSize: '1.5rem', color: '#0f172a', margin: 0 }}>
          SPEND & WITHDRAW LEDGER
        </h3>

        {/* Sub-Tab Selector (Responsive 2-column on mobile) */}
        <div
          className="mobile-ledger-tabs"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 6,
            background: '#f1f5f9',
            padding: '4px',
            borderRadius: 12,
            border: '1px solid #e2e8f0',
            width: '100%',
            maxWidth: 440,
          }}
        >
          <button
            onClick={() => setLedgerTab('my_tx')}
            style={{
              padding: '7px 6px',
              fontSize: 'clamp(0.72rem, 2.6vw, 0.82rem)',
              fontWeight: 700,
              borderRadius: 10,
              border: 'none',
              cursor: 'pointer',
              background: ledgerTab === 'my_tx' ? '#ffffff' : 'transparent',
              color: ledgerTab === 'my_tx' ? 'var(--primary-neon)' : '#64748b',
              boxShadow: ledgerTab === 'my_tx' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              whiteSpace: 'nowrap',
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              transition: 'all 0.15s ease',
            }}
          >
            <Wallet size={13} style={{ flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>My Logs ({transactions.length})</span>
          </button>

          <button
            onClick={() => {
              setLedgerTab('platform');
              fetchPlatformStats();
            }}
            style={{
              padding: '7px 6px',
              fontSize: 'clamp(0.72rem, 2.6vw, 0.82rem)',
              fontWeight: 700,
              borderRadius: 10,
              border: 'none',
              cursor: 'pointer',
              background: ledgerTab === 'platform' ? '#ffffff' : 'transparent',
              color: ledgerTab === 'platform' ? '#059669' : '#64748b',
              boxShadow: ledgerTab === 'platform' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              whiteSpace: 'nowrap',
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              transition: 'all 0.15s ease',
            }}
          >
            <Globe size={13} style={{ flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>Total Stats & Feed</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: MY TRANSACTIONS */}
      {ledgerTab === 'my_tx' && (
        <div className="glass-card" style={{ padding: 'clamp(14px, 3.5vw, 22px)', borderRadius: 16 }}>
          {/* Header Row: Title on Left, Refresh Button on Right */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <h4 className="font-display" style={{ fontSize: 'clamp(1.05rem, 3.5vw, 1.22rem)', color: '#0f172a', margin: 0 }}>
                SPEND & WITHDRAW LOGS
              </h4>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 2 }}>
                Track campaign budget spends, withdrawals, and top-up deposits.
              </div>
            </div>

            <button
              onClick={fetchTransactions}
              className="btn btn-ghost"
              style={{ padding: '6px 12px', fontSize: '0.78rem', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}
            >
              <RefreshCw size={13} className={txLoading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>

          {/* Sub-Filter Pills - Full Width with Smooth Touch Scroll */}
          <div style={{ marginBottom: 16, width: '100%', minWidth: 0 }}>
            <div
              className="mobile-scroll-x"
              style={{
                display: 'flex',
                gap: 5,
                background: '#f1f5f9',
                padding: 4,
                borderRadius: 10,
                overflowX: 'auto',
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box',
              }}
            >
              {[
                { id: 'all' as const, label: 'All', count: transactions.length },
                { id: 'spend' as const, label: 'Spends', count: spendCount },
                { id: 'withdraw' as const, label: 'Withdrawals', count: withdrawCount },
                { id: 'deposit' as const, label: 'Deposits', count: depositCount },
              ].map((f) => {
                const isSelected = creatorTxFilter === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => {
                      setCreatorTxFilter(f.id);
                      setTxPage(1);
                    }}
                    style={{
                      padding: '6px 11px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      borderRadius: 8,
                      border: 'none',
                      cursor: 'pointer',
                      background: isSelected ? '#ffffff' : 'transparent',
                      color: isSelected ? 'var(--primary-neon)' : '#64748b',
                      boxShadow: isSelected ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                      textTransform: 'uppercase',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span>{f.label}</span>
                    <span style={{ fontSize: '0.68rem', opacity: 0.8 }}>({f.count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {!filteredCreatorTransactions.length ? (
            <div style={{ textAlign: 'center', padding: '36px', color: '#64748b', fontSize: '0.9rem' }}>
              {creatorTxFilter === 'all'
                ? 'No spend, withdrawal, or deposit logs recorded yet.'
                : `No ${creatorTxFilter} logs found.`}
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="desktop-only-table responsive-table-wrapper">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1.5px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                      <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.78rem', fontWeight: 700 }}>Type</th>
                      <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.78rem', fontWeight: 700 }}>Amount</th>
                      <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.78rem', fontWeight: 700 }}>Balance</th>
                      <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.78rem', fontWeight: 700 }}>Status</th>
                      <th style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.78rem', fontWeight: 700 }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCreatorTransactions
                      .slice((txPage - 1) * TX_PAGE_SIZE, txPage * TX_PAGE_SIZE)
                      .map((tx) => {
                        const isDeposit = tx.type === 'deposit';
                        const isPayout = tx.type === 'payout';
                        const isRefund = tx.type === 'refund';
                        const isSpend = tx.type === 'campaign_spend';

                        return (
                          <tr key={tx._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '10px 12px' }}>
                              {isDeposit && (
                                <span
                                  className="badge-pill"
                                  style={{
                                    padding: '2px 8px',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    background: '#ecfdf5',
                                    color: '#059669',
                                    border: '1px solid rgba(16, 185, 129, 0.3)',
                                    textTransform: 'uppercase',
                                  }}
                                >
                                  Deposit {tx.gateway ? `(${tx.gateway.toUpperCase()})` : ''}
                                </span>
                              )}
                              {isRefund && (
                                <span
                                  className="badge-pill"
                                  style={{
                                    padding: '2px 8px',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    background: '#ecfdf5',
                                    color: '#059669',
                                    border: '1px solid rgba(16, 185, 129, 0.3)',
                                    textTransform: 'uppercase',
                                  }}
                                >
                                  Withdrawal Refund
                                </span>
                              )}
                              {isPayout && (
                                <span
                                  className="badge-pill"
                                  style={{
                                    padding: '2px 8px',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    background: '#faf5ff',
                                    color: '#7c3aed',
                                    border: '1px solid rgba(124, 58, 237, 0.3)',
                                    textTransform: 'uppercase',
                                  }}
                                >
                                  Withdrawal {tx.gateway ? `(${tx.gateway.toUpperCase()})` : ''}
                                </span>
                              )}
                              {isSpend && (
                                <span
                                  className="badge-pill"
                                  style={{
                                    padding: '2px 8px',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    background: '#f0f9ff',
                                    color: '#0284c7',
                                    border: '1px solid rgba(14, 165, 233, 0.3)',
                                    textTransform: 'uppercase',
                                  }}
                                >
                                  Campaign Spend
                                </span>
                              )}
                              {!isDeposit && !isRefund && !isPayout && !isSpend && (
                                <span
                                  className="badge-pill"
                                  style={{
                                    padding: '2px 8px',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    background: '#f1f5f9',
                                    color: '#475569',
                                    border: '1px solid #cbd5e1',
                                    textTransform: 'uppercase',
                                  }}
                                >
                                  {tx.type}
                                </span>
                              )}
                            </td>
                            <td
                              className="font-mono"
                              style={{
                                padding: '10px 12px',
                                fontWeight: 700,
                                color: isDeposit || isRefund || tx.amount > 0 ? '#059669' : isPayout ? '#7c3aed' : '#ef4444',
                              }}
                            >
                              {isDeposit || isRefund || tx.amount > 0
                                ? `+$${tx.amount.toFixed(2)}`
                                : `-$${Math.abs(tx.amount).toFixed(2)}`}
                            </td>
                            <td className="font-mono" style={{ padding: '10px 12px', color: '#0f172a' }}>
                              ${(tx.balanceAfter || 0).toFixed(2)}
                            </td>
                            <td style={{ padding: '10px 12px' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <span
                                  style={{
                                    color: tx.status === 'completed' ? '#059669' : tx.status === 'pending' ? '#d97706' : '#ef4444',
                                    fontWeight: 600,
                                    textTransform: 'capitalize',
                                  }}
                                >
                                  {tx.status === 'failed' ? 'Rejected' : tx.status === 'pending' ? 'Pending Review' : tx.status}
                                </span>
                                {tx.status === 'failed' && tx.notes && (
                                  <div
                                    style={{
                                      fontSize: '0.73rem',
                                      color: '#b91c1c',
                                      background: '#fef2f2',
                                      border: '1px solid rgba(239, 68, 68, 0.2)',
                                      padding: '3px 6px',
                                      borderRadius: 4,
                                      maxWidth: 220,
                                      lineHeight: 1.3,
                                    }}
                                  >
                                    <strong>Reason:</strong> {tx.notes.replace(/^Rejected:\s*/i, '')}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td style={{ padding: '10px 12px', color: '#64748b' }}>
                              {new Date(tx.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List View */}
              <div className="mobile-card-list">
                {filteredCreatorTransactions
                  .slice((txPage - 1) * TX_PAGE_SIZE, txPage * TX_PAGE_SIZE)
                  .map((tx) => {
                    const isDeposit = tx.type === 'deposit';
                    const isPayout = tx.type === 'payout';
                    const isRefund = tx.type === 'refund';
                    const isSpend = tx.type === 'campaign_spend';

                    return (
                      <div key={tx._id} className="mobile-data-card" style={{ width: '100%', boxSizing: 'border-box' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, width: '100%' }}>
                          <div style={{ minWidth: 0, flexShrink: 1 }}>
                            {isDeposit && (
                              <span
                                className="badge-pill"
                                style={{
                                  padding: '2px 7px',
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  background: '#ecfdf5',
                                  color: '#059669',
                                  border: '1px solid rgba(16, 185, 129, 0.3)',
                                  textTransform: 'uppercase',
                                }}
                              >
                                Deposit {tx.gateway ? `(${tx.gateway.toUpperCase()})` : ''}
                              </span>
                            )}
                            {isRefund && (
                              <span
                                className="badge-pill"
                                style={{
                                  padding: '2px 7px',
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  background: '#ecfdf5',
                                  color: '#059669',
                                  border: '1px solid rgba(16, 185, 129, 0.3)',
                                  textTransform: 'uppercase',
                                }}
                              >
                                Withdrawal Refund
                              </span>
                            )}
                            {isPayout && (
                              <span
                                className="badge-pill"
                                style={{
                                  padding: '2px 7px',
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  background: '#faf5ff',
                                  color: '#7c3aed',
                                  border: '1px solid rgba(124, 58, 237, 0.3)',
                                  textTransform: 'uppercase',
                                }}
                              >
                                Withdrawal {tx.gateway ? `(${tx.gateway.toUpperCase()})` : ''}
                              </span>
                            )}
                            {isSpend && (
                              <span
                                className="badge-pill"
                                style={{
                                  padding: '2px 7px',
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  background: '#f0f9ff',
                                  color: '#0284c7',
                                  border: '1px solid rgba(14, 165, 233, 0.3)',
                                  textTransform: 'uppercase',
                                }}
                              >
                                Campaign Spend
                              </span>
                            )}
                            {!isDeposit && !isRefund && !isPayout && !isSpend && (
                              <span
                                className="badge-pill"
                                style={{
                                  padding: '2px 7px',
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  background: '#f1f5f9',
                                  color: '#475569',
                                  border: '1px solid #cbd5e1',
                                  textTransform: 'uppercase',
                                }}
                              >
                                {tx.type}
                              </span>
                            )}
                          </div>

                          <div
                            className="font-mono"
                            style={{
                              fontWeight: 800,
                              fontSize: '0.96rem',
                              color: isDeposit || isRefund || tx.amount > 0 ? '#059669' : isPayout ? '#7c3aed' : '#ef4444',
                              flexShrink: 0,
                              textAlign: 'right',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {isDeposit || isRefund || tx.amount > 0
                              ? `+$${tx.amount.toFixed(2)}`
                              : `-$${Math.abs(tx.amount).toFixed(2)}`}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.76rem', color: '#64748b', gap: 6, width: '100%', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0, flexWrap: 'wrap' }}>
                            <span>Status:</span>
                            <span
                              style={{
                                color: tx.status === 'completed' ? '#059669' : tx.status === 'pending' ? '#d97706' : '#ef4444',
                                fontWeight: 700,
                                textTransform: 'capitalize',
                              }}
                            >
                              {tx.status === 'failed' ? 'Rejected' : tx.status === 'pending' ? 'Pending Review' : tx.status}
                            </span>
                            <span>•</span>
                            <span>{new Date(tx.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="font-mono" style={{ color: '#0f172a', fontWeight: 600, flexShrink: 0, textAlign: 'right', whiteSpace: 'nowrap' }}>
                            Bal: ${(tx.balanceAfter || 0).toFixed(2)}
                          </div>
                        </div>

                        {tx.status === 'failed' && tx.notes && (
                          <div
                            style={{
                              fontSize: '0.72rem',
                              color: '#b91c1c',
                              background: '#fef2f2',
                              border: '1px solid rgba(239, 68, 68, 0.2)',
                              padding: '4px 8px',
                              borderRadius: 6,
                              marginTop: 2,
                            }}
                          >
                            <strong>Rejection Reason:</strong> {tx.notes.replace(/^Rejected:\s*/i, '')}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>

              <CampaignerPagination
                currentPage={txPage}
                totalPages={Math.ceil(filteredCreatorTransactions.length / TX_PAGE_SIZE) || 1}
                totalItems={filteredCreatorTransactions.length}
                pageSize={TX_PAGE_SIZE}
                onPageChange={setTxPage}
                itemName="transactions"
              />
            </>
          )}
        </div>
      )}

      {/* SUB-TAB 2: TOTAL SPEND & CAMPAIGN STATS */}
      {ledgerTab === 'platform' && <TotalStatsLogView type="creator" />}
    </div>
  );
};
