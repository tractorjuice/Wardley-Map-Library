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

    async extractTitleFromContent(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf8');
            
            // Look for various title patterns in markdown
            // First try: # Title
            let titleMatch = content.match(/^#\s+(.+)$/m);
            if (titleMatch && titleMatch[1].trim()) {
                return titleMatch[1].trim();
            }
            
            // Second try: # **Title**
            titleMatch = content.match(/^#\s+\*\*(.+?)\*\*$/m);
            if (titleMatch && titleMatch[1].trim()) {
                return titleMatch[1].trim();
            }
            
            // Third try: find multiple **title** patterns and combine them
            const boldTitles = content.match(/^#\s+\*\*(.+?)\*\*$/gm);
            if (boldTitles && boldTitles.length >= 2) {
                const title1 = boldTitles[0].match(/\*\*(.+?)\*\*/)[1].trim();
                const title2 = boldTitles[1].match(/\*\*(.+?)\*\*/)[1].trim();
                if (title1 && title2) {
                    return `${title1}: ${title2}`;
                }
            }
            
            // Fourth try: any heading with content
            titleMatch = content.match(/^#+\s+(.+)$/m);
            if (titleMatch && titleMatch[1].trim()) {
                return titleMatch[1].trim();
            }
            
            // Fallback to directory name extraction
            return null;
        } catch (error) {
            return null;
        }
    }

    categorizeBook(title, dirName) {
        const titleLower = title.toLowerCase();
        const dirLower = dirName.toLowerCase();
        const text = titleLower + ' ' + dirLower;
        
        const categories = [];

        // Check all categories and add matches
        if (text.includes('wardley') || text.includes('mapping')) categories.push('Strategic Mapping');
        if (text.includes('ai') || text.includes('artificial') || text.includes('genai') || text.includes('llm')) categories.push('Artificial Intelligence');
        if (text.includes('startup') || text.includes('business') || text.includes('strategy')) categories.push('Business Strategy');
        if (text.includes('UN ') || text.includes('united nations') || text.includes('sustainable development') || text.includes('sdg')) categories.push('United Nations');
        if (text.includes('british airways') || text.includes('leasehold')) categories.push('Consumer');
        // UK Government Department-specific categories
        if (text.includes('hmrc') || text.includes('revenue') || text.includes('customs') || text.includes('tax')) categories.push('HM Revenue & Customs');
        if (text.includes('nhs')) categories.push('Department of Health & Social Care');
        if (text.includes('health') || text.includes('healthcare') || text.includes('medical')) categories.push('Healthcare');
        if (text.includes('hydrographic') || text.includes('ocean')) categories.push('UK Hydrographic Office');
        if (text.includes('education') || text.includes('teaching') || text.includes('university') || text.includes('school')) categories.push('Department for Education');
        if (text.includes('business') || text.includes('trade') || text.includes('commerce')) categories.push('Department for Business & Trade');
        if (text.includes('transport') || text.includes('aviation') || text.includes('rail') || text.includes('roads')) categories.push('Department for Transport');
        if (text.includes('justice') || text.includes('legal') || text.includes('courts') || text.includes('law')) categories.push('Ministry of Justice');
        if (text.includes('home office') || text.includes('immigration') || text.includes('police') || text.includes('security')) categories.push('Home Office');
        if (text.includes('treasury') || text.includes('finance') || text.includes('budget') || text.includes('fiscal')) categories.push('HM Treasury');
        if (text.includes('foreign') || text.includes('diplomatic') || text.includes('international') || text.includes('embassy')) categories.push('Foreign, Commonwealth & Development Office');
        if (text.includes('statistics') || text.includes('statistical') || text.includes('unsd') || text.includes('official statistics')) categories.push('UK Statistics Authority');
        // General government for books that don't fit specific departments
        if (text.includes('government') || text.includes('public sector') || text.includes('civil service') || text.includes('okrs')) categories.push('Government');
        if (text.includes('nato') || text.includes('military') || text.includes('warfighting') || text.includes('battlefield')) categories.push('Military');
        if (text.includes('sustainability') || text.includes('environment') || text.includes('sustainable') || text.includes('green')) categories.push('Sustainability');
        if (text.includes('game') || text.includes('gaming')) categories.push('Gaming');
        if (text.includes('security') || text.includes('privacy')) categories.push('Security');
        if (text.includes('data') || text.includes('science')) categories.push('Data Science');
        if (text.includes('education') || text.includes('teaching')) categories.push('Education');

        // Remove duplicates and return categories
        const uniqueCategories = [...new Set(categories)];
        
        // If no categories found, return Technology
        if (uniqueCategories.length === 0) {
            return ['Technology'];
        }
        
        // Return single category for backward compatibility, or multiple categories
        return uniqueCategories.length === 1 ? uniqueCategories[0] : uniqueCategories;
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
                            
                            // Try to extract title from content first, fallback to directory name
                            let title = await this.extractTitleFromContent(fullBookPath);
                            if (!title) {
                                title = this.extractTitleFromDirName(item);
                            }
                            
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
                                categories: Array.isArray(category) ? category : [category],
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
                // Handle both single categories and multiple categories
                const bookCategories = book.categories || [book.category];
                bookCategories.forEach(cat => {
                    categories[cat] = (categories[cat] || 0) + 1;
                });
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