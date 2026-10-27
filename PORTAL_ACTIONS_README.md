# portal_actions (bulk Apply / Pass / Package / Hold)

## Apply the migration (one-time)

1. Open Supabase → project `vixnrugeiclzukzickmq` → **SQL Editor**.
2. Paste and Run `alter_portal_actions.sql` (same file under `/workspace/jhp` and `job-portal/supabase/`).
3. Confirm table exists: `select * from portal_actions limit 1;`

The browser cannot run DDL. Service role REST works for data but not schema.

## How it works

- Applications list: checkboxes + JH-ID → action bar writes a **pending** row.
- JH1 later polls with service key (`scripts/poll_portal_actions.py`) and updates tracker / Sheet.
- Front-end never changes application status itself.

## Columns

| column | meaning |
|--------|---------|
| action | `apply` \| `pass` \| `package` \| `hold` |
| application_ids | text[] of `JH-xxx` |
| note | optional (Pass reason, Hold until, etc.) |
| status | `pending` → `processing` → `done` / `cancelled` |
| created_by | signed-in email |
