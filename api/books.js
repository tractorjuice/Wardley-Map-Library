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
            console.log(`📅 Manifest generated: ${this.manifest.generated}`);
            
        } catch (error) {
            console.error('Error initializing book service:', error);
            throw error;
        }
    }

    getBooks() {
        return this.books;
    }

    getBookById(id) {
        return this.books.find(book => book.id === id);
    }

    async getBookContent(id) {
        const book = this.getBookById(id);
        if (!book) {
            throw new Error('Book not found');
        }
        
        try {
            // Try multiple possible paths for the book content
            const possibleBookPaths = [
                path.join(process.cwd(), 'books', book.directory, 'full_book.md'),
                path.join('/var/task', 'books', book.directory, 'full_book.md'),
                path.join('/vercel/path0', 'books', book.directory, 'full_book.md'),
                book.path // fallback to original path
            ];
            
            let content = null;
            let lastError = null;
            
            for (const bookPath of possibleBookPaths) {
                try {
                    content = await fs.readFile(bookPath, 'utf8');
                    console.log(`✅ Read book content from: ${bookPath}`);
                    break;
                } catch (error) {
                    lastError = error;
                    console.log(`❌ Tried book path: ${bookPath} - ${error.message}`);
                }
            }
            
            if (!content) {
                throw lastError || new Error('Could not read book content from any location');
            }
            
            return content;
        } catch (error) {
            throw new Error(`Failed to read book content: ${error.message}`);
        }
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
        
        const books = bookService.getBooks();
        const categorizedBooks = {};
        
        books.forEach(book => {
            if (!categorizedBooks[book.category]) {
                categorizedBooks[book.category] = [];
            }
            categorizedBooks[book.category].push({
                id: book.id,
                title: book.title,
                category: book.category
            });
        });
        
        res.status(200).json({
            success: true,
            books: books.map(book => ({
                id: book.id,
                title: book.title,
                category: book.category
            })),
            categorizedBooks: categorizedBooks,
            totalCount: books.length
        });
        
    } catch (error) {
        console.error('Error in books API:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load books'
        });
    }
}