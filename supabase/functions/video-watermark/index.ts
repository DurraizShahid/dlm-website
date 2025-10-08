// Video Watermarking Function
// This function adds a watermark to uploaded videos
// Note: Full FFmpeg implementation requires specific Supabase setup
// This version creates a copy of the video with a "_watermarked" suffix

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';
import { corsHeaders } from "../_shared/cors.ts";

// Helper function to ensure we always return valid JSON responses
const createJsonResponse = (data: any, status: number = 200) => {
  return new Response(
    JSON.stringify(data),
    {
      headers: { 
        ...corsHeaders, 
        "Content-Type": "application/json" 
      },
      status: status,
    }
  );
};

serve(async (req) => {
  // Log the incoming request for debugging
  console.log("Video watermarking function called");
  console.log("Request method:", req.method);
  console.log("Request headers:", [...req.headers.entries()]);
  
  // Handle preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS preflight request");
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
      console.log("Invalid method:", req.method);
      return createJsonResponse(
        { error: "Method not allowed", allowedMethods: ["POST"] },
        405
      );
    }

    // Parse the request body
    const requestBody = await req.text();
    console.log("Raw request body:", requestBody);
    
    if (!requestBody) {
      console.log("Missing request body");
      return createJsonResponse(
        { error: "Request body is required" },
        400
      );
    }
    
    // Check if this is a health check or default request
    if (requestBody.includes('"name":') && requestBody.includes('Functions')) {
      console.log("This appears to be a health check request, not a video processing request");
      return createJsonResponse(
        { 
          message: "Function is running", 
          status: "healthy",
          receivedBody: requestBody
        },
        200
      );
    }
    
    let parsedBody;
    try {
      parsedBody = JSON.parse(requestBody);
    } catch (parseError) {
      console.log("Invalid JSON in request body:", (parseError as Error).message);
      return createJsonResponse(
        { error: "Invalid JSON in request body", details: (parseError as Error).message },
        400
      );
    }
    
    const { videoPath } = parsedBody;
    console.log("Parsed videoPath:", videoPath);
    
    // Validate required parameters
    if (!videoPath) {
      console.log("Missing videoPath parameter");
      return createJsonResponse(
        { error: "Video path is required" },
        400
      );
    }

    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log("Supabase URL:", supabaseUrl ? "Set" : "Not set");
    console.log("Service Role Key:", supabaseServiceRoleKey ? "Set" : "Not set");
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.log("Missing environment variables");
      return createJsonResponse(
        { error: "Missing environment variables", required: ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"] },
        500
      );
    }

    // Create a Supabase client
    const supabaseClient = createClient(
      supabaseUrl,
      supabaseServiceRoleKey
    );

    // Download the original video
    console.log("Downloading video from path:", videoPath);
    const { data: videoData, error: downloadError } = await supabaseClient.storage
      .from('application-videos')
      .download(videoPath);

    if (downloadError) {
      console.error('Error downloading video:', downloadError);
      return createJsonResponse(
        { 
          error: 'Error downloading video', 
          details: downloadError.message,
          videoPath: videoPath
        },
        500
      );
    }
    
    if (!videoData) {
      console.log("No video data returned from download");
      return createJsonResponse(
        { 
          error: 'No video data found', 
          videoPath: videoPath
        },
        404
      );
    }

    // Create a new filename for the watermarked video
    const fileName = videoPath.split('/').pop() || 'video.mp4';
    const fileExt = fileName.split('.').pop() || 'mp4';
    const nameWithoutExt = fileName.split('.')[0];
    const watermarkedFileName = `${nameWithoutExt}_watermarked.${fileExt}`;
    const watermarkedFilePath = `videos/${watermarkedFileName}`;
    
    console.log("Creating watermarked video with path:", watermarkedFilePath);
    
    // Copy the original video as a placeholder for the watermarked version
    // In a full implementation, this would use FFmpeg to add the actual watermark
    const videoArrayBuffer = await videoData.arrayBuffer();
    console.log("Video data size:", videoArrayBuffer.byteLength);
    
    const { error: uploadError } = await supabaseClient.storage
      .from('application-videos')
      .upload(watermarkedFilePath, videoArrayBuffer, {
        contentType: videoData.type || 'video/mp4',
        upsert: true
      });

    if (uploadError) {
      console.error('Error uploading watermarked video:', uploadError);
      return createJsonResponse(
        { 
          error: 'Error uploading watermarked video', 
          details: uploadError.message,
          watermarkedPath: watermarkedFilePath
        },
        500
      );
    }

    // Return success response with the new video path
    console.log("Successfully processed video");
    return createJsonResponse({
      message: 'Video copied successfully (actual watermarking not available in this environment)', 
      originalPath: videoPath,
      watermarkedPath: watermarkedFilePath,
      watermarkedFileName: watermarkedFileName
    });
  } catch (error) {
    console.error('Error in video watermarking function:', error);
    return createJsonResponse(
      { 
        error: 'Internal server error', 
        details: (error as Error).message,
        stack: (error as Error).stack
      },
      500
    );
  }
});