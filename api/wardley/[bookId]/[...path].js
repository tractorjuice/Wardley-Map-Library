const fs = require('fs').promises;
const path = require('path');

class BookService {
    constructor() {
        this.books = [];
        this.initialized = false;
        this.booksDir = null;
    }

    async initialize() {
        if (this.initialized) return;
        
        try {
            // Try multiple possible paths for Vercel deployment
            const possiblePaths = [
                path.join(process.cwd(), 'books'),
                path.join('/var/task', 'books'),
                path.join('/vercel/path0', 'books'),
                'books'
            ];
            
            let booksDir = null;
            let items = null;
            
            for (const possiblePath of possiblePaths) {
                try {
                    items = await fs.readdir(possiblePath);
                    booksDir = possiblePath;
                    console.log(`✅ Found books directory at: ${possiblePath}`);
                    break;
                } catch (error) {
                    console.log(`❌ Tried path: ${possiblePath} - ${error.message}`);
                }
            }
            
            if (!booksDir) {
                console.error('Could not find books directory in any expected location');
                console.log('Current working directory:', process.cwd());
                throw new Error('Books directory not found');
            }
            
            this.booksDir = booksDir;
            
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
        
        // Use the same booksDir that was found during initialization
        const booksDir = this.booksDir;
        const bookDir = path.join(booksDir, book.directory);
        const fileName = Array.isArray(wardleyPath) ? wardleyPath.join('/') : wardleyPath;
        
        const possiblePaths = [
            path.join(bookDir, 'markdown_wardley_map_reports', fileName),
            path.join(bookDir, 'markdown', 'wardley_map_reports', fileName),
            path.join(bookDir, 'markdown', 'markdown_wardley_map_reports', fileName),
            path.join(bookDir, fileName)
        ];
        
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