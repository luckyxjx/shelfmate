import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import AuthPage from './pages/AuthPage'
import LibraryPage from './pages/LibraryPage'
import ProfilePage from './pages/ProfilePage'
import ReaderPage from './pages/ReaderPage'
import RoomCreatePage from './pages/RoomCreatePage'
import RoomJoinPage from './pages/RoomJoinPage'
import AppShell from './components/layout/AppShell'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center min-h-dvh" style={{ background: 'var(--cream-100)' }}>
    <div className="animate-fade-in" style={{ color: 'var(--ink-500)', fontSize: '14px' }}>Loading…</div>
  </div>
  if (!user) return <Navigate to="/auth" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/join/:code" element={<RoomJoinPage />} />

        {/* Protected */}
        <Route path="/" element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }>
          <Route index element={<LibraryPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="read/:bookId" element={<ReaderPage />} />
          <Route path="room/new/:bookId" element={<RoomCreatePage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
