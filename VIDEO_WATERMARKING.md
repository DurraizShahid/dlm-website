# Video Watermarking Implementation Guide

## Overview
This document explains how to properly implement video watermarking for the Apply Form. The current implementation is a placeholder that demonstrates where watermarking would occur, but for production use, a more robust solution is needed.

## Current Implementation
The current implementation in [src/utils/watermarkUtils.ts](src/utils/watermarkUtils.ts) is a placeholder that:
1. Accepts a video file and watermark image
2. Logs the watermarking process
3. Returns the original video file

This is because client-side video processing is extremely resource-intensive and not suitable for production applications.

## Production Implementation Options

### Option 1: Server-Side Processing (Recommended)
Implement video watermarking on the server using FFmpeg:

#### Steps:
1. Upload original video to server
2. Process video with FFmpeg to add watermark
3. Upload watermarked video to Supabase Storage
4. Store watermarked video path in database

#### FFmpeg Command Example:
```bash
ffmpeg -i input.mp4 -i logo.png -filter_complex "overlay=20:20" output.mp4
```

#### Implementation:
```javascript
// Server-side endpoint example
app.post('/watermark-video', upload.single('video'), async (req, res) => {
  try {
    const inputFile = req.file.path;
    const outputFile = `watermarked_${Date.now()}.mp4`;
    const watermarkPath = 'path/to/logo.png';
    
    // Execute FFmpeg command
    await execPromise(`ffmpeg -i ${inputFile} -i ${watermarkPath} -filter_complex "overlay=20:20" ${outputFile}`);
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('application-videos')
      .upload(`videos/${outputFile}`, fs.createReadStream(outputFile));
    
    if (error) throw error;
    
    // Return file path
    res.json({ filePath: data.path });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Option 2: Client-Side Processing (Not Recommended)
Use a library like ffmpeg.js for client-side processing:

#### Limitations:
- Very slow processing
- High memory usage
- Large library size (~20MB)
- Not suitable for large videos

#### Implementation with ffmpeg.js:
```javascript
import FFmpeg from 'ffmpeg.js';

const addWatermarkClientSide = async (videoFile) => {
  // This is a simplified example
  // Actual implementation would be much more complex
  const ffmpeg = new FFmpeg();
  // ... processing logic
  return watermarkedVideo;
};
```

## Complete Server-Side Implementation

### Supabase Function
We've implemented a complete server-side video watermarking solution using Supabase Functions:

#### Directory Structure:
```
supabase/
  functions/
    video-watermark/
      index.ts
    _shared/
      cors.ts
```

#### Function Implementation ([supabase/functions/video-watermark/index.ts](file:///supabase/functions/video-watermark/index.ts)):
The function handles:
1. Receiving video path from client
2. Downloading original video from Supabase Storage
3. Processing video with FFmpeg to add watermark
4. Uploading watermarked video back to Supabase Storage
5. Returning the new video path

#### FFmpeg Processing:
```typescript
// Run FFmpeg command to add watermark
// Position: top-left (20px from left, 20px from top)
const ffmpegCommand = [
  'ffmpeg',
  '-i', tempVideoPath,
  '-i', watermarkPath,
  '-filter_complex', 'overlay=20:20',
  '-c:a', 'copy',
  tempWatermarkedPath
];
```

### Updated ApplyForm Implementation
The ApplyForm component now uses the server-side function:

```typescript
const uploadVideo = async (file: File): Promise<string | null> => {
  try {
    setIsUploading(true);
    toast.info(translate('Processing and uploading video with watermark...'));

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `videos/${fileName}`;

    // First, upload the original video
    const { error: uploadError } = await supabase.storage
      .from('application-videos')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      toast.error(translate('Error uploading video'));
      return null;
    }

    // Call the server-side watermarking function
    toast.info(translate('Adding watermark to video...'));
    
    const response = await fetch('/functions/v1/video-watermark', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabase.auth.session?.access_token || ''}`
      },
      body: JSON.stringify({ videoPath: filePath })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Watermarking error:', errorData);
      toast.error(translate('Error processing video with watermark'));
      // Return the original video path if watermarking fails
      return filePath;
    }

    const result = await response.json();
    console.log('Video processed successfully:', result);
    toast.success(translate('Video processed with watermark successfully'));
    
    // Return the watermarked video path
    return result.watermarkedPath;
  } catch (error) {
    console.error('Upload error:', error);
    toast.error(translate('Error uploading video'));
    return null;
  } finally {
    setIsUploading(false);
  }
};
```

## Watermark Positioning Options

### Predefined Positions:
- Top-left: `{ x: 20, y: 20 }`
- Top-right: `{ x: canvas.width - watermark.width - 20, y: 20 }`
- Bottom-left: `{ x: 20, y: canvas.height - watermark.height - 20 }`
- Bottom-right: `{ x: canvas.width - watermark.width - 20, y: canvas.height - watermark.height - 20 }`
- Center: `{ x: (canvas.width - watermark.width) / 2, y: (canvas.height - watermark.height) / 2 }`

### Custom Positioning:
Allow users to specify watermark position through form options.

## Performance Considerations

### Video Size Limits:
- Recommend max 100MB for client-side processing
- Server-side can handle larger files (up to storage limits)

### Processing Time:
- Client-side: 1-5 minutes for 1-minute video
- Server-side: 30 seconds - 2 minutes depending on server resources

### User Experience:
- Show progress indicator during processing
- Provide estimated time remaining
- Allow cancellation of long processes

## Security Considerations

### File Validation:
```typescript
const validateVideoFile = (file: File) => {
  // Check file type
  const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type');
  }
  
  // Check file size
  if (file.size > 200 * 1024 * 1024) { // 200MB
    throw new Error('File too large');
  }
  
  // Check duration (requires loading video)
  // ...
};
```

### Rate Limiting:
Implement rate limiting on video processing endpoints to prevent abuse.

## Testing Strategy

### Unit Tests:
```typescript
describe('Video Watermarking', () => {
  it('should add watermark to video', async () => {
    const videoFile = new File([''], 'test.mp4', { type: 'video/mp4' });
    const watermarked = await addWatermarkToVideo(videoFile);
    expect(watermarked).toBeInstanceOf(File);
  });
});
```

### Integration Tests:
- Test with various video formats
- Test with different watermark positions
- Test error handling
- Test large file handling

## Future Enhancements

### 1. Configurable Watermark
Allow different watermarks for different users or campaigns.

### 2. Animated Watermarks
Support GIF or animated watermarks.

### 3. Transparent Watermarks
Support semi-transparent watermarks.

### 4. Multiple Watermarks
Support adding multiple watermarks to different positions.

### 5. Text Watermarks
Support adding text watermarks in addition to image watermarks.

## Troubleshooting

### Common Issues:
1. **CORS errors with watermark image**: Ensure watermark is served with proper CORS headers
2. **Memory issues**: Process videos in chunks or use streaming
3. **Timeout errors**: Implement proper timeout handling
4. **Quality loss**: Use appropriate encoding settings

### Debugging Tips:
- Log each step of the process
- Monitor memory usage
- Test with various video formats and sizes
- Implement proper error handling and user feedback

## Conclusion

For production use, implement server-side video watermarking using FFmpeg. The current client-side implementation is a placeholder for demonstration purposes only. Server-side processing provides better performance, reliability, and user experience.