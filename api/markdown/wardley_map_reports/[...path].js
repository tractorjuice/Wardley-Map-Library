export default async function handler(req, res) {
    try {
        const fs = require('fs').promises;
        const path = require('path');
        
        // Get the path parameters
        const pathArray = req.query.path || [];
        const fileName = Array.isArray(pathArray) ? pathArray.join('/') : pathArray;
        
        if (!fileName) {
            return res.status(404).json({
                success: false,
                error: 'File path not provided'
            });
        }
        
        // Load the book manifest to find which book contains this report
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
        
        // For any direct access to Wardley map reports, redirect to the main app
        // Users can then navigate to find the book they're looking for
        const baseUrl = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}`;
        
        // Redirect to main library page
        res.setHeader('Location', baseUrl);
        res.status(302).end();
        
    } catch (error) {
        console.error('Error in Wardley map redirect handler:', error);
        
        // Fallback redirect to main page
        const baseUrl = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}`;
        res.setHeader('Location', baseUrl);
        res.status(302).end();
    }
}