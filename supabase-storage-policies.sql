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

-- ============================================
-- FIX EXISTING DOCUMENT URLs WITH DOUBLED PATH
-- Run this ONCE to fix existing records with incorrect URLs
-- ============================================

-- Update file_url to remove doubled "documents" path
-- Example: documents/documents/userId/file.jpg -> documents/userId/file.jpg
UPDATE vault_documents
SET file_url = REPLACE(file_url, '/documents/documents/', '/documents/')
WHERE file_url LIKE '%/documents/documents/%';

-- Verify the fix (run this to check)
SELECT id, title, file_url 
FROM vault_documents 
ORDER BY created_at DESC;
