import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CampaignerPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  itemName?: string;
}

export const CampaignerPagination: React.FC<CampaignerPaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  itemName = 'records',
}) => {
  if (totalItems === 0) return null;
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  const pages: (number | string)[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, '...', totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
        padding: '12px 16px',
        background: '#ffffff',
        borderRadius: 12,
        border: '1px solid #e2e8f0',
        marginTop: 14,
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
      }}
    >
      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
        Showing <strong style={{ color: '#0f172a' }}>{start}-{end}</strong> of <strong style={{ color: '#0f172a' }}>{totalItems}</strong> {itemName}
      </span>

      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '6px 10px',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              background: currentPage === 1 ? '#f8fafc' : '#ffffff',
              color: currentPage === 1 ? '#94a3b8' : '#334155',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: '0.8rem',
              transition: 'all 0.15s ease',
            }}
          >
            <ChevronLeft size={14} /> Prev
          </button>

          {pages.map((p, idx) => (
            <button
              key={idx}
              onClick={() => typeof p === 'number' && onPageChange(p)}
              disabled={typeof p !== 'number'}
              style={{
                minWidth: 32,
                height: 32,
                padding: '0 8px',
                borderRadius: 8,
                border: p === currentPage ? '1px solid var(--primary-neon)' : '1px solid #e2e8f0',
                background: p === currentPage ? 'var(--primary-neon)' : typeof p === 'number' ? '#ffffff' : 'transparent',
                color: p === currentPage ? '#ffffff' : '#334155',
                cursor: typeof p === 'number' ? 'pointer' : 'default',
                fontWeight: p === currentPage ? 800 : 600,
                fontSize: '0.82rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '6px 10px',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              background: currentPage === totalPages ? '#f8fafc' : '#ffffff',
              color: currentPage === totalPages ? '#94a3b8' : '#334155',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: '0.8rem',
              transition: 'all 0.15s ease',
            }}
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
};
