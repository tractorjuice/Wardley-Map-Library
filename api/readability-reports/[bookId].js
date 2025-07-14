/**
 * Individual Book Readability Report API Endpoint
 * 
 * Returns detailed readability analysis for a specific book:
 * - Complete readability metrics (all 6 formulas)
 * - Sentence analysis (length, complexity, passive voice)
 * - Vocabulary complexity assessment
 * - Structure patterns (headers, lists, paragraphs)
 * - Improvement recommendations with priorities
 * - Library benchmarking and percentile ranking
 * 
 * Readability metrics included:
 * - fleschScore: Flesch Reading Ease (0-100)
 * - fleschKincaidGrade: Flesch-Kincaid Grade Level
 * - fogIndex: Gunning Fog Index
 * - smogIndex: SMOG Index
 * - ariIndex: Automated Readability Index  
 * - cliIndex: Coleman-Liau Index
 * 
 * Endpoint: GET /api/readability-reports/[bookId]
 * Parameters: bookId (string) - URL-safe book identifier
 * Response: JSON with detailed book analysis
 */

const fs = require('fs');
const path = require('path');

export default async function handler(req, res) {
    try {
        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        
        if (req.method === 'OPTIONS') {
            res.status(200).end();
            return;
        }
        
        if (req.method !== 'GET') {
            res.status(405).json({ error: 'Method not allowed' });
            return;
        }
        
        const { bookId } = req.query;
        
        if (!bookId) {
            res.status(400).json({ error: 'Book ID is required' });
            return;
        }
        
        // Path to the individual report
        const reportPath = path.join(process.cwd(), 'analysis-results', 'individual-reports', `${bookId}.json`);
        
        // Check if report exists
        if (!fs.existsSync(reportPath)) {
            // Try to find the book in the main analysis and generate report on-demand
            const mainAnalysisPath = path.join(process.cwd(), 'analysis-results', 'readability-analysis.json');
            
            if (fs.existsSync(mainAnalysisPath)) {
                const mainAnalysis = JSON.parse(fs.readFileSync(mainAnalysisPath, 'utf8'));
                
                // Find the book in the main analysis
                const bookData = findBookInAnalysis(mainAnalysis, bookId);
                if (bookData) {
                    const individualReport = generateIndividualReport(bookData, bookId);
                    res.status(200).json(individualReport);
                    return;
                }
            }
            
            res.status(404).json({ 
                error: 'Readability report not found for this book',
                bookId: bookId,
                suggestion: 'Please run the individual reports generator first'
            });
            return;
        }
        
        // Read the report data
        const reportData = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
        
        // Add metadata
        const response = {
            ...reportData,
            metadata: {
                generatedAt: fs.statSync(reportPath).mtime,
                version: '1.0.0',
                endpoint: `/api/readability-reports/${bookId}`
            }
        };
        
        res.status(200).json(response);
        
    } catch (error) {
        console.error('Error serving individual readability report:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message,
            bookId: req.query.bookId
        });
    }
}

function findBookInAnalysis(mainAnalysis, bookId) {
    // Search in most readable books
    let book = mainAnalysis.bookRankings?.mostReadable?.find(b => 
        createBookId(b.directory) === bookId
    );
    
    if (!book) {
        // Search in least readable books
        book = mainAnalysis.bookRankings?.leastReadable?.find(b => 
            createBookId(b.directory) === bookId
        );
    }
    
    return book;
}

function createBookId(directory) {
    return directory.toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

function createBookTitle(directory) {
    return directory
        .replace(/_+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b\w/g, l => l.toUpperCase());
}

function getReadabilityGrade(score) {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Average';
    if (score >= 30) return 'Below Average';
    if (score >= 15) return 'Poor';
    return 'Very Poor';
}

function generateRecommendations(analysis) {
    const recommendations = [];

    // Sentence length recommendations
    if (analysis.sentenceAnalysis?.avgWordsPerSentence > 20) {
        recommendations.push({
            category: 'Sentence Structure',
            priority: 'High',
            issue: `Average sentence length is ${analysis.sentenceAnalysis.avgWordsPerSentence.toFixed(1)} words`,
            recommendation: 'Break long sentences into shorter ones. Aim for 12-18 words per sentence.',
            impact: 'High - Shorter sentences significantly improve readability'
        });
    }

    // Vocabulary complexity recommendations
    if (analysis.vocabularyComplexity?.complexityScore > 0.15) {
        recommendations.push({
            category: 'Vocabulary',
            priority: 'High',
            issue: `High vocabulary complexity score: ${(analysis.vocabularyComplexity.complexityScore * 100).toFixed(1)}%`,
            recommendation: 'Replace technical terms with simpler alternatives where possible. Add definitions for necessary jargon.',
            impact: 'High - Simpler vocabulary makes content accessible to wider audience'
        });
    }

    // Reading flow recommendations
    if (analysis.readabilityMetrics?.fleschScore < 30) {
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

function generateIndividualReport(bookData, bookId) {
    const reportData = {
        bookId: bookId,
        directory: bookData.directory,
        title: createBookTitle(bookData.directory),
        category: bookData.category,
        generatedAt: new Date().toISOString(),
        
        // Summary metrics
        summary: {
            overallScore: bookData.overallScore || 0,
            readabilityGrade: getReadabilityGrade(bookData.overallScore || 0),
            wordCount: bookData.wordCount || 0,
            estimatedReadingTime: Math.ceil((bookData.wordCount || 0) / 200) // 200 words per minute
        },

        // Detailed analysis
        readabilityMetrics: bookData.readabilityMetrics || {},
        sentenceAnalysis: bookData.sentenceAnalysis || {},
        vocabularyComplexity: bookData.vocabularyComplexity || {},
        structurePatterns: bookData.structurePatterns || {},

        // Specific recommendations
        recommendations: generateRecommendations(bookData),
        
        // Improvement priorities
        improvementPriorities: identifyImprovementPriorities(bookData),
        
        // Comparison with library average
        benchmarks: generateBenchmarks(bookData)
    };

    return reportData;
}

function identifyImprovementPriorities(analysis) {
    const priorities = [];

    // Calculate priority scores
    const sentenceScore = analysis.sentenceAnalysis?.avgWordsPerSentence > 20 ? 10 : 0;
    const vocabularyScore = analysis.vocabularyComplexity?.complexityScore > 0.15 ? 9 : 0;
    const fleschScore = analysis.readabilityMetrics?.fleschScore < 30 ? 8 : 0;
    const passiveScore = (analysis.sentenceAnalysis?.passiveVoice / analysis.sentenceAnalysis?.totalSentences) > 0.25 ? 6 : 0;

    const priorityItems = [
        { priority: 'Critical', score: sentenceScore, item: 'Shorten long sentences' },
        { priority: 'Critical', score: vocabularyScore, item: 'Simplify vocabulary' },
        { priority: 'High', score: fleschScore, item: 'Improve reading flow' },
        { priority: 'Medium', score: passiveScore, item: 'Reduce passive voice' }
    ];

    return priorityItems
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score);
}

function generateBenchmarks(analysis) {
    // Using Wardley Mapping eBook (May 2024 v1.8) as baseline - a well-written, accessible strategic text
    const libraryAverages = {
        overallScore: 50.99,
        fleschScore: 52.48,
        sentenceLength: 18.69,
        complexityScore: 0.120
    };

    return {
        overallScore: {
            bookScore: analysis.overallScore || 0,
            libraryAverage: libraryAverages.overallScore,
            comparison: (analysis.overallScore || 0) > libraryAverages.overallScore ? 'Above Average' : 'Below Average'
        },
        fleschScore: {
            bookScore: analysis.readabilityMetrics?.fleschScore || 0,
            libraryAverage: libraryAverages.fleschScore,
            comparison: (analysis.readabilityMetrics?.fleschScore || 0) > libraryAverages.fleschScore ? 'Above Average' : 'Below Average'
        },
        sentenceLength: {
            bookScore: analysis.readabilityMetrics?.avgSentenceLength || 0,
            libraryAverage: libraryAverages.sentenceLength,
            comparison: (analysis.readabilityMetrics?.avgSentenceLength || 0) < libraryAverages.sentenceLength ? 'Better' : 'Worse'
        },
        vocabularyComplexity: {
            bookScore: analysis.vocabularyComplexity?.complexityScore || 0,
            libraryAverage: libraryAverages.complexityScore,
            comparison: (analysis.vocabularyComplexity?.complexityScore || 0) < libraryAverages.complexityScore ? 'Simpler' : 'More Complex'
        }
    };
}