import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { BookOpen, User, LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useProfile } from '../../hooks/useProfile'

export default function AppShell() {
  const { user, signOut, isDemoMode } = useAuth()
  const { data: profile } = useProfile(user?.id)
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
  }

  const initials = profile?.username
    ? profile.username.slice(0, 2).toUpperCase()
    : '?'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      {isDemoMode && (
        <div style={{
          background: 'var(--cream-200)',
          borderBottom: '1px solid var(--ink-100)',
          padding: '6px 16px',
          fontSize: '12px',
          color: 'var(--ink-600)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          textAlign: 'center',
        }}>
          <span style={{ fontWeight: 600, color: 'var(--accent)' }}>✦ Frontend Preview Mode</span>
          <span>·</span>
          <span>Browsing offline with mock books & rooms. All reader modes and local PDF uploads work!</span>
        </div>
      )}
      {/* Top bar */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        height: '56px',
        background: 'var(--cream-50)',
        borderBottom: '1px solid var(--ink-100)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}>
        {/* Logo */}
        <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <BookOpen size={20} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
          <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--ink-900)' }}>shelfmate</span>
        </NavLink>

        {/* Right side nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <NavLink to="/profile" className={({ isActive }) =>
            `btn btn-ghost ${isActive ? 'text-ink-900' : ''}`
          }>
            <User size={16} />
            <span style={{ fontSize: '13px' }}>{profile?.username ?? 'profile'}</span>
          </NavLink>

          <button
            onClick={handleSignOut}
            className="btn btn-ghost"
            style={{ color: 'var(--ink-500)' }}
            title="Sign out"
          >
            <LogOut size={15} />
          </button>

          <div className="avatar avatar-sm" style={{ marginLeft: '8px', cursor: 'pointer' }}
            onClick={() => navigate('/profile')}>
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt={profile.username} />
              : initials
            }
          </div>
        </nav>
      </header>

      {/* Page content */}
      <main style={{ flex: 1, padding: '32px 24px', maxWidth: '900px', width: '100%', margin: '0 auto' }}>
        <Outlet />
      </main>
    </div>
  )
}
