# TikTok Integration Troubleshooting Guide

This document provides solutions for common issues encountered with the TikTok integration.

## Current Issue: Requests Still Going Directly to TikTok API

Based on the network tab information, requests are still going directly to `https://open.tiktokapis.com/v2/post/publish/inbox/video/init/` instead of using our proxy. This indicates that our proxy implementation isn't being used.

## Root Cause Analysis

The network tab shows:
1. Requests going directly to TikTok API (`https://open.tiktokapis.com/v2/...`)
2. CORS error blocking these requests
3. 404 preflight error

This means the JavaScript code is still using direct requests instead of our proxy function.

## Immediate Solutions

### Solution 1: Force Refresh the Application
1. Hard refresh the page (Ctrl+F5 or Cmd+Shift+R)
2. Clear browser cache completely
3. Try posting to TikTok again

### Solution 2: Verify Build Process
If you're using a build process:
1. Rebuild the application completely
2. Redeploy with the updated code
3. Verify that the environment variables are correctly set

### Solution 3: Test Proxy Independently
Use the debug files to verify the proxy works:
1. Open `debug-proxy.html` in your browser
2. Click "Test Proxy Connection"
3. Verify it returns a response (likely 401 Unauthorized without token, but no CORS error)

## How to Verify the Fix

### Check Browser Console
Look for these specific log messages:
```
=== TikTok Utilities Loaded ===
TikTok Proxy URL: https://extalgkjlveevbkcpkuz.supabase.co/functions/v1/tiktok-proxy
==============================
```

And during a TikTok post attempt:
```
=== Making TikTok API Request ===
Endpoint: /post/publish/inbox/video/init/
Proxy URL: https://extalgkjlveevbkcpkuz.supabase.co/functions/v1/tiktok-proxy
```

### Check Network Tab
Verify requests are going to:
✅ `https://extalgkjlveevbkcpkuz.supabase.co/functions/v1/tiktok-proxy` (proxy)
❌ NOT `https://open.tiktokapis.com/v2/post/publish/inbox/video/init/` (direct)

## Common Error: "Failed to fetch"

This error occurs when requests go directly to TikTok API due to CORS restrictions.

### Solution Implemented
A Supabase Function proxy has been created that forwards requests to the TikTok API, bypassing CORS restrictions. All TikTok API calls should go through this proxy.

## Advanced Troubleshooting

### Enable Detailed Logging
The system now includes extensive logging:
- Check browser console for detailed error information
- Look for log messages about token validation
- Monitor network requests in developer tools
- Check for "Making proxy request to TikTok API" messages

### Manual Proxy Testing
You can manually test the proxy using the debug file `debug-proxy.html` or with curl:

```bash
curl -X POST "https://extalgkjlveevbkcpkuz.supabase.co/functions/v1/tiktok-proxy" \
  -H "Content-Type: application/json" \
  -d '{
    "method": "GET",
    "endpoint": "/user/info/"
  }'
```

### Backend Proxy Solution
The CORS issue should be resolved by implementing a Supabase Function proxy:
1. All TikTok API requests are now routed through a proxy function
2. The proxy function forwards requests to the TikTok API
3. Responses are returned with appropriate CORS headers
4. This eliminates the "Failed to fetch" errors caused by CORS restrictions

## Contact Support

If you continue to experience issues:
1. Document the exact error messages from the browser console
2. Note the steps you took before the error occurred
3. Check if the issue occurs with specific videos or all videos
4. Contact TikTok Developer Support if the issue appears to be on their end

## Additional Resources

- [TikTok Developer Documentation](https://developers.tiktok.com/)
- [TikTok API Rate Limits](https://developers.tiktok.com/doc/rate-limits/)
- [TikTok OAuth Documentation](https://developers.tiktok.com/doc/oauth-user-access-token/)