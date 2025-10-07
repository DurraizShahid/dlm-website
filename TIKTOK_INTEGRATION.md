# TikTok Integration Setup Guide

This document explains how to set up and use the TikTok integration in the Dream Launcher Movement application.

## Prerequisites

1. TikTok Developer Account
2. TikTok Client Key: `sbawv0p2p9jol7vjtp`
3. TikTok Client Secret: `DRQn7VPdFhf8nF28s6SBQV3fi9ltGIDr`

## Configuration

### Environment Variables

The TikTok integration requires the following environment variable to be set in your `.env` file:

```env
VITE_TIKTOK_ACCESS_TOKEN=your_access_token_here
```

The access token can be obtained through the TikTok OAuth flow or by using the client credentials flow. For development purposes, you can use the client key (`sbawv0p2p9jol7vjtp`) as the access token, but for production use, you should implement token refresh using the `refreshTikTokAccessToken()` utility function.

### Current Setup

Your TikTok integration is already configured with:
- Client Key: `sbawv0p2p9jol7vjtp`
- Client Secret: `DRQn7VPdFhf8nF28s6SBQV3fi9ltGIDr`
- Redirect URLs: `https://www.dlmpakistan.com/` and `https://www.dlmpakistan.com/admin`

## How It Works

The TikTok integration allows administrators to post applicant videos directly to TikTok from the admin dashboard:

1. Admin navigates to the Admin Dashboard
2. Clicks "Connect TikTok" to authenticate with their TikTok account
3. Grants permission for the app to post videos to their account
4. Finds an application with a video
5. Clicks the "Post to TikTok" button
6. The system generates a signed URL for the video
7. Makes an API call through a Supabase Function proxy to TikTok to initiate the upload
8. TikTok pulls the video from the signed URL
9. The video appears in the TikTok user's inbox for publishing

## Technical Implementation

### Key Files

1. `src/pages/Admin.tsx` - Contains the "Post to TikTok" button and integration logic
2. `src/utils/tiktokUtils.ts` - Utility functions for TikTok API interactions
3. `supabase/functions/tiktok-proxy/index.ts` - Supabase Function that acts as a proxy for TikTok API calls
4. `.env` - Stores the TikTok access token

### API Endpoints Used

1. `GET /v2/auth/authorize/` - Initiates OAuth flow
2. `POST /v2/oauth/token/` - Exchanges code for access token
3. `POST /v2/post/publish/inbox/video/init/` - Initializes a video upload
4. `GET /v2/user/info/` - Retrieves user information

## OAuth Flow

The application implements a full OAuth 2.0 flow:

1. User clicks "Connect TikTok" button
2. User is redirected to TikTok's authorization page
3. User grants permissions to the application
4. TikTok redirects back to the application with an authorization code
5. Application exchanges the code for an access token
6. Access token is stored in session storage for future use
7. User information is retrieved and displayed

## CORS Solution

To resolve CORS issues with the TikTok API, we've implemented a Supabase Function proxy:

1. All TikTok API requests are routed through `https://extalgkjlveevbkcpkuz.supabase.co/functions/v1/tiktok-proxy`
2. The proxy function forwards requests to the TikTok API
3. Responses are returned with appropriate CORS headers
4. This eliminates the "Failed to fetch" errors caused by CORS restrictions

## Troubleshooting

If you encounter issues with the TikTok integration, please refer to the detailed [TikTok Troubleshooting Guide](TIKTOK_TROUBLESHOOTING.md) which covers:

- Common error "Failed to fetch" and its resolution
- Step-by-step troubleshooting procedures
- Solutions for CORS restrictions
- Token validation and refresh procedures
- Video URL accessibility testing
- Advanced debugging techniques

### Common Issues

1. **"TikTok API not configured" Error**
   - Ensure `VITE_TIKTOK_ACCESS_TOKEN` is set in your `.env` file

2. **"Failed to initialize TikTok upload" Error**
   - Check that the video URL is accessible
   - Verify the access token is valid
   - Ensure the TikTok API is not rate-limited

3. **Video Not Appearing in TikTok Inbox**
   - Check that the TikTok user has authorized the app
   - Verify the video meets TikTok's requirements

### Token Refresh

The system includes utility functions to refresh the TikTok access token using the refresh token:

1. Use the `refreshTikTokAccessToken(refreshToken)` function from `src/utils/tiktokUtils.ts`
2. This function uses your refresh token to obtain a new access token
3. Tokens are automatically managed and stored in session storage

For manual token generation, you can also use this PowerShell command:

```powershell
powershell -Command "(Invoke-WebRequest -Uri 'https://open.tiktokapis.com/v2/oauth/token/' -Method POST -Body @{client_key='sbawv0p2p9jol7vjtp'; client_secret='DRQn7VPdFhf8nF28s6SBQV3fi9ltGIDr'; grant_type='client_credentials'} -ContentType 'application/x-www-form-urlencoded').Content"
```

## Security Considerations

1. The access token is stored in session storage, not in environment variables when using OAuth
2. OAuth state parameter is used to prevent CSRF attacks
3. Video URLs are signed and have a limited expiration time
4. All API calls use HTTPS
5. The proxy function adds appropriate CORS headers to responses

## Future Enhancements

1. Automatic token refresh before expiration
2. Persistent token storage (currently in session storage only)
3. Status tracking for posted videos
4. Analytics on TikTok performance