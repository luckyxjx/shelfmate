import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

type Mode = 'signin' | 'signup'

export default function AuthPage() {
  const { signIn, signUp, enterDemo } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'signup') {
        if (username.length < 3) throw new Error('Username must be at least 3 characters.')
        await signUp(email, password, username.toLowerCase().trim())
      } else {
        await signIn(email, password)
      }
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--cream-100)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div className="animate-scale-in" style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            background: 'var(--ink-900)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '16px',
          }}>
            <BookOpen size={26} color="var(--cream-50)" strokeWidth={1.5} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--ink-900)' }}>shelfmate</h1>
          <p style={{ fontSize: '14px', color: 'var(--ink-500)', marginTop: '4px' }}>
            {mode === 'signin' ? 'Welcome back' : 'Start your reading journey'}
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '32px' }}>
          {/* Tab switcher */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: 'var(--cream-200)',
            borderRadius: 'var(--radius-md)',
            padding: '3px',
            marginBottom: '28px',
          }}>
            {(['signin', 'signup'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError('') }}
                style={{
                  padding: '8px',
                  borderRadius: 'calc(var(--radius-md) - 2px)',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-ui)',
                  fontSize: '13px',
                  fontWeight: 500,
                  transition: 'all 0.15s',
                  background: mode === m ? 'var(--cream-50)' : 'transparent',
                  color: mode === m ? 'var(--ink-900)' : 'var(--ink-500)',
                  boxShadow: mode === m ? 'var(--shadow-xs)' : 'none',
                }}
              >
                {m === 'signin' ? 'Sign in' : 'Sign up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {mode === 'signup' && (
              <div>
                <label className="label" htmlFor="username">Username</label>
                <input
                  id="username"
                  className="input"
                  type="text"
                  placeholder="your_username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  minLength={3}
                  maxLength={30}
                />
              </div>
            )}

            <div>
              <label className="label" htmlFor="email">Email</label>
              <input
                id="email"
                className="input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="label" htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  className="input"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  minLength={8}
                  style={{ paddingRight: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--ink-400)',
                    display: 'flex',
                    padding: '4px',
                  }}
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                padding: '10px 14px',
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                color: '#DC2626',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
              style={{ marginTop: '4px', padding: '12px' }}
            >
              {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          {/* Guest / Demo Mode Quick Access */}
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--ink-100)', textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => {
                enterDemo()
                navigate('/')
              }}
              className="btn btn-secondary btn-full"
              style={{
                background: 'var(--cream-100)',
                color: 'var(--ink-800)',
                fontWeight: 600,
                fontSize: '13px',
                padding: '11px',
                justifyContent: 'center',
              }}
            >
              ⚡ Explore Demo Mode (No backend setup required)
            </button>
            <p style={{ fontSize: '11px', color: 'var(--ink-400)', marginTop: '8px' }}>
              Preview all screens, books, rooms & reader immediately
            </p>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--ink-400)', marginTop: '20px' }}>
          By continuing, you agree to keep rooms private and respect copyright. 📚
        </p>
      </div>
    </div>
  )
}
