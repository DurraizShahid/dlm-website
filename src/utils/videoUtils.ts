import { supabase } from '@/integrations/supabase/client';

/**
 * Generate a signed URL for accessing a video file from Supabase Storage
 * @param filePath - The file path in the storage bucket (e.g., 'videos/filename.mp4')
 * @param expiresIn - URL expiration time in seconds (default: 3600 = 1 hour)
 * @returns Promise<string | null> - The signed URL or null if error
 */
export const generateVideoSignedUrl = async (
  filePath: string, 
  expiresIn: number = 3600
): Promise<string | null> => {
  try {
    const { data, error } = await (supabase as any).storage
      .from('application-videos')
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error('Error creating signed URL for video:', error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return null;
  }
};

/**
 * Generate a signed URL for accessing a screenshot file from Supabase Storage
 * @param filePath - The file path in the storage bucket (e.g., 'screenshots/filename.png')
 * @param expiresIn - URL expiration time in seconds (default: 3600 = 1 hour)
 * @returns Promise<string | null> - The signed URL or null if error
 */
export const generateScreenshotSignedUrl = async (
  filePath: string, 
  expiresIn: number = 3600
): Promise<string | null> => {
  try {
    const { data, error } = await (supabase as any).storage
      .from('application-videos')
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error('Error creating signed URL for screenshot:', error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Error generating signed URL for screenshot:', error);
    return null;
  }
};

/**
 * Check if a video URL is accessible
 * @param filePath - The file path in the storage bucket
 * @returns Promise<boolean> - True if video exists and is accessible
 */
export const checkVideoExists = async (filePath: string): Promise<boolean> => {
  try {
    const { data, error } = await (supabase as any).storage
      .from('application-videos')
      .list('videos', {
        search: filePath.replace('videos/', '')
      });

    if (error) {
      console.error('Error checking video existence:', error);
      return false;
    }

    return data && data.length > 0;
  } catch (error) {
    console.error('Error checking video existence:', error);
    return false;
  }
};

/**
 * Get video metadata from storage
 * @param filePath - The file path in the storage bucket
 * @returns Promise<any | null> - Video metadata or null if error
 */
export const getVideoMetadata = async (filePath: string): Promise<any | null> => {
  try {
    const { data, error } = await (supabase as any).storage
      .from('application-videos')
      .list('videos', {
        search: filePath.replace('videos/', '')
      });

    if (error) {
      console.error('Error fetching video metadata:', error);
      return null;
    }

    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error fetching video metadata:', error);
    return null;
  }
};