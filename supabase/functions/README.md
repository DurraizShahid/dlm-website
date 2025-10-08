# Supabase Functions

This directory contains all the Supabase edge functions for the application.

## Functions

### 1. Video Watermarking (`video-watermark`)
Adds a watermark to uploaded videos using FFmpeg.

#### Deployment
```bash
supabase functions deploy video-watermark
```

#### Usage
```javascript
const response = await fetch('/functions/v1/video-watermark', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer YOUR_ACCESS_TOKEN`
  },
  body: JSON.stringify({ videoPath: 'videos/original.mp4' })
});
```

### 2. Instagram Proxy (`instagram-proxy`)
Proxy for Instagram API calls to bypass CORS restrictions.

#### Deployment
```bash
supabase functions deploy instagram-proxy
```

### 3. TikTok Proxy (`tiktok-proxy`)
Proxy for TikTok API calls to bypass CORS restrictions.

#### Deployment
```bash
supabase functions deploy tiktok-proxy
```

## Environment Variables

The functions require the following environment variables:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

These are automatically provided by Supabase when deployed.

## Local Development

To test functions locally:
```bash
supabase functions serve
```

## Function Structure

Each function follows this structure:
```
function-name/
  index.ts          # Main function code
  import_map.json   # Import mappings (if needed)
```

## Shared Code

Common code is stored in the `_shared` directory:
- `cors.ts` - CORS headers configuration

## Error Handling

All functions include proper error handling and CORS support.