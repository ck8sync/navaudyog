-- Migration to add detailed employee profile fields
-- This should be run in the Supabase SQL Editor

-- Alter employee_profiles to add new fields
ALTER TABLE public.employee_profiles 
ADD COLUMN IF NOT EXISTS father_mother_name TEXT,
ADD COLUMN IF NOT EXISTS dob DATE,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS alternate_number TEXT,
ADD COLUMN IF NOT EXISTS current_address TEXT,
ADD COLUMN IF NOT EXISTS permanent_address TEXT,
ADD COLUMN IF NOT EXISTS total_experience TEXT,
ADD COLUMN IF NOT EXISTS fresher_experienced TEXT,
ADD COLUMN IF NOT EXISTS technical_skills TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS certifications TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS preferred_location TEXT,
ADD COLUMN IF NOT EXISTS expected_salary TEXT,
ADD COLUMN IF NOT EXISTS notice_period TEXT,
ADD COLUMN IF NOT EXISTS shift_preference TEXT,
ADD COLUMN IF NOT EXISTS declaration_accepted BOOLEAN DEFAULT FALSE;

-- Create education_qualifications table
CREATE TABLE IF NOT EXISTS public.education_qualifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  qualification TEXT NOT NULL,
  institution_name TEXT NOT NULL,
  board_university TEXT NOT NULL,
  year_of_passing TEXT NOT NULL,
  percentage_cgpa TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create work_experiences table
CREATE TABLE IF NOT EXISTS public.work_experiences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  company_name TEXT NOT NULL,
  designation TEXT NOT NULL,
  duration TEXT NOT NULL,
  salary_drawn TEXT NOT NULL,
  reason_for_leaving TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.education_qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_experiences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for education_qualifications
DROP POLICY IF EXISTS "employee manages own education" ON public.education_qualifications;
CREATE POLICY "employee manages own education" ON public.education_qualifications
FOR ALL USING (auth.uid() = employee_id);

DROP POLICY IF EXISTS "employer reads applicant education" ON public.education_qualifications;
CREATE POLICY "employer reads applicant education" ON public.education_qualifications
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.applications a
    JOIN public.jobs j ON a.job_id = j.id
    WHERE a.employee_id = education_qualifications.employee_id
    AND j.employer_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "admin reads all education" ON public.education_qualifications;
CREATE POLICY "admin reads all education" ON public.education_qualifications
FOR SELECT USING (public.is_admin());

-- RLS Policies for work_experiences
DROP POLICY IF EXISTS "employee manages own experience" ON public.work_experiences;
CREATE POLICY "employee manages own experience" ON public.work_experiences
FOR ALL USING (auth.uid() = employee_id);

DROP POLICY IF EXISTS "employer reads applicant experience" ON public.work_experiences;
CREATE POLICY "employer reads applicant experience" ON public.work_experiences
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.applications a
    JOIN public.jobs j ON a.job_id = j.id
    WHERE a.employee_id = work_experiences.employee_id
    AND j.employer_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "admin reads all experience" ON public.work_experiences;
CREATE POLICY "admin reads all experience" ON public.work_experiences
FOR SELECT USING (public.is_admin());

-- Sample Query to test
/*
-- Insert sample education
INSERT INTO public.education_qualifications (employee_id, qualification, institution_name, board_university, year_of_passing, percentage_cgpa)
VALUES ('YOUR_USER_ID', 'SSLC', 'Govt High School', 'State Board', '2015', '85%');

-- Insert sample experience
INSERT INTO public.work_experiences (employee_id, company_name, designation, duration, salary_drawn, reason_for_leaving)
VALUES ('YOUR_USER_ID', 'Tech Corp', 'Junior Dev', '2 years', '30,000', 'Career growth');

-- Select full employee details (Admin View)
SELECT 
    p.full_name,
    ep.*,
    (SELECT json_agg(e) FROM public.education_qualifications e WHERE e.employee_id = p.id) as education,
    (SELECT json_agg(w) FROM public.work_experiences w WHERE w.employee_id = p.id) as experience
FROM public.profiles p
JOIN public.employee_profiles ep ON p.id = ep.id
WHERE p.role = 'employee';
*/
