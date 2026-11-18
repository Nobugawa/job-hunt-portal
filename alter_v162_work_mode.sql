-- v1.6.2: work mode (On-site / Hybrid / Remote) and office location on applications.
alter table public.applications
  add column if not exists work_mode text,
  add column if not exists work_mode_detail text,
  add column if not exists office_location text;

alter table public.applications
  drop constraint if exists applications_work_mode_check;

alter table public.applications
  add constraint applications_work_mode_check
  check (work_mode is null or work_mode in ('On-site', 'Hybrid', 'Remote'));

comment on column public.applications.work_mode is 'On-site, Hybrid, or Remote; null if the posting is unclear.';
comment on column public.applications.work_mode_detail is 'Optional schedule or region, e.g. 3–4 days in office, Remote US.';
comment on column public.applications.office_location is 'Street address if the posting gives one, otherwise the most specific area; blank for remote with no office.';
