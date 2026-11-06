-- Let job seekers opt in to a limited employer-searchable directory.
alter table public.employee_profiles
  add column if not exists is_searchable boolean not null default false;

create index if not exists idx_employee_profiles_searchable
  on public.employee_profiles (is_searchable)
  where is_searchable = true;

create or replace function public.search_job_seekers(
  search_text text default null,
  experience_level text default null
)
returns table (
  employee_id uuid,
  full_name text,
  city text,
  state text,
  years_experience text,
  job_categories text[],
  technical_skills text[]
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    p.full_name,
    ep.city,
    ep.state,
    ep.years_experience,
    coalesce(ep.job_categories, '{}'::text[]),
    coalesce(ep.technical_skills, '{}'::text[])
  from public.profiles p
  join public.employee_profiles ep on ep.id = p.id
  where p.role = 'employee'
    and ep.is_searchable is true
    and exists (
      select 1
      from public.profiles employer
      where employer.id = auth.uid()
        and employer.role = 'employer'
    )
    and (
      nullif(btrim(search_text), '') is null
      or p.full_name ilike '%' || btrim(search_text) || '%'
      or ep.city ilike '%' || btrim(search_text) || '%'
      or coalesce(array_to_string(ep.technical_skills, ' '), '') ilike '%' || btrim(search_text) || '%'
      or coalesce(array_to_string(ep.job_categories, ' '), '') ilike '%' || btrim(search_text) || '%'
    )
    and (
      nullif(btrim(experience_level), '') is null
      or lower(ep.years_experience) = lower(btrim(experience_level))
    )
  order by p.full_name
  limit 100;
$$;

revoke all on function public.search_job_seekers(text, text) from public;
grant execute on function public.search_job_seekers(text, text) to authenticated;
