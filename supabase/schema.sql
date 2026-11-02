-- ==============================================================================
-- Shelfmate — Database Schema & Row Level Security (RLS) Setup
-- Run this in the Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- 1. PROFILES TABLE
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique not null,
  avatar_url text,
  bio text,
  reading_since timestamptz default now(),
  favorite_genres text[],
  created_at timestamptz default now()
);

-- 2. BOOKS TABLE
create table if not exists books (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  author text,
  kind text check (kind in ('book', 'manga')) not null,
  format text check (format in ('pdf', 'cbz')) not null,
  storage_path text not null,
  cover_path text,
  page_count integer,
  created_at timestamptz default now()
);

-- 3. ROOMS TABLE
create table if not exists rooms (
  id uuid primary key default gen_random_uuid(),
  book_id uuid references books(id) on delete cascade not null,
  owner_id uuid references profiles(id) on delete cascade not null,
  mode text check (mode in ('duo', 'club', 'community')) not null default 'club',
  member_limit integer default 6,
  invite_code text unique not null default left(md5(random()::text), 8),
  reader_mode text check (reader_mode in ('two-page', 'scroll', 'manga')) default 'scroll',
  created_at timestamptz default now()
);

-- 4. ROOM MEMBERS TABLE
create table if not exists room_members (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references rooms(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  role text check (role in ('owner', 'member')) default 'member',
  joined_at timestamptz default now(),
  unique (room_id, user_id)
);

-- 5. READING PROGRESS TABLE
create table if not exists reading_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  book_id uuid references books(id) on delete cascade not null,
  page integer not null default 1,
  updated_at timestamptz default now(),
  unique (user_id, book_id)
);

-- 6. REACTIONS TABLE
create table if not exists reactions (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references rooms(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  page integer not null,
  kind text check (kind in ('heart', 'fire', 'wow', 'sad', 'note')) not null,
  text text,
  created_at timestamptz default now()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Profiles RLS
alter table profiles enable row level security;
drop policy if exists "public read" on profiles;
create policy "public read" on profiles for select using (true);
drop policy if exists "own write" on profiles;
create policy "own write" on profiles for all using (auth.uid() = id);

-- Books RLS
alter table books enable row level security;
drop policy if exists "owner access" on books;
create policy "owner access" on books for all using (auth.uid() = owner_id);

-- Rooms RLS
alter table rooms enable row level security;
drop policy if exists "member read" on rooms;
create policy "member read" on rooms for select using (
  exists (select 1 from room_members where room_id = id and user_id = auth.uid())
  or owner_id = auth.uid()
);
drop policy if exists "owner write" on rooms;
create policy "owner write" on rooms for all using (auth.uid() = owner_id);

-- Room Members RLS
alter table room_members enable row level security;
drop policy if exists "member read" on room_members;
create policy "member read" on room_members for select using (
  user_id = auth.uid() or
  exists (select 1 from room_members rm where rm.room_id = room_id and rm.user_id = auth.uid())
);
drop policy if exists "self join" on room_members;
create policy "self join" on room_members for insert with check (user_id = auth.uid());
drop policy if exists "owner remove" on room_members;
create policy "owner remove" on room_members for delete using (
  user_id = auth.uid() or
  exists (select 1 from rooms where id = room_id and owner_id = auth.uid())
);

-- Reading Progress RLS
alter table reading_progress enable row level security;
drop policy if exists "own write" on reading_progress;
create policy "own write" on reading_progress for all using (auth.uid() = user_id);
drop policy if exists "room members read" on reading_progress;
create policy "room members read" on reading_progress for select using (
  user_id = auth.uid() or
  exists (
    select 1 from room_members rm
    join rooms r on r.id = rm.room_id
    where rm.user_id = auth.uid()
    and r.book_id = book_id
  )
);

-- Reactions RLS (Spoiler-gated read)
alter table reactions enable row level security;
drop policy if exists "spoiler gated read" on reactions;
create policy "spoiler gated read" on reactions for select using (
  exists (
    select 1 from room_members rm
    join reading_progress rp on rp.user_id = rm.user_id and rp.book_id = (
      select book_id from rooms where id = room_id
    )
    where rm.room_id = reactions.room_id
      and rm.user_id = auth.uid()
      and rp.page >= reactions.page
  )
);
drop policy if exists "member write" on reactions;
create policy "member write" on reactions for insert with check (
  auth.uid() = user_id and
  exists (select 1 from room_members where room_id = reactions.room_id and user_id = auth.uid())
);

-- ==============================================================================
-- STORAGE BUCKETS
-- You can create these in the Supabase Dashboard -> Storage
-- 1. 'books' (private bucket) - stores uploaded PDF/CBZ files
-- 2. 'public' (public bucket) - stores profile avatars
-- ==============================================================================
