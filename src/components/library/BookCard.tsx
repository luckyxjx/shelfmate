import { Users } from 'lucide-react'
import type { BookWithProgress, RoomWithBook } from '../../types/database'

interface Props {
  book: BookWithProgress
  isLast: boolean
  rooms: RoomWithBook[]
  onClick: () => void
  onReadTogether: () => void
}

export default function BookCard({ book, isLast, rooms, onClick, onReadTogether }: Props) {
  const progress = book.progress
  const pct = progress && book.page_count
    ? Math.round((progress.page / book.page_count) * 100)
    : 0

  const activeRoom = rooms[0] ?? null

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '16px 20px',
        borderBottom: isLast ? 'none' : '1px solid var(--cream-200)',
        cursor: 'pointer',
        transition: 'background 0.12s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--cream-100)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      onClick={onClick}
    >
      {/* Cover thumbnail */}
      <div style={{
        width: '44px',
        height: '60px',
        borderRadius: 'var(--radius-sm)',
        background: 'var(--cream-200)',
        flexShrink: 0,
        border: '1px solid var(--ink-100)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {book.cover_path
          ? <img src={book.cover_path} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: '10px', color: 'var(--ink-300)' }}>•</span>
        }
      </div>

      {/* Title + progress */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {book.title}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--ink-400)', marginTop: '2px', marginBottom: '8px' }}>
          {progress ? `p.${progress.page} of ${book.page_count ?? '?'}` : `${book.page_count ?? '?'} pages`}
        </div>
        <div className="progress-bar" style={{ width: '160px' }}>
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Reader mode badge */}
      {activeRoom && (
        <span className="badge badge-mode">{activeRoom.reader_mode}</span>
      )}

      {/* Room / friends info */}
      <div style={{ textAlign: 'right', minWidth: '100px' }}>
        {activeRoom ? (
          <>
            <div style={{ fontSize: '13px', color: 'var(--ink-700)', fontWeight: 500 }}>
              {/* Placeholder — real presence from realtime */}
              {activeRoom.mode}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--ink-400)', marginTop: '2px' }}>
              {activeRoom.member_limit} seats
            </div>
          </>
        ) : (
          <button
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '12px', color: 'var(--ink-400)', gap: '4px' }}
            onClick={(e) => { e.stopPropagation(); onReadTogether() }}
          >
            <Users size={12} /> read together
          </button>
        )}
      </div>
    </div>
  )
}
