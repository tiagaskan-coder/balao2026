-- Enable RLS for storage.objects if not already enabled (it usually is)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all objects in 'carousel' bucket
CREATE POLICY "Public Access Carousel"
ON storage.objects FOR SELECT
USING ( bucket_id = 'carousel' );

-- Allow authenticated users to upload to 'carousel' bucket
CREATE POLICY "Auth Upload Carousel"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'carousel' );

-- Allow authenticated users to update their own objects (or all if admin)
CREATE POLICY "Auth Update Carousel"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'carousel' );

-- Allow authenticated users to delete objects
CREATE POLICY "Auth Delete Carousel"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'carousel' );
