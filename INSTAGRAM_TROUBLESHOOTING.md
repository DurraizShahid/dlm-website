# Instagram Integration Troubleshooting Guide

This document provides solutions for common issues encountered with the Instagram integration.

## Current Issue: Requests May Be Going Directly to Instagram API

Based on the implementation, requests should go through our proxy to avoid CORS issues. If you're experiencing connection problems, check the network tab to verify requests are going to the proxy.

## Root Cause Analysis

Common issues with Instagram integration:

1. Requests going directly to Instagram API instead of using our proxy
2. CORS errors blocking requests
3. Invalid or expired access tokens
4. Incorrect Facebook App configuration
5. Instagram account not properly connected

## Immediate Solutions

### Solution 1: Force Refresh the Application
1. Hard refresh the page (Ctrl+F5 or Cmd+Shift+R)
2. Clear browser cache completely
3. Try posting to Instagram again

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
=== Instagram Utilities Loaded ===
Instagram Proxy URL: https://[your-supabase-url].supabase.co/functions/v1/instagram-proxy
==============================
```

And during an Instagram post attempt:
```
=== Making Instagram API Request ===
Endpoint: /{ig-user-id}/media
Proxy URL: https://[your-supabase-url].supabase.co/functions/v1/instagram-proxy
```

### Check Network Tab
Verify requests are going to:
✅ `https://[your-supabase-url].supabase.co/functions/v1/instagram-proxy` (proxy)
❌ NOT `https://graph.instagram.com/{ig-user-id}/media` (direct)

## Common Error: "Failed to fetch"

This error occurs when requests go directly to Instagram API due to CORS restrictions.

### Solution Implemented
A Supabase Function proxy has been created that forwards requests to the Instagram API, bypassing CORS restrictions. All Instagram API calls should go through this proxy.

## Advanced Troubleshooting

### Enable Detailed Logging
The system now includes extensive logging:
- Check browser console for detailed error information
- Look for log messages about token validation
- Monitor network requests in developer tools
- Check for "Making proxy request to Instagram API" messages

### Manual Proxy Testing
You can manually test the proxy using curl:

```bash
curl -X POST "https://[your-supabase-url].supabase.co/functions/v1/instagram-proxy" \
  -H "Content-Type: application/json" \
  -d '{
    "method": "GET",
    "endpoint": "/me/accounts"
  }'
```

## Instagram-Specific Issues

### "Requires Business or Creator Account" Error
Instagram Basic Display API only works with Business or Creator accounts, not personal accounts.

Solution:
1. Convert your Instagram account to a Business or Creator account
2. Connect your Instagram account to a Facebook Page
3. Ensure the Facebook App has the correct permissions

### "Missing Permissions" Error
Ensure your Facebook App has all required permissions:
- `instagram_basic`
- `instagram_content_publish`
- `pages_show_list`
- `pages_manage_engagement`

### Token Expiration
Instagram access tokens can expire. The system stores tokens in session storage with expiration tracking.

Solution:
1. Reconnect your Instagram account
2. Check that the token refresh mechanism is working

## Debugging Steps

1. **Check Environment Variables**
   - Verify `VITE_FACEBOOK_APP_ID` and `VITE_FACEBOOK_APP_SECRET` are set correctly

2. **Verify Facebook App Configuration**
   - Check that the app is live and not in development mode
   - Confirm redirect URIs are correctly configured
   - Ensure all required permissions are added

3. **Test Instagram Account Connection**
   - Make sure the Instagram account is a Business or Creator account
   - Confirm it's properly connected to a Facebook Page

4. **Check Proxy Function Deployment**
   - Verify the Instagram proxy function is deployed to Supabase
   - Check the function logs for errors

5. **Review Browser Console**
   - Look for JavaScript errors
   - Check network requests and responses
   - Verify token information is being handled correctly

## Error Codes and Solutions

### 400 Bad Request
- Usually indicates malformed request parameters
- Check that all required fields are provided
- Verify the video URL is accessible

### 401 Unauthorized
- Access token is invalid or expired
- Reconnect the Instagram account
- Check that the Facebook App credentials are correct

### 403 Forbidden
- Insufficient permissions
- Verify all required permissions are granted
- Check that the Instagram account type is correct

### 404 Not Found
- Incorrect endpoint or resource ID
- Verify the Instagram user ID is correct
- Check that the media exists at the provided URL

## Contact Support

If you continue to experience issues:
1. Check the Facebook Developer documentation
2. Review Instagram Graph API limitations
3. Contact Facebook/Instagram support for account-specific issues