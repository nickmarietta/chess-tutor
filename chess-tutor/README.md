# Chess Tutor

AI-guided chess analysis: import games, review positions on a board, reflect on your thinking, and get coaching feedback.

## Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS 4
- Supabase (Postgres)
- chess.js + react-chessboard

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Run the SQL in `supabase/migrations/20240520000000_initial.sql` in the SQL editor (or use `supabase db push` with the CLI).
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
| `/import` | PGN paste + Chess.com PubAPI import |
| `/games` | Imported games list |
| `/games/[gameId]` | Review board, moves, reflections, coaching |

## API

- `POST /api/games` — parse PGN, store game + positions
- `GET /api/games` — list games
- `GET /api/games/[gameId]` — game detail
- `POST /api/coach` — save reflection + placeholder coach response
- `GET /api/chesscom/archives?username=` — Chess.com archive URLs
- `GET /api/chesscom/games?archiveUrl=` — games for a month

## Coaching (v1)

Coaching uses `lib/coach/generateResponse.ts` — replace with an LLM call when ready. Hint mode avoids naming the best move.

## Deploy

Deploy to Vercel (or similar). Set the same Supabase env vars in the hosting dashboard.

## Out of scope (v1)

- Live multiplayer / human coaching
- Voice input
- Lichess integration
- Chess.com scraping (PubAPI only)
