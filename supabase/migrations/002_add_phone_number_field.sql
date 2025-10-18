-- Add phone_number field to application_submissions table
ALTER TABLE application_submissions ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Add index for efficient querying by phone number
CREATE INDEX IF NOT EXISTS idx_application_submissions_phone ON application_submissions(phone_number);

-- Update RLS policies to allow querying by phone number as well
-- (No changes needed as we already have permissive policies)

