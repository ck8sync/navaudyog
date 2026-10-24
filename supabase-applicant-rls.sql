-- NAVAUDYOG: Migration to grant Employers access to Applicant Profiles
-- Run this in the Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- 1. Allow employers to read applicant profiles (Full Name, Phone) for candidates who applied to their jobs
DROP POLICY IF EXISTS "employers can view applicant profiles" ON public.profiles;
CREATE POLICY "employers can view applicant profiles" ON public.profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.applications a
    JOIN public.jobs j ON a.job_id = j.id
    WHERE a.employee_id = profiles.id
    AND j.employer_id = auth.uid()
  )
);

-- 2. Allow employers to read applicant employee_profiles (City, Experience, Preferences)
DROP POLICY IF EXISTS "employers can view applicant employee profiles" ON public.employee_profiles;
CREATE POLICY "employers can view applicant employee profiles" ON public.employee_profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.applications a
    JOIN public.jobs j ON a.job_id = j.id
    WHERE a.employee_id = employee_profiles.id
    AND j.employer_id = auth.uid()
  )
);
