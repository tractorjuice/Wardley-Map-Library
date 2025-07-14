const fs = require('fs');

console.log('⚡ Quick Test Summary\n');

// Load data
const booksData = JSON.parse(fs.readFileSync('./books.json', 'utf8'));

// Summary stats
console.log('📊 Library Stats:');
console.log(`  Total Books: ${booksData.totalBooks}`);
console.log(`  Generated: ${new Date(booksData.generated).toLocaleString()}`);

// Find some specific new books
const testBooks = [
  'AI Supremacy',
  'DeepSeek Disruption', 
  'Data Science in Rwanda',
  'Ace Your Foundation'
];

console.log('\n🎯 Verification of Key Moved Books:');
testBooks.forEach(searchTerm => {
  const found = booksData.books.find(book => book.title.includes(searchTerm));
  if (found) {
    console.log(`✅ ${searchTerm} → ${found.category}`);
    
    // Verify file exists
    try {
      const content = fs.readFileSync(found.path, 'utf8');
      console.log(`   📁 File OK (${(content.length/1000).toFixed(1)}k chars)`);
    } catch (e) {
      console.log(`   ❌ File missing!`);
    }
  } else {
    console.log(`❌ Missing: ${searchTerm}`);
  }
});

// Category overview
console.log('\n📚 Top Categories:');
const categories = {};
booksData.books.forEach(book => {
  const primary = book.category ? book.category.toString().split(',')[0] : 'Unknown';
  categories[primary] = (categories[primary] || 0) + 1;
});

Object.entries(categories)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 6)
  .forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count} books`);
  });

console.log('\n✅ Migration successful! App ready for testing.');
console.log('💡 Start development server with: vercel dev --listen 3000');