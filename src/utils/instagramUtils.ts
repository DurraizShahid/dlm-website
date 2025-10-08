// Instagram API utilities for the Dream Launcher Movement application

// Note: Instagram Graph API requires a Facebook App and Instagram Business/Creator account
// This implementation assumes you have:
// 1. A Facebook App ID and Secret
// 2. An Instagram Business or Creator account
// 3. Proper permissions (instagram_basic, instagram_content_publish, pages_show_list, pages_manage_engagement)

const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID || '';
const FACEBOOK_APP_SECRET = import.meta.env.VITE_FACEBOOK_APP_SECRET || '';
const REDIRECT_URI = 'https://www.dlmpakistan.com/admin';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const INSTAGRAM_PROXY_URL = `${SUPABASE_URL}/functions/v1/instagram-proxy`;

console.log('=== Instagram Utilities Loaded ===');
console.log('Instagram Proxy URL:', INSTAGRAM_PROXY_URL);
console.log('==============================');

/**
 * Makes a request to the Instagram Graph API, first trying the proxy, then falling back to direct requests
 * @param endpoint Instagram Graph API endpoint (e.g., '/me/accounts')
 * @param options Request options
 * @returns Response from Instagram Graph API
 */
const instagramApiRequest = async (endpoint: string, options: RequestInit) => {
  try {
    // Try to use the proxy first (to avoid CORS issues)
    if (typeof window !== 'undefined') {
      console.log(`=== Making Instagram API Request ===`);
      console.log(`Endpoint: ${endpoint}`);
      console.log('Proxy URL:', INSTAGRAM_PROXY_URL);
      console.log('Request options:', options);
      
      try {
        const proxyRequestBody = {
          method: options.method || 'GET',
          endpoint: endpoint,
          headers: options.headers,
          body: options.body
        };
        
        console.log('Proxy request body:', JSON.stringify(proxyRequestBody, null, 2));
        
        const proxyResponse = await fetch(INSTAGRAM_PROXY_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
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
    console.log(`Making direct request to Instagram Graph API: https://graph.instagram.com${endpoint}`);
    const response = await fetch(`https://graph.instagram.com${endpoint}`, options);
    return await response.json();
  } catch (error) {
    console.error('Error making Instagram API request:', error);
    throw error;
  }
};

/**
 * Generates the Instagram/Facebook OAuth URL for user authorization
 * @returns OAuth URL for Instagram login
 */
export const generateInstagramOAuthUrl = (): string => {
  const scopes = ['instagram_basic', 'instagram_content_publish', 'pages_show_list', 'pages_manage_engagement'];
  const state = Math.random().toString(36).substring(2, 15);
  
  // Store state in sessionStorage for validation later
  sessionStorage.setItem('instagram_oauth_state', state);
  
  const params = new URLSearchParams({
    client_id: FACEBOOK_APP_ID,
    redirect_uri: REDIRECT_URI,
    scope: scopes.join(','),
    response_type: 'code',
    state: state
  });
  
  return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
};

/**
 * Exchanges the authorization code for an access token
 * @param code Authorization code received from Instagram OAuth
 * @returns Access token and related information
 */
export const exchangeCodeForAccessToken = async (code: string): Promise<any> => {
  try {
    console.log('Exchanging code for Instagram access token...');
    
    // First exchange code for short-lived token
    const tokenResponse = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: FACEBOOK_APP_ID,
        client_secret: FACEBOOK_APP_SECRET,
        redirect_uri: REDIRECT_URI,
        code: code
      }).toString()
    });
    
    const tokenData = await tokenResponse.json();
    console.log('Token exchange successful:', tokenData);
    
    // Then exchange short-lived token for long-lived token
    const longLivedResponse = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'fb_exchange_token',
        client_id: FACEBOOK_APP_ID,
        client_secret: FACEBOOK_APP_SECRET,
        fb_exchange_token: tokenData.access_token
      }).toString()
    });
    
    const longLivedData = await longLivedResponse.json();
    console.log('Long-lived token exchange successful:', longLivedData);
    
    return longLivedData;
  } catch (error) {
    console.error('Error exchanging Instagram authorization code:', error);
    throw error;
  }
};

/**
 * Gets Instagram accounts associated with the Facebook account
 * @param accessToken Facebook access token
 * @returns List of Instagram accounts
 */
export const getInstagramAccounts = async (accessToken: string): Promise<any[] | null> => {
  try {
    console.log('Getting Instagram accounts...');
    
    const response = await instagramApiRequest('/me/accounts', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Instagram accounts successful:', response);
    
    // Filter for Instagram accounts only
    const instagramAccounts = response.data?.filter((account: any) => account.instagram_business_account);
    return instagramAccounts || null;
  } catch (error: any) {
    console.error('Error getting Instagram accounts:', error);
    
    // Provide more detailed error information
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Network error: Unable to connect to Instagram API. This may be due to CORS restrictions or network connectivity issues.');
    } else if (error.message) {
      throw new Error(`Instagram API error: ${error.message}`);
    } else {
      throw new Error('Unknown error occurred while getting Instagram accounts');
    }
  }
};

/**
 * Posts a video to Instagram
 * @param videoUrl URL of the video to post
 * @param caption Caption for the video
 * @param instagramAccountId Instagram account ID
 * @param accessToken Facebook access token
 * @returns Media ID or null if failed
 */
export const postVideoToInstagram = async (
  videoUrl: string,
  caption: string,
  instagramAccountId: string,
  accessToken: string
): Promise<string | null> => {
  try {
    console.log('Posting video to Instagram with URL:', videoUrl);
    
    // Step 1: Create media object
    const createMediaResponse = await instagramApiRequest(`/${instagramAccountId}/media`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        media_type: 'REELS',
        video_url: videoUrl,
        caption: caption
      })
    });
    
    console.log('Instagram create media successful:', createMediaResponse);
    
    if (!createMediaResponse.id) {
      throw new Error('Failed to create media object');
    }
    
    const creationId = createMediaResponse.id;
    
    // Step 2: Publish the media
    const publishResponse = await instagramApiRequest(`/${instagramAccountId}/media_publish`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        creation_id: creationId
      })
    });
    
    console.log('Instagram publish media successful:', publishResponse);
    
    return publishResponse.id || null;
  } catch (error: any) {
    console.error('Error posting to Instagram:', error);
    
    // Provide more detailed error information
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Network error: Unable to connect to Instagram API. This may be due to CORS restrictions or network connectivity issues.');
    } else if (error.message) {
      throw new Error(`Instagram API error: ${error.message}`);
    } else {
      throw new Error('Unknown error occurred while posting to Instagram');
    }
  }
};

/**
 * Posts an image to Instagram
 * @param imageUrl URL of the image to post
 * @param caption Caption for the image
 * @param instagramAccountId Instagram account ID
 * @param accessToken Facebook access token
 * @returns Media ID or null if failed
 */
export const postImageToInstagram = async (
  imageUrl: string,
  caption: string,
  instagramAccountId: string,
  accessToken: string
): Promise<string | null> => {
  try {
    console.log('Posting image to Instagram with URL:', imageUrl);
    
    // Step 1: Create media object
    const createMediaResponse = await instagramApiRequest(`/${instagramAccountId}/media`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image_url: imageUrl,
        caption: caption
      })
    });
    
    console.log('Instagram create media successful:', createMediaResponse);
    
    if (!createMediaResponse.id) {
      throw new Error('Failed to create media object');
    }
    
    const creationId = createMediaResponse.id;
    
    // Step 2: Publish the media
    const publishResponse = await instagramApiRequest(`/${instagramAccountId}/media_publish`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        creation_id: creationId
      })
    });
    
    console.log('Instagram publish media successful:', publishResponse);
    
    return publishResponse.id || null;
  } catch (error: any) {
    console.error('Error posting to Instagram:', error);
    
    // Provide more detailed error information
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Network error: Unable to connect to Instagram API. This may be due to CORS restrictions or network connectivity issues.');
    } else if (error.message) {
      throw new Error(`Instagram API error: ${error.message}`);
    } else {
      throw new Error('Unknown error occurred while posting to Instagram');
    }
  }
};

/**
 * Gets Instagram user info
 * @param accessToken Facebook access token
 * @param instagramAccountId Instagram account ID
 * @returns User info or null if failed
 */
export const getInstagramUserInfo = async (accessToken: string, instagramAccountId: string): Promise<any | null> => {
  try {
    console.log('Getting Instagram user info...');
    
    const response = await instagramApiRequest(`/${instagramAccountId}?fields=id,username,name,account_type,media_count,profile_picture_url`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Instagram user info successful:', response);
    return response || null;
  } catch (error: any) {
    console.error('Error getting Instagram user info:', error);
    
    // Provide more detailed error information
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Network error: Unable to connect to Instagram API. This may be due to CORS restrictions or network connectivity issues.');
    } else if (error.message) {
      throw new Error(`Instagram API error: ${error.message}`);
    } else {
      throw new Error('Unknown error occurred while getting Instagram user info');
    }
  }
};

/**
 * Tests the Instagram API connectivity and validates the access token
 * @param accessToken Facebook access token
 * @returns True if the token is valid, false otherwise
 */
export const testInstagramConnection = async (accessToken: string): Promise<boolean> => {
  try {
    console.log('Testing Instagram connection...');
    
    const response = await instagramApiRequest('/me/accounts', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Instagram connection test successful:', response);
    return true;
  } catch (error: any) {
    console.error('Error testing Instagram connection:', error);
    
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.error('Network error: Unable to connect to Instagram API. This may be due to CORS restrictions or network connectivity issues.');
    }
    
    return false;
  }
};