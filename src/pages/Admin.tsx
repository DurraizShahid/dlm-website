import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
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
import { addWatermarkToVideo, verifyWatermark, validateVideoForWatermarking, type WatermarkOptions, type WatermarkProgress } from '@/utils/videoWatermark';
import { Guidebook } from '@/integrations/supabase/types';
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
  LogIn,
  BookOpen,
  Plus,
  Pencil,
  Trash2
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
  
  // Guidebook management state
  const [guidebooks, setGuidebooks] = useState<Guidebook[]>([]);
  const [loadingGuidebooks, setLoadingGuidebooks] = useState(false);
  const [editingGuidebook, setEditingGuidebook] = useState<Guidebook | null>(null);
  const [showGuidebookForm, setShowGuidebookForm] = useState(false);
  const [guidebookForm, setGuidebookForm] = useState({
    title: '',
    description: '',
    category: '',
    file_path: '',
    is_free: false,
    order_index: 0
  });
  const [selectedGuidebookFile, setSelectedGuidebookFile] = useState<File | null>(null);
  const [uploadingGuidebook, setUploadingGuidebook] = useState(false);

  // Check if already authenticated (from session storage)
  useEffect(() => {
    const adminAuth = sessionStorage.getItem('admin_authenticated');
    if (adminAuth === 'true') {
      setIsAuthenticated(true);
      fetchApplications();
      fetchGuidebooks();
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
      fetchGuidebooks();
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

  // Fetch all guidebooks
  const fetchGuidebooks = async () => {
    try {
      setLoadingGuidebooks(true);
      const { data, error } = await (supabase as any)
        .from('guidebooks')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Error fetching guidebooks:', error);
        toast.error('Error loading guidebooks');
        return;
      }

      setGuidebooks(data || []);
    } catch (error) {
      console.error('Error fetching guidebooks:', error);
      toast.error('Error loading guidebooks');
    } finally {
      setLoadingGuidebooks(false);
    }
  };

  // Create new guidebook
  const createGuidebook = async () => {
    try {
      // If a file is selected, upload it first
      let filePath = guidebookForm.file_path;
      if (selectedGuidebookFile) {
        const uploadedPath = await uploadGuidebookFile(selectedGuidebookFile);
        if (!uploadedPath) {
          toast.error('Failed to upload guidebook file');
          return;
        }
        filePath = uploadedPath;
      }

      if (!filePath) {
        toast.error('Please upload a guidebook file');
        return;
      }

      const { data, error } = await (supabase as any)
        .from('guidebooks')
        .insert([{ ...guidebookForm, file_path: filePath }])
        .select();

      if (error) {
        console.error('Error creating guidebook:', error);
        toast.error('Error creating guidebook');
        return;
      }

      toast.success('Guidebook created successfully');
      setShowGuidebookForm(false);
      resetGuidebookForm();
      fetchGuidebooks();
    } catch (error) {
      console.error('Error creating guidebook:', error);
      toast.error('Error creating guidebook');
    }
  };

  // Update existing guidebook
  const updateGuidebook = async () => {
    if (!editingGuidebook) return;

    try {
      // If a new file is selected, upload it first
      let filePath = guidebookForm.file_path;
      if (selectedGuidebookFile) {
        const uploadedPath = await uploadGuidebookFile(selectedGuidebookFile);
        if (!uploadedPath) {
          toast.error('Failed to upload guidebook file');
          return;
        }
        filePath = uploadedPath;
      }

      const { data, error } = await (supabase as any)
        .from('guidebooks')
        .update({
          ...guidebookForm,
          file_path: filePath,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingGuidebook.id)
        .select();

      if (error) {
        console.error('Error updating guidebook:', error);
        toast.error('Error updating guidebook');
        return;
      }

      toast.success('Guidebook updated successfully');
      setShowGuidebookForm(false);
      setEditingGuidebook(null);
      resetGuidebookForm();
      fetchGuidebooks();
    } catch (error) {
      console.error('Error updating guidebook:', error);
      toast.error('Error updating guidebook');
    }
  };

  // Delete guidebook
  const deleteGuidebook = async (id: string) => {
    if (!confirm('Are you sure you want to delete this guidebook?')) return;

    try {
      const { error } = await (supabase as any)
        .from('guidebooks')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting guidebook:', error);
        toast.error('Error deleting guidebook');
        return;
      }

      toast.success('Guidebook deleted successfully');
      fetchGuidebooks();
    } catch (error) {
      console.error('Error deleting guidebook:', error);
      toast.error('Error deleting guidebook');
    }
  };

  // Reset guidebook form
  const resetGuidebookForm = () => {
    setGuidebookForm({
      title: '',
      description: '',
      category: '',
      file_path: '',
      is_free: false,
      order_index: 0
    });
    setSelectedGuidebookFile(null);
  };

  // Upload guidebook file to Supabase Storage
  const uploadGuidebookFile = async (file: File): Promise<string | null> => {
    try {
      setUploadingGuidebook(true);
      toast.info('Uploading guidebook file...');

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `guidebooks/${fileName}`;

      // Upload the file to Supabase Storage
      const { error: uploadError } = await (supabase as any).storage
        .from('application-videos')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error('Error uploading guidebook file');
        return null;
      }

      toast.success('Guidebook file uploaded successfully!');
      console.log('Guidebook uploaded successfully:', filePath);
      
      // Return just the file path (not the full URL) - signed URLs will be generated on-demand
      return filePath;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Error uploading guidebook file');
      return null;
    } finally {
      setUploadingGuidebook(false);
    }
  };

  // Open form for editing
  const openEditForm = (guidebook: Guidebook) => {
    setEditingGuidebook(guidebook);
    setGuidebookForm({
      title: guidebook.title,
      description: guidebook.description,
      category: guidebook.category,
      file_path: guidebook.file_path,
      is_free: guidebook.is_free,
      order_index: guidebook.order_index
    });
    setSelectedGuidebookFile(null);
    setShowGuidebookForm(true);
  };

  // Open form for creating new guidebook
  const openCreateForm = () => {
    setEditingGuidebook(null);
    resetGuidebookForm();
    setShowGuidebookForm(true);
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

  // Enhanced function to handle downloading video with watermark (with retry logic)
  const handleDownloadWithWatermark = async (application: Application, retryCount = 0) => {
    const maxRetries = 2;
    let progressToastId: string | number | undefined;
    
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
      const watermarkedFileName = `${fileNameWithoutExt}_watermarked.webm`; // Using WebM for reliability
      
      // Progress callback for real-time updates
      const onProgress = (progress: WatermarkProgress) => {
        const percent = Math.round(progress.percent);
        let message = '';
        
        if (progress.phase === 'loading') {
          message = `Loading video... ${percent}%`;
        } else if (progress.phase === 'processing') {
          if (progress.currentFrame && progress.totalFrames) {
            message = `Processing frame ${progress.currentFrame}/${progress.totalFrames} (${percent}%)`;
          } else {
            message = `Adding watermark... ${percent}%`;
          }
        } else if (progress.phase === 'finalizing') {
          message = `Finalizing video... ${percent}%`;
        }
        
        // Update the same toast with progress
        if (!progressToastId) {
          progressToastId = toast.loading(message);
        } else {
          toast.loading(message, { id: progressToastId });
        }
      };
      
      // Watermarking options with red border
      const watermarkOptions: WatermarkOptions = {
        position: 'top-left',
        opacity: 0.7,
        scale: 0.15,
        margin: 20,
        outputFormat: 'webm', // Using WebM for speed and reliability (change to 'mp4' if needed)
        addBorder: true, // Add red border around video
        borderColor: 'red', // Red border color
        borderWidth: 10 // 10 pixels wide border
      };
      
      try {
        // Add watermark with progress tracking
        const watermarkedBlob = await addWatermarkToVideo(signedUrl, watermarkOptions, onProgress);
        
        // Dismiss progress toast
        if (progressToastId) {
          toast.dismiss(progressToastId);
        }
        
        // Verify watermark was applied
        toast.info('Verifying watermark...');
        const blobUrl = URL.createObjectURL(watermarkedBlob);
        const hasWatermark = await verifyWatermark(blobUrl);
        
        if (!hasWatermark) {
          console.warn('Watermark verification failed - continuing anyway');
        }
        
        // Create a temporary link to trigger download
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = watermarkedFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the object URL after a short delay
        setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
        
        toast.success(`Successfully downloaded "${application.idea_title}" with watermark!`);
        
      } catch (processingError: any) {
        // Dismiss progress toast
        if (progressToastId) {
          toast.dismiss(progressToastId);
        }
        
        console.error('Client-side watermarking failed:', processingError);
        
        // Retry logic
        if (retryCount < maxRetries) {
          toast.info(`Retrying watermarking (attempt ${retryCount + 2}/${maxRetries + 1})...`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
          return handleDownloadWithWatermark(application, retryCount + 1);
        }
        
        // After all retries failed, offer fallback
        toast.error(`Watermarking failed after ${maxRetries + 1} attempts: ${processingError.message}. Opening video in new tab.`);
        window.open(signedUrl, '_blank');
      }
    } catch (error: any) {
      // Dismiss progress toast
      if (progressToastId) {
        toast.dismiss(progressToastId);
      }
      
      console.error('Error downloading video with watermark:', error);
      toast.error(`Error: ${error.message || 'Failed to download video with watermark'}`);
    }
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

        {/* Main Content with Tabs */}
        <Tabs defaultValue="applications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="applications" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Applications</span>
            </TabsTrigger>
            <TabsTrigger value="guidebooks" className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span>Guidebooks</span>
            </TabsTrigger>
          </TabsList>

          {/* Applications Tab */}
          <TabsContent value="applications">
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
                                Download Watermarked Video
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
          </TabsContent>

          {/* Guidebooks Tab */}
          <TabsContent value="guidebooks">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <BookOpen className="h-5 w-5" />
                      <span>Manage Guidebooks</span>
                    </CardTitle>
                    <CardDescription>
                      Configure which guidebooks are free and which require payment
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={fetchGuidebooks} disabled={loadingGuidebooks} size="sm" variant="outline">
                      {loadingGuidebooks ? 'Loading...' : 'Refresh'}
                    </Button>
                    <Button onClick={openCreateForm} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Guidebook
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Guidebook Form */}
                {showGuidebookForm && (
                  <Card className="mb-6 border-2 border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {editingGuidebook ? 'Edit Guidebook' : 'Create New Guidebook'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                              id="title"
                              placeholder="Guidebook #1"
                              value={guidebookForm.title}
                              onChange={(e) => setGuidebookForm({ ...guidebookForm, title: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Input
                              id="category"
                              placeholder="Getting Started"
                              value={guidebookForm.category}
                              onChange={(e) => setGuidebookForm({ ...guidebookForm, category: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            placeholder="Brief description of the guidebook content"
                            value={guidebookForm.description}
                            onChange={(e) => setGuidebookForm({ ...guidebookForm, description: e.target.value })}
                            rows={3}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="guidebook_file">Upload Guidebook File</Label>
                            <Input
                              id="guidebook_file"
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setSelectedGuidebookFile(file);
                                  // Clear the file_path when a new file is selected
                                  setGuidebookForm({ ...guidebookForm, file_path: '' });
                                }
                              }}
                              disabled={uploadingGuidebook}
                            />
                            {selectedGuidebookFile && (
                              <p className="text-sm text-gray-600">
                                Selected: {selectedGuidebookFile.name}
                              </p>
                            )}
                            {!selectedGuidebookFile && editingGuidebook && guidebookForm.file_path && (
                              <p className="text-sm text-gray-500">
                                Current file: {guidebookForm.file_path.split('/').pop()}
                              </p>
                            )}
                            {uploadingGuidebook && (
                              <p className="text-sm text-blue-600">Uploading...</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="order_index">Order</Label>
                            <Input
                              id="order_index"
                              type="number"
                              placeholder="1"
                              value={guidebookForm.order_index}
                              onChange={(e) => setGuidebookForm({ ...guidebookForm, order_index: parseInt(e.target.value) || 0 })}
                            />
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="is_free"
                            checked={guidebookForm.is_free}
                            onCheckedChange={(checked) => setGuidebookForm({ ...guidebookForm, is_free: checked })}
                          />
                          <Label htmlFor="is_free" className="cursor-pointer">
                            Free Access (No payment required)
                          </Label>
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowGuidebookForm(false);
                              setEditingGuidebook(null);
                              resetGuidebookForm();
                            }}
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={editingGuidebook ? updateGuidebook : createGuidebook}
                            disabled={uploadingGuidebook}
                          >
                            {uploadingGuidebook ? 'Uploading...' : editingGuidebook ? 'Update Guidebook' : 'Create Guidebook'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Guidebooks Table */}
                {loadingGuidebooks ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading guidebooks...</p>
                  </div>
                ) : guidebooks.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No guidebooks found</p>
                    <Button onClick={openCreateForm} className="mt-4" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Guidebook
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>File Path</TableHead>
                          <TableHead>Access Type</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {guidebooks.map((guidebook) => (
                          <TableRow key={guidebook.id}>
                            <TableCell className="font-medium">{guidebook.order_index}</TableCell>
                            <TableCell className="font-medium">{guidebook.title}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{guidebook.category}</Badge>
                            </TableCell>
                            <TableCell className="max-w-md">
                              <div className="truncate" title={guidebook.description}>
                                {guidebook.description}
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-sm">{guidebook.file_path}</TableCell>
                            <TableCell>
                              {guidebook.is_free ? (
                                <Badge className="bg-green-100 text-green-800 border-green-300">
                                  Free
                                </Badge>
                              ) : (
                                <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                                  Paid
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEditForm(guidebook)}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <Pencil className="h-3 w-3 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteGuidebook(guidebook.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Delete
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;