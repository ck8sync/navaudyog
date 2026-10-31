-- Migration to add logo_url to employer_profiles
-- This should be run in the Supabase SQL Editor

-- Alter employer_profiles to add logo_url
ALTER TABLE public.employer_profiles 
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Enable storage extension if not already enabled
-- CREATE EXTENSION IF NOT EXISTS "storage" CASCADE;

-- Create a storage bucket for employer logos
-- Note: In Supabase, buckets are created in the storage.buckets table
INSERT INTO storage.buckets (id, name, public) 
VALUES ('employer-logos', 'employer-logos', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for Storage (allowing employers to upload their own logo)
-- We use the authenticated user's ID to restrict access
DROP POLICY IF EXISTS "Employers can upload their own logo" ON storage.objects;
CREATE POLICY "Employers can upload their own logo" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'employer-logos' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Employers can update their own logo" ON storage.objects;
CREATE POLICY "Employers can update their own logo" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'employer-logos' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Employers can delete their own logo" ON storage.objects;
CREATE POLICY "Employers can delete their own logo" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'employer-logos' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Public can view logos" ON storage.objects;
CREATE POLICY "Public can view logos" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'employer-logos');
