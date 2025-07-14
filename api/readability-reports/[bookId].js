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

function getProperTitle(bookId, directory) {
    // Special case for reference book
    if (bookId === 'wardley-mapping-the-knowledge-part-one-topographical-intelligence-in-business') {
        return 'Wardley Mapping, The Knowledge: Part One, Topographical intelligence in business';
    }
    
    // Try to get title from manifest first
    try {
        const manifestPath = path.join(process.cwd(), 'books.json');
        const manifestContent = fs.readFileSync(manifestPath, 'utf8');
        const manifest = JSON.parse(manifestContent);
        
        if (manifest && manifest.books) {
            const book = manifest.books.find(b => b.id === bookId);
            if (book && book.title) {
                return book.title;
            }
        }
    } catch (error) {
        // Fall back to directory name conversion
    }
    
    // Fallback to directory name conversion
    return createBookTitleFromDirectory(directory);
}

function createBookTitleFromDirectory(directory) {
    return directory
        .replace(/_+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b\w/g, l => l.toUpperCase());
}

function getReadabilityGrade(score, hasRecommendations = false) {
    const referenceScore = 50.99; // Reference book score
    
    // If the book has no recommendations and is close to or better than reference, it's Good
    if (!hasRecommendations && score >= referenceScore * 0.9) {
        return 'Good';
    }
    
    // If score is within 10% of reference, it's Good
    if (Math.abs(score - referenceScore) / referenceScore <= 0.1) {
        return 'Good';
    }
    
    // Otherwise use traditional grading
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Average';
    if (score >= 30) return 'Below Average';
    if (score >= 15) return 'Poor';
    return 'Very Poor';
}

function generateRecommendations(analysis) {
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

function generateIndividualReport(bookData, bookId) {
    // Generate recommendations first to check if there are any
    const recommendations = generateRecommendations(bookData);
    const improvementPriorities = identifyImprovementPriorities(bookData);
    const hasRecommendations = recommendations.length > 0 || improvementPriorities.length > 0;
    
    const reportData = {
        bookId: bookId,
        directory: bookData.directory,
        title: getProperTitle(bookId, bookData.directory),
        category: bookData.category,
        generatedAt: new Date().toISOString(),
        
        // Summary metrics
        summary: {
            overallScore: bookData.overallScore || 0,
            readabilityGrade: getReadabilityGrade(bookData.overallScore || 0, hasRecommendations),
            wordCount: bookData.wordCount || 0,
            estimatedReadingTime: Math.ceil((bookData.wordCount || 0) / 200) // 200 words per minute
        },

        // Detailed analysis
        readabilityMetrics: bookData.readabilityMetrics || {},
        sentenceAnalysis: bookData.sentenceAnalysis || {},
        vocabularyComplexity: bookData.vocabularyComplexity || {},
        structurePatterns: bookData.structurePatterns || {},

        // Specific recommendations
        recommendations: recommendations,
        
        // Improvement priorities
        improvementPriorities: improvementPriorities,
        
        // Comparison with library average
        benchmarks: generateBenchmarks(bookData, bookId)
    };

    return reportData;
}

function identifyImprovementPriorities(analysis) {
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
    
    const passiveVoiceRatio = (analysis.sentenceAnalysis?.passiveVoice / analysis.sentenceAnalysis?.totalSentences) || 0;
    const passiveScore = passiveVoiceRatio > 0.25 ? 6 : 
                        passiveVoiceRatio > 0.15 ? 3 : 0;

    const priorityItems = [
        { priority: sentenceScore >= 10 ? 'Critical' : 'High', score: sentenceScore, item: 'Shorten long sentences' },
        { priority: vocabularyScore >= 9 ? 'Critical' : 'High', score: vocabularyScore, item: 'Simplify vocabulary' },
        { priority: fleschScoreValue >= 8 ? 'High' : 'Medium', score: fleschScoreValue, item: 'Improve reading flow' },
        { priority: 'Medium', score: passiveScore, item: 'Reduce passive voice' }
    ];

    return priorityItems
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score);
}

function generateBenchmarks(analysis, bookId) {
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
            bookScore: analysis.overallScore || 0,
            referenceBenchmark: referenceBenchmark.overallScore,
            comparison: getComparison(analysis.overallScore || 0, referenceBenchmark.overallScore, true)
        },
        fleschScore: {
            bookScore: analysis.readabilityMetrics?.fleschScore || 0,
            referenceBenchmark: referenceBenchmark.fleschScore,
            comparison: getComparison(analysis.readabilityMetrics?.fleschScore || 0, referenceBenchmark.fleschScore, true)
        },
        sentenceLength: {
            bookScore: analysis.readabilityMetrics?.avgSentenceLength || 0,
            referenceBenchmark: referenceBenchmark.sentenceLength,
            comparison: getComparison(analysis.readabilityMetrics?.avgSentenceLength || 0, referenceBenchmark.sentenceLength, false)
        },
        vocabularyComplexity: {
            bookScore: analysis.vocabularyComplexity?.complexityScore || 0,
            referenceBenchmark: referenceBenchmark.complexityScore,
            comparison: getComparison(analysis.vocabularyComplexity?.complexityScore || 0, referenceBenchmark.complexityScore, false)
        }
    };
}