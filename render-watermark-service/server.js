require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Video Watermarking Service is running', 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Watermark video endpoint
app.post('/watermark-video', async (req, res) => {
  try {
    console.log("Video watermarking endpoint called");
    console.log("Request body:", req.body);
    
    const { videoPath } = req.body;
    
    // Validate required parameters
    if (!videoPath) {
      return res.status(400).json({ 
        error: "Video path is required" 
      });
    }

    // Get Supabase credentials from environment variables
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log("Supabase URL:", supabaseUrl ? "Set" : "Not set");
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.log("Missing environment variables");
      return res.status(500).json({ 
        error: "Missing environment variables", 
        required: ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"] 
      });
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
      return res.status(500).json({ 
        error: 'Error downloading video', 
        details: downloadError.message,
        videoPath: videoPath
      });
    }
    
    if (!videoData) {
      console.log("No video data returned from download");
      return res.status(404).json({ 
        error: 'No video data found', 
        videoPath: videoPath
      });
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
      return res.status(500).json({ 
        error: 'Error uploading watermarked video', 
        details: uploadError.message,
        watermarkedPath: watermarkedFilePath
      });
    }

    // Return success response with the new video path
    console.log("Successfully processed video");
    res.json({
      message: 'Video copied successfully (actual watermarking not available in this environment)', 
      originalPath: videoPath,
      watermarkedPath: watermarkedFilePath,
      watermarkedFileName: watermarkedFileName
    });
  } catch (error) {
    console.error('Error in video watermarking function:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message,
      stack: error.stack
    });
  }
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Video Watermarking Service listening on port ${port}`);
});