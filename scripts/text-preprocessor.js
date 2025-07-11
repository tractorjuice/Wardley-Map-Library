#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class TextPreprocessor {
    constructor() {
        this.stopWords = new Set([
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'can', 'may', 'might', 'must', 'shall', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'what', 'which', 'who', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now'
        ]);
        
        this.markdownPatterns = [
            // Headers
            /^#{1,6}\s+/gm,
            // Links
            /\[([^\]]+)\]\([^)]+\)/g,
            // Images
            /!\[([^\]]*)\]\([^)]+\)/g,
            // Bold/Italic
            /\*\*([^*]+)\*\*/g,
            /\*([^*]+)\*/g,
            /_([^_]+)_/g,
            // Code blocks
            /```[\s\S]*?```/g,
            /`([^`]+)`/g,
            // HTML tags
            /<[^>]+>/g,
            // Table separators
            /\|/g,
            // Horizontal rules
            /^---+$/gm,
            // Anchor tags
            /<a id="[^"]*"><\/a>/g,
            // List markers
            /^\s*[-*+]\s+/gm,
            /^\s*\d+\.\s+/gm
        ];
        
        this.excludePatterns = [
            // Table of Contents sections
            /^## Table of Contents\n(.*?)(?=^##|\n---|\n\n# |$)/ms,
            // Appendix sections (marketing content)
            /^## Appendix.*?(?=^##|\n---|\n\n# |$)/ms,
            /^## Core Wardley Mapping Series.*?(?=^##|\n---|\n\n# |$)/ms,
            // URLs and email addresses
            /https?:\/\/[^\s]+/g,
            /[\w.-]+@[\w.-]+\.\w+/g,
            // ISBN and similar codes
            /ISBN[:\s]*[\d-]+/gi,
            /DOI[:\s]*[\d.-\/]+/gi
        ];
    }

    /**
     * Remove excluded sections from text
     */
    removeExcludedSections(text) {
        let cleanText = text;
        
        for (const pattern of this.excludePatterns) {
            cleanText = cleanText.replace(pattern, '');
        }
        
        return cleanText;
    }

    /**
     * Clean markdown formatting from text
     */
    cleanMarkdown(text) {
        let cleanText = text;
        
        // Remove markdown patterns
        for (const pattern of this.markdownPatterns) {
            if (pattern.global) {
                cleanText = cleanText.replace(pattern, '$1');
            } else {
                cleanText = cleanText.replace(pattern, '');
            }
        }
        
        // Clean up whitespace
        cleanText = cleanText.replace(/\s+/g, ' ');
        cleanText = cleanText.replace(/\n+/g, ' ');
        
        return cleanText.trim();
    }

    /**
     * Normalize text for analysis
     */
    normalizeText(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s-]/g, ' ')  // Remove punctuation except hyphens
            .replace(/\s+/g, ' ')       // Normalize whitespace
            .trim();
    }

    /**
     * Tokenize text into words
     */
    tokenize(text) {
        if (!text || typeof text !== 'string') {
            return [];
        }
        
        return text
            .split(/\s+/)
            .filter(word => word.length > 0)
            .map(word => word.replace(/^-+|-+$/g, '')) // Remove leading/trailing hyphens
            .filter(word => word.length > 1) // Remove single characters
            .filter(word => !this.stopWords.has(word.toLowerCase()));
    }

    /**
     * Extract meaningful words from text
     */
    extractWords(text) {
        // Remove excluded sections
        const withoutExcluded = this.removeExcludedSections(text);
        
        // Clean markdown
        const cleanText = this.cleanMarkdown(withoutExcluded);
        
        // Normalize
        const normalizedText = this.normalizeText(cleanText);
        
        // Tokenize
        const words = this.tokenize(normalizedText);
        
        return words;
    }

    /**
     * Process a single book file
     */
    processBook(bookPath, bookDirectory) {
        try {
            const content = fs.readFileSync(bookPath, 'utf8');
            const words = this.extractWords(content);
            
            return {
                directory: bookDirectory,
                path: bookPath,
                wordCount: words.length,
                uniqueWords: [...new Set(words)],
                allWords: words,
                processed: true
            };
        } catch (error) {
            console.error(`Error processing ${bookDirectory}:`, error.message);
            return {
                directory: bookDirectory,
                path: bookPath,
                wordCount: 0,
                uniqueWords: [],
                allWords: [],
                processed: false,
                error: error.message
            };
        }
    }

    /**
     * Get text statistics
     */
    getTextStats(text) {
        const words = this.extractWords(text);
        const uniqueWords = [...new Set(words)];
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        
        return {
            totalWords: words.length,
            uniqueWords: uniqueWords.length,
            sentences: sentences.length,
            averageWordsPerSentence: sentences.length > 0 ? words.length / sentences.length : 0,
            vocabularyRichness: uniqueWords.length / words.length
        };
    }

    /**
     * Create word frequency map
     */
    createFrequencyMap(words) {
        const frequency = new Map();
        
        for (const word of words) {
            frequency.set(word, (frequency.get(word) || 0) + 1);
        }
        
        return frequency;
    }

    /**
     * Get most common words
     */
    getMostCommonWords(words, limit = 50) {
        const frequency = this.createFrequencyMap(words);
        
        return Array.from(frequency.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([word, count]) => ({ word, count }));
    }

    /**
     * Filter technical terms (words with specific patterns)
     */
    extractTechnicalTerms(words) {
        const technicalPatterns = [
            /^wardley/i,
            /^mapping/i,
            /^strategy/i,
            /^ai$/i,
            /^genai/i,
            /^llm/i,
            /^api/i,
            /^sdk/i,
            /^framework/i,
            /^methodology/i,
            /^algorithm/i,
            /^model/i,
            /^system/i,
            /^platform/i,
            /^infrastructure/i,
            /^architecture/i,
            /^deployment/i,
            /^governance/i,
            /^compliance/i,
            /^security/i,
            /^privacy/i,
            /^data/i,
            /^analytics/i,
            /^intelligence/i,
            /^automation/i,
            /^digital/i,
            /^transformation/i,
            /^innovation/i,
            /^competitive/i,
            /^advantage/i,
            /^evolution/i,
            /^ecosystem/i,
            /^doctrine/i,
            /^climatic/i,
            /^pattern/i,
            /^component/i,
            /^commodity/i,
            /^genesis/i,
            /^custom/i,
            /^product/i,
            /^utility/i
        ];
        
        return words.filter(word => 
            technicalPatterns.some(pattern => pattern.test(word))
        );
    }

    /**
     * Extract domain-specific terminology
     */
    extractDomainTerms(words) {
        const domainCategories = {
            wardleyMapping: ['wardley', 'mapping', 'map', 'evolution', 'component', 'commodity', 'genesis', 'custom', 'product', 'utility', 'doctrine', 'climatic', 'pattern', 'ecosystem', 'landscape', 'anchor', 'position', 'movement', 'inertia', 'co-evolution'],
            artificialIntelligence: ['ai', 'genai', 'llm', 'gpt', 'claude', 'openai', 'anthropic', 'google', 'machine', 'learning', 'neural', 'network', 'deep', 'algorithm', 'model', 'training', 'inference', 'prompt', 'embedding', 'transformer', 'attention'],
            strategy: ['strategy', 'strategic', 'competitive', 'advantage', 'positioning', 'differentiation', 'innovation', 'disruption', 'transformation', 'governance', 'leadership', 'vision', 'mission', 'objectives', 'goals', 'metrics', 'kpi', 'roi', 'value', 'proposition'],
            technology: ['technology', 'digital', 'platform', 'infrastructure', 'architecture', 'system', 'framework', 'api', 'sdk', 'cloud', 'serverless', 'microservices', 'devops', 'cicd', 'automation', 'deployment', 'scalability', 'reliability', 'security', 'privacy'],
            business: ['business', 'organization', 'enterprise', 'corporate', 'startup', 'revenue', 'profit', 'cost', 'investment', 'funding', 'market', 'customer', 'user', 'stakeholder', 'partnership', 'collaboration', 'procurement', 'supply', 'chain', 'operations'],
            government: ['government', 'public', 'sector', 'policy', 'regulation', 'compliance', 'governance', 'citizen', 'service', 'digital', 'transformation', 'modernization', 'efficiency', 'transparency', 'accountability', 'democracy', 'society', 'community']
        };
        
        const result = {};
        
        for (const [category, terms] of Object.entries(domainCategories)) {
            result[category] = words.filter(word => 
                terms.some(term => word.toLowerCase().includes(term.toLowerCase()))
            );
        }
        
        return result;
    }
}

module.exports = TextPreprocessor;

// CLI usage
if (require.main === module) {
    const preprocessor = new TextPreprocessor();
    
    // Example usage
    const testText = `
    # Wardley Mapping: A Strategic Guide
    
    ## Table of Contents
    - Introduction
    - Core Concepts
    
    ## Introduction
    
    Wardley Mapping is a strategic **mapping** technique that helps organizations understand their competitive landscape. It was developed by Simon Wardley to visualize the evolution of business components.
    
    ### Key Components
    
    - **Genesis**: Novel and uncertain
    - **Custom**: Bespoke solutions
    - **Product**: Standardized offerings
    - **Commodity**: Ubiquitous utilities
    
    [Learn more](https://example.com) about Wardley Mapping.
    
    ## Appendix - Core Wardley Mapping Series
    This is promotional content that should be excluded.
    `;
    
    const words = preprocessor.extractWords(testText);
    const stats = preprocessor.getTextStats(testText);
    const commonWords = preprocessor.getMostCommonWords(words, 10);
    const technicalTerms = preprocessor.extractTechnicalTerms(words);
    const domainTerms = preprocessor.extractDomainTerms(words);
    
    console.log('=== TEXT PREPROCESSING DEMO ===\n');
    console.log('Words extracted:', words.length);
    console.log('Unique words:', stats.uniqueWords);
    console.log('Vocabulary richness:', stats.vocabularyRichness.toFixed(3));
    console.log('\nMost common words:');
    commonWords.forEach(({ word, count }) => {
        console.log(`  ${word}: ${count}`);
    });
    console.log('\nTechnical terms:', technicalTerms.length);
    console.log('Domain terms:');
    Object.entries(domainTerms).forEach(([category, terms]) => {
        if (terms.length > 0) {
            console.log(`  ${category}: ${terms.slice(0, 5).join(', ')}`);
        }
    });
}