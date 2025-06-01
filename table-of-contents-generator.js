#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

class TableOfContentsGenerator {
    constructor() {
        this.booksDir = path.join(process.cwd(), 'books');
    }

    /**
     * Parse markdown headings from content
     * @param {string} content - Markdown content
     * @returns {Array} Array of heading objects with level, text, and line number
     */
    parseHeadings(content) {
        const lines = content.split('\n');
        const headings = [];
        let inToC = false;
        let tocEndLine = -1;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Skip existing table of contents section
            if (line.match(/^#+\s*(table\s+of\s+contents|contents)\s*$/i)) {
                inToC = true;
                continue;
            }
            
            // End of ToC when we hit the next main heading
            if (inToC && line.match(/^#+\s+[^-\*]/)) {
                inToC = false;
                tocEndLine = i - 1; // Set to line before the heading, so the heading itself gets included
            }
            
            // Skip lines inside ToC section
            if (inToC) continue;
            
            // Match markdown headings (# ## ### etc.)
            const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
            
            if (headingMatch && i > tocEndLine) {
                const level = headingMatch[1].length;
                let text = headingMatch[2].trim();
                
                // Clean heading text - remove markdown formatting
                text = text
                    .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove bold
                    .replace(/\*(.*?)\*/g, '$1')      // Remove italic
                    .replace(/`(.*?)`/g, '$1')        // Remove code
                    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links, keep text
                    .trim();
                
                // Skip empty headings
                if (text.length === 0) continue;
                
                headings.push({
                    level,
                    text,
                    lineNumber: i + 1,
                    anchor: this.generateAnchor(text)
                });
            }
        }
        
        return headings;
    }

    /**
     * Generate URL-friendly anchor from heading text
     * @param {string} text - Heading text
     * @returns {string} URL anchor
     */
    generateAnchor(text) {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }

    /**
     * Generate table of contents from headings
     * @param {Array} headings - Array of heading objects
     * @param {Object} options - Generation options
     * @returns {string} Generated table of contents markdown
     */
    generateToC(headings, options = {}) {
        const {
            maxDepth = 4,
            minEntries = 2,
            includeAnchors = false,
            title = 'Table of Contents'
        } = options;

        if (headings.length < minEntries) {
            return '';
        }

        const filteredHeadings = headings.filter(h => h.level <= maxDepth);
        if (filteredHeadings.length < minEntries) {
            return '';
        }

        let toc = `# ${title}\n\n`;
        
        for (const heading of filteredHeadings) {
            const indent = '  '.repeat(heading.level - 1);
            const text = includeAnchors ? `[${heading.text}](#${heading.anchor})` : heading.text;
            toc += `${indent}- ${text}\n`;
        }
        
        return toc + '\n';
    }

    /**
     * Extract existing ToC from content
     * @param {string} content - Markdown content
     * @returns {Object} ToC info with start/end positions and content
     */
    extractExistingToC(content) {
        const lines = content.split('\n');
        let tocStart = -1;
        let tocEnd = -1;
        let tocContent = '';

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Find ToC start
            if (tocStart === -1 && line.match(/^#+\s*(table\s+of\s+contents|contents)\s*$/i)) {
                tocStart = i;
                continue;
            }
            
            // Find ToC end
            if (tocStart !== -1 && tocEnd === -1) {
                // ToC ends when we hit a main heading (not a list item)
                if (line.match(/^#+\s+[^-\*]/) || 
                    (line.length > 0 && !line.match(/^[-\*]\s/) && !line.match(/^\s*$/))) {
                    tocEnd = i;
                    break;
                }
            }
        }

        if (tocStart !== -1) {
            tocEnd = tocEnd === -1 ? lines.length : tocEnd;
            tocContent = lines.slice(tocStart, tocEnd).join('\n');
        }

        return {
            exists: tocStart !== -1,
            startLine: tocStart,
            endLine: tocEnd,
            content: tocContent
        };
    }

    /**
     * Update or insert table of contents in content
     * @param {string} content - Original markdown content
     * @param {string} newToC - Generated table of contents
     * @returns {string} Updated content
     */
    updateToC(content, newToC) {
        const existingToC = this.extractExistingToC(content);
        const lines = content.split('\n');

        if (existingToC.exists) {
            // Replace existing ToC
            lines.splice(existingToC.startLine, existingToC.endLine - existingToC.startLine, ...newToC.split('\n'));
        } else {
            // Insert new ToC after title and warnings
            let insertPosition = 0;
            
            // Skip title (first heading)
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].match(/^#+\s+/)) {
                    insertPosition = i + 1;
                    break;
                }
            }
            
            // Skip warning block if present
            for (let i = insertPosition; i < lines.length; i++) {
                if (lines[i].includes(':warning:') || lines[i].includes('WARNING')) {
                    // Find end of warning block
                    for (let j = i; j < lines.length; j++) {
                        if (lines[j].trim() === '' && j > i) {
                            insertPosition = j + 1;
                            break;
                        }
                    }
                    break;
                }
            }
            
            // Insert ToC with proper spacing
            const tocLines = ['', ...newToC.split('\n'), ''];
            lines.splice(insertPosition, 0, ...tocLines);
        }

        return lines.join('\n');
    }

    /**
     * Validate ToC against actual headings
     * @param {string} tocContent - Table of contents content
     * @param {Array} headings - Actual headings from content
     * @returns {Object} Validation results
     */
    validateToC(tocContent, headings) {
        const tocLines = tocContent.split('\n').filter(line => line.trim().match(/^[-\*]\s+/));
        const tocEntries = tocLines.map(line => {
            const match = line.trim().match(/^[-\*]\s+(.+)$/);
            return match ? match[1].replace(/\[(.*?)\]\(.*?\)/g, '$1').trim() : '';
        }).filter(entry => entry.length > 0);

        const actualTitles = headings.map(h => h.text);
        const missing = actualTitles.filter(title => !tocEntries.includes(title));
        const extra = tocEntries.filter(entry => !actualTitles.includes(entry));

        return {
            isValid: missing.length === 0 && extra.length === 0,
            missing,
            extra,
            tocEntries: tocEntries.length,
            actualHeadings: actualTitles.length
        };
    }

    /**
     * Process a single book to add/update ToC
     * @param {string} bookDir - Book directory name
     * @param {Object} options - Processing options
     * @returns {Object} Processing results
     */
    async processBook(bookDir, options = {}) {
        const bookPath = path.join(this.booksDir, bookDir);
        const fullBookPath = path.join(bookPath, 'full_book.md');

        try {
            // Check if book file exists
            await fs.access(fullBookPath);
            
            const content = await fs.readFile(fullBookPath, 'utf8');
            const headings = this.parseHeadings(content);
            const existingToC = this.extractExistingToC(content);

            const result = {
                bookDir,
                success: false,
                hasExistingToC: existingToC.exists,
                headingsCount: headings.length,
                message: ''
            };

            if (headings.length < (options.minEntries || 2)) {
                result.message = `Skipped: Only ${headings.length} headings found`;
                return result;
            }

            // Generate new ToC
            const newToC = this.generateToC(headings, options);
            
            if (options.dryRun) {
                result.success = true;
                result.message = `Would ${existingToC.exists ? 'update' : 'add'} ToC with ${headings.length} entries`;
                result.generatedToC = newToC;
                
                if (existingToC.exists) {
                    const validation = this.validateToC(existingToC.content, headings);
                    result.validation = validation;
                }
            } else {
                // Update the file
                const updatedContent = this.updateToC(content, newToC);
                await fs.writeFile(fullBookPath, updatedContent, 'utf8');
                
                result.success = true;
                result.message = `${existingToC.exists ? 'Updated' : 'Added'} ToC with ${headings.length} entries`;
            }

            return result;

        } catch (error) {
            return {
                bookDir,
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Process all books in the library
     * @param {Object} options - Processing options
     * @returns {Array} Results for all books
     */
    async processAllBooks(options = {}) {
        try {
            const items = await fs.readdir(this.booksDir);
            const results = [];

            console.log(`🔍 Processing ${items.length} books...`);

            for (const item of items) {
                const itemPath = path.join(this.booksDir, item);
                const stat = await fs.stat(itemPath);

                if (stat.isDirectory()) {
                    const result = await this.processBook(item, options);
                    results.push(result);

                    if (result.success) {
                        console.log(`✅ ${result.message} - ${item}`);
                    } else if (result.error) {
                        console.log(`❌ Error: ${result.error} - ${item}`);
                    } else {
                        console.log(`⏭️  ${result.message} - ${item}`);
                    }
                }
            }

            return results;

        } catch (error) {
            console.error('❌ Error processing books:', error);
            throw error;
        }
    }

    /**
     * Generate summary report
     * @param {Array} results - Processing results
     * @returns {Object} Summary statistics
     */
    generateSummary(results) {
        const total = results.length;
        const successful = results.filter(r => r.success).length;
        const withExistingToC = results.filter(r => r.hasExistingToC).length;
        const errors = results.filter(r => r.error).length;
        const skipped = total - successful - errors;

        return {
            total,
            successful,
            withExistingToC,
            newToC: successful - withExistingToC,
            errors,
            skipped
        };
    }
}

module.exports = TableOfContentsGenerator;

// CLI interface when run directly
if (require.main === module) {
    const generator = new TableOfContentsGenerator();
    
    const options = {
        dryRun: process.argv.includes('--dry-run'),
        maxDepth: parseInt(process.argv.find(arg => arg.startsWith('--max-depth='))?.split('=')[1]) || 4,
        minEntries: parseInt(process.argv.find(arg => arg.startsWith('--min-entries='))?.split('=')[1]) || 2,
        includeAnchors: process.argv.includes('--anchors')
    };

    console.log('🚀 Table of Contents Generator Starting...\n');
    
    if (options.dryRun) {
        console.log('📋 Running in DRY RUN mode - no files will be modified\n');
    }

    generator.processAllBooks(options)
        .then(results => {
            const summary = generator.generateSummary(results);
            
            console.log('\n📊 Summary:');
            console.log(`   Total books: ${summary.total}`);
            console.log(`   Successfully processed: ${summary.successful}`);
            console.log(`   Books with existing ToC: ${summary.withExistingToC}`);
            console.log(`   New ToC added: ${summary.newToC}`);
            console.log(`   Errors: ${summary.errors}`);
            console.log(`   Skipped: ${summary.skipped}`);
            
            if (options.dryRun) {
                console.log('\n💡 Run without --dry-run to apply changes');
            }
        })
        .catch(error => {
            console.error('❌ Process failed:', error);
            process.exit(1);
        });
}