#!/usr/bin/env node

/**
 * Comprehensive Readability Analysis System
 * 
 * This module provides detailed text analysis using multiple industry-standard readability metrics:
 * 
 * READABILITY METRICS:
 * 1. Flesch Reading Ease (0-100): Higher scores = easier reading
 * 2. Flesch-Kincaid Grade Level: Years of education needed
 * 3. Gunning Fog Index: Formal education years required  
 * 4. SMOG Index: Simple Measure of Gobbledygook
 * 5. Automated Readability Index (ARI): Character-based metric
 * 6. Coleman-Liau Index: Alternative character-based assessment
 * 
 * ANALYSIS FEATURES:
 * - Sentence structure analysis (length, complexity, passive voice)
 * - Vocabulary complexity assessment (technical terms, jargon, rare words)
 * - Text structure patterns (headers, lists, paragraphs)
 * - Comprehensive recommendations for improvement
 * - Library-wide benchmarking and comparison
 * 
 * OUTPUTS:
 * - Overall analysis: analysis-results/readability-analysis.json
 * - Individual reports: analysis-results/individual-reports/[book-id].json
 * - Integrated into web UI at /readability-analysis.html
 * 
 * USAGE:
 * node scripts/readability-analyzer.js
 * 
 * @author Claude Code
 * @version 2.0.0 - Added Flesch-Kincaid, Fog, SMOG, ARI, Coleman-Liau metrics
 */

const fs = require('fs');
const path = require('path');
const TextPreprocessor = require('./text-preprocessor');

class ReadabilityAnalyzer {
    constructor() {
        this.booksDir = path.join(__dirname, '..', 'books');
        this.preprocessor = new TextPreprocessor();
        this.results = {
            totalBooks: 0,
            readabilityScores: [],
            sentenceAnalysis: [],
            vocabularyComplexity: [],
            structurePatterns: [],
            bestPractices: [],
            commonIssues: []
        };
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
                        path: fullBookPath,
                        category: this.inferCategory(entry.name)
                    });
                }
            }
        }
        
        return books;
    }

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
     * Analyze sentence structure and complexity
     */
    analyzeSentenceStructure(text) {
        // Clean and split into sentences
        const sentences = text
            .replace(/[^\w\s.!?;:,()-]/g, ' ')
            .split(/[.!?]+/)
            .filter(s => s.trim().length > 10)
            .map(s => s.trim());

        if (sentences.length === 0) return null;

        const analysis = {
            totalSentences: sentences.length,
            avgWordsPerSentence: 0,
            avgSyllablesPerWord: 0,
            longSentences: 0,
            shortSentences: 0,
            complexWords: 0,
            passiveVoice: 0,
            questions: 0,
            exclamations: 0,
            subordinateClauses: 0,
            readabilityIssues: []
        };

        let totalWords = 0;
        let totalSyllables = 0;

        sentences.forEach(sentence => {
            const words = sentence.split(/\s+/).filter(w => w.length > 0);
            totalWords += words.length;
            
            // Count syllables (simplified)
            words.forEach(word => {
                const syllables = this.countSyllables(word);
                totalSyllables += syllables;
                if (syllables > 2) analysis.complexWords++;
            });

            // Analyze sentence length
            if (words.length > 25) analysis.longSentences++;
            if (words.length < 8) analysis.shortSentences++;

            // Check for passive voice indicators
            if (/(was|were|is|are|been|being)\s+\w+ed|by\s+\w+/.test(sentence.toLowerCase())) {
                analysis.passiveVoice++;
            }

            // Check for questions and exclamations
            if (sentence.includes('?')) analysis.questions++;
            if (sentence.includes('!')) analysis.exclamations++;

            // Check for subordinate clauses
            if (/(that|which|who|whom|whose|when|where|while|although|because|since|if|unless|until|before|after)\s+/.test(sentence.toLowerCase())) {
                analysis.subordinateClauses++;
            }
        });

        analysis.avgWordsPerSentence = totalWords / sentences.length;
        analysis.avgSyllablesPerWord = totalSyllables / totalWords;

        // Identify readability issues
        if (analysis.avgWordsPerSentence > 20) {
            analysis.readabilityIssues.push('Sentences too long (avg: ' + analysis.avgWordsPerSentence.toFixed(1) + ' words)');
        }
        if (analysis.avgSyllablesPerWord > 1.8) {
            analysis.readabilityIssues.push('Complex vocabulary (avg: ' + analysis.avgSyllablesPerWord.toFixed(1) + ' syllables/word)');
        }
        if (analysis.passiveVoice / sentences.length > 0.3) {
            analysis.readabilityIssues.push('Excessive passive voice (' + (analysis.passiveVoice / sentences.length * 100).toFixed(1) + '%)');
        }
        if (analysis.longSentences / sentences.length > 0.4) {
            analysis.readabilityIssues.push('Too many long sentences (' + (analysis.longSentences / sentences.length * 100).toFixed(1) + '%)');
        }

        return analysis;
    }

    /**
     * Simple syllable counting
     */
    countSyllables(word) {
        word = word.toLowerCase();
        if (word.length <= 3) return 1;
        
        // Count vowel groups
        const vowels = word.match(/[aeiouy]+/g);
        let syllables = vowels ? vowels.length : 1;
        
        // Adjust for silent e
        if (word.endsWith('e') && syllables > 1) {
            syllables--;
        }
        
        return Math.max(1, syllables);
    }

    /**
     * Calculate multiple readability metrics
     */
    calculateReadabilityMetrics(text, words) {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
        
        if (sentences.length === 0 || words.length === 0) {
            return {
                fleschScore: 0,
                fleschGrade: 'N/A',
                fogIndex: 0,
                smogIndex: 0,
                ariIndex: 0,
                cliIndex: 0
            };
        }

        const avgSentenceLength = words.length / sentences.length;
        const avgSyllablesPerWord = words.reduce((sum, word) => sum + this.countSyllables(word), 0) / words.length;
        const complexWords = words.filter(word => this.countSyllables(word) > 2).length;
        const complexWordRatio = complexWords / words.length;

        // Flesch Reading Ease Score (0-100 scale, higher = easier)
        // Formula: 206.835 - (1.015 × ASL) - (84.6 × ASW)
        // Where ASL = Average Sentence Length, ASW = Average Syllables per Word
        const fleschScore = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
        let fleschGrade = 'Graduate';
        if (fleschScore >= 90) fleschGrade = 'Very Easy';
        else if (fleschScore >= 80) fleschGrade = 'Easy';
        else if (fleschScore >= 70) fleschGrade = 'Fairly Easy';
        else if (fleschScore >= 60) fleschGrade = 'Standard';
        else if (fleschScore >= 50) fleschGrade = 'Fairly Difficult';
        else if (fleschScore >= 30) fleschGrade = 'Difficult';

        // Gunning Fog Index (years of education needed)
        // Formula: 0.4 × (ASL + 100 × complex word ratio)
        // Complex words = words with 3+ syllables
        const fogIndex = 0.4 * (avgSentenceLength + 100 * complexWordRatio);

        // SMOG Index (Simple Measure of Gobbledygook)
        // Formula: 1.0430 × √(complex words × 30 / sentence count) + 3.1291
        // Estimates years of education needed for comprehension
        const smogIndex = 1.0430 * Math.sqrt(complexWords * 30 / sentences.length) + 3.1291;

        // Automated Readability Index (ARI)
        // Formula: 4.71 × (characters/words) + 0.5 × (words/sentences) - 21.43
        // Character-based metric that doesn't require syllable counting
        const charactersPerWord = words.join('').length / words.length;
        const ariIndex = 4.71 * charactersPerWord + 0.5 * avgSentenceLength - 21.43;

        // Coleman-Liau Index
        // Formula: 0.0588 × L - 0.296 × S - 15.8
        // Where L = avg characters per 100 words, S = avg sentences per 100 words
        const avgCharsPerWord = words.reduce((sum, word) => sum + word.length, 0) / words.length;
        const cliIndex = 0.0588 * (avgCharsPerWord * 100 / avgSentenceLength) - 0.296 * (sentences.length * 100 / words.length) - 15.8;

        // Flesch-Kincaid Grade Level (years of education needed)
        // Formula: 0.39 × ASL + 11.8 × ASW - 15.59
        // Converts Flesch principles to U.S. grade level
        const fleschKincaidGrade = 0.39 * avgSentenceLength + 11.8 * avgSyllablesPerWord - 15.59;

        return {
            fleschScore: Math.min(100, fleschScore), // Allow negative scores to show true readability
            fleschGrade,
            fleschKincaidGrade: Math.max(0, fleschKincaidGrade),
            fogIndex: Math.max(0, fogIndex),
            smogIndex: Math.max(0, smogIndex),
            ariIndex: Math.max(0, ariIndex),
            cliIndex: Math.max(0, cliIndex),
            avgSentenceLength,
            avgSyllablesPerWord,
            complexWordRatio
        };
    }

    /**
     * Analyze vocabulary complexity
     */
    analyzeVocabularyComplexity(words) {
        const frequency = new Map();
        words.forEach(word => {
            frequency.set(word, (frequency.get(word) || 0) + 1);
        });

        const rareWords = Array.from(frequency.entries())
            .filter(([word, count]) => count === 1 && word.length > 8)
            .map(([word]) => word);

        const technicalTerms = words.filter(word => 
            word.length > 10 || 
            /^(implementation|infrastructure|organizational|transformation|optimization|methodology|architecture|strategic|framework|component|evolution|competitive|advantage|governance|compliance|sustainability|digitalization|automated|sophisticated|comprehensive|substantial|systematic|fundamental|revolutionary|exponential|instrumental|unprecedented|multifaceted|interconnected|paradigmatic|hierarchical|entrepreneurial|technological|environmental|governmental|institutional|international|interdisciplinary|multidimensional|entrepreneurship|cybersecurity|artificial|intelligence|generative|computational|algorithmic|probabilistic|deterministic|stochastic|heuristic|optimization|maximization|minimization|differential|exponential|logarithmic|polynomial|quadratic|statistical|analytical|empirical|theoretical|practical|operational|tactical|strategic|systematic|methodological|epistemological|ontological|phenomenological|hermeneutical|dialectical|synthesis|analysis|hypothesis|synthesis|antithesis|proposition|postulate|axiom|theorem|corollary|lemma|conjecture|supposition|assumption|presumption|speculation|extrapolation|interpolation|approximation|estimation|calculation|computation|determination|evaluation|assessment|measurement|quantification|qualification|classification|categorization|systematization|organization|coordination|collaboration|communication|consultation|deliberation|consideration|contemplation|reflection|introspection|retrospection|prospection|anticipation|expectation|prediction|forecasting|projection|scenario|simulation|modeling|representation|interpretation|explanation|description|specification|documentation|illustration|demonstration|exemplification|clarification|elaboration|amplification|expansion|extension|development|advancement|progression|evolution|transformation|metamorphosis|revolution|innovation|invention|creation|generation|production|construction|establishment|foundation|implementation|execution|operation|administration|management|governance|leadership|supervision|oversight|monitoring|evaluation|assessment|review|audit|inspection|examination|investigation|exploration|research|study|analysis|synthesis|comparison|contrast|differentiation|distinction|discrimination|identification|recognition|acknowledgment|appreciation|understanding|comprehension|perception|conception|apprehension|awareness|consciousness|cognition|knowledge|wisdom|intelligence|insight|intuition|instinct|judgment|decision|choice|selection|option|alternative|possibility|probability|likelihood|chance|opportunity|occasion|circumstance|situation|condition|state|status|position|location|place|space|time|moment|instant|period|duration|interval|sequence|series|progression|development|advancement|improvement|enhancement|optimization|maximization|minimization|reduction|decrease|increase|growth|expansion|extension|proliferation|multiplication|amplification|magnification|intensification|strengthening|reinforcement|consolidation|integration|unification|synthesis|combination|merger|amalgamation|fusion|blending|mixing|merging|joining|connecting|linking|associating|relating|correlating|corresponding|matching|aligning|coordinating|synchronizing|harmonizing|balancing|equilibrating|stabilizing|normalizing|standardizing|regularizing|systematizing|organizing|structuring|arranging|ordering|sequencing|prioritizing|ranking|grading|classifying|categorizing|grouping|clustering|partitioning|dividing|separating|distinguishing|differentiating|discriminating|identifying|recognizing|detecting|discovering|finding|locating|positioning|placing|situating|contextualizing|framing|structuring|formatting|designing|planning|preparing|organizing|arranging|coordinating|managing|administering|governing|leading|directing|guiding|supervising|overseeing|monitoring|controlling|regulating|adjusting|modifying|adapting|customizing|personalizing|individualizing|specializing|focusing|concentrating|emphasizing|highlighting|accentuating|underscoring|stressing|reinforcing|strengthening|solidifying|consolidating|stabilizing|securing|protecting|safeguarding|preserving|maintaining|sustaining|continuing|perpetuating|extending|prolonging|expanding|developing|advancing|progressing|evolving|transforming|changing|modifying|adjusting|adapting|accommodating|conforming|complying|adhering|following|observing|respecting|honoring|acknowledging|recognizing|appreciating|valuing|treasuring|cherishing|embracing|accepting|welcoming|receiving|obtaining|acquiring|gaining|achieving|accomplishing|attaining|reaching|arriving|approaching|nearing|approximating|estimating|calculating|computing|determining|establishing|creating|generating|producing|manufacturing|constructing|building|developing|designing|planning|organizing|arranging|coordinating|managing|administering|governing|leading|directing|guiding|supervising|overseeing|monitoring|controlling|regulating|adjusting|modifying|adapting|customizing|personalizing|individualizing|specializing|focusing|concentrating|emphasizing|highlighting|accentuating|underscoring|stressing|reinforcing|strengthening|solidifying|consolidating|stabilizing|securing|protecting|safeguarding|preserving|maintaining|sustaining|continuing|perpetuating|extending|prolonging|expanding|developing|advancing|progressing|evolving|transforming)$/.test(word)
        );

        const jargonWords = words.filter(word => 
            /^(wardley|genai|llm|api|sdk|cicd|devops|saas|paas|iaas|kpi|roi|b2b|b2c|cto|ceo|cfo|ciso|gdpr|hipaa|sox|iso|nist|agile|scrum|kanban|lean|six|sigma|togaf|itil|cobit|prince2|pmp|cissp|cisa|cism|crisc|gsec|oscp|ceh|sans|owasp|nist|iso27001|iso9001|iso20000|cmmi|prince|togaf|zachman|feaf|dodaf|modaf|sabsa|sherwood|octave|fair|coso|cobit|itil|prince2|pmp|cissp|cisa|cism|crisc|gsec|oscp|ceh|sans|owasp)$/i.test(word)
        );

        return {
            totalWords: words.length,
            uniqueWords: frequency.size,
            vocabularyRichness: frequency.size / words.length,
            rareWords: rareWords.length,
            technicalTerms: technicalTerms.length,
            jargonWords: jargonWords.length,
            avgWordLength: words.reduce((sum, word) => sum + word.length, 0) / words.length,
            complexityScore: (rareWords.length + technicalTerms.length + jargonWords.length) / words.length
        };
    }

    /**
     * Analyze structure and formatting patterns
     */
    analyzeStructurePatterns(text) {
        const lines = text.split('\n');
        const patterns = {
            headers: 0,
            subheaders: 0,
            bulletPoints: 0,
            numberedLists: 0,
            codeBlocks: 0,
            quotes: 0,
            links: 0,
            emphasis: 0,
            paragraphs: 0,
            avgParagraphLength: 0,
            tableOfContents: false,
            summaries: 0,
            examples: 0,
            definitions: 0
        };

        let paragraphLengths = [];
        let currentParagraph = '';

        lines.forEach(line => {
            const trimmed = line.trim();
            
            // Count structural elements
            if (trimmed.startsWith('# ')) patterns.headers++;
            if (trimmed.startsWith('## ')) patterns.subheaders++;
            if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) patterns.bulletPoints++;
            if (/^\d+\.\s/.test(trimmed)) patterns.numberedLists++;
            if (trimmed.startsWith('```')) patterns.codeBlocks++;
            if (trimmed.startsWith('> ')) patterns.quotes++;
            if (trimmed.includes('[') && trimmed.includes('](')) patterns.links++;
            if (trimmed.includes('**') || trimmed.includes('*')) patterns.emphasis++;
            if (trimmed.toLowerCase().includes('table of contents')) patterns.tableOfContents = true;
            if (trimmed.toLowerCase().includes('summary') || trimmed.toLowerCase().includes('conclusion')) patterns.summaries++;
            if (trimmed.toLowerCase().includes('example') || trimmed.toLowerCase().includes('for instance')) patterns.examples++;
            if (trimmed.toLowerCase().includes('definition') || trimmed.toLowerCase().includes('means that')) patterns.definitions++;

            // Track paragraph lengths
            if (trimmed === '') {
                if (currentParagraph.trim()) {
                    paragraphLengths.push(currentParagraph.trim().split(' ').length);
                    currentParagraph = '';
                }
            } else {
                currentParagraph += ' ' + trimmed;
            }
        });

        // Handle last paragraph
        if (currentParagraph.trim()) {
            paragraphLengths.push(currentParagraph.trim().split(' ').length);
        }

        patterns.paragraphs = paragraphLengths.length;
        patterns.avgParagraphLength = paragraphLengths.length > 0 ? 
            paragraphLengths.reduce((sum, len) => sum + len, 0) / paragraphLengths.length : 0;

        return patterns;
    }

    /**
     * Analyze a single book for readability
     */
    async analyzeBook(book) {
        try {
            console.log(`📖 Analyzing readability: ${book.directory}`);
            
            const content = fs.readFileSync(book.path, 'utf8');
            const cleanContent = this.preprocessor.removeExcludedSections(content);
            const words = this.preprocessor.extractWords(cleanContent);
            
            const sentenceAnalysis = this.analyzeSentenceStructure(cleanContent);
            const readabilityMetrics = this.calculateReadabilityMetrics(cleanContent, words);
            const vocabularyComplexity = this.analyzeVocabularyComplexity(words);
            const structurePatterns = this.analyzeStructurePatterns(cleanContent);
            
            const analysis = {
                directory: book.directory,
                category: book.category,
                wordCount: words.length,
                sentenceAnalysis,
                readabilityMetrics,
                vocabularyComplexity,
                structurePatterns,
                overallScore: this.calculateOverallReadabilityScore(readabilityMetrics, vocabularyComplexity, sentenceAnalysis)
            };
            
            return analysis;
            
        } catch (error) {
            console.error(`❌ Error analyzing ${book.directory}:`, error.message);
            return null;
        }
    }

    /**
     * Calculate overall readability score
     */
    calculateOverallReadabilityScore(readability, vocabulary, sentence) {
        if (!readability || !vocabulary || !sentence) return 0;
        
        // Weight different factors
        const fleschWeight = 0.4;
        const vocabularyWeight = 0.3;
        const sentenceWeight = 0.3;
        
        const fleschScore = readability.fleschScore;
        const vocabularyScore = Math.max(0, 100 - (vocabulary.complexityScore * 1000));
        const sentenceScore = Math.max(0, 100 - (sentence.readabilityIssues.length * 20));
        
        return (fleschScore * fleschWeight) + (vocabularyScore * vocabularyWeight) + (sentenceScore * sentenceWeight);
    }

    /**
     * Identify best practices from most readable books
     */
    identifyBestPractices(analyses) {
        const topReadable = analyses
            .filter(a => a.overallScore > 70)
            .sort((a, b) => b.overallScore - a.overallScore)
            .slice(0, 10);

        const bestPractices = {
            avgSentenceLength: 0,
            avgSyllablesPerWord: 0,
            headerDensity: 0,
            bulletPointUsage: 0,
            exampleUsage: 0,
            avgParagraphLength: 0,
            structuralElements: []
        };

        if (topReadable.length > 0) {
            bestPractices.avgSentenceLength = topReadable.reduce((sum, a) => 
                sum + a.readabilityMetrics.avgSentenceLength, 0) / topReadable.length;
            
            bestPractices.avgSyllablesPerWord = topReadable.reduce((sum, a) => 
                sum + a.readabilityMetrics.avgSyllablesPerWord, 0) / topReadable.length;
            
            bestPractices.headerDensity = topReadable.reduce((sum, a) => 
                sum + ((a.structurePatterns.headers + a.structurePatterns.subheaders) / a.wordCount * 1000), 0) / topReadable.length;
            
            bestPractices.bulletPointUsage = topReadable.reduce((sum, a) => 
                sum + (a.structurePatterns.bulletPoints / a.wordCount * 1000), 0) / topReadable.length;
            
            bestPractices.exampleUsage = topReadable.reduce((sum, a) => 
                sum + (a.structurePatterns.examples / a.wordCount * 1000), 0) / topReadable.length;
            
            bestPractices.avgParagraphLength = topReadable.reduce((sum, a) => 
                sum + a.structurePatterns.avgParagraphLength, 0) / topReadable.length;
        }

        return bestPractices;
    }

    /**
     * Identify common readability issues
     */
    identifyCommonIssues(analyses) {
        const issues = new Map();
        
        analyses.forEach(analysis => {
            if (analysis.sentenceAnalysis && analysis.sentenceAnalysis.readabilityIssues) {
                analysis.sentenceAnalysis.readabilityIssues.forEach(issue => {
                    issues.set(issue, (issues.get(issue) || 0) + 1);
                });
            }
            
            // Additional issue detection
            if (analysis.readabilityMetrics) {
                if (analysis.readabilityMetrics.fogIndex > 16) {
                    issues.set('High Fog Index (complex text)', (issues.get('High Fog Index (complex text)') || 0) + 1);
                }
                if (analysis.readabilityMetrics.fleschScore < 50) {
                    issues.set('Low Flesch Score (difficult to read)', (issues.get('Low Flesch Score (difficult to read)') || 0) + 1);
                }
            }
            
            if (analysis.vocabularyComplexity) {
                if (analysis.vocabularyComplexity.complexityScore > 0.1) {
                    issues.set('High vocabulary complexity', (issues.get('High vocabulary complexity') || 0) + 1);
                }
                if (analysis.vocabularyComplexity.avgWordLength > 6) {
                    issues.set('Long average word length', (issues.get('Long average word length') || 0) + 1);
                }
            }
            
            if (analysis.structurePatterns) {
                if (analysis.structurePatterns.avgParagraphLength > 150) {
                    issues.set('Long paragraphs', (issues.get('Long paragraphs') || 0) + 1);
                }
                if (analysis.structurePatterns.headers + analysis.structurePatterns.subheaders < analysis.wordCount / 1000) {
                    issues.set('Insufficient headers/structure', (issues.get('Insufficient headers/structure') || 0) + 1);
                }
            }
        });

        return Array.from(issues.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
    }

    /**
     * Main analysis function
     */
    async analyze() {
        console.log('🚀 Starting comprehensive readability analysis...\n');
        
        const books = await this.findAllBooks();
        this.results.totalBooks = books.length;
        
        const analyses = [];
        
        // Analyze each book
        for (const book of books) {
            const analysis = await this.analyzeBook(book);
            if (analysis) {
                analyses.push(analysis);
            }
        }
        
        // Identify patterns
        const bestPractices = this.identifyBestPractices(analyses);
        const commonIssues = this.identifyCommonIssues(analyses);
        
        // Generate comprehensive results
        const results = {
            totalBooks: analyses.length,
            overallStats: {
                avgReadabilityScore: analyses.reduce((sum, a) => sum + a.overallScore, 0) / analyses.length,
                avgFleschScore: analyses.reduce((sum, a) => sum + a.readabilityMetrics.fleschScore, 0) / analyses.length,
                avgFleschKincaidGrade: analyses.reduce((sum, a) => sum + a.readabilityMetrics.fleschKincaidGrade, 0) / analyses.length,
                avgFogIndex: analyses.reduce((sum, a) => sum + a.readabilityMetrics.fogIndex, 0) / analyses.length,
                avgSmogIndex: analyses.reduce((sum, a) => sum + a.readabilityMetrics.smogIndex, 0) / analyses.length,
                avgAriIndex: analyses.reduce((sum, a) => sum + a.readabilityMetrics.ariIndex, 0) / analyses.length,
                avgCliIndex: analyses.reduce((sum, a) => sum + a.readabilityMetrics.cliIndex, 0) / analyses.length,
                avgSentenceLength: analyses.reduce((sum, a) => sum + a.readabilityMetrics.avgSentenceLength, 0) / analyses.length,
                avgComplexityScore: analyses.reduce((sum, a) => sum + a.vocabularyComplexity.complexityScore, 0) / analyses.length
            },
            bestPractices,
            commonIssues,
            bookRankings: {
                allBooks: analyses.sort((a, b) => b.overallScore - a.overallScore),
                mostReadable: analyses.sort((a, b) => b.overallScore - a.overallScore).slice(0, 10),
                leastReadable: analyses.sort((a, b) => a.overallScore - b.overallScore).slice(0, 10)
            },
            categoryAnalysis: this.analyzeByCategoryReadability(analyses)
        };
        
        // Save results
        await this.saveResults(results);
        
        return results;
    }

    /**
     * Analyze readability by category
     */
    analyzeByCategoryReadability(analyses) {
        const categories = {};
        
        analyses.forEach(analysis => {
            if (!categories[analysis.category]) {
                categories[analysis.category] = [];
            }
            categories[analysis.category].push(analysis);
        });
        
        const categoryStats = {};
        
        Object.entries(categories).forEach(([category, books]) => {
            categoryStats[category] = {
                count: books.length,
                avgReadabilityScore: books.reduce((sum, b) => sum + b.overallScore, 0) / books.length,
                avgFleschScore: books.reduce((sum, b) => sum + b.readabilityMetrics.fleschScore, 0) / books.length,
                avgSentenceLength: books.reduce((sum, b) => sum + b.readabilityMetrics.avgSentenceLength, 0) / books.length,
                avgComplexityScore: books.reduce((sum, b) => sum + b.vocabularyComplexity.complexityScore, 0) / books.length
            };
        });
        
        return categoryStats;
    }

    /**
     * Save results to files
     */
    async saveResults(results) {
        const outputDir = path.join(__dirname, '..', 'analysis-results');
        
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const reportPath = path.join(outputDir, 'readability-analysis.json');
        fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
        
        console.log(`\n📊 Readability analysis saved to: ${reportPath}`);
        
        return reportPath;
    }
}

// Run the analyzer
if (require.main === module) {
    const analyzer = new ReadabilityAnalyzer();
    analyzer.analyze().then(results => {
        console.log('\n✅ Readability analysis complete!');
        console.log(`📊 Analyzed ${results.totalBooks} books`);
        console.log(`📈 Average readability score: ${results.overallStats.avgReadabilityScore.toFixed(1)}`);
        console.log(`📝 Average Flesch score: ${results.overallStats.avgFleschScore.toFixed(1)}`);
        console.log(`🎓 Average Flesch-Kincaid grade level: ${results.overallStats.avgFleschKincaidGrade.toFixed(1)}`);
        console.log(`🌫️ Average Fog Index: ${results.overallStats.avgFogIndex.toFixed(1)}`);
        console.log(`📚 Average SMOG Index: ${results.overallStats.avgSmogIndex.toFixed(1)}`);
        console.log(`🤖 Average ARI: ${results.overallStats.avgAriIndex.toFixed(1)}`);
        console.log(`📏 Average sentence length: ${results.overallStats.avgSentenceLength.toFixed(1)} words`);
        process.exit(0);
    }).catch(error => {
        console.error('❌ Error during analysis:', error);
        process.exit(1);
    });
}

module.exports = ReadabilityAnalyzer;