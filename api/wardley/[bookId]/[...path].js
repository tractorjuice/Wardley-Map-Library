export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        // In Vercel dynamic routes, parameters come from req.query
        const { bookId } = req.query;
        const wardleyPathArray = req.query.path; // This is the [...path] part
        
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

        // Use the same path resolution approach as the working book content API
        const possibleWardleyPaths = [
            path.join('books', book.directory, 'markdown_wardley_map_reports', fileName),
            path.join('books', book.directory, 'markdown', 'wardley_map_reports', fileName),
            path.join('books', book.directory, 'markdown', 'markdown_wardley_map_reports', fileName),
            path.join(process.cwd(), 'books', book.directory, 'markdown_wardley_map_reports', fileName),
            path.join(process.cwd(), 'books', book.directory, 'markdown', 'wardley_map_reports', fileName),
            path.join(process.cwd(), 'books', book.directory, 'markdown', 'markdown_wardley_map_reports', fileName),
            path.join('/var/task', 'books', book.directory, 'markdown_wardley_map_reports', fileName),
            path.join('/var/task', 'books', book.directory, 'markdown', 'wardley_map_reports', fileName),
            path.join('/var/task', 'books', book.directory, 'markdown', 'markdown_wardley_map_reports', fileName),
            path.join('/vercel/path0', 'books', book.directory, 'markdown_wardley_map_reports', fileName),
            path.join('/vercel/path0', 'books', book.directory, 'markdown', 'wardley_map_reports', fileName),
            path.join('/vercel/path0', 'books', book.directory, 'markdown', 'markdown_wardley_map_reports', fileName)
        ];

        let content = null;
        console.log('Looking for:', fileName, 'in book:', book.directory);
        for (const wardleyPath of possibleWardleyPaths) {
            try {
                content = await fs.readFile(wardleyPath, 'utf8');
                console.log('SUCCESS: Found file at', wardleyPath);
                break;
            } catch (error) {
                if (wardleyPath.includes('markdown/wardley_map_reports')) {
                    console.log('FAILED:', wardleyPath, error.code);
                }
                continue;
            }
        }

        if (!content) {
            return res.status(404).json({
                success: false,
                error: 'Wardley map file not found'
            });
        }

        res.status(200).json({
            success: true,
            content: content
        });

    } catch (error) {
        console.error('Error in Wardley API:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}