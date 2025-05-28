#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

class ManifestGenerator {
    constructor() {
        this.books = [];
        this.booksDir = path.join(process.cwd(), 'books');
    }

    generateBookId(dirName) {
        return dirName
            .toLowerCase()
            .replace(/[_\s]+/g, '-')
            .replace(/[^a-z0-9\-]/g, '')
            .replace(/\-{2,}/g, '-')
            .replace(/^\-|\-$/g, '');
    }

    extractTitleFromDirName(dirName) {
        return dirName
            .replace(/_/g, ' ')
            .replace(/\s+[a-f0-9\-]{8,}.*$/i, '')
            .trim();
    }

    categorizeBook(title, dirName) {
        const titleLower = title.toLowerCase();
        const dirLower = dirName.toLowerCase();
        const text = titleLower + ' ' + dirLower;
        
        if (text.includes('wardley') || text.includes('mapping')) return 'Strategic Mapping';
        if (text.includes('healthcare') || text.includes('medical') || text.includes('nhs')) return 'Healthcare';
        if (text.includes('ai') || text.includes('artificial') || text.includes('genai') || text.includes('llm')) return 'Artificial Intelligence';
        if (text.includes('startup') || text.includes('business') || text.includes('strategy')) return 'Business Strategy';
        if (text.includes('government') || text.includes('public') || text.includes('nato')) return 'Government & Military';
        if (text.includes('sustainability') || text.includes('environment') || text.includes('sustainable') || text.includes('green')) return 'Sustainability';
        if (text.includes('game') || text.includes('gaming')) return 'Gaming';
        if (text.includes('security') || text.includes('privacy')) return 'Security';
        if (text.includes('data') || text.includes('science')) return 'Data Science';
        if (text.includes('education') || text.includes('teaching')) return 'Education';
        
        return 'Technology';
    }

    async scanBooksDirectory() {
        console.log('🔍 Scanning books directory...');
        
        try {
            const items = await fs.readdir(this.booksDir);
            this.books = [];
            
            for (const item of items) {
                const itemPath = path.join(this.booksDir, item);
                
                try {
                    const stat = await fs.stat(itemPath);
                    
                    if (stat.isDirectory()) {
                        const fullBookPath = path.join(itemPath, 'full_book.md');
                        
                        try {
                            await fs.access(fullBookPath);
                            
                            const bookId = this.generateBookId(item);
                            const title = this.extractTitleFromDirName(item);
                            const category = this.categorizeBook(title, item);
                            
                            // Check for additional files
                            const additionalFiles = [];
                            try {
                                const dirContents = await fs.readdir(itemPath);
                                for (const file of dirContents) {
                                    if (file.endsWith('.md') && file !== 'full_book.md') {
                                        additionalFiles.push(file);
                                    }
                                }
                                
                                // Check for markdown subdirectory
                                const markdownDir = path.join(itemPath, 'markdown');
                                try {
                                    await fs.access(markdownDir);
                                    additionalFiles.push('markdown/');
                                } catch {
                                    // No markdown directory
                                }
                                
                                // Check for wardley map reports
                                const wardleyDir = path.join(itemPath, 'markdown_wardley_map_reports');
                                try {
                                    await fs.access(wardleyDir);
                                    additionalFiles.push('markdown_wardley_map_reports/');
                                } catch {
                                    // No wardley directory
                                }
                            } catch (error) {
                                console.log(`Warning: Could not scan directory contents for ${item}`);
                            }
                            
                            this.books.push({
                                id: bookId,
                                title: title,
                                category: category,
                                directory: item,
                                path: fullBookPath,
                                additionalFiles: additionalFiles
                            });
                            
                            console.log(`✅ Found book: ${title}`);
                            
                        } catch (error) {
                            console.log(`❌ No full_book.md found in ${item}, skipping...`);
                        }
                    }
                } catch (error) {
                    console.log(`❌ Error processing ${item}: ${error.message}`);
                }
            }
            
            // Sort books alphabetically by title
            this.books.sort((a, b) => a.title.localeCompare(b.title));
            
            console.log(`📚 Discovered ${this.books.length} books total`);
            
        } catch (error) {
            console.error('❌ Error scanning books directory:', error);
            throw error;
        }
    }

    async generateManifest() {
        const manifestPath = path.join(process.cwd(), 'books.json');
        
        const manifest = {
            generated: new Date().toISOString(),
            version: "1.0.0",
            totalBooks: this.books.length,
            books: this.books
        };
        
        try {
            await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
            console.log(`✅ Generated manifest file: ${manifestPath}`);
            console.log(`📊 Total books: ${this.books.length}`);
            
            // Show category breakdown
            const categories = {};
            this.books.forEach(book => {
                categories[book.category] = (categories[book.category] || 0) + 1;
            });
            
            console.log('\n📋 Category breakdown:');
            Object.entries(categories)
                .sort(([,a], [,b]) => b - a)
                .forEach(([category, count]) => {
                    console.log(`   ${category}: ${count} books`);
                });
                
        } catch (error) {
            console.error('❌ Error writing manifest file:', error);
            throw error;
        }
    }

    async run() {
        console.log('🚀 Starting book manifest generation...\n');
        
        try {
            await this.scanBooksDirectory();
            await this.generateManifest();
            
            console.log('\n✅ Manifest generation completed successfully!');
            console.log('   The books.json file is ready for use by Vercel functions.');
            
        } catch (error) {
            console.error('\n❌ Manifest generation failed:', error);
            process.exit(1);
        }
    }
}

// Run the generator if this script is executed directly
if (require.main === module) {
    const generator = new ManifestGenerator();
    generator.run();
}

module.exports = ManifestGenerator;