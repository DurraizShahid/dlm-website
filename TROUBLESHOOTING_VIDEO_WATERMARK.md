# Troubleshooting Video Watermark Function

## Common Issues and Solutions

### 1. "Failed to execute 'json' on 'Response': Unexpected end of JSON input"

This error occurs when the function doesn't return valid JSON. Possible causes:

#### a) Function not deployed properly
- **Solution**: Redeploy the function:
  ```bash
  npx supabase functions deploy video-watermark
  ```

#### b) Missing environment variables
- **Solution**: Check that `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set in the Supabase dashboard.

#### c) Invalid video path
- **Solution**: Ensure the video path exists in the `application-videos` storage bucket.

#### d) Storage permissions
- **Solution**: Check that the service role key has proper permissions to read from and write to the storage bucket.

### 2. "404 Not Found" Error

This occurs when the video file doesn't exist at the specified path.

#### Solution:
1. Verify the video path is correct
2. Check that the file exists in the Supabase storage bucket
3. Ensure the path format is correct (e.g., `videos/filename.mp4`)

### 3. "401 Unauthorized" Error

This occurs when the function doesn't have proper authentication.

#### Solution:
1. Ensure the function is deployed with proper environment variables
2. Check that `SUPABASE_SERVICE_ROLE_KEY` is correctly set

### 4. "500 Internal Server Error"

This indicates a server-side issue with the function.

#### Solution:
1. Check the Supabase function logs in the dashboard
2. Look for specific error messages in the logs
3. Verify that all required dependencies are available

## Debugging Steps

### 1. Check Function Deployment Status
```bash
npx supabase functions list
```

### 2. Test Function Locally (requires Docker)
```bash
npx supabase functions serve
```

### 3. Test with cURL
```bash
curl -X POST "YOUR_SUPABASE_URL/functions/v1/video-watermark" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -d '{"videoPath":"videos/sample.mp4"}'
```

### 4. Check Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to Functions > video-watermark
3. Check the logs for any error messages

## Testing the Function

### Using the Test HTML Page
1. Open `test-video-watermark.html` in your browser
2. Enter a valid video path
3. Click "Test Function"
4. Check the results

### Using Browser Developer Tools
1. Open the Admin page
2. Open Developer Tools (F12)
3. Go to the Network tab
4. Click "Download with Watermark" button
5. Look for the `/functions/v1/video-watermark` request
6. Check the request and response details

## Environment Requirements

### Local Development
- Docker Desktop (required for local Supabase functions)
- Supabase CLI
- Node.js

### Production
- Properly configured Supabase project
- Service role key with storage permissions
- Correct environment variables

## Function Logs

To view detailed logs:
1. Go to Supabase Dashboard
2. Navigate to Functions
3. Click on the `video-watermark` function
4. Check the "Logs" tab

Common log messages:
- "Video watermarking function called" - Function started
- "Request body: ..." - Incoming request data
- "Parsed videoPath: ..." - Extracted video path
- "Downloading video from path: ..." - Starting download
- "Creating watermarked video with path: ..." - Processing video
- "Successfully processed video" - Function completed successfully

## Storage Permissions

Ensure the service role key has these permissions:
- Read access to `application-videos` bucket
- Write access to `application-videos` bucket
- List access to storage objects

## Common Video Path Formats

Correct formats:
- `videos/filename.mp4`
- `videos/subfolder/filename.mp4`

Incorrect formats:
- `/videos/filename.mp4` (leading slash)
- `filename.mp4` (missing folder)
- `videos\filename.mp4` (backslashes on Windows)

## Support

If you continue to experience issues:
1. Check all the above troubleshooting steps
2. Verify the function is properly deployed
3. Check Supabase function logs for specific error messages
4. Contact Supabase support if the issue persists