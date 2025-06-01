# Books Manifest System

This project uses a manifest-based system to optimize Vercel function performance by avoiding filesystem scanning during runtime.

## How It Works

### 1. Book Discovery
Instead of scanning the `books/` directory at runtime, the system uses a pre-generated `books.json` manifest file that contains metadata for all books.

### 2. Manifest Generation
The `generate-manifest.js` script scans the `books/` directory and creates the `books.json` file with:
- Book IDs (generated from directory names)
- Titles (extracted from directory names)
- Categories (auto-categorized based on keywords)
- Directory paths
- Additional file information

### 3. API Optimization
All API functions (`/api/books.js`, `/api/books/[id].js`, etc.) read from the manifest instead of scanning the filesystem, which:
- Reduces function bundle size for Vercel
- Improves cold start performance
- Eliminates filesystem dependency issues in serverless environments

## Usage

### Generating the Manifest
When you add new books or modify existing ones, regenerate the manifest:

```bash
npm run generate-manifest
```

Or run directly:

```bash
node scripts/generate-manifest.js
```

### Deploying to Vercel
1. Run `npm run generate-manifest` to ensure `books.json` is up to date
2. Commit the `books.json` file to git
3. Deploy to Vercel - the functions will use the manifest instead of scanning directories

### File Structure
```
/workspaces/GenAI-Books/
├── books.json              # Generated manifest (commit this!)
├── scripts/                # Utility scripts directory
│   ├── generate-manifest.js # Manifest generator script
│   └── table-of-contents-generator.js # ToC generator script
├── books/                  # Book content directories
│   └── [Book Directories]/ 
│       └── full_book.md    # Required for discovery
└── api/                    # Vercel functions (uses manifest)
    ├── books.js
    ├── books/[id].js
    └── books/[id]/content.js
```

## Book Categories
The system automatically categorizes books based on title keywords:

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
- **Technology**: (default category)

## Important Notes

1. **Always regenerate the manifest** when adding/removing books
2. **Commit `books.json`** to git so Vercel functions can access it
3. The manifest includes book discovery time and version for tracking
4. API functions fallback to multiple path locations for Vercel compatibility

## Troubleshooting

### Books Not Appearing
- Ensure `full_book.md` exists in the book directory
- Run `npm run generate-manifest` to refresh the manifest
- Check that `books.json` is committed and deployed

### API Errors in Vercel
- Verify `books.json` is included in the deployment
- Check Vercel function logs for path resolution issues
- Ensure all book directories referenced in manifest still exist