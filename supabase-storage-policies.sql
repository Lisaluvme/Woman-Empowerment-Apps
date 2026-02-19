-- ============================================
-- SUPABASE STORAGE POLICIES FOR DOCUMENTS BUCKET
-- Run this in Supabase SQL Editor
-- ============================================

-- Allow public uploads to documents bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow anyone to upload files (for development)
CREATE POLICY "Allow public uploads" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'documents');

-- Policy: Allow anyone to read files (public bucket)
CREATE POLICY "Allow public downloads" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'documents');

-- Policy: Allow anyone to delete files
CREATE POLICY "Allow public deletes" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'documents');

-- Policy: Allow anyone to update files
CREATE POLICY "Allow public updates" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'documents');