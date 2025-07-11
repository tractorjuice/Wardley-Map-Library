#!/usr/bin/env node

const WordAnalyzer = require('./word-analyzer');
const ReportGenerator = require('./report-generator');

class CompleteAnalysis {
    constructor() {
        this.analyzer = new WordAnalyzer();
        this.reportGenerator = new ReportGenerator();
    }

    async runCompleteAnalysis() {
        console.log('🚀 Starting complete word analysis pipeline...\n');
        
        try {
            // Step 1: Run word analysis
            console.log('📊 Step 1: Running word analysis...');
            const analysisResults = await this.analyzer.analyze();
            
            // Step 2: Generate reports
            console.log('\n📝 Step 2: Generating reports...');
            const reportPaths = await this.reportGenerator.run();
            
            // Step 3: Display final summary
            this.displayFinalSummary(analysisResults, reportPaths);
            
            return { analysisResults, reportPaths };
            
        } catch (error) {
            console.error('❌ Error during complete analysis:', error);
            throw error;
        }
    }

    displayFinalSummary(analysisResults, reportPaths) {
        console.log('\n🎉 COMPLETE WORD ANALYSIS SUMMARY');
        console.log('='.repeat(50));
        
        console.log('\n📚 LIBRARY STATISTICS:');
        console.log(`   📖 Total Books Analyzed: ${analysisResults.summary.totalBooks}`);
        console.log(`   📝 Total Words: ${analysisResults.summary.totalWords.toLocaleString()}`);
        console.log(`   🔤 Unique Words: ${analysisResults.summary.uniqueWords.toLocaleString()}`);
        console.log(`   📊 Average Words per Book: ${Math.round(analysisResults.summary.averageWordsPerBook).toLocaleString()}`);
        console.log(`   💎 Vocabulary Richness: ${(analysisResults.summary.vocabularyRichness * 100).toFixed(2)}%`);
        
        console.log('\n🏆 TOP INSIGHTS:');
        console.log(`   🔥 Most Common Word: "${analysisResults.globalFrequency.mostCommon[0].word}" (${analysisResults.globalFrequency.mostCommon[0].count.toLocaleString()} times)`);
        console.log(`   📈 Most Common Phrase: "${analysisResults.ngramAnalysis.topBigrams[0].bigram}" (${analysisResults.ngramAnalysis.topBigrams[0].count.toLocaleString()} times)`);
        console.log(`   📂 Largest Category: ${analysisResults.categoryAnalysis[0].category} (${analysisResults.categoryAnalysis[0].books} books)`);
        console.log(`   📖 Largest Book: ${analysisResults.bookRankings.byWordCount[0].directory.replace(/_/g, ' ')} (${analysisResults.bookRankings.byWordCount[0].wordCount.toLocaleString()} words)`);
        
        console.log('\n📋 KEY DOMAIN TERMS:');
        const domainSummary = Object.entries(analysisResults.domainAnalysis).map(([domain, terms]) => 
            `   ${domain.replace(/([A-Z])/g, ' $1').trim()}: ${terms.slice(0, 3).map(t => t.term).join(', ')}`
        ).slice(0, 6);
        domainSummary.forEach(line => console.log(line));
        
        console.log('\n📊 CATEGORY BREAKDOWN:');
        analysisResults.categoryAnalysis.slice(0, 8).forEach(cat => {
            console.log(`   ${cat.category}: ${cat.books} books, ${cat.totalWords.toLocaleString()} words`);
        });
        
        console.log('\n📄 GENERATED REPORTS:');
        console.log(`   🌐 HTML Report: ${reportPaths.htmlPath}`);
        console.log(`   📝 Markdown Report: ${reportPaths.markdownPath}`);
        console.log(`   📊 JSON Data: /workspaces/GenAI-Books/analysis-results/word-analysis-report.json`);
        console.log(`   📈 CSV Data: /workspaces/GenAI-Books/analysis-results/global-word-frequency.csv`);
        
        console.log('\n✅ ANALYSIS COMPLETE!');
        console.log('   The Wardley Map Library has been comprehensively analyzed.');
        console.log('   All reports and data files are ready for use.');
        
        console.log('\n🎯 NEXT STEPS:');
        console.log('   1. Review the HTML report for interactive insights');
        console.log('   2. Share the Markdown report with stakeholders');
        console.log('   3. Use the CSV data for further analysis');
        console.log('   4. Consider implementing content recommendations based on findings');
        
        console.log('\n' + '='.repeat(50));
    }
}

// Run the complete analysis
if (require.main === module) {
    const completeAnalysis = new CompleteAnalysis();
    completeAnalysis.runCompleteAnalysis().then(() => {
        console.log('\n🎉 Complete word analysis pipeline finished successfully!');
        process.exit(0);
    }).catch(error => {
        console.error('\n❌ Complete analysis failed:', error);
        process.exit(1);
    });
}

module.exports = CompleteAnalysis;