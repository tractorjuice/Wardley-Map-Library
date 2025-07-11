#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class DuplicateContentChecker {
    constructor() {
        this.booksDir = path.join(__dirname, '..', 'books');
        this.duplicates = new Map();
        this.sectionHashes = new Map();
        this.tableOfContentsPattern = /^## Table of Contents\n(.*?)(?=^##|\n---|\n\n# |$)/ms;
        this.appendixPattern = /^## Appendix.*?(?=^##|\n---|\n\n# |$)/ms;
    }

    async findAllBooks() {
        const books = [];
        const entries = fs.readdirSync(this.booksDir, { withFileTypes: true });
        
        for (const entry of entries) {
            if (entry.isDirectory()) {
                const bookPath = path.join(this.booksDir, entry.name);
                const fullBookPath = path.join(bookPath, 'full_book.md');
                
                if (fs.existsSync(fullBookPath)) {
                    books.push({
                        directory: entry.name,
                        path: fullBookPath
                    });
                }
            }
        }
        
        console.log(`📚 Found ${books.length} books to analyze`);
        return books;
    }

    cleanContent(content) {
        // Remove table of contents
        content = content.replace(this.tableOfContentsPattern, '');
        
        // Remove appendix sections
        content = content.replace(this.appendixPattern, '');
        
        // Remove extra whitespace and normalize
        content = content.trim().replace(/\s+/g, ' ');
        
        return content;
    }

    extractSections(content, bookInfo) {
        const sections = [];
        
        // Split by headers (# ## ###)
        const headerPattern = /^(#{1,3})\s+(.+)$/gm;
        let match;
        const headers = [];
        
        while ((match = headerPattern.exec(content)) !== null) {
            headers.push({
                level: match[1].length,
                title: match[2].trim(),
                index: match.index
            });
        }
        
        // Extract content between headers
        for (let i = 0; i < headers.length; i++) {
            const currentHeader = headers[i];
            const nextHeader = headers[i + 1];
            
            const startIndex = currentHeader.index;
            const endIndex = nextHeader ? nextHeader.index : content.length;
            
            const sectionContent = content.substring(startIndex, endIndex).trim();
            const cleanedContent = this.cleanContent(sectionContent);
            
            // Skip very short sections (likely headers only)
            if (cleanedContent.length > 100) {
                sections.push({
                    title: currentHeader.title,
                    content: cleanedContent,
                    book: bookInfo.directory,
                    level: currentHeader.level
                });
            }
        }
        
        return sections;
    }

    generateHash(content) {
        return crypto.createHash('sha256').update(content).digest('hex');
    }

    async analyzeBooks() {
        const books = await this.findAllBooks();
        let totalSections = 0;
        let duplicateCount = 0;
        
        console.log('\n🔍 Analyzing books for duplicate content...\n');
        
        for (const book of books) {
            try {
                const content = fs.readFileSync(book.path, 'utf8');
                const sections = this.extractSections(content, book);
                totalSections += sections.length;
                
                console.log(`📖 ${book.directory}: ${sections.length} sections`);
                
                for (const section of sections) {
                    const hash = this.generateHash(section.content);
                    
                    if (this.sectionHashes.has(hash)) {
                        // Found duplicate
                        const existing = this.sectionHashes.get(hash);
                        
                        if (!this.duplicates.has(hash)) {
                            this.duplicates.set(hash, [existing]);
                        }
                        
                        this.duplicates.get(hash).push(section);
                        duplicateCount++;
                    } else {
                        this.sectionHashes.set(hash, section);
                    }
                }
                
            } catch (error) {
                console.error(`❌ Error reading ${book.directory}:`, error.message);
            }
        }
        
        console.log(`\n📊 Analysis complete:`);
        console.log(`   Total sections analyzed: ${totalSections}`);
        console.log(`   Duplicate sections found: ${duplicateCount}`);
        console.log(`   Duplicate groups: ${this.duplicates.size}`);
        
        return this.duplicates;
    }

    generateReport() {
        if (this.duplicates.size === 0) {
            console.log('\n✅ No duplicate content found!');
            return;
        }
        
        console.log('\n🚨 DUPLICATE CONTENT REPORT\n');
        
        let groupNumber = 1;
        for (const [hash, sections] of this.duplicates) {
            console.log(`📝 Duplicate Group ${groupNumber}:`);
            console.log(`   Hash: ${hash.substring(0, 16)}...`);
            console.log(`   Found in ${sections.length} books:`);
            
            for (const section of sections) {
                console.log(`   - ${section.book}`);
                console.log(`     Title: "${section.title}"`);
                console.log(`     Level: ${'#'.repeat(section.level)}`);
            }
            
            // Show a preview of the duplicated content
            const preview = sections[0].content.substring(0, 200) + '...';
            console.log(`   Preview: ${preview}`);
            console.log('');
            
            groupNumber++;
        }
    }

    async findSpecificDuplicates() {
        console.log('\n🔍 Looking for specific patterns...\n');
        
        const books = await this.findAllBooks();
        const tocDuplicates = [];
        const appendixDuplicates = [];
        
        for (const book of books) {
            try {
                const content = fs.readFileSync(book.path, 'utf8');
                
                // Check for multiple table of contents
                const tocMatches = content.match(/^## Table of Contents/gm);
                if (tocMatches && tocMatches.length > 1) {
                    tocDuplicates.push({
                        book: book.directory,
                        count: tocMatches.length
                    });
                }
                
                // Check for multiple appendix sections
                const appendixMatches = content.match(/^## Appendix/gm);
                if (appendixMatches && appendixMatches.length > 1) {
                    appendixDuplicates.push({
                        book: book.directory,
                        count: appendixMatches.length
                    });
                }
                
            } catch (error) {
                console.error(`❌ Error reading ${book.directory}:`, error.message);
            }
        }
        
        if (tocDuplicates.length > 0) {
            console.log('📋 Books with multiple Table of Contents:');
            for (const item of tocDuplicates) {
                console.log(`   - ${item.book}: ${item.count} ToCs`);
            }
        }
        
        if (appendixDuplicates.length > 0) {
            console.log('\n📎 Books with multiple Appendix sections:');
            for (const item of appendixDuplicates) {
                console.log(`   - ${item.book}: ${item.count} Appendices`);
            }
        }
        
        return { tocDuplicates, appendixDuplicates };
    }

    async run() {
        console.log('🚀 Starting duplicate content analysis...\n');
        
        const duplicates = await this.analyzeBooks();
        const specificDuplicates = await this.findSpecificDuplicates();
        
        this.generateReport();
        
        return {
            contentDuplicates: duplicates,
            tocDuplicates: specificDuplicates.tocDuplicates,
            appendixDuplicates: specificDuplicates.appendixDuplicates
        };
    }
}

// Run the checker
if (require.main === module) {
    const checker = new DuplicateContentChecker();
    checker.run().then(results => {
        console.log('\n✅ Duplicate content analysis complete!');
        process.exit(0);
    }).catch(error => {
        console.error('❌ Error during analysis:', error);
        process.exit(1);
    });
}

module.exports = DuplicateContentChecker;