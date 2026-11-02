import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { mockStore, MOCK_USER } from '../lib/mockData'
import type { RoomWithBook, MemberWithProfile } from '../types/database'

export function useRooms(userId: string | undefined) {
  return useQuery({
    queryKey: ['rooms', userId],
    queryFn: async () => {
      if (!userId) return []
      if (!isSupabaseConfigured || userId === MOCK_USER.id) {
        return mockStore.getRooms()
      }
      const { data, error } = await supabase
        .from('room_members')
        .select(`
          room:rooms(
            *,
            book:books(*)
          )
        `)
        .eq('user_id', userId)
      if (error) return mockStore.getRooms()
      return ((data as unknown as Array<{ room: RoomWithBook }>) ?? [])
        .map((d) => d.room)
        .filter(Boolean)
    },
    enabled: !!userId,
  })
}

export function useRoom(roomId: string | undefined) {
  return useQuery({
    queryKey: ['room', roomId],
    queryFn: async () => {
      if (!roomId) return null
      if (!isSupabaseConfigured || roomId.startsWith('room-')) {
        const found = mockStore.getRoom(roomId)
        if (found) return found
      }
      const { data, error } = await supabase
        .from('rooms')
        .select('*, book:books(*)')
        .eq('id', roomId)
        .single()
      if (error) {
        const fallback = mockStore.getRoom(roomId)
        if (fallback) return fallback
        throw error
      }
      return data as RoomWithBook
    },
    enabled: !!roomId,
  })
}

export function useRoomByInviteCode(code: string | undefined) {
  return useQuery({
    queryKey: ['room-invite', code],
    queryFn: async () => {
      if (!code) return null
      if (!isSupabaseConfigured) {
        return mockStore.getRoomByInvite(code) ?? null
      }
      const { data, error } = await supabase
        .from('rooms')
        .select('*, book:books(*)')
        .eq('invite_code', code)
        .single()
      if (error) {
        return mockStore.getRoomByInvite(code) ?? null
      }
      return data as RoomWithBook
    },
    enabled: !!code,
  })
}

export function useRoomMembers(roomId: string | undefined) {
  return useQuery({
    queryKey: ['room-members', roomId],
    queryFn: async () => {
      if (!roomId) return []
      if (!isSupabaseConfigured || roomId.startsWith('room-')) {
        return mockStore.getRoomMembers(roomId)
      }
      const { data, error } = await supabase
        .from('room_members')
        .select(`
          *,
          profile:profiles(*),
          progress:reading_progress(page, updated_at)
        `)
        .eq('room_id', roomId)
      if (error) return mockStore.getRoomMembers(roomId)
      return ((data as unknown as any[]) ?? []).map((m) => ({
        ...m,
        progress: Array.isArray(m.progress) ? (m.progress[0] ?? null) : m.progress,
      })) as MemberWithProfile[]
    },
    enabled: !!roomId,
  })
}

export function useCreateRoom() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      bookId,
      ownerId,
      mode,
      memberLimit,
      readerMode,
      inviteCode,
    }: {
      bookId: string
      ownerId: string
      mode: 'duo' | 'club' | 'community'
      memberLimit: number
      readerMode: 'two-page' | 'scroll' | 'manga'
      inviteCode: string
    }) => {
      if (!isSupabaseConfigured || ownerId === MOCK_USER.id) {
        const book = mockStore.getBook(bookId)
        if (!book) throw new Error('Book not found')
        const newRoom: RoomWithBook = {
          id: `room-${crypto.randomUUID().slice(0, 8)}`,
          book_id: bookId,
          owner_id: ownerId,
          mode,
          member_limit: memberLimit,
          reader_mode: readerMode,
          invite_code: inviteCode,
          created_at: new Date().toISOString(),
          member_count: 1,
          book,
        }
        mockStore.addRoom(newRoom)
        return newRoom
      }

      const { data: rawRoom, error: roomError } = await supabase
        .from('rooms')
        .insert({
          book_id: bookId,
          owner_id: ownerId,
          mode,
          member_limit: memberLimit,
          reader_mode: readerMode,
          invite_code: inviteCode,
        })
        .select('*, book:books(*)')
        .single()
      if (roomError) throw roomError
      const room = rawRoom as unknown as RoomWithBook

      // Add owner as member
      const { error: memberError } = await supabase
        .from('room_members')
        .insert({ room_id: room.id, user_id: ownerId, role: 'owner' })
      if (memberError) throw memberError

      return room
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['rooms', vars.ownerId] })
    },
  })
}

export function useJoinRoom() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ roomId, userId }: { roomId: string; userId: string }) => {
      if (!isSupabaseConfigured || userId === MOCK_USER.id) {
        return { roomId, userId }
      }
      const { error } = await supabase
        .from('room_members')
        .insert({ room_id: roomId, user_id: userId, role: 'member' })
      if (error) throw error
      return { roomId, userId }
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['room-members', vars.roomId] })
      qc.invalidateQueries({ queryKey: ['rooms', vars.userId] })
    },
  })
}
