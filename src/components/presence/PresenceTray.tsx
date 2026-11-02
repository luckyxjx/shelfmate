import { X } from 'lucide-react'
import { useRoomMembers } from '../../hooks/useRooms'
import type { PresencePayload } from '../../types/database'
import { initials } from '../../lib/utils'

interface Props {
  roomId: string
  bookId?: string
  currentPage: number
  userId: string
  onlineMembers: PresencePayload[]
  onJumpTo: (page: number) => void
  onClose: () => void
}

export default function PresenceTray({ roomId, bookId: _bookId, currentPage, userId, onlineMembers, onJumpTo, onClose }: Props) {
  const { data: members = [] } = useRoomMembers(roomId)

  const maxPage = Math.max(...members.map((m) => m.progress?.page ?? 0), currentPage, 1)

  const furthestMember = members
    .filter((m) => m.user_id !== userId)
    .sort((a, b) => (b.progress?.page ?? 0) - (a.progress?.page ?? 0))[0]

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="card animate-slide-up" style={{
        maxWidth: '520px',
        width: '100%',
        padding: '24px',
        position: 'absolute',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600 }}>
            reading together · club
          </h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={15} /></button>
        </div>

        {/* Member list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
          {members.map((member) => {
            const memberPage = member.user_id === userId ? currentPage : (member.progress?.page ?? 0)
            const pct = maxPage > 0 ? (memberPage / maxPage) * 100 : 0
            const isOnline = onlineMembers.some((m) => m.user_id === member.user_id)
            const isYou = member.user_id === userId

            return (
              <div key={member.user_id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Avatar */}
                <div className="avatar avatar-sm" style={{
                  background: isOnline ? 'var(--ink-900)' : 'var(--cream-300)',
                  color: isOnline ? 'var(--cream-50)' : 'var(--ink-500)',
                  flexShrink: 0,
                }}>
                  {member.profile?.avatar_url
                    ? <img src={member.profile.avatar_url} alt={member.profile.username} />
                    : initials(member.profile?.username ?? '?')
                  }
                </div>

                {/* Name + scrubber */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: isYou ? 'var(--ink-900)' : 'var(--ink-700)' }}>
                      {isYou ? 'you' : member.profile?.username}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--ink-400)', fontWeight: 500 }}>
                      p.{memberPage}
                    </span>
                  </div>
                  {/* Track bar */}
                  <div style={{ height: '4px', background: 'var(--ink-100)', borderRadius: '99px', position: 'relative' }}>
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      height: '100%',
                      width: `${pct}%`,
                      background: 'transparent',
                    }} />
                    <div style={{
                      position: 'absolute',
                      left: `${pct}%`,
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: isYou ? 'var(--ink-900)' : 'var(--ink-300)',
                      border: '2px solid var(--cream-50)',
                      boxShadow: 'var(--shadow-xs)',
                    }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Actions */}
        {furthestMember && furthestMember.progress?.page !== undefined && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={() => onJumpTo(furthestMember.progress!.page)}
            >
              jump to {furthestMember.profile?.username}
            </button>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
              stay here
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
