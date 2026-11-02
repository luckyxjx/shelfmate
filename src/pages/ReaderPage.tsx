import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Users } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useBook } from '../hooks/useBooks'
import { useProfile } from '../hooks/useProfile'
import { useProgress } from '../hooks/useProgress'
import { useRoom } from '../hooks/useRooms'
import ReaderShell from '../components/reader/ReaderShell'

export default function ReaderPage() {
  const { bookId } = useParams<{ bookId: string }>()
  const [searchParams] = useSearchParams()
  const roomId = searchParams.get('room') ?? undefined
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: book, isLoading: bookLoading } = useBook(bookId)
  const { data: profile } = useProfile(user?.id)
  const { data: progress } = useProgress(user?.id, bookId)
  const { data: room } = useRoom(roomId)

  if (bookLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <p style={{ color: 'var(--ink-400)', fontSize: '14px' }}>Opening book…</p>
      </div>
    )
  }

  if (!book || !user || !profile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
        <p style={{ color: 'var(--ink-400)' }}>Book not found.</p>
        <button className="btn btn-secondary" onClick={() => navigate('/')}>← Back</button>
      </div>
    )
  }

  return (
    <div style={{ margin: '-32px -24px' /* bleed to edge of AppShell padding */ }}>
      {/* Thin reader top bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 20px',
        background: 'var(--cream-50)',
        borderBottom: '1px solid var(--ink-100)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>
            <ArrowLeft size={14} /> Library
          </button>
          <div style={{ width: '1px', height: '16px', background: 'var(--ink-100)' }} />
          <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--ink-700)' }}>
            {book.title}
          </span>
          {book.author && (
            <span style={{ fontSize: '13px', color: 'var(--ink-400)' }}>by {book.author}</span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {room ? (
            <span className="badge badge-presence" style={{ gap: '6px' }}>
              <div className="online-dot" style={{ width: '6px', height: '6px' }} />
              {room.mode}
            </span>
          ) : (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigate(`/room/new/${bookId}`)}
              style={{ gap: '6px' }}
            >
              <Users size={13} /> Read together
            </button>
          )}
        </div>
      </div>

      {/* Main reader */}
      <ReaderShell
        book={book}
        userId={user.id}
        profile={profile}
        room={room ?? null}
        initialPage={progress?.page ?? 1}
      />
    </div>
  )
}
