#!/usr/bin/env node

const TableOfContentsGenerator = require('./table-of-contents-generator');

async function testSingleBook() {
    const generator = new TableOfContentsGenerator();
    const bookDir = 'Digital_Titans__The_Epic_Battle_Between_Apple__Mic_c2b141ff';
    
    console.log('🧪 Testing ToC Generator on Single Book\n');
    console.log(`📚 Book: ${bookDir}`);
    console.log('🔍 Running dry run first...\n');
    
    // Test with dry run first
    const dryResult = await generator.processBook(bookDir, { dryRun: true, maxDepth: 3 });
    
    console.log('📊 Dry Run Results:');
    console.log(`   Success: ${dryResult.success}`);
    console.log(`   Has Existing ToC: ${dryResult.hasExistingToC}`);
    console.log(`   Headings Found: ${dryResult.headingsCount}`);
    console.log(`   Message: ${dryResult.message}`);
    
    if (dryResult.generatedToC) {
        console.log('\n📝 Generated ToC Preview (first 20 lines):');
        const lines = dryResult.generatedToC.split('\n').slice(0, 20);
        lines.forEach((line, i) => {
            console.log(`   ${String(i + 1).padStart(2)}: ${line}`);
        });
        
        if (dryResult.generatedToC.split('\n').length > 20) {
            console.log(`   ... (${dryResult.generatedToC.split('\n').length - 20} more lines)`);
        }
    }
    
    console.log('\n❓ Would you like to apply this ToC? (This would modify the actual file)');
    console.log('   To apply: node test-single-book.js --apply');
    
    // Check if user wants to apply
    if (process.argv.includes('--apply')) {
        console.log('\n✅ Applying ToC to the book...');
        const applyResult = await generator.processBook(bookDir, { dryRun: false, maxDepth: 3 });
        
        console.log('📊 Apply Results:');
        console.log(`   Success: ${applyResult.success}`);
        console.log(`   Message: ${applyResult.message}`);
        
        if (applyResult.success) {
            console.log('\n🎉 ToC successfully added to the book!');
            console.log('   You can now check the file to see the results.');
        }
    }
}

testSingleBook().catch(console.error);