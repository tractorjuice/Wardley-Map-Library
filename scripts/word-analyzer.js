#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const TextPreprocessor = require('./text-preprocessor');

class WordAnalyzer {
    constructor() {
        this.booksDir = path.join(__dirname, '..', 'books');
        this.preprocessor = new TextPreprocessor();
        this.results = {
            totalBooks: 0,
            processedBooks: 0,
            errors: 0,
            totalWords: 0,
            uniqueWords: new Set(),
            globalFrequency: new Map(),
            bookAnalysis: [],
            categoryAnalysis: new Map(),
            domainAnalysis: {},
            ngramAnalysis: {}
        };
    }

    /**
     * Find all books in the library
     */
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
                        path: fullBookPath,
                        category: this.inferCategory(entry.name)
                    });
                }
            }
        }
        
        console.log(`📚 Found ${books.length} books to analyze`);
        return books;
    }

    /**
     * Infer book category from directory name
     */
    inferCategory(directoryName) {
        const name = directoryName.toLowerCase();
        
        if (name.includes('wardley') || name.includes('mapping')) return 'Strategic Mapping';
        if (name.includes('ai') || name.includes('genai') || name.includes('llm')) return 'Artificial Intelligence';
        if (name.includes('strategy') || name.includes('business')) return 'Business Strategy';
        if (name.includes('government') || name.includes('public')) return 'Government';
        if (name.includes('healthcare') || name.includes('nhs')) return 'Healthcare';
        if (name.includes('sustainability') || name.includes('environment')) return 'Sustainability';
        if (name.includes('security') || name.includes('privacy')) return 'Security';
        if (name.includes('data') || name.includes('science')) return 'Data Science';
        if (name.includes('game') || name.includes('gaming')) return 'Gaming';
        if (name.includes('tech') || name.includes('digital')) return 'Technology';
        
        return 'Other';
    }

    /**
     * Analyze a single book
     */
    async analyzeBook(book) {
        try {
            console.log(`📖 Analyzing: ${book.directory}`);
            
            const bookData = this.preprocessor.processBook(book.path, book.directory);
            
            if (!bookData.processed) {
                this.results.errors++;
                return null;
            }
            
            // Calculate additional metrics
            const frequency = this.preprocessor.createFrequencyMap(bookData.allWords);
            const technicalTerms = this.preprocessor.extractTechnicalTerms(bookData.allWords);
            const domainTerms = this.preprocessor.extractDomainTerms(bookData.allWords);
            const stats = this.getAdvancedStats(bookData.allWords);
            
            const analysis = {
                directory: bookData.directory,
                path: bookData.path,
                wordCount: bookData.wordCount,
                uniqueWords: bookData.uniqueWords,
                // Store only limited words for memory efficiency
                allWords: bookData.allWords.slice(0, 5000), // Limit to first 5000 words
                processed: bookData.processed,
                category: book.category,
                frequency: frequency,
                technicalTerms: technicalTerms,
                domainTerms: domainTerms,
                stats: stats,
                readabilityScore: this.calculateReadabilityScore(bookData.allWords),
                topWords: this.preprocessor.getMostCommonWords(bookData.allWords, 20)
            };
            
            // Update global statistics
            this.updateGlobalStats(analysis);
            
            this.results.processedBooks++;
            this.results.bookAnalysis.push(analysis);
            
            return analysis;
            
        } catch (error) {
            console.error(`❌ Error analyzing ${book.directory}:`, error.message);
            this.results.errors++;
            return null;
        }
    }

    /**
     * Update global statistics
     */
    updateGlobalStats(bookAnalysis) {
        // Update total words
        this.results.totalWords += bookAnalysis.wordCount;
        
        // Update unique words
        bookAnalysis.uniqueWords.forEach(word => {
            this.results.uniqueWords.add(word);
        });
        
        // Update global frequency
        for (const [word, count] of bookAnalysis.frequency) {
            this.results.globalFrequency.set(word, 
                (this.results.globalFrequency.get(word) || 0) + count);
        }
        
        // Update category analysis
        if (!this.results.categoryAnalysis.has(bookAnalysis.category)) {
            this.results.categoryAnalysis.set(bookAnalysis.category, {
                books: 0,
                totalWords: 0,
                uniqueWords: new Set(),
                frequency: new Map(),
                technicalTerms: [],
                domainTerms: {}
            });
        }
        
        const categoryData = this.results.categoryAnalysis.get(bookAnalysis.category);
        categoryData.books++;
        categoryData.totalWords += bookAnalysis.wordCount;
        bookAnalysis.uniqueWords.forEach(word => categoryData.uniqueWords.add(word));
        
        // Update domain analysis
        for (const [domain, terms] of Object.entries(bookAnalysis.domainTerms)) {
            if (!this.results.domainAnalysis[domain]) {
                this.results.domainAnalysis[domain] = new Map();
            }
            
            terms.forEach(term => {
                this.results.domainAnalysis[domain].set(term, 
                    (this.results.domainAnalysis[domain].get(term) || 0) + 1);
            });
        }
    }

    /**
     * Calculate advanced statistics
     */
    getAdvancedStats(words) {
        const frequency = this.preprocessor.createFrequencyMap(words);
        const frequencies = Array.from(frequency.values());
        
        return {
            totalWords: words.length,
            uniqueWords: frequency.size,
            vocabularyRichness: frequency.size / words.length,
            averageWordFrequency: frequencies.reduce((a, b) => a + b, 0) / frequencies.length,
            maxWordFrequency: Math.max(...frequencies),
            minWordFrequency: Math.min(...frequencies),
            wordsUsedOnce: frequencies.filter(f => f === 1).length,
            wordsUsedMultiple: frequencies.filter(f => f > 1).length
        };
    }

    /**
     * Calculate readability score (simplified)
     */
    calculateReadabilityScore(words) {
        const totalWords = words.length;
        const complexWords = words.filter(word => word.length > 6).length;
        const complexWordRatio = complexWords / totalWords;
        
        // Simplified readability score (0-100, higher = more readable)
        return Math.max(0, 100 - (complexWordRatio * 100));
    }

    /**
     * Generate N-grams analysis
     */
    generateNgrams(words, n = 2) {
        const ngrams = new Map();
        
        for (let i = 0; i <= words.length - n; i++) {
            const ngram = words.slice(i, i + n).join(' ');
            ngrams.set(ngram, (ngrams.get(ngram) || 0) + 1);
        }
        
        return ngrams;
    }

    /**
     * Analyze N-grams across all books (memory-efficient)
     */
    analyzeNgrams() {
        console.log('\n🔍 Analyzing N-grams...');
        
        const bigramMap = new Map();
        const trigramMap = new Map();
        
        // Process books in batches to avoid memory issues
        const batchSize = 10;
        for (let i = 0; i < this.results.bookAnalysis.length; i += batchSize) {
            const batch = this.results.bookAnalysis.slice(i, i + batchSize);
            
            batch.forEach(book => {
                // Process only a sample of words to avoid memory issues
                const sampleWords = book.allWords.slice(0, Math.min(book.allWords.length, 5000));
                
                // Generate bigrams
                for (let j = 0; j < sampleWords.length - 1; j++) {
                    const bigram = `${sampleWords[j]} ${sampleWords[j + 1]}`;
                    bigramMap.set(bigram, (bigramMap.get(bigram) || 0) + 1);
                }
                
                // Generate trigrams
                for (let j = 0; j < sampleWords.length - 2; j++) {
                    const trigram = `${sampleWords[j]} ${sampleWords[j + 1]} ${sampleWords[j + 2]}`;
                    trigramMap.set(trigram, (trigramMap.get(trigram) || 0) + 1);
                }
            });
            
            console.log(`   Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(this.results.bookAnalysis.length / batchSize)}`);
        }
        
        this.results.ngramAnalysis = {
            bigrams: bigramMap,
            trigrams: trigramMap
        };
    }

    /**
     * Generate comprehensive report
     */
    generateReport() {
        const report = {
            summary: {
                totalBooks: this.results.totalBooks,
                processedBooks: this.results.processedBooks,
                errors: this.results.errors,
                totalWords: this.results.totalWords,
                uniqueWords: this.results.uniqueWords.size,
                averageWordsPerBook: this.results.totalWords / this.results.processedBooks,
                vocabularyRichness: this.results.uniqueWords.size / this.results.totalWords
            },
            globalFrequency: {
                mostCommon: Array.from(this.results.globalFrequency.entries())
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 100)
                    .map(([word, count]) => ({ word, count })),
                leastCommon: Array.from(this.results.globalFrequency.entries())
                    .sort((a, b) => a[1] - b[1])
                    .slice(0, 50)
                    .map(([word, count]) => ({ word, count }))
            },
            categoryAnalysis: Array.from(this.results.categoryAnalysis.entries())
                .map(([category, data]) => ({
                    category,
                    books: data.books,
                    totalWords: data.totalWords,
                    uniqueWords: data.uniqueWords.size,
                    averageWordsPerBook: data.totalWords / data.books,
                    vocabularyRichness: data.uniqueWords.size / data.totalWords
                }))
                .sort((a, b) => b.totalWords - a.totalWords),
            domainAnalysis: Object.fromEntries(
                Object.entries(this.results.domainAnalysis).map(([domain, termMap]) => [
                    domain,
                    Array.from(termMap.entries())
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 20)
                        .map(([term, count]) => ({ term, count }))
                ])
            ),
            ngramAnalysis: {
                topBigrams: Array.from(this.results.ngramAnalysis.bigrams?.entries() || [])
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 50)
                    .map(([bigram, count]) => ({ bigram, count })),
                topTrigrams: Array.from(this.results.ngramAnalysis.trigrams?.entries() || [])
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 30)
                    .map(([trigram, count]) => ({ trigram, count }))
            },
            bookRankings: {
                byWordCount: this.results.bookAnalysis
                    .sort((a, b) => b.wordCount - a.wordCount)
                    .slice(0, 20)
                    .map(book => ({
                        directory: book.directory,
                        category: book.category,
                        wordCount: book.wordCount,
                        uniqueWords: book.uniqueWords.length,
                        readabilityScore: book.readabilityScore
                    })),
                byVocabularyRichness: this.results.bookAnalysis
                    .sort((a, b) => b.stats.vocabularyRichness - a.stats.vocabularyRichness)
                    .slice(0, 20)
                    .map(book => ({
                        directory: book.directory,
                        category: book.category,
                        vocabularyRichness: book.stats.vocabularyRichness,
                        uniqueWords: book.uniqueWords.length,
                        readabilityScore: book.readabilityScore
                    })),
                byReadability: this.results.bookAnalysis
                    .sort((a, b) => b.readabilityScore - a.readabilityScore)
                    .slice(0, 20)
                    .map(book => ({
                        directory: book.directory,
                        category: book.category,
                        readabilityScore: book.readabilityScore,
                        wordCount: book.wordCount,
                        uniqueWords: book.uniqueWords.length
                    }))
            }
        };
        
        return report;
    }

    /**
     * Save results to files
     */
    async saveResults(report) {
        const outputDir = path.join(__dirname, '..', 'analysis-results');
        
        // Create output directory if it doesn't exist
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Save comprehensive report
        const reportPath = path.join(outputDir, 'word-analysis-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        // Save detailed book analysis
        const bookAnalysisPath = path.join(outputDir, 'book-analysis-detailed.json');
        fs.writeFileSync(bookAnalysisPath, JSON.stringify(this.results.bookAnalysis, null, 2));
        
        // Save global frequency as CSV
        const csvPath = path.join(outputDir, 'global-word-frequency.csv');
        const csvContent = 'word,frequency\n' + 
            Array.from(this.results.globalFrequency.entries())
                .sort((a, b) => b[1] - a[1])
                .map(([word, count]) => `${word},${count}`)
                .join('\n');
        fs.writeFileSync(csvPath, csvContent);
        
        console.log(`\n📊 Results saved to:`);
        console.log(`   - ${reportPath}`);
        console.log(`   - ${bookAnalysisPath}`);
        console.log(`   - ${csvPath}`);
        
        return outputDir;
    }

    /**
     * Main analysis function
     */
    async analyze() {
        console.log('🚀 Starting comprehensive word analysis...\n');
        
        const books = await this.findAllBooks();
        this.results.totalBooks = books.length;
        
        // Analyze each book
        for (const book of books) {
            await this.analyzeBook(book);
        }
        
        // Generate N-grams analysis
        this.analyzeNgrams();
        
        // Generate comprehensive report
        const report = this.generateReport();
        
        // Save results
        await this.saveResults(report);
        
        // Display summary
        this.displaySummary(report);
        
        return report;
    }

    /**
     * Display analysis summary
     */
    displaySummary(report) {
        console.log('\n🎯 WORD ANALYSIS SUMMARY\n');
        
        console.log('📚 Library Overview:');
        console.log(`   Total books: ${report.summary.totalBooks}`);
        console.log(`   Processed successfully: ${report.summary.processedBooks}`);
        console.log(`   Errors: ${report.summary.errors}`);
        
        console.log('\n📊 Word Statistics:');
        console.log(`   Total words: ${report.summary.totalWords.toLocaleString()}`);
        console.log(`   Unique words: ${report.summary.uniqueWords.toLocaleString()}`);
        console.log(`   Average words per book: ${Math.round(report.summary.averageWordsPerBook).toLocaleString()}`);
        console.log(`   Vocabulary richness: ${(report.summary.vocabularyRichness * 100).toFixed(2)}%`);
        
        console.log('\n🏆 Most Common Words:');
        report.globalFrequency.mostCommon.slice(0, 15).forEach((item, index) => {
            console.log(`   ${index + 1}. ${item.word}: ${item.count.toLocaleString()}`);
        });
        
        console.log('\n📂 Category Analysis:');
        report.categoryAnalysis.slice(0, 10).forEach(cat => {
            console.log(`   ${cat.category}: ${cat.books} books, ${cat.totalWords.toLocaleString()} words`);
        });
        
        console.log('\n🔍 Top Bigrams:');
        report.ngramAnalysis.topBigrams.slice(0, 10).forEach((item, index) => {
            console.log(`   ${index + 1}. "${item.bigram}": ${item.count}`);
        });
        
        console.log('\n📚 Largest Books:');
        report.bookRankings.byWordCount.slice(0, 5).forEach((book, index) => {
            console.log(`   ${index + 1}. ${book.directory}: ${book.wordCount.toLocaleString()} words`);
        });
    }
}

// Run the analyzer
if (require.main === module) {
    const analyzer = new WordAnalyzer();
    analyzer.analyze().then(() => {
        console.log('\n✅ Word analysis complete!');
        process.exit(0);
    }).catch(error => {
        console.error('❌ Error during analysis:', error);
        process.exit(1);
    });
}

module.exports = WordAnalyzer;