import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
}

export const AdminPagination: React.FC<AdminPaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  itemLabel = 'records',
}) => {
  if (totalItems <= pageSize) return null;

  const startIdx = (currentPage - 1) * pageSize + 1;
  const endIdx = Math.min(currentPage * pageSize, totalItems);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 16,
        marginTop: 14,
        borderTop: '1px solid #f1f5f9',
        flexWrap: 'wrap',
        gap: 10,
      }}
    >
      <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
        Showing <strong>{startIdx}</strong> to <strong>{endIdx}</strong> of <strong>{totalItems}</strong> {itemLabel}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="btn btn-ghost"
          style={{
            padding: '4px 10px',
            fontSize: '0.78rem',
            borderRadius: 8,
            opacity: currentPage <= 1 ? 0.4 : 1,
            cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <ChevronLeft size={14} /> Prev
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
          .map((pageNum, idx, arr) => {
            const prev = arr[idx - 1];
            const showEllipsis = prev && pageNum - prev > 1;
            return (
              <React.Fragment key={pageNum}>
                {showEllipsis && <span style={{ padding: '0 4px', color: '#94a3b8' }}>...</span>}
                <button
                  type="button"
                  onClick={() => onPageChange(pageNum)}
                  className="btn btn-ghost"
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.8rem',
                    borderRadius: 8,
                    fontWeight: pageNum === currentPage ? 700 : 500,
                    background: pageNum === currentPage ? '#e0f2fe' : 'transparent',
                    color: pageNum === currentPage ? 'var(--primary-neon)' : '#64748b',
                    border: pageNum === currentPage ? '1px solid rgba(14, 165, 233, 0.4)' : '1px solid transparent',
                  }}
                >
                  {pageNum}
                </button>
              </React.Fragment>
            );
          })}

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="btn btn-ghost"
          style={{
            padding: '4px 10px',
            fontSize: '0.78rem',
            borderRadius: 8,
            opacity: currentPage >= totalPages ? 0.4 : 1,
            cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          Next <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};
