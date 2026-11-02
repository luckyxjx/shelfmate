import { useEffect, useRef, useState, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { queryClient } from '../lib/queryClient'
import { throttle } from '../lib/utils'
import type {
  PresencePayload,
  PageMovePayload,
  ReactionBroadcastPayload,
  MemberWithProfile,
} from '../types/database'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface UseRealtimeOptions {
  roomId: string
  userId: string
  username: string
  avatarUrl: string | null
  bookId: string
  enabled?: boolean
  onPageMove?: (payload: PageMovePayload) => void
  onReaction?: (payload: ReactionBroadcastPayload) => void
}

export function useRealtime({
  roomId,
  userId,
  username,
  avatarUrl,
  bookId,
  enabled = true,
  onPageMove,
  onReaction,
}: UseRealtimeOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null)
  const [onlineMembers, setOnlineMembers] = useState<PresencePayload[]>([])

  useEffect(() => {
    if (!enabled || !roomId) return

    // Offline / Demo simulation
    if (!isSupabaseConfigured || roomId.startsWith('room-')) {
      const demoPresence: PresencePayload[] = [
        {
          user_id: userId,
          username,
          avatar_url: avatarUrl ?? null,
          online_at: new Date().toISOString(),
        },
        {
          user_id: 'user-elena',
          username: 'Elena Rostova',
          avatar_url: null,
          online_at: new Date().toISOString(),
        },
      ]
      setOnlineMembers(demoPresence)
      return
    }

    const channel = supabase.channel(`room:${roomId}`, {
      config: { presence: { key: userId } },
    })

    // ── Presence ────────────────────────────────────────────────────
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState<PresencePayload>()
      const members = Object.values(state).flat()
      setOnlineMembers(members)
    })

    // ── Broadcast: page moves ────────────────────────────────────────
    channel.on('broadcast', { event: 'page-move' }, ({ payload }: { payload: PageMovePayload }) => {
      onPageMove?.(payload)
      // Update TanStack Query cache for room members' progress
      queryClient.setQueryData(
        ['room-members', roomId],
        (old: MemberWithProfile[] | undefined) => {
          if (!old) return old
          return old.map((m) =>
            m.user_id === payload.user_id
              ? {
                  ...m,
                  progress: m.progress
                    ? { ...m.progress, page: payload.page }
                    : { id: '', user_id: payload.user_id, book_id: bookId, page: payload.page, updated_at: new Date().toISOString() },
                }
              : m
          )
        }
      )
    })

    // ── Broadcast: reactions ─────────────────────────────────────────
    channel.on('broadcast', { event: 'reaction' }, ({ payload }: { payload: ReactionBroadcastPayload }) => {
      onReaction?.(payload)
      queryClient.invalidateQueries({ queryKey: ['reactions', roomId] })
    })

    // ── Subscribe and track presence ──────────────────────────────────
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        channel.track({
          user_id: userId,
          username,
          avatar_url: avatarUrl,
          online_at: new Date().toISOString(),
        })
      }
    })

    channelRef.current = channel

    return () => {
      channel.unsubscribe()
      channelRef.current = null
    }
  }, [enabled, roomId, userId, username, avatarUrl, bookId, onPageMove, onReaction])

  // Throttled page move broadcaster (send at most once every 2s)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const throttledPageMove = useCallback(
    throttle((page: number) => {
      if (!channelRef.current) return
      channelRef.current.send({
        type: 'broadcast',
        event: 'page-move',
        payload: { user_id: userId, page },
      })
    }, 2000),
    [userId]
  )

  const broadcastPageMove = useCallback((page: number) => {
    throttledPageMove(page)
  }, [throttledPageMove])

  const broadcastReaction = useCallback((reaction: ReactionBroadcastPayload['reaction']) => {
    if (!channelRef.current) return
    channelRef.current.send({
      type: 'broadcast',
      event: 'reaction',
      payload: { reaction },
    })
  }, [])

  return { onlineMembers, broadcastPageMove, broadcastReaction }
}
