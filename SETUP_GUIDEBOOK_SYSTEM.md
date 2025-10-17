# Quick Setup Guide - Guidebook Paywall System

## Prerequisites
- Supabase project is set up and running
- Admin credentials: username=`admin`, password=`admin`

## Setup Steps

### Step 1: Apply Database Migration

You need to run the SQL migration to create the `guidebooks` table and seed initial data.

**Option A: Using Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase/migrations/001_add_guidebooks_table.sql`
4. Click **Run** to execute the migration
5. Verify the table was created by checking the **Table Editor**

**Option B: Using Supabase CLI**
```bash
# If you have Supabase CLI installed
supabase db push
```

**Option C: Manually Update schema.sql**
The schema updates are already in `src/integrations/supabase/schema.sql`. If you're setting up a fresh database, just run that entire file.

### Step 2: Verify Setup

1. **Check Admin Panel**
   - Navigate to `http://localhost:8080/admin`
   - Login with: `admin` / `admin`
   - Click on the **Guidebooks** tab
   - You should see 5 guidebooks listed (1 free, 4 paid)

2. **Check User Dashboard**
   - Navigate to `http://localhost:8080/dashboard`
   - Enter any email from your applications
   - Click on **Learning Resources** tab
   - You should see all guidebooks with appropriate access controls

### Step 3: Test the System

**Test Free Guidebooks**:
1. Create a new test user (or use existing without applications)
2. Go to dashboard
3. Verify that "Guidebook #1" shows "Free" badge and is downloadable
4. Verify that Guidebooks #2-5 show lock icons

**Test Paid Guidebooks**:
1. Create a test application and submit it
2. In admin panel, mark it as "approved" or "paid"
3. Go back to user dashboard with that email
4. Verify all guidebooks are now accessible

**Test Admin Management**:
1. Login to admin panel
2. Create a new guidebook
3. Toggle the "Free Access" switch
4. Verify changes reflect immediately in user dashboard

## Configuration Options

### Making a Guidebook Free
In Admin Panel:
1. Go to Guidebooks tab
2. Click "Edit" on any guidebook
3. Toggle "Free Access (No payment required)" to ON
4. Click "Update Guidebook"

### Making a Guidebook Paid
In Admin Panel:
1. Go to Guidebooks tab
2. Click "Edit" on any guidebook
3. Toggle "Free Access (No payment required)" to OFF
4. Click "Update Guidebook"

## Default Configuration

By default, the system is configured with:
- **1 Free Guidebook**: Guidebook #1 (Getting Started)
- **4 Paid Guidebooks**: Guidebooks #2-5

Users can access paid guidebooks if they have:
- At least one application with status: `paid`, `approved`, or `pending`

## Troubleshooting

### Guidebooks Not Showing in User Dashboard
1. Check browser console for errors
2. Verify the database migration was successful
3. Check if the guidebooks table exists in Supabase
4. Verify RLS policies are enabled

### Can't Access Admin Guidebooks Tab
1. Clear browser cache
2. Verify you're logged in as admin
3. Check browser console for errors

### Guidebooks Table Doesn't Exist
1. Re-run the migration script
2. Check Supabase logs for errors
3. Manually verify table creation in Supabase Table Editor

### Free Guidebooks Still Locked
1. Check if `is_free` field is set to `true` in database
2. Verify the guidebook card shows "Free" badge
3. Clear browser cache and refresh

## File Locations

- **Database Schema**: `src/integrations/supabase/schema.sql`
- **Migration Script**: `supabase/migrations/001_add_guidebooks_table.sql`
- **Admin UI**: `src/pages/Admin.tsx`
- **User Dashboard**: `src/components/UserDashboard.tsx`
- **Types**: `src/integrations/supabase/types.ts`
- **Documentation**: `GUIDEBOOK_PAYWALL_IMPLEMENTATION.md`

## Next Steps

After setup is complete:

1. **Add Your Guidebooks**: Upload actual PDF files to `/public/guidebooks/` directory
2. **Customize Access Rules**: Modify the access logic in `UserDashboard.tsx` if needed
3. **Add More Guidebooks**: Use the admin panel to add more guidebooks
4. **Configure Translations**: Add translations for new guidebook titles in `src/i18n/translations.ts`

## Support

If you encounter any issues:
1. Check the implementation documentation in `GUIDEBOOK_PAYWALL_IMPLEMENTATION.md`
2. Review the database schema and migration script
3. Check browser console and network tab for errors
4. Verify all files were saved and the dev server was restarted

---

**Status**: ✅ Ready to Use
**Last Updated**: October 17, 2025

