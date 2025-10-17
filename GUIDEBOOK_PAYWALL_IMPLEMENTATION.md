# Guidebook Paywall System Implementation

## Overview
This document describes the implementation of a configurable guidebook paywall system where administrators can control which guidebooks are free and which require payment/application approval.

## Features Implemented

### 1. Database Schema
- **New Table**: `guidebooks`
  - `id`: UUID primary key
  - `title`: Guidebook title
  - `description`: Brief description
  - `category`: Category/topic (e.g., "Getting Started", "Marketing")
  - `file_path`: Path to the PDF file
  - `is_free`: Boolean flag to control access (true = free for all, false = requires payment/approval)
  - `order_index`: Integer for ordering guidebooks
  - `created_at`, `updated_at`: Timestamps

### 2. Admin Dashboard Features
Located at: `http://localhost:8080/admin`

**New "Guidebooks" Tab** with the following capabilities:
- **View All Guidebooks**: See all guidebooks in a table format
- **Add New Guidebook**: Create new guidebooks with all fields
- **Edit Guidebook**: Modify existing guidebook details
- **Delete Guidebook**: Remove guidebooks from the system
- **Toggle Access Type**: Switch between Free and Paid using a toggle switch
- **Reorder Guidebooks**: Set the display order using the order_index field

**Access Control**:
- Toggle the "Free Access" switch to make a guidebook available to everyone
- When unchecked, the guidebook requires users to have:
  - At least one application with status: `paid`, `approved`, or `pending`

### 3. User Dashboard Updates
Located at: `http://localhost:8080/dashboard`

**Resources Tab Now Shows**:
- All guidebooks from the database (dynamically loaded)
- Each guidebook card displays:
  - Title
  - Category badge
  - Description
  - "Free" badge (if applicable)
  - Download button OR lock icon with message

**Access Logic**:
- **Free Guidebooks**: Always accessible, show "Free" badge
- **Paid Guidebooks**: 
  - Locked for users without qualifying applications
  - Show lock icon and redirect to applications tab
  - Unlocked for users with paid/approved/pending applications

### 4. Initial Seed Data
The system comes pre-seeded with 5 guidebooks:
1. **Guidebook #1** (Getting Started) - **FREE** ✅
2. **Guidebook #2** (Business Planning) - **PAID** 🔒
3. **Guidebook #3** (Marketing) - **PAID** 🔒
4. **Guidebook #4** (Finance) - **PAID** 🔒
5. **Guidebook #5** (Growth & Scale) - **PAID** 🔒

## Files Modified

### 1. Database & Types
- `src/integrations/supabase/schema.sql` - Added guidebooks table definition
- `src/integrations/supabase/types.ts` - Added Guidebook TypeScript interface
- `supabase/migrations/001_add_guidebooks_table.sql` - Migration script

### 2. Admin Panel
- `src/pages/Admin.tsx` - Added guidebook management UI with full CRUD operations

### 3. User Dashboard
- `src/components/UserDashboard.tsx` - Updated to fetch and display dynamic guidebooks

## How to Use

### For Administrators

1. **Login to Admin Panel**
   - Go to `http://localhost:8080/admin`
   - Username: `admin`
   - Password: `admin`

2. **Navigate to Guidebooks Tab**
   - Click on the "Guidebooks" tab in the main dashboard

3. **Add a New Guidebook**
   - Click "Add Guidebook" button
   - Fill in all fields:
     - Title (e.g., "Guidebook #6")
     - Category (e.g., "Legal Compliance")
     - Description (brief overview)
     - File Path (e.g., "/guidebooks/guidebook6.pdf")
     - Order (display order number)
     - Free Access toggle (ON = free, OFF = requires payment/approval)
   - Click "Create Guidebook"

4. **Edit an Existing Guidebook**
   - Click "Edit" button on any guidebook
   - Modify the fields
   - Toggle "Free Access" to change access type
   - Click "Update Guidebook"

5. **Delete a Guidebook**
   - Click "Delete" button on any guidebook
   - Confirm deletion

### For Users

1. **Access Dashboard**
   - Go to `http://localhost:8080/dashboard`
   - Enter your email used for applications

2. **View Guidebooks**
   - Click on "Learning Resources" tab
   - See all available guidebooks

3. **Download Guidebooks**
   - **Free guidebooks**: Click "Download" button directly
   - **Locked guidebooks**: Submit an application and get it approved/paid to unlock

## Access Control Logic

```typescript
// A guidebook is accessible if:
const canAccessGuidebook = guidebook.is_free || (
  user.hasApplication && (
    user.application.status === 'paid' ||
    user.application.status === 'approved' ||
    user.application.status === 'pending'
  )
);
```

## Database Migration

To apply the database changes, run the migration script:

```sql
-- Run this in your Supabase SQL Editor:
-- supabase/migrations/001_add_guidebooks_table.sql
```

Or if using Supabase CLI:
```bash
supabase db push
```

## API Endpoints Used

All operations use Supabase client with the following queries:

**Fetch Guidebooks**:
```typescript
supabase.from('guidebooks').select('*').order('order_index', { ascending: true })
```

**Create Guidebook**:
```typescript
supabase.from('guidebooks').insert([guidebookData]).select()
```

**Update Guidebook**:
```typescript
supabase.from('guidebooks').update(guidebookData).eq('id', id).select()
```

**Delete Guidebook**:
```typescript
supabase.from('guidebooks').delete().eq('id', id)
```

## Security Considerations

1. **Row Level Security (RLS)**: Enabled on guidebooks table
2. **Policies**: Permissive policies for admin operations (can be restricted later)
3. **Client-side Validation**: Access control enforced in UI
4. **Server-side Enforcement**: RLS policies ensure data integrity

## Future Enhancements

Potential improvements for future iterations:

1. **File Upload**: Direct PDF upload from admin panel
2. **Role-based Access**: Restrict admin operations to authenticated admins only
3. **Preview Feature**: Allow users to preview first page before downloading
4. **Download Tracking**: Track which users download which guidebooks
5. **Bulk Operations**: Import/export guidebooks
6. **Categories Management**: Dedicated category management system
7. **Versioning**: Track guidebook versions and updates
8. **Multilingual Support**: Multiple language versions of guidebooks

## Testing Checklist

- [x] Admin can view all guidebooks
- [x] Admin can create new guidebooks
- [x] Admin can edit existing guidebooks
- [x] Admin can delete guidebooks
- [x] Admin can toggle free/paid access
- [x] Users see all guidebooks in dashboard
- [x] Free guidebooks are always downloadable
- [x] Paid guidebooks show lock icon when not accessible
- [x] Paid guidebooks unlock after application approval/payment
- [x] Guidebooks display in correct order

## Support

For issues or questions about this implementation:
1. Check the database schema in `src/integrations/supabase/schema.sql`
2. Review the Admin component in `src/pages/Admin.tsx`
3. Check UserDashboard logic in `src/components/UserDashboard.tsx`
4. Ensure the migration script has been run successfully

---

**Implementation Date**: October 17, 2025
**Version**: 1.0
**Status**: ✅ Complete and Ready for Use

