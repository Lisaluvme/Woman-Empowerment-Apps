-- ============================================
-- SIMPLE FIX SCRIPT - Run this in Supabase SQL Editor
-- ============================================

-- FIX EXISTING DOCUMENT URLs (removes doubled "documents" path)
UPDATE vault_documents
SET file_url = REPLACE(file_url, '/documents/documents/', '/documents/')
WHERE file_url LIKE '%/documents/documents/%';

-- VERIFY THE FIX (shows updated records)
SELECT id, title, file_url, created_at 
FROM vault_documents 
ORDER BY created_at DESC;

-- DONE! Check the results above to confirm URLs are fixed.
-- URLs should now look like: .../documents/userId/filename.jpg
-- NOT like: .../documents/documents/userId/filename.jpg