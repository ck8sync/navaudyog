-- 008: Contact details for application status e-mails
--
-- Candidate e-mail addresses live in auth.users, which the app cannot read
-- through RLS. Instead of using the service-role key in the app, this
-- SECURITY DEFINER function returns the e-mail for ONE application, and only
-- when the caller is the employer who owns the job or the candidate who applied.
-- Requires 007 (or 001) to be applied first. Safe to re-run.

create or replace function public.get_application_contact(p_application_id uuid)
returns table (
  email text,
  full_name text,
  job_title text,
  company_name text,
  status text
)
language sql
stable
security definer
set search_path = public, auth
as $$
  select
    u.email::text,
    p.full_name,
    j.title,
    ep.company_name,
    a.status
  from public.applications a
  join public.jobs j on j.id = a.job_id
  join public.profiles p on p.id = a.employee_id
  join auth.users u on u.id = a.employee_id
  left join public.employer_profiles ep on ep.id = j.employer_id
  where a.id = p_application_id
    and (j.employer_id = auth.uid() or a.employee_id = auth.uid())
$$;

revoke all on function public.get_application_contact(uuid) from public;
revoke all on function public.get_application_contact(uuid) from anon;
grant execute on function public.get_application_contact(uuid) to authenticated;

