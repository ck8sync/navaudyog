-- SUPABASE MIGRATION FOR NAVAUDYOG
-- Copy and run this entire script in the Supabase SQL Editor

-- PROFILES (one per auth user)
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  role text not null check (role in ('employee', 'employer', 'admin')),
  full_name text not null,
  phone text not null,
  created_at timestamptz default now()
);

-- EMPLOYEE PROFILES
create table if not exists employee_profiles (
  id uuid references profiles(id) on delete cascade primary key,
  city text not null,
  job_categories text[] not null default '{}',
  years_experience text not null default '0',
  pay_preference text not null default 'Any',
  availability text not null default 'Immediately',
  languages text[] not null default '{}'
);

-- EMPLOYER PROFILES
create table if not exists employer_profiles (
  id uuid references profiles(id) on delete cascade primary key,
  company_name text not null,
  company_type text not null,
  locations text[] not null default '{}',
  description text,
  contact_phone text not null
);

-- JOBS
create table if not exists jobs (
  id uuid default gen_random_uuid() primary key,
  employer_id uuid references employer_profiles(id) on delete cascade not null,
  title text not null,
  category text not null,
  location text not null,
  pay_amount integer not null,
  pay_type text not null,
  openings integer not null default 1,
  description text not null,
  status text not null default 'draft' check (status in ('draft','active','closed')),
  created_at timestamptz default now()
);

-- APPLICATIONS
create table if not exists applications (
  id uuid default gen_random_uuid() primary key,
  job_id uuid references jobs(id) on delete cascade not null,
  employee_id uuid references profiles(id) on delete cascade not null,
  status text not null default 'applied' check (status in ('applied','reviewing','interview','hired','rejected')),
  note text,
  created_at timestamptz default now(),
  unique(job_id, employee_id)
);

-- SAVED JOBS
create table if not exists saved_jobs (
  id uuid default gen_random_uuid() primary key,
  employee_id uuid references profiles(id) on delete cascade not null,
  job_id uuid references jobs(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(employee_id, job_id)
);

-- Enable RLS
alter table profiles enable row level security;
alter table employee_profiles enable row level security;
alter table employer_profiles enable row level security;
alter table jobs enable row level security;
alter table applications enable row level security;
alter table saved_jobs enable row level security;

-- Helper function to check if a user is an admin without causing recursion
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- RLS POLICIES - profiles
drop policy if exists "own profile" on profiles;
create policy "own profile" on profiles for all using (auth.uid() = id);
drop policy if exists "admin reads all profiles" on profiles;
create policy "admin reads all profiles" on profiles for select using (is_admin());

-- RLS POLICIES - employee_profiles
drop policy if exists "own employee profile" on employee_profiles;
create policy "own employee profile" on employee_profiles for all using (auth.uid() = id);
drop policy if exists "admin reads employee profiles" on employee_profiles;
create policy "admin reads employee profiles" on employee_profiles for select using (is_admin());

-- RLS POLICIES - employer_profiles
drop policy if exists "public read employer profiles" on employer_profiles;
create policy "public read employer profiles" on employer_profiles for select using (true);
drop policy if exists "own employer profile" on employer_profiles;
create policy "own employer profile" on employer_profiles for all using (auth.uid() = id);
drop policy if exists "admin reads employer profiles" on employer_profiles;
create policy "admin reads employer profiles" on employer_profiles for select using (is_admin());

-- RLS POLICIES - jobs
drop policy if exists "public read active jobs" on jobs;
create policy "public read active jobs" on jobs for select using (status = 'active');
drop policy if exists "applicants can read job details" on jobs;
create policy "applicants can read job details" on jobs for select using (
  exists (select 1 from applications where job_id = id and employee_id = auth.uid())
);
drop policy if exists "savers can read job details" on jobs;
create policy "savers can read job details" on jobs for select using (
  exists (select 1 from saved_jobs where job_id = id and employee_id = auth.uid())
);
drop policy if exists "employer manages own jobs" on jobs;
create policy "employer manages own jobs" on jobs for all using (auth.uid() = employer_id);
drop policy if exists "admin reads all jobs" on jobs;
create policy "admin reads all jobs" on jobs for select using (is_admin());

-- RLS POLICIES - applications
drop policy if exists "employee manages own applications" on applications;
create policy "employee manages own applications" on applications for all using (auth.uid() = employee_id);
drop policy if exists "employer reads own job applications" on applications;
create policy "employer reads own job applications" on applications for select using (
  exists (select 1 from jobs where id = job_id and employer_id = auth.uid())
);
drop policy if exists "employer updates application status" on applications;
create policy "employer updates application status" on applications for update using (
  exists (select 1 from jobs where id = job_id and employer_id = auth.uid())
);
drop policy if exists "admin reads all applications" on applications;
create policy "admin reads all applications" on applications for select using (is_admin());

-- RLS POLICIES - saved_jobs
drop policy if exists "employee manages saved jobs" on saved_jobs;
create policy "employee manages saved jobs" on saved_jobs for all using (auth.uid() = employee_id);

-- Create indexes for performance
create index if not exists idx_jobs_employer_id on jobs(employer_id);
create index if not exists idx_jobs_status on jobs(status);
create index if not exists idx_applications_employee_id on applications(employee_id);
create index if not exists idx_applications_job_id on applications(job_id);
create index if not exists idx_saved_jobs_employee_id on saved_jobs(employee_id);

-- TRIGGER: Handle profile creation on signup
-- This function will run every time a new user signs up in Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'employee'),
    coalesce(new.raw_user_meta_data->>'full_name', 'User'),
    coalesce(new.raw_user_meta_data->>'phone', '')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Create the trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();