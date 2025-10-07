-- Create storage bucket for KYC documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('kyc-documents', 'kyc-documents', false);

-- Add KYC fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN kyc_document_type TEXT,
ADD COLUMN kyc_document_url TEXT,
ADD COLUMN kyc_verified BOOLEAN DEFAULT false;

-- RLS policies for KYC documents bucket
CREATE POLICY "Users can upload their own KYC documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'kyc-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own KYC documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'kyc-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);