-- Add Google Drive columns to vault_documents table
-- Run this in Supabase SQL Editor

ALTER TABLE vault_documents
  ADD COLUMN IF NOT EXISTS storage_backend TEXT DEFAULT 'supabase_storage',
  ADD COLUMN IF NOT EXISTS google_drive_file_id TEXT,
  ADD COLUMN IF NOT EXISTS google_drive_web_view_link TEXT,
  ADD COLUMN IF NOT EXISTS google_drive_mimetype TEXT,
  ADD COLUMN IF NOT EXISTS google_drive_size BIGINT;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_vault_documents_storage_backend
  ON vault_documents(storage_backend);

-- Verify the columns were added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'vault_documents'
  AND column_name IN (
    'storage_backend',
    'google_drive_file_id',
    'google_drive_web_view_link',
    'google_drive_mimetype',
    'google_drive_size'
  );
