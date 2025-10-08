# Admin Dashboard Documentation

This document provides an overview of the Admin Dashboard functionality for the Dream Launcher Movement application.

## Overview

The Admin Dashboard allows administrators to:
1. Review and manage application submissions
2. Update application statuses
3. Export data to CSV
4. Post content to social media platforms (TikTok and Instagram)
5. View application videos and payment screenshots

## Authentication

The admin dashboard uses simple username/password authentication with hardcoded credentials:
- Username: `admin`
- Password: `admin`

In a production environment, this should be replaced with a more secure authentication system.

## Main Features

### Application Management

Administrators can:
- View all submitted applications in a table format
- Filter applications by status
- Update application statuses (Pending, Under Review, Approved, Rejected, Unpaid, Paid)
- View application details including videos and payment screenshots
- Export all applications to CSV for reporting

### Social Media Integration

#### TikTok Integration
- Connect TikTok account via OAuth
- Post applicant videos directly to TikTok
- Test TikTok API connectivity
- View connected TikTok user information

#### Instagram Integration
- Connect Instagram account via Facebook OAuth
- Post applicant videos directly to Instagram
- Test Instagram API connectivity
- View connected Instagram account information

### Data Export

- Export all applications to CSV format
- Includes all application data for reporting and analysis

## UI Components

### Header
- Logo and application title
- TikTok connection status and controls
- Instagram connection status and controls
- Export to CSV button
- Logout button

### Statistics Cards
- Total applications count
- Pending applications count
- Approved applications count
- Rejected applications count

### Applications Table
- Full name of applicant
- Email address
- Age
- CNIC (national ID)
- Idea title
- Application status with color-coded badges
- Video preview button
- Payment screenshot preview button
- Submission date
- Action buttons for status updates and social media posting

## Social Media Posting

### TikTok Posting
1. Click "Connect TikTok" to authenticate with your TikTok account
2. Find an application with a video
3. Click "Post to TikTok" button
4. The system will:
   - Generate a signed URL for the video
   - Test URL accessibility
   - Create a caption with the idea title, description, and hashtags
   - Post the video to TikTok
   - Show success or error messages

### Instagram Posting
1. Click "Connect Instagram" to authenticate with your Facebook account
2. Find an application with a video
3. Click "Post to Instagram" button
4. The system will:
   - Generate a signed URL for the video
   - Test URL accessibility
   - Create a caption with the idea title, description, and hashtags
   - Post the video to Instagram
   - Show success or error messages

## Technical Implementation

### Key Files
- `src/pages/Admin.tsx` - Main admin dashboard component
- `src/utils/tiktokUtils.ts` - TikTok API utility functions
- `src/utils/instagramUtils.ts` - Instagram API utility functions
- `src/utils/videoUtils.ts` - Video handling utilities

### API Proxy Functions
- `supabase/functions/tiktok-proxy/` - Proxy for TikTok API calls
- `supabase/functions/instagram-proxy/` - Proxy for Instagram API calls

### Dependencies
- React for UI components
- Supabase for data management
- Sonner for toast notifications
- Lucide React for icons

## Error Handling

The dashboard includes comprehensive error handling for:
- Network connectivity issues
- API errors
- Authentication failures
- Video processing errors
- Social media posting failures

## Troubleshooting

### Common Issues

1. **Unable to connect to TikTok/Instagram**
   - Check internet connectivity
   - Verify API credentials
   - Check the [TIKTOK_TROUBLESHOOTING.md](TIKTOK_TROUBLESHOOTING.md) or [INSTAGRAM_TROUBLESHOOTING.md](INSTAGRAM_TROUBLESHOOTING.md) guides

2. **Videos not posting to social media**
   - Verify the video URL is accessible
   - Check that the social media account is properly connected
   - Ensure the video meets platform requirements

3. **Applications not loading**
   - Check Supabase connection
   - Verify database permissions
   - Check browser console for errors

## Security Considerations

- Admin credentials should be changed in production
- Access tokens are stored in session storage
- Video URLs are signed for temporary access
- API calls use proxies to avoid CORS issues

## Future Enhancements

1. Improved admin authentication system
2. User role management
3. Enhanced analytics and reporting
4. Bulk social media posting
5. Automated status updates based on rules
6. Email notifications for status changes