-- v1.3.0: Communications log (run once in Supabase SQL Editor)
create table if not exists communications (
  id text primary key, date date, application_id text references applications(id) on delete set null,
  company text, kind text, summary text, full_text text,
  created_at timestamptz default now(), updated_at timestamptz default now());
alter table communications enable row level security;
revoke all on communications from anon;
grant select on communications to authenticated;
drop policy if exists "auth read" on communications;
create policy "auth read" on communications for select to authenticated using ((auth.jwt() ->> 'email') = 'philoskim990@gmail.com');
