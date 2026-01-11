# DLM Website

![DLM Logo](https://www.dlmpakistan.com/logo.png)

A comprehensive web application for the Das Lakh ke Malik initiative, enabling users to submit applications, manage submissions through an admin dashboard, and integrate with social media platforms (TikTok and Instagram) for content distribution.

## Overview

The DLM Website is a full-stack application built with React, TypeScript, and Supabase. It provides:

- **Public-facing website** for information and application submissions
- **User dashboard** for applicants to view their submission status and access learning resources
- **Admin dashboard** for managing applications, posting to social media, and managing guidebooks
- **Social media integration** with TikTok and Instagram for content distribution
- **Client-side video watermarking** for protected video downloads
- **Multi-language support** for broader accessibility

## Features

1. **Application Form**: Users can submit their ideas and information through a comprehensive form
2. **User Dashboard**: Applicants can view their application status and access guidebooks/resources
3. **Admin Dashboard**: Administrators can review applications, update statuses, manage guidebooks, and post to social media
4. **TikTok Integration**: Admins can post applicant videos directly to TikTok from the dashboard
5. **Instagram Integration**: Admins can post applicant videos directly to Instagram from the dashboard
6. **Video Watermarking**: Videos can be downloaded with watermarks and red borders applied
7. **Guidebook Management**: Admin can manage learning resources (PDFs, images, videos) with free/paid access control
8. **Multi-language Support**: The website supports multiple languages for broader accessibility
9. **Responsive Design**: Fully responsive design that works on mobile, tablet, and desktop devices

## Getting Started

### Prerequisites

- **Node.js** (v16 or higher recommended)
- **pnpm** package manager (install with `npm install -g pnpm`)
- **Supabase account** and project
- **TikTok Developer account** (optional, for TikTok integration)
- **Facebook Developer account** (optional, for Instagram integration)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dlm-website
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Supabase Configuration (Required)
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # TikTok Integration (Optional)
   VITE_TIKTOK_CLIENT_KEY=your_tiktok_client_key
   VITE_TIKTOK_CLIENT_SECRET=your_tiktok_client_secret
   VITE_TIKTOK_REDIRECT_URI=your_tiktok_redirect_uri
   
   # Instagram/Facebook Integration (Optional)
   VITE_FACEBOOK_APP_ID=your_facebook_app_id
   VITE_FACEBOOK_APP_SECRET=your_facebook_app_secret
   VITE_INSTAGRAM_REDIRECT_URI=your_instagram_redirect_uri
   
   # Meta Pixel (Optional)
   VITE_META_PIXEL_ID=your_meta_pixel_id
   ```

4. **Set up Supabase database**
   
   Run the database schema migrations:
   - Option A: Using Supabase Dashboard
     1. Go to your Supabase project dashboard
     2. Navigate to **SQL Editor**
     3. Copy and paste the contents of `src/integrations/supabase/schema.sql`
     4. Run the SQL script
   
   - Option B: Using Supabase CLI
     ```bash
     supabase db push
     ```

5. **Deploy Supabase Edge Functions** (for social media integrations)
   ```bash
   supabase functions deploy tiktok-proxy --project-ref your_project_id
   supabase functions deploy instagram-proxy --project-ref your_project_id
   ```

6. **Run the development server**
   ```bash
   pnpm dev
   ```

   The application will be available at `http://localhost:8080`

## Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Frontend (React + Vite)                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │  Public Pages   │  │  User Dashboard │  │  Admin Dashboard│     │
│  │  - Home         │  │  - View Status  │  │  - Manage Apps  │     │
│  │  - Apply        │  │  - Guidebooks   │  │  - Post to SM   │     │
│  │  - About        │  │  - Resources    │  │  - Watermarking │     │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘     │
│           │                    │                    │                │
│           └────────────────────┼────────────────────┘                │
│                                │                                     │
└────────────────────────────────┼─────────────────────────────────────┘
                                 │
                                 │ HTTP/HTTPS
                                 │
┌────────────────────────────────┼─────────────────────────────────────┐
│                    Supabase Backend                                  │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Database (PostgreSQL)                                      │   │
│  │  - application_submissions  │  guidebooks  │  users         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Storage (S3-compatible)                                    │   │
│  │  - application-videos bucket                                │   │
│  │    ├── videos/ (application videos)                         │   │
│  │    ├── screenshots/ (payment screenshots)                   │   │
│  │    └── guidebooks/ (learning resources)                     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Edge Functions                                              │   │
│  │  - tiktok-proxy (OAuth & API proxy)                         │   │
│  │  - instagram-proxy (OAuth & API proxy)                      │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 │ API Calls
                                 │
┌────────────────────────────────┼─────────────────────────────────────┐
│              External Services                                      │
│  ┌─────────────────┐          ┌─────────────────┐                  │
│  │  TikTok API     │          │  Instagram API  │                  │
│  │  (via proxy)    │          │  (via proxy)    │                  │
│  └─────────────────┘          └─────────────────┘                  │
└─────────────────────────────────────────────────────────────────────┘
```

### Key Components

1. **Frontend Application**
   - Built with React 18, TypeScript, and Vite
   - UI components using Radix UI and Tailwind CSS
   - Client-side routing with React Router
   - State management with React Context and React Query

2. **Backend (Supabase)**
   - **Database**: PostgreSQL with Row Level Security (RLS)
   - **Storage**: S3-compatible object storage for videos and files
   - **Edge Functions**: Serverless functions for API proxying (TikTok/Instagram)

3. **External Integrations**
   - **TikTok API**: OAuth authentication and video posting
   - **Instagram API**: OAuth authentication via Facebook and video posting
   - **Meta Pixel**: Analytics tracking

4. **Client-Side Processing**
   - **Video Watermarking**: FFmpeg.js for adding watermarks and borders
   - **File Handling**: Client-side file validation and uploads

## Admin Dashboard Authentication

**Important Note**: The admin dashboard currently uses **hardcoded credentials** for authentication:

- **Username**: `admin`
- **Password**: `admin`

This is a temporary solution implemented because Supabase role-based access control (RBAC) was found to be unreliable according to operations. This can be changed in the future to implement a more secure authentication mechanism (e.g., environment variable-based authentication, Supabase Auth with proper role management, or a custom authentication solution).

To change the admin credentials, modify the authentication logic in `src/pages/Admin.tsx` (around line 276).

## Development

### Available Scripts

- `pnpm dev` - Start the development server (runs on port 8080)
- `pnpm build` - Build the production version
- `pnpm build:dev` - Build for development environment
- `pnpm preview` - Preview the production build locally
- `pnpm lint` - Run ESLint to check code quality

### Project Structure

```
dlm-website/
├── src/
│   ├── components/        # Reusable React components
│   │   ├── ui/           # shadcn/ui component library
│   │   └── ...           # Feature-specific components
│   ├── pages/            # Page components (routes)
│   ├── utils/            # Utility functions
│   │   ├── videoUtils.ts        # Video handling utilities
│   │   ├── videoWatermark.ts    # Watermarking implementation
│   │   ├── tiktokUtils.ts       # TikTok integration
│   │   ├── instagramUtils.ts    # Instagram integration
│   │   └── ...
│   ├── integrations/     # Third-party service integrations
│   │   └── supabase/     # Supabase client and schema
│   ├── contexts/         # React Context providers
│   ├── hooks/            # Custom React hooks
│   ├── i18n/             # Internationalization
│   ├── types/            # TypeScript type definitions
│   └── lib/              # Library utilities
├── supabase/
│   ├── functions/        # Supabase Edge Functions
│   │   ├── tiktok-proxy/
│   │   └── instagram-proxy/
│   └── migrations/       # Database migrations
├── public/               # Static assets
└── guidebooks/           # Guidebook files
```

## Deployment

### Build for Production

```bash
pnpm build
```

This creates a `dist/` directory with optimized production files.

### Deploy to Vercel (Recommended)

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Deploy to Other Platforms

The application can be deployed to any static hosting service:
- **Netlify**: Connect repository and set environment variables
- **GitHub Pages**: Use GitHub Actions to build and deploy
- **Supabase Hosting**: Deploy directly from Supabase dashboard

### Environment Variables in Production

Ensure all required environment variables are set in your hosting environment:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- (Optional) Social media integration variables

## Additional Documentation

For detailed information on specific features, refer to:

- [INSTAGRAM_INTEGRATION.md](INSTAGRAM_INTEGRATION.md) - Instagram setup and integration
- [TIKTOK_INTEGRATION.md](TIKTOK_INTEGRATION.md) - TikTok setup and integration
- [WATERMARKING_SYSTEM.md](WATERMARKING_SYSTEM.md) - Video watermarking documentation
- [ADMIN_DASHBOARD.md](ADMIN_DASHBOARD.md) - Admin dashboard features
- [DEBUGGING_GUIDE.md](DEBUGGING_GUIDE.md) - Troubleshooting guide
- [TIKTOK_TROUBLESHOOTING.md](TIKTOK_TROUBLESHOOTING.md) - TikTok integration issues
- [INSTAGRAM_TROUBLESHOOTING.md](INSTAGRAM_TROUBLESHOOTING.md) - Instagram integration issues

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary to Dream Launcher Movement.
