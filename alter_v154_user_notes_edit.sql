-- v1.5.4 (applied 2026-10-30 via Supabase MCP): edit/delete own notes, keep original created_at
alter table public.user_notes add column if not exists updated_at timestamptz;
grant update (body, updated_at), delete on public.user_notes to authenticated;
drop policy if exists "owner update" on public.user_notes;
create policy "owner update" on public.user_notes for update to authenticated
  using ((auth.jwt() ->> 'email') = 'philoskim990@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'philoskim990@gmail.com');
drop policy if exists "owner delete" on public.user_notes;
create policy "owner delete" on public.user_notes for delete to authenticated
  using ((auth.jwt() ->> 'email') = 'philoskim990@gmail.com');
create or replace function public.user_notes_touch() returns trigger language plpgsql set search_path = '' as $$
begin
  new.created_at := old.created_at;
  if new.body is distinct from old.body then new.updated_at := now(); end if;
  return new;
end $$;
drop trigger if exists user_notes_touch on public.user_notes;
create trigger user_notes_touch before update on public.user_notes for each row execute function public.user_notes_touch();
