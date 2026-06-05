-- Chess Tutor v2 analysis cache

alter table public.games
  add column if not exists analysis_status text not null default 'pending'
    check (analysis_status in ('pending', 'analyzing', 'completed', 'failed')),
  add column if not exists analysis_error text,
  add column if not exists analysis_completed_at timestamptz;

create table if not exists public.move_analyses (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games (id) on delete cascade,
  position_id uuid not null references public.positions (id) on delete cascade,
  ply integer not null,
  fen_before text not null,
  fen_after text not null,
  move_played_san text,
  move_played_uci text,
  user_color text check (user_color in ('white', 'black')),
  side_to_move text not null check (side_to_move in ('white', 'black')),
  eval_before numeric,
  eval_after numeric,
  eval_swing numeric,
  best_move_san text,
  best_move_uci text,
  engine_line jsonb not null default '[]'::jsonb,
  candidate_moves jsonb not null default '[]'::jsonb,
  mistake_severity text not null default 'none'
    check (mistake_severity in ('none', 'inaccuracy', 'mistake', 'blunder')),
  mistake_tags text[] not null default '{}',
  is_critical boolean not null default false,
  created_at timestamptz not null default now(),
  unique (game_id, position_id)
);

create table if not exists public.coach_explanations (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games (id) on delete cascade,
  position_id uuid references public.positions (id) on delete cascade,
  explanation_type text not null
    check (
      explanation_type in (
        'explain_move',
        'hint',
        'better_idea',
        'quiz',
        'engine_move',
        'reflection'
      )
    ),
  help_mode text not null check (help_mode in ('hint', 'guide', 'answer')),
  user_reflection_hash text,
  coach_response text not null,
  board_annotations jsonb not null default '{}'::jsonb,
  model_provider text,
  model_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.game_recaps (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null unique references public.games (id) on delete cascade,
  summary jsonb not null default '{}'::jsonb,
  model_provider text,
  model_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.user_mistake_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  player_key text,
  mistake_tag text not null,
  count integer not null default 0,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists move_analyses_game_position_idx
  on public.move_analyses (game_id, position_id);

create index if not exists move_analyses_game_ply_idx
  on public.move_analyses (game_id, ply);

create index if not exists coach_explanations_game_position_idx
  on public.coach_explanations (game_id, position_id, explanation_type, help_mode);

create unique index if not exists coach_explanations_cache_key_idx
  on public.coach_explanations (
    game_id,
    coalesce(position_id::text, ''),
    explanation_type,
    help_mode,
    coalesce(user_reflection_hash, '')
  );

create unique index if not exists user_mistake_stats_subject_tag_idx
  on public.user_mistake_stats (
    coalesce(user_id::text, ''),
    coalesce(player_key, ''),
    mistake_tag
  );

alter table public.move_analyses enable row level security;
alter table public.coach_explanations enable row level security;
alter table public.game_recaps enable row level security;
alter table public.user_mistake_stats enable row level security;

create policy "move_analyses_select" on public.move_analyses for select using (true);
create policy "move_analyses_insert" on public.move_analyses for insert with check (true);
create policy "move_analyses_update" on public.move_analyses for update using (true);
create policy "move_analyses_delete" on public.move_analyses for delete using (true);

create policy "coach_explanations_select" on public.coach_explanations for select using (true);
create policy "coach_explanations_insert" on public.coach_explanations for insert with check (true);
create policy "coach_explanations_update" on public.coach_explanations for update using (true);

create policy "game_recaps_select" on public.game_recaps for select using (true);
create policy "game_recaps_insert" on public.game_recaps for insert with check (true);
create policy "game_recaps_update" on public.game_recaps for update using (true);

create policy "user_mistake_stats_select" on public.user_mistake_stats for select using (true);
create policy "user_mistake_stats_insert" on public.user_mistake_stats for insert with check (true);
create policy "user_mistake_stats_update" on public.user_mistake_stats for update using (true);
