// Debug script to test the video watermarking function
async function testVideoFunction() {
    console.log('Testing video watermarking function...');
    
    // Test with a proper video path
    try {
        console.log('\n--- Test 1: Proper request ---');
        const response1 = await fetch('/functions/v1/video-watermark', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                videoPath: 'videos/sample.mp4'
            })
        });
        
        console.log('Status:', response1.status);
        const text1 = await response1.text();
        console.log('Response:', text1);
        
        // Try to parse as JSON
        try {
            const json1 = JSON.parse(text1);
            console.log('Parsed JSON:', json1);
        } catch (e) {
            console.log('Not valid JSON');
        }
    } catch (error) {
        console.error('Error in test 1:', error);
    }
    
    // Test with health check style request
    try {
        console.log('\n--- Test 2: Health check style request ---');
        const response2 = await fetch('/functions/v1/video-watermark', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: 'Functions'
            })
        });
        
        console.log('Status:', response2.status);
        const text2 = await response2.text();
        console.log('Response:', text2);
        
        // Try to parse as JSON
        try {
            const json2 = JSON.parse(text2);
            console.log('Parsed JSON:', json2);
        } catch (e) {
            console.log('Not valid JSON');
        }
    } catch (error) {
        console.error('Error in test 2:', error);
    }
    
    // Test with empty body
    try {
        console.log('\n--- Test 3: Empty body ---');
        const response3 = await fetch('/functions/v1/video-watermark', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({})
        });
        
        console.log('Status:', response3.status);
        const text3 = await response3.text();
        console.log('Response:', text3);
        
        // Try to parse as JSON
        try {
            const json3 = JSON.parse(text3);
            console.log('Parsed JSON:', json3);
        } catch (e) {
            console.log('Not valid JSON');
        }
    } catch (error) {
        console.error('Error in test 3:', error);
    }
}

// Run the test
testVideoFunction();