-- Fix Storage Permissions for Products
-- Ensure the 'products' bucket is public and accessible

-- 1. Create the bucket if it doesn't exist (this is usually done via API, but good to have in SQL)
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Enable RLS on objects (standard practice, but we want public access)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Insert" ON storage.objects;
DROP POLICY IF EXISTS "Public Update" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete" ON storage.objects;

-- 4. Create comprehensive policies
-- Allow public read access to all objects in 'products' bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'products' );

-- Allow public insert (Be careful! In a real app, you might want to restrict this to authenticated users)
-- Since we are using an admin client in the API, we technically bypass RLS for uploads,
-- but having this policy helps if you use client-side upload.
-- For now, we keep it restricted or rely on the service role key which bypasses RLS.
-- However, for the IMAGES TO SHOW, the SELECT policy above is crucial.

-- If you are still having issues, you can try this (allows anyone to upload):
-- CREATE POLICY "Public Insert" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'products' );
