# Wardley Map Library 🗺️

A comprehensive **open-source** digital library for Wardley Mapping resources, strategic analysis reports, and business strategy books. Currently featuring **88 strategic analysis books** with a modern, responsive interface and advanced functionality for exploring strategic thinking and business analysis.

**🌐 Live Demo:** [Visit the Wardley Map Library](https://library.wardleymaps.ai/)

## ✨ Key Features

- 🗺️ **Wardley Map Integration**: Interactive Wardley map reports and strategic analysis
- 🔍 **Intelligent Book Discovery**: Automatically discovers and catalogs all books in the repository
- 📖 **Advanced Markdown Rendering**: Full markdown support with syntax highlighting
- 🔎 **Smart Search**: Real-time filtering by title, category, and strategic focus
- 📱 **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- 🚀 **Serverless Architecture**: Fast, scalable Vercel deployment
- 📊 **Auto-Categorization**: Smart categorization based on strategic content analysis
- 🔗 **Direct Linking**: Shareable URLs for specific books and Wardley maps
- 🖱️ **Resizable Interface**: Adjustable sidebar with persistent preferences
- 🌐 **GitHub Integration**: Dynamic content loading from repository
- 📋 **One-Click Sharing**: Copy links and social sharing support
- 🎨 **Professional UI**: Clean, modern interface designed for strategic analysis

## 🎯 Perfect For

- **Strategic Consultants** exploring Wardley Mapping methodologies
- **Business Analysts** studying strategic frameworks
- **Product Managers** learning strategic positioning
- **Researchers** accessing comprehensive strategic analysis resources
- **Students** diving into business strategy and organizational design

## Quick Start

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/tractorjuice/Wardley-Map-Library.git
   cd Wardley-Map-Library
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Deploy to Vercel (Recommended):**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy to Vercel
   vercel
   ```

4. **Or run locally with Vercel dev:**
   ```bash
   vercel dev
   ```

5. **Open your browser:**
   Navigate to your Vercel URL or `http://localhost:3000`

### 🚀 One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/tractorjuice/Wardley-Map-Library)

## Project Structure

```
Wardley-Map-Library/
├── api/                    # Vercel serverless functions
│   ├── books.js           # Books listing API
│   ├── health.js          # Health check endpoint
│   ├── books/             # Individual book APIs
│   │   ├── [id].js        # Book details endpoint
│   │   └── [id]/content.js # Book content endpoint
│   └── wardley/           # Wardley map functionality
│       └── [bookId]/[...path].js # Dynamic Wardley map reports
├── books/                  # Strategic analysis content
│   └── [Book Directories]/ # Individual book folders
│       ├── full_book.md    # Book content in markdown (REQUIRED)
│       ├── full_book.docx  # Word document version (optional)
│       └── markdown/
│           └── wardley_map_reports/ # Wardley map reports
├── public/                 # Static frontend files
│   ├── index.html         # Main application page
│   ├── styles.css         # Responsive application styles
│   └── script.js          # Frontend JavaScript application
├── books.json             # Auto-generated book manifest
├── generate-manifest.js   # Book discovery script
├── vercel.json            # Vercel deployment configuration
└── package.json           # Dependencies and scripts
├── README.md              # User documentation
└── CLAUDE.md              # Development documentation
```

## 🔌 API Endpoints

### Books
- `GET /api/books` - List all available books with metadata
- `GET /api/books/:id` - Get specific book details
- `GET /api/books/:id/content` - Get book content in markdown format
- `GET /api/wardley/:bookId/[...path]` - Get Wardley map reports for specific books

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

- `vercel dev` - Start local development server
- `node generate-manifest.js` - Update book manifest
- `npm test` - Run tests (placeholder)

### Adding New Books

1. Create a new directory inside the `books/` folder
2. Add your book content as `full_book.md` (required)
3. Optionally include `full_book.docx` and additional markdown files
4. Run `node generate-manifest.js` to update the book manifest
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
- **Categories**: Modify the `categorizeBook()` method in `generate-manifest.js`
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

### Deployment
- **Vercel**: Production hosting with serverless functions
- **GitHub Integration**: Automated deployments from repository

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
vercel dev --listen 3001  # Use different port
```

#### Books Not Loading
1. Verify `full_book.md` files exist in book directories
2. Check file permissions are readable
3. Run `node generate-manifest.js` to update book manifest
4. Restart development server with `vercel dev`

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
- Use `/api/health` endpoint for API status
- Use `vercel dev` for local development server

## 🤝 Contributing

We welcome contributions to the Wardley Map Library! Here's how you can help:

### Adding New Books
1. **Fork the repository**
2. **Create a new book directory** in `/books/`
3. **Add your content:**
   ```
   books/Your_Book_Title_uniqueid/
   ├── full_book.md              # Required: Main book content
   ├── full_book.docx           # Optional: Word version
   └── markdown/                 # Optional: Additional content
       └── wardley_map_reports/  # Optional: Wardley maps
   ```
4. **Create a pull request** with your addition

### Book Content Guidelines
- **Strategic Focus**: Content should relate to Wardley Mapping, strategic analysis, or business strategy
- **Quality**: Professional-grade analysis and insights
- **Format**: Markdown format with clear structure
- **Unique Value**: Provide unique perspectives or case studies

### Development Contributions
- **Bug fixes** and improvements welcome
- **Feature requests** via GitHub issues
- **UI/UX enhancements** for better user experience
- **Performance optimizations**

### 📋 Development Setup
1. See installation instructions above
2. Review `CLAUDE.md` for technical details
3. Test locally with `vercel dev`
4. Ensure all APIs work before submitting PR

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### Open Source Attribution
- Built with vanilla JavaScript and Vercel serverless functions
- Uses GitHub API for dynamic content discovery
- Markdown rendering via marked.js
- Strategic analysis content from various contributors

## 📞 Support & Community

- **📚 Documentation**: Check `CLAUDE.md` for technical details
- **🐛 Bug Reports**: [GitHub Issues](https://github.com/tractorjuice/Wardley-Map-Library/issues)
- **💡 Feature Requests**: [GitHub Discussions](https://github.com/tractorjuice/Wardley-Map-Library/discussions)
- **🤝 Contributing**: See contributing guidelines above

### For Developers
- Review browser console for client-side errors
- Check `/api/health` endpoint for API status
- Monitor Network tab for API call failures
- Verify Node.js version compatibility (14+)

---

## 🌟 Star This Repository

If you find the Wardley Map Library useful, please ⭐ star this repository to help others discover these strategic analysis resources!

**Built with ❤️ for the strategic thinking community**
- Verify responsive design on various devices
- Test search functionality with many books

---

**Happy Reading! 🎉**