-- Expose aggregate platform counts without granting public access to profile
-- or application rows. The function owner can read through the table RLS rules.
create or replace function public.get_public_platform_stats()
returns table (
  active_jobs bigint,
  worker_accounts bigint,
  employer_accounts bigint,
  applications bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    (select count(*) from public.jobs where status = 'active'),
    (select count(*) from public.profiles where role = 'employee'),
    (select count(*) from public.employer_profiles),
    (select count(*) from public.applications);
$$;

revoke all on function public.get_public_platform_stats() from public;
grant execute on function public.get_public_platform_stats() to anon, authenticated;
