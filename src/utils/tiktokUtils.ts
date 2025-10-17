// TikTok API utilities for the Dream Launcher Movement application

const TIKTOK_CLIENT_KEY = 'sbawv0p2p9jol7vjtp';
const TIKTOK_CLIENT_SECRET = 'DRQn7VPdFhf8nF28s6SBQV3fi9ltGIDr';
const TIKTOK_API_BASE_URL = 'https://open.tiktokapis.com/v2';
const REDIRECT_URI = 'https://www.dlmpakistan.com/admin';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const TIKTOK_PROXY_URL = `${SUPABASE_URL}/functions/v1/tiktok-proxy`;

console.log('=== TikTok Utilities Loaded ===');
console.log('TikTok Proxy URL:', TIKTOK_PROXY_URL);
console.log('Supabase URL:', SUPABASE_URL);
console.log('Has Anon Key:', !!SUPABASE_ANON_KEY);
console.log('==============================');

/**
 * Makes a request to the TikTok API, first trying the proxy, then falling back to direct requests
 * @param endpoint TikTok API endpoint (e.g., '/oauth/token/')
 * @param options Request options
 * @returns Response from TikTok API
 */
const tiktokApiRequest = async (endpoint: string, options: RequestInit) => {
  try {
    // Try to use the proxy first (to avoid CORS issues)
    if (typeof window !== 'undefined') {
      console.log(`=== Making TikTok API Request ===`);
      console.log(`Endpoint: ${endpoint}`);
      console.log('Proxy URL:', TIKTOK_PROXY_URL);
      console.log('Request options:', options);
      
      try {
        const proxyRequestBody = {
          method: options.method || 'GET',
          endpoint: endpoint,
          headers: options.headers,
          body: options.body
        };
        
        console.log('Proxy request body:', JSON.stringify(proxyRequestBody, null, 2));
        
        const proxyResponse = await fetch(TIKTOK_PROXY_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'apikey': SUPABASE_ANON_KEY
          },
          body: JSON.stringify(proxyRequestBody)
        });
        
        console.log('Proxy response status:', proxyResponse.status);
        console.log('Proxy response headers:', [...proxyResponse.headers.entries()]);
        
        if (!proxyResponse.ok) {
          const errorText = await proxyResponse.text();
          console.error('Proxy request failed:', errorText);
          throw new Error(`Proxy request failed: ${proxyResponse.status} - ${proxyResponse.statusText}`);
        }
        
        const proxyData = await proxyResponse.json();
        console.log('Proxy response data:', proxyData);
        console.log('=== Proxy Request Successful ===');
        return proxyData;
      } catch (proxyError) {
        console.warn('Proxy request failed, falling back to direct request:', proxyError);
        console.warn('Error details:', {
          name: proxyError.name,
          message: proxyError.message,
          stack: proxyError.stack
        });
        // Fall through to direct request
      }
    }
    
    // If proxy fails or we're not in a browser, make direct requests
    console.log(`Making direct request to TikTok API: ${TIKTOK_API_BASE_URL}${endpoint}`);
    const response = await fetch(`${TIKTOK_API_BASE_URL}${endpoint}`, options);
    return await response.json();
  } catch (error) {
    console.error('Error making TikTok API request:', error);
    throw error;
  }
};

/**
 * Generates the TikTok OAuth URL for user authorization
 * @returns OAuth URL for TikTok login
 */
export const generateTikTokOAuthUrl = (): string => {
  const scopes = ['video.upload', 'user.info.basic'];
  const state = Math.random().toString(36).substring(2, 15);
  
  // Store state in sessionStorage for validation later
  sessionStorage.setItem('tiktok_oauth_state', state);
  
  const params = new URLSearchParams({
    client_key: TIKTOK_CLIENT_KEY,
    redirect_uri: REDIRECT_URI,
    scope: scopes.join(','),
    response_type: 'code',
    state: state
  });
  
  return `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;
};

/**
 * Exchanges the authorization code for an access token
 * @param code Authorization code received from TikTok OAuth
 * @returns Access token and related information
 */
export const exchangeCodeForAccessToken = async (code: string): Promise<any> => {
  try {
    console.log('Exchanging code for access token...');
    
    const response = await tiktokApiRequest('/oauth/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'no-cache'
      },
      body: new URLSearchParams({
        client_key: TIKTOK_CLIENT_KEY,
        client_secret: TIKTOK_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI
      }).toString()
    });

    console.log('Token exchange successful:', response);
    return response;
  } catch (error) {
    console.error('Error exchanging TikTok authorization code:', error);
    throw error;
  }
};

/**
 * Refreshes the TikTok access token using the refresh token
 * @param refreshToken Refresh token obtained during OAuth
 * @returns New access token and related information
 */
export const refreshTikTokAccessToken = async (refreshToken?: string): Promise<any> => {
  try {
    // If we have a refresh token, use it. Otherwise, use client credentials flow.
    if (refreshToken) {
      console.log('Refreshing access token with refresh token...');
      
      const response = await tiktokApiRequest('/oauth/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cache-Control': 'no-cache'
        },
        body: new URLSearchParams({
          client_key: TIKTOK_CLIENT_KEY,
          client_secret: TIKTOK_CLIENT_SECRET,
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        }).toString()
      });

      console.log('Token refresh successful:', response);
      return response;
    } else {
      // Fallback to client credentials flow
      console.log('Using client credentials flow...');
      
      const response = await tiktokApiRequest('/oauth/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cache-Control': 'no-cache'
        },
        body: new URLSearchParams({
          client_key: TIKTOK_CLIENT_KEY,
          client_secret: TIKTOK_CLIENT_SECRET,
          grant_type: 'client_credentials'
        }).toString()
      });

      console.log('Client credentials successful:', response);
      return response;
    }
  } catch (error) {
    console.error('Error refreshing TikTok access token:', error);
    return null;
  }
};

/**
 * Posts a video to TikTok
 * @param videoUrl URL of the video to post
 * @param title Title of the video
 * @param description Description/caption for the video
 * @param accessToken TikTok API access token
 * @returns Publish ID or null if failed
 */
export const postVideoToTikTok = async (
  videoUrl: string,
  title: string,
  description: string,
  accessToken: string
): Promise<string | null> => {
  try {
    console.log('Posting video to TikTok with URL:', videoUrl);
    
    // Initialize the video upload to TikTok
    const response = await tiktokApiRequest('/post/publish/inbox/video/init/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8'
      },
      body: JSON.stringify({
        source_info: {
          source: 'PULL_FROM_URL',
          video_url: videoUrl
        },
        post_info: {
          title: title,
          description: description,
          privacy_level: 'PUBLIC_TO_EVERYONE',
          disable_comment: false,
          disable_duet: false,
          disable_stitch: false,
          video_cover_timestamp_ms: 0
        }
      })
    });
    
    console.log('TikTok init successful:', response);
    return response.data?.publish_id || null;
  } catch (error: any) {
    console.error('Error posting to TikTok:', error);
    
    // Provide more detailed error information
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Network error: Unable to connect to TikTok API. This may be due to CORS restrictions or network connectivity issues.');
    } else if (error.message) {
      throw new Error(`TikTok API error: ${error.message}`);
    } else {
      throw new Error('Unknown error occurred while posting to TikTok');
    }
  }
};

/**
 * Gets TikTok user info
 * @param accessToken TikTok API access token
 * @returns User info or null if failed
 */
export const getTikTokUserInfo = async (accessToken: string): Promise<any | null> => {
  try {
    console.log('Getting TikTok user info...');
    
    const response = await tiktokApiRequest('/user/info/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('TikTok user info successful:', response);
    return response.data || null;
  } catch (error: any) {
    console.error('Error getting TikTok user info:', error);
    
    // Provide more detailed error information
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Network error: Unable to connect to TikTok API. This may be due to CORS restrictions or network connectivity issues.');
    } else if (error.message) {
      throw new Error(`TikTok API error: ${error.message}`);
    } else {
      throw new Error('Unknown error occurred while getting TikTok user info');
    }
  }
};

/**
 * Tests the TikTok API connectivity and validates the access token
 * @param accessToken TikTok API access token
 * @returns True if the token is valid, false otherwise
 */
export const testTikTokConnection = async (accessToken: string): Promise<boolean> => {
  try {
    console.log('Testing TikTok connection...');
    
    const response = await tiktokApiRequest('/user/info/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('TikTok connection test successful:', response);
    return true;
  } catch (error: any) {
    console.error('Error testing TikTok connection:', error);
    
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.error('Network error: Unable to connect to TikTok API. This may be due to CORS restrictions or network connectivity issues.');
    }
    
    return false;
  }
};