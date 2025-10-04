# Apply Form Setup Instructions

## Overview
I've successfully created a comprehensive apply form for your DLM project with all the requested features:

### Features Implemented:
- ✅ Full Name field with validation (min 2 characters)
- ✅ Age field with validation (18-100 years)
- ✅ Address field with validation (min 5 characters)
- ✅ Pakistani CNIC number field with regex validation (format: 12345-1234567-1)
- ✅ Idea Title field with validation (min 5 characters)
- ✅ Idea Description field with validation (300-500 characters)
- ✅ Video upload with file type validation (.mp4, .mov, .avi) and size limit (200MB)
- ✅ Form submission to Supabase database
- ✅ Multi-language support (English/Urdu)
- ✅ Beautiful responsive UI with gradient styling
- ✅ Toast notifications for user feedback
- ✅ Loading states and error handling

## Files Created/Modified:

### New Components:
- `src/components/ApplyForm.tsx` - Main form component
- `src/pages/Apply.tsx` - Apply page wrapper
- `src/types/apply-form.ts` - TypeScript types and Zod validation schemas
- `src/integrations/supabase/client.ts` - Supabase client configuration
- `src/integrations/supabase/types.ts` - Database types
- `src/integrations/supabase/schema.sql` - Database schema (needs to be run)

### Modified Files:
- `src/App.tsx` - Added `/apply` route
- `src/components/Navbar.tsx` - Added Apply link to navigation
- `src/i18n/translations.ts` - Added translation keys for form

## Database Setup Required:

### 1. Create Supabase Project
If you haven't already, create a new Supabase project at https://supabase.com

### 2. Environment Variables
Create a `.env` file in your project root with:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run Database Schema
Execute the SQL in `src/integrations/supabase/schema.sql` in your Supabase SQL editor:
- Creates `application_submissions` table
- Sets up Row Level Security (RLS) policies
- Creates storage bucket for videos
- Sets up storage policies

### 4. Storage Setup
The form automatically creates the storage bucket, but you may need to verify:
- Bucket name: `application-videos`
- Public access: false (videos are private by default)

## How to Test:

1. **Navigate to Apply Page**: Go to `/apply` or click "Apply" in the navigation
2. **Fill Out Form**: All fields have validation - you'll see real-time error messages
3. **Upload Video**: Drag & drop or click to browse for video files
4. **Submit**: The form will upload the video first, then save the application to the database
5. **Success**: You'll see a success toast and the form will reset

## Form Validation Rules:

- **Full Name**: 2-100 characters
- **Age**: 18-100 years (number input)
- **Address**: 5-200 characters
- **CNIC**: Must match Pakistani format: 12345-1234567-1
- **Idea Title**: 5-100 characters
- **Idea Description**: 300-500 characters (with character counter)
- **Video**: Required, .mp4/.mov/.avi only, max 200MB

## Database Schema:

The `application_submissions` table stores:
- `id` (UUID, auto-generated)
- `full_name` (TEXT)
- `age` (INTEGER)
- `address` (TEXT)
- `cnic` (TEXT)
- `idea_title` (TEXT)
- `idea_description` (TEXT)
- `video_url` (TEXT, nullable)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## Next Steps:

1. Set up your Supabase project and add environment variables
2. Run the database schema
3. Test the form functionality
4. Optionally: Add an admin dashboard to view submissions
5. Optionally: Add email notifications when forms are submitted

The apply form is now fully functional and ready for users to submit their ideas!