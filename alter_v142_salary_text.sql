-- v1.4.2 (applied 2026-10-20 via migration v142_salary_asked_text)
alter table public.applications add column if not exists salary_asked_text text;
