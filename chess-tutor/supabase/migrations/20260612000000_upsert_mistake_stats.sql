-- Atomic batch upsert for user mistake stats.
-- Uses the expression index user_mistake_stats_subject_tag_idx to resolve conflicts
-- and increments the count rather than replacing it.
create or replace function upsert_mistake_stats(p_stats jsonb)
returns void
language plpgsql
security definer
as $$
declare
  stat jsonb;
begin
  for stat in select * from jsonb_array_elements(p_stats)
  loop
    insert into public.user_mistake_stats (
      user_id,
      player_key,
      mistake_tag,
      count,
      last_seen_at
    )
    values (
      (stat->>'user_id')::uuid,
      stat->>'player_key',
      stat->>'mistake_tag',
      (stat->>'count')::integer,
      (stat->>'last_seen_at')::timestamptz
    )
    on conflict (
      coalesce(user_id::text, ''),
      coalesce(player_key, ''),
      mistake_tag
    )
    do update set
      count        = public.user_mistake_stats.count + excluded.count,
      last_seen_at = excluded.last_seen_at,
      updated_at   = now();
  end loop;
end;
$$;
