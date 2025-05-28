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
        
        // Find which book contains this Wardley map report
        let targetBook = null;
        
        // Try to find the book by checking if the file exists
        const https = require('https');
        const githubBaseUrl = 'https://raw.githubusercontent.com/tractorjuice/GenAI-Books/Development';
        
        for (const book of manifest.books) {
            // Check if this book has wardley map reports directory
            if (book.additionalFiles && book.additionalFiles.includes('markdown/')) {
                const testUrl = `${githubBaseUrl}/books/${book.directory}/markdown/wardley_map_reports/${fileName}`;
                
                try {
                    // Quick check if file exists by making a HEAD request
                    const exists = await new Promise((resolve) => {
                        const req = https.request(testUrl, { method: 'HEAD' }, (res) => {
                            resolve(res.statusCode === 200);
                        });
                        req.on('error', () => resolve(false));
                        req.setTimeout(3000, () => {
                            req.destroy();
                            resolve(false);
                        });
                        req.end();
                    });
                    
                    if (exists) {
                        targetBook = book;
                        break;
                    }
                } catch (error) {
                    // Continue to next book if check fails
                    continue;
                }
            }
        }
        
        // Fallback: if no exact match found, try to match by filename patterns
        if (!targetBook) {
            for (const book of manifest.books) {
                if (book.additionalFiles && book.additionalFiles.includes('markdown/')) {
                    // Check for keyword matches in the filename and book title
                    const fileNameLower = fileName.toLowerCase();
                    const bookTitleLower = book.title.toLowerCase();
                    
                    if (fileNameLower.includes('startup') && bookTitleLower.includes('startup')) {
                        targetBook = book;
                        break;
                    }
                    if (fileNameLower.includes('wardley') && bookTitleLower.includes('wardley')) {
                        targetBook = book;
                        break;
                    }
                }
            }
        }
        
        // If we can't find a specific book, redirect to the main library page
        const baseUrl = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}`;
        
        if (targetBook) {
            // Redirect to the book page with the specific book selected
            const redirectUrl = `${baseUrl}/?book=${targetBook.id}`;
            
            // Set redirect headers
            res.setHeader('Location', redirectUrl);
            res.status(302).end();
        } else {
            // Redirect to main library page
            res.setHeader('Location', baseUrl);
            res.status(302).end();
        }
        
    } catch (error) {
        console.error('Error in Wardley map redirect handler:', error);
        
        // Fallback redirect to main page
        const baseUrl = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}`;
        res.setHeader('Location', baseUrl);
        res.status(302).end();
    }
}