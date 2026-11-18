-- v1.6.3: use existing public.contacts.linkedin (no new column).
-- Fill verified profile URLs only from sources we already have; do not invent slugs.

-- Philos confirmed this Speks CEO profile from a LinkedIn screenshot on 2026-11-18.
update public.contacts
set linkedin = 'https://www.linkedin.com/in/craig-zucker-93b16a206/',
    linkedin_verified = true,
    sources = case
      when sources is null then array['https://www.linkedin.com/in/craig-zucker-93b16a206/']
      when 'https://www.linkedin.com/in/craig-zucker-93b16a206/' = any(sources) then sources
      else array_append(sources, 'https://www.linkedin.com/in/craig-zucker-93b16a206/')
    end,
    updated_at = now()
where id = 'c-zucker';

-- Additional people whose linkedin.com/in/ URL already appears next to their name
-- in package notes.md, outreach notes, or the tracker Contact column.
insert into public.contacts (id, company, company_id, name, title, relationship, linkedin, linkedin_verified, email, phone, bio, sources, created_at, updated_at)
values
  ('c-baird', 'Wyndham Hotels & Resorts', null, 'Louis Baird', 'VP Procurement', 'Hiring manager (likely)', 'https://www.linkedin.com/in/louis-baird', true, null, null, null, array['https://www.linkedin.com/in/louis-baird'], now(), now()),
  ('c-byram', 'Wyndham Hotels & Resorts', null, 'John Byram', 'Group VP Sourcing Operations & Corporate Procurement', 'Hiring manager (likely)', 'https://www.linkedin.com/in/john-byram-39a30116', true, null, null, null, array['https://www.linkedin.com/in/john-byram-39a30116'], now(), now()),
  ('c-dover', 'OverCool', null, 'David Over', 'President', 'Owner / President', 'https://www.linkedin.com/in/david-o-a3b9603', true, null, null, null, array['https://www.linkedin.com/in/david-o-a3b9603'], now(), now()),
  ('c-myles', 'Confido', null, 'Keegan Myles', 'Founding Head of Business Operations', 'Hiring manager / founder', 'https://www.linkedin.com/in/keeganmyles', true, null, null, null, array['https://www.linkedin.com/in/keeganmyles'], now(), now()),
  ('c-ferris', 'Roosty''s', null, 'Tom Ferris', 'Co-Founder', 'Founder', 'https://www.linkedin.com/in/tom-ferris-43096b118', true, null, null, null, array['https://www.linkedin.com/in/tom-ferris-43096b118'], now(), now()),
  ('c-haglund', 'DealTeam', null, 'Gus Haglund', 'Founder', 'Recruiter / founder', 'https://www.linkedin.com/in/gus-haglund', true, null, null, null, array['https://www.linkedin.com/in/gus-haglund'], now(), now()),
  ('c-boulet', 'NEST New York', null, 'Valerie Boulet', 'VP Supply Chain', 'Hiring manager (unconfirmed)', 'https://www.linkedin.com/in/val%C3%A9rie-boulet', true, null, null, null, array['https://www.linkedin.com/in/val%C3%A9rie-boulet'], now(), now()),
  ('c-maus', 'NEST New York', null, 'David Maus', null, 'Hiring manager (unconfirmed)', 'https://www.linkedin.com/in/david-maus-7a8238b8', true, null, null, null, array['https://www.linkedin.com/in/david-maus-7a8238b8'], now(), now()),
  ('c-kenworthy', 'Reachdesk', null, 'Danielle Kenworthy', 'Director of Swag & Gifts', 'Hiring manager (likely)', 'https://www.linkedin.com/in/danielleruneckles', true, null, null, null, array['https://www.linkedin.com/in/danielleruneckles'], now(), now()),
  ('c-hanson', 'Interparfums', 'interparfums', 'Karen Hanson', 'Vice President, Global New Product Development & Packaging', 'Outreach target', 'https://www.linkedin.com/in/karen-hanson-86021231', true, null, null, null, array['https://www.linkedin.com/in/karen-hanson-86021231'], now(), now()),
  ('c-gates', 'Glossier', null, 'Kinta C. Gates', 'VP of Supply Chain & Operations', 'Outreach target', 'https://www.linkedin.com/in/kintacgates', true, null, null, null, array['https://www.linkedin.com/in/kintacgates'], now(), now()),
  ('c-qari', 'Logicbroker', null, 'Omar Qari', 'CEO', 'Founder / CEO', 'https://www.linkedin.com/in/oqari', true, null, null, null, array['https://www.linkedin.com/in/oqari'], now(), now())
on conflict (id) do nothing;
