# Video URL Storage and Access Fix

## Problem
Users were experiencing "Bucket not found" errors when trying to access uploaded videos through the dashboard. The error occurred because we were storing public URLs in the database, but the Supabase Storage bucket requires signed URLs for access.

**Error Details:**
```json
{
  "statusCode": "404",
  "error": "Bucket not found", 
  "message": "Bucket not found"
}
```

**Problematic URL format:** 
```
https://extalgkjlveevbkcpkuz.supabase.co/storage/v1/object/public/application-videos/videos/1759554065440_ghc1shz1a7g.mp4
```

**Correct signed URL format:**
```
https://extalgkjlveevbkcpkuz.supabase.co/storage/v1/object/sign/application-videos/videos/1759554065440_ghc1shz1a7g.mp4?token=eyJraWQiOi...
```

## Solution

### 1. Updated Video Upload Process
- **Before:** Stored full public URLs in the database
- **After:** Store only file paths (e.g., `videos/filename.mp4`) in the database
- **Benefits:** More flexible, allows for different URL generation strategies

### 2. Dynamic Signed URL Generation
- Created utility function `generateVideoSignedUrl()` to create signed URLs on-demand
- Signed URLs are valid for 1 hour by default
- URLs are generated only when users want to view videos

### 3. Files Modified

#### `src/components/ApplyForm.tsx`
```typescript
// OLD: Stored public URL
const { data: { publicUrl } } = supabase.storage
  .from('application-videos')
  .getPublicUrl(filePath);
return publicUrl;

// NEW: Store just the file path
console.log('Video uploaded successfully to path:', filePath);
return filePath; // Just return the path, not URL
```

#### `src/components/UserDashboard.tsx`
```typescript
// NEW: Generate signed URL when viewing
const handleViewVideo = async (filePath: string) => {
  const signedUrl = await generateVideoSignedUrl(filePath);
  if (signedUrl) {
    window.open(signedUrl, '_blank');
  }
};
```

#### `src/utils/videoUtils.ts` (New file)
```typescript
export const generateVideoSignedUrl = async (
  filePath: string, 
  expiresIn: number = 3600
): Promise<string | null> => {
  const { data, error } = await supabase.storage
    .from('application-videos')
    .createSignedUrl(filePath, expiresIn);
  
  return error ? null : data.signedUrl;
};
```

### 4. Database Schema Update
Updated the schema comment to clarify that `video_url` stores file paths:
```sql
video_url TEXT, -- Stores file path (e.g., 'videos/filename.mp4'), not full URL
```

## Key Improvements

1. **Security:** Signed URLs provide temporary, secure access to videos
2. **Flexibility:** Can easily change URL generation strategy without database migration
3. **Error Handling:** Better error handling for video access issues
4. **Performance:** URLs are generated on-demand, reducing database storage
5. **Maintainability:** Centralized video URL logic in utility functions

## Testing

After applying these changes:
1. Submit a new application with a video
2. Access the dashboard using your email
3. Click "View Video" button on any application
4. Video should open in a new tab with the correct signed URL

## Backward Compatibility

**Note:** Existing applications in the database that have full URLs stored in `video_url` will need to be migrated. The file paths can be extracted from the existing URLs by removing the domain and `/storage/v1/object/public/application-videos/` prefix.

## Future Enhancements

1. **Video thumbnails:** Generate and store thumbnail images
2. **Video metadata:** Store file size, duration, format information
3. **Caching:** Cache signed URLs for short periods to improve performance
4. **Video player:** Embed video player directly in dashboard instead of opening new tab