-- v1.4.0 (applied 2026-10-20 via migration v140_application_insights)
alter table public.applications add column if not exists best_aspects text,
  add column if not exists worst_aspects text, add column if not exists real_job text;
