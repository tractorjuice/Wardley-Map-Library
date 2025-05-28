// Module-level cache that persists across function invocations
const cache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const { bookId } = req.query;
        const wardleyPathArray = req.query.path || req.query['...path'];
        
        // Extract filename from path parameter
        let fileName = Array.isArray(wardleyPathArray) 
            ? wardleyPathArray.join('/') 
            : wardleyPathArray;
        
        // Add directory path if missing (for bare filenames)
        if (fileName && !fileName.includes('/')) {
            fileName = `markdown/wardley_map_reports/${fileName}`;
        }

        if (!bookId) {
            return res.status(400).json({
                success: false,
                error: 'Missing bookId parameter'
            });
        }

        if (!fileName) {
            return res.status(400).json({
                success: false,
                error: 'Missing file path parameter'
            });
        }

        const fs = require('fs').promises;
        const path = require('path');

        // Load the book manifest to get book info - same as book content API
        let manifestContent = null;
        const possibleManifestPaths = [
            'books.json',
            path.join(process.cwd(), 'books.json'),
            path.join('/var/task', 'books.json'),
            path.join('/vercel/path0', 'books.json')
        ];

        for (const manifestPath of possibleManifestPaths) {
            try {
                manifestContent = await fs.readFile(manifestPath, 'utf8');
                break;
            } catch (error) {
                continue;
            }
        }

        if (!manifestContent) {
            return res.status(500).json({
                success: false,
                error: 'Books manifest not found'
            });
        }

        const manifest = JSON.parse(manifestContent);
        const book = manifest.books.find(book => book.id === bookId);

        if (!book) {
            return res.status(404).json({
                success: false,
                error: 'Book not found'
            });
        }

        // Cache implementation to reduce GitHub API calls
        const cacheKey = `${book.directory}/${fileName}`;
        const now = Date.now();
        
        // Clean up expired cache entries periodically
        if (cache.size > 50) { // Prevent memory bloat
            const expiredKeys = [];
            for (const [key, value] of cache.entries()) {
                if (now - value.timestamp >= CACHE_TTL) {
                    expiredKeys.push(key);
                }
            }
            expiredKeys.forEach(key => cache.delete(key));
        }
        
        // Check cache first
        if (cache.has(cacheKey)) {
            const cached = cache.get(cacheKey);
            if (now - cached.timestamp < CACHE_TTL) {
                return res.status(200).json({
                    success: true,
                    content: cached.content
                });
            } else {
                cache.delete(cacheKey);
            }
        }
        
        // Fetch from GitHub
        const https = require('https');
        const githubBaseUrl = 'https://raw.githubusercontent.com/tractorjuice/GenAI-Books/Development';
        const wardleyUrl = `${githubBaseUrl}/books/${book.directory}/${fileName}`;
        
        try {
            const content = await new Promise((resolve, reject) => {
                https.get(wardleyUrl, (response) => {
                    if (response.statusCode !== 200) {
                        reject(new Error(`HTTP ${response.statusCode}`));
                        return;
                    }
                    
                    let data = '';
                    response.on('data', chunk => data += chunk);
                    response.on('end', () => resolve(data));
                    response.on('error', reject);
                }).on('error', reject);
            });
            
            // Cache the successful response
            cache.set(cacheKey, {
                content: content,
                timestamp: now
            });
            
            // Set cache headers for browser caching
            res.setHeader('Cache-Control', 'public, max-age=1800');
            res.setHeader('ETag', `"${Buffer.from(cacheKey).toString('base64')}"`);
            
            res.status(200).json({
                success: true,
                content: content
            });
            
        } catch (fetchError) {
            res.status(404).json({
                success: false,
                error: 'Wardley map file not found'
            });
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}