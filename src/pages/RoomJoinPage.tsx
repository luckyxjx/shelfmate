import { useParams, useNavigate } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import { useRoomByInviteCode, useJoinRoom } from '../hooks/useRooms'

export default function RoomJoinPage() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: profile } = useProfile(user?.id)
  const { data: room, isLoading, error } = useRoomByInviteCode(code)
  const joinRoom = useJoinRoom()

  const handleJoin = async (option: 'own' | 'library' | 'skip') => {
    if (!user || !room) {
      navigate(`/auth?redirect=/join/${code}`)
      return
    }
    if (option === 'skip') {
      navigate('/')
      return
    }
    await joinRoom.mutateAsync({ roomId: room.id, userId: user.id })
    navigate(`/read/${room.book_id}?room=${room.id}`)
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', background: 'var(--cream-100)' }}>
        <p style={{ color: 'var(--ink-400)', fontSize: '14px' }}>Loading invite…</p>
      </div>
    )
  }

  if (error || !room) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', background: 'var(--cream-100)', gap: '16px' }}>
        <p style={{ fontSize: '16px', fontWeight: 500, color: 'var(--ink-700)' }}>Invite not found</p>
        <p style={{ fontSize: '13px', color: 'var(--ink-400)' }}>This link may have expired or been removed.</p>
        <button className="btn btn-secondary" onClick={() => navigate('/')}>Go home</button>
      </div>
    )
  }

  const inviterUsername = '...' // Will be resolved from room.owner_id in a real profile lookup
  const seatsLeft = room.member_limit - (room.mode === 'duo' ? 1 : 5) // Placeholder

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--cream-100)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div className="card animate-scale-in" style={{ maxWidth: '680px', width: '100%', padding: '40px', display: 'grid', gridTemplateColumns: '220px 1fr', gap: '40px' }}>
        {/* Book cover */}
        <div style={{
          background: 'var(--cream-200)',
          borderRadius: 'var(--radius-md)',
          aspectRatio: '2/3',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid var(--ink-100)',
          padding: '20px',
          gap: '12px',
        }}>
          <BookOpen size={36} style={{ color: 'var(--ink-300)' }} strokeWidth={1} />
          <span style={{ fontWeight: 700, fontSize: '13px', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-700)' }}>
            {room.book?.title}
          </span>
          {room.book?.author && (
            <span style={{ fontSize: '11px', color: 'var(--ink-400)' }}>{room.book.author}</span>
          )}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div className="avatar avatar-sm" style={{ background: 'var(--cream-300)' }}>
                {profile?.username?.slice(0, 1).toUpperCase() ?? '?'}
              </div>
              <h1 style={{ fontSize: '20px', fontWeight: 700 }}>
                {inviterUsername} invited you to read
              </h1>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--ink-500)' }}>
              {room.book?.title} · {room.mode} · {seatsLeft < room.member_limit ? `${seatsLeft} of ${room.member_limit} seats taken` : 'full'}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              className="btn btn-primary"
              style={{ justifyContent: 'flex-start', flexDirection: 'column', alignItems: 'flex-start', padding: '14px 18px', gap: '2px' }}
              onClick={() => handleJoin('own')}
              disabled={joinRoom.isPending}
            >
              <span style={{ fontWeight: 600 }}>I have this book</span>
              <span style={{ fontSize: '12px', opacity: 0.7, fontWeight: 400 }}>load my own copy — only your reading position syncs</span>
            </button>

            <button
              className="btn btn-secondary"
              style={{ justifyContent: 'flex-start', flexDirection: 'column', alignItems: 'flex-start', padding: '14px 18px', gap: '2px' }}
              onClick={() => handleJoin('library')}
              disabled={joinRoom.isPending}
            >
              <span style={{ fontWeight: 600 }}>Read from the Shelfmate library</span>
              <span style={{ fontSize: '12px', color: 'var(--ink-400)', fontWeight: 400 }}>available — public domain</span>
            </button>

            <button
              className="btn btn-ghost"
              style={{ color: 'var(--ink-500)', padding: '12px 18px' }}
              onClick={() => handleJoin('skip')}
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
