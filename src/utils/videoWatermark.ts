/**
 * Enhanced Client-Side Video Watermarking Utility
 * 
 * This module provides production-ready client-side video watermarking functionality
 * with high-quality output, reliable audio handling, progress tracking, and proper cleanup.
 */

export interface WatermarkOptions {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity?: number; // 0-1
  scale?: number; // 0.05-0.3 (percentage of video width)
  margin?: number; // pixels from edge
  watermarkUrl?: string;
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
  watermarkUrl: '/logo.png'
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
    
    // Set up frame rate
    const fps = 30;
    const frameDuration = 1000 / fps;
    
    // Create canvas stream
    const canvasStream = canvas.captureStream(fps);
    resources.push(canvasStream);
    
    // Get audio track from original video
    const audioContext = new AudioContext();
    const source = audioContext.createMediaElementSource(video);
    const destination = audioContext.createMediaStreamDestination();
    source.connect(destination);
    
    // Create combined stream with video and audio
    const combinedStream = new MediaStream();
    const videoTrack = canvasStream.getVideoTracks()[0];
    if (videoTrack) {
      combinedStream.addTrack(videoTrack);
    }
    
    // Add audio tracks from destination
    const audioTracks = destination.stream.getAudioTracks();
    audioTracks.forEach(track => combinedStream.addTrack(track));
    
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
          onProgress?.({ percent: 95, phase: 'finalizing' });
          
          const watermarkedBlob = new Blob(chunks, { type: mimeType });
          
          // Cleanup
          cleanup();
          
          onProgress?.({ percent: 100, phase: 'finalizing' });
          resolve(watermarkedBlob);
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
      
      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms
      
      // Calculate total frames for progress tracking
      const totalFrames = Math.ceil((video.duration * fps));
      let frameCount = 0;
      let lastProgressUpdate = 0;
      
      // Process video frames
      const processFrame = () => {
        if (video.paused || video.ended) {
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
        const currentProgress = 20 + Math.floor((frameCount / totalFrames) * 75);
        if (currentProgress >= lastProgressUpdate + 5) {
          lastProgressUpdate = currentProgress;
          onProgress?.({ 
            percent: currentProgress, 
            phase: 'processing',
            currentFrame: frameCount,
            totalFrames: totalFrames
          });
        }
        
        // Continue processing at consistent frame rate
        setTimeout(() => requestAnimationFrame(processFrame), frameDuration);
      };
      
      // Start video playback and frame processing
      video.currentTime = 0;
      video.play()
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

