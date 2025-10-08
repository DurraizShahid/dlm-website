import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Create __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const hostname = '127.0.0.1';
const port = 3001;

const server = http.createServer((req, res) => {
  console.log(`Request: ${req.method} ${req.url}`);
  
  // Serve the test HTML file
  if (req.url === '/' || req.url === '/test-video-function.html') {
    fs.readFile(path.join(__dirname, 'test-video-function.html'), (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Error loading test page');
        return;
      }
      
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');
      res.end(data);
    });
  } 
  // Serve other static files
  else {
    const filePath = path.join(__dirname, req.url);
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain');
        res.end('File not found');
        return;
      }
      
      // Set content type based on file extension
      const ext = path.extname(filePath);
      let contentType = 'text/plain';
      if (ext === '.js') contentType = 'application/javascript';
      else if (ext === '.css') contentType = 'text/css';
      else if (ext === '.html') contentType = 'text/html';
      
      res.statusCode = 200;
      res.setHeader('Content-Type', contentType);
      res.end(data);
    });
  }
});

server.listen(port, hostname, () => {
  console.log(`Test server running at http://${hostname}:${port}/`);
  console.log(`Open your browser and navigate to http://${hostname}:${port}/ to test the video function`);
});