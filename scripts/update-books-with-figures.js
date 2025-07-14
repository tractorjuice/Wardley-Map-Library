#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

class BookFiguresUpdater {
    constructor() {
        this.booksDirectory = path.join(__dirname, '..', 'books');
    }

    async scanBookForImages(bookPath) {
        try {
            const content = await fs.readFile(bookPath, 'utf8');
            const figures = [];
            
            // Regex to find image markdown syntax: ![alt text](url)
            const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
            let match;
            let figureIndex = 1;
            
            while ((match = imageRegex.exec(content)) !== null) {
                const [fullMatch, altText, url] = match;
                
                // Only include external images (wardleymaps.ai URLs) or direct image URLs
                if (url.includes('wardleymaps.ai') || url.match(/\.(png|jpg|jpeg|gif|svg)$/i)) {
                    figures.push({
                        id: `fig-${figureIndex}`,
                        caption: altText || `Figure ${figureIndex}`,
                        url: url,
                        type: url.includes('wardleymaps.ai') ? 'wardley_map' : 'image'
                    });
                    figureIndex++;
                }
            }
            
            return figures;
        } catch (error) {
            console.error(`Error scanning book: ${error.message}`);
            return [];
        }
    }

    generateFiguresMarkdown(figures) {
        if (!figures || figures.length === 0) {
            return '';
        }

        let figuresMarkdown = `\n\n---\n\n# List of Figures\n\n`;
        figuresMarkdown += `This book contains **${figures.length}** figures:\n\n`;
        
        const wardleyMaps = figures.filter(f => f.type === 'wardley_map').length;
        const images = figures.filter(f => f.type === 'image').length;
        
        if (wardleyMaps > 0) {
            figuresMarkdown += `- **${wardleyMaps}** Wardley Maps\n`;
        }
        if (images > 0) {
            figuresMarkdown += `- **${images}** Images\n`;
        }
        
        figuresMarkdown += `\n## Figure Index\n\n`;
        
        figures.forEach((figure, index) => {
            figuresMarkdown += `### Figure ${index + 1}: ${figure.caption}\n\n`;
            figuresMarkdown += `**Type:** ${figure.type === 'wardley_map' ? 'Wardley Map' : 'Image'}  \n`;
            figuresMarkdown += `**Source:** [View Full Size](${figure.url})\n\n`;
        });

        return figuresMarkdown;
    }

    async updateBookFile(bookDirectory) {
        try {
            const bookPath = path.join(this.booksDirectory, bookDirectory, 'full_book.md');
            
            // Check if file exists
            try {
                await fs.access(bookPath);
            } catch {
                console.log(`📖 ${bookDirectory}: full_book.md not found, skipping...`);
                return false;
            }
            
            // Read the current book content
            let bookContent = await fs.readFile(bookPath, 'utf8');
            
            // Check if figures section already exists
            if (bookContent.includes('# List of Figures')) {
                console.log(`📖 ${bookDirectory}: Figures section already exists, skipping...`);
                return false;
            }
            
            // Scan for images in the main document
            const figures = await this.scanBookForImages(bookPath);
            
            if (figures.length === 0) {
                console.log(`📖 ${bookDirectory}: No figures found in main document`);
                return false;
            }
            
            // Generate figures markdown
            const figuresMarkdown = this.generateFiguresMarkdown(figures);
            
            // Append figures section to the book
            const updatedContent = bookContent + figuresMarkdown;
            
            // Write the updated content back to the file
            await fs.writeFile(bookPath, updatedContent, 'utf8');
            
            console.log(`✅ ${bookDirectory}: Added ${figures.length} figures to markdown`);
            return true;
            
        } catch (error) {
            console.error(`❌ Error updating ${bookDirectory}:`, error.message);
            return false;
        }
    }

    async updateAllBooks() {
        console.log('🚀 Starting book figures update process...\n');
        
        try {
            // Get list of all book directories
            const bookDirectories = await fs.readdir(this.booksDirectory);
            
            console.log(`📚 Found ${bookDirectories.length} book directories\n`);
            
            let updatedCount = 0;
            let skippedCount = 0;
            
            for (const bookDirectory of bookDirectories) {
                const dirPath = path.join(this.booksDirectory, bookDirectory);
                const stat = await fs.stat(dirPath);
                
                if (stat.isDirectory()) {
                    const updated = await this.updateBookFile(bookDirectory);
                    if (updated) {
                        updatedCount++;
                    } else {
                        skippedCount++;
                    }
                }
            }
            
            console.log('\n📊 Update Summary:');
            console.log(`✅ Updated: ${updatedCount} books`);
            console.log(`⏭️ Skipped: ${skippedCount} books`);
            console.log('\n🎉 Book figures update completed successfully!');
            
        } catch (error) {
            console.error('❌ Fatal error during update process:', error.message);
            process.exit(1);
        }
    }

    async updateSingleBook(bookDirectory) {
        console.log(`🚀 Updating single book: ${bookDirectory}\n`);
        
        const updated = await this.updateBookFile(bookDirectory);
        
        if (updated) {
            console.log(`\n✅ Successfully updated ${bookDirectory}`);
        } else {
            console.log(`\n⏭️ No updates needed for ${bookDirectory}`);
        }
    }
}

// Run the updater if this script is executed directly
if (require.main === module) {
    const updater = new BookFiguresUpdater();
    
    // Check if a specific book directory was provided as argument
    const bookDirectory = process.argv[2];
    
    if (bookDirectory) {
        updater.updateSingleBook(bookDirectory);
    } else {
        updater.updateAllBooks();
    }
}

module.exports = BookFiguresUpdater;