import { useState, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useProfile, useUpdateProfile, useUploadAvatar } from '../hooks/useProfile'
import { useAllProgress } from '../hooks/useProgress'
import { useBooks } from '../hooks/useBooks'
import { useRooms } from '../hooks/useRooms'
import { Camera, Edit2, Check, X } from 'lucide-react'

export default function ProfilePage() {
  const { user } = useAuth()
  const { data: profile } = useProfile(user?.id)
  const { data: books = [] } = useBooks(user?.id)
  const { data: rooms = [] } = useRooms(user?.id)
  const { data: allProgress = [] } = useAllProgress(user?.id)
  const updateProfile = useUpdateProfile()
  const uploadAvatar = useUploadAvatar()
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const [editing, setEditing] = useState(false)
  const [editBio, setEditBio] = useState(profile?.bio ?? '')

  const totalPages = allProgress.reduce((sum, p) => sum + p.page, 0)

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    await uploadAvatar.mutateAsync({ userId: user.id, file })
  }

  const handleSaveBio = async () => {
    if (!user) return
    await updateProfile.mutateAsync({ id: user.id, bio: editBio })
    setEditing(false)
  }

  const initials = profile?.username?.slice(0, 2).toUpperCase() ?? '?'

  // Simple "reading streak" placeholder (7 days of data)
  const streakDays = Array.from({ length: 14 }, (_, i) => i < 12)

  return (
    <div className="animate-fade-in">
      {/* Back nav */}
      <div style={{ marginBottom: '24px', fontSize: '13px', color: 'var(--ink-400)', cursor: 'pointer' }}
        onClick={() => history.back()}>
        ‹ my space
      </div>

      {/* Profile header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', marginBottom: '32px' }}>
        {/* Avatar */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div className="avatar avatar-xl" style={{
            border: '3px solid var(--cream-300)',
            fontSize: '28px',
          }}>
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt={profile.username} />
              : initials}
          </div>
          <button
            onClick={() => avatarInputRef.current?.click()}
            style={{
              position: 'absolute',
              bottom: 0, right: 0,
              width: '26px', height: '26px',
              borderRadius: '50%',
              background: 'var(--ink-900)',
              border: '2px solid var(--cream-50)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Camera size={12} color="white" />
          </button>
          <input ref={avatarInputRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
        </div>

        {/* Name + bio */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 700 }}>{profile?.username}</h1>
            <span style={{ fontSize: '13px', color: 'var(--ink-400)' }}>
              @{profile?.username} · reading since {
                profile?.reading_since
                  ? new Date(profile.reading_since).toLocaleDateString('en', { month: 'short', year: 'numeric' })
                  : '…'
              }
            </span>
          </div>

          {editing ? (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px' }}>
              <input
                className="input"
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="A short bio…"
                style={{ fontSize: '14px' }}
              />
              <button className="btn btn-primary btn-sm" onClick={handleSaveBio}>
                <Check size={13} />
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => setEditing(false)}>
                <X size={13} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
              <p style={{ fontSize: '14px', color: 'var(--ink-600)', fontStyle: profile?.bio ? 'normal' : 'italic' }}>
                {profile?.bio ?? 'No bio yet.'}
              </p>
              <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(true); setEditBio(profile?.bio ?? '') }}>
                <Edit2 size={12} />
              </button>
            </div>
          )}
        </div>

        <button className="btn btn-secondary btn-sm">edit layout</button>
      </div>

      {/* Widget grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '12px' }}>
        {/* Currently reading */}
        <div className="card-dashed" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--ink-400)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            currently reading
          </span>
          {books[0] ? (
            <>
              <div style={{ background: 'var(--cream-200)', borderRadius: 'var(--radius-md)', aspectRatio: '2/3', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--ink-100)' }}>
                <span style={{ fontSize: '11px', color: 'var(--ink-400)' }}>cover</span>
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink-900)' }}>{books[0].title}</div>
                <div className="progress-bar" style={{ marginTop: '6px' }}>
                  <div className="progress-fill" style={{ width: books[0].page_count ? `${((books[0].progress?.page ?? 0) / books[0].page_count) * 100}%` : '0%' }} />
                </div>
                <div style={{ fontSize: '11px', color: 'var(--ink-400)', marginTop: '4px' }}>
                  p.{books[0].progress?.page ?? 0} / {books[0].page_count ?? '?'}
                </div>
              </div>
            </>
          ) : (
            <div style={{ fontSize: '13px', color: 'var(--ink-400)', textAlign: 'center', padding: '24px 0' }}>
              Nothing yet
            </div>
          )}
        </div>

        {/* Right column widgets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Reading streak */}
          <div className="card-dashed" style={{ padding: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 500, color: 'var(--ink-400)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' }}>reading streak</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '24px', fontWeight: 700 }}>12 days</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {streakDays.map((active, i) => (
                  <div key={i} style={{ width: '20px', height: '20px', borderRadius: '4px', background: active ? 'var(--ink-900)' : 'var(--ink-100)' }} />
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {/* Pages this week */}
            <div className="card-dashed" style={{ padding: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 500, color: 'var(--ink-400)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' }}>pages this week</div>
              <div style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>{totalPages > 0 ? totalPages : 218}</div>
              {/* Bar chart placeholder */}
              <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', height: '40px' }}>
                {[0.3, 0.5, 0.4, 0.6, 0.9, 1, 0.7].map((h, i) => (
                  <div key={i} style={{ flex: 1, borderRadius: '3px 3px 0 0', height: `${h * 100}%`, background: i === 5 ? 'var(--ink-900)' : 'var(--ink-200)' }} />
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                {['M','T','W','T','F','S','S'].map((d, i) => (
                  <span key={i} style={{ fontSize: '10px', color: 'var(--ink-400)', flex: 1, textAlign: 'center' }}>{d}</span>
                ))}
              </div>
            </div>

            {/* Shared books */}
            <div className="card-dashed" style={{ padding: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 500, color: 'var(--ink-400)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' }}>shared books</div>
              <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
                {rooms.length} with friends
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {Array.from({ length: Math.min(rooms.length || 3, 4) }).map((_, i) => (
                  <div key={i} className="avatar avatar-sm" />
                ))}
              </div>
            </div>
          </div>

          {/* Favourite genres */}
          <div className="card-dashed" style={{ padding: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 500, color: 'var(--ink-400)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '10px' }}>favorite genres</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {(profile?.favorite_genres?.length ? profile.favorite_genres : ['mystery', 'slice of life', 'sci-fi']).map((g) => (
                <span key={g} className="badge badge-mode">{g}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
