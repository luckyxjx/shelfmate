import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRef, useCallback, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { mockStore, MOCK_USER } from '../lib/mockData'
import type { ReadingProgress } from '../types/database'
import { debounce } from '../lib/utils'

export function useProgress(userId: string | undefined, bookId: string | undefined) {
  return useQuery({
    queryKey: ['progress', userId, bookId],
    queryFn: async () => {
      if (!userId || !bookId) return null
      if (!isSupabaseConfigured || userId === MOCK_USER.id) {
        return mockStore.getProgress(bookId)
      }
      const { data, error } = await supabase
        .from('reading_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('book_id', bookId)
        .maybeSingle()
      if (error) return mockStore.getProgress(bookId)
      return data as ReadingProgress | null
    },
    enabled: !!userId && !!bookId,
  })
}

export function useAllProgress(userId: string | undefined) {
  return useQuery({
    queryKey: ['progress-all', userId],
    queryFn: async () => {
      if (!userId) return []
      if (!isSupabaseConfigured || userId === MOCK_USER.id) {
        return mockStore.getBooks().map((b) => b.progress).filter(Boolean) as ReadingProgress[]
      }
      const { data, error } = await supabase
        .from('reading_progress')
        .select('*')
        .eq('user_id', userId)
      if (error) {
        return mockStore.getBooks().map((b) => b.progress).filter(Boolean) as ReadingProgress[]
      }
      return (data ?? []) as ReadingProgress[]
    },
    enabled: !!userId,
  })
}

/** Returns a stable save function that debounces DB writes and forces one on unmount */
export function useProgressSaver(userId: string | undefined, bookId: string | undefined) {
  const qc = useQueryClient()
  const latestPage = useRef<number>(1)

  const persist = useCallback(async (page: number) => {
    if (!userId || !bookId) return
    if (!isSupabaseConfigured || userId === MOCK_USER.id) {
      const prog = mockStore.updateProgress(bookId, page)
      qc.setQueryData(['progress', userId, bookId], prog)
      return
    }

    try {
      await supabase.from('reading_progress').upsert(
        { user_id: userId, book_id: bookId, page, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,book_id' }
      )
      qc.setQueryData(['progress', userId, bookId], (old: ReadingProgress | null) =>
        old ? { ...old, page, updated_at: new Date().toISOString() } : null
      )
    } catch {
      mockStore.updateProgress(bookId, page)
    }
  }, [userId, bookId, qc])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSave = useCallback(debounce((page: number) => persist(page), 3000), [persist])

  const savePage = useCallback((page: number) => {
    latestPage.current = page
    debouncedSave(page)
  }, [debouncedSave])

  // Force-save on unmount / tab close
  useEffect(() => {
    const flush = () => persist(latestPage.current)
    window.addEventListener('beforeunload', flush)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flush()
    })
    return () => {
      flush()
      window.removeEventListener('beforeunload', flush)
    }
  }, [persist])

  return { savePage }
}

export function useSaveProgress() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, bookId, page }: { userId: string; bookId: string; page: number }) => {
      if (!isSupabaseConfigured || userId === MOCK_USER.id) {
        return mockStore.updateProgress(bookId, page)
      }
      const { data, error } = await supabase
        .from('reading_progress')
        .upsert(
          { user_id: userId, book_id: bookId, page, updated_at: new Date().toISOString() },
          { onConflict: 'user_id,book_id' }
        )
        .select()
        .single()
      if (error) throw error
      return data as ReadingProgress
    },
    onSuccess: (data) => {
      qc.setQueryData(['progress', data.user_id, data.book_id], data)
    },
  })
}
