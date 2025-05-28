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
                    console.log(`✅ Found books manifest at: ${possiblePath}`);
                    break;
                } catch (error) {
                    console.log(`❌ Tried manifest path: ${possiblePath} - ${error.message}`);
                }
            }
            
            if (!manifestPath) {
                console.error('Could not find books.json manifest in any expected location');
                console.log('Current working directory:', process.cwd());
                throw new Error('Books manifest not found');
            }
            
            this.manifest = JSON.parse(manifestContent);
            this.books = this.manifest.books || [];
            
            this.initialized = true;
            console.log(`📚 Loaded ${this.books.length} books from manifest`);
            
        } catch (error) {
            console.error('Error initializing book service:', error);
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
        const { bookId, path: wardleyPath } = req.query;
        
        const book = bookService.getBookById(bookId);
        if (!book) {
            return res.status(404).json({
                success: false,
                error: 'Book not found'
            });
        }
        
        // Try multiple possible paths for books directory
        const fileName = Array.isArray(wardleyPath) ? wardleyPath.join('/') : wardleyPath;
        
        const possibleBasePaths = [
            path.join(process.cwd(), 'books'),
            path.join('/var/task', 'books'),
            path.join('/vercel/path0', 'books'),
            'books'
        ];
        
        const possiblePaths = [];
        for (const basePath of possibleBasePaths) {
            const bookDir = path.join(basePath, book.directory);
            possiblePaths.push(
                path.join(bookDir, 'markdown_wardley_map_reports', fileName),
                path.join(bookDir, 'markdown', 'wardley_map_reports', fileName),
                path.join(bookDir, 'markdown', 'markdown_wardley_map_reports', fileName),
                path.join(bookDir, fileName)
            );
        }
        
        let content = null;
        let foundPath = null;
        
        for (const filePath of possiblePaths) {
            try {
                content = await fs.readFile(filePath, 'utf8');
                foundPath = filePath;
                break;
            } catch (error) {
                // Continue to next path
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
            content: content,
            path: foundPath
        });
        
    } catch (error) {
        console.error('Error fetching Wardley map:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch Wardley map content'
        });
    }
}