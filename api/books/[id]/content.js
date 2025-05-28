export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const { id } = req.query;
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
        const book = manifest.books.find(book => book.id === id);
        
        if (!book) {
            return res.status(404).json({
                success: false,
                error: 'Book not found'
            });
        }
        
        // Read book content directly from local filesystem
        const possibleBookPaths = [
            path.join('books', book.directory, 'full_book.md'),
            path.join(process.cwd(), 'books', book.directory, 'full_book.md'),
            path.join('/var/task', 'books', book.directory, 'full_book.md'),
            path.join('/vercel/path0', 'books', book.directory, 'full_book.md')
        ];
        
        let content = null;
        for (const bookPath of possibleBookPaths) {
            try {
                content = await fs.readFile(bookPath, 'utf8');
                break;
            } catch (error) {
                continue;
            }
        }
        
        if (!content) {
            return res.status(404).json({
                success: false,
                error: 'Book content file not found'
            });
        }
        
        res.status(200).json({
            success: true,
            content: content
        });
        
    } catch (error) {
        console.error('Error in book content API:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}