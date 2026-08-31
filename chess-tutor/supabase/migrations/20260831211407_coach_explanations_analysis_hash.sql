-- Adds analysis_hash to coach_explanations so cached tutor output can be
-- invalidated whenever re-analysis changes the underlying engine facts,
-- without tracking a separate analysis-pipeline version number.

alter table public.coach_explanations
  add column if not exists analysis_hash text;

drop index if exists coach_explanations_cache_key_idx;

create unique index coach_explanations_cache_key_idx
  on public.coach_explanations (
    game_id,
    coalesce(position_id::text, ''),
    explanation_type,
    help_mode,
    coalesce(user_reflection_hash, ''),
    coalesce(analysis_hash, '')
  );
