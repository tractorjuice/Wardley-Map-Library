#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const ReadabilityAnalyzer = require('./readability-analyzer');

class IndividualReadabilityReports {
    constructor() {
        this.analyzer = new ReadabilityAnalyzer();
        this.outputDir = path.join(__dirname, '..', 'analysis-results', 'individual-reports');
    }

    async generateAllReports() {
        console.log('🚀 Starting individual book readability report generation...\n');
        
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
        const reportData = {
            bookId: this.createBookId(analysis.directory),
            directory: analysis.directory,
            title: this.createBookTitle(analysis.directory),
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
            benchmarks: this.generateBenchmarks(analysis)
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

    createBookTitle(directory) {
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

        // Sentence length recommendations
        if (analysis.sentenceAnalysis.avgWordsPerSentence > 20) {
            recommendations.push({
                category: 'Sentence Structure',
                priority: 'High',
                issue: `Average sentence length is ${analysis.sentenceAnalysis.avgWordsPerSentence.toFixed(1)} words`,
                recommendation: 'Break long sentences into shorter ones. Aim for 12-18 words per sentence.',
                impact: 'High - Shorter sentences significantly improve readability'
            });
        }

        // Vocabulary complexity recommendations
        if (analysis.vocabularyComplexity.complexityScore > 0.15) {
            recommendations.push({
                category: 'Vocabulary',
                priority: 'High',
                issue: `High vocabulary complexity score: ${(analysis.vocabularyComplexity.complexityScore * 100).toFixed(1)}%`,
                recommendation: 'Replace technical terms with simpler alternatives where possible. Add definitions for necessary jargon.',
                impact: 'High - Simpler vocabulary makes content accessible to wider audience'
            });
        }

        // Structure recommendations
        if (analysis.structurePatterns.headers + analysis.structurePatterns.subheaders < analysis.wordCount / 500) {
            recommendations.push({
                category: 'Structure',
                priority: 'Medium',
                issue: 'Insufficient headers and subheaders for content length',
                recommendation: 'Add more headings to break up content. Aim for 1 header per 200-400 words.',
                impact: 'Medium - Better structure improves navigation and comprehension'
            });
        }

        // Passive voice recommendations
        if (analysis.sentenceAnalysis.passiveVoice / analysis.sentenceAnalysis.totalSentences > 0.25) {
            recommendations.push({
                category: 'Writing Style',
                priority: 'Medium',
                issue: `${((analysis.sentenceAnalysis.passiveVoice / analysis.sentenceAnalysis.totalSentences) * 100).toFixed(1)}% passive voice usage`,
                recommendation: 'Convert passive voice to active voice where possible. Active voice is more engaging and clearer.',
                impact: 'Medium - Active voice improves clarity and engagement'
            });
        }

        // Reading flow recommendations
        if (analysis.readabilityMetrics.fleschScore < 30) {
            recommendations.push({
                category: 'Reading Flow',
                priority: 'High',
                issue: `Very low Flesch Reading Ease score: ${analysis.readabilityMetrics.fleschScore.toFixed(1)}`,
                recommendation: 'Focus on shorter sentences and simpler words. Consider adding examples and analogies.',
                impact: 'High - Improving flow makes content much more accessible'
            });
        }

        return recommendations;
    }

    identifyImprovementPriorities(analysis) {
        const priorities = [];

        // Calculate priority scores
        const sentenceScore = analysis.sentenceAnalysis.avgWordsPerSentence > 20 ? 10 : 0;
        const vocabularyScore = analysis.vocabularyComplexity.complexityScore > 0.15 ? 9 : 0;
        const fleschScore = analysis.readabilityMetrics.fleschScore < 30 ? 8 : 0;
        const structureScore = (analysis.structurePatterns.headers + analysis.structurePatterns.subheaders) < (analysis.wordCount / 500) ? 7 : 0;
        const passiveScore = (analysis.sentenceAnalysis.passiveVoice / analysis.sentenceAnalysis.totalSentences) > 0.25 ? 6 : 0;

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

    generateBenchmarks(analysis) {
        // Using Wardley Mapping eBook (May 2024 v1.8) as baseline - a well-written, accessible strategic text
        const libraryAverages = {
            overallScore: 38.35,
            fleschScore: 20.87,
            sentenceLength: 10.23,
            complexityScore: 0.119
        };

        return {
            overallScore: {
                bookScore: analysis.overallScore,
                libraryAverage: libraryAverages.overallScore,
                comparison: analysis.overallScore > libraryAverages.overallScore ? 'Above Average' : 'Below Average',
                percentile: this.calculatePercentile(analysis.overallScore, libraryAverages.overallScore)
            },
            fleschScore: {
                bookScore: analysis.readabilityMetrics.fleschScore,
                libraryAverage: libraryAverages.fleschScore,
                comparison: analysis.readabilityMetrics.fleschScore > libraryAverages.fleschScore ? 'Above Average' : 'Below Average'
            },
            sentenceLength: {
                bookScore: analysis.readabilityMetrics.avgSentenceLength,
                libraryAverage: libraryAverages.sentenceLength,
                comparison: analysis.readabilityMetrics.avgSentenceLength < libraryAverages.sentenceLength ? 'Better' : 'Worse'
            },
            vocabularyComplexity: {
                bookScore: analysis.vocabularyComplexity.complexityScore,
                libraryAverage: libraryAverages.complexityScore,
                comparison: analysis.vocabularyComplexity.complexityScore < libraryAverages.complexityScore ? 'Simpler' : 'More Complex'
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