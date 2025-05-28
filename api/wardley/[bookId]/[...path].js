export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        // In Vercel dynamic routes, parameters come from req.query
        const { bookId } = req.query;
        const wardleyPathArray = req.query.path || req.query['...path']; // Handle both possible formats
        
        // Handle different possible formats
        let fileName;
        if (Array.isArray(wardleyPathArray)) {
            fileName = wardleyPathArray.join('/');
        } else if (wardleyPathArray) {
            fileName = wardleyPathArray;
        } else {
            // Try to extract from URL as fallback
            const urlParts = req.url.split('?')[0].split('/'); // Remove query params first
            const apiIndex = urlParts.findIndex(part => part === 'wardley');
            if (apiIndex >= 0 && urlParts.length > apiIndex + 2) {
                fileName = urlParts.slice(apiIndex + 2).join('/');
            }
        }
        
        // Clean any remaining query parameters from fileName
        if (fileName && fileName.includes('?')) {
            fileName = fileName.split('?')[0];
        }
        
        console.log('DEBUG: req.query =', req.query);
        console.log('DEBUG: wardleyPathArray =', wardleyPathArray);  
        console.log('DEBUG: final fileName =', fileName);
        
        // If fileName doesn't include the directory path, add it
        if (fileName && !fileName.includes('/')) {
            fileName = `markdown/wardley_map_reports/${fileName}`;
            console.log('DEBUG: Added directory path, new fileName =', fileName);
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

        // Try just the most likely path to avoid bundling too much
        const wardleyPath = path.join('books', book.directory, fileName);
        
        try {
            const content = await fs.readFile(wardleyPath, 'utf8');
            res.status(200).json({
                success: true,
                content: content
            });
        } catch (error) {
            console.error('Error reading Wardley map:', error);
            res.status(404).json({
                success: false,
                error: 'Wardley map file not found'
            });
        }

    } catch (error) {
        console.error('Error in Wardley API:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}