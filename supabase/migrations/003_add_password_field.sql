-- Add password_hash field to application_submissions table
ALTER TABLE application_submissions ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Note: We're storing passwords in the application_submissions table for simplicity
-- In production, you might want a separate users table
-- Passwords should be hashed before storing (handled in the application layer)

