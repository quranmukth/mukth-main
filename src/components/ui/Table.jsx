// ── Table Component — Professional data table ───────────────────────────────
import { useState, useMemo } from 'react';

export default function Table({ columns, data, searchable = false, searchPlaceholder = 'بحث...', pageSize = 8, onRowClick, emptyMessage = 'لا توجد بيانات' }) {
  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        const val = col.accessor ? row[col.accessor] : '';
        return String(val).toLowerCase().includes(q);
      })
    );
  }, [data, search, columns]);

  const sorted = useMemo(() => {
    if (!sortCol) return filtered;
    return [...filtered].sort((a, b) => {
      const va = a[sortCol] ?? '';
      const vb = b[sortCol] ?? '';
      const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortCol, sortDir]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const pageData = sorted.slice(page * pageSize, (page + 1) * pageSize);

  const handleSort = (accessor) => {
    if (sortCol === accessor) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(accessor);
      setSortDir('asc');
    }
  };

  return (
    <div>
      {searchable && (
        <div style={{ marginBottom: '1rem' }}>
          <input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            style={{
              width: '100%', maxWidth: '320px', padding: '0.6rem 1rem',
              border: '1.5px solid var(--border-primary)',
              borderRadius: '0.7rem', background: 'var(--bg-input)',
              fontSize: '0.88rem', fontFamily: 'inherit',
              color: 'var(--text-primary)', outline: 'none',
            }}
          />
        </div>
      )}

      <div style={{ overflowX: 'auto', borderRadius: '0.85rem', border: '1px solid var(--border-secondary)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ background: 'var(--bg-tertiary)' }}>
              {columns.map((col) => (
                <th
                  key={col.accessor || col.header}
                  onClick={() => col.sortable !== false && col.accessor && handleSort(col.accessor)}
                  style={{
                    padding: '0.75rem 1rem',
                    textAlign: 'start',
                    fontWeight: 700,
                    color: 'var(--text-secondary)',
                    fontSize: '0.8rem',
                    cursor: col.sortable !== false && col.accessor ? 'pointer' : 'default',
                    borderBottom: '1px solid var(--border-secondary)',
                    whiteSpace: 'nowrap',
                    userSelect: 'none',
                  }}
                >
                  {col.header}
                  {sortCol === col.accessor && (
                    <span style={{ marginInlineStart: '0.3rem', fontSize: '0.7rem' }}>
                      {sortDir === 'asc' ? '▲' : '▼'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{
                  padding: '3rem 1rem', textAlign: 'center',
                  color: 'var(--text-tertiary)', fontSize: '0.9rem',
                }}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              pageData.map((row, ri) => (
                <tr
                  key={row.id || ri}
                  onClick={() => onRowClick?.(row)}
                  style={{
                    cursor: onRowClick ? 'pointer' : 'default',
                    transition: 'background 0.12s',
                    borderBottom: ri < pageData.length - 1 ? '1px solid var(--border-secondary)' : 'none',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                  onMouseOut={(e) => (e.currentTarget.style.background = '')}
                >
                  {columns.map((col) => (
                    <td
                      key={col.accessor || col.header}
                      style={{
                        padding: '0.72rem 1rem',
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '0.5rem', marginTop: '1rem',
        }}>
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            style={{
              padding: '0.4rem 0.8rem', borderRadius: '0.5rem',
              border: '1px solid var(--border-primary)',
              background: 'var(--bg-card)', color: 'var(--text-primary)',
              cursor: page === 0 ? 'not-allowed' : 'pointer',
              opacity: page === 0 ? 0.4 : 1,
              fontFamily: 'inherit', fontSize: '0.82rem',
            }}
          >
            ←
          </button>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            style={{
              padding: '0.4rem 0.8rem', borderRadius: '0.5rem',
              border: '1px solid var(--border-primary)',
              background: 'var(--bg-card)', color: 'var(--text-primary)',
              cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
              opacity: page >= totalPages - 1 ? 0.4 : 1,
              fontFamily: 'inherit', fontSize: '0.82rem',
            }}
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
