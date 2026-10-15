-- Portal v1.2.0: medical coverage % and travel requirement on applications
-- Paste into Supabase SQL Editor; safe to re-run.
alter table applications add column if not exists medical_paid text;
alter table applications add column if not exists travel text;
