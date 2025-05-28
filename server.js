const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { marked } = require('marked');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from public directory
app.use(express.static('public'));

// Configure marked for better HTML output
marked.setOptions({
    breaks: true,
    gfm: true
});

// Book discovery service
class BookService {
    constructor() {
        this.books = [];
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;
        
        try {
            await this.discoverBooks();
            this.initialized = true;
            console.log(`📚 Discovered ${this.books.length} books`);
        } catch (error) {
            console.error('Error initializing book service:', error);
        }
    }

    async discoverBooks() {
        const booksDir = path.join(__dirname, 'books');
        
        try {
            const items = await fs.readdir(booksDir, { withFileTypes: true });
            
            for (const item of items) {
                if (item.isDirectory() && !item.name.startsWith('.')) {
                    
                    const bookPath = path.join(booksDir, item.name, 'full_book.md');
                    
                    try {
                        await fs.access(bookPath);
                        const book = await this.parseBookInfo(item.name, bookPath);
                        if (book) {
                            this.books.push(book);
                        }
                    } catch (error) {
                        // Book doesn't have full_book.md, skip it
                        continue;
                    }
                }
            }
            
            // Sort books alphabetically by title
            this.books.sort((a, b) => a.title.localeCompare(b.title));
        } catch (error) {
            console.error('Error reading books directory:', error);
            throw new Error('Books directory not found or inaccessible');
        }
    }

    async parseBookInfo(dirName, filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf8');
            const lines = content.split('\n').slice(0, 20); // Read first 20 lines for metadata
            
            // Extract title from first H1 heading
            let title = dirName.replace(/_/g, ' ').replace(/--.*$/, '');
            for (const line of lines) {
                if (line.startsWith('# ') && !line.includes('Table of Contents')) {
                    title = line.replace('# ', '').trim();
                    break;
                }
            }
            
            // Generate category based on title keywords
            const category = this.categorizeBook(title, dirName);
            
            // Generate clean ID
            const id = dirName.toLowerCase().replace(/[^a-z0-9]/g, '-');
            
            return {
                id,
                title,
                category,
                directory: dirName,
                path: filePath
            };
        } catch (error) {
            console.error(`Error parsing book info for ${dirName}:`, error);
            return null;
        }
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
            const content = await fs.readFile(book.path, 'utf8');
            return content;
        } catch (error) {
            throw new Error(`Failed to read book content: ${error.message}`);
        }
    }
}

// Initialize book service
const bookService = new BookService();

// API Routes
app.get('/api/books', async (req, res) => {
    try {
        await bookService.initialize();
        const books = bookService.getBooks();
        res.json({
            success: true,
            count: books.length,
            books: books.map(book => ({
                id: book.id,
                title: book.title,
                category: book.category
            }))
        });
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch books'
        });
    }
});

app.get('/api/books/:id', async (req, res) => {
    try {
        await bookService.initialize();
        const { id } = req.params;
        const book = bookService.getBookById(id);
        
        if (!book) {
            return res.status(404).json({
                success: false,
                error: 'Book not found'
            });
        }
        
        res.json({
            success: true,
            book: {
                id: book.id,
                title: book.title,
                category: book.category
            }
        });
    } catch (error) {
        console.error('Error fetching book:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch book'
        });
    }
});

app.get('/api/books/:id/content', async (req, res) => {
    try {
        await bookService.initialize();
        const { id } = req.params;
        const content = await bookService.getBookContent(id);
        
        res.json({
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
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'GenAI Books API is running',
        timestamp: new Date().toISOString()
    });
});

// Handle requests for individual markdown files - redirect to main book
app.get('/markdown/*', (req, res) => {
    const requestPath = req.path;
    console.log(`Redirecting markdown file request: ${requestPath}`);
    
    // Try to find which book contains this markdown file
    const bookId = findBookFromMarkdownPath(requestPath);
    
    if (bookId) {
        const redirectUrl = `/?book=${bookId}`;
        console.log(`Redirecting to book: ${redirectUrl}`);
        res.redirect(302, redirectUrl);
    } else {
        console.log('Book not found for markdown path, redirecting to home');
        res.redirect(302, '/');
    }
});

// Serve the main page for any non-API routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Helper function to find book ID from markdown file path
function findBookFromMarkdownPath(markdownPath) {
    // Get all discovered books
    const books = bookService.getBooks();
    
    // Extract the full path to find which book directory this might belong to
    const pathParts = markdownPath.split('/').filter(part => part.length > 0);
    
    // Look for matches in book directories based on the file path
    for (const book of books) {
        const bookDir = book.directory.toLowerCase();
        const pathLower = markdownPath.toLowerCase();
        
        // Check if any part of the book directory name appears in the path
        const bookKeywords = bookDir.split('_').filter(part => part.length > 3);
        
        for (const keyword of bookKeywords) {
            if (pathLower.includes(keyword)) {
                return book.id;
            }
        }
        
        // Special case mappings for specific content
        if (pathLower.includes('current_progress_and_challenges') || 
            pathLower.includes('global_goals') || 
            pathLower.includes('sustainable_development')) {
            // This matches "AI for Global Goals" book
            if (book.title.toLowerCase().includes('global goals') || 
                book.title.toLowerCase().includes('sustainable development')) {
                console.log(`Found Global Goals book: ${book.id}`);
                return book.id;
            }
        }
        
        if (pathLower.includes('gaming') || pathLower.includes('game_changer')) {
            if (book.title.toLowerCase().includes('game') || 
                book.title.toLowerCase().includes('gaming')) {
                return book.id;
            }
        }
        
        if (pathLower.includes('wardley_map_reports')) {
            if (book.title.toLowerCase().includes('wardley')) {
                return book.id;
            }
        }
    }
    
    return null;
}

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// Start server
app.listen(PORT, async () => {
    console.log(`🚀 GenAI Books server running on http://localhost:${PORT}`);
    console.log('📖 Initializing book discovery...');
    await bookService.initialize();
    console.log('✅ Server ready!');
});

module.exports = app;