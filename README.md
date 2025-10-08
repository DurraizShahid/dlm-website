# DLM Website

# New Updates

## Features

This website includes the following features:

1. **Application Form**: Users can submit their ideas and information through a comprehensive form.
2. **Admin Dashboard**: Administrators can review applications, update statuses, and manage content.
3. **TikTok Integration**: Admins can post applicant videos directly to TikTok from the dashboard.
4. **Instagram Integration**: Admins can now post applicant videos directly to Instagram from the dashboard.
5. **Video Watermarking**: Videos can be downloaded with watermarks applied.
6. **Multi-language Support**: The website supports multiple languages for broader accessibility.
7. **Responsive Design**: Fully responsive design that works on mobile, tablet, and desktop devices.

## Recent Updates

- Added Instagram posting functionality to complement the existing TikTok integration
- Enhanced admin dashboard with Instagram connection controls
- Implemented Instagram API proxy to handle CORS restrictions
- Added video watermarking functionality (both client-side and server-side options)
- Created standalone watermarking service for deployment on Render

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- pnpm package manager
- Supabase account
- TikTok Developer account (for TikTok integration)
- Facebook Developer account (for Instagram integration)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Create a `.env` file based on `.env.example` and add your configuration
4. Run the development server:
   ```bash
   pnpm dev
   ```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_TIKTOK_ACCESS_TOKEN=your_tiktok_access_token
VITE_FACEBOOK_APP_ID=your_facebook_app_id
VITE_FACEBOOK_APP_SECRET=your_facebook_app_secret
```

### Supabase Functions

The application uses Supabase functions for API proxying:

1. **TikTok Proxy**: Handles TikTok API requests to bypass CORS restrictions
2. **Instagram Proxy**: Handles Instagram API requests to bypass CORS restrictions
3. **Video Watermark**: Handles server-side video watermarking (limited implementation)

Deploy these functions using the Supabase CLI:

```bash
supabase functions deploy tiktok-proxy --project-ref your_project_id
supabase functions deploy instagram-proxy --project-ref your_project_id
supabase functions deploy video-watermark --project-ref your_project_id
```

### Render Watermarking Service

A standalone watermarking service is available in the `render-watermark-service` directory for deployment to Render:

1. Create a new Web Service on Render
2. Connect it to your GitHub repository
3. Set the root directory to `render-watermark-service`
4. Add the required environment variables in the Render dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

## Instagram Integration

To use the Instagram posting feature:

1. Create a Facebook App with Instagram Basic Display API enabled
2. Configure the app with proper redirect URLs
3. Set the required environment variables
4. In the admin dashboard, click "Connect Instagram"
5. Authorize the application to post to your Instagram account
6. Use the "Post to Instagram" button on applications with videos

For detailed setup instructions, refer to [INSTAGRAM_INTEGRATION.md](INSTAGRAM_INTEGRATION.md).

## TikTok Integration

To use the TikTok posting feature:

1. Create a TikTok Developer account
2. Create an app and obtain client credentials
3. Set the required environment variables
4. In the admin dashboard, click "Connect TikTok"
5. Authorize the application to post to your TikTok account
6. Use the "Post to TikTok" button on applications with videos

For detailed setup instructions, refer to [TIKTOK_INTEGRATION.md](TIKTOK_INTEGRATION.md).

## Video Watermarking

The application includes two approaches to video watermarking:

1. **Client-Side Watermarking**: Implemented directly in the admin dashboard using HTML5 Canvas API
2. **Server-Side Watermarking**: Available through Supabase functions or the standalone Render service

For detailed implementation information, refer to:
- [CLIENT_SIDE_WATERMARKING.md](CLIENT_SIDE_WATERMARKING.md)
- [VIDEO_WATERMARKING.md](VIDEO_WATERMARKING.md)

## Development

### Available Scripts

- `pnpm dev`: Start the development server
- `pnpm build`: Build the production version
- `pnpm preview`: Preview the production build
- `pnpm lint`: Run ESLint

### Project Structure

```
src/
├── components/     # React components
├── pages/          # Page components
├── utils/          # Utility functions
├── integrations/   # Third-party integrations
├── contexts/       # React contexts
├── hooks/          # Custom hooks
├── i18n/           # Internationalization files
├── types/          # TypeScript types
└── lib/            # Library functions

render-watermark-service/
├── server.js       # Express server for watermarking
├── package.json    # Dependencies and scripts
└── README.md       # Service documentation
```

## Deployment

The application can be deployed to any static hosting service that supports client-side routing, such as Vercel, Netlify, or GitHub Pages.

For Supabase deployment:
1. Build the application: `pnpm build`
2. Deploy the `dist/` folder to your hosting provider
3. Ensure environment variables are set in your hosting environment

For Render watermarking service deployment:
1. Deploy the `render-watermark-service` directory as a Web Service
2. Set the required environment variables in the Render dashboard
3. Configure your admin panel to use the Render service endpoint

## Troubleshooting

For common issues and solutions, refer to:
- [DEBUGGING_GUIDE.md](DEBUGGING_GUIDE.md)
- [TIKTOK_TROUBLESHOOTING.md](TIKTOK_TROUBLESHOOTING.md)
- [INSTAGRAM_INTEGRATION.md](INSTAGRAM_INTEGRATION.md) (for Instagram issues)
- [TROUBLESHOOTING_VIDEO_WATERMARK.md](TROUBLESHOOTING_VIDEO_WATERMARK.md) (for watermarking issues)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is proprietary to Dream Launcher Movement.