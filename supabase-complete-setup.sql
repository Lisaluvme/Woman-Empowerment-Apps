-- ============================================
-- COMPLETE SUPABASE SETUP FOR WOMAN EMPOWERMENT APP
-- Run this entire script in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. STORAGE BUCKET & POLICIES
-- ============================================

-- Create documents bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist (to avoid duplicates)
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public downloads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes" ON storage.objects;
DROP POLICY IF EXISTS "Allow public updates" ON storage.objects;

-- Policy: Allow anyone to upload files
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
-- 2. DATABASE TABLES
-- ============================================

-- Create vault_documents table
CREATE TABLE IF NOT EXISTS vault_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    firebase_uid TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'personal',
    file_url TEXT NOT NULL,
    file_type TEXT,
    file_size BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create journals table
CREATE TABLE IF NOT EXISTS journals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    firebase_uid TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    type TEXT DEFAULT 'personal',
    mood TEXT,
    entry_date DATE,
    entry_time TEXT,
    entry_datetime TIMESTAMP WITH TIME ZONE,
    media_urls TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE vault_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE journals ENABLE ROW LEVEL SECURITY;

-- Drop existing RLS policies if they exist
DROP POLICY IF EXISTS "Users can view own documents" ON vault_documents;
DROP POLICY IF EXISTS "Users can insert own documents" ON vault_documents;
DROP POLICY IF EXISTS "Users can update own documents" ON vault_documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON vault_documents;
DROP POLICY IF EXISTS "Users can view own journals" ON journals;
DROP POLICY IF EXISTS "Users can insert own journals" ON journals;
DROP POLICY IF EXISTS "Users can update own journals" ON journals;
DROP POLICY IF EXISTS "Users can delete own journals" ON journals;

-- RLS Policies for vault_documents
CREATE POLICY "Users can view own documents" ON vault_documents
    FOR SELECT USING (firebase_uid = current_setting('request.jwt.claims->>sub', true));

CREATE POLICY "Users can insert own documents" ON vault_documents
    FOR INSERT WITH CHECK (firebase_uid = current_setting('request.jwt.claims->>sub', true));

CREATE POLICY "Users can update own documents" ON vault_documents
    FOR UPDATE USING (firebase_uid = current_setting('request.jwt.claims->>sub', true));

CREATE POLICY "Users can delete own documents" ON vault_documents
    FOR DELETE USING (firebase_uid = current_setting('request.jwt.claims->>sub', true));

-- RLS Policies for journals (allow all for development since we use Firebase Auth)
CREATE POLICY "Allow all journal reads" ON journals FOR SELECT USING (true);
CREATE POLICY "Allow all journal inserts" ON journals FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all journal updates" ON journals FOR UPDATE USING (true);
CREATE POLICY "Allow all journal deletes" ON journals FOR DELETE USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vault_documents_firebase_uid ON vault_documents(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_vault_documents_created_at ON vault_documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_journals_firebase_uid ON journals(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_journals_entry_date ON journals(entry_date DESC);

-- ============================================
-- 3. FIX EXISTING DOCUMENT URLs (RUN ONCE)
-- ============================================

-- Fix URLs with doubled "documents" path
UPDATE vault_documents
SET file_url = REPLACE(file_url, '/documents/documents/', '/documents/')
WHERE file_url LIKE '%/documents/documents/%';

-- ============================================
-- 4. ENABLE REALTIME (for live updates)
-- ============================================

-- Enable realtime for vault_documents table
ALTER PUBLICATION supabase_realtime ADD TABLE vault_documents;
ALTER PUBLICATION supabase_realtime ADD TABLE journals;

-- ============================================
-- DONE! Your Supabase is now fully configured.
-- ============================================