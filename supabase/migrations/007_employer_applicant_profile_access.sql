-- Ensure employers can read a worker's profile details only after that worker
-- has applied to one of the employer's jobs. Contact information remains
-- subject to the application's existing disclosure behavior.

drop policy if exists "employers can view applicant profiles" on public.profiles;
create policy "employers can view applicant profiles" on public.profiles
for select to authenticated using (
  exists (
    select 1
    from public.applications a
    join public.jobs j on j.id = a.job_id
    where a.employee_id = profiles.id
      and j.employer_id = auth.uid()
  )
);

drop policy if exists "employers can view applicant employee profiles" on public.employee_profiles;
create policy "employers can view applicant employee profiles" on public.employee_profiles
for select to authenticated using (
  exists (
    select 1
    from public.applications a
    join public.jobs j on j.id = a.job_id
    where a.employee_id = employee_profiles.id
      and j.employer_id = auth.uid()
  )
);

drop policy if exists "employer reads applicant education" on public.education_qualifications;
create policy "employer reads applicant education" on public.education_qualifications
for select to authenticated using (
  exists (
    select 1
    from public.applications a
    join public.jobs j on j.id = a.job_id
    where a.employee_id = education_qualifications.employee_id
      and j.employer_id = auth.uid()
  )
);

drop policy if exists "employer reads applicant experience" on public.work_experiences;
create policy "employer reads applicant experience" on public.work_experiences
for select to authenticated using (
  exists (
    select 1
    from public.applications a
    join public.jobs j on j.id = a.job_id
    where a.employee_id = work_experiences.employee_id
      and j.employer_id = auth.uid()
  )
);
