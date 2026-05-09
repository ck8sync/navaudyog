-- Migration: Create profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  phone text,
  role text not null default 'employee',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace function trigger_set_timestamp()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_timestamp on public.profiles;
create trigger set_timestamp
  before update on public.profiles
  for each row execute procedure trigger_set_timestamp();
