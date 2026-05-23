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
2. Run both SQL files in the SQL editor (in order):
   - `supabase/migrations/20240520000000_initial.sql`
   - `supabase/migrations/20240520100000_game_user_color.sql`
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

## Coaching

Prompt content lives in **`lib/coach/prompt.ts`** (provider-neutral). Model transport lives in **`lib/coach/providers/`**.

```env
COACH_PROVIDER=ollama              # or openrouter | gemini | mock
COACH_MODEL=llama3.2                 # must match a model you've pulled locally
OLLAMA_BASE_URL=http://127.0.0.1:11434
```

**Local setup:** install [Ollama](https://ollama.com), run `ollama serve`, then `ollama pull llama3.2` (or whatever you set in `COACH_MODEL`). Use `ollama list` to see available models.

To add another provider: implement `CoachProvider` in a new file under `providers/`, add a case in `providers/index.ts`. Do not change `prompt.ts`.

Hint mode rules are enforced in the system prompt — not in provider code.

### Explain move (v1)

- `POST /api/explain` — structured explanation + board annotations
- Annotations (squares, arrows, variation) are built from **chess.js + game positions**, not LLM output
- Mock engine in `lib/engine/mockEngine.ts` — swap for Stockfish later

## Deploy

Deploy to Vercel (or similar). Set the same Supabase env vars in the hosting dashboard.

## Out of scope (v1)

- Live multiplayer / human coaching
- Voice input
- Lichess integration
- Chess.com scraping (PubAPI only)
