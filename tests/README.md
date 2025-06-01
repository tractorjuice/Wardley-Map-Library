# Tests for Wardley Map Library

This directory contains test scripts to verify the functionality of the Wardley Map Library after adding new books.

## Available Tests

### 📚 `test-books.js`
Basic book data verification and statistics.

```bash
cd /workspaces/GenAI-Books
node tests/test-books.js
```

**What it tests:**
- Total book count
- Sample newly added books
- Category breakdown
- File path verification

### 🧪 `test-api-endpoints.js`
Comprehensive API and data integrity testing.

```bash
cd /workspaces/GenAI-Books
node tests/test-api-endpoints.js
```

**What it tests:**
- Books manifest loading
- Book file integrity
- Category distribution
- Book ID uniqueness
- Required field validation

### 🆕 `test-new-books.js`
Specific testing for newly added books.

```bash
cd /workspaces/GenAI-Books
node tests/test-new-books.js
```

**What it tests:**
- Identification of newly added books (by UUID pattern)
- Verification of specific moved books
- Category breakdown for new books
- File accessibility for new books

### 🚀 `test-server.js`
Local test server for manual testing.

```bash
cd /workspaces/GenAI-Books
node tests/test-server.js
```

**What it provides:**
- Local HTTP server on port 3000
- All API endpoints simulated
- Static file serving
- CORS headers for browser testing

**Available endpoints:**
- `GET /` - Main application
- `GET /api/books` - List all books
- `GET /api/books/:id` - Get book details
- `GET /api/books/:id/content` - Get book content
- `GET /api/health` - Health check

## Running All Tests

Run all tests in sequence:

```bash
cd /workspaces/GenAI-Books
echo "=== Basic Book Test ===" && node tests/test-books.js && \
echo -e "\n=== API Endpoints Test ===" && node tests/test-api-endpoints.js && \
echo -e "\n=== New Books Test ===" && node tests/test-new-books.js
```

## Test Results Summary

After moving 81 books from `temp_books` to `books` directory:

- ✅ **Total books**: 177 (was 88, added 81, with some variations)
- ✅ **File integrity**: All books have valid `full_book.md` files
- ✅ **ID uniqueness**: No duplicate book IDs
- ✅ **Categories**: Proper auto-categorization applied
- ✅ **Manifest**: Updated `books.json` reflects all changes

## Expected Categories After Migration

Top categories should include:
- **Artificial Intelligence**: ~42+ books
- **Technology**: ~30+ books  
- **Strategic Mapping**: ~20+ books
- **Business Strategy**: Various combinations
- **Government**: ~5+ books
- **Sustainability**: ~4+ books

## Troubleshooting

If tests fail:

1. **Books not found**: Regenerate manifest with `node generate-manifest.js`
2. **File permissions**: Ensure all book files are readable
3. **Missing categories**: Check auto-categorization logic in `generate-manifest.js`
4. **Server issues**: Verify port 3000 is available for test server

## Integration with CI/CD

These tests can be integrated into deployment pipelines:

```yaml
# Example GitHub Actions step
- name: Test Book Library
  run: |
    node tests/test-api-endpoints.js
    node tests/test-new-books.js
```