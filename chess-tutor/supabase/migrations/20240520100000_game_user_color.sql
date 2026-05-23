-- Store which color the importing player had in each game

alter table public.games
  add column if not exists player_username text,
  add column if not exists user_color text check (
    user_color is null or user_color in ('white', 'black')
  );
