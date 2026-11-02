import { useState, useCallback } from 'react'
import { Heart, Star, StickyNote, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Book, Profile, RoomWithBook } from '../../types/database'
import { useProgressSaver } from '../../hooks/useProgress'
import { useRealtime } from '../../hooks/useRealtime'
import TwoPageReader, { ScrollReader, MangaReader } from './TwoPageReader'
import PresenceTray from '../presence/PresenceTray'

type ReaderMode = 'two-page' | 'scroll' | 'manga'

interface Props {
  book: Book
  userId: string
  profile: Profile
  room: RoomWithBook | null
  initialPage: number
}

export default function ReaderShell({ book, userId, profile, room, initialPage }: Props) {
  const [page, setPage] = useState(initialPage)
  const [mode, setMode] = useState<ReaderMode>(room?.reader_mode ?? 'scroll')
  const [showTray, setShowTray] = useState(false)
  const { savePage } = useProgressSaver(userId, book.id)

  // Always call hooks unconditionally (Rules of Hooks)
  const { onlineMembers, broadcastPageMove, broadcastReaction: _broadcastReaction } = useRealtime({
    roomId: room?.id ?? '',
    userId,
    username: profile.username,
    avatarUrl: profile.avatar_url,
    bookId: book.id,
    enabled: !!room,
  })

  const handlePageChange = useCallback((newPage: number) => {
    const clamped = Math.max(1, Math.min(book.page_count ?? 9999, newPage))
    setPage(clamped)
    savePage(clamped)
    if (room) broadcastPageMove(clamped)
  }, [book.page_count, savePage, room, broadcastPageMove])

  const readerProps = {
    book,
    page,
    onPageChange: handlePageChange,
  }


  return (
    <div style={{
      display: 'flex',
      height: 'calc(100dvh - 56px - 41px)', // subtract app topbar + reader topbar
      background: 'var(--cream-100)',
      position: 'relative',
    }}>
      {/* Main reading area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Mode toggle (manga only) */}
        {book.kind === 'manga' && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '10px',
            borderBottom: '1px solid var(--ink-100)',
            gap: '2px',
          }}>
            {(['two-page', 'scroll'] as ReaderMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  padding: '6px 16px',
                  borderRadius: '99px',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-ui)',
                  fontSize: '13px',
                  fontWeight: 500,
                  background: mode === m ? 'var(--ink-900)' : 'transparent',
                  color: mode === m ? 'var(--cream-50)' : 'var(--ink-500)',
                  transition: 'all 0.15s',
                }}
              >
                {m}
              </button>
            ))}
          </div>
        )}

        {/* Reader content */}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          {mode === 'scroll' && <ScrollReader {...readerProps} />}
          {mode === 'two-page' && <TwoPageReader {...readerProps} />}
          {mode === 'manga' && <MangaReader {...readerProps} />}

          {/* Online member badges on page */}
          {onlineMembers
            .filter((m) => m.user_id !== userId)
            .slice(0, 3)
            .map((m, i) => (
              <div
                key={m.user_id}
                style={{
                  position: 'absolute',
                  top: `${16 + i * 32}px`,
                  right: '16px',
                  zIndex: 10,
                }}
              >
                <span className="badge badge-presence" style={{ fontSize: '11px' }}>
                  {m.username} · p.?
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Right sidebar — React/Note/Mark + page counter */}
      <div style={{
        width: '120px',
        background: 'var(--cream-200)',
        borderLeft: '1px solid var(--ink-100)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '16px 10px',
        gap: '10px',
        flexShrink: 0,
      }}>
        {/* Action buttons */}
        {[
          { icon: <Heart size={15} />, label: 'React' },
          { icon: <StickyNote size={15} />, label: 'Note' },
          { icon: <Star size={15} />, label: 'Mark' },
        ].map(({ icon, label }) => (
          <button
            key={label}
            className="btn btn-secondary"
            style={{ width: '100%', flexDirection: 'column', gap: '4px', padding: '10px 6px', fontSize: '11px' }}
          >
            {icon}
            {label}
          </button>
        ))}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Page counter — tap to open tray */}
        <button
          onClick={() => setShowTray(true)}
          style={{
            width: '100%',
            padding: '10px',
            background: 'var(--cream-50)',
            border: '1.5px solid var(--ink-200)',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-ui)',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--ink-900)',
            cursor: 'pointer',
            textAlign: 'center',
          }}
        >
          p. {page} / {book.page_count ?? '?'}
        </button>
      </div>

      {/* Nav arrows (two-page and manga) */}
      {(mode === 'two-page' || mode === 'manga') && (
        <>
          <button
            onClick={() => handlePageChange(page - (mode === 'two-page' ? 2 : 1))}
            style={{
              position: 'absolute',
              left: '12px',
              bottom: '24px',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'var(--cream-50)',
              border: '1.5px solid var(--ink-100)',
              boxShadow: 'var(--shadow-sm)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
            }}
            disabled={page <= 1}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => handlePageChange(page + (mode === 'two-page' ? 2 : 1))}
            style={{
              position: 'absolute',
              right: '132px',
              bottom: '24px',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'var(--cream-50)',
              border: '1.5px solid var(--ink-100)',
              boxShadow: 'var(--shadow-sm)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
            }}
            disabled={book.page_count ? page >= book.page_count : false}
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}

      {/* Presence tray (slide-up) */}
      {showTray && room && (
        <PresenceTray
          roomId={room.id}
          bookId={book.id}
          currentPage={page}
          userId={userId}
          onlineMembers={onlineMembers}
          onJumpTo={(p) => { handlePageChange(p); setShowTray(false) }}
          onClose={() => setShowTray(false)}
        />
      )}
    </div>
  )
}
