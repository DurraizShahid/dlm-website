// Instagram API Proxy Function
// This function acts as a proxy to bypass CORS restrictions when calling Instagram APIs

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

interface InstagramRequest {
  method: string;
  endpoint: string;
  headers?: Record<string, string>;
  body?: any;
}

serve(async (req) => {
  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Max-Age": "86400"
      }
    });
  }
  
  try {
    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { 
          status: 405, 
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          } 
        }
      );
    }

    // Parse the request body
    const requestBody = await req.text();
    if (!requestBody) {
      return new Response(
        JSON.stringify({ error: "Request body is required" }),
        { 
          status: 400, 
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          } 
        }
      );
    }
    
    let parsedBody: InstagramRequest;
    try {
      parsedBody = JSON.parse(requestBody);
    } catch (parseError) {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { 
          status: 400, 
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          } 
        }
      );
    }
    
    const { method, endpoint, headers, body } = parsedBody;
    
    // Validate required parameters
    if (!method || !endpoint) {
      return new Response(
        JSON.stringify({ error: "Method and endpoint are required" }),
        { 
          status: 400, 
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          } 
        }
      );
    }
    
    // Validate endpoint for security
    if (!endpoint.startsWith('/')) {
      return new Response(
        JSON.stringify({ error: "Endpoint must start with '/'" }),
        { 
          status: 400, 
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          } 
        }
      );
    }
    
    // Construct the full Instagram API URL
    const instagramApiUrl = `https://graph.instagram.com${endpoint}`;
    
    // Prepare headers for the Instagram API request
    const instagramHeaders: Record<string, string> = {
      "Cache-Control": "no-cache",
      ...headers
    };
    
    // Prepare the fetch options
    const fetchOptions: RequestInit = {
      method,
      headers: instagramHeaders
    };
    
    // Add body if present (for POST/PUT requests)
    if (body) {
      // If body is already a string, use it as is
      // If it's an object, stringify it
      if (typeof body === 'string') {
        fetchOptions.body = body;
      } else {
        fetchOptions.body = JSON.stringify(body);
      }
    }
    
    console.log(`Proxying request to: ${instagramApiUrl}`);
    console.log(`Request headers:`, instagramHeaders);
    
    // Make the request to Instagram API
    const instagramResponse = await fetch(instagramApiUrl, fetchOptions);
    
    // Get the response data as text first to handle different response types
    const responseText = await instagramResponse.text();
    
    // Try to parse as JSON, fallback to text if not valid JSON
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }
    
    // Determine the correct content type based on the response
    const contentType = instagramResponse.headers.get('content-type') || 'application/json';
    
    // Return the response from Instagram API
    return new Response(
      typeof responseData === 'string' ? responseData : JSON.stringify(responseData),
      { 
        status: instagramResponse.status,
        headers: {
          "Content-Type": contentType,
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-cache"
        }
      }
    );
  } catch (error) {
    console.error('Instagram proxy error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      }),
      { 
        status: 500, 
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        } 
      }
    );
  }
});