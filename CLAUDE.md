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
- **174 books** currently available in the library
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
├── scripts/               # Utility scripts directory
│   ├── generate-manifest.js # Book discovery, manifest generation, and sitemap creation
│   └── table-of-contents-generator.js # ToC generator script
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
1. Manifest generator (`scripts/generate-manifest.js`) scans all directories in the `books/` folder
2. Looks for `full_book.md` files in each directory
3. Extracts book metadata from content and directory names
4. Generates clean IDs from directory names
5. Categorizes books based on title and content analysis
6. Creates `books.json` manifest file for API consumption
7. **Automatically generates `public/sitemap.xml`** with all books, categories, and API endpoints

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

### Hash Fragment Support (Deep Linking)
- Format: `/?book={book-id}#section-name`
- Example: `/?book=ai-revolution-in-healthcare#addressing-authorship-and-ownership-of-ai-created-content`
- Preserves hash fragments during initial page load
- Automatically scrolls to target section after content loads
- Maintains hash fragments during browser back/forward navigation
- Clears hash only when manually selecting new books from sidebar

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

#### Complete Book Publishing Process
Follow these steps to properly publish new books with full functionality:

**Step 1: Initial Setup and Structure**
1. **Check Development Branch**: Ensure you're on `Development` branch: `git checkout Development`
2. **Extract and Organize**: If books are in `temp_books/` as zip files:
   - Unzip any `markdown_wardley_map_reports.zip` files in each book directory
   - Rename files if needed (e.g., `full_book v2.md` → `full_book.md`)

**Step 2: Migrate to Books Directory**
3. **Move Books**: Transfer book directories from `temp_books/` to `books/` directory
4. **Fix Markdown Structure**: Ensure Wardley map reports are in correct location:
   ```bash
   cd /path/to/book/directory
   mkdir -p markdown
   mv markdown_wardley_map_reports markdown/wardley_map_reports
   ```
5. **Clean Up**: Remove zip files: `rm markdown_wardley_map_reports.zip`

**Step 3: Validate Structure**
Each book directory should have:
```
books/[Book_Directory_Name]/
├── full_book.md              # REQUIRED: Main book content
├── markdown/                 # REQUIRED: Additional content
│   └── wardley_map_reports/  # Wardley map files
└── full_book.docx           # OPTIONAL: Word version
```

**Step 4: Generate Navigation and Metadata**
6. **Update Manifest**: Run `node scripts/generate-manifest.js` to:
   - Discover new books and update `books.json`
   - Auto-categorize books based on content
   - Regenerate sitemap.xml for SEO
7. **Add Table of Contents**: Run `node scripts/table-of-contents-generator.js --anchors` to:
   - Generate clickable table of contents with anchor links
   - Add HTML anchor IDs to all headings for deep linking

**Step 5: Content Cleanup (If Needed)**
8. **Remove Appendices**: If books contain appendix sections:
   - Manually remove appendix content from `full_book.md`
   - Re-run TOC generator: `node scripts/table-of-contents-generator.js --anchors`

**Step 6: Verification**
9. **Verify Structure**: Check that both books have:
   - ✅ Proper `markdown/wardley_map_reports/` directory structure
   - ✅ Clickable table of contents with anchor links: `[text](#anchor)`
   - ✅ HTML anchor IDs in headings: `<a id="anchor"></a>`
   - ✅ No appendix sections (if removed)
   - ✅ Updated manifest and sitemap

**Step 7: Publication**
10. **Test Locally**: Verify books appear and function correctly
11. **Commit Changes**: Push to `Development` branch
12. **Deploy**: Merge to `main` when ready for production

#### Quick Command Reference
```bash
# Essential commands for book publishing
node scripts/generate-manifest.js                    # Update manifest & sitemap
node scripts/table-of-contents-generator.js --anchors # Add navigation links
git checkout Development                              # Switch to dev branch
```

#### File Structure Requirements
- **REQUIRED**: `full_book.md` in book root directory
- **REQUIRED**: `markdown/wardley_map_reports/` for Wardley map integration
- **OPTIONAL**: `full_book.docx` for Word document version

### Modifying Categories
1. Edit `categorizeBook()` method in `scripts/generate-manifest.js`
2. Add new keyword mappings
3. Run `node scripts/generate-manifest.js` to regenerate manifest and sitemap

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

## 🗺️ SEO and Sitemap Management

### Automatic Sitemap Generation
- **Sitemap Location**: `https://library.wardleymaps.ai/sitemap.xml`
- **Auto-Updates**: Regenerated every time `scripts/generate-manifest.js` runs
- **Content Included**: Homepage, API endpoints, all book categories, and individual book pages
- **URL Count**: 200+ URLs including 174 books and 23 categories

### Sitemap Structure
```xml
Homepage (priority 1.0)
API endpoints (health, books listing)
Category pages (all discovered categories)
Individual book pages (all book IDs)
```

### SEO Best Practices
- **Current Timestamps**: All URLs include current lastmod dates
- **Priority Levels**: Homepage (1.0), Categories (0.7), Books (0.8), APIs (0.3-0.7)
- **Change Frequency**: Weekly for homepage/categories, monthly for books
- **Search Engine Submission**: Submit sitemap.xml to Google Search Console and Bing

### Maintenance Notes
- Sitemap automatically stays synchronized with book collection
- No manual sitemap updates required when adding/removing books
- Categories dynamically generated based on book categorization
- Test sitemap validity at [xml-sitemaps.com validator](https://www.xml-sitemaps.com/validate-xml-sitemap.html)

## 🔄 Maintenance

### Regular Tasks
- Monitor server logs for errors
- Update dependencies for security
- Test new book additions
- Verify external link functionality
- **Verify sitemap accessibility** at library.wardleymaps.ai/sitemap.xml

### Performance Monitoring
- Check API response times
- Monitor memory usage during book discovery
- Test with large numbers of books
- **Monitor sitemap size** and URL count

### User Feedback
- Monitor for broken links
- Check accessibility compliance
- Test on different devices and browsers

---

## 📊 Readability Analysis System

### Overview
The library includes a comprehensive readability analysis system that evaluates all books using multiple industry-standard metrics. This provides detailed insights into text complexity, accessibility, and reading difficulty.

Our implementation focuses on **classic readability formulas** (1940s-1970s era) that remain the gold standard for automated text assessment. These metrics provide reliable, interpretable results that correlate well with human readability judgments and are widely used in education, healthcare, and technical writing.

### Research Foundation
The readability metrics are based on decades of linguistic research. See `research/readabiliity_methods.md` for a comprehensive comparison of classic formulas versus modern computational approaches. Our implementation covers **6 of the 7 major classic readability formulas**, providing comprehensive coverage of traditional readability assessment methods.

### Readability Metrics Calculated

#### 1. **Flesch Reading Ease Score** (0-100 scale)
- **Formula**: `206.835 - (1.015 × avg sentence length) - (84.6 × avg syllables per word)`
- **Interpretation**: Higher scores = easier to read
- **Scale**: 90+ (Very Easy), 80-89 (Easy), 70-79 (Fairly Easy), 60-69 (Standard), 50-59 (Fairly Difficult), 30-49 (Difficult), <30 (Graduate)

#### 2. **Flesch-Kincaid Grade Level** (Education years)
- **Formula**: `0.39 × avg sentence length + 11.8 × avg syllables per word - 15.59`
- **Interpretation**: Grade level (years of education) needed to understand text
- **Example**: 12.0 = High school graduate level, 16.0 = College graduate level

#### 3. **Gunning Fog Index** (Education years)
- **Formula**: `0.4 × (avg sentence length + 100 × complex word ratio)`
- **Interpretation**: Years of formal education needed
- **Threshold**: >12 considered difficult for general audience

#### 4. **SMOG Index** (Simple Measure of Gobbledygook)
- **Formula**: `1.0430 × √(complex words × 30 / sentences) + 3.1291`
- **Interpretation**: Years of education needed for comprehension
- **Focus**: Estimates reading grade level based on complex words

#### 5. **Automated Readability Index (ARI)**
- **Formula**: `4.71 × characters per word + 0.5 × avg sentence length - 21.43`
- **Interpretation**: Character-based readability metric
- **Advantage**: Doesn't require syllable counting

#### 6. **Coleman-Liau Index**
- **Formula**: `0.0588 × L - 0.296 × S - 15.8` (where L = avg characters per 100 words, S = avg sentences per 100 words)
- **Interpretation**: Based on character count rather than syllables
- **Range**: Typically 0-20+ (grade levels)

### Implementation Architecture

#### Core Files
- **`scripts/readability-analyzer.js`**: Main analysis engine and ReadabilityAnalyzer class
- **`scripts/individual-readability-reports.js`**: Individual book report generator
- **`scripts/text-preprocessor.js`**: Content cleaning and preparation
- **`public/readability-analysis.html`**: Main analysis dashboard
- **`public/readability-report.html`**: Individual book report viewer

#### Analysis Process
1. **Text Preprocessing**: Remove markdown, TOCs, appendices, normalize content
2. **Sentence Analysis**: Count sentences, calculate averages, detect patterns
3. **Word Analysis**: Syllable counting, complex word identification, vocabulary assessment
4. **Metric Calculation**: Apply all 6 readability formulas
5. **Comparison Analysis**: Benchmark against library averages
6. **Report Generation**: Create detailed recommendations and improvement priorities

### Data Structure

#### Overall Statistics (`analysis-results/readability-analysis.json`)
```json
{
  "totalBooks": 182,
  "overallStats": {
    "avgReadabilityScore": 16.6,
    "avgFleschScore": 0.5,
    "avgFleschKincaidGrade": 22.3,
    "avgFogIndex": 27.1,
    "avgSmogIndex": 19.8,
    "avgAriIndex": 24.4,
    "avgCliIndex": 0.0,
    "avgSentenceLength": 17.1,
    "avgComplexityScore": 0.29
  }
}
```

#### Individual Book Reports (`analysis-results/individual-reports/[book-id].json`)
```json
{
  "readabilityMetrics": {
    "fleschScore": 0,
    "fleschKincaidGrade": 23.0,
    "fogIndex": 27.6,
    "smogIndex": 20.6,
    "ariIndex": 25.1,
    "cliIndex": 0,
    "avgSentenceLength": 18.6,
    "avgSyllablesPerWord": 2.7,
    "complexWordRatio": 0.5
  },
  "recommendations": [...],
  "benchmarks": {...}
}
```

### UI Features

#### Main Analysis Dashboard
- **Overview Statistics**: Display all 6 metric averages
- **Book Rankings**: Sort by readability (All/Most/Least readable)
- **Category Analysis**: Compare readability across book categories
- **Common Issues**: Identify frequent readability problems
- **Responsive Design**: Works on desktop and mobile

#### Individual Book Reports
- **Comprehensive Metrics**: All 6 readability scores with color coding
- **Grade Classification**: Excellent/Good/Average/Poor/Very Poor
- **Benchmarking**: Compare against library averages
- **Recommendations**: Specific improvement suggestions
- **Priority Actions**: Ranked list of improvements needed

### API Endpoints

#### Readability Analysis API
- **`/api/readability-analysis.js`**: Serves overall analysis data
- **`/api/readability-reports/[bookId].js`**: Individual book reports
- **Caching**: Analysis results cached for performance
- **Error Handling**: Graceful fallbacks for missing data

### Analysis Configuration

#### Text Processing Thresholds
- **Long sentences**: >25 words
- **Short sentences**: <8 words
- **Complex words**: >2 syllables
- **High complexity**: >40% long sentences
- **Excessive passive voice**: >30% of sentences

#### Scoring Weights (Overall Readability Score)
- **Flesch Score**: 40% weight
- **Vocabulary Complexity**: 30% weight
- **Sentence Structure**: 30% weight

### Usage Commands

#### Generate Complete Analysis
```bash
node scripts/readability-analyzer.js
```

#### Generate Individual Reports
```bash
node scripts/individual-readability-reports.js
```

#### Output Locations
- **Main Analysis**: `analysis-results/readability-analysis.json`
- **Individual Reports**: `analysis-results/individual-reports/[book-id].json`

### Library Statistics (Current)
- **Total Books Analyzed**: 182
- **Average Reading Level**: Graduate/Professional (22+ years education)
- **Most Common Issues**: Long sentences, complex vocabulary, low Flesch scores
- **Best Performing Books**: Fairy tale guides and beginner tutorials
- **Most Challenging**: Technical and academic strategy books

### Maintenance Notes
- **Automatic Updates**: Regenerate analysis when adding new books
- **Performance**: Analysis of 182 books takes ~2-3 minutes
- **Data Consistency**: All metrics use consistent text preprocessing
- **Quality Assurance**: Cross-reference multiple metrics for accuracy

### Research Context & Future Directions

#### Current Implementation Position
Our system implements **classic readability formulas** that have proven reliable over decades:
- **Era**: 1940s-1970s linguistic research
- **Approach**: Surface-level linguistic proxies (sentence length, syllables, word complexity)
- **Advantages**: Fast, interpretable, language-agnostic, widely validated
- **Coverage**: 6/7 major classic formulas (missing Dale-Chall requiring word lists)

#### Modern Alternatives
Research shows newer approaches with higher accuracy:
- **Neural LM Readability** (2019-2021): Transformer perplexity, BERT classifiers
- **ETS TextEvaluator** (2013): 43 linguistic features, syntax analysis
- **CommonLit CLEAR ML** (2021): Ensemble ML with transformer embeddings
- **Textual Form Complexity** (2024): Structural features + semantic metrics

#### Potential Enhancements
- **Dale-Chall Formula**: Add familiar word list support
- **Experimental Features**: ML-based readability prediction
- **Semantic Analysis**: Meaning-based complexity assessment
- **Cross-Language Support**: Multilingual readability metrics

See `research/readabiliity_methods.md` for detailed comparison of approaches and implementation feasibility analysis.

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