const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting test server...\n');

const server = http.createServer((req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  
  try {
    if (url.pathname === '/api/books') {
      // Books API endpoint
      const booksData = fs.readFileSync('./books.json', 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(booksData);
      
    } else if (url.pathname.startsWith('/api/books/') && url.pathname.endsWith('/content')) {
      // Book content endpoint
      const bookId = url.pathname.split('/')[3];
      const booksData = JSON.parse(fs.readFileSync('./books.json', 'utf8'));
      const book = booksData.books.find(b => b.id === bookId);
      
      if (book) {
        const content = fs.readFileSync(book.path, 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(content);
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Book not found' }));
      }
      
    } else if (url.pathname.startsWith('/api/books/')) {
      // Book details endpoint
      const bookId = url.pathname.split('/')[3];
      const booksData = JSON.parse(fs.readFileSync('./books.json', 'utf8'));
      const book = booksData.books.find(b => b.id === bookId);
      
      if (book) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(book));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Book not found' }));
      }
      
    } else if (url.pathname === '/api/health') {
      // Health check
      const booksData = JSON.parse(fs.readFileSync('./books.json', 'utf8'));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'healthy',
        totalBooks: booksData.totalBooks,
        timestamp: new Date().toISOString()
      }));
      
    } else if (url.pathname === '/' || url.pathname === '/index.html') {
      // Serve main page
      const indexPath = path.join(__dirname, '..', 'public', 'index.html');
      const indexData = fs.readFileSync(indexPath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(indexData);
      
    } else if (url.pathname.startsWith('/public/')) {
      // Serve static files
      const filePath = path.join(__dirname, '..', url.pathname);
      const ext = path.extname(filePath);
      const contentType = ext === '.css' ? 'text/css' : 
                         ext === '.js' ? 'application/javascript' : 'text/plain';
      
      const fileData = fs.readFileSync(filePath, 'utf8');
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(fileData);
      
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`📡 Test server running on http://localhost:${PORT}`);
  console.log('🔗 Available endpoints:');
  console.log('  GET /                     - Main application');
  console.log('  GET /api/books           - List all books');
  console.log('  GET /api/books/:id       - Get book details');
  console.log('  GET /api/books/:id/content - Get book content');
  console.log('  GET /api/health          - Health check');
  console.log('\\n🛑 Press Ctrl+C to stop the server');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
});