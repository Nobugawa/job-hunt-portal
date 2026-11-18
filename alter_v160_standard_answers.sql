-- v1.6.0: "Standard Answers" — canned answers that apply to ALL job applications.
-- Own table (like application_questions / role_ratings) so sync.py never writes or clears it.
-- Philos can edit answer + notes in the portal; the assistant reads them when filling forms and adds rows with the service role.
create table if not exists public.standard_answers (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  question text not null,
  answer text,
  notes text,
  sort integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (category, question)
);
alter table public.standard_answers enable row level security;
revoke all on public.standard_answers from anon;
revoke all on public.standard_answers from authenticated;
grant select on public.standard_answers to authenticated;
grant update (answer, notes) on public.standard_answers to authenticated;
drop policy if exists "owner read" on public.standard_answers;
create policy "owner read" on public.standard_answers for select to authenticated
  using ((select auth.jwt() ->> 'email') = 'philoskim990@gmail.com');
drop policy if exists "owner edit" on public.standard_answers;
create policy "owner edit" on public.standard_answers for update to authenticated
  using ((select auth.jwt() ->> 'email') = 'philoskim990@gmail.com')
  with check ((select auth.jwt() ->> 'email') = 'philoskim990@gmail.com');
create or replace function public.standard_answers_touch() returns trigger language plpgsql set search_path = '' as $$
begin
  new.created_at := old.created_at;
  new.answer := nullif(btrim(new.answer), '');
  new.notes := nullif(btrim(new.notes), '');
  if new.answer is distinct from old.answer or new.notes is distinct from old.notes
     or new.category is distinct from old.category or new.question is distinct from old.question then
    new.updated_at := now();
  else
    new.updated_at := old.updated_at;
  end if;
  return new;
end $$;
drop trigger if exists standard_answers_touch on public.standard_answers;
create trigger standard_answers_touch before update on public.standard_answers
  for each row execute function public.standard_answers_touch();
-- Seed: approved answers as of Nov 18 2026 (idempotent).
insert into public.standard_answers (category, sort, question, answer, notes) values
('Contact',100,'Phone','201-463-5906',null),
('Contact',101,'Email','philoskim990@gmail.com',null),
('Contact',102,'Address','5000 Riverdale Rd Apt 308, Riverdale NJ 07457',null),
('Contact',103,'LinkedIn','https://www.linkedin.com/in/philoskim/',null),
('Contact',104,'Consent to SMS / text messages about application status','Yes','New Nov 18 2026 (approved by Philos).'),
('Demographics (EEO)',205,'Gender','Male',null),
('Demographics (EEO)',206,'Race / ethnicity','Asian (East Asian where the form subdivides)',null),
('Demographics (EEO)',207,'Hispanic or Latino','No',null),
('Demographics (EEO)',208,'Protected veteran','No (not a protected veteran)',null),
('Demographics (EEO)',209,'Disability','No',null),
('Demographics (EEO)',210,'LGBTQ+ identification','No','Approved Nov 10 2026.'),
('Work authorization',311,'US citizen','Yes',null),
('Work authorization',312,'Authorized to work in the US','Yes',null),
('Work authorization',313,'Requires visa sponsorship','No',null),
('Work authorization',314,'US Person (export-control definition)','Yes','US citizen.'),
('Availability & logistics',415,'Earliest start date','3 weeks after offer','Where free text fits, "2–3 weeks from offer" was also approved (Oct 27 2026).'),
('Availability & logistics',416,'Willing to relocate','No','Already local to NYC/NJ.'),
('Availability & logistics',417,'Willing to travel for business','Yes','Do not select a travel percentage without checking with Philos first; he considers up to 25% a lot (Nov 14 2026). He will discuss specifics if called.'),
('Availability & logistics',418,'Comfortable with remote work','Yes','Has never held a fully remote job before.'),
('Availability & logistics',419,'Valid driver''s license','Yes',null),
('Availability & logistics',420,'Willing to undergo background check','Yes',null),
('Availability & logistics',421,'Willing to take a drug test','Yes',null),
('Employment history',522,'Ever discharged or asked to resign from a job','No','Approved Nov 17 2026.'),
('Employment history',523,'Bound by a non-compete agreement','No',null),
('Employment history',524,'Previously worked for this company (PCC, HYTORC, etc.)','Answer per company','Note only: answer from his actual work history for each company. Previously APPLIED (not worked) to HYTORC twice and Delta Galil once.'),
('Education',625,'Highest degree','Bachelor of Economics, University of Pennsylvania – Wharton School, 1981–1985',null),
('Education',626,'Undergraduate GPA','2.95',null),
('Languages',727,'Languages','English (Native)','English only; do not list Korean.'),
('Experience screeners',828,'General rule for experience he doesn''t have','Answer "no experience" / No','Don''t stretch.'),
('Experience screeners',829,'Microsoft Project / PM tool, reporting to executives','Never',null),
('Experience screeners',830,'ERP selection / implementation leadership','Never',null),
('Experience screeners',831,'SAP / ERP use','Do not claim','SAP years = 0.'),
('Experience screeners',832,'Amazon FBA years','0','Has Seller Central familiarity (listed a product, sent inventory to FBA) but never sold through FBA.'),
('Experience screeners',833,'Electronics-manufacturing supply chain leadership','None / less than 2 years',null),
('Experience screeners',834,'PLM software for apparel','Yes',null),
('Experience screeners',835,'Microsoft Excel years','20',null),
('Experience screeners',836,'Microsoft PowerPoint years','5',null),
('Experience screeners',837,'Plastics manufacturing (injection molding) years','2',null),
('Experience screeners',838,'Wholesale import/export years','18',null),
('Experience screeners',839,'International trade years','18',null),
('Experience screeners',840,'10+ years inventory management in distribution/fulfillment','Yes',null),
('Experience screeners',841,'5+ years leading inventory teams','Yes',null),
('Experience screeners',842,'HVAC industry experience','0 (or "3 months" if text allowed)','Only DAP HVAC, Jan–Mar 2024; GPPS home-services years don''t count.'),
('Experience screeners',843,'LEAN / continuous improvement (5S, kaizen) years','0',null),
('Experience screeners',844,'Cut-and-sew experience','None','Leave cut-and-sew out of applications.'),
('Experience screeners',845,'Managed project budgets, labor costs or profitability','No',null),
('Experience screeners',846,'Procurement spend / cost savings figures','Leave blank','Never invent numbers; if required, check with Philos first.'),
('Salary',947,'Salary expectation','Per role, using Philos''s salary rule','Below $150k: ask the top; $150–190k: ask the middle; above $190k: ask the low end; bottom over $200k: narrow spread ask the bottom, wide spread bottom + 1/3 of spread; anything over $250k: ask Philos first.'),
('Sensitive screens',1048,'SSN / WOTC tax-credit screens','Hand to Philos','The assistant never enters an SSN. Philos completes the screen and hands it back.'),
('Sensitive screens',1049,'WOTC eligibility (SNAP, TANF, SSI, veteran, unemployed, referrals)','None apply','Approved Nov 10 2026.')
on conflict (category, question) do nothing;
