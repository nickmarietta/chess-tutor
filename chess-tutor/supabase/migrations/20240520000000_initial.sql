-- Chess Tutor v1 schema

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  source text not null default 'pgn_paste',
  source_game_id text,
  white_player text,
  black_player text,
  result text,
  played_at timestamptz,
  raw_pgn text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.positions (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games (id) on delete cascade,
  ply integer not null,
  fen text not null,
  move_san text,
  created_at timestamptz not null default now(),
  unique (game_id, ply)
);

create table if not exists public.reflections (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games (id) on delete cascade,
  position_id uuid not null references public.positions (id) on delete cascade,
  user_text text not null,
  help_mode text not null check (help_mode in ('hint', 'guide', 'answer')),
  coach_response text,
  created_at timestamptz not null default now()
);

create index if not exists positions_game_id_idx on public.positions (game_id);
create index if not exists reflections_game_position_idx on public.reflections (game_id, position_id);

alter table public.games enable row level security;
alter table public.positions enable row level security;
alter table public.reflections enable row level security;

-- v1: open policies (add auth-scoped policies when auth ships)
create policy "games_select" on public.games for select using (true);
create policy "games_insert" on public.games for insert with check (true);

create policy "positions_select" on public.positions for select using (true);
create policy "positions_insert" on public.positions for insert with check (true);

create policy "reflections_select" on public.reflections for select using (true);
create policy "reflections_insert" on public.reflections for insert with check (true);
create policy "reflections_update" on public.reflections for update using (true);
