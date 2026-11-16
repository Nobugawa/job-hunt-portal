-- v1.5.7: "My rating" — Philos's own 1–5 ratings per role (separate from computed fit_score).
-- Own table (like user_notes) so sync.py / tracker sync never writes or clears it.
create table if not exists public.role_ratings (
  application_id text primary key references public.applications(id) on delete cascade,
  enjoyment smallint check (enjoyment between 1 and 5),
  culture   smallint check (culture between 1 and 5),
  people    smallint check (people between 1 and 5),
  growth    smallint check (growth between 1 and 5),
  mission   smallint check (mission between 1 and 5),
  overall_manual numeric(2,1) check (overall_manual between 1 and 5),  -- null = use average of sub-ratings
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now());
alter table public.role_ratings enable row level security;
revoke all on public.role_ratings from anon;
grant select, insert, update, delete on public.role_ratings to authenticated;
drop policy if exists "owner read" on public.role_ratings;
create policy "owner read" on public.role_ratings for select to authenticated
  using ((auth.jwt() ->> 'email') = 'philoskim990@gmail.com');
drop policy if exists "owner insert" on public.role_ratings;
create policy "owner insert" on public.role_ratings for insert to authenticated
  with check ((auth.jwt() ->> 'email') = 'philoskim990@gmail.com');
drop policy if exists "owner update" on public.role_ratings;
create policy "owner update" on public.role_ratings for update to authenticated
  using ((auth.jwt() ->> 'email') = 'philoskim990@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'philoskim990@gmail.com');
drop policy if exists "owner delete" on public.role_ratings;
create policy "owner delete" on public.role_ratings for delete to authenticated
  using ((auth.jwt() ->> 'email') = 'philoskim990@gmail.com');
create or replace function public.role_ratings_touch() returns trigger language plpgsql set search_path = '' as $$
begin new.created_at := old.created_at; new.updated_at := now(); return new; end $$;
drop trigger if exists role_ratings_touch on public.role_ratings;
create trigger role_ratings_touch before update on public.role_ratings for each row execute function public.role_ratings_touch();
