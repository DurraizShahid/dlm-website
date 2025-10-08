// Debug script for video watermarking function
async function testWatermarkFunction() {
    console.log('Testing video watermarking function...');
    
    try {
        const response = await fetch('http://localhost:54321/functions/v1/video-watermark', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                videoPath: 'videos/sample.mp4'
            })
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', [...response.headers.entries()]);
        
        const responseText = await response.text();
        console.log('Response text:', responseText);
        
        if (responseText) {
            try {
                const jsonData = JSON.parse(responseText);
                console.log('Parsed JSON:', jsonData);
            } catch (e) {
                console.log('Failed to parse JSON:', e.message);
            }
        } else {
            console.log('Empty response');
        }
        
        if (!response.ok) {
            console.log('Request failed');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Run the test
testWatermarkFunction();