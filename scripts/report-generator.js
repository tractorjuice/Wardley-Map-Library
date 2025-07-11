#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class ReportGenerator {
    constructor() {
        this.resultsDir = path.join(__dirname, '..', 'analysis-results');
        this.reportData = null;
    }

    loadAnalysisData() {
        try {
            const reportPath = path.join(this.resultsDir, 'word-analysis-report.json');
            this.reportData = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
            console.log('📊 Analysis data loaded successfully');
        } catch (error) {
            console.error('❌ Error loading analysis data:', error.message);
            process.exit(1);
        }
    }

    generateHTMLReport() {
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wardley Map Library - Word Analysis Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #2c3e50;
            text-align: center;
            margin-bottom: 40px;
            font-size: 2.5em;
        }
        h2 {
            color: #34495e;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
            margin-top: 40px;
        }
        h3 {
            color: #7f8c8d;
            margin-top: 30px;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .stat-card {
            background: #ecf0f1;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            border-left: 4px solid #3498db;
        }
        .stat-number {
            font-size: 2em;
            font-weight: bold;
            color: #2c3e50;
        }
        .stat-label {
            color: #7f8c8d;
            font-size: 0.9em;
        }
        .word-list {
            columns: 3;
            column-gap: 30px;
        }
        .word-item {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
            border-bottom: 1px solid #ecf0f1;
            break-inside: avoid;
        }
        .word-item:hover {
            background-color: #f8f9fa;
        }
        .category-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        .category-table th,
        .category-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        .category-table th {
            background-color: #3498db;
            color: white;
        }
        .category-table tr:hover {
            background-color: #f5f5f5;
        }
        .bigram-list {
            columns: 2;
            column-gap: 30px;
        }
        .bigram-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #ecf0f1;
            break-inside: avoid;
        }
        .bigram-phrase {
            font-style: italic;
            color: #2c3e50;
        }
        .navigation {
            background: #34495e;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 30px;
        }
        .navigation a {
            color: white;
            text-decoration: none;
            margin-right: 20px;
            padding: 5px 10px;
            border-radius: 3px;
            transition: background-color 0.3s;
        }
        .navigation a:hover {
            background-color: #2c3e50;
        }
        .chart-container {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .progress-bar {
            width: 100%;
            height: 20px;
            background-color: #ecf0f1;
            border-radius: 10px;
            overflow: hidden;
            margin: 5px 0;
        }
        .progress-fill {
            height: 100%;
            background-color: #3498db;
            transition: width 0.3s ease;
        }
        .domain-analysis {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        .domain-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #e74c3c;
        }
        .domain-card h4 {
            margin-top: 0;
            color: #2c3e50;
        }
        .top-books {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 20px;
        }
        .book-card {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #27ae60;
        }
        .book-title {
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
        }
        .book-stats {
            display: flex;
            justify-content: space-between;
            font-size: 0.9em;
            color: #7f8c8d;
        }
        .highlight {
            background-color: #fff3cd;
            padding: 2px 4px;
            border-radius: 3px;
        }
        .timestamp {
            text-align: center;
            color: #7f8c8d;
            font-size: 0.9em;
            margin-top: 40px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📚 Wardley Map Library - Word Analysis Report</h1>
        
        <div class="navigation">
            <a href="#overview">Overview</a>
            <a href="#words">Word Analysis</a>
            <a href="#categories">Categories</a>
            <a href="#bigrams">Phrases</a>
            <a href="#domains">Domain Analysis</a>
            <a href="#books">Top Books</a>
        </div>

        <section id="overview">
            <h2>📊 Library Overview</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number">${this.reportData.summary.totalBooks}</div>
                    <div class="stat-label">Total Books</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${this.reportData.summary.totalWords.toLocaleString()}</div>
                    <div class="stat-label">Total Words</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${this.reportData.summary.uniqueWords.toLocaleString()}</div>
                    <div class="stat-label">Unique Words</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${Math.round(this.reportData.summary.averageWordsPerBook).toLocaleString()}</div>
                    <div class="stat-label">Avg Words/Book</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${(this.reportData.summary.vocabularyRichness * 100).toFixed(2)}%</div>
                    <div class="stat-label">Vocabulary Richness</div>
                </div>
            </div>
        </section>

        <section id="words">
            <h2>🔤 Word Analysis</h2>
            
            <h3>Most Common Words</h3>
            <div class="word-list">
                ${this.reportData.globalFrequency.mostCommon.slice(0, 30).map((item, index) => `
                    <div class="word-item">
                        <span>${index + 1}. ${item.word}</span>
                        <span class="highlight">${item.count.toLocaleString()}</span>
                    </div>
                `).join('')}
            </div>

            <h3>Rare Words (Used Once)</h3>
            <div class="word-list">
                ${this.reportData.globalFrequency.leastCommon.slice(0, 30).map((item, index) => `
                    <div class="word-item">
                        <span>${index + 1}. ${item.word}</span>
                        <span>${item.count}</span>
                    </div>
                `).join('')}
            </div>
        </section>

        <section id="categories">
            <h2>📂 Category Analysis</h2>
            <table class="category-table">
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Books</th>
                        <th>Total Words</th>
                        <th>Avg Words/Book</th>
                        <th>Vocabulary Richness</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.reportData.categoryAnalysis.map(cat => `
                        <tr>
                            <td><strong>${cat.category}</strong></td>
                            <td>${cat.books}</td>
                            <td>${cat.totalWords.toLocaleString()}</td>
                            <td>${Math.round(cat.averageWordsPerBook).toLocaleString()}</td>
                            <td>${(cat.vocabularyRichness * 100).toFixed(2)}%</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </section>

        <section id="bigrams">
            <h2>🔍 Most Common Phrases (Bigrams)</h2>
            <div class="bigram-list">
                ${this.reportData.ngramAnalysis.topBigrams.slice(0, 30).map((item, index) => `
                    <div class="bigram-item">
                        <span class="bigram-phrase">${index + 1}. "${item.bigram}"</span>
                        <span class="highlight">${item.count.toLocaleString()}</span>
                    </div>
                `).join('')}
            </div>
        </section>

        <section id="domains">
            <h2>🎯 Domain Analysis</h2>
            <div class="domain-analysis">
                ${Object.entries(this.reportData.domainAnalysis).map(([domain, terms]) => `
                    <div class="domain-card">
                        <h4>${domain.replace(/([A-Z])/g, ' $1').trim()}</h4>
                        ${terms.slice(0, 10).map((term, index) => `
                            <div class="word-item">
                                <span>${index + 1}. ${term.term}</span>
                                <span>${term.count}</span>
                            </div>
                        `).join('')}
                    </div>
                `).join('')}
            </div>
        </section>

        <section id="books">
            <h2>📚 Top Books</h2>
            
            <h3>Largest Books by Word Count</h3>
            <div class="top-books">
                ${this.reportData.bookRankings.byWordCount.slice(0, 10).map((book, index) => `
                    <div class="book-card">
                        <div class="book-title">${index + 1}. ${book.directory.replace(/_/g, ' ')}</div>
                        <div class="book-stats">
                            <span>Words: ${book.wordCount.toLocaleString()}</span>
                            <span>Category: ${book.category}</span>
                            <span>Unique: ${book.uniqueWords.toLocaleString()}</span>
                        </div>
                    </div>
                `).join('')}
            </div>

            <h3>Most Vocabulary-Rich Books</h3>
            <div class="top-books">
                ${this.reportData.bookRankings.byVocabularyRichness.slice(0, 10).map((book, index) => `
                    <div class="book-card">
                        <div class="book-title">${index + 1}. ${book.directory.replace(/_/g, ' ')}</div>
                        <div class="book-stats">
                            <span>Richness: ${(book.vocabularyRichness * 100).toFixed(2)}%</span>
                            <span>Category: ${book.category}</span>
                            <span>Unique: ${book.uniqueWords.toLocaleString()}</span>
                        </div>
                    </div>
                `).join('')}
            </div>

            <h3>Most Readable Books</h3>
            <div class="top-books">
                ${this.reportData.bookRankings.byReadability.slice(0, 10).map((book, index) => `
                    <div class="book-card">
                        <div class="book-title">${index + 1}. ${book.directory.replace(/_/g, ' ')}</div>
                        <div class="book-stats">
                            <span>Readability: ${book.readabilityScore.toFixed(1)}</span>
                            <span>Category: ${book.category}</span>
                            <span>Words: ${book.wordCount.toLocaleString()}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </section>

        <div class="timestamp">
            Report generated on ${new Date().toLocaleString()}
        </div>
    </div>
</body>
</html>
        `;

        return html;
    }

    generateMarkdownReport() {
        const md = `# Wardley Map Library - Word Analysis Report

## 📊 Library Overview

- **Total Books**: ${this.reportData.summary.totalBooks}
- **Total Words**: ${this.reportData.summary.totalWords.toLocaleString()}
- **Unique Words**: ${this.reportData.summary.uniqueWords.toLocaleString()}
- **Average Words per Book**: ${Math.round(this.reportData.summary.averageWordsPerBook).toLocaleString()}
- **Vocabulary Richness**: ${(this.reportData.summary.vocabularyRichness * 100).toFixed(2)}%

## 🔤 Most Common Words

${this.reportData.globalFrequency.mostCommon.slice(0, 20).map((item, index) => 
    `${index + 1}. **${item.word}**: ${item.count.toLocaleString()}`
).join('\n')}

## 📂 Category Analysis

| Category | Books | Total Words | Avg Words/Book | Vocabulary Richness |
|----------|-------|-------------|----------------|-------------------|
${this.reportData.categoryAnalysis.map(cat => 
    `| ${cat.category} | ${cat.books} | ${cat.totalWords.toLocaleString()} | ${Math.round(cat.averageWordsPerBook).toLocaleString()} | ${(cat.vocabularyRichness * 100).toFixed(2)}% |`
).join('\n')}

## 🔍 Most Common Phrases (Bigrams)

${this.reportData.ngramAnalysis.topBigrams.slice(0, 15).map((item, index) => 
    `${index + 1}. **"${item.bigram}"**: ${item.count.toLocaleString()}`
).join('\n')}

## 🎯 Domain Analysis

${Object.entries(this.reportData.domainAnalysis).map(([domain, terms]) => `
### ${domain.replace(/([A-Z])/g, ' $1').trim()}

${terms.slice(0, 10).map((term, index) => 
    `${index + 1}. **${term.term}**: ${term.count}`
).join('\n')}
`).join('\n')}

## 📚 Top Books

### Largest Books by Word Count

${this.reportData.bookRankings.byWordCount.slice(0, 10).map((book, index) => 
    `${index + 1}. **${book.directory.replace(/_/g, ' ')}** (${book.category}): ${book.wordCount.toLocaleString()} words`
).join('\n')}

### Most Vocabulary-Rich Books

${this.reportData.bookRankings.byVocabularyRichness.slice(0, 10).map((book, index) => 
    `${index + 1}. **${book.directory.replace(/_/g, ' ')}** (${book.category}): ${(book.vocabularyRichness * 100).toFixed(2)}% richness`
).join('\n')}

### Most Readable Books

${this.reportData.bookRankings.byReadability.slice(0, 10).map((book, index) => 
    `${index + 1}. **${book.directory.replace(/_/g, ' ')}** (${book.category}): ${book.readabilityScore.toFixed(1)} readability score`
).join('\n')}

---

*Report generated on ${new Date().toLocaleString()}*
`;

        return md;
    }

    async generateReports() {
        console.log('📝 Generating reports...');
        
        // Generate HTML report
        const htmlReport = this.generateHTMLReport();
        const htmlPath = path.join(this.resultsDir, 'word-analysis-report.html');
        fs.writeFileSync(htmlPath, htmlReport);
        
        // Generate Markdown report
        const markdownReport = this.generateMarkdownReport();
        const markdownPath = path.join(this.resultsDir, 'word-analysis-report.md');
        fs.writeFileSync(markdownPath, markdownReport);
        
        console.log('✅ Reports generated:');
        console.log(`   - HTML: ${htmlPath}`);
        console.log(`   - Markdown: ${markdownPath}`);
        
        return { htmlPath, markdownPath };
    }

    async run() {
        console.log('🚀 Starting report generation...');
        
        this.loadAnalysisData();
        const paths = await this.generateReports();
        
        console.log('\n🎉 Report generation complete!');
        console.log('\nYou can now:');
        console.log(`   - Open ${paths.htmlPath} in a web browser`);
        console.log(`   - View ${paths.markdownPath} in any markdown viewer`);
        console.log(`   - Share the reports with stakeholders`);
        
        return paths;
    }
}

// Run the report generator
if (require.main === module) {
    const generator = new ReportGenerator();
    generator.run().then(() => {
        console.log('\n✅ Report generation complete!');
        process.exit(0);
    }).catch(error => {
        console.error('❌ Error during report generation:', error);
        process.exit(1);
    });
}

module.exports = ReportGenerator;