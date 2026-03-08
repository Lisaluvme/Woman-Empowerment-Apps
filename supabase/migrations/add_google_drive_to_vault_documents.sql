-- Migration: Add Google Drive support to vault_documents table
-- This adds columns to support storing documents in Google Drive
-- while keeping existing Supabase Storage files accessible

-- Add columns for Google Drive integration
ALTER TABLE vault_documents
ADD COLUMN IF NOT EXISTS storage_backend TEXT DEFAULT 'supabase',
ADD COLUMN IF NOT EXISTS google_drive_file_id TEXT,
ADD COLUMN IF NOT EXISTS google_drive_web_view_link TEXT;

-- Add comment for documentation
COMMENT ON COLUMN vault_documents.storage_backend IS 'Storage backend: "supabase" or "google_drive"';
COMMENT ON COLUMN vault_documents.google_drive_file_id IS 'Google Drive file ID (only for Drive files)';
COMMENT ON COLUMN vault_documents.google_drive_web_view_link IS 'Google Drive web view link (only for Drive files)';

-- Create index on storage_backend for faster filtering
CREATE INDEX IF NOT EXISTS idx_vault_documents_storage_backend
ON vault_documents(storage_backend);

-- Create index on google_drive_file_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_vault_documents_drive_file_id
ON vault_documents(google_drive_file_id);

-- Migration complete
-- Existing files will have storage_backend='supabase' by default
-- New files uploaded to Drive will have storage_backend='google_drive'
