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
        const fileName = Array.isArray(wardleyPathArray) ? wardleyPathArray.join('/') : wardleyPathArray;

        console.log('Wardley API called with:', { bookId, wardleyPathArray, fileName });

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

        // Load the book manifest to get book info
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

        // Try different possible locations for the Wardley map file
        const possibleBasePaths = [
            '',
            process.cwd(),
            '/var/task',
            '/vercel/path0'
        ];

        const possibleWardleyPaths = [];
        for (const basePath of possibleBasePaths) {
            const bookDir = path.join(basePath, 'books', book.directory);
            possibleWardleyPaths.push(
                path.join(bookDir, 'markdown_wardley_map_reports', fileName),
                path.join(bookDir, 'markdown', 'wardley_map_reports', fileName),
                path.join(bookDir, 'markdown', 'markdown_wardley_map_reports', fileName),
                path.join(bookDir, fileName)
            );
        }

        let content = null;
        let foundPath = null;
        for (const filePath of possibleWardleyPaths) {
            try {
                content = await fs.readFile(filePath, 'utf8');
                foundPath = filePath;
                console.log('Successfully found Wardley file at:', filePath);
                break;
            } catch (error) {
                console.log('Tried path:', filePath, 'Error:', error.message);
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
        console.error('Stack trace:', error.stack);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: error.message
        });
    }
}