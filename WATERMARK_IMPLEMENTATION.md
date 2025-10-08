# Watermark Implementation

## Overview

The video watermarking functionality has been updated to actually add the [logo.png](file:///c%3A/Users/durra/dyad-apps/lunar-eagle-roll/public/logo.png) watermark to videos instead of just copying them. The watermark is positioned in the top-left corner of the video.

## Implementation Details

### FFmpeg Command

The watermark is added using FFmpeg with the following command:

```bash
ffmpeg -i input.mp4 -i logo.png -filter_complex "overlay=20:20" output.mp4
```

This command:
- Takes the input video file
- Overlays the [logo.png](file:///c%3A/Users/durra/dyad-apps/lunar-eagle-roll/public/logo.png) image
- Positions the watermark 20 pixels from the left and 20 pixels from the top
- Preserves the original audio track

### Positioning

The watermark is positioned at coordinates (20, 20) which places it in the top-left corner with a small margin.

### File Locations

- **Watermark Image**: `./logo.png` (included in the function deployment)
- **Temporary Files**: Created in `/tmp/` directory during processing
- **Output Files**: Uploaded back to the same Supabase storage bucket

## How It Works

1. The function receives a video path via HTTP POST
2. Downloads the original video from Supabase storage
3. Saves the video to a temporary location
4. Runs FFmpeg to add the watermark
5. Reads the watermarked video
6. Uploads the watermarked video back to Supabase storage
7. Returns the path to the watermarked video
8. Cleans up temporary files

## Testing

You can test the watermarking function using the test page or by calling it directly:

```javascript
const response = await fetch('https://your-project.supabase.co/functions/v1/video-watermark', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    videoPath: 'videos/your-video.mp4'
  })
});
```

## Troubleshooting

### Common Issues

1. **FFmpeg not available**: The function requires FFmpeg to be available in the runtime environment
2. **Logo file missing**: Ensure [logo.png](file:///c%3A/Users/durra/dyad-apps/lunar-eagle-roll/public/logo.png) is included in the function deployment
3. **Video format issues**: Some video formats may not be supported by FFmpeg
4. **Memory constraints**: Large videos may exceed memory limits

### Error Handling

The function includes comprehensive error handling:
- Invalid requests return appropriate HTTP status codes
- FFmpeg errors are captured and returned in the response
- Temporary files are cleaned up even if processing fails
- Detailed error messages help with debugging

## Customization

### Watermark Position

To change the watermark position, modify the FFmpeg overlay filter:

- Top-left: `overlay=20:20`
- Top-right: `overlay=main_w-overlay_w-20:20`
- Bottom-left: `overlay=20:main_h-overlay_h-20`
- Bottom-right: `overlay=main_w-overlay_w-20:main_h-overlay_h-20`
- Center: `overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2`

### Watermark Size

To resize the watermark, add a scale filter:

```bash
ffmpeg -i input.mp4 -i logo.png -filter_complex "scale=200:100,overlay=20:20" output.mp4
```

## Performance Considerations

- Processing time depends on video length and resolution
- Large videos may require more memory
- Consider implementing progress indicators for long operations
- For very large files, consider chunked processing

## Security

- The function uses the service role key for Supabase access
- Input validation prevents path traversal attacks
- Temporary files are stored in a secure location
- File extensions are validated to prevent malicious uploads