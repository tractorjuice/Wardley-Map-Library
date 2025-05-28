export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const { id } = req.query;
        
        // Load the book manifest to get book info
        const fs = require('fs').promises;
        const path = require('path');
        
        let manifestContent = null;
        try {
            manifestContent = await fs.readFile('books.json', 'utf8');
        } catch (error) {
            console.error('Could not load books manifest:', error);
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
        
        // Since we can't access the books directory reliably in Vercel,
        // we'll fetch content from GitHub raw URLs
        const githubBaseUrl = 'https://raw.githubusercontent.com/tractorjuice/GenAI-Books/Development';
        const bookUrl = `${githubBaseUrl}/books/${book.directory}/full_book.md`;
        
        try {
            const response = await fetch(bookUrl);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const content = await response.text();
            
            res.status(200).json({
                success: true,
                content: content
            });
            
        } catch (fetchError) {
            console.error('Error fetching book from GitHub:', fetchError);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch book content from repository'
            });
        }
        
    } catch (error) {
        console.error('Error in book content API:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}