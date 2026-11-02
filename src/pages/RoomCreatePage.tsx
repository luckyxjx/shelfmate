import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Copy, Check, ArrowLeft, Minus, Plus } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useBook } from '../hooks/useBooks'
import { useCreateRoom } from '../hooks/useRooms'
import { generateInviteCode, copyToClipboard } from '../lib/utils'

type RoomMode = 'duo' | 'club' | 'community'
type ReaderMode = 'two-page' | 'scroll' | 'manga'

export default function RoomCreatePage() {
  const { bookId } = useParams<{ bookId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: book } = useBook(bookId)
  const createRoom = useCreateRoom()

  const [selectedMode, setSelectedMode] = useState<RoomMode>('club')
  const [memberLimit, setMemberLimit] = useState(6)
  const [readerMode, setReaderMode] = useState<ReaderMode>('scroll')
  const [inviteCode] = useState(() => generateInviteCode())
  const [copied, setCopied] = useState(false)
  const [createdRoomId, setCreatedRoomId] = useState<string | null>(null)

  const inviteLink = `${window.location.origin}/join/${inviteCode}`

  const handleCopy = async () => {
    await copyToClipboard(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCreate = async () => {
    if (!user || !bookId) return
    const room = await createRoom.mutateAsync({
      bookId,
      ownerId: user.id,
      mode: selectedMode,
      memberLimit: selectedMode === 'duo' ? 2 : selectedMode === 'community' ? 1000 : memberLimit,
      readerMode,
      inviteCode,
    })
    setCreatedRoomId(room.id)
  }

  const modes: { id: RoomMode; label: string; sub: string; note: string }[] = [
    { id: 'duo', label: 'duo', sub: '1 : 1 · just one friend', note: 'invites 1 friend' },
    { id: 'club', label: 'club', sub: 'up to N · you set the limit', note: 'set a member limit' },
    { id: 'community', label: 'community', sub: 'everyone · read-only', note: 'public-domain books only' },
  ]

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '28px' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
          <ArrowLeft size={14} /> Back
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '8px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Read together</h1>
        {book && <span style={{ fontSize: '15px', color: 'var(--ink-500)' }}>{book.title}</span>}
      </div>
      <p style={{ fontSize: '13px', color: 'var(--ink-400)', marginBottom: '32px' }}>
        Choose a room type, then share the invite link.
      </p>

      {/* Mode selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '32px' }}>
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelectedMode(m.id)}
            style={{
              background: selectedMode === m.id ? 'var(--ink-900)' : 'var(--cream-50)',
              color: selectedMode === m.id ? 'var(--cream-50)' : 'var(--ink-900)',
              border: `1.5px solid ${selectedMode === m.id ? 'var(--ink-900)' : 'var(--ink-100)'}`,
              borderRadius: 'var(--radius-lg)',
              padding: '20px 16px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontFamily: 'var(--font-ui)',
            }}
          >
            <span style={{ fontSize: '16px', fontWeight: 700 }}>{m.label}</span>
            <span style={{ fontSize: '12px', opacity: 0.7 }}>{m.sub}</span>
            {/* Visual dots */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', margin: '8px 0' }}>
              {m.id === 'duo' && (
                <>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: selectedMode === m.id ? 'rgba(255,255,255,0.3)' : 'var(--cream-300)' }} />
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: selectedMode === m.id ? 'rgba(255,255,255,0.15)' : 'var(--ink-100)' }} />
                </>
              )}
              {m.id === 'club' && Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ width: '18px', height: '18px', borderRadius: '50%', background: selectedMode === m.id ? (i === 2 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)') : (i === 2 ? 'var(--ink-200)' : 'var(--ink-100)') }} />
              ))}
              {m.id === 'community' && Array.from({ length: 9 }).map((_, i) => (
                <div key={i} style={{ width: '14px', height: '14px', borderRadius: '50%', background: selectedMode === m.id ? (i === 0 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.25)') : (i === 0 ? 'var(--ink-300)' : 'var(--ink-100)') }} />
              ))}
            </div>
            <span style={{ fontSize: '11px', opacity: 0.6 }}>{m.note}</span>
          </button>
        ))}
      </div>

      {/* Club member limit */}
      {selectedMode === 'club' && (
        <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          <span style={{ fontSize: '14px', color: 'var(--ink-600)', flex: 1 }}>Member limit</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setMemberLimit(Math.max(2, memberLimit - 1))}>
              <Minus size={13} />
            </button>
            <span style={{ fontSize: '16px', fontWeight: 600, minWidth: '24px', textAlign: 'center' }}>{memberLimit}</span>
            <button className="btn btn-secondary btn-sm" onClick={() => setMemberLimit(Math.min(50, memberLimit + 1))}>
              <Plus size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Reader mode */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <span style={{ fontSize: '14px', color: 'var(--ink-600)', flex: 1 }}>Reader mode</span>
        <div style={{ display: 'flex', gap: '6px' }}>
          {(['scroll', 'two-page', 'manga'] as ReaderMode[]).map((rm) => (
            <button
              key={rm}
              onClick={() => setReaderMode(rm)}
              className="btn btn-sm"
              style={{
                background: readerMode === rm ? 'var(--ink-900)' : 'transparent',
                color: readerMode === rm ? 'var(--cream-50)' : 'var(--ink-500)',
                border: `1px solid ${readerMode === rm ? 'var(--ink-900)' : 'var(--ink-100)'}`,
              }}
            >
              {rm}
            </button>
          ))}
        </div>
      </div>

      {/* Invite link */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ fontSize: '12px', color: 'var(--ink-400)', marginBottom: '8px', fontWeight: 500 }}>Invite link</div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            className="input"
            value={inviteLink}
            readOnly
            style={{ fontSize: '13px', background: 'var(--cream-200)', flex: 1 }}
          />
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleCopy}
            style={{ flexShrink: 0, gap: '6px' }}
          >
            {copied ? <Check size={13} style={{ color: 'var(--accent)' }} /> : <Copy size={13} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '10px' }}>
        {!createdRoomId ? (
          <button
            className="btn btn-primary btn-lg"
            onClick={handleCreate}
            disabled={createRoom.isPending}
            style={{ flex: 1 }}
          >
            {createRoom.isPending ? 'Creating…' : 'Create room & copy link'}
          </button>
        ) : (
          <button
            className="btn btn-accent btn-lg"
            onClick={() => navigate(`/read/${bookId}?room=${createdRoomId}`)}
            style={{ flex: 1 }}
          >
            Start reading →
          </button>
        )}
      </div>
    </div>
  )
}
