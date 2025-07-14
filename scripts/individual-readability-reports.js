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

        // More reasonable thresholds with tolerance bands
        const referenceThresholds = {
            sentenceLength: 18.7,  // Reference book average
            vocabularyComplexity: 0.120,  // Reference book complexity
            fleschScore: 52.5  // Reference book Flesch score
        };

        // Sentence length recommendations - only flag if significantly above reference
        const sentenceLength = analysis.sentenceAnalysis?.avgWordsPerSentence || 0;
        if (sentenceLength > referenceThresholds.sentenceLength * 1.3) {  // 30% above reference
            recommendations.push({
                category: 'Sentence Structure',
                priority: 'High',
                issue: `Average sentence length is ${sentenceLength.toFixed(1)} words`,
                recommendation: 'Break long sentences into shorter ones. Aim for 12-18 words per sentence.',
                impact: 'High - Shorter sentences significantly improve readability'
            });
        } else if (sentenceLength > referenceThresholds.sentenceLength * 1.15) {  // 15% above reference
            recommendations.push({
                category: 'Sentence Structure',
                priority: 'Medium',
                issue: `Average sentence length is ${sentenceLength.toFixed(1)} words`,
                recommendation: 'Consider breaking some longer sentences into shorter ones for better flow.',
                impact: 'Medium - Shorter sentences improve readability'
            });
        }

        // Vocabulary complexity recommendations - only flag if significantly above reference
        const vocabularyComplexity = analysis.vocabularyComplexity?.complexityScore || 0;
        if (vocabularyComplexity > referenceThresholds.vocabularyComplexity * 1.4) {  // 40% above reference
            recommendations.push({
                category: 'Vocabulary',
                priority: 'High',
                issue: `Vocabulary complexity score: ${(vocabularyComplexity * 100).toFixed(1)}%`,
                recommendation: 'Replace technical terms with simpler alternatives where possible. Add definitions for necessary jargon.',
                impact: 'High - Simpler vocabulary makes content accessible to wider audience'
            });
        } else if (vocabularyComplexity > referenceThresholds.vocabularyComplexity * 1.2) {  // 20% above reference
            recommendations.push({
                category: 'Vocabulary',
                priority: 'Medium',
                issue: `Vocabulary complexity score: ${(vocabularyComplexity * 100).toFixed(1)}%`,
                recommendation: 'Consider simplifying some technical terms where context allows.',
                impact: 'Medium - Simpler vocabulary improves accessibility'
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

        // Reading flow recommendations - only flag if significantly below reference
        const fleschScore = analysis.readabilityMetrics?.fleschScore || 0;
        if (fleschScore < referenceThresholds.fleschScore * 0.6) {  // 40% below reference
            recommendations.push({
                category: 'Reading Flow',
                priority: 'High',
                issue: `Flesch Reading Ease score: ${fleschScore.toFixed(1)}`,
                recommendation: 'Focus on shorter sentences and simpler words. Consider adding examples and analogies.',
                impact: 'High - Improving flow makes content much more accessible'
            });
        } else if (fleschScore < referenceThresholds.fleschScore * 0.8) {  // 20% below reference
            recommendations.push({
                category: 'Reading Flow',
                priority: 'Medium',
                issue: `Flesch Reading Ease score: ${fleschScore.toFixed(1)}`,
                recommendation: 'Consider adding more examples and shorter explanations to improve flow.',
                impact: 'Medium - Improving flow enhances readability'
            });
        }

        return recommendations;
    }

    identifyImprovementPriorities(analysis) {
        const priorities = [];

        // More reasonable thresholds aligned with recommendations
        const referenceThresholds = {
            sentenceLength: 18.7,
            vocabularyComplexity: 0.120,
            fleschScore: 52.5
        };

        // Calculate priority scores with more reasonable thresholds
        const sentenceLength = analysis.sentenceAnalysis?.avgWordsPerSentence || 0;
        const sentenceScore = sentenceLength > referenceThresholds.sentenceLength * 1.3 ? 10 : 
                             sentenceLength > referenceThresholds.sentenceLength * 1.15 ? 6 : 0;
        
        const vocabularyComplexity = analysis.vocabularyComplexity?.complexityScore || 0;
        const vocabularyScore = vocabularyComplexity > referenceThresholds.vocabularyComplexity * 1.4 ? 9 : 
                               vocabularyComplexity > referenceThresholds.vocabularyComplexity * 1.2 ? 5 : 0;
        
        const fleschScore = analysis.readabilityMetrics?.fleschScore || 0;
        const fleschScoreValue = fleschScore < referenceThresholds.fleschScore * 0.6 ? 8 : 
                                fleschScore < referenceThresholds.fleschScore * 0.8 ? 4 : 0;
        
        const structureScore = (analysis.structurePatterns.headers + analysis.structurePatterns.subheaders) < (analysis.wordCount / 1000) ? 7 : 
                              (analysis.structurePatterns.headers + analysis.structurePatterns.subheaders) < (analysis.wordCount / 800) ? 4 : 0;
        
        const passiveVoiceRatio = (analysis.sentenceAnalysis?.passiveVoice / analysis.sentenceAnalysis?.totalSentences) || 0;
        const passiveScore = passiveVoiceRatio > 0.25 ? 6 : 
                            passiveVoiceRatio > 0.15 ? 3 : 0;

        const priorityItems = [
            { priority: sentenceScore >= 10 ? 'Critical' : 'High', score: sentenceScore, item: 'Shorten long sentences' },
            { priority: vocabularyScore >= 9 ? 'Critical' : 'High', score: vocabularyScore, item: 'Simplify vocabulary' },
            { priority: fleschScoreValue >= 8 ? 'High' : 'Medium', score: fleschScoreValue, item: 'Improve reading flow' },
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
        
        // Helper function to determine if a score is within reasonable range of reference
        function getComparison(bookScore, referenceScore, higherIsBetter = true) {
            if (isReferenceBook) return 'Reference Standard';
            
            const tolerance = 0.10; // 10% tolerance for more reasonable comparisons
            const diff = Math.abs(bookScore - referenceScore) / referenceScore;
            
            if (diff <= tolerance) {
                return 'Good'; // Within 10% of reference
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