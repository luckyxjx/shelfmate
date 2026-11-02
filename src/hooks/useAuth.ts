import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { MOCK_USER, mockStore } from '../lib/mockData'

const DEMO_AUTH_KEY = 'shelfmate_demo_auth_active'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Offline / Demo mode: check if logged out, otherwise default to active demo session
      const loggedOut = localStorage.getItem(DEMO_AUTH_KEY) === 'false'
      setUser(loggedOut ? null : (MOCK_USER as unknown as User))
      setLoading(false)
      return
    }

    // Live Supabase mode:
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, username: string) => {
    if (!isSupabaseConfigured) {
      mockStore.updateProfile({ username: username || 'Alex Rivers' })
      localStorage.setItem(DEMO_AUTH_KEY, 'true')
      const demoUser = { ...MOCK_USER, email } as unknown as User
      setUser(demoUser)
      return { user: demoUser }
    }

    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        username,
      })
      if (profileError) throw profileError
    }
    return data
  }

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      localStorage.setItem(DEMO_AUTH_KEY, 'true')
      const demoUser = { ...MOCK_USER, email: email || MOCK_USER.email } as unknown as User
      setUser(demoUser)
      return { user: demoUser }
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  const enterDemo = () => {
    localStorage.setItem(DEMO_AUTH_KEY, 'true')
    setUser(MOCK_USER as unknown as User)
  }

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      localStorage.setItem(DEMO_AUTH_KEY, 'false')
      setUser(null)
      return
    }

    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    enterDemo,
    isDemoMode: !isSupabaseConfigured || user?.id === MOCK_USER.id,
  }
}
