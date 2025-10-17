# Video Watermarking System Documentation

## Overview

The DLM Website uses a **production-ready client-side watermarking system** that adds watermarks to videos directly in the admin dashboard. This system has been optimized for performance, quality, and reliability.

## ✅ **Current Implementation**

### Where Watermarking Happens
- **Location:** Admin Dashboard only
- **Trigger:** When admin clicks "Download with Watermark" button
- **Processing:** Client-side in the browser using Canvas API and MediaRecorder

### Why Client-Side?
1. **No server costs** - Processing happens in the admin's browser
2. **Immediate results** - No upload/download delays
3. **Simple architecture** - No additional infrastructure needed
4. **Privacy** - Videos never leave the original storage

## 🎬 **Features**

### ✅ Implemented
- ✅ High-quality video output (8 Mbps bitrate)
- ✅ Reliable audio preservation using Web Audio API
- ✅ Real-time progress indicators
- ✅ Automatic retry logic (3 attempts)
- ✅ Watermark verification
- ✅ Customizable watermark position, opacity, and size
- ✅ Proper memory cleanup (no leaks)
- ✅ Video validation before processing
- ✅ Detailed error handling with fallbacks

### Watermark Specifications
- **Position:** Top-left corner by default (customizable)
- **Size:** 15% of video width (scales proportionally)
- **Opacity:** 70% (semi-transparent)
- **Margin:** 20px from edges
- **Format:** PNG logo overlay

## 📁 **File Structure**

```
src/
├── utils/
│   └── videoWatermark.ts          # Core watermarking logic
├── pages/
│   └── Admin.tsx                  # Admin dashboard with watermarking UI
└── components/
    └── ApplyForm.tsx              # User upload (no watermarking)
```

## 🔧 **How It Works**

### Step-by-Step Process

1. **Initialization**
   - Admin clicks "Download with Watermark" on an application
   - System fetches video from Supabase Storage
   - Generates signed URL for secure access

2. **Loading Phase (0-10%)**
   - Loads watermark image (`/logo.png`)
   - Loads video file into memory
   - Validates video metadata

3. **Processing Phase (10-95%)**
   - Creates canvas matching video dimensions
   - Extracts audio using Web Audio API
   - Processes video frame-by-frame at 30 FPS
   - Overlays watermark on each frame
   - Records output using MediaRecorder API
   - Shows real-time progress: "Processing frame X/Y (percent%)"

4. **Finalizing Phase (95-100%)**
   - Combines video and audio tracks
   - Creates final WebM video file
   - Verifies watermark was applied correctly
   - Triggers browser download
   - Cleans up all resources

5. **Error Handling**
   - If watermarking fails, automatically retries (up to 3 attempts)
   - If all retries fail, offers original video download
   - Shows clear error messages to admin

## 💻 **Usage**

### Admin Dashboard

```typescript
// Watermarking happens automatically when admin clicks the button
<Button onClick={() => handleDownloadWithWatermark(application)}>
  <Download className="h-3 w-3 mr-1" />
  Download with Watermark
</Button>
```

### Progress Notifications

Users see real-time updates:
- "Loading video... 5%"
- "Processing frame 45/150 (30%)"
- "Adding watermark... 75%"
- "Finalizing video... 98%"
- "Verifying watermark..."
- "Successfully downloaded with watermark!"

### Customization Options

```typescript
const watermarkOptions: WatermarkOptions = {
  position: 'top-left',      // or 'top-right', 'bottom-left', 'bottom-right', 'center'
  opacity: 0.7,               // 0-1 (70% opacity)
  scale: 0.15,                // 0.05-0.3 (15% of video width)
  margin: 20,                 // pixels from edge
  watermarkUrl: '/logo.png'   // custom watermark image
};
```

## 🎯 **Quality Settings**

### Video Quality
- **Bitrate:** 8 Mbps (high quality, minimal compression artifacts)
- **Codec:** Best available (H.264, VP9, or VP8)
- **Format:** WebM with Opus audio
- **Frame Rate:** Matches original (defaults to 30 FPS)

### Audio Quality
- **Bitrate:** 128 kbps
- **Method:** Web Audio API for reliable extraction
- **Codec:** Opus (high quality, small size)

## ⚡ **Performance**

### Processing Times (Approximate)
- **10-second 720p video:** ~15-30 seconds
- **30-second 720p video:** ~45-90 seconds
- **1-minute 720p video:** ~2-3 minutes
- **1-minute 1080p video:** ~3-5 minutes

### Limitations
- **Maximum recommended size:** 200MB
- **Maximum recommended duration:** 2 minutes
- **Maximum recommended resolution:** 1920x1080 (Full HD)

Videos exceeding these limits will show warnings but can still be processed.

## 🛠️ **Technical Implementation**

### Core Technologies
- **Canvas API:** Frame-by-frame video processing
- **MediaRecorder API:** Recording watermarked video
- **Web Audio API:** Reliable audio extraction and preservation
- **HTML5 Video:** Video playback and frame extraction

### Browser Compatibility
- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari (with limitations)
- ⚠️ Older browsers may not support all features

### Memory Management
The system includes comprehensive cleanup:
```typescript
- Pauses all video elements
- Stops all media tracks
- Revokes blob URLs
- Clears canvas contexts
- Releases AudioContext
```

## 🔍 **Watermark Verification**

The system automatically verifies watermarks using frame sampling:
1. Samples 5 points throughout the video
2. Analyzes pixel variation in watermark region
3. Confirms watermark presence
4. Logs verification results

If verification fails, the system still provides the watermarked video with a warning.

## 🚨 **Error Handling**

### Automatic Retry Logic
```typescript
- Attempt 1: Initial watermarking
- Attempt 2: Retry after 1 second
- Attempt 3: Final retry after 2 seconds
- Fallback: Offer original video download
```

### Common Errors & Solutions

**"Failed to load watermark image"**
- **Cause:** Missing or inaccessible `/logo.png`
- **Solution:** Ensure logo.png exists in public folder

**"Could not get canvas context"**
- **Cause:** Browser limitations or memory issues
- **Solution:** Close other tabs, refresh page

**"Failed to record watermarked video"**
- **Cause:** MediaRecorder API issues
- **Solution:** Try different browser or smaller video

**"Video file too large"**
- **Cause:** File exceeds 200MB limit
- **Solution:** Compress video before upload

## 📊 **Validation**

Before processing, the system validates:
- ✅ File is actually a video
- ✅ File size is under 200MB
- ✅ Video duration is reasonable
- ✅ Video resolution is not excessive
- ✅ Video format is supported

Warnings are shown for:
- Files > 100MB
- Videos > 2 minutes
- Resolution > 1080p

## 🔐 **Security**

- Videos are fetched via signed URLs (1 hour expiry)
- Processing happens entirely client-side
- No video data sent to external servers
- Watermarked videos stored only in admin's browser
- Original videos remain unchanged in Supabase

## 🎨 **Customization Guide**

### Change Watermark Position
```typescript
// Edit in src/pages/Admin.tsx
const watermarkOptions: WatermarkOptions = {
  position: 'bottom-right',  // Change here
  // ... other options
};
```

### Change Watermark Opacity
```typescript
const watermarkOptions: WatermarkOptions = {
  opacity: 0.5,  // 50% transparent (0 = invisible, 1 = opaque)
  // ... other options
};
```

### Change Watermark Size
```typescript
const watermarkOptions: WatermarkOptions = {
  scale: 0.20,  // 20% of video width (0.05 = 5%, 0.30 = 30%)
  // ... other options
};
```

### Use Different Watermark Image
```typescript
const watermarkOptions: WatermarkOptions = {
  watermarkUrl: '/custom-logo.png',  // Must be in public folder
  // ... other options
};
```

## 📈 **Future Enhancements**

Potential improvements (not currently implemented):
- [ ] Batch watermarking (process multiple videos)
- [ ] Text watermarks (custom text overlay)
- [ ] Animated watermarks (GIF support)
- [ ] Multiple watermark positions simultaneously
- [ ] Time-based watermarks (appear/disappear)
- [ ] Video preview before watermarking
- [ ] Background processing with Web Workers
- [ ] Server-side watermarking option for large files

## 🐛 **Troubleshooting**

### Issue: Video has no sound after watermarking
**Solution:**
- Original video may have no audio track
- System uses Web Audio API (most reliable method)
- Check browser console for audio-related warnings

### Issue: Watermarking takes too long
**Solutions:**
- Compress video before upload
- Use lower resolution videos
- Close other browser tabs
- Use Chrome/Edge for best performance

### Issue: Browser tab becomes unresponsive
**Solutions:**
- Video file may be too large
- Refresh page and try again
- Use server-side watermarking for very large files
- Consider implementing video compression

### Issue: Downloaded video is poor quality
**Solutions:**
- Quality preserved at 8 Mbps (very good quality)
- WebM format may appear different than MP4
- Original video quality matters most

## 📝 **Development Notes**

### Testing Watermarking
1. Navigate to Admin dashboard
2. Login with credentials
3. Find application with video
4. Click "Download with Watermark"
5. Wait for processing (progress shown)
6. Video downloads automatically

### Debugging
Enable detailed logging in browser console:
```javascript
// Watch for these log messages:
- "Recording with 1 video track(s) and 1 audio track(s)"
- "Processing frame X/Y (percent%)"
- "Watermark verification: true/false"
```

### Code Location
- **Main logic:** `src/utils/videoWatermark.ts`
- **UI implementation:** `src/pages/Admin.tsx` (handleDownloadWithWatermark function)
- **Type definitions:** Included in videoWatermark.ts

## 🎓 **API Reference**

### `addWatermarkToVideo()`
```typescript
function addWatermarkToVideo(
  videoUrl: string,
  options?: WatermarkOptions,
  onProgress?: ProgressCallback
): Promise<Blob>
```

### `verifyWatermark()`
```typescript
function verifyWatermark(
  videoUrl: string,
  watermarkUrl?: string,
  samplePoints?: number
): Promise<boolean>
```

### `validateVideoForWatermarking()`
```typescript
function validateVideoForWatermarking(
  file: File
): Promise<ValidationResult>
```

## 📞 **Support**

For issues or questions:
1. Check browser console for error messages
2. Verify video meets size/duration requirements
3. Try different browser if issues persist
4. Review this documentation for common solutions

---

**Last Updated:** October 2025  
**Version:** 2.0 (Production-Ready Client-Side Implementation)

