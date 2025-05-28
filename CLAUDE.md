# Claude Development Notes 🤖

This document contains important information for Claude Code to understand the GenAI Books Library project structure, conventions, and development guidelines.

## 📋 Project Overview

The GenAI Books Library is a Node.js web application that serves a collection of AI, technology, and business strategy books. The application automatically discovers books in the repository and provides a modern reading interface with advanced features.

## 🏗️ Architecture

### Application Structure
```
/workspaces/GenAI-Books/
├── books/                 # All book content organized here
│   └── [Book Directories]/ # Individual book folders
│       ├── full_book.md    # Main book content (REQUIRED)
│       ├── full_book.docx  # Word document version
│       └── markdown/       # Additional markdown content
├── public/                # Static frontend files
│   ├── index.html         # Main application HTML
│   ├── styles.css         # Complete CSS styling
│   └── script.js          # Frontend JavaScript application
├── server.js              # Express.js server with book discovery
├── package.json           # Dependencies and scripts
├── .gitignore            # Git ignore patterns
├── README.md             # User documentation
└── CLAUDE.md             # This file - development notes
```

## 🔧 Key Components

### Server-Side (`server.js`)
- **BookService Class**: Handles book discovery and management
- **Auto-Discovery**: Scans directories for `full_book.md` files
- **Categorization**: AI-powered book categorization based on content
- **API Endpoints**: RESTful API for books, content, and health checks
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
1. Server scans all directories in the `books/` folder
2. Looks for `full_book.md` files in each directory
3. Extracts book metadata from content and directory names
4. Generates clean IDs from directory names
5. Categorizes books based on title and content analysis

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
4. Restart server to trigger discovery
5. Book will be automatically categorized and listed

### Modifying Categories
1. Edit `categorizeBook()` method in `server.js`
2. Add new keyword mappings
3. Restart server to apply changes

### Updating Styles
1. Edit `public/styles.css`
2. Follow existing CSS structure and naming
3. Test responsive behavior on different screen sizes

### API Development
1. Add new endpoints in `server.js`
2. Follow existing error handling patterns
3. Update API documentation in README.md

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

### Static File Serving
- All frontend files served from `public/` directory
- Markdown files served via API endpoints
- External assets loaded from CDNs

### GitHub Codespaces
- Application runs on auto-generated Codespaces URL
- Port forwarding handled automatically
- HTTPS by default for secure features

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

## 💡 Tips for Claude Code

When working with this project:

1. **Always check existing patterns** before implementing new features
2. **Test responsive design** on different screen sizes
3. **Verify API endpoints** work correctly after changes
4. **Check browser console** for JavaScript errors
5. **Test external link behavior** after modifications
6. **Ensure book discovery** works with new content
7. **Validate URL routing** handles edge cases
8. **Check accessibility** features remain functional

The codebase follows modern web development practices with clean separation of concerns, comprehensive error handling, and user-friendly features. The application is designed to be maintainable, extensible, and performant.