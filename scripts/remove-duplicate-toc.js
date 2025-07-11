#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class DuplicateToCRemover {
    constructor() {
        this.booksDir = path.join(__dirname, '..', 'books');
        this.fixed = [];
        this.errors = [];
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
        
        return books;
    }

    removeDuplicateToC(content) {
        // Pattern to match Table of Contents sections
        const tocPattern = /^## Table of Contents\n(.*?)(?=^##[^#]|\n---|\n\n# |$)/gms;
        
        const matches = [...content.matchAll(tocPattern)];
        
        if (matches.length <= 1) {
            return { content, removed: 0 };
        }
        
        console.log(`   Found ${matches.length} Table of Contents sections`);
        
        // Keep only the first ToC and remove the rest
        let newContent = content;
        let removeCount = 0;
        
        // Remove duplicates in reverse order to maintain indices
        for (let i = matches.length - 1; i >= 1; i--) {
            const match = matches[i];
            const startIndex = match.index;
            const endIndex = startIndex + match[0].length;
            
            // Remove this duplicate ToC
            newContent = newContent.substring(0, startIndex) + newContent.substring(endIndex);
            removeCount++;
        }
        
        return { content: newContent, removed: removeCount };
    }

    async processBook(book) {
        try {
            const content = fs.readFileSync(book.path, 'utf8');
            const result = this.removeDuplicateToC(content);
            
            if (result.removed > 0) {
                // Write the cleaned content back
                fs.writeFileSync(book.path, result.content, 'utf8');
                
                this.fixed.push({
                    book: book.directory,
                    removed: result.removed
                });
                
                console.log(`✅ Fixed ${book.directory}: removed ${result.removed} duplicate ToC sections`);
            } else {
                console.log(`✓ ${book.directory}: no duplicate ToC found`);
            }
            
        } catch (error) {
            console.error(`❌ Error processing ${book.directory}:`, error.message);
            this.errors.push({
                book: book.directory,
                error: error.message
            });
        }
    }

    async run() {
        console.log('🚀 Starting duplicate Table of Contents removal...\n');
        
        const books = await this.findAllBooks();
        console.log(`📚 Found ${books.length} books to process\n`);
        
        for (const book of books) {
            await this.processBook(book);
        }
        
        console.log('\n📊 Summary:');
        console.log(`   Books processed: ${books.length}`);
        console.log(`   Books with fixes: ${this.fixed.length}`);
        console.log(`   Errors: ${this.errors.length}`);
        
        if (this.fixed.length > 0) {
            console.log('\n✅ Fixed books:');
            for (const fix of this.fixed) {
                console.log(`   - ${fix.book}: removed ${fix.removed} duplicate ToC sections`);
            }
        }
        
        if (this.errors.length > 0) {
            console.log('\n❌ Errors:');
            for (const error of this.errors) {
                console.log(`   - ${error.book}: ${error.error}`);
            }
        }
        
        return {
            processed: books.length,
            fixed: this.fixed.length,
            errors: this.errors.length
        };
    }
}

// Run the fixer
if (require.main === module) {
    const remover = new DuplicateToCRemover();
    remover.run().then(results => {
        console.log('\n✅ Duplicate Table of Contents removal complete!');
        if (results.fixed > 0) {
            console.log(`🔧 Fixed ${results.fixed} books with duplicate ToC issues`);
        }
        process.exit(0);
    }).catch(error => {
        console.error('❌ Error during processing:', error);
        process.exit(1);
    });
}

module.exports = DuplicateToCRemover;