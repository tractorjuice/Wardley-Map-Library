# Claude Development Notes 🤖

This document contains important information for Claude Code to understand the Wardley Map Library project structure, conventions, and development guidelines.

## 📋 Project Overview

The Wardley Map Library is an **open-source** Node.js web application that serves a comprehensive collection of Wardley Mapping resources, strategic analysis reports, and business strategy books. Built with Vercel serverless functions and vanilla JavaScript, it provides a modern reading interface with advanced features for strategic thinking and business analysis.

**🌐 Live Demo:** https://library.wardleymaps.ai/

### Current Status: ✅ FULLY FUNCTIONAL
- All APIs working correctly with manifest-based discovery
- Wardley map integration operational
- Responsive UI with interactive features
- Dynamic book discovery and categorization
- **177 books** currently available in the library
- Vercel deployment optimized and stable

## 🌿 **IMPORTANT: Development Branch Workflow**

**⚠️ CRITICAL DEVELOPMENT RULE: ALL CHANGES MUST BE MADE TO THE `Development` BRANCH**

### Branch Strategy
- **`main`**: Production branch - deployed to https://library.wardleymaps.ai/
- **`Development`**: Active development branch - ALL WORK HAPPENS HERE

### Development Workflow
1. **Always work on `Development` branch**: `git checkout Development`
2. **Make all changes** (code, books, tests, documentation) on `Development`
3. **Test thoroughly** using the test suite in `tests/` directory
4. **Commit and push** to `Development` branch
5. **Only merge to `main`** when ready for production deployment

### For Claude Code:
- **NEVER make direct changes to `main` branch**
- **ALWAYS check current branch** before making changes: `git branch`
- **Switch to Development** if needed: `git checkout Development`
- **Verify you're on Development** before any file modifications
- **All new books, features, fixes, tests** go to `Development` first

### Current Branch Status
- Both `main` and `Development` are currently synchronized
- Future development should only happen on `Development`
- This ensures production stability while allowing active development

## 🏗️ Architecture

### Application Structure
```
/workspaces/GenAI-Books/
├── api/                   # Vercel serverless functions
│   ├── books.js          # Books listing API
│   ├── books/            # Individual book APIs
│   │   ├── [id].js       # Book details endpoint
│   │   └── [id]/
│   │       └── content.js # Book content endpoint
│   ├── health.js         # Health check endpoint
│   └── wardley/          # Wardley map functionality
│       └── [bookId]/
│           └── [...path].js # Dynamic Wardley map reports
├── books/                 # All book content organized here
│   └── [Book Directories]/ # Individual book folders
│       ├── full_book.md    # Main book content (REQUIRED)
│       ├── full_book.docx  # Word document version
│       └── markdown/       # Additional markdown content
│           └── wardley_map_reports/ # Wardley map files
├── public/                # Static frontend files
│   ├── index.html         # Main application HTML
│   ├── styles.css         # Complete CSS styling
│   └── script.js          # Frontend JavaScript application
├── generate-manifest.js   # Book discovery and manifest generation
├── package.json           # Dependencies and scripts
├── vercel.json           # Vercel deployment configuration
├── .gitignore            # Git ignore patterns
├── README.md             # User documentation
└── CLAUDE.md             # This file - development notes
```

## 🔧 Key Components

### Serverless API Functions (`api/` directory)
- **Book Discovery**: Automated scanning for `full_book.md` files via manifest
- **Auto-Categorization**: AI-powered book categorization based on content
- **RESTful Endpoints**: Books, content, and health check APIs
- **URL Routing**: Smart redirects for legacy markdown links
- **Error Handling**: Comprehensive error handling and logging

### Frontend (`public/script.js`)
- **BooksLibrary Class**: Main application controller
- **Book Management**: Loading, displaying, and searching books
- **URL Routing**: Browser history management and direct linking
- **Resizable Interface**: Drag-to-resize sidebar with persistence
- **External Links**: Automatic new-tab behavior for external URLs
- **Share Functionality**: Copy-to-clipboard with Web Share API fallback
- **Fuzzy Matching**: Intelligent URL correction for broken links

### Styling (`public/styles.css`)
- **Responsive Design**: Mobile-first approach with desktop enhancements
- **Modern UI**: Clean typography, smooth animations, professional colors
- **Component Styling**: Modular CSS for different UI components
- **External Links**: Special styling for Wardley Maps and external links
- **Accessibility**: High contrast, proper focus states, screen reader support

## 📚 Book Discovery System

### How Books Are Found
1. Manifest generator (`generate-manifest.js`) scans all directories in the `books/` folder
2. Looks for `full_book.md` files in each directory
3. Extracts book metadata from content and directory names
4. Generates clean IDs from directory names
5. Categorizes books based on title and content analysis
6. Creates `books.json` manifest file for API consumption

### Book ID Generation
- Converts directory names to lowercase
- Replaces underscores and special characters with dashes
- Removes unnecessary suffixes (like UUID parts)
- Examples:
  - `Game_Changer__How_Generative_AI_is_Revolutionising_the_Future_of_Gaming_682bb3ec-a92c-40`
  - Becomes: `game-changer--how-generative-ai-is-revolutionising-the-future-of-gaming-682bb3ec-a92c-40`

### Auto-Categorization Logic
Books are categorized using keyword matching:
- **Strategic Mapping**: "wardley", "mapping"
- **Healthcare**: "healthcare", "medical", "nhs"
- **Artificial Intelligence**: "ai", "artificial", "genai", "llm"
- **Business Strategy**: "startup", "business", "strategy"
- **Government & Military**: "government", "public", "nato"
- **Sustainability**: "sustainability", "environment", "sustainable", "green"
- **Gaming**: "game", "gaming"
- **Security**: "security", "privacy"
- **Data Science**: "data", "science"
- **Education**: "education", "teaching"

## 🔗 URL and Routing System

### Direct Book Links
- Format: `/?book={book-id}`
- Example: `/?book=game-changer--how-generative-ai-is-revolutionising-the-future-of-gaming-682bb3ec-a92c-40`
- Supports browser back/forward navigation
- Updates page title dynamically

### Legacy Link Handling
- Redirects `/markdown/*` paths to appropriate books
- Uses intelligent matching based on content keywords
- Handles broken or malformed URLs gracefully

### Fuzzy URL Matching
- Handles dash variations (single vs double dashes)
- Performs partial title matching
- Logs corrections for debugging

## 🎨 UI/UX Features

### Resizable Sidebar
- Drag-to-resize between 200px and 600px (or 70% of screen)
- Persistent width stored in localStorage
- Responsive behavior on mobile (stacked layout)
- Visual feedback during dragging

### External Link Processing
- Automatically detects external URLs
- Adds `target="_blank"` and security attributes
- Visual indicators (↗ icon) for external links
- Special styling for Wardley Maps links
- Hover animations and effects

### Search and Filtering
- Real-time search as user types
- Searches both title and category
- Updates visible book count
- Maintains search state during navigation

### Share Functionality
- Copy-to-clipboard for direct book links
- Web Share API for mobile devices
- Visual feedback with success animations
- Multiple fallback methods for compatibility

## 🔧 Development Guidelines

### Adding New Features
1. **Backend**: Add API endpoints in `server.js`
2. **Frontend**: Extend `BooksLibrary` class methods
3. **Styling**: Add CSS in appropriate sections
4. **Testing**: Test with multiple book types and devices

### Code Conventions
- **ES6+ JavaScript**: Use modern syntax and features
- **Async/Await**: Prefer async/await over Promises
- **Error Handling**: Always include try/catch blocks
- **Logging**: Use console.log for debugging, console.error for errors
- **Comments**: Document complex logic and public methods

### Performance Considerations
- **Lazy Loading**: Books are loaded on-demand
- **Local Storage**: Cache user preferences
- **Efficient DOM**: Minimize DOM manipulation
- **Responsive Images**: Use max-width: 100% for images

## 🛠️ Common Tasks

### Adding a New Book
1. Create directory inside `books/` folder with descriptive name
2. Add `full_book.md` file with markdown content
3. Optionally add `full_book.docx` and other markdown files
4. Run `node generate-manifest.js` to update the book manifest
5. Book will be automatically categorized and listed

### Modifying Categories
1. Edit `categorizeBook()` method in `generate-manifest.js`
2. Add new keyword mappings
3. Run `node generate-manifest.js` to regenerate manifest

### Updating Styles
1. Edit `public/styles.css`
2. Follow existing CSS structure and naming
3. Test responsive behavior on different screen sizes

### API Development
1. **All Development**: Create serverless functions in `api/` directory
2. Follow existing error handling patterns
3. Update API documentation in README.md
4. **Vercel Functions**: Use `export default async function handler(req, res)`
5. Test locally with `vercel dev`

## 🐛 Debugging

### Common Issues
- **Books not loading**: Check `full_book.md` files exist
- **404 errors**: Verify book IDs match discovery system
- **Styling issues**: Check CSS specificity and mobile responsiveness
- **Link problems**: Test external link detection logic

### Logging
- Server logs include book discovery process
- Frontend logs API calls and routing decisions
- Use browser DevTools for client-side debugging

### Server Health
- Visit `/api/health` for server status
- Check `/api/books` for book discovery results
- Monitor server logs for errors

## 📱 Deployment Notes

### Environment Variables
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode

### Vercel Production Deployment
- **Serverless Functions**: All API endpoints as individual functions
- **Static Hosting**: Frontend files served from `public/` directory
- **GitHub Integration**: Automatic deployments on git push
- **Edge Caching**: Optimized global content delivery
- **Function Limits**: 300MB bundle size limit (handled via GitHub raw URLs)
- **Caching Strategy**: 30-minute TTL with module-level caching

### Local Development (GitHub Codespaces)
- Application runs on auto-generated Codespaces URL
- Port forwarding handled automatically
- HTTPS by default for secure features
- Vercel development server for local testing

## 🔄 Maintenance

### Regular Tasks
- Monitor server logs for errors
- Update dependencies for security
- Test new book additions
- Verify external link functionality

### Performance Monitoring
- Check API response times
- Monitor memory usage during book discovery
- Test with large numbers of books

### User Feedback
- Monitor for broken links
- Check accessibility compliance
- Test on different devices and browsers

---

## 🗺️ Wardley Map Integration

### Architecture Overview
- **API Endpoint**: `/api/wardley/[bookId]/[...path].js`
- **Content Source**: GitHub raw URLs for production reliability
- **Caching**: 30-minute TTL with module-level cache to reduce API calls
- **File Structure**: `markdown/wardley_map_reports/` within book directories

### Implementation Details
```javascript
// Dynamic path handling for Vercel serverless functions
const wardleyPathArray = req.query.path || req.query['...path'];
let fileName = Array.isArray(wardleyPathArray) 
    ? wardleyPathArray.join('/') 
    : wardleyPathArray;

// Automatic directory path resolution
if (fileName && !fileName.includes('/')) {
    fileName = `markdown/wardley_map_reports/${fileName}`;
}

// GitHub raw URL construction for production
const githubBaseUrl = 'https://raw.githubusercontent.com/tractorjuice/GenAI-Books/Development';
const wardleyUrl = `${githubBaseUrl}/books/${book.directory}/${fileName}`;
```

### Caching Strategy
- **Module-level cache**: Persists across function invocations
- **Cache cleanup**: Automatic removal of expired entries
- **Performance**: Reduces GitHub API calls and improves response times
- **Reliability**: Fallback to fresh fetch if cache fails

## 💡 Tips for Claude Code

When working with this project:

1. **🌿 FIRST: Ensure you're on Development branch** (`git checkout Development`)
2. **Always check existing patterns** before implementing new features
3. **Test responsive design** on different screen sizes
4. **Verify API endpoints** work correctly after changes
5. **Check browser console** for JavaScript errors
6. **Test external link behavior** after modifications
7. **Ensure book discovery** works with new content
8. **Validate URL routing** handles edge cases
9. **Check accessibility** features remain functional
10. **Wardley Maps**: Test with different path formats and cache behavior
11. **Vercel Deployment**: Consider function size limits and serverless constraints
12. **🧪 Run test suite** in `tests/` directory before committing changes

The codebase follows modern web development practices with clean separation of concerns, comprehensive error handling, and user-friendly features. The application is designed to be maintainable, extensible, and performant.