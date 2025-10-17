/**
 * Enhanced Resilience Features for Video Watermarking
 * 
 * Additional bulletproofing layers for the watermarking system
 */

/**
 * Detect if browser tab is visible (stops processing if tab is hidden to save resources)
 */
export function createVisibilityHandler(onHidden: () => void, onVisible: () => void) {
  const handleVisibilityChange = () => {
    if (document.hidden) {
      console.warn('[Visibility] Tab hidden - pausing resource-intensive operations');
      onHidden();
    } else {
      console.log('[Visibility] Tab visible - resuming operations');
      onVisible();
    }
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}

/**
 * Monitor memory pressure and adjust processing if needed
 */
export async function checkMemoryPressure(): Promise<{
  canProceed: boolean;
  warningLevel: 'low' | 'medium' | 'high';
  availableMemory?: number;
}> {
  try {
    // @ts-ignore - performance.memory is Chrome-specific
    if (performance.memory) {
      // @ts-ignore
      const used = performance.memory.usedJSHeapSize;
      // @ts-ignore
      const limit = performance.memory.jsHeapSizeLimit;
      const percentUsed = (used / limit) * 100;
      
      console.log(`[Memory] Using ${(used / 1024 / 1024).toFixed(0)}MB / ${(limit / 1024 / 1024).toFixed(0)}MB (${percentUsed.toFixed(1)}%)`);
      
      if (percentUsed > 90) {
        return { canProceed: false, warningLevel: 'high', availableMemory: limit - used };
      } else if (percentUsed > 75) {
        return { canProceed: true, warningLevel: 'medium', availableMemory: limit - used };
      } else {
        return { canProceed: true, warningLevel: 'low', availableMemory: limit - used };
      }
    }
  } catch (e) {
    // Memory API not available, assume we can proceed
  }
  
  return { canProceed: true, warningLevel: 'low' };
}

/**
 * Detect frame drops and adjust quality if needed
 */
export class FrameDropDetector {
  private expectedFrames: number = 0;
  private actualFrames: number = 0;
  private lastCheckTime: number = 0;
  private dropCount: number = 0;
  
  constructor(private fps: number) {
    this.lastCheckTime = Date.now();
  }
  
  recordFrame() {
    this.actualFrames++;
  }
  
  check(): { dropRate: number; shouldAdjust: boolean } {
    const now = Date.now();
    const elapsed = (now - this.lastCheckTime) / 1000;
    
    if (elapsed > 0) {
      this.expectedFrames = elapsed * this.fps;
      const dropRate = 1 - (this.actualFrames / this.expectedFrames);
      
      if (dropRate > 0.1) { // More than 10% frame drop
        this.dropCount++;
      } else {
        this.dropCount = Math.max(0, this.dropCount - 1);
      }
      
      return {
        dropRate: dropRate,
        shouldAdjust: this.dropCount > 3 // Adjust if drops persist
      };
    }
    
    return { dropRate: 0, shouldAdjust: false };
  }
  
  reset() {
    this.actualFrames = 0;
    this.lastCheckTime = Date.now();
  }
}

/**
 * Chunk manager for better large video handling
 */
export class ChunkManager {
  private chunks: Blob[] = [];
  private totalSize: number = 0;
  private maxChunks: number = 1000; // Prevent memory overflow
  
  addChunk(chunk: Blob) {
    this.chunks.push(chunk);
    this.totalSize += chunk.size;
    
    // Warn if too many chunks (might indicate memory issue)
    if (this.chunks.length > this.maxChunks) {
      console.warn(`[ChunkManager] Large number of chunks: ${this.chunks.length}. Total size: ${(this.totalSize / 1024 / 1024).toFixed(2)}MB`);
    }
  }
  
  getBlob(mimeType: string): Blob {
    console.log(`[ChunkManager] Creating blob from ${this.chunks.length} chunks (${(this.totalSize / 1024 / 1024).toFixed(2)}MB)`);
    return new Blob(this.chunks, { type: mimeType });
  }
  
  clear() {
    this.chunks = [];
    this.totalSize = 0;
  }
  
  getStats() {
    return {
      chunkCount: this.chunks.length,
      totalSize: this.totalSize,
      averageChunkSize: this.chunks.length > 0 ? this.totalSize / this.chunks.length : 0
    };
  }
}

/**
 * Network resilience helper for loading remote resources
 */
export async function loadResourceWithRetry(
  url: string,
  type: 'image' | 'video',
  maxRetries: number = 3
): Promise<HTMLImageElement | HTMLVideoElement> {
  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      if (type === 'image') {
        return await new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          
          const timeout = setTimeout(() => {
            reject(new Error(`Image load timeout after 10 seconds (attempt ${attempt + 1})`));
          }, 10000);
          
          img.onload = () => {
            clearTimeout(timeout);
            resolve(img);
          };
          
          img.onerror = () => {
            clearTimeout(timeout);
            reject(new Error(`Failed to load image from ${url}`));
          };
          
          img.src = url;
        });
      } else {
        return await new Promise<HTMLVideoElement>((resolve, reject) => {
          const video = document.createElement('video');
          video.src = url;
          video.playsInline = true;
          video.crossOrigin = 'anonymous';
          video.muted = true;
          video.preload = 'auto';
          
          const timeout = setTimeout(() => {
            reject(new Error(`Video load timeout after 30 seconds (attempt ${attempt + 1})`));
          }, 30000);
          
          video.addEventListener('loadedmetadata', () => {
            clearTimeout(timeout);
            resolve(video);
          }, { once: true });
          
          video.addEventListener('error', (e) => {
            clearTimeout(timeout);
            reject(new Error(`Failed to load video: ${(e as any).message || 'Unknown error'}`));
          }, { once: true });
        });
      }
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.warn(`[ResourceLoader] Attempt ${attempt + 1} failed: ${lastError.message}`);
        console.warn(`[ResourceLoader] Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw new Error(`Failed to load ${type} after ${maxRetries} attempts: ${lastError?.message}`);
}

/**
 * Detect if video might be corrupted
 */
export async function detectVideoCorruption(video: HTMLVideoElement): Promise<{
  isCorrupted: boolean;
  issues: string[];
}> {
  const issues: string[] = [];
  
  // Check basic properties
  if (video.duration === Infinity) {
    issues.push('Video has infinite duration (might be corrupted or streaming)');
  }
  
  if (video.videoWidth === 0 || video.videoHeight === 0) {
    issues.push('Video has no dimensions');
  }
  
  if (isNaN(video.duration) || video.duration <= 0) {
    issues.push('Video has invalid duration');
  }
  
  // Try to seek to middle and back
  try {
    const originalTime = video.currentTime;
    const middleTime = video.duration / 2;
    
    video.currentTime = middleTime;
    await new Promise((resolve) => {
      video.addEventListener('seeked', resolve, { once: true });
      setTimeout(resolve, 1000); // Timeout after 1s
    });
    
    if (Math.abs(video.currentTime - middleTime) > 1) {
      issues.push('Video seeking appears broken');
    }
    
    // Seek back
    video.currentTime = originalTime;
  } catch (e) {
    issues.push('Video seeking test failed');
  }
  
  return {
    isCorrupted: issues.length > 0,
    issues
  };
}

/**
 * Smart quality adjuster based on system performance
 */
export class QualityAdjuster {
  private performanceScore: number = 100;
  private adjustmentCount: number = 0;
  
  recordPerformance(fps: number, targetFps: number) {
    const performanceRatio = fps / targetFps;
    this.performanceScore = performanceRatio * 100;
    
    if (this.performanceScore < 70) {
      console.warn(`[QualityAdjuster] Performance at ${this.performanceScore.toFixed(1)}% of target`);
    }
  }
  
  shouldReduceQuality(): boolean {
    return this.performanceScore < 60 && this.adjustmentCount < 3;
  }
  
  getAdjustedBitrate(originalBitrate: number): number {
    if (this.shouldReduceQuality()) {
      this.adjustmentCount++;
      const reduction = Math.min(0.5, 0.2 * this.adjustmentCount); // Max 50% reduction
      const adjusted = originalBitrate * (1 - reduction);
      console.log(`[QualityAdjuster] Reducing bitrate from ${(originalBitrate / 1000000).toFixed(1)} to ${(adjusted / 1000000).toFixed(1)} Mbps`);
      return adjusted;
    }
    return originalBitrate;
  }
}

