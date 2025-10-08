# Instagram Integration Setup Guide

This document explains how to set up and use the Instagram integration in the Dream Launcher Movement application.

## Prerequisites

1. Facebook Developer Account
2. Facebook App with Instagram Basic Display API enabled
3. Instagram Business or Creator Account
4. Proper permissions: `instagram_basic`, `instagram_content_publish`, `pages_show_list`, `pages_manage_engagement`

## Configuration

### Environment Variables

The Instagram integration requires the following environment variables to be set in your `.env` file:

```env
VITE_FACEBOOK_APP_ID=your_facebook_app_id_here
VITE_FACEBOOK_APP_SECRET=your_facebook_app_secret_here
```

### Current Setup

Your Instagram integration needs:
- Facebook App ID: `[Your Facebook App ID]`
- Facebook App Secret: `[Your Facebook App Secret]`
- Redirect URLs: `https://www.dlmpakistan.com/` and `https://www.dlmpakistan.com/admin`

## How It Works

The Instagram integration allows administrators to post applicant videos directly to Instagram from the admin dashboard:

1. Admin navigates to the Admin Dashboard
2. Clicks "Connect Instagram" to authenticate with their Facebook account
3. Grants permission for the app to post to their Instagram account
4. Finds an application with a video
5. Clicks the "Post to Instagram" button
6. The system generates a signed URL for the video
7. Makes an API call through a Supabase Function proxy to Instagram to initiate the upload
8. Instagram pulls the video from the signed URL
9. The video is published to the Instagram account

## Technical Implementation

### Key Files

1. `src/pages/Admin.tsx` - Contains the "Post to Instagram" button and integration logic
2. `src/utils/instagramUtils.ts` - Utility functions for Instagram API interactions
3. `supabase/functions/instagram-proxy/index.ts` - Supabase Function that acts as a proxy for Instagram API calls

### API Endpoints Used

1. `GET /v18.0/dialog/oauth` - Initiates OAuth flow
2. `GET /v18.0/oauth/access_token` - Exchanges code for access token
3. `GET /me/accounts` - Retrieves Instagram business accounts
4. `POST /{ig-user-id}/media` - Creates a media object
5. `POST /{ig-user-id}/media_publish` - Publishes the media

## OAuth Flow

The application implements a full OAuth 2.0 flow:

1. User clicks "Connect Instagram" button
2. User is redirected to Facebook's authorization page
3. User grants permissions to the application
4. Facebook redirects back to the application with an authorization code
5. Application exchanges the code for an access token
6. Access token is stored in session storage for future use
7. Instagram accounts are retrieved and displayed

## CORS Solution

To resolve CORS issues with the Instagram API, we've implemented a Supabase Function proxy:

1. All Instagram API requests are routed through `https://[your-supabase-url].supabase.co/functions/v1/instagram-proxy`
2. The proxy function forwards requests to the Instagram API
3. Responses are returned with appropriate CORS headers
4. This eliminates the "Failed to fetch" errors caused by CORS restrictions

## Troubleshooting

If you encounter issues with the Instagram integration:

### Common Issues

1. **"Instagram API not configured" Error**
   - Ensure `VITE_FACEBOOK_APP_ID` and `VITE_FACEBOOK_APP_SECRET` are set in your `.env` file

2. **"Failed to initialize Instagram upload" Error**
   - Check that the video URL is accessible
   - Verify the access token is valid
   - Ensure the Instagram API is not rate-limited

3. **Video Not Posting to Instagram**
   - Check that the Instagram user has authorized the app
   - Verify the video meets Instagram's requirements (duration, format, size)
   - Ensure the Instagram account is a Business or Creator account

### Token Management

The system includes utility functions to manage Instagram access tokens:

1. Tokens are stored in session storage
2. Tokens have expiration times that are tracked
3. Long-lived tokens are requested during the OAuth flow

## Future Enhancements

1. Automatic token refresh before expiration
2. Persistent token storage (currently in session storage only)
3. Status tracking for posted videos
4. Analytics on Instagram performance
5. Support for multiple Instagram accounts
6. Image posting capability in addition to video