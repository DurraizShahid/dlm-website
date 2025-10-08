# Video Watermarking Service

This is a standalone service for adding watermarks to videos uploaded to the DLM website. It's designed to run on Render and integrates with Supabase storage.

## Features

- REST API for video watermarking
- Integration with Supabase storage
- CORS support
- Health check endpoint

## Endpoints

### Health Check
```
GET /
```

### Watermark Video
```
POST /watermark-video
```

Request body:
```json
{
  "videoPath": "path/to/video.mp4"
}
```

## Environment Variables

Create a `.env` file with the following variables:

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
PORT=3001
```

## Deployment to Render

1. Create a new Web Service on Render
2. Connect it to your GitHub repository
3. Set the root directory to `render-watermark-service`
4. Add the required environment variables in the Render dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

## Local Development

1. Clone the repository
2. Navigate to the `render-watermark-service` directory
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file with your Supabase credentials
5. Start the development server:
   ```
   npm run dev
   ```

## Current Limitations

This service currently copies the original video with a "_watermarked" suffix but does not actually add a visual watermark. To implement actual watermarking, FFmpeg would need to be integrated, which requires a more specialized deployment environment.