/**
 * Meta Pixel (Facebook Pixel) Integration Utility
 * 
 * This utility provides a type-safe wrapper around Meta Pixel tracking functions
 * to enable conversion tracking and analytics for Meta Ads campaigns.
 */

// Type definitions for Meta Pixel
declare global {
  interface Window {
    fbq?: {
      (command: 'track', eventName: string, params?: Record<string, any>): void;
      (command: 'trackCustom', eventName: string, params?: Record<string, any>): void;
      (command: 'init', pixelId: string, params?: Record<string, any>): void;
    };
    _fbq?: Window['fbq'];
  }
}

export interface MetaPixelEventParams {
  content_name?: string;
  content_category?: string;
  value?: number;
  currency?: string;
  source?: string;
  [key: string]: any;
}

/**
 * Initialize Meta Pixel with the provided Pixel ID
 * This should be called once when the application loads
 */
export const initMetaPixel = (pixelId: string): void => {
  if (!pixelId) {
    console.warn('Meta Pixel ID not provided. Tracking will be disabled.');
    return;
  }

  try {
    if (window.fbq) {
      window.fbq('init', pixelId);
      console.log('Meta Pixel initialized with ID:', pixelId);
    } else {
      console.warn('Meta Pixel script not loaded. Events will not be tracked.');
    }
  } catch (error) {
    console.error('Error initializing Meta Pixel:', error);
  }
};

/**
 * Track a standard Meta Pixel event
 * @param eventName - Standard event name (e.g., 'PageView', 'Lead', 'Purchase')
 * @param params - Optional event parameters
 */
export const trackEvent = (eventName: string, params?: MetaPixelEventParams): void => {
  try {
    if (window.fbq) {
      window.fbq('track', eventName, params);
      console.log(`Meta Pixel: Tracked event "${eventName}"`, params);
    } else {
      console.warn('Meta Pixel not available. Event not tracked:', eventName);
    }
  } catch (error) {
    console.error(`Error tracking Meta Pixel event "${eventName}":`, error);
  }
};

/**
 * Track a custom Meta Pixel event
 * @param eventName - Custom event name (e.g., 'InitiateApplication', 'SubmitApplication')
 * @param params - Optional event parameters
 */
export const trackCustomEvent = (eventName: string, params?: MetaPixelEventParams): void => {
  try {
    if (window.fbq) {
      window.fbq('trackCustom', eventName, params);
      console.log(`Meta Pixel: Tracked custom event "${eventName}"`, params);
    } else {
      console.warn('Meta Pixel not available. Custom event not tracked:', eventName);
    }
  } catch (error) {
    console.error(`Error tracking Meta Pixel custom event "${eventName}":`, error);
  }
};

/**
 * Track PageView event
 * This should be called on every page navigation
 */
export const trackPageView = (): void => {
  trackEvent('PageView');
};

/**
 * Track when user initiates the application process (clicks "Apply Now")
 * @param source - Source of the click (e.g., 'navbar', 'hero', 'cta')
 */
export const trackInitiateApplication = (source?: string): void => {
  trackCustomEvent('InitiateApplication', {
    content_name: 'DLM Application Form',
    content_category: 'Application',
    source: source || 'unknown',
  });
};

/**
 * Track when user successfully submits an application
 * @param applicationId - Optional application ID for tracking
 */
export const trackSubmitApplication = (applicationId?: string): void => {
  const params: MetaPixelEventParams = {
    content_name: 'DLM Application Form',
    content_category: 'Application',
    value: 0,
    currency: 'PKR',
  };

  if (applicationId) {
    params.application_id = applicationId;
  }

  // Track custom event
  trackCustomEvent('SubmitApplication', params);
  
  // Also track standard Lead event for Meta Ads optimization
  trackEvent('Lead', params);
};

/**
 * Check if Meta Pixel is loaded and available
 */
export const isMetaPixelAvailable = (): boolean => {
  return typeof window !== 'undefined' && typeof window.fbq === 'function';
};

/**
 * Get Meta Pixel ID from environment variables
 */
export const getMetaPixelId = (): string | undefined => {
  return import.meta.env.VITE_META_PIXEL_ID;
};
