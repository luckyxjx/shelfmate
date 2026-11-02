import type {
  Book,
  BookWithProgress,
  MemberWithProfile,
  Profile,
  ReadingProgress,
  RoomWithBook,
} from '../types/database'

// ── In-memory/localStorage mock store for seamless offline/frontend-only usage ──

export const MOCK_USER = {
  id: 'demo-user-1',
  email: 'alex.rivers@shelfmate.demo',
  user_metadata: { username: 'Alex Rivers' },
  app_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
}

const DEFAULT_PROFILE: Profile = {
  id: 'demo-user-1',
  username: 'Alex Rivers',
  avatar_url: null,
  bio: 'Devouring sci-fi epics and shonen manga. Always reading with coffee nearby.',
  reading_since: '2024-01-15T00:00:00.000Z',
  favorite_genres: ['Sci-Fi', 'Manga', 'Philosophy', 'Fiction'],
  created_at: '2024-01-15T00:00:00.000Z',
}

const DEFAULT_BOOKS: BookWithProgress[] = [
  {
    id: 'book-dune',
    owner_id: 'demo-user-1',
    title: 'Dune',
    author: 'Frank Herbert',
    kind: 'book',
    format: 'pdf',
    storage_path: 'sample-book.pdf',
    cover_path: null,
    page_count: 30,
    created_at: '2024-02-01T12:00:00.000Z',
    progress: {
      id: 'prog-1',
      user_id: 'demo-user-1',
      book_id: 'book-dune',
      page: 12,
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: 'book-csm',
    owner_id: 'demo-user-1',
    title: 'Chainsaw Man, Vol. 1',
    author: 'Tatsuki Fujimoto',
    kind: 'manga',
    format: 'pdf',
    storage_path: 'sample-book.pdf',
    cover_path: null,
    page_count: 30,
    created_at: '2024-02-10T12:00:00.000Z',
    progress: {
      id: 'prog-2',
      user_id: 'demo-user-1',
      book_id: 'book-csm',
      page: 8,
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: 'book-habits',
    owner_id: 'demo-user-1',
    title: 'Atomic Habits',
    author: 'James Clear',
    kind: 'book',
    format: 'pdf',
    storage_path: 'sample-book.pdf',
    cover_path: null,
    page_count: 30,
    created_at: '2024-03-01T12:00:00.000Z',
    progress: {
      id: 'prog-3',
      user_id: 'demo-user-1',
      book_id: 'book-habits',
      page: 18,
      updated_at: new Date().toISOString(),
    },
  },
]

const DEFAULT_ROOMS: RoomWithBook[] = [
  {
    id: 'room-dune-duo',
    book_id: 'book-dune',
    owner_id: 'demo-user-1',
    mode: 'duo',
    member_limit: 2,
    invite_code: 'DUNE2026',
    reader_mode: 'scroll',
    created_at: '2024-02-05T12:00:00.000Z',
    member_count: 2,
    book: DEFAULT_BOOKS[0],
  },
  {
    id: 'room-csm-club',
    book_id: 'book-csm',
    owner_id: 'demo-user-1',
    mode: 'club',
    member_limit: 6,
    invite_code: 'CHAINSAW',
    reader_mode: 'manga',
    created_at: '2024-02-12T12:00:00.000Z',
    member_count: 4,
    book: DEFAULT_BOOKS[1],
  },
]

const DEFAULT_ROOM_MEMBERS: Record<string, MemberWithProfile[]> = {
  'room-dune-duo': [
    {
      id: 'mem-1',
      room_id: 'room-dune-duo',
      user_id: 'demo-user-1',
      role: 'owner',
      joined_at: '2024-02-05T12:00:00.000Z',
      profile: DEFAULT_PROFILE,
      progress: { id: 'p1', user_id: 'demo-user-1', book_id: 'book-dune', page: 12, updated_at: new Date().toISOString() },
    },
    {
      id: 'mem-2',
      room_id: 'room-dune-duo',
      user_id: 'user-elena',
      role: 'member',
      joined_at: '2024-02-05T13:00:00.000Z',
      profile: {
        id: 'user-elena',
        username: 'Elena Rostova',
        avatar_url: null,
        bio: 'Sci-fi reader & tea lover',
        reading_since: '2023-11-01',
        favorite_genres: ['Sci-Fi', 'Classics'],
        created_at: '2023-11-01',
      },
      progress: { id: 'p2', user_id: 'user-elena', book_id: 'book-dune', page: 16, updated_at: new Date().toISOString() },
    },
  ],
  'room-csm-club': [
    {
      id: 'mem-10',
      room_id: 'room-csm-club',
      user_id: 'demo-user-1',
      role: 'owner',
      joined_at: '2024-02-12T12:00:00.000Z',
      profile: DEFAULT_PROFILE,
      progress: { id: 'p10', user_id: 'demo-user-1', book_id: 'book-csm', page: 8, updated_at: new Date().toISOString() },
    },
    {
      id: 'mem-11',
      room_id: 'room-csm-club',
      user_id: 'user-kenji',
      role: 'member',
      joined_at: '2024-02-12T14:00:00.000Z',
      profile: {
        id: 'user-kenji',
        username: 'Kenji Sato',
        avatar_url: null,
        bio: 'Manga collector & reviewer',
        reading_since: '2023-08-01',
        favorite_genres: ['Manga', 'Action'],
        created_at: '2023-08-01',
      },
      progress: { id: 'p11', user_id: 'user-kenji', book_id: 'book-csm', page: 14, updated_at: new Date().toISOString() },
    },
    {
      id: 'mem-12',
      room_id: 'room-csm-club',
      user_id: 'user-maya',
      role: 'member',
      joined_at: '2024-02-12T15:00:00.000Z',
      profile: {
        id: 'user-maya',
        username: 'Maya Lin',
        avatar_url: null,
        bio: 'Anime & manga illustrator',
        reading_since: '2024-01-01',
        favorite_genres: ['Manga', 'Fantasy'],
        created_at: '2024-01-01',
      },
      progress: { id: 'p12', user_id: 'user-maya', book_id: 'book-csm', page: 11, updated_at: new Date().toISOString() },
    },
  ],
}

// In-memory blob storage for user-uploaded books during demo sessions
const uploadedBlobs = new Map<string, string>()

// ── Storage helpers ──

function loadStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`shelfmate_mock_${key}`)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function saveStored<T>(key: string, data: T) {
  try {
    localStorage.setItem(`shelfmate_mock_${key}`, JSON.stringify(data))
  } catch {
    // Ignore storage quota
  }
}

export const mockStore = {
  getProfile(): Profile {
    return loadStored('profile', DEFAULT_PROFILE)
  },
  updateProfile(update: Partial<Profile>): Profile {
    const current = this.getProfile()
    const updated = { ...current, ...update }
    saveStored('profile', updated)
    return updated
  },
  getBooks(): BookWithProgress[] {
    return loadStored('books', DEFAULT_BOOKS)
  },
  getBook(id: string): Book | undefined {
    return this.getBooks().find((b) => b.id === id)
  },
  addBook(book: BookWithProgress, blobUrl?: string): BookWithProgress {
    const books = this.getBooks()
    const updated = [book, ...books]
    saveStored('books', updated)
    if (blobUrl) {
      uploadedBlobs.set(book.storage_path, blobUrl)
    }
    return book
  },
  updateProgress(bookId: string, page: number): ReadingProgress {
    const books = this.getBooks()
    const book = books.find((b) => b.id === bookId)
    const prog: ReadingProgress = {
      id: `prog-${bookId}`,
      user_id: 'demo-user-1',
      book_id: bookId,
      page,
      updated_at: new Date().toISOString(),
    }
    if (book) {
      book.progress = prog
      saveStored('books', books)
    }
    return prog
  },
  getProgress(bookId: string): ReadingProgress | null {
    const book = this.getBook(bookId) as BookWithProgress | undefined
    return book?.progress ?? null
  },
  getRooms(): RoomWithBook[] {
    return loadStored('rooms', DEFAULT_ROOMS)
  },
  getRoom(id: string): RoomWithBook | undefined {
    return this.getRooms().find((r) => r.id === id)
  },
  getRoomByInvite(code: string): RoomWithBook | undefined {
    return this.getRooms().find((r) => r.invite_code.toUpperCase() === code.toUpperCase())
  },
  addRoom(room: RoomWithBook): RoomWithBook {
    const rooms = this.getRooms()
    const updated = [room, ...rooms]
    saveStored('rooms', updated)
    return room
  },
  getRoomMembers(roomId: string): MemberWithProfile[] {
    const all = loadStored('room_members', DEFAULT_ROOM_MEMBERS)
    return all[roomId] ?? [
      {
        id: `mem-${roomId}-self`,
        room_id: roomId,
        user_id: 'demo-user-1',
        role: 'owner',
        joined_at: new Date().toISOString(),
        profile: this.getProfile(),
        progress: null,
      },
    ]
  },
  getBookUrl(storagePath: string): string {
    // 1. User uploaded in-memory blob
    if (uploadedBlobs.has(storagePath)) {
      return uploadedBlobs.get(storagePath)!
    }
    // 2. Direct blob or http URL
    if (storagePath.startsWith('blob:') || storagePath.startsWith('http')) {
      return storagePath
    }
    // 3. Fallback to bundled sample book
    return '/sample-book.pdf'
  },
}
