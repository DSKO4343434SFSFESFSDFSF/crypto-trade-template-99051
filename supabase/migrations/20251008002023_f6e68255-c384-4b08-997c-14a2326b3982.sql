-- Storage RLS policies for kyc-documents bucket
-- Drop existing conflicting policies (safe if they don't exist)
drop policy if exists "KYC: users can read their own files" on storage.objects;
drop policy if exists "KYC: users can upload their own files" on storage.objects;
drop policy if exists "KYC: users can update their own files" on storage.objects;
drop policy if exists "KYC: users can delete their own files" on storage.objects;

-- Create read policy
create policy "KYC: users can read their own files"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'kyc-documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create insert policy
create policy "KYC: users can upload their own files"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'kyc-documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create update policy
create policy "KYC: users can update their own files"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'kyc-documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'kyc-documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create delete policy
create policy "KYC: users can delete their own files"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'kyc-documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );