const fs = require('fs').promises;
const path = require('path');

class BookService {
    constructor() {
        this.books = [];
        this.initialized = false;
        this.manifest = null;
    }

    async initialize() {
        if (this.initialized) return;
        
        try {
            // Try to load books.json manifest from multiple possible locations
            const possibleManifestPaths = [
                path.join(process.cwd(), 'books.json'),
                path.join('/var/task', 'books.json'),
                path.join('/vercel/path0', 'books.json'),
                'books.json'
            ];
            
            let manifestPath = null;
            let manifestContent = null;
            
            for (const possiblePath of possibleManifestPaths) {
                try {
                    manifestContent = await fs.readFile(possiblePath, 'utf8');
                    manifestPath = possiblePath;
                    break;
                } catch (error) {
                    continue;
                }
            }
            
            if (!manifestPath) {
                throw new Error('Books manifest not found');
            }
            
            this.manifest = JSON.parse(manifestContent);
            this.books = this.manifest.books || [];
            this.initialized = true;
            
        } catch (error) {
            throw error;
        }
    }

    getBookById(id) {
        return this.books.find(book => book.id === id);
    }
}

const bookService = new BookService();

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
        await bookService.initialize();
        const { id } = req.query;
        const book = bookService.getBookById(id);
        
        if (!book) {
            return res.status(404).json({
                success: false,
                error: 'Book not found'
            });
        }
        
        res.status(200).json({
            success: true,
            book: {
                id: book.id,
                title: book.title,
                category: book.category
            }
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch book'
        });
    }
}