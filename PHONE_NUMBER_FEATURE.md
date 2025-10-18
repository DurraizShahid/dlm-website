# Phone Number Feature Implementation

## Overview
Added phone number field to the application form and enabled login via email or phone number in the dashboard.

## Changes Made

### 1. Database Migration
- **File**: `supabase/migrations/002_add_phone_number_field.sql`
- Added `phone_number` field to `application_submissions` table
- Created index for efficient phone number queries

### 2. Type Definitions
- **Files**: 
  - `src/types/apply-form.ts`
  - `src/integrations/supabase/types.ts`
  - `src/integrations/supabase/schema.sql`
- Updated all type definitions to include `phone_number` field
- Added phone number validation in form schema (supports Pakistani phone numbers: `03001234567` or `+923001234567`)

### 3. Apply Form Component
- **File**: `src/components/ApplyForm.tsx`
- Added phone number field to the form (between email and address)
- Updated form submission to include phone number
- Modified auto-login redirect to support both email and phone number

### 4. Dashboard Component
- **File**: `src/pages/Dashboard.tsx`
- Updated login form to accept "Email or Phone Number"
- Implemented smart detection (checks for '@' to determine if input is email or phone)
- Updated auto-login from apply form to handle both email and phone parameters
- Modified all state and function names to be generic (using `loginIdentifier` instead of just `email`)

## How It Works

### Apply Form Flow
1. User fills out application including phone number
2. On submission, phone number is saved to database
3. After successful submission:
   - If email is provided → redirects to `/dashboard?email=...`
   - If email is not provided but phone is → redirects to `/dashboard?phone=...`

### Dashboard Login Flow
1. User can enter either email or phone number
2. System detects input type:
   - Contains '@' → queries by email
   - Otherwise → queries by phone number
3. Fetches and displays all applications for that identifier

### Auto-Login Flow
1. When user is redirected from apply form:
   - URL parameter `email` or `phone` is detected
   - Automatically logs in using the appropriate field
   - Shows user's applications

## Database Migration Instructions

To apply the database migration, run this SQL in your Supabase SQL Editor:

```sql
-- Add phone_number field to application_submissions table
ALTER TABLE application_submissions ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Add index for efficient querying by phone number
CREATE INDEX IF NOT EXISTS idx_application_submissions_phone ON application_submissions(phone_number);
```

Alternatively, if you're using Supabase CLI:

```bash
supabase db push
```

## Phone Number Format

The phone number field accepts Pakistani phone numbers in the following formats:
- `03001234567` (11 digits starting with 0)
- `+923001234567` (with country code)
- `923001234567` (country code without +)

The validation regex: `/^(\+92|0)?[0-9]{10}$/`

## Testing

1. **Test Apply Form**:
   - Go to `http://localhost:8080/apply`
   - Fill out the form including phone number
   - Submit and verify redirect to dashboard

2. **Test Dashboard Login**:
   - Go to `http://localhost:8080/dashboard`
   - Try logging in with email
   - Try logging in with phone number
   - Verify both work correctly

3. **Test Auto-Login**:
   - Submit a new application
   - Verify automatic redirect and login to dashboard

## Notes

- Phone number is optional in the database (can be NULL)
- Email is still required for now
- The system gracefully handles missing email or phone
- Dashboard detects input type automatically (no need for separate tabs/buttons)

