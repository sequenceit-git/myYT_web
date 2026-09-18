import React from 'react';
import { CreditCard, Globe, RefreshCw } from 'lucide-react';
import { Transaction } from '../../types';
import { ViewerPagination } from './ViewerPagination';
import { TotalStatsLogView } from '../TotalStatsLogView';

interface ViewerTransactionsTabProps {
  ledgerTab: 'my_tx' | 'platform';
  setLedgerTab: (val: 'my_tx' | 'platform') => void;
  transactions: Transaction[];
  txLoading: boolean;
  txPage: number;
  setTxPage: (val: number) => void;
  fetchTransactions: () => void;
  fetchPlatformStats: () => void;
}

export const ViewerTransactionsTab: React.FC<ViewerTransactionsTabProps> = ({
  ledgerTab,
  setLedgerTab,
  transactions,
  txLoading,
  txPage,
  setTxPage,
  fetchTransactions,
  fetchPlatformStats,
}) => {
  const TX_PAGE_SIZE = 10;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header with Sub-tab Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <h3 className="font-display" style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', color: '#0f172a', margin: 0 }}>
          PAYOUT LEDGER
        </h3>

        {/* Sub-Tab Selector */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 4,
            background: '#f1f5f9',
            padding: '3px',
            borderRadius: 12,
            border: '1px solid #e2e8f0',
            width: '100%',
            maxWidth: 420,
          }}
        >
          <button
            onClick={() => setLedgerTab('my_tx')}
            style={{
              padding: '7px 8px',
              fontSize: 'clamp(0.74rem, 2.4vw, 0.84rem)',
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
              gap: 5,
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            <CreditCard size={14} style={{ flexShrink: 0 }} />
            <span>My Payouts ({transactions.length})</span>
          </button>

          <button
            onClick={() => {
              setLedgerTab('platform');
              fetchPlatformStats();
            }}
            style={{
              padding: '7px 8px',
              fontSize: 'clamp(0.74rem, 2.4vw, 0.84rem)',
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
              gap: 5,
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            <Globe size={14} style={{ flexShrink: 0 }} />
            <span>Total Stats & Feed</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: MY WITHDRAWALS */}
      {ledgerTab === 'my_tx' && (
        <div className="glass-card" style={{ padding: '22px', borderRadius: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h4 className="font-display" style={{ fontSize: '1.15rem', color: '#0f172a', margin: 0 }}>
              PAYOUT LEDGER
            </h4>
            <button
              onClick={fetchTransactions}
              className="btn btn-ghost"
              style={{ padding: '5px 12px', fontSize: '0.82rem', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <RefreshCw size={14} className={txLoading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>

          {!transactions.length ? (
            <div style={{ textAlign: 'center', padding: '36px', color: '#64748b', fontSize: '0.9rem' }}>
              No payout records found yet.
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
                    {transactions
                      .slice((txPage - 1) * TX_PAGE_SIZE, txPage * TX_PAGE_SIZE)
                      .map((tx) => {
                        const isFailed = tx.status === 'failed' || tx.status === 'rejected';
                        return (
                          <tr key={tx._id} style={{ borderBottom: '1px solid #f1f5f9', verticalAlign: 'top' }}>
                            <td style={{ padding: '10px 12px' }}>
                              <span className="badge-pill badge-cyan" style={{ padding: '2px 8px', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                                {tx.gateway || tx.type}
                              </span>
                            </td>
                            <td className="font-mono" style={{ padding: '10px 12px', fontWeight: 700, fontSize: '0.92rem', color: '#ef4444' }}>
                              -${Math.abs(tx.amount).toFixed(2)}
                            </td>
                            <td className="font-mono" style={{ padding: '10px 12px', color: '#0f172a', fontSize: '0.92rem' }}>
                              ${(tx.balanceAfter || 0).toFixed(4)}
                            </td>
                            <td style={{ padding: '10px 12px' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <span style={{ color: tx.status === 'completed' ? '#059669' : tx.status === 'pending' ? '#d97706' : '#ef4444', fontWeight: 700, textTransform: 'capitalize' }}>
                                  {isFailed ? 'Rejected' : tx.status}
                                </span>
                                {isFailed && tx.notes && (
                                  <div style={{ fontSize: '0.73rem', color: '#b91c1c', background: '#fef2f2', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '3px 6px', borderRadius: 4, maxWidth: 220, lineHeight: 1.3 }}>
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
                {transactions
                  .slice((txPage - 1) * TX_PAGE_SIZE, txPage * TX_PAGE_SIZE)
                  .map((tx) => {
                    const isFailed = tx.status === 'failed' || tx.status === 'rejected';
                    return (
                      <div key={tx._id} className="mobile-data-card" style={{ width: '100%', boxSizing: 'border-box' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, width: '100%' }}>
                          <span className="badge-pill badge-cyan" style={{ padding: '2px 7px', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700 }}>
                            {tx.gateway || tx.type}
                          </span>
                          <div className="font-mono" style={{ fontWeight: 800, fontSize: '0.96rem', color: '#ef4444', flexShrink: 0, textAlign: 'right' }}>
                            -${Math.abs(tx.amount).toFixed(2)}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.76rem', color: '#64748b', gap: 6, width: '100%' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0, flexWrap: 'wrap' }}>
                            <span>Status:</span>
                            <span style={{ color: tx.status === 'completed' ? '#059669' : tx.status === 'pending' ? '#d97706' : '#ef4444', fontWeight: 700, textTransform: 'capitalize' }}>
                              {isFailed ? 'Rejected' : tx.status}
                            </span>
                            <span>•</span>
                            <span>{new Date(tx.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="font-mono" style={{ color: '#0f172a', fontWeight: 600, flexShrink: 0, textAlign: 'right' }}>
                            Bal: ${(tx.balanceAfter || 0).toFixed(4)}
                          </div>
                        </div>

                        {isFailed && tx.notes && (
                          <div style={{ fontSize: '0.72rem', color: '#b91c1c', background: '#fef2f2', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '4px 8px', borderRadius: 6, marginTop: 2 }}>
                            <strong>Reason:</strong> {tx.notes.replace(/^Rejected:\s*/i, '')}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>

              <ViewerPagination
                currentPage={txPage}
                totalPages={Math.ceil(transactions.length / TX_PAGE_SIZE) || 1}
                totalItems={transactions.length}
                pageSize={TX_PAGE_SIZE}
                onPageChange={setTxPage}
                itemName="withdrawals"
              />
            </>
          )}
        </div>
      )}

      {/* SUB-TAB 2: TOTAL WITHDRAWALS & ALL WEBSITE DATA */}
      {ledgerTab === 'platform' && <TotalStatsLogView type="viewer" />}
    </div>
  );
};
