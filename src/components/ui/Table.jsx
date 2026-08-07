import { useState } from 'react'
import { ChevronUp, ChevronDown, Inbox } from 'lucide-react'
import { BG_INSET, BG_RAISED, BORDER_SUBTLE, TEXT_PRIMARY, TEXT_TERTIARY, radius } from '../../ds'
import Skeleton from './Skeleton'
import EmptyState from './EmptyState'

/**
 * Table — sticky header, hover rows, optional client-side sort. Built-in
 * loading (skeleton rows) and empty state so callers don't hand-roll them.
 *
 * columns: [{ key, label, width?, sortable?, render?(row) }]
 * rows: array of row objects, each needs a stable `rowKey(row)` value.
 * empty: { icon, headline, description, action } — forwarded to EmptyState.
 */
export default function Table({ columns, rows, rowKey, loading = false, empty, onRowClick, skeletonRows = 5 }) {
  const [sort, setSort] = useState(null) // { key, dir: 'asc'|'desc' }

  function toggleSort(col) {
    if (!col.sortable) return
    setSort(s => {
      if (!s || s.key !== col.key) return { key: col.key, dir: 'asc' }
      if (s.dir === 'asc') return { key: col.key, dir: 'desc' }
      return null
    })
  }

  let displayRows = rows || []
  if (sort) {
    const col = columns.find(c => c.key === sort.key)
    displayRows = [...displayRows].sort((a, b) => {
      const av = col.sortValue ? col.sortValue(a) : a[sort.key]
      const bv = col.sortValue ? col.sortValue(b) : b[sort.key]
      const cmp = av == null ? -1 : bv == null ? 1 : av > bv ? 1 : av < bv ? -1 : 0
      return sort.dir === 'asc' ? cmp : -cmp
    })
  }

  return (
    <div style={{ overflowX: 'auto', borderRadius: radius.lg, border: `1px solid ${BORDER_SUBTLE}` }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr style={{ background: BG_INSET }}>
            {columns.map(col => (
              <th
                key={col.key}
                onClick={() => toggleSort(col)}
                style={{
                  position: 'sticky', top: 0, textAlign: 'left', padding: '11px 16px',
                  fontSize: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em',
                  color: TEXT_TERTIARY, borderBottom: `1px solid ${BORDER_SUBTLE}`,
                  cursor: col.sortable ? 'pointer' : 'default', userSelect: 'none',
                  width: col.width, whiteSpace: 'nowrap',
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  {col.label}
                  {col.sortable && sort?.key === col.key && (sort.dir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: skeletonRows }).map((_, i) => (
              <tr key={i}>
                {columns.map(col => (
                  <td key={col.key} style={{ padding: '13px 16px', borderBottom: `1px solid ${BORDER_SUBTLE}` }}>
                    <Skeleton height="14px" width={col.width || '80%'} />
                  </td>
                ))}
              </tr>
            ))
          ) : displayRows.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                <EmptyState
                  icon={empty?.icon || Inbox}
                  headline={empty?.headline || 'Nothing here yet'}
                  description={empty?.description}
                  action={empty?.action}
                />
              </td>
            </tr>
          ) : (
            displayRows.map(row => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className="ui-table-row"
                style={{ cursor: onRowClick ? 'pointer' : 'default', transition: 'background-color 0.1s ease' }}
              >
                {columns.map(col => (
                  <td key={col.key} style={{ padding: '13px 16px', borderBottom: `1px solid ${BORDER_SUBTLE}`, color: TEXT_PRIMARY }}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      <style>{`.ui-table-row:hover { background: ${BG_RAISED}; }`}</style>
    </div>
  )
}
