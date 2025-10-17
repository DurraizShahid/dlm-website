-- Migration: Add Guidebooks Table and Initial Data
-- This migration adds support for configurable guidebooks with paywall functionality

-- Create Guidebooks Table
CREATE TABLE IF NOT EXISTS guidebooks (
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

-- Create indexes for efficient querying of guidebooks
CREATE INDEX IF NOT EXISTS idx_guidebooks_order ON guidebooks(order_index ASC);
CREATE INDEX IF NOT EXISTS idx_guidebooks_is_free ON guidebooks(is_free);

-- Enable RLS for guidebooks
ALTER TABLE guidebooks ENABLE ROW LEVEL SECURITY;

-- Policies for guidebooks
-- Allow anyone to view guidebooks
CREATE POLICY "Anyone can view guidebooks" ON guidebooks
  FOR SELECT USING (true);

-- Allow anyone to insert guidebooks (for admin purposes)
CREATE POLICY "Anyone can insert guidebooks" ON guidebooks
  FOR INSERT WITH CHECK (true);

-- Allow anyone to update guidebooks (for admin purposes)
CREATE POLICY "Anyone can update guidebooks" ON guidebooks
  FOR UPDATE USING (true) WITH CHECK (true);

-- Allow anyone to delete guidebooks (for admin purposes)
CREATE POLICY "Anyone can delete guidebooks" ON guidebooks
  FOR DELETE USING (true);

-- Insert default guidebooks data
-- First guidebook is free, rest are behind paywall
INSERT INTO guidebooks (title, description, category, file_path, is_free, order_index) VALUES
  ('Guidebook #1', 'Essential first steps for entrepreneurs and business fundamentals', 'Getting Started', '/guidebooks/guidebook1.pdf', true, 1),
  ('Guidebook #2', 'Comprehensive guide to creating effective business plans and strategies', 'Business Planning', '/guidebooks/guidebook2.pdf', false, 2),
  ('Guidebook #3', 'Marketing strategies and customer acquisition techniques for new businesses', 'Marketing', '/guidebooks/guidebook3.pdf', false, 3),
  ('Guidebook #4', 'Financial management, funding options, and investment strategies', 'Finance', '/guidebooks/guidebook4.pdf', false, 4),
  ('Guidebook #5', 'Scaling your business, team building, and sustainable growth practices', 'Growth & Scale', '/guidebooks/guidebook5.pdf', false, 5)
ON CONFLICT DO NOTHING;

