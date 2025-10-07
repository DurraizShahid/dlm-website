-- Application Submissions Table
-- Simplified approach without complex auth dependencies

CREATE TABLE application_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 18 AND age <= 100),
  address TEXT NOT NULL,
  cnic TEXT NOT NULL CHECK (cnic ~ '^\d{5}-\d{7}-\d{1}$'),
  idea_title TEXT NOT NULL,
  idea_description TEXT NOT NULL CHECK (length(idea_description) >= 300 AND length(idea_description) <= 500),
  video_url TEXT, -- Stores file path (e.g., 'videos/filename.mp4'), not full URL
  payment_screenshot_url TEXT, -- Stores file path for payment screenshot
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'unpaid', 'paid')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Simple user table for dashboard access (optional)
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for efficient querying
CREATE INDEX idx_application_submissions_created_at ON application_submissions(created_at DESC);
CREATE INDEX idx_application_submissions_email ON application_submissions(email);
CREATE INDEX idx_users_email ON users(email);

-- Enable RLS for basic security
ALTER TABLE application_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Simple policies
CREATE POLICY "Anyone can submit applications" ON application_submissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view their own applications by email" ON application_submissions
  FOR SELECT USING (true); -- Simplified for now

CREATE POLICY "Anyone can update application status" ON application_submissions
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can create user records" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view user records" ON users
  FOR SELECT USING (true); -- Simplified for now

-- Migration: Update existing database constraint to include new status values
-- Run this if you have an existing database:
-- ALTER TABLE application_submissions DROP CONSTRAINT application_submissions_status_check;
-- ALTER TABLE application_submissions ADD CONSTRAINT application_submissions_status_check CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'unpaid', 'paid'));

-- Create storage bucket for video files
INSERT INTO storage.buckets (id, name, public) VALUES ('application-videos', 'application-videos', false);

-- Simple storage policies
CREATE POLICY "Anyone can upload videos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'application-videos');

CREATE POLICY "Anyone can access videos" ON storage.objects
  FOR SELECT USING (bucket_id = 'application-videos');