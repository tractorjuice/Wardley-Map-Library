#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const ReadabilityAnalyzer = require('./readability-analyzer');

class IndividualReadabilityReports {
    constructor() {
        this.analyzer = new ReadabilityAnalyzer();
        this.outputDir = path.join(__dirname, '..', 'analysis-results', 'individual-reports');
        this.booksManifest = null;
    }

    async generateAllReports() {
        console.log('🚀 Starting individual book readability report generation...\n');
        
        // Load books manifest for proper titles
        await this.loadBooksManifest();
        
        // Ensure output directory exists
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }

        const books = await this.analyzer.findAllBooks();
        const reports = [];

        for (const book of books) {
            console.log(`📖 Generating report for: ${book.directory}`);
            
            const analysis = await this.analyzer.analyzeBook(book);
            if (analysis) {
                const report = await this.generateIndividualReport(analysis);
                reports.push(report);
            }
        }

        // Create index of all reports
        await this.createReportsIndex(reports);

        console.log(`\n✅ Generated ${reports.length} individual readability reports`);
        console.log(`📁 Reports saved to: ${this.outputDir}`);
        
        return reports;
    }

    async generateIndividualReport(analysis) {
        const bookId = this.createBookId(analysis.directory);
        const properTitle = this.getProperTitle(bookId, analysis.directory);
        
        const reportData = {
            bookId: bookId,
            directory: analysis.directory,
            title: properTitle,
            category: analysis.category,
            generatedAt: new Date().toISOString(),
            
            // Summary metrics
            summary: {
                overallScore: analysis.overallScore,
                readabilityGrade: this.getReadabilityGrade(analysis.overallScore),
                wordCount: analysis.wordCount,
                estimatedReadingTime: Math.ceil(analysis.wordCount / 200) // 200 words per minute
            },

            // Detailed analysis
            readabilityMetrics: analysis.readabilityMetrics,
            sentenceAnalysis: analysis.sentenceAnalysis,
            vocabularyComplexity: analysis.vocabularyComplexity,
            structurePatterns: analysis.structurePatterns,

            // Specific recommendations
            recommendations: this.generateRecommendations(analysis),
            
            // Improvement priorities
            improvementPriorities: this.identifyImprovementPriorities(analysis),
            
            // Comparison with library average
            benchmarks: this.generateBenchmarks(analysis, bookId)
        };

        // Save individual report
        const reportPath = path.join(this.outputDir, `${reportData.bookId}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));

        return reportData;
    }

    createBookId(directory) {
        return directory.toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }

    async loadBooksManifest() {
        try {
            const manifestPath = path.join(__dirname, '..', 'books.json');
            const manifestContent = fs.readFileSync(manifestPath, 'utf8');
            this.booksManifest = JSON.parse(manifestContent);
        } catch (error) {
            console.warn('Warning: Could not load books manifest. Using directory names for titles.');
            this.booksManifest = null;
        }
    }

    getProperTitle(bookId, directory) {
        // First try to get title from manifest
        if (this.booksManifest && this.booksManifest.books) {
            const book = this.booksManifest.books.find(b => b.id === bookId);
            if (book && book.title) {
                return book.title;
            }
        }
        
        // Fallback to directory name conversion
        return this.createBookTitleFromDirectory(directory);
    }

    createBookTitleFromDirectory(directory) {
        return directory
            .replace(/_+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .replace(/\b\w/g, l => l.toUpperCase());
    }

    getReadabilityGrade(score) {
        if (score >= 90) return 'Excellent';
        if (score >= 70) return 'Good';
        if (score >= 50) return 'Average';
        if (score >= 30) return 'Below Average';
        if (score >= 15) return 'Poor';
        return 'Very Poor';
    }

    generateRecommendations(analysis) {
        const recommendations = [];

        // Sentence length recommendations - use reference book threshold (18.692983606557377)
        if (analysis.sentenceAnalysis.avgWordsPerSentence > 18.692983606557377) {
            const priority = analysis.sentenceAnalysis.avgWordsPerSentence > 25 ? 'High' : 'Medium';
            recommendations.push({
                category: 'Sentence Structure',
                priority: priority,
                issue: `Average sentence length is ${analysis.sentenceAnalysis.avgWordsPerSentence.toFixed(1)} words`,
                recommendation: 'Break long sentences into shorter ones. Aim for 12-18 words per sentence.',
                impact: priority === 'High' ? 'High - Shorter sentences significantly improve readability' : 'Medium - Shorter sentences improve readability'
            });
        }

        // Vocabulary complexity recommendations - use reference book threshold (0.11992600833053062)
        if (analysis.vocabularyComplexity.complexityScore > 0.11992600833053062) {
            const priority = analysis.vocabularyComplexity.complexityScore > 0.15 ? 'High' : 'Medium';
            recommendations.push({
                category: 'Vocabulary',
                priority: priority,
                issue: `Vocabulary complexity score: ${(analysis.vocabularyComplexity.complexityScore * 100).toFixed(1)}%`,
                recommendation: 'Replace technical terms with simpler alternatives where possible. Add definitions for necessary jargon.',
                impact: priority === 'High' ? 'High - Simpler vocabulary makes content accessible to wider audience' : 'Medium - Simpler vocabulary improves accessibility'
            });
        }

        // Structure recommendations - more sensitive threshold
        if (analysis.structurePatterns.headers + analysis.structurePatterns.subheaders < analysis.wordCount / 800) {
            recommendations.push({
                category: 'Structure',
                priority: 'Medium',
                issue: 'Could benefit from more headers and subheaders',
                recommendation: 'Add more headings to break up content. Aim for 1 header per 500-800 words.',
                impact: 'Medium - Better structure improves navigation and comprehension'
            });
        }

        // Passive voice recommendations - more sensitive threshold
        if (analysis.sentenceAnalysis.passiveVoice / analysis.sentenceAnalysis.totalSentences > 0.15) {
            const priority = (analysis.sentenceAnalysis.passiveVoice / analysis.sentenceAnalysis.totalSentences) > 0.25 ? 'High' : 'Medium';
            recommendations.push({
                category: 'Writing Style',
                priority: priority,
                issue: `${((analysis.sentenceAnalysis.passiveVoice / analysis.sentenceAnalysis.totalSentences) * 100).toFixed(1)}% passive voice usage`,
                recommendation: 'Convert passive voice to active voice where possible. Active voice is more engaging and clearer.',
                impact: priority === 'High' ? 'High - Active voice improves clarity and engagement' : 'Medium - Active voice improves clarity'
            });
        }

        // Reading flow recommendations - use reference book threshold (52.47752381005441)
        if (analysis.readabilityMetrics.fleschScore < 52.47752381005441) {
            const priority = analysis.readabilityMetrics.fleschScore < 30 ? 'High' : 'Medium';
            recommendations.push({
                category: 'Reading Flow',
                priority: priority,
                issue: `Flesch Reading Ease score: ${analysis.readabilityMetrics.fleschScore.toFixed(1)}`,
                recommendation: 'Focus on shorter sentences and simpler words. Consider adding examples and analogies.',
                impact: priority === 'High' ? 'High - Improving flow makes content much more accessible' : 'Medium - Improving flow enhances readability'
            });
        }

        return recommendations;
    }

    identifyImprovementPriorities(analysis) {
        const priorities = [];

        // Calculate priority scores with reference book thresholds
        const sentenceScore = analysis.sentenceAnalysis.avgWordsPerSentence > 25 ? 10 : 
                             analysis.sentenceAnalysis.avgWordsPerSentence > 18.692983606557377 ? 7 : 0;
        const vocabularyScore = analysis.vocabularyComplexity.complexityScore > 0.15 ? 9 : 
                               analysis.vocabularyComplexity.complexityScore > 0.11992600833053062 ? 6 : 0;
        const fleschScore = analysis.readabilityMetrics.fleschScore < 30 ? 8 : 
                           analysis.readabilityMetrics.fleschScore < 52.47752381005441 ? 5 : 0;
        const structureScore = (analysis.structurePatterns.headers + analysis.structurePatterns.subheaders) < (analysis.wordCount / 1000) ? 7 : 
                              (analysis.structurePatterns.headers + analysis.structurePatterns.subheaders) < (analysis.wordCount / 800) ? 4 : 0;
        const passiveScore = (analysis.sentenceAnalysis.passiveVoice / analysis.sentenceAnalysis.totalSentences) > 0.25 ? 6 : 
                            (analysis.sentenceAnalysis.passiveVoice / analysis.sentenceAnalysis.totalSentences) > 0.15 ? 3 : 0;

        const priorityItems = [
            { priority: 'Critical', score: sentenceScore, item: 'Shorten long sentences' },
            { priority: 'Critical', score: vocabularyScore, item: 'Simplify vocabulary' },
            { priority: 'High', score: fleschScore, item: 'Improve reading flow' },
            { priority: 'Medium', score: structureScore, item: 'Add more structure' },
            { priority: 'Medium', score: passiveScore, item: 'Reduce passive voice' }
        ];

        return priorityItems
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score);
    }

    generateBenchmarks(analysis, bookId) {
        // Using Wardley Mapping eBook (May 2024 v1.8) as reference benchmark
        // This is a well-written, accessible strategic text that serves as our quality standard
        const referenceBenchmark = {
            overallScore: 50.99,
            fleschScore: 52.48,
            fleschKincaidGrade: 10.58,
            fogIndex: 14.02,
            smogIndex: 13.12,
            ariIndex: 10.48,
            cliIndex: 10.78,
            sentenceLength: 18.69,
            complexityScore: 0.120
        };

        // Check if this is the reference book itself
        const isReferenceBook = bookId === 'wardley-mapping-the-knowledge-part-one-topographical-intelligence-in-business';
        
        // Helper function to determine if a score is within 3% of reference (considered "good")
        function getComparison(bookScore, referenceScore, higherIsBetter = true) {
            if (isReferenceBook) return 'Reference Standard';
            
            const tolerance = 0.03; // 3% tolerance
            const diff = Math.abs(bookScore - referenceScore) / referenceScore;
            
            if (diff <= tolerance) {
                return 'Good'; // Within 3% of reference
            }
            
            if (higherIsBetter) {
                return bookScore > referenceScore ? 'Above Reference' : 'Below Reference';
            } else {
                return bookScore < referenceScore ? 'Better' : 'Worse';
            }
        }

        return {
            overallScore: {
                bookScore: analysis.overallScore,
                referenceBenchmark: referenceBenchmark.overallScore,
                comparison: getComparison(analysis.overallScore, referenceBenchmark.overallScore, true),
                percentile: this.calculatePercentile(analysis.overallScore, referenceBenchmark.overallScore)
            },
            fleschScore: {
                bookScore: analysis.readabilityMetrics.fleschScore,
                referenceBenchmark: referenceBenchmark.fleschScore,
                comparison: getComparison(analysis.readabilityMetrics.fleschScore, referenceBenchmark.fleschScore, true)
            },
            sentenceLength: {
                bookScore: analysis.readabilityMetrics.avgSentenceLength,
                referenceBenchmark: referenceBenchmark.sentenceLength,
                comparison: getComparison(analysis.readabilityMetrics.avgSentenceLength, referenceBenchmark.sentenceLength, false)
            },
            vocabularyComplexity: {
                bookScore: analysis.vocabularyComplexity.complexityScore,
                referenceBenchmark: referenceBenchmark.complexityScore,
                comparison: getComparison(analysis.vocabularyComplexity.complexityScore, referenceBenchmark.complexityScore, false)
            }
        };
    }

    calculatePercentile(score, average) {
        // Simple percentile calculation - in reality this would use the full distribution
        const ratio = score / average;
        if (ratio > 2) return 95;
        if (ratio > 1.5) return 80;
        if (ratio > 1.2) return 70;
        if (ratio > 1.0) return 60;
        if (ratio > 0.8) return 40;
        if (ratio > 0.6) return 30;
        if (ratio > 0.4) return 20;
        return 10;
    }

    async createReportsIndex(reports) {
        const index = {
            totalReports: reports.length,
            generatedAt: new Date().toISOString(),
            reports: reports.map(report => ({
                bookId: report.bookId,
                directory: report.directory,
                title: report.title,
                category: report.category,
                overallScore: report.summary.overallScore,
                readabilityGrade: report.summary.readabilityGrade,
                wordCount: report.summary.wordCount,
                estimatedReadingTime: report.summary.estimatedReadingTime,
                topIssues: report.improvementPriorities.slice(0, 3).map(p => p.item)
            })).sort((a, b) => b.overallScore - a.overallScore)
        };

        const indexPath = path.join(this.outputDir, 'index.json');
        fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));

        console.log(`📄 Reports index created: ${indexPath}`);
        return index;
    }
}

// Run the report generator
if (require.main === module) {
    const generator = new IndividualReadabilityReports();
    generator.generateAllReports().then(reports => {
        console.log('\n✅ Individual readability reports generation complete!');
        process.exit(0);
    }).catch(error => {
        console.error('❌ Error during report generation:', error);
        process.exit(1);
    });
}

module.exports = IndividualReadabilityReports;