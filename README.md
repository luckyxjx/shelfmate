# Shelfmate

Shelfmate is a shared reading web application where you can upload and read books or manga in your preferred mode (two-page, scroll, manga) alongside friends in real-time rooms.

---

## Getting Started Locally

### 1. Navigate to the project directory

```bash
cd shelfmate
```

### 2. Install dependencies (if not already installed)

```bash
npm install
```

### 3. Set up environment variables

Copy the `.env.example` file to `.env.local`:

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in your Supabase project credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Set up Supabase Database & Storage

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard) and open the **SQL Editor**.
2. Run the SQL script located in `supabase/schema.sql` to create all required tables and Row Level Security (RLS) policies.
3. In the **Storage** section of your Supabase project, create two buckets:
   - `books` (private): for PDF and CBZ book uploads
   - `public` (public): for profile avatars
4. In **Project Settings -> API -> Realtime**, ensure Realtime is enabled.

### 5. Start the development server

```bash
npm run dev
```

The app will start at `http://localhost:5173`.

---

## Available Scripts

- `npm run dev`: Starts the Vite development server
- `npm run build`: Type-checks with TypeScript and compiles the production bundle
- `npm run preview`: Previews the production build locally