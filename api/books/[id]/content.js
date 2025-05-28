const fs = require('fs').promises;
const path = require('path');

class BookService {
    constructor() {
        this.books = [];
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;
        
        try {
            const booksDir = path.join(process.cwd(), 'books');
            const items = await fs.readdir(booksDir);
            
            this.books = [];
            
            for (const item of items) {
                const itemPath = path.join(booksDir, item);
                const stat = await fs.stat(itemPath);
                
                if (stat.isDirectory()) {
                    const fullBookPath = path.join(itemPath, 'full_book.md');
                    
                    try {
                        await fs.access(fullBookPath);
                        
                        const bookId = this.generateBookId(item);
                        const title = this.extractTitleFromDirName(item);
                        const category = this.categorizeBook(title, item);
                        
                        this.books.push({
                            id: bookId,
                            title: title,
                            category: category,
                            directory: item,
                            path: fullBookPath
                        });
                    } catch (error) {
                        console.log(`No full_book.md found in ${item}, skipping...`);
                    }
                }
            }
            
            this.initialized = true;
            
        } catch (error) {
            console.error('Error initializing book service:', error);
            throw error;
        }
    }

    generateBookId(dirName) {
        return dirName
            .toLowerCase()
            .replace(/[_\s]+/g, '-')
            .replace(/[^a-z0-9\-]/g, '')
            .replace(/\-{2,}/g, '-')
            .replace(/^\-|\-$/g, '');
    }

    extractTitleFromDirName(dirName) {
        return dirName
            .replace(/_/g, ' ')
            .replace(/\s+[a-f0-9\-]{8,}.*$/i, '')
            .trim();
    }

    categorizeBook(title, dirName) {
        const titleLower = title.toLowerCase();
        const dirLower = dirName.toLowerCase();
        const text = titleLower + ' ' + dirLower;
        
        if (text.includes('wardley') || text.includes('mapping')) return 'Strategic Mapping';
        if (text.includes('healthcare') || text.includes('medical') || text.includes('nhs')) return 'Healthcare';
        if (text.includes('ai') || text.includes('artificial') || text.includes('genai') || text.includes('llm')) return 'Artificial Intelligence';
        if (text.includes('startup') || text.includes('business') || text.includes('strategy')) return 'Business Strategy';
        if (text.includes('government') || text.includes('public') || text.includes('nato')) return 'Government & Military';
        if (text.includes('sustainability') || text.includes('environment') || text.includes('sustainable') || text.includes('green')) return 'Sustainability';
        if (text.includes('game') || text.includes('gaming')) return 'Gaming';
        if (text.includes('security') || text.includes('privacy')) return 'Security';
        if (text.includes('data') || text.includes('science')) return 'Data Science';
        if (text.includes('education') || text.includes('teaching')) return 'Education';
        
        return 'Technology';
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
            const content = await fs.readFile(book.path, 'utf8');
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
        const { id } = req.query;
        const content = await bookService.getBookContent(id);
        
        res.status(200).json({
            success: true,
            content: content
        });
        
    } catch (error) {
        console.error('Error fetching book content:', error);
        if (error.message === 'Book not found') {
            res.status(404).json({
                success: false,
                error: 'Book not found'
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Failed to fetch book content'
            });
        }
    }
}