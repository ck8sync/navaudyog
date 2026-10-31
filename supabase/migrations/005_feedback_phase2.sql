-- Phase 2 feedback: validations, structured location/employment fields, private CV storage.
-- NOT VALID preserves existing rows while enforcing the rules on new/updated values.
alter table public.profiles
  drop constraint if exists profiles_phone_indian_mobile_check;

alter table public.employee_profiles
  add column if not exists state text,
  add column if not exists employment_type text;

alter table public.employer_profiles
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists other_company_type text;

create or replace function public.validate_feedback_profile_fields()
returns trigger language plpgsql as $$
begin
  if tg_table_name = 'profiles' then
    if (tg_op = 'INSERT' or new.phone is distinct from old.phone)
      and new.phone !~ '^[6-9][0-9]{9}$' then
      raise exception 'Enter a valid 10-digit Indian mobile number.' using errcode = '23514';
    end if;
  elsif tg_table_name = 'employee_profiles' then
    if (tg_op = 'INSERT' or new.dob is distinct from old.dob)
      and new.dob is not null and new.dob > current_date then
      raise exception 'Date of birth cannot be in the future.' using errcode = '23514';
    end if;
    if tg_op = 'INSERT' or new.father_mother_name is distinct from old.father_mother_name
      or new.dob is distinct from old.dob or new.gender is distinct from old.gender
      or new.current_address is distinct from old.current_address
      or new.permanent_address is distinct from old.permanent_address
      or new.state is distinct from old.state or new.city is distinct from old.city
      or new.declaration_accepted is distinct from old.declaration_accepted then
      if coalesce(trim(new.father_mother_name), '') = '' or new.dob is null
        or coalesce(trim(new.gender), '') = '' or coalesce(trim(new.current_address), '') = ''
        or coalesce(trim(new.permanent_address), '') = '' or coalesce(trim(new.state), '') = ''
        or coalesce(trim(new.city), '') = '' or new.declaration_accepted is not true then
        raise exception 'Complete all required job seeker profile fields.' using errcode = '23514';
      end if;
    end if;
    if coalesce(trim(new.alternate_number), '') <> '' and new.alternate_number !~ '^[6-9][0-9]{9}$' then
      raise exception 'Enter a valid 10-digit alternate mobile number.' using errcode = '23514';
    end if;
    if new.employment_type is not null and new.employment_type not in ('Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship', 'Freelance') then
      raise exception 'Choose a valid employment type.' using errcode = '23514';
    end if;
  elsif tg_table_name = 'employer_profiles' then
    if (tg_op = 'INSERT' or new.contact_phone is distinct from old.contact_phone)
      and new.contact_phone !~ '^[6-9][0-9]{9}$' then
      raise exception 'Enter a valid 10-digit Indian mobile number.' using errcode = '23514';
    end if;
    if tg_op = 'INSERT' or new.company_name is distinct from old.company_name
      or new.company_type is distinct from old.company_type or new.city is distinct from old.city
      or new.state is distinct from old.state or new.other_company_type is distinct from old.other_company_type then
      if coalesce(trim(new.company_name), '') = '' or coalesce(trim(new.company_type), '') = ''
        or coalesce(trim(new.city), '') = '' or coalesce(trim(new.state), '') = ''
        or new.company_type not in ('Factory', 'Contractor', 'Agency', 'Direct Employer', 'Real Estate', 'Hotels and Hospitality', 'Schools and Educational Institutions', 'Hospitals', 'Clinics', 'Pharmacies', 'Manufacturing', 'Retail', 'IT and Software', 'Construction', 'Logistics and Transportation', 'Food and Beverage', 'Agriculture', 'Banking and Financial Services', 'Other')
        or (new.company_type = 'Other' and coalesce(trim(new.other_company_type), '') = '') then
        raise exception 'Complete all required employer profile fields.' using errcode = '23514';
      end if;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists validate_profile_mobile on public.profiles;
create trigger validate_profile_mobile before insert or update of phone on public.profiles
for each row execute function public.validate_feedback_profile_fields();

drop trigger if exists validate_employee_profile_fields on public.employee_profiles;
create trigger validate_employee_profile_fields before insert or update on public.employee_profiles
for each row execute function public.validate_feedback_profile_fields();

drop trigger if exists validate_employer_profile_fields on public.employer_profiles;
create trigger validate_employer_profile_fields before insert or update on public.employer_profiles
for each row execute function public.validate_feedback_profile_fields();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('employee-cvs', 'employee-cvs', false, 5242880, array['application/pdf'])
on conflict (id) do update set public = false, file_size_limit = 5242880,
  allowed_mime_types = array['application/pdf'];

drop policy if exists "employee manages own CV" on storage.objects;
create policy "employee manages own CV" on storage.objects for all to authenticated
using (bucket_id = 'employee-cvs' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'employee-cvs' and (storage.foldername(name))[1] = auth.uid()::text);
