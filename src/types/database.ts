// ──────────────────────────────────────────────────────────────────────────────
// Shelfmate — Database type definitions
// Run `npx supabase gen types typescript` to regenerate from your live schema.
// ──────────────────────────────────────────────────────────────────────────────

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          avatar_url: string | null
          bio: string | null
          reading_since: string
          favorite_genres: string[] | null
          created_at: string
        }
        Insert: {
          id: string
          username: string
          avatar_url?: string | null
          bio?: string | null
          reading_since?: string
          favorite_genres?: string[] | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
        Relationships: []
      }
      books: {
        Row: {
          id: string
          owner_id: string
          title: string
          author: string | null
          kind: 'book' | 'manga'
          format: 'pdf' | 'cbz'
          storage_path: string
          cover_path: string | null
          page_count: number | null
          created_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          title: string
          author?: string | null
          kind: 'book' | 'manga'
          format: 'pdf' | 'cbz'
          storage_path: string
          cover_path?: string | null
          page_count?: number | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['books']['Insert']>
        Relationships: []
      }
      rooms: {
        Row: {
          id: string
          book_id: string
          owner_id: string
          mode: 'duo' | 'club' | 'community'
          member_limit: number
          invite_code: string
          reader_mode: 'two-page' | 'scroll' | 'manga'
          created_at: string
        }
        Insert: {
          id?: string
          book_id: string
          owner_id: string
          mode?: 'duo' | 'club' | 'community'
          member_limit?: number
          invite_code?: string
          reader_mode?: 'two-page' | 'scroll' | 'manga'
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['rooms']['Insert']>
        Relationships: []
      }
      room_members: {
        Row: {
          id: string
          room_id: string
          user_id: string
          role: 'owner' | 'member'
          joined_at: string
        }
        Insert: {
          id?: string
          room_id: string
          user_id: string
          role?: 'owner' | 'member'
          joined_at?: string
        }
        Update: Partial<Database['public']['Tables']['room_members']['Insert']>
        Relationships: []
      }
      reading_progress: {
        Row: {
          id: string
          user_id: string
          book_id: string
          page: number
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          book_id: string
          page?: number
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['reading_progress']['Insert']>
        Relationships: []
      }
      reactions: {
        Row: {
          id: string
          room_id: string
          user_id: string
          page: number
          kind: 'heart' | 'fire' | 'wow' | 'sad' | 'note'
          text: string | null
          created_at: string
        }
        Insert: {
          id?: string
          room_id: string
          user_id: string
          page: number
          kind: 'heart' | 'fire' | 'wow' | 'sad' | 'note'
          text?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['reactions']['Insert']>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

// ── Convenience row types ─────────────────────────────────────────────────────
export type Profile       = Database['public']['Tables']['profiles']['Row']
export type Book          = Database['public']['Tables']['books']['Row']
export type Room          = Database['public']['Tables']['rooms']['Row']
export type RoomMember    = Database['public']['Tables']['room_members']['Row']
export type ReadingProgress = Database['public']['Tables']['reading_progress']['Row']
export type Reaction      = Database['public']['Tables']['reactions']['Row']

// ── Extended types (with joins) ───────────────────────────────────────────────
export type BookWithProgress = Book & {
  progress?: ReadingProgress | null
}

export type RoomWithBook = Room & {
  book: Book
  member_count?: number
}

export type MemberWithProfile = RoomMember & {
  profile: Profile
  progress?: ReadingProgress | null
}

export type ReactionWithProfile = Reaction & {
  profile: Profile
}

// ── Realtime payloads ─────────────────────────────────────────────────────────
export interface PresencePayload {
  user_id: string
  username: string
  avatar_url: string | null
  online_at: string
}

export interface PageMovePayload {
  user_id: string
  page: number
}

export interface ReactionBroadcastPayload {
  reaction: ReactionWithProfile
}
