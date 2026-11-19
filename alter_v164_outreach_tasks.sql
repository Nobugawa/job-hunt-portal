-- v1.6.4: "Outreach tasks" — InMail + connection-request drafts in one place so they don't fall by the wayside.
-- Own table (like application_questions) so sync.py never writes or clears it.
-- Assistant adds/revises tasks with the service role; Philos can update status from the portal.
create table if not exists public.outreach_tasks (
  id uuid primary key default gen_random_uuid(),
  jh_id text not null references public.applications(id) on delete cascade,
  company text,
  person_name text,
  person_title text,
  linkedin_url text,
  channel text not null default 'LinkedIn InMail + connection request',
  inmail_subject text,
  inmail_body text,
  connection_note text,
  status text not null default 'to_send' check (status in ('to_send','inmail_sent','connect_sent','connected','replied','done','dropped')),
  revision_at timestamptz,
  chat_stamp text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists outreach_tasks_jh_idx on public.outreach_tasks (jh_id);
create index if not exists outreach_tasks_open_idx on public.outreach_tasks (status) where status not in ('done','dropped');
alter table public.outreach_tasks enable row level security;
revoke all on public.outreach_tasks from anon;
revoke all on public.outreach_tasks from authenticated;
grant select on public.outreach_tasks to authenticated;
grant update (status) on public.outreach_tasks to authenticated;
drop policy if exists "owner read" on public.outreach_tasks;
create policy "owner read" on public.outreach_tasks for select to authenticated
  using ((select auth.jwt() ->> 'email') = 'philoskim990@gmail.com');
drop policy if exists "owner status" on public.outreach_tasks;
create policy "owner status" on public.outreach_tasks for update to authenticated
  using ((select auth.jwt() ->> 'email') = 'philoskim990@gmail.com')
  with check ((select auth.jwt() ->> 'email') = 'philoskim990@gmail.com');
-- Keep created_at; stamp updated_at. Status changes do not rewrite revision_at (that's the draft's latest revision).
create or replace function public.outreach_tasks_touch() returns trigger language plpgsql set search_path = '' as $$
begin
  new.created_at := old.created_at;
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists outreach_tasks_touch on public.outreach_tasks;
create trigger outreach_tasks_touch before update on public.outreach_tasks
  for each row execute function public.outreach_tasks_touch();

-- Seed: Speks JH-172 / Craig Zucker as an exercise card. Philos already sent the InMail and the connection request, so status is connect_sent (closest to 'connection request sent'). Latest text revision is kept.
insert into public.outreach_tasks (
  jh_id, company, person_name, person_title, linkedin_url, channel,
  inmail_subject, inmail_body, connection_note, status, revision_at, chat_stamp, notes
)
select
  'JH-172',
  'Speks',
  'Craig Zucker',
  'CEO',
  'https://www.linkedin.com/in/craig-zucker-93b16a206/',
  'LinkedIn InMail + connection request',
  'Big-box sourcing + AI ops tools, for your Ops Systems role',
  $body$Hi Craig, I just applied for the Director of Operations Systems & AI role. Your products ship to Target, Walmart and Amazon, and that's the world I've worked in for 18 years: Asian factories, AQL 2.5 quality standards, and big-box compliance, where I cut chargebacks from 3.0% to 0.1%. I've also built AI tools that run the day-to-day (PO tracking, a supplier portal). Happy to demo them in 15 minutes.$body$,
  $note$Hi Craig, I just sent you an InMail about the Director of Ops Systems & AI role. 18 years running Asian factories into Target, Walmart and other big-box retailers, plus AI ops tools I built myself. Would love to connect.$note$,
  'connect_sent',
  timestamptz '2026-11-18 18:26:00-05',
  'Wed Nov 18, 6:26 PM ET (connection note corrected; InMail subject added 5:41 PM ET)',
  'Exercise card — Philos already sent the InMail and the connection request. Never claim ongoing Amazon replenishment for Philos (trial shipments only).'
where not exists (
  select 1 from public.outreach_tasks
  where jh_id = 'JH-172' and person_name = 'Craig Zucker'
);
