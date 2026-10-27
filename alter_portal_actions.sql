-- Portal v1.5.2: bulk action queue from Applications list (Apply / Pass / Package / Hold)
-- Paste into Supabase SQL Editor and Run; safe to re-run.
-- JH1 consumes pending rows (service role updates status); browser only inserts + selects.

create table if not exists portal_actions (
  id uuid primary key default gen_random_uuid(),
  action text not null check (action in ('apply','pass','package','hold')),
  application_ids text[] not null,
  note text,
  status text not null default 'pending' check (status in ('pending','processing','done','cancelled')),
  created_by text,
  created_at timestamptz default now(),
  processed_at timestamptz,
  result text
);

alter table portal_actions add column if not exists created_by text;

alter table portal_actions enable row level security;
revoke all on portal_actions from anon;
grant select, insert on portal_actions to authenticated;
-- Service role bypasses RLS for status updates when JH1 processes the queue.

drop policy if exists "owner read portal_actions" on portal_actions;
create policy "owner read portal_actions" on portal_actions for select to authenticated
  using ((auth.jwt() ->> 'email') = 'philoskim990@gmail.com');

drop policy if exists "owner insert portal_actions" on portal_actions;
create policy "owner insert portal_actions" on portal_actions for insert to authenticated
  with check ((auth.jwt() ->> 'email') = 'philoskim990@gmail.com');
