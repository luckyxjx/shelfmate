import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { mockStore, MOCK_USER } from '../lib/mockData'
import type { Book, BookWithProgress } from '../types/database'

export function useBooks(userId: string | undefined) {
  return useQuery({
    queryKey: ['books', userId],
    queryFn: async () => {
      if (!userId) return []
      if (!isSupabaseConfigured || userId === MOCK_USER.id) {
        return mockStore.getBooks()
      }
      const { data, error } = await supabase
        .from('books')
        .select(`
          *,
          progress:reading_progress(page, updated_at)
        `)
        .eq('owner_id', userId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []).map((b: Book & { progress: { page: number; updated_at: string }[] }) => ({
        ...b,
        progress: b.progress?.[0] ?? null,
      })) as BookWithProgress[]
    },
    enabled: !!userId,
  })
}

export function useBook(bookId: string | undefined) {
  return useQuery({
    queryKey: ['book', bookId],
    queryFn: async () => {
      if (!bookId) return null
      if (!isSupabaseConfigured || bookId.startsWith('book-')) {
        const found = mockStore.getBook(bookId)
        if (found) return found
      }
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('id', bookId)
        .single()
      if (error) {
        // Fallback to mock store if database query fails
        const mockFallback = mockStore.getBook(bookId)
        if (mockFallback) return mockFallback
        throw error
      }
      return data as Book
    },
    enabled: !!bookId,
  })
}

export function useUploadBook() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      userId,
      file,
      title,
      author,
      kind,
    }: {
      userId: string
      file: File
      title: string
      author?: string
      kind: 'book' | 'manga'
    }) => {
      const format = file.name.toLowerCase().endsWith('.cbz') ? 'cbz' : 'pdf'
      const bookId = `book-${crypto.randomUUID()}`

      if (!isSupabaseConfigured || userId === MOCK_USER.id) {
        const blobUrl = URL.createObjectURL(file)
        const mockBook: BookWithProgress = {
          id: bookId,
          owner_id: userId,
          title,
          author: author ?? null,
          kind,
          format,
          storage_path: blobUrl,
          cover_path: null,
          page_count: 30, // fallback page count
          created_at: new Date().toISOString(),
          progress: {
            id: `prog-${bookId}`,
            user_id: userId,
            book_id: bookId,
            page: 1,
            updated_at: new Date().toISOString(),
          },
        }
        mockStore.addBook(mockBook, blobUrl)
        return mockBook
      }

      const storagePath = `books/${userId}/${bookId}.${format}`

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from('books')
        .upload(storagePath, file)
      if (uploadError) throw uploadError

      // Create book record
      const { data, error } = await supabase
        .from('books')
        .insert({
          id: bookId,
          owner_id: userId,
          title,
          author: author ?? null,
          kind,
          format,
          storage_path: storagePath,
        })
        .select()
        .single()
      if (error) throw error
      return data as Book
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['books', vars.userId] })
    },
  })
}

export function useDeleteBook() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ bookId, userId }: { bookId: string; userId: string }) => {
      if (!isSupabaseConfigured || userId === MOCK_USER.id) {
        return { bookId, userId }
      }
      const { error } = await supabase.from('books').delete().eq('id', bookId)
      if (error) throw error
      return { bookId, userId }
    },
    onSuccess: ({ userId }) => {
      qc.invalidateQueries({ queryKey: ['books', userId] })
    },
  })
}

/** Get a URL for a book file (supports local blob, bundled sample, or signed Supabase URL) */
export async function getBookSignedUrl(storagePath: string): Promise<string> {
  if (!isSupabaseConfigured || storagePath.startsWith('blob:') || storagePath.startsWith('http') || storagePath.includes('sample-book.pdf')) {
    return mockStore.getBookUrl(storagePath)
  }

  try {
    const { data, error } = await supabase.storage
      .from('books')
      .createSignedUrl(storagePath, 60 * 60) // 1 hour
    if (error) throw error
    return data.signedUrl
  } catch {
    return mockStore.getBookUrl(storagePath)
  }
}
