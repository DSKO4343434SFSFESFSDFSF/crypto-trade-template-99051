-- Add columns for front and back KYC documents
ALTER TABLE public.profiles
DROP COLUMN IF EXISTS kyc_document_url,
ADD COLUMN kyc_document_front_url TEXT,
ADD COLUMN kyc_document_back_url TEXT;

-- Update RLS policies for KYC documents bucket
DROP POLICY IF EXISTS "Users can upload their own KYC documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own KYC documents" ON storage.objects;

-- Allow authenticated users to upload their own KYC documents
CREATE POLICY "Users can upload their own KYC documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'kyc-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to view their own KYC documents
CREATE POLICY "Users can view their own KYC documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'kyc-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);