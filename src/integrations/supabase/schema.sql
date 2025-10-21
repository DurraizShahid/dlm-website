-- Application Submissions Table
-- Simplified approach without complex auth dependencies

CREATE TABLE application_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT, -- Pakistani phone number
  age INTEGER NOT NULL CHECK (age >= 0 AND age <= 100),
  address TEXT NOT NULL,
  cnic TEXT NOT NULL CHECK (cnic ~ '^\d{5}-\d{7}-\d{1}$'),
  idea_title TEXT NOT NULL,
  idea_description TEXT NOT NULL CHECK (length(idea_description) >= 300 AND length(idea_description) <= 500),
  video_url TEXT, -- Stores file path (e.g., 'videos/filename.mp4'), not full URL
  payment_screenshot_url TEXT, -- Stores file path for payment screenshot
  password_hash TEXT, -- Hashed password for dashboard login
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
CREATE INDEX idx_application_submissions_phone ON application_submissions(phone_number);
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

-- Guidebooks Table
CREATE TABLE guidebooks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Path to the PDF file (e.g., '/guidebooks/guidebook1.pdf')
  is_free BOOLEAN DEFAULT false, -- Whether the guidebook is free or requires payment
  order_index INTEGER NOT NULL DEFAULT 0, -- For ordering the guidebooks
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index for efficient querying of guidebooks
CREATE INDEX idx_guidebooks_order ON guidebooks(order_index ASC);
CREATE INDEX idx_guidebooks_is_free ON guidebooks(is_free);

-- Enable RLS for guidebooks
ALTER TABLE guidebooks ENABLE ROW LEVEL SECURITY;

-- Policies for guidebooks
CREATE POLICY "Anyone can view guidebooks" ON guidebooks
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert guidebooks" ON guidebooks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update guidebooks" ON guidebooks
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can delete guidebooks" ON guidebooks
  FOR DELETE USING (true);

-- Insert default guidebooks data
INSERT INTO guidebooks (title, description, category, file_path, is_free, order_index) VALUES
  ('Guidebook #1', 'Essential first steps for entrepreneurs and business fundamentals', 'Getting Started', '/guidebooks/guidebook1.pdf', true, 1),
  ('Guidebook #2', 'Comprehensive guide to creating effective business plans and strategies', 'Business Planning', '/guidebooks/guidebook2.pdf', false, 2),
  ('Guidebook #3', 'Marketing strategies and customer acquisition techniques for new businesses', 'Marketing', '/guidebooks/guidebook3.pdf', false, 3),
  ('Guidebook #4', 'Financial management, funding options, and investment strategies', 'Finance', '/guidebooks/guidebook4.pdf', false, 4),
  ('Guidebook #5', 'Scaling your business, team building, and sustainable growth practices', 'Growth & Scale', '/guidebooks/guidebook5.pdf', false, 5);