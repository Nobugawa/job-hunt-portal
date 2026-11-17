-- v1.5.10: Outstanding column on the Applications list (blocking items + last-discussed date from the tracker).
-- sync.py upserts applications.blocking_items from CSV "Blocking items (last discussed)".
alter table public.applications add column if not exists blocking_items text;
comment on column public.applications.blocking_items is 'Outstanding decisions/approvals still needed, including last-discussed date; copied from the tracker Blocking items column.';
