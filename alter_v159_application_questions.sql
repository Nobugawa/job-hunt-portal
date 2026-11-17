-- v1.5.9: "Questions for Philos" — open decisions per application, answered by Philos in the portal.
-- Own table (like user_notes / role_ratings) so sync.py never writes or clears it.
-- Assistant adds/withdraws questions with the service role (job-hunt/portal_questions.py); Philos can only set answer + answer_note.
create table if not exists public.application_questions (
  id uuid primary key default gen_random_uuid(),
  application_id text not null references public.applications(id) on delete cascade,
  question text not null,
  detail text,                                   -- context shown under the question (e.g. proposed ask)
  kind text not null check (kind in ('choice','text')),
  options jsonb not null default '[]'::jsonb check (jsonb_typeof(options) = 'array'),
  answer text,
  answer_note text,                              -- optional comment alongside a choice
  status text not null default 'open' check (status in ('open','answered','withdrawn')),
  answered_at timestamptz,
  sort smallint not null default 0,
  created_by text not null default 'assistant',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (kind = 'text' or jsonb_array_length(options) >= 2)
);
create index if not exists application_questions_app_idx on public.application_questions (application_id);
create index if not exists application_questions_open_idx on public.application_questions (status) where status = 'open';
alter table public.application_questions enable row level security;
revoke all on public.application_questions from anon;
revoke all on public.application_questions from authenticated;
grant select on public.application_questions to authenticated;
grant update (answer, answer_note) on public.application_questions to authenticated;
drop policy if exists "owner read" on public.application_questions;
create policy "owner read" on public.application_questions for select to authenticated
  using ((select auth.jwt() ->> 'email') = 'philoskim990@gmail.com');
drop policy if exists "owner answer" on public.application_questions;
create policy "owner answer" on public.application_questions for update to authenticated
  using ((select auth.jwt() ->> 'email') = 'philoskim990@gmail.com' and status <> 'withdrawn')
  with check ((select auth.jwt() ->> 'email') = 'philoskim990@gmail.com');
-- Derive status/answered_at from the answer; validate choice answers; keep created_at.
create or replace function public.application_questions_touch() returns trigger language plpgsql set search_path = '' as $$
begin
  new.created_at := old.created_at;
  new.updated_at := now();
  new.answer := nullif(btrim(new.answer), '');
  new.answer_note := nullif(btrim(new.answer_note), '');
  if new.kind = 'choice' and new.answer is not null and not (new.options ? new.answer) then
    raise exception 'Answer "%" is not one of the choices', new.answer using errcode = '22023';
  end if;
  if new.status <> 'withdrawn' then
    if new.answer is null then
      new.status := 'open'; new.answered_at := null;
    elsif new.answer is distinct from old.answer or new.answer_note is distinct from old.answer_note or old.answered_at is null then
      new.status := 'answered'; new.answered_at := now();
    end if;
  end if;
  return new;
end $$;
drop trigger if exists application_questions_touch on public.application_questions;
create trigger application_questions_touch before update on public.application_questions
  for each row execute function public.application_questions_touch();
