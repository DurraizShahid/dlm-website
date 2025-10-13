import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { generateVideoSignedUrl } from '@/utils/videoUtils';
import { refreshTikTokAccessToken, postVideoToTikTok, generateTikTokOAuthUrl, exchangeCodeForAccessToken, getTikTokUserInfo, testTikTokConnection } from '@/utils/tiktokUtils';
import { generateInstagramOAuthUrl, postVideoToInstagram, getInstagramAccounts, exchangeCodeForAccessToken as exchangeInstagramCodeForAccessToken, getInstagramUserInfo, testInstagramConnection } from '@/utils/instagramUtils';
import { toast } from 'sonner';
import { 
  Shield, 
  Users, 
  FileText, 
  Eye, 
  Clock, 
  CheckCircle, 
  XCircle,
  PlayCircle,
  LogOut,
  Download,
  Image as ImageIcon,
  LogIn
} from 'lucide-react';

interface Application {
  id: string;
  full_name: string;
  email: string;
  age: number;
  address: string;
  cnic: string;
  idea_title: string;
  idea_description: string;
  video_url?: string;
  payment_screenshot_url?: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'unpaid' | 'paid';
  created_at: string;
}

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [tiktokUser, setTiktokUser] = useState<any>(null);
  const [tiktokAccessToken, setTiktokAccessToken] = useState<string | null>(null);
  const [instagramUser, setInstagramUser] = useState<any>(null);
  const [instagramAccessToken, setInstagramAccessToken] = useState<string | null>(null);
  const [instagramAccounts, setInstagramAccounts] = useState<any[]>([]);

  // Check if already authenticated (from session storage)
  useEffect(() => {
    const adminAuth = sessionStorage.getItem('admin_authenticated');
    if (adminAuth === 'true') {
      setIsAuthenticated(true);
      fetchApplications();
    }
    
    // Check for TikTok OAuth callback
    handleTikTokCallback();
    // Check for Instagram OAuth callback
    handleInstagramCallback();
  }, []);

  // Handle TikTok OAuth callback
  const handleTikTokCallback = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');
    
    if (error) {
      toast.error(`TikTok OAuth error: ${error}`);
      return;
    }
    
    if (code && state) {
      // Verify state parameter to prevent CSRF attacks
      const storedState = sessionStorage.getItem('tiktok_oauth_state');
      if (state !== storedState) {
        toast.error('Invalid OAuth state parameter');
        return;
      }
      
      try {
        // Exchange code for access token
        const tokenData = await exchangeCodeForAccessToken(code);
        setTiktokAccessToken(tokenData.access_token);
        
        // Store tokens in sessionStorage
        sessionStorage.setItem('tiktok_access_token', tokenData.access_token);
        sessionStorage.setItem('tiktok_refresh_token', tokenData.refresh_token);
        sessionStorage.setItem('tiktok_token_expires_at', 
          (Date.now() + (tokenData.expires_in * 1000)).toString());
        
        // Get user info
        const userInfo = await getTikTokUserInfo(tokenData.access_token);
        setTiktokUser(userInfo);
        
        toast.success('Successfully connected to TikTok!');
        
        // Remove OAuth parameters from URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error('Error handling TikTok callback:', error);
        toast.error('Failed to connect to TikTok');
      }
    } else {
      // Check if we have stored tokens
      const storedAccessToken = sessionStorage.getItem('tiktok_access_token');
      const tokenExpiry = sessionStorage.getItem('tiktok_token_expires_at');
      
      if (storedAccessToken && tokenExpiry && Date.now() < parseInt(tokenExpiry)) {
        setTiktokAccessToken(storedAccessToken);
        
        // Get user info
        try {
          const userInfo = await getTikTokUserInfo(storedAccessToken);
          setTiktokUser(userInfo);
        } catch (error) {
          console.error('Error getting TikTok user info:', error);
        }
      }
    }
  };

  // Handle Instagram OAuth callback
  const handleInstagramCallback = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');
    
    // Check if this is an Instagram callback (different from TikTok)
    if (window.location.search.includes('instagram_callback')) {
      if (error) {
        toast.error(`Instagram OAuth error: ${error}`);
        return;
      }
      
      if (code && state) {
        // Verify state parameter to prevent CSRF attacks
        const storedState = sessionStorage.getItem('instagram_oauth_state');
        if (state !== storedState) {
          toast.error('Invalid Instagram OAuth state parameter');
          return;
        }
        
        try {
          // Exchange code for access token
          const tokenData = await exchangeInstagramCodeForAccessToken(code);
          setInstagramAccessToken(tokenData.access_token);
          
          // Store tokens in sessionStorage
          sessionStorage.setItem('instagram_access_token', tokenData.access_token);
          if (tokenData.expires_in) {
            sessionStorage.setItem('instagram_token_expires_at', 
              (Date.now() + (tokenData.expires_in * 1000)).toString());
          }
          
          // Get Instagram accounts
          const accounts = await getInstagramAccounts(tokenData.access_token);
          if (accounts && accounts.length > 0) {
            setInstagramAccounts(accounts);
            // Use the first account by default
            const firstAccount = accounts[0];
            setInstagramUser(firstAccount);
            
            // Get user info for the account
            const userInfo = await getInstagramUserInfo(tokenData.access_token, firstAccount.id);
            console.log('Instagram user info:', userInfo);
          }
          
          toast.success('Successfully connected to Instagram!');
          
          // Remove OAuth parameters from URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
          console.error('Error handling Instagram callback:', error);
          toast.error('Failed to connect to Instagram');
        }
      } else {
        // Check if we have stored tokens
        const storedAccessToken = sessionStorage.getItem('instagram_access_token');
        const tokenExpiry = sessionStorage.getItem('instagram_token_expires_at');
        
        if (storedAccessToken && tokenExpiry && Date.now() < parseInt(tokenExpiry)) {
          setInstagramAccessToken(storedAccessToken);
          
          // Get Instagram accounts
          try {
            const accounts = await getInstagramAccounts(storedAccessToken);
            if (accounts && accounts.length > 0) {
              setInstagramAccounts(accounts);
              setInstagramUser(accounts[0]);
            }
          } catch (error) {
            console.error('Error getting Instagram accounts:', error);
          }
        }
      }
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    // Hardcoded credentials (as requested)
    if (username === 'admin' && password === 'admin') {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_authenticated', 'true');
      toast.success('Successfully logged in as admin');
      fetchApplications();
    } else {
      setLoginError('Invalid username or password');
      toast.error('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_authenticated');
    setUsername('');
    setPassword('');
    setApplications([]);
    toast.info('Logged out successfully');
  };

  const handleTikTokLogin = () => {
    // Generate OAuth URL and redirect user
    const oauthUrl = generateTikTokOAuthUrl();
    window.location.href = oauthUrl;
  };

  const handleInstagramLogin = () => {
    // Generate OAuth URL and redirect user
    const oauthUrl = generateInstagramOAuthUrl();
    window.location.href = oauthUrl;
  };

  const handleTikTokLogout = () => {
    setTiktokUser(null);
    setTiktokAccessToken(null);
    sessionStorage.removeItem('tiktok_access_token');
    sessionStorage.removeItem('tiktok_refresh_token');
    sessionStorage.removeItem('tiktok_token_expires_at');
    sessionStorage.removeItem('tiktok_oauth_state');
    toast.info('Disconnected from TikTok');
  };

  const handleInstagramLogout = () => {
    setInstagramUser(null);
    setInstagramAccessToken(null);
    setInstagramAccounts([]);
    sessionStorage.removeItem('instagram_access_token');
    sessionStorage.removeItem('instagram_token_expires_at');
    sessionStorage.removeItem('instagram_oauth_state');
    toast.info('Disconnected from Instagram');
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from('application_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching applications:', error);
        toast.error('Error loading applications');
        return;
      }

      setApplications(data || []);
      toast.success(`Loaded ${data?.length || 0} applications`);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Error loading applications');
    } finally {
      setLoading(false);
    }
  };

  const handleViewVideo = async (filePath: string) => {
    try {
      const signedUrl = await generateVideoSignedUrl(filePath);
      if (signedUrl) {
        window.open(signedUrl, '_blank');
      } else {
        toast.error('Error loading video');
      }
    } catch (error) {
      console.error('Error opening video:', error);
      toast.error('Error opening video');
    }
  };

  // Function to view payment screenshot
  const viewPaymentScreenshot = async (filePath: string) => {
    try {
      const { data, error } = await (supabase as any).storage
        .from('application-videos')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (error) {
        console.error('Error creating signed URL for screenshot:', error);
        toast.error('Error loading screenshot');
        return;
      }

      window.open(data.signedUrl, '_blank');
    } catch (error) {
      console.error('Error opening screenshot:', error);
      toast.error('Error opening screenshot');
    }
  };

  const updateApplicationStatus = async (id: string, newStatus: string) => {
    console.log(`Attempting to update application ${id} to status: ${newStatus}`);
    
    try {
      const { data, error } = await (supabase as any)
        .from('application_submissions')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select(); // Add select to get the updated data

      if (error) {
        console.error('Error updating status:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        toast.error(`Error updating application status: ${error.message}`);
        return;
      }

      console.log('Update successful, response data:', data);

      // Update local state
      setApplications(apps => 
        apps.map(app => 
          app.id === id ? { ...app, status: newStatus as any } : app
        )
      );

      toast.success(`Application status updated to ${newStatus}`);
    } catch (error) {
      console.error('Unexpected error updating status:', error);
      toast.error(`Error updating application status: ${error}`);
    }
  };

  const handlePostToTikTok = async (application: Application) => {
    try {
      toast.info(`Preparing to post "${application.idea_title}" to TikTok...`);
      
      // Check if the application has a video
      if (!application.video_url) {
        toast.error('No video found for this application');
        return;
      }
      
      // Check if we have a TikTok access token
      let accessToken = tiktokAccessToken || sessionStorage.getItem('tiktok_access_token');
      
      if (!accessToken) {
        toast.error('Please connect your TikTok account first');
        return;
      }
      
      // Log token info for debugging (don't log the full token for security)
      console.log('Using TikTok access token (first 10 chars):', accessToken.substring(0, 10));
      console.log('Token length:', accessToken.length);
      
      // Generate a signed URL for the video that TikTok can access
      toast.info('Generating signed URL for video...');
      const videoSignedUrl = await generateVideoSignedUrl(application.video_url, 7200); // 2 hour expiry
      
      if (!videoSignedUrl) {
        toast.error('Failed to generate video access URL');
        return;
      }
      
      // Log the video URL for debugging
      console.log('Posting video with signed URL:', videoSignedUrl);
      
      // Test if the URL is accessible
      toast.info('Testing video URL accessibility...');
      try {
        const urlTestResponse = await fetch(videoSignedUrl, { method: 'HEAD' });
        console.log('Video URL test response status:', urlTestResponse.status);
        if (!urlTestResponse.ok) {
          toast.error(`Video URL not accessible: ${urlTestResponse.status} - ${urlTestResponse.statusText}`);
          return;
        }
      } catch (urlError) {
        console.error('Error testing video URL:', urlError);
        toast.error('Error testing video URL accessibility');
        return;
      }
      
      // Create caption with idea title, description and hashtags
      const caption = `${application.idea_title}

${application.idea_description}

#DreamLauncherMovement #Innovation #Pakistan #Entrepreneurship #Startup`;
      
      // Post video to TikTok
      toast.info('Posting video to TikTok...');
      const publishId = await postVideoToTikTok(
        videoSignedUrl,
        application.idea_title,
        caption,
        accessToken
      );
      
      if (publishId) {
        toast.success(`Successfully initiated upload of "${application.idea_title}" to TikTok! The user will be notified in their TikTok inbox to complete the post.`);
      } else {
        toast.error('Failed to post video to TikTok');
      }
    } catch (error: any) {
      console.error('Error posting to TikTok:', error);
      
      // Provide more detailed error information
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        toast.error('Network error: Unable to connect to TikTok API. This may be due to CORS restrictions, network connectivity issues, or an invalid access token.');
      } else if (error.message) {
        toast.error(`Error posting to TikTok: ${error.message}`);
      } else {
        toast.error('Unknown error occurred while posting to TikTok');
      }
    }
  };

  const handlePostToInstagram = async (application: Application) => {
    try {
      toast.info(`Preparing to post "${application.idea_title}" to Instagram...`);
      
      // Check if the application has a video
      if (!application.video_url) {
        toast.error('No video found for this application');
        return;
      }
      
      // Check if we have an Instagram access token
      let accessToken = instagramAccessToken || sessionStorage.getItem('instagram_access_token');
      
      if (!accessToken) {
        toast.error('Please connect your Instagram account first');
        return;
      }
      
      // Check if we have Instagram accounts
      if (!instagramUser) {
        toast.error('No Instagram account found. Please connect your Instagram account.');
        return;
      }
      
      // Log token info for debugging (don't log the full token for security)
      console.log('Using Instagram access token (first 10 chars):', accessToken.substring(0, 10));
      console.log('Token length:', accessToken.length);
      console.log('Using Instagram account:', instagramUser);
      
      // Generate a signed URL for the video that Instagram can access
      toast.info('Generating signed URL for video...');
      const videoSignedUrl = await generateVideoSignedUrl(application.video_url, 7200); // 2 hour expiry
      
      if (!videoSignedUrl) {
        toast.error('Failed to generate video access URL');
        return;
      }
      
      // Log the video URL for debugging
      console.log('Posting video with signed URL:', videoSignedUrl);
      
      // Test if the URL is accessible
      toast.info('Testing video URL accessibility...');
      try {
        const urlTestResponse = await fetch(videoSignedUrl, { method: 'HEAD' });
        console.log('Video URL test response status:', urlTestResponse.status);
        if (!urlTestResponse.ok) {
          toast.error(`Video URL not accessible: ${urlTestResponse.status} - ${urlTestResponse.statusText}`);
          return;
        }
      } catch (urlError) {
        console.error('Error testing video URL:', urlError);
        toast.error('Error testing video URL accessibility');
        return;
      }
      
      // Create caption with idea title, description and hashtags
      const caption = `${application.idea_title}

${application.idea_description}

#DreamLauncherMovement #Innovation #Pakistan #Entrepreneurship #Startup`;
      
      // Post video to Instagram
      toast.info('Posting video to Instagram...');
      const mediaId = await postVideoToInstagram(
        videoSignedUrl,
        caption,
        instagramUser.id,
        accessToken
      );
      
      if (mediaId) {
        toast.success(`Successfully posted "${application.idea_title}" to Instagram!`);
      } else {
        toast.error('Failed to post video to Instagram');
      }
    } catch (error: any) {
      console.error('Error posting to Instagram:', error);
      
      // Provide more detailed error information
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        toast.error('Network error: Unable to connect to Instagram API. This may be due to CORS restrictions, network connectivity issues, or an invalid access token.');
      } else if (error.message) {
        toast.error(`Error posting to Instagram: ${error.message}`);
      } else {
        toast.error('Unknown error occurred while posting to Instagram');
      }
    }
  };

  // New function to handle downloading video with watermark
  const handleDownloadWithWatermark = async (application: Application) => {
    try {
      toast.info(`Preparing to download "${application.idea_title}" with watermark...`);
      
      // Check if the application has a video
      if (!application.video_url) {
        toast.error('No video found for this application');
        return;
      }
      
      console.log('Application video URL:', application.video_url);
      
      // Generate a signed URL for the original video
      const signedUrl = await generateVideoSignedUrl(application.video_url, 3600); // 1 hour expiry
      
      if (!signedUrl) {
        toast.error('Failed to generate download link for video');
        return;
      }
      
      const videoFileName = application.video_url.split('/').pop() || 'video.mp4';
      const fileNameWithoutExt = videoFileName.split('.')[0];
      // Use .webm extension for watermarked videos since they're re-encoded in WebM format
      const watermarkedFileName = `${fileNameWithoutExt}_watermarked.webm`;
      
      // Attempt client-side watermarking
      toast.info('Adding watermark to video (this may take a moment)...');
      
      try {
        const watermarkedBlob = await addWatermarkToVideoClientSide(signedUrl);
        
        // Create a temporary link to trigger download
        const link = document.createElement('a');
        link.href = URL.createObjectURL(watermarkedBlob);
        link.download = watermarkedFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the object URL
        URL.revokeObjectURL(link.href);
        
        toast.success(`Successfully downloaded "${application.idea_title}" with watermark!`);
      } catch (processingError: any) {
        console.warn('Client-side watermarking failed:', processingError);
        
        // Fallback: open the video in a new tab so user can download manually
        toast.error(`Watermarking failed: ${processingError.message}. Opening video in new tab.`);
        window.open(signedUrl, '_blank');
      }
    } catch (error: any) {
      console.error('Error downloading video with watermark:', error);
      toast.error(`Error: ${error.message || 'Failed to download video with watermark'}`);
    }
  };

  // Function to add watermark to video client-side
  const addWatermarkToVideoClientSide = async (videoUrl: string): Promise<Blob> => {
    return new Promise(async (resolve, reject) => {
      try {
        // Create video element (muted to prevent audio playback during processing)
        const video = document.createElement('video');
        video.src = videoUrl;
        video.playsInline = true;
        video.crossOrigin = 'anonymous';
        video.muted = true; // Mute to prevent audio during processing (stream still captures audio)
        
        // Create canvas for frame processing
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        // Load watermark image
        const watermark = new Image();
        watermark.crossOrigin = 'Anonymous';
        watermark.src = '/logo.png';
        
        let watermarkLoaded = false;
        
        watermark.onload = () => {
          watermarkLoaded = true;
          startProcessingIfReady();
        };
        
        const startProcessingIfReady = async () => {
          // Only start processing when both video metadata and watermark are loaded
          if (video.readyState >= 2 && watermarkLoaded) {
            try {
              // Set canvas dimensions to match video
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              
              // Get the original video's frame rate (default to 30 if not available)
              const fps = 30;
              
              // Create canvas stream for video
              const canvasStream = canvas.captureStream(fps);
              
              // Create a new MediaStream that will include both video and audio
              const combinedStream = new MediaStream();
              
              // Add video track from canvas
              const videoTrack = canvasStream.getVideoTracks()[0];
              if (videoTrack) {
                combinedStream.addTrack(videoTrack);
              }
              
              // Extract and add audio track from original video
              // We need to create a temporary video element to get the audio track
              const audioVideo = document.createElement('video');
              audioVideo.src = videoUrl;
              audioVideo.crossOrigin = 'anonymous';
              audioVideo.muted = true; // Mute to prevent double audio during processing (stream still captures audio)
              
              await new Promise((resolveAudio) => {
                audioVideo.addEventListener('loadedmetadata', () => {
                  resolveAudio(true);
                }, { once: true });
              });
              
              // Capture the audio from the original video
              try {
                // @ts-ignore - captureStream is not in TypeScript definitions for all browsers
                const audioStream = audioVideo.captureStream ? audioVideo.captureStream() : audioVideo.mozCaptureStream();
                const audioTracks = audioStream.getAudioTracks();
                
                console.log(`Found ${audioTracks.length} audio track(s) in original video`);
                
                if (audioTracks.length > 0) {
                  const audioTrack = audioTracks[0];
                  combinedStream.addTrack(audioTrack);
                  console.log('Audio track added to watermarked video:', {
                    id: audioTrack.id,
                    kind: audioTrack.kind,
                    label: audioTrack.label,
                    enabled: audioTrack.enabled,
                    muted: audioTrack.muted,
                    readyState: audioTrack.readyState
                  });
                } else {
                  console.warn('No audio track found in original video - watermarked video will have no sound');
                  toast.warning('Original video has no audio track');
                }
              } catch (audioError) {
                console.error('Could not extract audio track:', audioError);
                toast.warning('Could not extract audio - watermarked video may have no sound');
              }
              
              // Create MediaRecorder with the combined stream (video + audio)
              const chunks: Blob[] = [];
              
              // Try to use the same codec as the original video
              let mimeType = 'video/webm;codecs=h264';
              if (!MediaRecorder.isTypeSupported(mimeType)) {
                mimeType = 'video/webm;codecs=vp8,opus';
              }
              if (!MediaRecorder.isTypeSupported(mimeType)) {
                mimeType = 'video/webm';
              }
              
              const mediaRecorder = new MediaRecorder(combinedStream, {
                mimeType: mimeType,
                videoBitsPerSecond: 5000000 // 5 Mbps for good quality
              });
              
              console.log(`Recording with MIME type: ${mimeType}`);
              console.log('MediaRecorder stream tracks:', {
                video: combinedStream.getVideoTracks().length,
                audio: combinedStream.getAudioTracks().length,
                total: combinedStream.getTracks().length
              });
              
              // Handle recorded data
              mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                  chunks.push(e.data);
                }
              };
              
              // Handle recording stop
              mediaRecorder.onstop = () => {
                const watermarkedBlob = new Blob(chunks, { type: mimeType });
                resolve(watermarkedBlob);
              };
              
              // Handle recording error
              mediaRecorder.onerror = (e) => {
                console.error('MediaRecorder error:', e);
                reject(new Error('Failed to record watermarked video'));
              };
              
              // Start recording
              mediaRecorder.start(100); // Collect data every 100ms
              
              // Process video frames at the correct frame rate
              const frameInterval = 1000 / fps;
              let frameCount = 0;
              
              const processFrame = () => {
                if (video.paused || video.ended) {
                  mediaRecorder.stop();
                  audioVideo.pause();
                  return;
                }
                
                // Draw video frame to canvas
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                
                // Add watermark overlay
                const watermarkWidth = canvas.width * 0.15; // 15% of video width
                const scale = watermarkWidth / watermark.width;
                const watermarkHeight = watermark.height * scale;
                
                // Position watermark in top-left corner
                ctx.globalAlpha = 0.7; // Semi-transparent
                ctx.drawImage(
                  watermark,
                  20, // x position
                  20, // y position
                  watermarkWidth,
                  watermarkHeight
                );
                ctx.globalAlpha = 1.0;
                
                frameCount++;
                
                // Continue processing at the same frame rate as the video
                setTimeout(() => requestAnimationFrame(processFrame), frameInterval);
              };
              
              // Start both videos at the same time
              video.currentTime = 0;
              audioVideo.currentTime = 0;
              
              // Start video and audio playback
              const playPromises = [
                video.play(),
                audioVideo.play()
              ];
              
              await Promise.all(playPromises);
              
              // Start processing frames
              requestAnimationFrame(processFrame);
              
              // Auto-stop after video duration or 60 seconds max
              const maxDuration = Math.min(video.duration * 1000, 60000);
              setTimeout(() => {
                if (mediaRecorder.state !== 'inactive') {
                  video.pause();
                  audioVideo.pause();
                  mediaRecorder.stop();
                }
              }, maxDuration + 1000); // Add 1 second buffer
              
            } catch (processingError) {
              console.error('Error during video processing:', processingError);
              reject(processingError);
            }
          }
        };
        
        // When video metadata is loaded
        video.addEventListener('loadedmetadata', () => {
          startProcessingIfReady();
        });
        
        // Handle video load error
        video.addEventListener('error', (e) => {
          console.error('Video loading error:', e);
          reject(new Error('Failed to load video'));
        });
        
        // Handle watermark load error
        watermark.onerror = () => {
          reject(new Error('Failed to load watermark image'));
        };
        
      } catch (error) {
        console.error('Error in watermarking setup:', error);
        reject(error);
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-300">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'under_review':
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-300">
            <Eye className="w-3 h-3 mr-1" />
            Under Review
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="outline" className="text-green-600 border-green-300">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="text-red-600 border-red-300">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      case 'unpaid':
        return (
          <Badge variant="outline" className="text-orange-600 border-orange-300">
            <Clock className="w-3 h-3 mr-1" />
            Unpaid
          </Badge>
        );
      case 'paid':
        return (
          <Badge variant="outline" className="text-purple-600 border-purple-300">
            <CheckCircle className="w-3 h-3 mr-1" />
            Paid
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const exportToCSV = () => {
    const headers = ['Full Name', 'Email', 'Age', 'Address', 'CNIC', 'Idea Title', 'Status', 'Submitted Date'];
    const csvContent = [
      headers.join(','),
      ...applications.map(app => [
        `"${app.full_name}"`,
        `"${app.email}"`,
        app.age,
        `"${app.address}"`,
        `"${app.cnic}"`,
        `"${app.idea_title}"`,
        app.status,
        new Date(app.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `applications_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Applications exported to CSV');
  };

  const validateTikTokToken = async () => {
    if (!tiktokAccessToken) {
      toast.error('No TikTok access token found');
      return false;
    }
    
    try {
      toast.info('Validating TikTok access token...');
      const userInfo = await getTikTokUserInfo(tiktokAccessToken);
      if (userInfo) {
        toast.success('TikTok access token is valid');
        return true;
      } else {
        toast.error('TikTok access token is invalid or expired');
        return false;
      }
    } catch (error) {
      console.error('Error validating TikTok token:', error);
      toast.error('Error validating TikTok access token');
      return false;
    }
  };

  const testTikTokConnectionHandler = async () => {
    if (!tiktokAccessToken) {
      toast.error('Please connect your TikTok account first');
      return;
    }
    
    // First validate the token
    const isTokenValid = await validateTikTokToken();
    if (!isTokenValid) {
      return;
    }
    
    toast.info('Testing TikTok connection...');
    
    try {
      const isValid = await testTikTokConnection(tiktokAccessToken);
      if (isValid) {
        toast.success('TikTok connection is working correctly!');
      } else {
        toast.error('TikTok connection failed. Please check your access token and network connectivity.');
      }
    } catch (error) {
      console.error('Error testing TikTok connection:', error);
      toast.error('Error testing TikTok connection');
    }
  };

  const testInstagramConnectionHandler = async () => {
    if (!instagramAccessToken) {
      toast.error('Please connect your Instagram account first');
      return;
    }
    
    toast.info('Testing Instagram connection...');
    
    try {
      const isValid = await testInstagramConnection(instagramAccessToken);
      if (isValid) {
        toast.success('Instagram connection is working correctly!');
      } else {
        toast.error('Instagram connection failed. Please check your access token and network connectivity.');
      }
    } catch (error) {
      console.error('Error testing Instagram connection:', error);
      toast.error('Error testing Instagram connection');
    }
  };

  // Login Form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-t-lg">
            <div className="mx-auto bg-white rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-gray-800" />
            </div>
            <CardTitle className="text-2xl font-bold">Admin Access</CardTitle>
            <CardDescription className="text-gray-200">
              Enter your credentials to access the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              {loginError && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">
                    {loginError}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Username
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-12"
                    required
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-yellow-500 hover:bg-yellow-600 text-gray-900"
              >
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <img 
                src="/logo.png" 
                alt="DLM Logo" 
                className="h-10 w-auto"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Manage all application submissions</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {tiktokUser ? (
                <div className="flex items-center space-x-2 bg-purple-100 px-3 py-1 rounded-full">
                  <span className="text-sm font-medium text-purple-800">
                    Connected as {tiktokUser?.user?.display_name || tiktokUser?.user?.username || 'TikTok User'}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleTikTokLogout}
                    className="text-purple-600 border-purple-300 hover:bg-purple-50"
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleTikTokLogin}
                  className="text-purple-600 border-purple-300 hover:bg-purple-50"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Connect TikTok
                </Button>
              )}
              {instagramUser ? (
                <div className="flex items-center space-x-2 bg-pink-100 px-3 py-1 rounded-full">
                  <span className="text-sm font-medium text-pink-800">
                    Connected as {instagramUser?.username || 'Instagram User'}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleInstagramLogout}
                    className="text-pink-600 border-pink-300 hover:bg-pink-50"
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleInstagramLogin}
                  className="text-pink-600 border-pink-300 hover:bg-pink-50"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Connect Instagram
                </Button>
              )}
              {tiktokAccessToken && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={testTikTokConnectionHandler}
                  className="text-blue-600 border-blue-300 hover:bg-blue-50"
                >
                  Test TikTok Connection
                </Button>
              )}
              {instagramAccessToken && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={testInstagramConnectionHandler}
                  className="text-blue-600 border-blue-300 hover:bg-blue-50"
                >
                  Test Instagram Connection
                </Button>
              )}
              <Button variant="outline" onClick={exportToCSV} size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" onClick={handleLogout} size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {applications.filter(app => app.status === 'pending').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-green-600">
                    {applications.filter(app => app.status === 'approved').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">
                    {applications.filter(app => app.status === 'rejected').length}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Applications Table */}
        <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>All Applications</span>
                  </CardTitle>
                  <CardDescription>
                    Review and manage all submitted applications
                  </CardDescription>
                </div>
                <Button onClick={fetchApplications} disabled={loading} size="sm">
                  {loading ? 'Loading...' : 'Refresh'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading applications...</p>
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No applications found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">Name</TableHead>
                        <TableHead className="whitespace-nowrap">Email</TableHead>
                        <TableHead className="whitespace-nowrap">Age</TableHead>
                        <TableHead className="whitespace-nowrap">CNIC</TableHead>
                        <TableHead className="whitespace-nowrap">Idea Title</TableHead>
                        <TableHead className="whitespace-nowrap">Status</TableHead>
                        <TableHead className="whitespace-nowrap">Video</TableHead>
                        <TableHead className="whitespace-nowrap">Screenshot</TableHead>
                        <TableHead className="whitespace-nowrap">Submitted</TableHead>
                        <TableHead className="whitespace-nowrap">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {applications.map((app) => (
                        <TableRow key={app.id}>
                          <TableCell className="font-medium whitespace-nowrap">{app.full_name}</TableCell>
                          <TableCell className="whitespace-nowrap">{app.email}</TableCell>
                          <TableCell className="whitespace-nowrap">{app.age}</TableCell>
                          <TableCell className="font-mono text-sm whitespace-nowrap">{app.cnic}</TableCell>
                          <TableCell className="min-w-[250px]">
                            <div className="" title={app.idea_title}>
                              {app.idea_title}
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">{getStatusBadge(app.status)}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            {app.video_url ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewVideo(app.video_url!)}
                              >
                                <PlayCircle className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            ) : (
                              <span className="text-gray-400 text-sm">No video</span>
                            )}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {app.payment_screenshot_url ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => viewPaymentScreenshot(app.payment_screenshot_url!)}
                              >
                                <ImageIcon className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            ) : (
                              <span className="text-gray-400 text-sm">No screenshot</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600 whitespace-nowrap">
                            {new Date(app.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="flex flex-wrap gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  console.log('Approve button clicked for app:', app.id);
                                  updateApplicationStatus(app.id, 'approved');
                                }}
                                disabled={app.status === 'approved'}
                                className="text-green-600 hover:text-green-700"
                              >
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  console.log('Reject button clicked for app:', app.id);
                                  updateApplicationStatus(app.id, 'rejected');
                                }}
                                disabled={app.status === 'rejected'}
                                className="text-red-600 hover:text-red-700"
                              >
                                Reject
                              </Button>
                              {app.status === 'unpaid' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    console.log('Mark as Paid button clicked for app:', app.id);
                                    updateApplicationStatus(app.id, 'paid');
                                  }}
                                  className="text-purple-600 hover:text-purple-700"
                                >
                                  Mark as Paid
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePostToTikTok(app)}
                                className="text-purple-600 hover:text-purple-700"
                                disabled={!tiktokAccessToken}
                              >
                                Post to TikTok
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePostToInstagram(app)}
                                className="text-pink-600 hover:text-pink-700"
                                disabled={!instagramAccessToken}
                              >
                                Post to Instagram
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadWithWatermark(app)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Download Copy of Video
                              </Button>

                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;