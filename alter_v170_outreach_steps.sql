-- v1.7.0: Outreach sequences. One outreach card can hold several ordered steps
-- (e.g. 1 reply in the InMail thread with résumé, 2 connection request, 3 later follow-up).
-- Additive only: v1.6.4 ignores the new column, so production keeps working before the UI merge.
alter table public.outreach_tasks add column if not exists steps jsonb not null default '[]'::jsonb;
alter table public.outreach_tasks drop constraint if exists outreach_tasks_steps_array;
alter table public.outreach_tasks add constraint outreach_tasks_steps_array check (jsonb_typeof(steps) = 'array');
comment on column public.outreach_tasks.steps is
  'Ordered sequence: [{n, kind(thread_reply|inmail|connection_note|follow_up), label, when(now|right_after|later), when_note, subject, body, attachment, due_at, done, done_at}]. Empty = legacy card (inmail_subject/inmail_body/connection_note).';

-- Philos ticks a step done/undone from the portal. Narrow RPC (not a column grant) so the portal can only
-- flip done/done_at on one step and can never overwrite the draft text the assistant maintains.
create or replace function public.outreach_set_step(p_id uuid, p_n int, p_done boolean)
returns public.outreach_tasks
language plpgsql security definer set search_path = '' as $$
declare r public.outreach_tasks;
begin
  if coalesce((select auth.jwt() ->> 'email'), '') <> 'philoskim990@gmail.com' then
    raise exception 'not allowed';
  end if;
  update public.outreach_tasks t
     set steps = (
       select coalesce(jsonb_agg(
                case when (s ->> 'n')::int = p_n
                     then s || jsonb_build_object('done', p_done, 'done_at', case when p_done then to_jsonb(now()) else 'null'::jsonb end)
                     else s end
                order by ord), '[]'::jsonb)
         from jsonb_array_elements(t.steps) with ordinality as e(s, ord))
   where t.id = p_id
  returning * into r;
  if r.id is null then raise exception 'outreach task not found'; end if;
  return r;
end $$;
revoke all on function public.outreach_set_step(uuid, int, boolean) from public, anon;
grant execute on function public.outreach_set_step(uuid, int, boolean) to authenticated;

-- Rollback (if ever needed):
--   drop function if exists public.outreach_set_step(uuid, int, boolean);
--   alter table public.outreach_tasks drop constraint if exists outreach_tasks_steps_array;
--   alter table public.outreach_tasks drop column if exists steps;
