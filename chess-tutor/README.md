# Chess Tutor

Import chess games, step through moves, and analyze positions with Stockfish.

## Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS 4
- Supabase (Postgres)
- chess.js + react-chessboard
- Stockfish (`@se-oss/stockfish`)

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Run the SQL migrations in the SQL editor (in order):
   - `supabase/migrations/20240520000000_initial.sql`
   - `supabase/migrations/20240520100000_game_user_color.sql`
   - `supabase/migrations/20260526211000_analysis_v2.sql`
3. Copy `.env.local.example` to `.env.local` and add your project URL and anon key.

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/import` | PGN paste + Chess.com import |
| `/games` | Imported games list |
| `/games/[gameId]` | Board, move list, Stockfish eval bar, engine lines |

## API

- `POST /api/games` — parse PGN, store game + positions, run Stockfish analysis
- `GET /api/games` — list games
- `GET/PATCH /api/games/[gameId]` — game detail / set user color
- `POST /api/eval` — live Stockfish eval for a FEN
- `GET /api/chesscom/archives?username=` — Chess.com archive URLs
- `GET /api/chesscom/games?archiveUrl=` — games for a month

## Deploy

Deploy to Vercel (or similar). Set the same Supabase env vars in the hosting dashboard.
