# GenAI Books Library 📚

A professional Node.js web application for browsing and reading a comprehensive collection of AI, technology, and business strategy books. Features a modern, responsive interface with advanced functionality for an optimal reading experience.

## ✨ Key Features

- 🔍 **Intelligent Book Discovery**: Automatically discovers and catalogs all books in the repository
- 📖 **Advanced Markdown Rendering**: Full markdown support with syntax highlighting via Prism.js
- 🔎 **Smart Search**: Real-time filtering by title, category, and content
- 📱 **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- 🚀 **RESTful API**: Complete API for book data, content, and metadata
- 📊 **Auto-Categorization**: AI-powered categorization based on content analysis
- 🔗 **Direct Linking**: Shareable URLs for specific books with social sharing
- 🖱️ **Resizable Interface**: Adjustable sidebar with persistent width preferences
- 🌐 **External Link Handling**: Smart link processing with new tab behavior
- 🔄 **Fuzzy URL Matching**: Intelligent URL correction for broken or malformed links
- 📋 **Copy to Clipboard**: One-click sharing with fallback support
- 🎨 **Modern UI**: Clean, professional interface with smooth animations

## Quick Start

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```
   Or for production:
   ```bash
   npm start
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

## Project Structure

```
GenAI-Books/
├── books/                  # All book content organized here
│   └── [Book Directories]/ # Individual book folders
│       ├── full_book.md    # Book content in markdown (REQUIRED)
│       ├── full_book.docx  # Word document version
│       └── markdown/       # Additional markdown content
├── public/                 # Static frontend files
│   ├── index.html         # Main application page
│   ├── styles.css         # Application styles
│   └── script.js          # Frontend JavaScript
├── server.js              # Express.js server with book discovery
├── package.json           # Node.js dependencies
├── README.md              # User documentation
└── CLAUDE.md              # Development documentation
```

## 🔌 API Endpoints

### Books
- `GET /api/books` - List all available books with metadata
- `GET /api/books/:id` - Get specific book details
- `GET /api/books/:id/content` - Get book content in markdown format

### Health & Utilities
- `GET /api/health` - API health check and status
- `GET /markdown/*` - Smart redirect for legacy markdown links

### URL Sharing
- `/?book={book-id}` - Direct link to specific book
- Supports fuzzy matching for malformed URLs

## Book Categories

Books are automatically categorized based on their content:
- Strategic Mapping (Wardley Mapping)
- Healthcare & Medical
- Artificial Intelligence
- Business Strategy
- Government & Military
- Sustainability
- Gaming
- Security & Privacy
- Data Science
- Education
- Technology

## Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-restart
- `npm test` - Run tests (placeholder)

### Adding New Books

1. Create a new directory inside the `books/` folder
2. Add your book content as `full_book.md` (required)
3. Optionally include `full_book.docx` and additional markdown files
4. Restart the server to auto-discover the new book
5. The book will be automatically categorized and added to the library

**Example:**
```bash
books/
└── My_New_Book_About_AI/
    ├── full_book.md      # Required - main content
    ├── full_book.docx    # Optional - Word version
    └── markdown/         # Optional - additional content
        └── appendix.md
```

### Advanced Features

#### Resizable Interface
- **Drag to resize** the book list sidebar
- **Persistent width** saved in browser storage
- **Responsive design** with mobile-optimized layout

#### Smart Link Handling
- **External links** automatically open in new tabs
- **Wardley Maps links** get special styling and behavior
- **Visual indicators** (↗) for external links
- **Security attributes** (`noopener noreferrer`) for safety

#### Direct Book Sharing
- **Shareable URLs** for specific books
- **Copy to clipboard** functionality with fallbacks
- **Social sharing** via Web Share API on mobile
- **URL correction** for malformed links

### Customization

- **Styling**: Edit `public/styles.css` for visual customization
- **Categories**: Modify the `categorizeBook()` method in `server.js`
- **Frontend**: Update `public/script.js` for UI behavior changes
- **External Links**: Configure link processing in `processExternalLinks()` method

## 🛠️ Technology Stack

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web application framework
- **File System APIs**: Dynamic book discovery
- **Path Matching**: Intelligent URL routing

### Frontend
- **Vanilla JavaScript ES6+**: Modern browser features
- **HTML5**: Semantic markup with accessibility
- **CSS3**: Flexbox/Grid layouts with animations
- **Web APIs**: Clipboard, History, localStorage

### External Libraries
- **Marked.js**: Markdown to HTML parsing
- **Prism.js**: Syntax highlighting for code blocks
- **Web Share API**: Native mobile sharing support

### Development Tools
- **Nodemon**: Auto-restart development server
- **GitHub Codespaces**: Cloud development environment

## API Response Format

All API responses follow this format:

```json
{
  "success": true|false,
  "data": {...},
  "error": "Error message (if applicable)"
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## 🔍 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
PORT=3001 npm start  # Use different port
```

#### Books Not Loading
1. Verify `full_book.md` files exist in book directories
2. Check file permissions are readable
3. Review server logs for discovery errors
4. Restart server to trigger re-discovery

#### Broken Book Links
- Links with wrong dashes are automatically corrected
- Invalid book IDs redirect to homepage
- Check browser console for fuzzy matching logs

#### External Links Not Opening
- Verify JavaScript is enabled
- Check browser console for processing errors
- Test with different link formats

#### Resizable Sidebar Issues
- Clear localStorage to reset width preferences
- Check browser compatibility for drag events
- Verify CSS grid/flexbox support

### Debug Mode
- Open browser DevTools (F12)
- Check Console tab for JavaScript errors
- Monitor Network tab for API call failures
- Use `/api/health` endpoint for server status

## 📞 Support

For development questions:
1. Check `CLAUDE.md` for technical details
2. Review browser console for client-side errors
3. Check server logs for backend issues
4. Verify Node.js version compatibility (14+)
5. Test API endpoints directly

### Performance Optimization
- Monitor memory usage with large book collections
- Check network performance for slow connections
- Verify responsive design on various devices
- Test search functionality with many books

---

**Happy Reading! 🎉**