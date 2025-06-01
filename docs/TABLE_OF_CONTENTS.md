# Table of Contents Management

This document describes the comprehensive table of contents (ToC) management system for the Wardley Map Library.

## Overview

The ToC system provides automated generation, validation, and management of table of contents for all books in the library. It addresses the current situation where only 21% of books have table of contents, making navigation difficult for readers.

## Features

### 📚 **Automated ToC Generation**
- Parses markdown headings (# ## ### ####) from book content
- Generates consistent, hierarchical table of contents
- Supports up to 6 heading levels with configurable depth limits
- Handles markdown formatting in headings (bold, italic, links, code)

### 🔍 **ToC Validation**
- Compares existing manual ToC with actual headings
- Identifies missing or extra entries
- Reports validation status for quality control

### ⚙️ **Smart Content Processing**
- Automatically detects and skips existing ToC sections
- Preserves manual ToC formatting when updating
- Intelligent insertion positioning (after title and warnings)
- Handles edge cases and malformed content gracefully

### 🔗 **Integration Options**
- Standalone ToC generator for direct book updates
- Manifest integration for API-level ToC information
- Multiple output formats and customization options

## Usage

### Quick Start

```bash
# Generate ToC for all books (dry run to preview)
npm run generate-toc-dry

# Generate ToC for all books (applies changes)
npm run generate-toc

# Generate manifest with ToC information
npm run generate-manifest-with-toc

# Complete workflow: generate ToC then manifest
npm run build-all
```

### Command Line Options

#### Table of Contents Generator

```bash
# Basic usage
node scripts/table-of-contents-generator.js

# Dry run (preview only, no file changes)
node scripts/table-of-contents-generator.js --dry-run

# Customize maximum heading depth (default: 4)
node scripts/table-of-contents-generator.js --max-depth=3

# Set minimum entries required (default: 2)
node scripts/table-of-contents-generator.js --min-entries=5

# Include clickable anchor links
node scripts/table-of-contents-generator.js --anchors
```

#### Manifest Generator with ToC

```bash
# Standard manifest generation
node scripts/generate-manifest.js

# Include ToC information in manifest
node scripts/generate-manifest.js --include-toc
```

## Configuration Options

### ToC Generation Options

| Option | Default | Description |
|--------|---------|-------------|
| `maxDepth` | 4 | Maximum heading level to include (1-6) |
| `minEntries` | 2 | Minimum headings required to generate ToC |
| `includeAnchors` | false | Generate clickable anchor links |
| `title` | "Table of Contents" | ToC section title |
| `dryRun` | false | Preview mode without file changes |

### Example Custom Usage

```javascript
const generator = new TableOfContentsGenerator();

// Custom processing with specific options
const results = await generator.processAllBooks({
    maxDepth: 3,           // Only include h1, h2, h3
    minEntries: 5,         // Require at least 5 headings
    includeAnchors: true,  // Generate clickable links
    dryRun: false          // Apply changes
});
```

## Output Examples

### Generated Table of Contents

```markdown
# Table of Contents

- Introduction: The Dawn of AI-Powered Gaming
  - The Evolution of Game Design
    - From Pong to Procedural Generation
    - The Rise of AI in Gaming
    - What is Generative AI?
  - The Promise of GenAI in Gaming
    - Enhancing Player Experiences
    - Streamlining Development Processes

- Chapter 1: The Intersection of Generative AI and Game Design
  - Principles of AI-Driven Game Design
    - Balancing Creativity and Control
    - Designing for Adaptability
```

### With Anchor Links

```markdown
# Table of Contents

- [Introduction: The Dawn of AI-Powered Gaming](#introduction-the-dawn-of-ai-powered-gaming)
  - [The Evolution of Game Design](#the-evolution-of-game-design)
    - [From Pong to Procedural Generation](#from-pong-to-procedural-generation)
    - [The Rise of AI in Gaming](#the-rise-of-ai-in-gaming)
```

## Processing Results

### Console Output

```
🚀 Table of Contents Generator Starting...

📋 Running in DRY RUN mode - no files will be modified

🔍 Processing 174 books...
✅ Would update ToC with 66 entries - AI_Revolution_in_Healthcare
✅ Would add ToC with 64 entries - AI_Supremacy__The_Battle_Between_OpenAI
⏭️  Skipped: Only 1 headings found - Some_Short_Book
❌ Error: File not found - Broken_Book_Directory

📊 Summary:
   Total books: 174
   Successfully processed: 171
   Books with existing ToC: 36
   New ToC added: 135
   Errors: 1
   Skipped: 2
```

### API Integration

When using `--include-toc` with manifest generation, books include ToC metadata:

```json
{
  "id": "game-changer--how-generative-ai-is-revolutionising-the-future-of-gaming",
  "title": "Game Changer: How Generative AI is Revolutionising the Future of Gaming",
  "category": "Gaming",
  "tableOfContents": {
    "hasToC": true,
    "headingsCount": 100,
    "headings": [
      {
        "level": 1,
        "text": "Introduction: The Dawn of AI-Powered Gaming",
        "anchor": "introduction-the-dawn-of-ai-powered-gaming"
      },
      {
        "level": 2,
        "text": "The Evolution of Game Design",
        "anchor": "the-evolution-of-game-design"
      }
    ],
    "isValid": true
  }
}
```

## Technical Implementation

### Architecture

- **TableOfContentsGenerator**: Main class for ToC processing
- **ManifestGenerator**: Enhanced with optional ToC integration
- **Heading Parser**: Extracts structured heading information
- **ToC Validator**: Compares manual vs. generated content
- **Content Processor**: Handles ToC insertion and updates

### Key Methods

```javascript
// Parse markdown headings
parseHeadings(content)

// Generate ToC from headings
generateToC(headings, options)

// Extract existing ToC information
extractExistingToC(content)

// Update content with new ToC
updateToC(content, newToC)

// Validate ToC against headings
validateToC(tocContent, headings)

// Process single book
processBook(bookDir, options)

// Process all books
processAllBooks(options)
```

## Current Statistics

Based on analysis of the complete library:

- **174 total books** in the library
- **36 books (21%)** currently have table of contents
- **138 books (79%)** would benefit from automated ToC generation
- **0 processing errors** - robust handling of all book formats
- **Average 60 headings** per book (ranging from 2 to 365)

## Integration with Existing Workflow

### Before Using ToC System

1. Most books lacked navigation aids
2. Inconsistent ToC formatting where present
3. Manual ToC creation required for each book
4. No validation of ToC accuracy
5. No API access to navigation information

### After Using ToC System

1. Consistent ToC across all eligible books
2. Automated generation and validation
3. API integration for frontend navigation
4. Quality control through validation reports
5. Standardized formatting and structure

## Best Practices

### For Content Authors

1. Use consistent heading hierarchy (don't skip levels)
2. Keep heading text descriptive and concise
3. Avoid special characters in headings
4. Structure content with logical flow

### For System Administrators

1. Run ToC generation before manifest updates
2. Use dry-run mode to preview changes
3. Review validation reports for quality control
4. Consider max-depth limits for very detailed books

### For API Consumers

1. Use ToC data for navigation menus
2. Implement jump-to-section functionality
3. Display reading progress based on headings
4. Create book overview dashboards

## Error Handling

The system handles various edge cases:

- **Missing files**: Graceful skipping with error reporting
- **Malformed markdown**: Robust parsing with fallbacks
- **Empty headings**: Automatic filtering and cleanup
- **Special characters**: Proper anchor generation
- **Nested formatting**: Markdown cleanup in headings
- **Large files**: Efficient processing without memory issues

## Future Enhancements

Potential improvements for the ToC system:

- **Reading time estimation** based on content length
- **Section summaries** using AI analysis
- **Interactive ToC** with progress tracking
- **Multi-language support** for international content
- **Custom ToC templates** for different book types
- **Automated quality scoring** for content structure

## Troubleshooting

### Common Issues

**ToC not generated for a book:**
- Check if book has minimum required headings (default: 2)
- Verify heading format uses proper markdown (# ## ###)
- Ensure full_book.md file exists and is readable

**Validation failures:**
- Manual ToC may have formatting differences
- Headings might contain special characters
- ToC entries might be outdated compared to content

**Processing errors:**
- File permissions may prevent reading/writing
- Disk space issues for large libraries
- Memory constraints with very large books

### Debug Mode

Enable detailed logging by modifying the generator:

```javascript
const generator = new TableOfContentsGenerator();
generator.debugMode = true; // Add this for detailed logs
```

## Contributing

To extend the ToC system:

1. Fork the repository
2. Add features to `table-of-contents-generator.js`
3. Update tests for new functionality
4. Document new options and methods
5. Submit pull request with examples

---

For questions or issues with the table of contents system, please refer to the main project documentation or open an issue in the repository.