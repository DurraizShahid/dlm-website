/**
 * Performance monitoring utility for watermarking operations
 */

export class PerformanceMonitor {
  private startTime: number;
  private checkpoints: Map<string, number>;
  
  constructor(private operationName: string) {
    this.startTime = performance.now();
    this.checkpoints = new Map();
    console.log(`[Performance] ${operationName} started`);
  }
  
  checkpoint(name: string) {
    const elapsed = performance.now() - this.startTime;
    this.checkpoints.set(name, elapsed);
    console.log(`[Performance] ${this.operationName} - ${name}: ${elapsed.toFixed(0)}ms`);
  }
  
  end() {
    const totalTime = performance.now() - this.startTime;
    console.log(`[Performance] ${this.operationName} completed in ${totalTime.toFixed(0)}ms`);
    
    // Log all checkpoints
    console.log('[Performance] Breakdown:');
    this.checkpoints.forEach((time, name) => {
      console.log(`  ${name}: ${time.toFixed(0)}ms`);
    });
    
    return totalTime;
  }
}

/**
 * Check browser capabilities for watermarking
 */
export function checkBrowserCapabilities(): {
  supported: boolean;
  warnings: string[];
  features: {
    canvas: boolean;
    mediaRecorder: boolean;
    captureStream: boolean;
    webm: boolean;
    audioContext: boolean;
  };
} {
  const warnings: string[] = [];
  const features = {
    canvas: false,
    mediaRecorder: false,
    captureStream: false,
    webm: false,
    audioContext: false
  };
  
  // Check Canvas API
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    features.canvas = !!ctx;
  } catch (e) {
    warnings.push('Canvas API not supported');
  }
  
  // Check MediaRecorder API
  features.mediaRecorder = typeof MediaRecorder !== 'undefined';
  if (!features.mediaRecorder) {
    warnings.push('MediaRecorder API not supported');
  }
  
  // Check captureStream
  const video = document.createElement('video');
  features.captureStream = typeof video.captureStream === 'function' || 
                          typeof (video as any).mozCaptureStream === 'function';
  if (!features.captureStream) {
    warnings.push('captureStream not supported');
  }
  
  // Check WebM support
  if (features.mediaRecorder) {
    features.webm = MediaRecorder.isTypeSupported('video/webm');
    if (!features.webm) {
      warnings.push('WebM recording not supported');
    }
  }
  
  // Check AudioContext
  features.audioContext = typeof AudioContext !== 'undefined' || 
                         typeof (window as any).webkitAudioContext !== 'undefined';
  
  const supported = features.canvas && features.mediaRecorder && 
                    features.captureStream && features.webm;
  
  return { supported, warnings, features };
}

