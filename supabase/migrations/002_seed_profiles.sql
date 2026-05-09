-- Seed: Insert a test profile
-- Replace the id value with a real user UUID from Supabase Auth
insert into public.profiles (id, full_name, avatar_url, phone, role)
values (
  'cfc9ce01-bc62-47d3-9827-c816e2aa687e',
  'Chetan Sync',
  null,
  null,
  'employee'
);
