import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, BookOpen, Users } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import { useBooks } from '../hooks/useBooks'
import { useRooms } from '../hooks/useRooms'
import BookCard from '../components/library/BookCard'
import UploadModal from '../components/library/UploadModal'
import type { BookWithProgress } from '../types/database'

export default function LibraryPage() {
  const { user } = useAuth()
  const { data: profile } = useProfile(user?.id)
  const { data: books = [], isLoading } = useBooks(user?.id)
  const { data: rooms = [] } = useRooms(user?.id)
  const [showUpload, setShowUpload] = useState(false)
  const navigate = useNavigate()

  const booksInProgress = books.filter((b) => b.progress && b.progress.page > 1)
  const friendsOnline = 0 // Will be populated by realtime in Phase 4

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: '32px',
      }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700 }}>my space</h1>
          <p style={{ fontSize: '13px', color: 'var(--ink-500)', marginTop: '4px' }}>
            {booksInProgress.length} book{booksInProgress.length !== 1 ? 's' : ''} in progress
            {friendsOnline > 0 && ` · ${friendsOnline} friends online`}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowUpload(true)}
          >
            <Plus size={15} />
            Add book
          </button>
          <div
            className="avatar avatar-md"
            onClick={() => navigate('/profile')}
            style={{ cursor: 'pointer' }}
          >
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt={profile.username} />
              : (profile?.username?.slice(0, 1).toUpperCase() ?? '?')}
          </div>
        </div>
      </div>

      {/* Book list */}
      <div className="card" style={{ padding: '8px 0', marginBottom: '24px' }}>
        {isLoading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--ink-400)', fontSize: '14px' }}>
            Loading your library…
          </div>
        ) : books.length === 0 ? (
          <EmptyLibrary onAdd={() => setShowUpload(true)} />
        ) : (
          books.map((book: BookWithProgress, i: number) => (
            <BookCard
              key={book.id}
              book={book}
              isLast={i === books.length - 1}
              rooms={rooms.filter((r) => r.book_id === book.id)}
              onClick={() => navigate(`/read/${book.id}`)}
              onReadTogether={() => navigate(`/room/new/${book.id}`)}
            />
          ))
        )}

        {/* + read together CTA at bottom */}
        {books.length > 0 && (
          <div
            style={{ padding: '16px 20px', borderTop: '1px solid var(--ink-100)' }}
          >
            <button
              className="btn btn-secondary"
              style={{
                border: '1.5px dashed var(--ink-200)',
                width: '100%',
                justifyContent: 'center',
                gap: '8px',
                color: 'var(--ink-500)',
              }}
              onClick={() => setShowUpload(true)}
            >
              <Plus size={14} />
              add another book
            </button>
          </div>
        )}
      </div>

      {/* Active rooms summary */}
      {rooms.length > 0 && (
        <div>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink-500)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Reading rooms
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {rooms.map((room) => (
              <div
                key={room.id}
                className="card"
                style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                onClick={() => navigate(`/read/${room.book_id}?room=${room.id}`)}
              >
                <Users size={16} style={{ color: 'var(--ink-400)', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--ink-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {room.book?.title}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--ink-400)' }}>{room.mode}</div>
                </div>
                <span className="badge badge-mode">{room.reader_mode}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload modal */}
      {showUpload && (
        <UploadModal
          userId={user!.id}
          onClose={() => setShowUpload(false)}
        />
      )}
    </div>
  )
}

function EmptyLibrary({ onAdd }: { onAdd: () => void }) {
  return (
    <div style={{ padding: '60px 24px', textAlign: 'center' }}>
      <BookOpen size={40} style={{ color: 'var(--ink-200)', margin: '0 auto 16px' }} strokeWidth={1} />
      <p style={{ fontSize: '15px', fontWeight: 500, color: 'var(--ink-700)', marginBottom: '6px' }}>
        Your shelf is empty
      </p>
      <p style={{ fontSize: '13px', color: 'var(--ink-400)', marginBottom: '24px' }}>
        Upload a PDF or CBZ to get started
      </p>
      <button className="btn btn-primary" onClick={onAdd}>
        <Plus size={15} /> Add your first book
      </button>
    </div>
  )
}
