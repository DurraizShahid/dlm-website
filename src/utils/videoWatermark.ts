/**
 * Enhanced Client-Side Video Watermarking Utility
 * 
 * This module provides production-ready client-side video watermarking functionality
 * with high-quality output, reliable audio handling, progress tracking, and proper cleanup.
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export interface WatermarkOptions {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity?: number; // 0-1
  scale?: number; // 0.05-0.3 (percentage of video width)
  margin?: number; // pixels from edge
  watermarkUrl?: string;
  outputFormat?: 'webm' | 'mp4'; // Output format
}

export interface WatermarkProgress {
  percent: number;
  phase: 'loading' | 'processing' | 'finalizing';
  currentFrame?: number;
  totalFrames?: number;
}

export type ProgressCallback = (progress: WatermarkProgress) => void;

const DEFAULT_OPTIONS: Required<WatermarkOptions> = {
  position: 'top-left',
  opacity: 0.7,
  scale: 0.15,
  margin: 20,
  watermarkUrl: '/logo.png',
  outputFormat: 'webm' // Default to WebM (faster, more reliable). Set to 'mp4' if needed.
};

/**
 * Calculate watermark position based on canvas dimensions and options
 */
function calculateWatermarkPosition(
  canvasWidth: number,
  canvasHeight: number,
  watermarkWidth: number,
  watermarkHeight: number,
  position: string,
  margin: number
): { x: number; y: number } {
  switch (position) {
    case 'top-left':
      return { x: margin, y: margin };
    case 'top-right':
      return { x: canvasWidth - watermarkWidth - margin, y: margin };
    case 'bottom-left':
      return { x: margin, y: canvasHeight - watermarkHeight - margin };
    case 'bottom-right':
      return { 
        x: canvasWidth - watermarkWidth - margin, 
        y: canvasHeight - watermarkHeight - margin 
      };
    case 'center':
      return { 
        x: (canvasWidth - watermarkWidth) / 2, 
        y: (canvasHeight - watermarkHeight) / 2 
      };
    default:
      return { x: margin, y: margin };
  }
}

// FFmpeg instance (singleton)
let ffmpegInstance: FFmpeg | null = null;
let ffmpegLoaded = false;

/**
 * Load FFmpeg instance with timeout
 */
async function loadFFmpeg(): Promise<FFmpeg> {
  if (ffmpegInstance && ffmpegLoaded) {
    return ffmpegInstance;
  }
  
  if (!ffmpegInstance) {
    ffmpegInstance = new FFmpeg();
    
    // Add logging for debugging
    ffmpegInstance.on('log', ({ message }) => {
      console.log('[FFmpeg]', message);
    });
  }
  
  if (!ffmpegLoaded) {
    try {
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd';
      
      console.log('Loading FFmpeg from CDN...');
      
      // Add timeout to prevent hanging
      const loadPromise = ffmpegInstance.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      
      // 60 second timeout for loading FFmpeg
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('FFmpeg load timeout after 60 seconds')), 60000)
      );
      
      await Promise.race([loadPromise, timeoutPromise]);
      
      ffmpegLoaded = true;
      console.log('FFmpeg loaded successfully');
    } catch (error) {
      console.error('Failed to load FFmpeg:', error);
      // Reset instance so it can be retried
      ffmpegInstance = null;
      ffmpegLoaded = false;
      throw error;
    }
  }
  
  return ffmpegInstance;
}

/**
 * Convert WebM video to MP4 using FFmpeg with timeout
 */
async function convertWebMToMP4(webmBlob: Blob, onProgress?: (message: string) => void): Promise<Blob> {
  const startTime = Date.now();
  
  try {
    onProgress?.('Loading FFmpeg...');
    console.log('Starting MP4 conversion, WebM size:', (webmBlob.size / 1024 / 1024).toFixed(2), 'MB');
    
    const ffmpeg = await loadFFmpeg();
    
    onProgress?.('Writing video file...');
    console.log('Writing input file to FFmpeg...');
    
    // Write input file
    await ffmpeg.writeFile('input.webm', await fetchFile(webmBlob));
    
    onProgress?.('Converting to MP4 format...');
    console.log('Starting FFmpeg conversion...');
    
    // Convert to MP4 with high quality settings
    const conversionPromise = ffmpeg.exec([
      '-i', 'input.webm',
      '-c:v', 'libx264',     // H.264 codec for video
      '-preset', 'ultrafast', // Much faster encoding
      '-crf', '23',          // Good quality (lower = better, but 18 was too slow)
      '-c:a', 'aac',         // AAC codec for audio
      '-b:a', '128k',        // 128kbps audio bitrate
      '-movflags', '+faststart', // Enable streaming
      'output.mp4'
    ]);
    
    // Add timeout for conversion (2 minutes per MB of video)
    const timeoutMs = Math.max(120000, (webmBlob.size / 1024 / 1024) * 120000);
    console.log(`Conversion timeout set to ${(timeoutMs / 1000).toFixed(0)} seconds`);
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error(`MP4 conversion timeout after ${(timeoutMs / 1000).toFixed(0)} seconds`)), timeoutMs)
    );
    
    await Promise.race([conversionPromise, timeoutPromise]);
    
    console.log('Conversion complete, reading output file...');
    
    // Read output file
    const data = await ffmpeg.readFile('output.mp4');
    
    console.log('Cleaning up temporary files...');
    
    // Clean up
    try {
      await ffmpeg.deleteFile('input.webm');
      await ffmpeg.deleteFile('output.mp4');
    } catch (cleanupError) {
      console.warn('Cleanup error (non-critical):', cleanupError);
    }
    
    // Convert to Blob
    const mp4Blob = new Blob([data] as unknown as BlobPart[], { type: 'video/mp4' });
    
    const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);
    const mp4Size = (mp4Blob.size / 1024 / 1024).toFixed(2);
    console.log(`MP4 conversion successful in ${elapsedTime}s, output size: ${mp4Size} MB`);
    
    return mp4Blob;
  } catch (error) {
    const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.error(`Error converting to MP4 after ${elapsedTime}s:`, error);
    throw new Error(`Failed to convert to MP4: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Load an image with error handling
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load watermark image from ${src}`));
    img.src = src;
  });
}

/**
 * Create and setup video element
 */
function createVideoElement(url: string): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.src = url;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';
    video.muted = true; // Mute to prevent audio playback during processing
    video.preload = 'auto';
    
    video.addEventListener('loadedmetadata', () => resolve(video), { once: true });
    video.addEventListener('error', () => reject(new Error('Failed to load video')), { once: true });
  });
}

/**
 * Get the best supported MIME type for recording
 */
function getBestMimeType(): string {
  const types = [
    'video/webm;codecs=h264,opus',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=h264',
    'video/webm'
  ];
  
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  
  return 'video/webm';
}

/**
 * Add watermark to a video file
 * 
 * @param videoUrl - URL or blob URL of the video to watermark
 * @param options - Watermarking options (position, opacity, scale, etc.)
 * @param onProgress - Optional callback for progress updates
 * @returns Promise<Blob> - The watermarked video as a Blob
 */
export async function addWatermarkToVideo(
  videoUrl: string,
  options: WatermarkOptions = {},
  onProgress?: ProgressCallback
): Promise<Blob> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // Resources to cleanup
  const resources: Array<HTMLVideoElement | HTMLCanvasElement | MediaStream> = [];
  
  try {
    // Phase 1: Loading
    onProgress?.({ percent: 0, phase: 'loading' });
    
    // Load watermark and video in parallel
    const [watermark, video] = await Promise.all([
      loadImage(opts.watermarkUrl),
      createVideoElement(videoUrl)
    ]);
    
    resources.push(video);
    
    onProgress?.({ percent: 10, phase: 'loading' });
    
    // Create canvas for frame processing
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    resources.push(canvas);
    
    const ctx = canvas.getContext('2d', {
      alpha: false, // No alpha channel for better performance
      desynchronized: true // Allow faster rendering
    });
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    
    // Calculate watermark dimensions
    const watermarkWidth = canvas.width * opts.scale;
    const watermarkScale = watermarkWidth / watermark.width;
    const watermarkHeight = watermark.height * watermarkScale;
    
    // Calculate watermark position
    const watermarkPos = calculateWatermarkPosition(
      canvas.width,
      canvas.height,
      watermarkWidth,
      watermarkHeight,
      opts.position,
      opts.margin
    );
    
    // Phase 2: Processing
    onProgress?.({ percent: 20, phase: 'processing' });
    
    // Set up frame rate - let canvas stream handle the FPS
    const fps = 30;
    
    // Create canvas stream for video
    const canvasStream = canvas.captureStream(fps);
    resources.push(canvasStream);
    
    // Create combined stream
    const combinedStream = new MediaStream();
    
    // Add video track from canvas
    const videoTrack = canvasStream.getVideoTracks()[0];
    if (videoTrack) {
      combinedStream.addTrack(videoTrack);
    }
    
    // Extract audio using captureStream (more reliable than Web Audio API for this use case)
    try {
      // Create a separate video element for audio extraction to avoid conflicts
      const audioVideo = document.createElement('video');
      audioVideo.src = videoUrl;
      audioVideo.crossOrigin = 'anonymous';
      audioVideo.muted = false; // Must NOT be muted to capture audio
      audioVideo.volume = 0; // But set volume to 0 so we don't hear it during processing
      
      resources.push(audioVideo);
      
      // Wait for audio video to be ready
      await new Promise<void>((resolve) => {
        audioVideo.addEventListener('loadedmetadata', () => resolve(), { once: true });
      });
      
      // Capture audio stream from the video
      // @ts-ignore - captureStream may not be in all TypeScript definitions
      const audioStream = audioVideo.captureStream ? audioVideo.captureStream() : audioVideo.mozCaptureStream();
      
      if (audioStream) {
        const audioTracks = audioStream.getAudioTracks();
        
        if (audioTracks.length > 0) {
          // Add the first audio track to combined stream
          combinedStream.addTrack(audioTracks[0]);
          console.log(`Successfully added audio track: ${audioTracks[0].label || 'unnamed'}`);
        } else {
          console.warn('No audio tracks found in video - watermarked video will have no sound');
        }
      }
    } catch (audioError) {
      console.warn('Could not capture audio track:', audioError);
      console.warn('Watermarked video will be created without audio');
    }
    
    resources.push(combinedStream);
    
    console.log(`Recording with ${combinedStream.getVideoTracks().length} video track(s) and ${combinedStream.getAudioTracks().length} audio track(s)`);
    
    // Set up MediaRecorder with high quality settings
    const mimeType = getBestMimeType();
    const mediaRecorder = new MediaRecorder(combinedStream, {
      mimeType: mimeType,
      videoBitsPerSecond: 8000000, // 8 Mbps for high quality
      audioBitsPerSecond: 128000 // 128 kbps audio
    });
    
    const chunks: Blob[] = [];
    
    // Return a promise that resolves when recording is complete
    return new Promise((resolve, reject) => {
      // Handle recorded data
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      // Handle recording stop
      mediaRecorder.onstop = async () => {
        try {
          onProgress?.({ percent: 90, phase: 'finalizing' });
          
          let finalBlob = new Blob(chunks, { type: mimeType });
          
          // Convert to MP4 if requested
          if (opts.outputFormat === 'mp4') {
            try {
              console.log('Starting MP4 conversion...');
              onProgress?.({ percent: 92, phase: 'finalizing' });
              
              finalBlob = await convertWebMToMP4(finalBlob, (msg) => {
                console.log('FFmpeg progress:', msg);
                onProgress?.({ percent: 95, phase: 'finalizing' });
              });
              
              console.log('MP4 conversion complete');
              onProgress?.({ percent: 98, phase: 'finalizing' });
            } catch (convertError) {
              console.error('MP4 conversion failed:', convertError);
              console.warn('Keeping WebM format due to conversion error');
              
              // Show user-friendly error
              if (convertError instanceof Error) {
                if (convertError.message.includes('timeout')) {
                  console.warn('Conversion took too long, using WebM instead');
                } else if (convertError.message.includes('FFmpeg')) {
                  console.warn('FFmpeg loading failed, using WebM instead');
                }
              }
              
              // Keep the WebM version if conversion fails
              // User still gets watermarked video, just in WebM format
            }
          }
          
          // Cleanup
          cleanup();
          
          onProgress?.({ percent: 100, phase: 'finalizing' });
          resolve(finalBlob);
        } catch (error) {
          cleanup();
          reject(error);
        }
      };
      
      // Handle recording error
      mediaRecorder.onerror = (e) => {
        console.error('MediaRecorder error:', e);
        cleanup();
        reject(new Error('Failed to record watermarked video'));
      };
      
      // Start recording with larger time slices for better stability with long videos
      mediaRecorder.start(1000); // Collect data every 1 second (more stable for long videos)
      
      // Calculate total frames for progress tracking
      const totalFrames = Math.ceil((video.duration * fps));
      let frameCount = 0;
      let lastProgressUpdate = 0;
      
      // Process video frames - using requestAnimationFrame for smooth playback
      const processFrame = () => {
        if (video.paused || video.ended) {
          // Stop audio video if it exists
          const audioVideo = resources.find(r => r instanceof HTMLVideoElement && r !== video) as HTMLVideoElement | undefined;
          if (audioVideo) {
            audioVideo.pause();
          }
          mediaRecorder.stop();
          return;
        }
        
        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Add watermark overlay
        ctx.globalAlpha = opts.opacity;
        ctx.drawImage(
          watermark,
          watermarkPos.x,
          watermarkPos.y,
          watermarkWidth,
          watermarkHeight
        );
        ctx.globalAlpha = 1.0;
        
        frameCount++;
        
        // Update progress (throttled to every 5%)
        const currentProgress = 20 + Math.floor((video.currentTime / video.duration) * 75);
        if (currentProgress >= lastProgressUpdate + 5) {
          lastProgressUpdate = currentProgress;
          onProgress?.({ 
            percent: currentProgress, 
            phase: 'processing',
            currentFrame: frameCount,
            totalFrames: totalFrames
          });
        }
        
        // Continue processing - let the browser control timing for smoother playback
        requestAnimationFrame(processFrame);
      };
      
      // Start both video elements for synchronized playback
      video.currentTime = 0;
      
      // Find and start the audio video if it exists
      const audioVideo = resources.find(r => r instanceof HTMLVideoElement && r !== video) as HTMLVideoElement | undefined;
      if (audioVideo) {
        audioVideo.currentTime = 0;
      }
      
      // Start playback of both videos
      const playPromises: Promise<void>[] = [video.play()];
      if (audioVideo) {
        playPromises.push(audioVideo.play());
      }
      
      Promise.all(playPromises)
        .then(() => {
          requestAnimationFrame(processFrame);
        })
        .catch((error) => {
          cleanup();
          reject(new Error(`Failed to play video: ${error.message}`));
        });
      
      // Safety timeout: stop after video duration + 5 seconds
      const maxDuration = (video.duration * 1000) + 5000;
      setTimeout(() => {
        if (mediaRecorder.state !== 'inactive') {
          console.warn('Watermarking timed out, stopping recording');
          video.pause();
          
          // Stop audio video if it exists
          const audioVideo = resources.find(r => r instanceof HTMLVideoElement && r !== video) as HTMLVideoElement | undefined;
          if (audioVideo) {
            audioVideo.pause();
          }
          
          mediaRecorder.stop();
        }
      }, maxDuration);
    });
    
  } catch (error) {
    cleanup();
    throw error;
  }
  
  // Cleanup function to prevent memory leaks
  function cleanup() {
    resources.forEach(resource => {
      try {
        if ('pause' in resource && typeof resource.pause === 'function') {
          resource.pause();
        }
        if ('getTracks' in resource && typeof resource.getTracks === 'function') {
          resource.getTracks().forEach(track => track.stop());
        }
        if ('src' in resource) {
          resource.src = '';
        }
      } catch (e) {
        // Ignore cleanup errors
        console.warn('Error during cleanup:', e);
      }
    });
    resources.length = 0;
  }
}

/**
 * Verify if a video has a watermark
 * Uses canvas frame sampling to detect watermark presence
 */
export async function verifyWatermark(
  videoUrl: string,
  watermarkUrl: string = '/logo.png',
  samplePoints: number = 5
): Promise<boolean> {
  try {
    const [video, watermark] = await Promise.all([
      createVideoElement(videoUrl),
      loadImage(watermarkUrl)
    ]);
    
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    
    // Sample frames at different points in the video
    const sampleTimes = Array.from({ length: samplePoints }, (_, i) => 
      (video.duration / (samplePoints + 1)) * (i + 1)
    );
    
    let watermarkDetected = 0;
    
    for (const time of sampleTimes) {
      video.currentTime = time;
      await new Promise(resolve => {
        video.addEventListener('seeked', resolve, { once: true });
      });
      
      // Draw current frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get image data from top-left corner (where watermark typically is)
      const sampleWidth = Math.min(canvas.width * 0.3, 300);
      const sampleHeight = Math.min(canvas.height * 0.3, 300);
      const imageData = ctx.getImageData(0, 0, sampleWidth, sampleHeight);
      
      // Simple check: if there's variation in this region, likely has watermark
      // More sophisticated detection could use template matching
      const pixels = imageData.data;
      let totalVariation = 0;
      
      for (let i = 0; i < pixels.length - 4; i += 4) {
        const variation = Math.abs(pixels[i] - pixels[i + 4]) +
                         Math.abs(pixels[i + 1] - pixels[i + 5]) +
                         Math.abs(pixels[i + 2] - pixels[i + 6]);
        totalVariation += variation;
      }
      
      // If there's significant variation, watermark likely present
      if (totalVariation > 10000) {
        watermarkDetected++;
      }
    }
    
    // Cleanup
    video.pause();
    video.src = '';
    
    // If watermark detected in majority of samples, return true
    return watermarkDetected >= Math.ceil(samplePoints / 2);
    
  } catch (error) {
    console.error('Error verifying watermark:', error);
    return false;
  }
}

/**
 * Validate video file before processing
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
  warnings?: string[];
}

export async function validateVideoForWatermarking(file: File): Promise<ValidationResult> {
  const warnings: string[] = [];
  
  // Check file type
  if (!file.type.startsWith('video/')) {
    return { valid: false, error: 'File must be a video' };
  }
  
  // Check file size (recommend under 200MB for client-side processing)
  const maxSize = 200 * 1024 * 1024; // 200MB
  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: `Video file is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 200MB for client-side watermarking.` 
    };
  }
  
  // Warn if file is large
  if (file.size > 100 * 1024 * 1024) {
    warnings.push(`Large file size (${(file.size / 1024 / 1024).toFixed(1)}MB). Processing may take several minutes.`);
  }
  
  // Try to load video and check duration
  try {
    const url = URL.createObjectURL(file);
    const video = await createVideoElement(url);
    
    // Check duration (warn if over 2 minutes)
    if (video.duration > 120) {
      warnings.push(`Video is ${Math.floor(video.duration / 60)} minutes long. Processing may take significant time.`);
    }
    
    // Check resolution
    if (video.videoWidth > 1920 || video.videoHeight > 1080) {
      warnings.push(`High resolution video (${video.videoWidth}x${video.videoHeight}). Processing may be slow.`);
    }
    
    // Cleanup
    video.pause();
    video.src = '';
    URL.revokeObjectURL(url);
    
    return { 
      valid: true, 
      warnings: warnings.length > 0 ? warnings : undefined 
    };
    
  } catch (error) {
    return { 
      valid: false, 
      error: `Could not load video: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

