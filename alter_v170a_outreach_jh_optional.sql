-- v1.7.0a (data-only, applied Nov 19 2026): outreach cards may be general recruiter relationships with no JH role.
-- The foreign key to applications(id) still applies when jh_id is set. v1.7.0 UI already handles a null jh_id.
alter table public.outreach_tasks alter column jh_id drop not null;
-- Rollback (only if no null rows): alter table public.outreach_tasks alter column jh_id set not null;
