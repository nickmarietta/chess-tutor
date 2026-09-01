-- games had RLS enabled with only SELECT and INSERT policies, so every
-- UPDATE (e.g. analysis_status/analysis_error/analysis_completed_at writes
-- in updateGameAnalysisState) was silently blocked: Postgres RLS rejects
-- the write, but Supabase's client reports no error for zero rows affected,
-- so games stayed stuck at analysis_status = 'pending' forever.

create policy "games_update" on public.games for update using (true) with check (true);
